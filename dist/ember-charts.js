/*!
* ember-charts v0.4.0
* Copyright 2012-2015 Addepar Inc.
* See LICENSE.md
*/
(function(){;
var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {}, seen = {};
  var FAILED = false;

  var uuid = 0;

  function tryFinally(tryable, finalizer) {
    try {
      return tryable();
    } finally {
      finalizer();
    }
  }

  function unsupportedModule(length) {
    throw new Error("an unsupported module was defined, expected `define(name, deps, module)` instead got: `" + length + "` arguments to define`");
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback, exports) {
    this.id       = uuid++;
    this.name     = name;
    this.deps     = !deps.length && callback.length ? defaultDeps : deps;
    this.exports  = exports || { };
    this.callback = callback;
    this.state    = undefined;
    this._require  = undefined;
  }


  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  }

  define = function(name, deps, callback) {
    if (arguments.length < 2) {
      unsupportedModule(arguments.length);
    }

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = new Module(name, deps, callback);
  };

  // we don't support all of AMD
  // define.amd = {};
  // we will support petals...
  define.petal = { };

  function Alias(path) {
    this.name = path;
  }

  define.alias = function(path) {
    return new Alias(path);
  };

  function reify(mod, name, seen) {
    var deps = mod.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    // TODO: new Module
    // TODO: seen refactor
    var module = { };

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        module.exports = reified[i] = seen;
      } else if (dep === 'require') {
        reified[i] = mod.makeRequire();
      } else if (dep === 'module') {
        mod.exports = seen;
        module = reified[i] = mod;
      } else {
        reified[i] = requireFrom(resolve(dep, name), name);
      }
    }

    return {
      deps: reified,
      module: module
    };
  }

  function requireFrom(name, origin) {
    var mod = registry[name];
    if (!mod) {
      throw new Error('Could not find module `' + name + '` imported from `' + origin + '`');
    }
    return require(name);
  }

  function missingModule(name) {
    throw new Error('Could not find module ' + name);
  }
  requirejs = require = requireModule = function(name) {
    var mod = registry[name];


    if (mod && mod.callback instanceof Alias) {
      mod = registry[mod.callback.name];
    }

    if (!mod) { missingModule(name); }

    if (mod.state !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    tryFinally(function() {
      reified = reify(mod, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    }, function() {
      if (!loaded) {
        mod.state = FAILED;
      }
    });

    var obj;
    if (module === undefined && reified.module.exports) {
      obj = reified.module.exports;
    } else {
      obj = seen[name] = module;
    }

    if (obj !== null &&
        (typeof obj === 'object' || typeof obj === 'function') &&
          obj['default'] === undefined) {
      obj['default'] = obj;
    }

    return (seen[name] = obj);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase = nameParts.slice(0, -1);

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') {
        if (parentBase.length === 0) {
          throw new Error('Cannot access parent module of root');
        }
        parentBase.pop();
      } else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

;define("ember-charts/components/bubble-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/floating-tooltip","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];

    var FloatingTooltipMixin = __dependency3__["default"];

    __exports__["default"] = ChartComponent.extend( FloatingTooltipMixin, {
      
      classNames: ['chart-bubble'],

      // ----------------------------------------------------------------------------
      // Bubble Chart Options
      // ----------------------------------------------------------------------------
      // used when setting up force and
      // moving around nodes
      // TODO(tony) camel case
      layoutGravity: -0.01,
      damper: 0.1,

      // Charge function that is called for each node.
      // Charge is proportional to the diameter of the
      // circle (which is stored in the radius attribute
      // of the circle's associated data.
      // This is done to allow for accurate collision
      // detection with nodes of different sizes.
      // Charge is negative because we want nodes to
      // repel.
      // Dividing by 8 scales down the charge to be
      // appropriate for the visualization dimensions.
      charge: Ember.computed( function() {
        return function(d) { 
          return -Math.pow(d.radius, 2.0) / 8;
        };
      }),

      // Getters for formatting human-readable labels from provided data
      formatLabel: d3.format(',.2f'),

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      showDetails: Ember.computed('isInteractive', function() {
        if (this.get('isInteractive')) {
          return Ember.K;
        }

        return function (data, i, element) {

          // Do hover detail style stuff here
          d3.select(element).classed('hovered', true);

          // Show tooltip
          var formatLabel = this.get('formatLabel');
          // Line 1
          var content = "<span class=\"tip-label\">" + data.label + "</span>";
          // Line 2
          content +="<span class=\"name\">" + this.get('tooltipValueDisplayName') + ": </span>";
          content +="<span class=\"value\">" + formatLabel(data.value) + "</span>";
          return this.showTooltip(content, d3.event);
        };

      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (this.get('isInteractive')) {
          return Ember.K;
        }
        return function (data, i, element) {
          // Undo hover style stuff
          d3.select(element).classed('hovered', false);
          // Hide Tooltip
          return this.hideTooltip();
        };
      }),

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      renderVars: ['selectedSeedColor'],

      // Sqrt scaling between data and radius
      radiusScale: Ember.computed('data', 'width', 'height', function() {
        // use the max total_amount in the data as the max in the scale's domain
        var maxAmount = d3.max( this.get('data'), function(d) { return d.value; });
        var maxRadius = d3.min( [ this.get('width'), this.get('height') ] ) / 7;
        // TODO(tony): get rid of hard coded values
        return d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([2, maxRadius]);
      }),

      nodeData: Ember.computed('radiusScale', function() {
        var data = this.get('data');
        if (Ember.isEmpty(data)) {
          return [];
        }

        var radiusScale = this.get('radiusScale');
        var _this = this;
        var nodes = data.map(function (d) {
          return {
            radius: radiusScale(d.value),
            value: d.value,
            label: d.label,
            id: d.label,
            x: Math.random() * _this.get('width') / 2,
            y: Math.random() * _this.get('height') / 2
          };
        });
        nodes.sort(function(a,b) { return b.value - a.value; });
        return nodes;
      }), 

      finishedData: Ember.computed.alias('nodeData'),

      numColorSeries: Ember.computed.alias('finishedData.length'),

      drawChart: function() {
        return this.updateVis();
      },

      updateVis: function() {
        var vis = this.get('viewport');
        var nodes = this.get('nodeData');
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');
        var fill_color = this.get('getSeriesColor');

        var circles = vis.selectAll("circle")
          .data(nodes, function(d) { return d.id; });

        circles.enter().append("circle")
          // radius will be set to 0 initially.
          // see transition below
          .attr("r", 0)
          .attr("id", function(d) { return "bubble_" + d.id; })
          .on("mouseover",  function(d,i) { return showDetails(d,i,this); })
          .on("mouseout",  function(d,i) { return hideDetails(d,i,this); });

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        circles.transition().duration(2000).attr("r", function(d) { return d.radius; });

        circles
          .attr("fill", fill_color)
          .attr("stroke-width", 2)
          .attr("stroke", function(d,i) { return d3.rgb(fill_color(d,i)).darker(); });

        circles.exit().remove();

        // Moves all circles towards the @center
        // of the visualization
        var _this = this;
        var move_towards_center = function (alpha) {
          var center = {x: _this.get('width') / 2, y: _this.get('height') / 2};
          return function (d) {
            d.x = d.x + (center.x - d.x) * (_this.get('damper') + 0.02) * alpha;
            d.y = d.y + (center.y - d.y) * (_this.get('damper') + 0.02) * alpha;
          };
        };

        // Start the forces
        var force = d3.layout.force()
          .nodes(nodes).size([_this.get('width'), _this.get('height')]);

        // Display all
        force.gravity(this.get('layoutGravity'))
          .charge(this.get('charge'))
          .friction(0.9)
          .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
          });
        force.start();

        return vis.selectAll(".years").remove();
      }

    });
  });
;define("ember-charts/components/chart-component", 
  ["ember","ember-charts/mixins/resize-handler","ember-charts/mixins/colorable","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ResizeHandlerMixin = __dependency2__["default"];
    var ColorableMixin = __dependency3__["default"];

    __exports__["default"] = Ember.Component.extend( ColorableMixin, ResizeHandlerMixin, {

      layoutName: 'components/chart-component',
      classNames: ['chart-frame', 'scroll-y'],
      isInteractive: true,

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      // Margin between viewport and svg boundary
      horizontalMargin: 30,
      verticalMargin: 30,

      marginRight: Ember.computed.alias('horizontalMargin'),
      marginLeft: Ember.computed.alias('horizontalMargin'),
      marginTop: Ember.computed.alias('verticalMargin'),
      marginBottom: Ember.computed.alias('verticalMargin'),

      // TODO: Rename outer to SVG?
      defaultOuterHeight: 500,
      defaultOuterWidth: 700,
      outerHeight: Ember.computed.alias('defaultOuterHeight'),
      outerWidth: Ember.computed.alias('defaultOuterWidth'),

      width: Ember.computed('outerWidth', 'marginLeft', 'marginRight', function() {
        return (this.get('outerWidth') - this.get('marginLeft') - this.get('marginRight'));
      }), 

      height: Ember.computed('outerHeight', 'marginBottom', 'marginTop', function() {
        return Math.max(1, this.get('outerHeight') - this.get('marginBottom') - this.get('marginTop'));
      }), 

      // Hierarchy of chart view is:
      // 1 Outside most element is div.chart-frame
      // 2 Next element is svg
      // 3 Finally, g.chart-viewport
      $viewport: Ember.computed(function() {
        return this.$('.chart-viewport')[0];
      }),

      viewport: Ember.computed(function() {
        return d3.select(this.get('$viewport'));
      }),

      // Transform the view commonly displaced by the margin
      transformViewport: Ember.computed('marginLeft', 'marginTop', function() {
        return ('translate(' + this.get('marginLeft') + ',' + this.get('marginTop') + ')');
      }), 

      // ----------------------------------------------------------------------------
      // Labels
      // ----------------------------------------------------------------------------
      // Padding between label and zeroline, or label and graphic
      labelPadding: 10,

      // Padding allocated for axes on left of graph
      labelWidth: 30,
      labelHeight: 15,

      labelWidthOffset: Ember.computed('labelWidth', 'labelPadding', function() {
        return (this.get('labelWidth') + this.get('labelPadding'));
      }), 

      labelHeightOffset: Ember.computed('labelHeight', 'labelPadding', function() {
        return (this.get('labelHeight') + this.get('labelPadding'));
      }), 

      // ----------------------------------------------------------------------------
      // Graphic/NonGraphic Layout
      // I.e., some charts will care about the dimensions of the actual chart graphic
      // space vs. other drawing space, e.g., axes, labels, legends.
      // TODO(tony): Consider this being a mixin for axes/legends and it just happens
      // to be a redundant mixin. This is a problem though because we would not want
      // to override things like graphicTop, we instead would want the changes to be
      // cumulative.
      // ----------------------------------------------------------------------------
      graphicTop: 0,
      graphicLeft: 0,
      graphicWidth: Ember.computed.alias('width'),
      graphicHeight: Ember.computed.alias('height'),

      graphicBottom: Ember.computed('graphicTop', 'graphicHeight', function() {
        return (this.get('graphicTop') + this.get('graphicHeight'));
      }),

      graphicRight: Ember.computed('graphicLeft', 'graphicWidth', function() {
        return (this.get('graphicLeft') + this.get('graphicWidth'));
      }), 

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      hasNoData: Ember.computed('finishedData', function() {
        return Ember.isEmpty(this.get('finishedData'));
      }), 

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      // Observe important variables and trigger chart redraw when they change
      concatenatedProperties: ['renderVars'],

      // Every chart will trigger a redraw when these variables change, through the
      // magic of concatenatedProperties any class that overrides the variable
      // renderVars will actually just be appending names to the list
      renderVars: ['finishedData', 'width', 'height', 'margin', 'isInteractive'],

      init: function() {
        this._super();
        var _this = this;
        _.uniq(this.get('renderVars')).forEach(function(renderVar) {
          _this.addObserver(renderVar, _this.drawOnce);
          // This is just to ensure that observers added above fire even
          // if that renderVar is not consumed elsewhere.
          _this.get(renderVar);
        });
      },

      willDestroyElement: function() {
        var _this = this;
        _.uniq(this.get('renderVars')).forEach(function(renderVar) { 
          _this.removeObserver(renderVar, _this, _this.drawOnce);
        });
        this._super();
      },

      didInsertElement: function() {
        this._super();
        this._updateDimensions();
        this.drawOnce();
      },

      drawOnce: function() {
        Ember.run.once(this, this.get('draw'));
      },

      onResizeEnd: function() {
        this._updateDimensions();
      },

      // Wrap the chart in a container div that is the same size
      _updateDimensions: function() {
        this.set('defaultOuterHeight', this.$().height());
        this.set('defaultOuterWidth', this.$().width());
      },

      clearChart: function() {
        this.$('.chart-viewport').children().remove();
      },

      // Remove previous drawing
      draw: function() {
        if ((this._state || this.state) !== "inDOM") {
          return;
        }
        if (this.get('hasNoData')) {
          return this.clearChart();
        } else {
          return this.drawChart();
        }
      }

    });
  });
;define("ember-charts/mixins/resize-handler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // TODO(azirbel): This needs to be an external dependency.
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      resizeEndDelay: 200,
      resizing: false,
      onResizeStart: Ember.K,
      onResizeEnd: Ember.K,
      onResize: Ember.K,

      endResize: Ember.computed(function() {
        return function(event) {
          if (this.isDestroyed) {
            return;
          }
          this.set('resizing', false);
          return typeof this.onResizeEnd === "function" ? this.onResizeEnd(event) : void 0;
        };
      }),

      handleWindowResize: function(event) {
        if ((typeof event.target.id !== "undefined" && event.target.id !== null) &&
            (event.target.id !== this.elementId)) {
          return;
        }
        if (!this.get('resizing')) {
          this.set('resizing', true);
          if (typeof this.onResizeStart === "function") {
            this.onResizeStart(event);
          }
        }
        if (typeof this.onResize === "function") {
          this.onResize(event);
        }
        return Ember.run.debounce(this, this.get('endResize'), event, this.get('resizeEndDelay'));
      },

      didInsertElement: function() {
        this._super();
        return this._setupDocumentHandlers();
      },

      willDestroyElement: function() {
        this._removeDocumentHandlers();
        return this._super();
      },

      _setupDocumentHandlers: function() {
        if (this._resizeHandler) {
          return;
        }
        this._resizeHandler = Ember.$.proxy(this.get('handleWindowResize'), this);
        return Ember.$(window).on("resize." + this.elementId, this._resizeHandler);
      },

      _removeDocumentHandlers: function() {
        Ember.$(window).off("resize." + this.elementId, this._resizeHandler);
        return this._resizeHandler = null;
      }
    });
  });
;define("ember-charts/mixins/colorable", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      selectedSeedColor: 'rgb(65, 65, 65)',

      // Create two color ranges. The primary range is usually used for the main
      // graphic. The secondary range is lighter and used for layered graphics
      // underneath the main graphic.

      // Tint is the amount of white to mix the seed color with. 0.8 means 80% white
      tint: 0.8,
      minimumTint: 0,
      maximumTint: 0.66,
      colorScaleType: d3.scale.linear,

      // colorScale is the end of the color scale pipeline so we rerender on that
      renderVars: ['colorScale'],

      colorRange: Ember.computed('selectedSeedColor', 'getColorRange', function() {
        var seedColor = this.get('selectedSeedColor');
        return this.get('getColorRange')(seedColor);
      }),

      getColorRange: Ember.computed('minimumTint', 'maximumTint', function() {
        var _this = this;
        return function(seedColor) {
          var interpolate, maxTintRGB, minTintRGB;
          interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
          minTintRGB = interpolate(_this.get('minimumTint'));
          maxTintRGB = interpolate(_this.get('maximumTint'));
          return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
        };
      }),

      colorScale: Ember.computed('selectedSeedColor', 'getColorScale', function() {
        var seedColor = this.get('selectedSeedColor');
        return this.get('getColorScale')(seedColor);
      }),

      getColorScale: Ember.computed('getColorRange', 'colorScaleType', function() {
        var _this = this;
        return function(seedColor) {
          var colorRange = _this.get('getColorRange')(seedColor);
          return _this.get('colorScaleType')().range(colorRange);
        };
      }),

      secondaryMinimumTint: 0.4,
      secondaryMaximumTint: 0.85,
      secondaryColorScaleType: d3.scale.linear,

      secondaryColorRange: Ember.computed('selectedSeedColor', 'secondaryMinimumTint', 'secondaryMaximumTint', function() {
        var seedColor = this.get('selectedSeedColor');
        var interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
        var minTintRGB = interpolate(this.get('secondaryMinimumTint'));
        var maxTintRGB = interpolate(this.get('secondaryMaximumTint'));

        return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
      }),

      secondaryColorScale: Ember.computed('secondaryColorScaleType', 'secondaryColorRange', function() {
        return this.get('secondaryColorScaleType')().range( this.get('secondaryColorRange') );
      }),

      // ----------------------------------------------------------------------------
      // Output
      // ----------------------------------------------------------------------------

      // TODO: Shouldn't this already be part of the d3 color scale stuff?

      // Darkest color (seed color)
      leastTintedColor: Ember.computed('colorRange.[]', function() {
        return this.get('colorRange')[0];
      }),

      // Lightest color (fully tinted color)
      mostTintedColor: Ember.computed('colorRange.[]', function() {
        return this.get('colorRange')[1];
      }),

      numColorSeries: 1,

      getSeriesColor: Ember.computed('numColorSeries', 'getColorRange', 'getColorScale', 'selectedSeedColor', function() {
        var numColorSeries = this.get('numColorSeries');
        var selectedSeedColor = this.get('selectedSeedColor');

        var _this = this;
        return function(d, i) {
          var seedColor = d.color || selectedSeedColor;
          var colorRange = _this.get('getColorRange')(seedColor);
          var colorScale = _this.get('getColorScale')(seedColor);
          if (numColorSeries === 1) {
            return colorRange[0];
          } else {
            return colorScale(i / (numColorSeries - 1));
          }
        };
      }),

      numSecondaryColorSeries: 1,

      getSecondarySeriesColor: Ember.computed('numSecondaryColorSeries', 'secondaryColorRange', 'secondaryColorScale', function() {
        var numSecondaryColorSeries = this.get('numSecondaryColorSeries');

        var _this = this;
        return function(d, i) {
          if (numSecondaryColorSeries === 1) {
            return _this.get('secondaryColorRange')[0];
          } else {
            return _this.get('secondaryColorScale')(i / (numSecondaryColorSeries - 1));
          }
        };
      })
    });
  });
;define("ember-charts/mixins/floating-tooltip", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // # ----------------------------------------------------------------------------
      // # API -- inputs
      // #
      // # elementId: the id of the object we're attaching the tooltip to
      // # ----------------------------------------------------------------------------
      elementId: null,
      tooltipWidth: 40,
      tooltipValueDisplayName: 'Value',

      showTooltip: function(content, event) {
        var $ttid = this._getTooltip();
        $ttid.html(content);
        $ttid.show();
        return this._updateTooltipPosition(event);
      },

      hideTooltip: function() {
        return this._getTooltip().hide();
      },

      // # ----------------------------------------------------------------------------
      // # Private Methods
      // # ----------------------------------------------------------------------------
      _tooltipId: Ember.computed(function() {
        return (this.get('elementId') + '_tooltip');
      }),

      _getTooltip: function() {
        return $("#" + this.get('_tooltipId'));
      },

      _updateTooltipPosition: function(event) {
        var $tooltip = this._getTooltip();
        // # Offset the tooltip away from the mouse position
        var xOffset = 10;
        var yOffset = 10;

        // # Get tooltip width/height
        var width = $tooltip.width();
        var height = $tooltip.height();

        // # Get top/left coordinates of scrolled window
        var windowScrollTop = $(window).scrollTop();
        var windowScrollLeft = $(window).scrollLeft();

        // # Get current X,Y position of cursor even if window is scrolled
        var curX = event.clientX + windowScrollLeft;
        var curY = event.clientY + windowScrollTop;

        var tooltipLeftOffset =
          ((curX - windowScrollLeft + xOffset*2 + width) > $(window).width()) ?
            // # Not enough room to put tooltip to the right of the cursor
            - (width + xOffset*2)
          :
            // # Offset the tooltip to the right
            xOffset;

        var tooltipLeft = curX + tooltipLeftOffset;

        var tooltipTopOffset =
          ((curY - windowScrollTop + yOffset*2 + height) > $(window).height()) ?
            // # Not enough room to put tooltip to the below the cursor
            - (height + yOffset*2)
          :
            // # Offset the tooltip below the cursor
            yOffset;

        var tooltipTop = curY + tooltipTopOffset;

        // # Tooltip must be a minimum offset away from the left/top position
        var minTooltipLeft = windowScrollLeft + xOffset;
        var minTooltipTop = windowScrollTop + yOffset;
        if (tooltipLeft < minTooltipLeft) {
          tooltipLeft = minTooltipLeft;
        }
        if (tooltipTop < windowScrollTop + yOffset) {
          tooltipTop = minTooltipTop;
        }

        // # Place tooltip
        return $tooltip.css('top', tooltipTop + 'px').css('left', tooltipLeft + 'px');
      },

      // # ----------------------------------------------------------------------------
      // # Internal
      // # ----------------------------------------------------------------------------

      didInsertElement: function() {
        this._super();
        $("body").append("<div class='chart-float-tooltip' id='" + this.get('_tooltipId') + "'></div>");
        return this.hideTooltip();
      },

      willDestroyElement: function() {
        this._super();
        return this._getTooltip().remove();
      }
    });
  });
;define("ember-charts/components/horizontal-bar-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/formattable","ember-charts/mixins/floating-tooltip","ember-charts/mixins/sortable-chart","ember-charts/utils/label-trimmer","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];
    var FormattableMixin = __dependency3__["default"];

    var FloatingTooltipMixin = __dependency4__["default"];
    var SortableChartMixin = __dependency5__["default"];

    var LabelTrimmer = __dependency6__["default"];

    __exports__["default"] = ChartComponent.extend(FloatingTooltipMixin, FormattableMixin, SortableChartMixin, {
      classNames: ['chart-horizontal-bar'],

      // ----------------------------------------------------------------------------
      // Horizontal Bar Chart Options
      // ----------------------------------------------------------------------------

      // Minimum height of the whole chart, including padding
      defaultOuterHeight: 500,

      // Override maximum width of labels to be a percentage of the total width
      labelWidth: Ember.computed('outerWidth', function() {
        return 0.25 * this.get('outerWidth');
      }),

      // Space between label and zeroline (overrides ChartView)
      // Also used to pad labels against the edges of the viewport
      labelPadding: 20,

      // Space between adjacent bars, as fraction of padded bar size
      barPadding: 0.2,

      // Constraints on size of each bar
      maxBarThickness: 60,
      minBarThickness: 20,

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      finishedData: Ember.computed.alias('sortedData'),

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      minOuterHeight: Ember.computed('numBars', 'minBarThickness', 'marginTop', 'marginBottom', function() {
        var minBarSpace = this.get('numBars') * this.get('minBarThickness');
        return minBarSpace + this.get('marginTop') + this.get('marginBottom');
      }),

      maxOuterHeight: Ember.computed('numBars', 'maxBarThickness', 'marginTop', 'marginBottom', function() {
        var maxBarSpace = this.get('numBars') * this.get('maxBarThickness');
        return maxBarSpace + this.get('marginTop') + this.get('marginBottom');
      }),

      // override the default outerHeight, so the graph scrolls
      outerHeight: Ember.computed('minOuterHeight', 'maxOuterHeight', 'defaultOuterHeight', function() {
        var maxMinDefault = d3.max([this.get('defaultOuterHeight'), this.get('minOuterHeight')]);
        return d3.min([ maxMinDefault, this.get('maxOuterHeight') ]);
      }),

      marginTop: Ember.computed.alias('labelPadding'),
      marginBottom: Ember.computed.alias('labelPadding'),

      horizontalMargin: Ember.computed('labelWidth', 'labelPadding', function() {
        return this.get('labelWidth') + this.get('labelPadding') * 2;
      }),

      // ----------------------------------------------------------------------------
      // Graphics Properties
      // ----------------------------------------------------------------------------

      numBars: Ember.computed.alias('finishedData.length'),

      // Range of values used to size the graph, within which bars will be drawn
      xDomain: Ember.computed('finishedData', 'xDomainPadding', function() {
        var values = this.get('finishedData').map( function(d) { return d.value; });
        var minValue = d3.min(values);
        var maxValue = d3.max(values);
        if (minValue < 0) {
          // Balance negative and positive axes if we have negative values
          var absMax = Math.max(-minValue, maxValue);
          return [ -absMax, absMax ];
        } else {
          // Only positive values domain
          return [ 0, maxValue ];
        }
      }), 

      // Scale to map value to horizontal length of bar
      xScale: Ember.computed('width', 'xDomain', function() {
        return d3.scale.linear()
          .domain(this.get('xDomain'))
          .range([ 0, this.get('width') ])
          .nice();
      }),

      // Scale to map bar index to its horizontal position
      yScale: Ember.computed('height', 'barPadding', function() {
        // Evenly split up height for bars with space between bars
        return d3.scale.ordinal()
          .domain(d3.range(this.get('numBars')))
          .rangeRoundBands([ 0, this.get('height') ], this.get('barPadding'));
      }),

      // Space in pixels allocated to each bar + padding
      barThickness: Ember.computed('yScale', function() {
        return this.get('yScale').rangeBand();
      }), 

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      showDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
        	return Ember.K;
        }
        var _this = this;
        return function(data, i, element) {
          // Do hover detail style stuff here
          d3.select(element).classed('hovered', true);

          // Show tooltip
          var formatLabel = _this.get('formatLabelFunction');
          // Line 1
          var content = "<span class=\"tip-label\">" + data.label + "</span>";
          // Line 2
          content +="<span class=\"name\">" + _this.get('tooltipValueDisplayName') + ": </span>";
          content +="<span class=\"value\">" + formatLabel(data.value) + "</span>";
          return _this.showTooltip(content, d3.event);
        };
      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
        	return Ember.K;
        }
        var _this = this;
        return function(data, i, element) {
          // Undo hover style stuff
          d3.select(element).classed('hovered', false);
          // Hide Tooltip
          return _this.hideTooltip();
        };
      }), 

      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      groupAttrs: Ember.computed('xScale', 'yScale', function() {
        var xScale = this.get('xScale');
        var yScale = this.get('yScale');
        return {
    	    transform: function(d, i) {
    	      var value = Math.min(0, d.value);
    	      return "translate(" + xScale(value) + ", "+ yScale(i) + ")";
    	    }
    	  };
      }),

      barAttrs: Ember.computed('xScale', 'mostTintedColor', 'leastTintedColor', 'barThickness', function() {
        var xScale = this.get('xScale');
        var _this = this;
        return {
          width: function(d) {
            return Math.abs(xScale(d.value) - xScale(0));
          },
          height: this.get('barThickness'),
          'stroke-width': 0,
          style: function(d) {
            if (d.color) {
              return "fill:" + d.color; 
            }
            var color = (d.value < 0) ? _this.get('mostTintedColor') : _this.get('leastTintedColor');
            return "fill:" + color;
          }
        };
      }),

      valueLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
        var xScale = this.get('xScale');
        var _this = this;
        // Anchor the label 'labelPadding' away from the zero line
        // How to anchor the text depends on the direction of the bar
        return {
          x: function(d) {
            if (d.value < 0) {
              return -_this.get('labelPadding');
            } else {
              return xScale(d.value) - xScale(0) + _this.get('labelPadding');
            }
          },
          y: this.get('barThickness') / 2,
          dy: '.35em',
          'text-anchor': function(d) {
            return ((d.value < 0) ? 'end' : 'start');
          },
          'stroke-width': 0
        };
      }),

      groupLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
        var xScale = this.get('xScale');
        
        // Anchor the label 'labelPadding' away from the zero line
        // How to anchor the text depends on the direction of the bar
        var _this = this;
        return {
          x: function(d) {
            if (d.value < 0) {
              return xScale(0) - xScale(d.value) + _this.get('labelPadding');
            } else {
              return -_this.get('labelPadding');
            }
          },
          y: this.get('barThickness') / 2,
          dy: '.35em',
          'text-anchor': function(d) {
            return ((d.value < 0) ? 'start' : 'end');
          },
          'stroke-width': 0
        };
      }),

      axisAttrs: Ember.computed('xScale', 'height', function() {
        var xScale = this.get('xScale');

        // Thickness, counts the padding allocated to each bar as well
        return {
          x1: xScale(0),
          x2: xScale(0),
          y1: 0,
          y2: this.get('height')
        };
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      groups: Ember.computed(function() {
        return this.get('viewport')
          .selectAll('.bar')
          .data( this.get('finishedData'));
      })["volatile"](),

      yAxis: Ember.computed(function() {
        var yAxis = this.get('viewport').select('.y.axis line');
        if (yAxis.empty()) {
          return this.get('viewport')
            .insert('g', ':first-child')
            .attr('class', 'y axis')
            .append('line');
        } else {
          return yAxis;
        }
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      renderVars: ['barThickness', 'yScale', 'finishedData', 'colorRange'],

      drawChart: function() {
        this.updateData();
        this.updateAxes();
        this.updateGraphic();
      },

      updateData: function() {
        var groups = this.get('groups');
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');

        var entering = groups.enter()
          .append('g').attr('class', 'bar')
          .on("mouseover", function(d,i) { return showDetails(d,i,this); })
          .on("mouseout", function(d,i) { return hideDetails(d,i,this); });
        entering.append('rect');
        entering.append('text').attr('class', 'value');
        entering.append('text').attr('class', 'group');

        return groups.exit().remove();
      },

      updateAxes: function() {
        return this.get('yAxis').attr(this.get('axisAttrs'));
      },

      updateGraphic: function() {
        var _this = this;
        var groups = this.get('groups')
          .attr( this.get('groupAttrs'));

        groups.select('rect')
          .attr( this.get('barAttrs'));

        groups.select('text.value').text(function(d) {
          return _this.get('formatLabelFunction')(d.value);
        }).attr( this.get('valueLabelAttrs'));

        var labelWidth = this.get('labelWidth');
        var labelTrimmer = LabelTrimmer.create({
          getLabelSize: function() { return labelWidth; },
          getLabelText: function(d) { return d.label; }
        });

        return groups.select('text.group').text(function(d) {
          return d.label;
        }).attr( this.get('groupLabelAttrs'))
          .call( labelTrimmer.get('trim'));
      }

    });
  });
;define("ember-charts/mixins/formattable", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // # Getters for formatting human-readable labels from provided data
      formatLabelFunction: Ember.computed('formatLabel', function() {
        return d3.format("," + this.get('formatLabel'));
      }),

      // # String that will be used to format label using d3.format function
      // # More info about d3.format: https://github.com/mbostock/d3/wiki/Formatting
      formatLabel: '.2f'
    });
  });
;define("ember-charts/mixins/sortable-chart", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // # This allows chart data to be displayed in ascending or descending order as specified by
    // # the data points property sortKey. The order is determined by sortAscending.
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({
      sortKey: 'value',
      sortAscending: true,

      sortedData: Ember.computed('data.[]', 'sortKey', 'sortAscending', function() {
        var data = this.get('data');
        var key = this.get('sortKey');
        var sortAscending = this.get('sortAscending');

        if (Ember.isEmpty(data)) {
          return [];
        } else if (key != null) {
          if (sortAscending) {
            return _.sortBy(data, key);
          } else {
            return _.sortBy(data, key).reverse();
          }
        } else {
          return data;
        }
      })
    });
  });
;define("ember-charts/utils/label-trimmer", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Object.extend({

        getLabelSize: function() {
          return 100;
        },

        getLabelText: function(d) {
          return d.label;
        },

        trim: Ember.computed('getLabelSize', 'getLabelText', function() {

          var getLabelSize = this.get('getLabelSize');
          var getLabelText = this.get('getLabelText');

          return function(selection) {
            
            return selection.text(function(d) {

              var bbW = this.getBBox().width;
              var label = getLabelText(d);
              if (!label) {
                return '';
              }
              var charWidth = bbW / label.length;
              var textLabelWidth = getLabelSize() - 4 * charWidth;
              var numChars = Math.floor(textLabelWidth / charWidth);

              if (numChars - 3 <= 0) {
                return '...';
              } else if (bbW > textLabelWidth) {
                return label.slice(0, numChars - 3) + '...';
              } else {
                return label;
              }
            });
          };
        })
    });
  });
;define("ember-charts/components/pie-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/formattable","ember-charts/mixins/floating-tooltip","ember-charts/mixins/sortable-chart","ember-charts/mixins/pie-legend","ember-charts/utils/label-trimmer","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];
    var FormattableMixin = __dependency3__["default"];
    var FloatingTooltipMixin = __dependency4__["default"];
    var SortableChartMixin = __dependency5__["default"];
    var PieLegendMixin = __dependency6__["default"];

    var LabelTrimmer = __dependency7__["default"];

    __exports__["default"] = ChartComponent.extend(FloatingTooltipMixin,
      FormattableMixin, SortableChartMixin, PieLegendMixin, {

      classNames: ['chart-pie'],
      // ----------------------------------------------------------------------------
      // Pie Chart Options
      // ----------------------------------------------------------------------------

      // The smallest slices will be combined into an "Other" slice until no slice is
      // smaller than minSlicePercent. "Other" is also guaranteed to be larger than
      // minSlicePercent.
      minSlicePercent: 5,

      // The maximum number of slices. If the number of slices is greater
      // than this then the smallest slices will be combined into an "other"
      // slice until there are at most maxNumberOfSlices.
      maxNumberOfSlices: 8,

      // Override maximum width of labels to be a percentage of the total width
      labelWidth: Ember.computed('outerWidth', function() {
        return 0.25 * this.get('outerWidth');
      }),

      // Essentially we don't want a maximum pieRadius
      maxRadius: 2000,

      // top and bottom margin will never be smaller than this
      // you can use this to ensure that your labels don't get pushed off
      // the top / bottom when your labels are large or the chart is very small
      minimumTopBottomMargin: 0,

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      // Data with invalid/negative values removed
      filteredData: Ember.computed('data.[]', function() {
        var data;
        data = this.get('data');
        if (Ember.isEmpty(data)) {
          return [];
        }
        return data.filter(function(child) {
          return (child.value >= 0);
        });
      }),

      // Negative values that have been discarded from the data
      rejectedData: Ember.computed('data.[]', function() {
        var data;
        data = this.get('data');
        if (Ember.isEmpty(data)) {
          return [];
        }
        return data.filter(function(child) {
          return child.value < 0;
        });
      }),

      // Valid data points that have been sorted by selectedSortType
      sortedData: Ember.computed('filteredData', 'sortKey', function() {
        var data = this.get('filteredData');
        var total = data.reduce(function(p, child) {
          return child.value + p;
        }, 0);
        if (total === 0) {
          return [];
        }

        data = data.map(function(d) {
          return {
            color: d.color,
            label: d.label,
            value: d.value,
            percent: d3.round(100.0 * d.value / total)
          };
        });

        return _.sortBy(data, this.get('sortKey'));
      }),

      // This takes the sorted slices that have percents calculated and returns
      // sorted slices that obey the "other" slice aggregation rules
      sortedDataWithOther: Ember.computed('sortedData', 'maxNumberOfSlices', 'minSlicePercent', function() {
        var lastItem, overflowSlices, slicesLeft;

        var data = _.cloneDeep(this.get('sortedData')).reverse();
        var maxNumberOfSlices = this.get('maxNumberOfSlices');
        var minSlicePercent = this.get('minSlicePercent');
        var otherItems = [];
        var otherSlice = {
          label: 'Other',
          percent: 0,
          _otherItems: otherItems
        };

        // First make an other slice out of any slices below percent threshold
        // Find the first slice below
        var lowPercentIndex = _.indexOf(data, _.find(data, function(d) {
          return d.percent < minSlicePercent;
        }));

        // Guard against not finding any slices below the threshold
        if (lowPercentIndex < 0) {
          lowPercentIndex = data.length;
        } else {
        	// Add low percent slices to other slice
          _.takeRight(data, data.length - lowPercentIndex).forEach(function(d) {
            otherItems.push(d);
            return otherSlice.percent += d.percent;
          });

          // Ensure Other slice is larger than minSlicePercent
          if (otherSlice.percent < minSlicePercent) {
            lastItem = data[lowPercentIndex - 1];
            if (lastItem.percent < minSlicePercent) {
              lowPercentIndex -= 1;
              otherItems.push(lastItem);
              otherSlice.percent += lastItem.percent;
            }
          }
        }

        // Reduce max number of slices that we can have if we now have an other slice
        if (otherSlice.percent > 0) {
          maxNumberOfSlices -= 1;
        }

        // Next, continue putting slices in other slice if there are too many
        // take instead of first see https://lodash.com/docs#take
        // drop instead of rest 
        slicesLeft = _.take(data, lowPercentIndex);

        overflowSlices = _.drop(slicesLeft, maxNumberOfSlices);

        if (overflowSlices.length > 0) {
          overflowSlices.forEach(function(d) {
            otherItems.push(d);
            return otherSlice.percent += d.percent;
          });
          slicesLeft = _.take(slicesLeft, maxNumberOfSlices);
        }

        // only push other slice if there is more than one other item
        if (otherItems.length === 1) {
          slicesLeft.push(otherItems[0]);
        } else if (otherSlice.percent > 0) {
          slicesLeft.push(otherSlice);
        }

        // make slices appear in descending order
        return slicesLeft.reverse();
      }),

      otherData: Ember.computed('sortedDataWithOther.[]', 'sortFunction', function() {
        var _ref;
        var otherSlice = _.find(this.get('sortedDataWithOther'), function(d) {
          return d._otherItems;
        });
        var otherItems = (_ref = otherSlice != null ? otherSlice._otherItems : void 0) != null ? _ref : [];
        return _.sortBy(otherItems, this.get('sortFunction')).reverse();
      }),

      otherDataValue: Ember.computed('otherData.[]', function() {
        var otherItems, value;
        value = 0;
        otherItems = this.get('otherData');
        if (otherItems != null) {
          _.each(otherItems, function(item) {
            return value += item.value;
          });
        }
        return value;
      }),

      finishedData: Ember.computed.alias('sortedDataWithOther'),

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      // TODO(tony): This should probably be merged with the API for controlling
      // a legend in general, very similar to that code

      // For the pie chart, horizontalMargin and verticalMargin are used to center
      // the graphic in the middle of the viewport
      horizontalMargin: Ember.computed('labelPadding', 'labelWidth', function() {
        return this.get('labelPadding') + this.get('labelWidth');
      }),

      // Bottom margin is equal to the total amount of space the legend needs,
      // or 10% of the viewport if there is no legend
      _marginBottom: Ember.computed('legendHeight', 'hasLegend', 'marginTop', function() {
        return this.get('hasLegend') ? this.get('legendHeight') : this.get('marginTop');
      }),

      marginBottom: Ember.computed('_marginBottom', 'minimumTopBottomMargin', function() {
        return Math.max(this.get('_marginBottom'), this.get('minimumTopBottomMargin'));
      }),

      _marginTop: Ember.computed('outerHeight', function() {
        return Math.max(1, this.get('outerHeight') * 0.1);
      }),

      marginTop: Ember.computed('_marginTop', 'minimumTopBottomMargin', function() {
        return Math.max(this.get('_marginTop'), this.get('minimumTopBottomMargin'));
      }),

      // ----------------------------------------------------------------------------
      // Graphics Properties
      // ----------------------------------------------------------------------------

      numSlices: Ember.computed.alias('finishedData.length'),

      // Offset slices so that the largest slice finishes at 12 o'clock
      startOffset: Ember.computed('finishedData', function() {
        var data = this.get('finishedData');
        var sum = data.reduce(function(p, d) {
          return d.percent + p;
        }, 0);
        return _.last(data).percent / sum * 2 * Math.PI;
      }),

      // Radius of the pie graphic, resized to fit the viewport.
      pieRadius: Ember.computed('maxRadius', 'width', 'height', function() {
        return d3.min([this.get('maxRadius'), this.get('width') / 2, this.get('height') / 2]);
      }),


      // Radius at which labels will be positioned
      labelRadius: Ember.computed('pieRadius', 'labelPadding', function() {
        return this.get('pieRadius') + this.get('labelPadding');
      }),

      // ----------------------------------------------------------------------------
      // Color Configuration
      // ----------------------------------------------------------------------------

      getSliceColor: Ember.computed('numSlices', 'colorScale', function() {
        var _this = this;
        return function(d, i) {
          var index, numSlices, _ref;
          if ((_ref = d.data) != null ? _ref.color : void 0) {
            return d.data.color;
          }
          numSlices = _this.get('numSlices');
          index = numSlices - i - 1;
          if (numSlices !== 1) {
            index = index / (numSlices - 1);
          }
          return _this.get('colorScale')(index);
        };
      }),

      // ----------------------------------------------------------------------------
      // Legend Configuration
      // ----------------------------------------------------------------------------

      legendItems: Ember.computed('otherData', 'rejectedData', function() {
        return this.get('otherData').concat(this.get('rejectedData'));
      }),

      hasLegend: Ember.computed('legendItems.length', 'showLegend', function() {
        return this.get('legendItems.length') > 0 && this.get('showLegend');
      }),

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      showDetails: Ember.computed('isInteractive', function() {
        var _this = this;
        if (!this.get('isInteractive')) {
          return Ember.K;
        }
        return function(d, i, element) {
          var content, data, formatLabelFunction, value;
          d3.select(element).classed('hovered', true);
          data = d.data;
          if (data._otherItems) {
            value = _this.get('otherDataValue');
          } else {
            value = data.value;
          }
          formatLabelFunction = _this.get('formatLabelFunction');
          content = "<span class=\"tip-label\">" + data.label + "</span>";
          content += "<span class=\"name\">" + (_this.get('tooltipValueDisplayName')) + ": </span>";
          content += "<span class=\"value\">" + (formatLabelFunction(value)) + "</span>";
          return _this.showTooltip(content, d3.event);
        };
      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(d, i, element) {
          d3.select(element).classed('hovered', false);
          var data = d.data;
          if (data._otherItems) {
            return _this.get('viewport').select('.legend').classed('hovered', false);
          } else {
            return _this.hideTooltip();
          }
        };
      }),

      // ----------------------------------------------------------------------------
      // Styles/Layout Functions
      // ----------------------------------------------------------------------------

      // SVG transform to center pie in the viewport
      transformViewport: Ember.computed('marginLeft', 'marginTop', 'width', 'height', function() {
        var cx = this.get('marginLeft') + this.get('width') / 2;
        var cy = this.get('marginTop') + this.get('height') / 2;
        return "translate(" + cx + "," + cy + ")";
      }),

      // Arc drawing function for pie with specified pieRadius
      arc: Ember.computed('pieRadius', function() {
        return d3.svg.arc().outerRadius(this.get('pieRadius')).innerRadius(0);
      }),

      // Pie layout function starting with the largest slice at zero degrees or
      // 12 oclock. Since the data is already sorted, this goes largest to smallest
      // counter clockwise
      pie: Ember.computed('startOffset', function() {
        return d3.layout.pie().startAngle(this.get('startOffset')).endAngle(this.get('startOffset') + Math.PI * 2).sort(null).value(function(d) {
          return d.percent;
        });
      }),

      groupAttrs: Ember.computed(function() {
        return {
          'class': function(d) {
            return ((d.data._otherItems) ? 'arc other-slice' : 'arc');
          }
        };
      }),

      sliceAttrs: Ember.computed('arc', 'getSliceColor', function() {
        return {
          d: this.get('arc'),
          fill: this.get('getSliceColor'),
          stroke: this.get('getSliceColor')
        };
      }),

      labelAttrs: Ember.computed('arc', 'labelRadius', 'numSlices', 'mostTintedColor', function() {
        var mostTintedColor;
        var arc = this.get('arc');
        var labelRadius = this.get('labelRadius');
        // these are the label regions that are already filled
        var usedLabelPositions = {
          left: [],
          right: []
        };
        // assumes height of all the labels are the same
        var labelOverlap = function(side, ypos, height) {
          var positions = usedLabelPositions[side];
          _.each(positions, function(pos) {
            if (Math.abs(ypos - pos) < height) {
              return true;
            }
          });
          return false;
        };
        if (this.get('numSlices') > 1) {
          return {
            dy: '.35em',
            // Clear any special label styling that may have been set when only
            // displaying one data point on the chart
            style: null,
            'stroke-width': 0,
              // Anchor the text depending on whether the label is on the left or
              // right side of the pie, note that because of the angle offset we do
              // for the first pie slice we need to pay attention to the angle being
              // greater than 2*Math.PI
            'text-anchor': function(d) {
              var angle = (d.endAngle - d.startAngle) * 0.5 + d.startAngle;
              return ((Math.PI < angle && angle < 2 * Math.PI)) ? 'end' : 'start';
            },

            // Position labels just outside of arc center outside of pie, making sure
            // not to create any two labels too close to each other. Since labels are
            // placed sequentially, we check the height where the last label was
            // placed,and if the new label overlaps the last, move the new label one
            // label's height away
            transform: function(d) {
              var x = arc.centroid(d)[0];
              var y = arc.centroid(d)[1];

              var f = function(d) {
                return d / Math.sqrt(x * x + y * y) * labelRadius;
              };
              var labelXPos = f(x);
              var labelYPos = f(y);
              var labelHeight = this.getBBox().height;
              var side = labelXPos > 0 ? 'right' : 'left';
              if (labelOverlap(side, labelYPos, labelHeight)) {
                if (side === 'right') {
                  labelYPos = _.max(usedLabelPositions[side]) + labelHeight;
                } else {
                  labelYPos = _.min(usedLabelPositions[side]) - labelHeight;
                }
              }
              usedLabelPositions[side].push(labelYPos);
              return "translate(" + labelXPos + "," + labelYPos + ")";
            }
          };
        } else {
          // When there is only one label, position it in the middle of the chart.
          // This resolves a bug where rendering a chart with a single label multiple
          // times may cause the label to jitter, since lastXPos and lastYPos retain
          // their values from the last layout of the chart.
          mostTintedColor = this.get('mostTintedColor');
          return {
            dy: '.71em',
            'stroke-width': 0,
            'text-anchor': 'middle',
            transform: null,
            style: "fill:" + mostTintedColor + ";"
          };
        }
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      groups: Ember.computed(function() {
        var data = this.get('pie')(this.get('finishedData'));
        return this.get('viewport').selectAll('.arc').data(data);
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      renderVars: ['pieRadius', 'labelWidth', 'finishedData'],

      drawChart: function() {
        this.updateData();
        this.updateGraphic();
        if (this.get('hasLegend')) {
          return this.drawLegend();
        } else {
          return this.clearLegend();
        }
      },


      updateData: function() {
        var entering, groups, hideDetails, showDetails;
        groups = this.get('groups');
        showDetails = this.get('showDetails');
        hideDetails = this.get('hideDetails');
        entering = groups.enter().append('g').attr({
          "class": 'arc'
        }).on("mouseover", function(d, i) {
          return showDetails(d, i, this);
        }).on("mouseout", function(d, i) {
          return hideDetails(d, i, this);
        });
        entering.append('path').attr('class', 'slice');
        entering.append('text').attr('class', 'data');
        return groups.exit().remove();
      },

      updateGraphic: function() {
        var groups = this.get('groups').attr(this.get('groupAttrs'));
        groups.select('path').attr(this.get('sliceAttrs'));
        
        var labelWidth = this.get('labelWidth');
        var labelTrimmer = LabelTrimmer.create({
          getLabelSize: function() {
            return labelWidth;
          },
          getLabelText: function(d) {
            return d.data.label;
          }
        });

        return groups.select('text.data').text(function(d) {
          return d.data.label;
        }).attr(this.get('labelAttrs'))
          .call(labelTrimmer.get('trim'))
          .text(function(d) {
            return "" + this.textContent + ", " + d.data.percent + "%";
        });
      }

    });
  });
;define("ember-charts/mixins/pie-legend", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // ----------------------------------------------------------------------------
      // Legend settings
      // ----------------------------------------------------------------------------

      // Padding at top and bottom of legend. Legend is positioned adjacent to the
      // bottom of the viewport, with legendVerticalPadding pixels separating top of
      // legend and chart graphic
      // TODO(tony): This should take into account the label heights of the pie to
      // guarrantee no intersection with them
      legendVerticalPadding: 30,

      // Padding on left and right of legend text is a percentage of total width
      legendHorizontalPadding: Ember.computed('outerWidth', function() {
        return 0.2 * this.get('outerWidth');
      }),

      // Maximum height of the actual text in the legend
      maxLabelHeight: Ember.computed('outerHeight', function() {
        return 0.05 * this.get('outerHeight');
      }),

      // Toggle for whether or not to show the legend
      // if you want to override default legend behavior, override showLegend
      showLegend: true,

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      legendWidth: Ember.computed('outerWidth', 'legendHorizontalPadding', function() {
        return this.get('outerWidth') - this.get('legendHorizontalPadding');
      }),

      // Height of max possible text height + padding. This is not the height of the
      // actual legend displayed just the total amount of room the legend might need
      legendHeight: Ember.computed('maxLabelHeight', 'legendVerticalPadding', function() {
        return this.get('maxLabelHeight') + this.get('legendVerticalPadding') * 2;
      }),

      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      // Center the legend at the bottom of the chart drawing area. Since the legend
      // is inside the chart viewport, which has already been centered only consider
      // the height of the chart.

      legendAttrs: Ember.computed('outerHeight', 'marginTop', 'marginBottom', function() {
        var dx = 0;
        // This will leave a bit of padding due to the fact that marginBottom is
        // larger than marginTop which centers the pie above the middle of the chart
        // Note(edward): The marginBottom is not larger than marginTop when there may
        // be labels at the top.
        // In the default case where marginTop is 0.3 * marginBottom, the below
        // evaluates to 0.
        var offsetToLegend = 0.15 * (this.get('marginBottom')) - (this.get('marginTop')) / 2;
        var dy = this.get('outerHeight') / 2 + offsetToLegend;
        
        return {
          transform: "translate(" + dx + ", " + dy + ")"
        };
      }),

      legendLabelAttrs: Ember.computed(function() {
        return {
          style: "text-anchor:middle;",
          y: '-.35em'
        };
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      legend: Ember.computed(function() {
        var legend = this.get('viewport').select('.legend');
        if (legend.empty()) {
          return this.get('viewport').append('g').attr('class', 'legend');
        } else {
          return legend;
        }
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      clearLegend: function() {
        return this.get('viewport').select('.legend .labels').remove();
      },

      drawLegend: function() {
        var currentText, nextLabel, rowNode;
        if (!this.get('showLegend')) {
          return;
        }
        this.clearLegend();
        var legend = this.get('legend').attr(this.get('legendAttrs'));

        // Bind hover state to the legend
        var otherSlice = this.get('viewport').select('.other-slice');
        if (this.get('isInteractive') && !otherSlice.empty()) {
          legend.on('mouseover', function() {
            otherSlice.classed('hovered', true);
            return legend.classed('hovered', true);
          }).on('mouseout', function() {
            otherSlice.classed('hovered', false);
            return legend.classed('hovered', false);
          });
        }

        // Create text elements within .labels group for each row of labels
        var labels = legend.append('g').attr('class', 'labels');
        var labelStrings = this.get('legendItems').map(function(d) {
          if (d.percent != null) {
            return "" + d.label + " (" + d.percent + "%)";
          } else {
            return d.label;
          }
        });
        var row = labels.append('text')
                    .text("Other: " + labelStrings[0])
                    .attr(this.get('legendLabelAttrs'));
        
        // Try adding each label. If that makes the current line too long,
        // remove it and insert the label on the next line in its own <text>
        // element, incrementing labelTop. Stop adding rows if that would
        // cause labelTop to exceed the space allocated for the legend.
        var labelTop = 0;

        var arr = labelStrings.slice(1).length;
        for (var i = 0, len = arr.length; i < len; i++) {
          nextLabel = arr[i];
          currentText = row.text();
          row.text("" + currentText + ", " + nextLabel);
          rowNode = row.node();
          if (rowNode.getBBox().width > this.get('legendWidth')) {
            if (labelTop + rowNode.getBBox().height > this.get('maxLabelHeight')) {
              row.text("" + currentText + ", ...");
              break;
            } else {
              row.text("" + currentText + ",");
              labelTop += rowNode.getBBox().height;
              row = labels.append('text').text(nextLabel).attr(this.get('legendLabelAttrs')).attr('dy', labelTop);
            }
          }
        }
        // Align the lowermost row of the block of labels against the bottom margin
        return labels.attr('transform', "translate(0, " + (-labelTop) + ")");
      }
    });
  });
;define("ember-charts/components/scatter-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/legend","ember-charts/mixins/floating-tooltip","ember-charts/mixins/axes","ember-charts/mixins/no-margin-chart","ember-charts/utils/group-by","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];

    var LegendMixin = __dependency3__["default"];
    var FloatingTooltipMixin = __dependency4__["default"];
    var AxesMixin = __dependency5__["default"];
    var NoMarginChartMixin = __dependency6__["default"];

    var groupBy = __dependency7__.groupBy;

    __exports__["default"] = ChartComponent.extend(LegendMixin, FloatingTooltipMixin,
      AxesMixin, NoMarginChartMixin, {

      classNames: ['chart-scatter'],

      // ----------------------------------------------------------------------------
      // Scatter Plot Options
      // ----------------------------------------------------------------------------

      // Getters for formatting human-readable labels from provided data
      formatXValue: d3.format(',.2f'),
      formatYValue: d3.format(',.2f'),

      // Size of each icon on the scatter plot
      dotRadius: 7,

      dotShapeArea: Ember.computed('dotRadius', function() {
        return Math.pow(this.get('dotRadius'), 2);
      }),

      // Amount to pad the extent of input data so that all displayed points fit
      // neatly within the viewport, as a proportion of the x- and y-range
      graphPadding: 0.05,

      // Increase the amount of space between ticks for scatter, basically if we are
      // too aggressive with the tick spacing 1) labels are more likely to be
      // squished together and 2) it is hard for the "nice"ing of the ticks, i.e.,
      // trying to end on actual tick intervals. It would be good to force ticks to
      // end where we want them, but reading the d3.js literature it was not clear
      // how to easily do that.
      tickSpacing: 80,

      // NoMarginChartMixin makes right margin 0 but we need that room because the
      // last label of the axis is commonly too large
      marginRight: Ember.computed.alias('horizontalMargin'),

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      isShowingTotal: false,
      totalPointData: null,

      // Data with invalid/negative values removed
      filteredData: Ember.computed('data.@each', function() {
        var data;
        data = this.get('data');
        if (Ember.isEmpty(data)) {
          return [];
        }
        return data.filter(function(d) {
          return (d.xValue != null) && (d.yValue != null) && isFinite(d.xValue) && isFinite(d.yValue);
        });
      }),

      // Aggregate the raw data by group, into separate lists of data points
      groupedData: Ember.computed('filteredData.@each', function() {
        // var k, v, _results;
        var _this = this;
        var data = this.get('filteredData');
        if (Ember.isEmpty(data)) {
          return [];
        }
        
        var groupedData = groupBy(data, function(d) {
          return d.group || _this.get('ungroupedSeriesName');
        });

        this.set('groupNames', _.keys( groupedData));
        return _.values(groupedData);
      }),

      groupNames: [],

      numGroups: Ember.computed.alias('groupedData.length'),

      isGrouped: Ember.computed('numGroups', function() {
        return this.get('numGroups') > 1;
      }),

      finishedData: Ember.computed.alias('groupedData'),

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------
      // TODO(tony): Consider making logic for whether we are showing the title or
      // not and then axis mixin will calculate axis offset that will be added
      axisTitleHeightOffset: Ember.computed('axisTitleHeight', 'labelPadding', function() {
        return this.get('axisTitleHeight') + this.get('labelPadding');
      }),

      // TODO(tony): Just use axisBottomOffset here
      legendChartPadding: Ember.computed('labelHeightOffset', 'axisTitleHeightOffset', function() {
        return this.get('axisTitleHeightOffset') + this.get('labelHeightOffset');
      }),

      // Chart Graphic Dimensions
      graphicTop: Ember.computed.alias('axisTitleHeight'),
      graphicLeft: Ember.computed.alias('labelWidthOffset'),

      graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
        return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
      }),
      
      graphicWidth: Ember.computed('width', 'labelWidthOffset', function() {
        return this.get('width') - this.get('labelWidthOffset');
      }),

      // Height of the text for the axis titles
      axisTitleHeight: 18,

      // ----------------------------------------------------------------------------
      // Ticks and Scales
      // ----------------------------------------------------------------------------

      xDomain: Ember.computed('filteredData.@each', 'isShowingTotal', 'totalPointData', function() {
        var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
        var _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
          return d.xValue;
        });
        var xMin = _ref[0]; 
        var xMax = _ref[1];
        if ((xMin === xMax && xMax === 0)) {
          return [-1, 1];
        } else if (xMin === xMax) {
          return [xMin * (1 - this.get('graphPadding')), xMin * (1 + this.get('graphPadding'))];
        } else {
          return [xMin, xMax];
        }
      }),

      yDomain: Ember.computed('filteredData.@each', 'isShowingTotal', 'totalPointData', 'graphPadding', function() {
        var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
        var _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
          return d.yValue;
        });
        var yMin = _ref[0];
        var yMax = _ref[1];

        if ((yMin === yMax && yMax === 0)) {
          return [-1, 1];
        } else if (yMin === yMax) {
          return [yMin * (1 - this.get('graphPadding')), yMin * (1 + this.get('graphPadding'))];
        } else {
          return [yMin, yMax];
        }
      }),

      // The X axis scale spans the range of Y values plus any graphPadding
      xScale: Ember.computed('xDomain', 'graphPadding', 'graphicLeft', 'graphicWidth', 'numXTicks', function() {
        var xDomain = this.get('xDomain');
        var graphicLeft = this.get('graphicLeft');
        var graphicWidth = this.get('graphicWidth');
        var padding = (xDomain[1] - xDomain[0]) * this.get('graphPadding');
        
        return d3.scale.linear()
                .domain([xDomain[0] - padding, xDomain[1] + padding]).range([graphicLeft, graphicLeft + graphicWidth])
                .nice(this.get('numXTicks'));
      }),

      // The Y axis scale spans the range of Y values plus any graphPadding
      yScale: Ember.computed('yDomain', 'graphPadding', 'graphicTop', 'graphicHeight', 'numYTicks', function() {
        var yDomain = this.get('yDomain');
        var graphicTop = this.get('graphicTop');
        var graphicHeight = this.get('graphicHeight');
        var padding = (yDomain[1] - yDomain[0]) * this.get('graphPadding');

        return d3.scale.linear().domain([yDomain[0] - padding, yDomain[1] + padding])
                .range([graphicTop + graphicHeight, graphicTop])
                .nice(this.get('numYTicks'));
      }),

      // ----------------------------------------------------------------------------
      // Graphics Properties
      // ----------------------------------------------------------------------------

      // Scatterplots handle different groups by varying shape of dot first and then
      // vary color or tint of seed color.
      groupShapes: Ember.computed(function() {
        return ['circle', 'square', 'triangle-up', 'cross', 'diamond'];
      }),

      numGroupShapes: Ember.computed.alias('groupShapes.length'),

      // Fixed number of colors for scatter plots, total different dot types is
      // numGroupsShapes * numGroupColors
      numGroupColors: 2,

      maxNumGroups: Ember.computed('numGroupColors', 'numGroupShapes', function() {
        return this.get('numGroupColors') * this.get('numGroupShapes');
      }),

      // Only display a different icon for each group if the number of groups is less
      // than or equal to the maximum number of groups
      displayGroups: Ember.computed('isGrouped', 'numGroups', 'numGroupShapes', function() {
        return this.get('isGrouped') && this.get('numGroups') <= this.get('maxNumGroups');
      }),

      // Since we are only provided with the index of each dot within its <g>, we
      // decide the shape and color of the dot using the index of its group property
      getGroupShape: Ember.computed(function() {
        var _this = this;
        return function(d, i) {
          i = _this.get('groupNames').indexOf(d.group);
          if (!_this.get('displayGroups')) {
            return 'circle';
          }
          return _this.get('groupShapes')[i % _this.get('numGroupShapes')];
        };
      }),

      getGroupColor: Ember.computed(function() {
        var _this = this;
        return function(d, i) {
          var colorIndex = 0;
          if (_this.get('displayGroups')) {
            i = _this.get('groupNames').indexOf(d.group);
            colorIndex = Math.floor(i / _this.get('numGroupShapes'));
          }
          return _this.get('colorScale')(colorIndex / _this.get('numGroupColors'));
        };
      }),

      // ----------------------------------------------------------------------------
      // Legend Configuration
      // ----------------------------------------------------------------------------

      hasLegend: Ember.computed('isGrouped', 'showLegend', function() {
        return this.get('isGrouped') && this.get('showLegend');
      }),

      legendIconRadius: Ember.computed.alias('dotRadius'),

      legendItems: Ember.computed('hasNoData', 'groupedData', 'getGroupShape', 'getGroupColor',
            'displayGroups', 'isShowingTotal', 'totalPointData', function() {

        if (this.get('hasNoData')) {
          return [];
        }
        var getGroupShape = this.get('getGroupShape');
        var getGroupColor = this.get('getGroupColor');
        var displayGroups = this.get('displayGroups');

        var legendData = this.get('groupedData').map(function(d, i) {
          var name = d[0].group;
          var value = d.length === 1 ? d[0] : null;
          return {
            label: name,
            group: name,
            stroke: getGroupColor,
            fill: displayGroups ? getGroupColor : 'transparent',
            icon: getGroupShape,
            selector: ".group-" + i,
            xValue: value != null ? value.xValue : void 0,
            yValue: value != null ? value.yValue : void 0
          };
        });

        if (this.get('isShowingTotal')) {
          var point = this.get('totalPointData');
          legendData.unshift({
            label: point.group,
            group: point.group,
            stroke: getGroupColor,
            selector: '.totalgroup',
            xValue: point.xValue,
            yValue: point.yValue
          });
        }

        return legendData;
      }),

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      xValueDisplayName: 'X Factor',
      yValueDisplayName: 'Y Factor',

      showDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', true);
          var formatXValue = _this.get('formatXValue');
          var formatYValue = _this.get('formatYValue');
          var content = "<span class=\"tip-label\">" + data.group + "</span>";
          content += "<span class=\"name\">" + (_this.get('xValueDisplayName')) + ": </span>";
          content += "<span class=\"value\">" + (formatXValue(data.xValue)) + "</span><br/>";
          content += "<span class=\"name\">" + (_this.get('yValueDisplayName')) + ": </span>";
          content += "<span class=\"value\">" + (formatYValue(data.yValue)) + "</span>";
          
          return _this.showTooltip(content, d3.event);
        };
      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', false);
          return _this.hideTooltip();
        };
      }),

      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      groupAttrs: Ember.computed(function() {
        return {
          "class": function(d, i) {
            return "group group-" + i;
          }
        };
      }),

      pointAttrs: Ember.computed('dotShapeArea', 'getGroupShape', 
            'xScale', 'yScale', 'displayGroups', 'getGroupColor', function() {
        var _this = this;
        return {
          d: d3.svg.symbol().size(this.get('dotShapeArea')).type(this.get('getGroupShape')),
          fill: this.get('displayGroups') ? this.get('getGroupColor') : 'transparent',
          stroke: this.get('getGroupColor'),
          'stroke-width': 1.5,
          transform: function(d) {
            var dx = _this.get('xScale')(d.xValue);
            var dy = _this.get('yScale')(d.yValue);
            return "translate(" + dx + ", " + dy + ")";
          }
        };
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      groups: Ember.computed(function() {
        return this.get('viewport').selectAll('.group').data(this.get('finishedData'));
      })["volatile"](),

      selectOrCreateAxis: function(selector) {
        var axis = this.get('viewport').select(selector);
        if (axis.empty()) {
          return this.get('viewport').insert('g', ':first-child');
        } else {
          return axis;
        }
      },

      selectOrCreateAxisTitle: function(selector) {
        var title = this.get('viewport').select(selector);
        if (title.empty()) {
          return this.get('viewport').append('text');
        } else {
          return title;
        }
      },

      xAxis: Ember.computed(function() {
        return this.selectOrCreateAxis('.x.axis').attr('class', 'x axis');
      })["volatile"](),

      yAxis: Ember.computed(function() {
        return this.selectOrCreateAxis('.y.axis').attr('class', 'y axis');
      })["volatile"](),

      xAxisTitle: Ember.computed(function() {
        return this.selectOrCreateAxisTitle('.x.axis-title').attr('class', 'x axis-title');
      })["volatile"](),

      yAxisTitle: Ember.computed(function() {
        return this.selectOrCreateAxisTitle('.y.axis-title').attr('class', 'y axis-title');
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      renderVars: ['xScale', 'yScale', 'dotShapeArea', 'finishedData', 'xValueDisplayName', 'yValueDisplayName'],

      drawChart: function() {
        this.updateTotalPointData();
        this.updateData();
        this.updateAxes();
        this.updateGraphic();
        if (this.get('hasLegend')) {
          return this.drawLegend();
        } else {
          return this.clearLegend();
        }
      },

      totalPointShape: Ember.computed(function() {
        var dotShapeArea = this.get('dotShapeArea');

        var _this = this;
        return function(selection) {
          selection.append('path').attr({
            "class": 'totaldot',
            d: d3.svg.symbol().size(dotShapeArea).type('circle'),
            fill: _this.get('getGroupColor')
          });

          return selection.append('path').attr({
            "class": 'totaloutline',
            d: d3.svg.symbol().size(dotShapeArea * 3).type('circle'),
            fill: 'transparent',
            stroke: _this.get('getGroupColor'),
            'stroke-width': 2
          });
        };
      }),

      updateTotalPointData: function() {
        var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
        var totalPoint = this.get('viewport')
                            .selectAll('.totalgroup')
                            .data(totalData);
        totalPoint.exit().remove();

        return totalPoint.enter()
                .append('g')
                .attr('class', 'totalgroup')
                .call(this.get('totalPointShape'));
      },

      updateData: function() {
        var groups, points;
        groups = this.get('groups');
        groups.enter()
          .append('g')
          .attr('class', 'group')
          .attr(this.get('groupAttrs'));
        groups.exit().remove();
        points = groups.selectAll('.dot').data(function(d) {
          return d;
        });
        points.enter()
          .append('path')
          .attr('class', 'dot');

        return points.exit().remove();
      },

      updateAxes: function() {
        var xAxis = d3.svg.axis().scale(this.get('xScale')).orient('top').ticks(this.get('numXTicks')).tickSize(this.get('graphicHeight')).tickFormat(this.get('formatXValue'));
        var yAxis = d3.svg.axis().scale(this.get('yScale')).orient('right').ticks(this.get('numYTicks')).tickSize(this.get('graphicWidth')).tickFormat(this.get('formatYValue'));
        var graphicTop = this.get('graphicTop');
        var graphicHeight = this.get('graphicHeight');
        var gXAxis = this.get('xAxis')
                .attr('transform', "translate(0," + (graphicTop + graphicHeight) + ")")
                .call(xAxis);
        gXAxis.selectAll('g').filter(function(d) {
          return d !== 0;
        }).classed('major', false)
          .classed('minor', true);

        var labelPadding = this.get('labelPadding');
        gXAxis.selectAll('text').style('text-anchor', 'middle').attr({
          y: function() {
            return this.getBBox().height + labelPadding / 2;
          }
        });
        var gYAxis = this.get('yAxis');

        this.set('graphicLeft', this.maxLabelLength(gYAxis.selectAll('text')) + this.get('labelPadding'));
        var graphicLeft = this.get('graphicLeft');
        gYAxis.attr('transform', "translate(" + graphicLeft + ",0)").call(yAxis);

        gYAxis.selectAll('g').filter(function(d) {
          return d !== 0;
        }).classed('major', false).classed('minor', true);

        gYAxis.selectAll('text').style('text-anchor', 'end').attr({
          x: -this.get('labelPadding')
        });

        var xAxisPadding = this.get('labelHeightOffset') + this.get('labelPadding');
        this.get('xAxisTitle').text(this.get('xValueDisplayName')).style('text-anchor', 'middle').attr({
          x: this.get('graphicWidth') / 2 + this.get('labelWidthOffset'),
          y: this.get('graphicBottom') + xAxisPadding
        });

        return this.get('yAxisTitle').text(this.get('yValueDisplayName')).style('text-anchor', 'start').attr({
          y: 0,
          x: 0
        });
      },

      updateGraphic: function() {
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');
        
        this.get('groups')
          .selectAll('.dot')
          .attr(this.get('pointAttrs'))
        .on("mouseover", function(d, i) {
          return showDetails(d, i, this);
        }).on("mouseout", function(d, i) {
          return hideDetails(d, i, this);
        });

        var _this = this;
        return this.get('viewport').select('.totalgroup').on("mouseover", function(d, i) {
          return showDetails(d, i, this);
        }).on("mouseout", function(d, i) {
          return hideDetails(d, i, this);
        }).attr({
          transform: function(d) {
            var dx, dy;
            dx = _this.get('xScale')(d.xValue);
            dy = _this.get('yScale')(d.yValue);
            return "translate(" + dx + ", " + dy + ")";
          }
        });
      }

    });
  });
;define("ember-charts/mixins/legend", 
  ["ember","ember-charts/utils/label-trimmer","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var LabelTrimmer = __dependency2__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // ----------------------------------------------------------------------------
      // Legend settings
      // ----------------------------------------------------------------------------

      // Padding between legend and chart
      legendTopPadding: 10,

      // Acceptable dimensions for each legend item
      legendItemHeight: 18,
      minLegendItemWidth: 120,
      maxLegendItemWidth: 160,

      // Radius of each legend icon
      legendIconRadius: 9,

      // Padding between each legend icon and padding
      legendLabelPadding: 10,

      // Toggle for whether or not to show the legend
      showLegend: true,

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      // Outside bounds of legend
      legendWidth: Ember.computed.alias('width'),

      legendHeight: Ember.computed('numLegendRows', 'legendItemHeight', function() {
        return this.get('numLegendRows') * this.get('legendItemHeight');
      }), 

      // Dynamically calculate the size of each legend item
      legendItemWidth: Ember.computed('legendWidth', 'minLegendItemWidth', 'maxLegendItemWidth',
        'legendItems.length', function() {

        var itemWidth = this.get('legendWidth') / this.get('legendItems.length');
        if (itemWidth < this.get('minLegendItemWidth')) {
          return this.get('minLegendItemWidth');
        } else if (itemWidth > this.get('maxLegendItemWidth')) {
          return this.get('maxLegendItemWidth');
        } else {
          return itemWidth;
        }
      }),

      // Dynamically calculate the number of legend items in each row
      numLegendItemsPerRow: Ember.computed('legendWidth', 'legendItemWidth', function() {
        return Math.floor(this.get('legendWidth') / this.get('legendItemWidth'));
      }),

      // Dynamically calculate the number of rows needed
      numLegendRows: Ember.computed('legendItems.length', 'numLegendItemsPerRow', function() {
        return Math.ceil(this.get('legendItems.length') / this.get('numLegendItemsPerRow'));
      }),

      // Maximum width of each label before it gets truncated
      legendLabelWidth: Ember.computed('legendItemWidth', 'legendIconRadius', 'legendLabelPadding', function() {
        return (this.get('legendItemWidth') - this.get('legendIconRadius') - this.get('legendLabelPadding') * 2);
      }), 

      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      // Space between legend and chart (need to account for label size and perhaps
      // more). Charts will usually override this because there may be other things
      // below the chart graphic like an axis or labels or axis title.
      legendChartPadding: 0,

      // we use averageLegendLabelWidth in order to estimate how much to move the
      // labels to make them seem roughly centered
      // averageLegendLabelWidth is set every time we redraw the legend
      averageLegendLabelWidth: 0,

      // Center the legend beneath the chart. Since the legend is inside the chart
      // viewport, which has already been positioned with regards to margins,
      // only consider the height of the chart.
      legendAttrs: Ember.computed('outerWidth', 'graphicBottom', 'legendTopPadding', 'legendChartPadding', function() {
        var dx, dy, offsetToLegend;
        dx = this.get('outerWidth') / 2;
        offsetToLegend = this.get('legendChartPadding') + this.get('legendTopPadding');
        dy = this.get('graphicBottom') + offsetToLegend;
        return {
          transform: "translate(" + dx + ", " + dy + ")"
        };
      }),

      // Place each legend item, breaking across rows. Center them if there is one
      // row
      // Ideally legend items would be centered to the very middle of the graph,
      // this is made difficult by the fact that we want the icons to line up in
      // nice columns and that the labels are variable length
      legendItemAttrs: Ember.computed('legendItemWidth', 'legendItemHeight', 'numLegendItemsPerRow',
         'legendItems.length', 'numLegendRows', 'averageLegendLabelWidth', function() {


        var legendItemWidth = this.get('legendItemWidth');
        var legendItemHeight = this.get('legendItemHeight');
        var numItemsPerRow = this.get('numLegendItemsPerRow');
        var numAllItems = this.get('legendItems.length');
        var isSingleRow = this.get('numLegendRows') === 1;

        var _this = this;
        return {
          "class": 'legend-item',
          width: legendItemWidth,
          'stroke-width': 0,
          transform: function(d, i) {
            var col = i % numItemsPerRow;
            var row = Math.floor(i / numItemsPerRow);
            var items = isSingleRow ? numAllItems : numItemsPerRow;
            var dx = col * legendItemWidth - items / 2 * legendItemWidth + _this.get('averageLegendLabelWidth') / 2;
            var dy = row * legendItemHeight + legendItemHeight / 2;
            return "translate(" + dx + ", " + dy + ")";
          }
        };
      }),
      
      legendIconAttrs: Ember.computed('legendIconRadius', function() {
        var iconRadius = this.get('legendIconRadius');
        
        return {
          d: function(d, i) {
            if (d.icon(d) === 'line') {
              return "M " + (-iconRadius) + " 0 L " + iconRadius + " 0";
            } else {
              return d3.svg.symbol().type(d.icon(d, i)).size(Math.pow(iconRadius, 2))(d, i);
            }
          },
          fill: function(d, i) {
            return (_.isFunction(d.fill)) ? d.fill(d, i) : d.fill;
          },
          stroke: function(d, i) {
            return (_.isFunction(d.stroke)) ? d.stroke(d, i) : d.stroke;
          },
          'stroke-width': function(d) {
            if (!d.width) {
              return 1.5;
            }
            if (_.isFunction(d.width)) {
              return d.width(d);
            } else {
              return d.width;
            }
          },
          'stroke-dasharray': function(d) {
            if (d.dotted) {
              return '2,2';
            }
          }
        };
      }),

      legendLabelAttrs: Ember.computed('legendIconRadius', 'legendLabelPadding', function() {
        return {
          x: this.get('legendIconRadius')/2 + this.get('legendLabelPadding'),
          y: '.35em'
        };
      }),

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      showLegendDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', true);
          if (data.selector) {
            _this.get('viewport').selectAll(data.selector).classed('hovered', true);
          }
          var content = "<span class=\"tip-label\">" + data.label + "</span>";
          if (data.xValue != null) {
            var formatXValue = _this.get('formatXValue');
            var formatYValue = _this.get('formatYValue');
            content += "<span class=\"name\">" + (_this.get('tooltipXValueDisplayName')) + ": </span>";
            content += "<span class=\"value\">" + (formatXValue(data.xValue)) + "</span><br/>";
            content += "<span class=\"name\">" + (_this.get('tooltipYValueDisplayName')) + ": </span>";
            content += "<span class=\"value\">" + (formatYValue(data.yValue)) + "</span>";
          }
          return _this.showTooltip(content, d3.event);
        };
      }),

      hideLegendDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', false);
          if (data.selector) {
            _this.get('viewport').selectAll(data.selector).classed('hovered', false);
          }
          return _this.hideTooltip();
        };
      }),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      clearLegend: function() {
        return this.get('viewport')
          .select('.legend-container')
          .remove();
      },

      legend: Ember.computed(function() {
        var legend = this.get('viewport').select('.legend-container');
        if (legend.empty()) {
          return this.get('viewport').append('g').attr('class', 'legend-container');
        } else {
          return legend;
        }
      })["volatile"](),

      drawLegend: function() {
        if (!this.get('showLegend')) {
          return;
        }
        this.clearLegend();
        var legend = this.get('legend');
        legend.attr(this.get('legendAttrs'));

        var showLegendDetails = this.get('showLegendDetails');
        var hideLegendDetails = this.get('hideLegendDetails');
        var legendItems = 
          legend.selectAll('.legend-item')
                .data(this.get('legendItems'))
                .enter()
                .append('g')
                .attr(this.get('legendItemAttrs'))
                .on("mouseover", function(d, i) {
                    return showLegendDetails(d, i, this);
                }).on("mouseout", function(d, i) {
                    return hideLegendDetails(d, i, this);
                });
        var legendIconAttrs = this.get('legendIconAttrs');
        var isShowingTotal = this.get('isShowingTotal');
        var totalPointShape = this.get('totalPointShape');
        legendItems.each(function(d, i) {
          var sel = d3.select(this);
          if ((i === 0) && isShowingTotal) {
            return sel.append('g')
                    .attr('class', 'icon')
                    .call(totalPointShape);
          } else {
            return sel.append('path')
                    .attr('class', 'icon')
                    .attr(legendIconAttrs);
          }
        });
        var legendLabelWidth = this.get('legendLabelWidth');
        var labelTrimmer = LabelTrimmer.create({
          getLabelSize: function() {
            return legendLabelWidth;
          },
          getLabelText: function(d) {
            return d.label;
          }
        });

        legendItems.append('text')
              .style('text-anchor', 'start')
              .text( function(d) { return d.label; })
              .attr( this.get('legendLabelAttrs'))
              .call( labelTrimmer.get('trim'));

        var totalLabelWidth = 0;
        legend.selectAll('text').each(function() {
          return totalLabelWidth += this.getComputedTextLength();
        });
        return this.set('averageLegendLabelWidth', totalLabelWidth / this.get('legendItems.length'));
      }
    });
  });
;define("ember-charts/mixins/axes", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // # ------------------------------------------------------------------------
      // # API -- Inputs
      // #
      // # graphicWidth (req.): The width of the graphic to be given axes
      // # graphicHeight (req.): The width of the graphic to be given axes
      // # minXTicks: The minimum number of ticks to appear on the X axis
      // # minYTicks: The minimum number of ticks to appear on the Y axis
      // # tickSpacing: Number of pixels between ticks on axes
      // # minAxisValue: The minimum value appearing on an axis using numeric values
      // # maxAxisValue: The maximum value appearing on an axis using numeric values
      // # ------------------------------------------------------------------------
      graphicWidth: null,
      graphicHeight: null,
      minXTicks: 3,
      minYTicks: 3,
      tickSpacing: 50,

      minAxisValue: 0,
      maxAxisValue: 0,

      // # ------------------------------------------------------------------------
      // # API -- Outputs
      // #
      // # numXTicks: Number of ticks on the X axis
      // # numYTicks: Number of ticks on the Y axis
      // # formatValueAxis: Overridable formatter for numeric values along an axis
      // # ------------------------------------------------------------------------
      numXTicks: Ember.computed('graphicWidth', 'tickSpacing', 'minXTicks', function() {
        var calculatedTicks = Math.floor(this.get('graphicWidth') / this.get('tickSpacing'));
        return Math.max(calculatedTicks, this.get('minXTicks'));
      }),

      numYTicks: Ember.computed('graphicHeight', 'tickSpacing', 'minYTicks', function() {
        var calculatedTicks = Math.floor(this.get('graphicHeight') / this.get('tickSpacing'));
        return Math.max(calculatedTicks, this.get('minYTicks'));
      }),

      formatValueAxis: Ember.computed('minAxisValue', 'maxAxisValue', function() {
        // # Base the format prefix on largest magnitude (e.g. if we cross from
        // # hundreds of thousands into millions, use millions)
        var magnitude = Math.max(Math.abs(this.get('minAxisValue')), Math.abs(this.get('maxAxisValue')));
        var prefix = d3.formatPrefix(magnitude);
        return function(value) {
          return "" + (prefix.scale(value)) + prefix.symbol;
        };
      })
    });
  });
;define("ember-charts/mixins/no-margin-chart", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Remove all extra margins so that graph elements can line up with other
    // elements more easily
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.Mixin.create({
      marginLeft: 0,
      marginRight: 0,

      // There should be no padding if there is no legend
      marginBottom: Ember.computed('hasLegend', function() {
        return this.get('hasLegend') ? 30 : 0;
      }),

      maxLabelLength: function(svgTextArray) {
        var maxLabel = 0;
        svgTextArray.each(function() {
          // this.getComputedTextLength() gives the length in pixels of a text element
          if (this.getComputedTextLength() > maxLabel) {
            maxLabel = this.getComputedTextLength();
          }
        });
        return maxLabel;
      }
    });
  });
;define("ember-charts/utils/group-by", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function groupBy(obj, getter) {
    	var group, key, value;
    	var result = {};
    	for (var i = 0, len = obj.length; i < len; i++) {
    	  value = obj[i];
    	  key = getter(value, i);
    	  group = result[key] || (result[key] = []);
    	  group.push(value);
    	}
    	return result;
    }

    __exports__.groupBy = groupBy;
  });
;define("ember-charts/components/time-series-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/legend","ember-charts/mixins/time-series-labeler","ember-charts/mixins/floating-tooltip","ember-charts/mixins/has-time-series-rule","ember-charts/mixins/axes","ember-charts/mixins/formattable","ember-charts/mixins/no-margin-chart","ember-charts/utils/group-by","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];

    var LegendMixin = __dependency3__["default"];
    var TimeSeriesLabelerMixin = __dependency4__["default"];
    var FloatingTooltipMixin = __dependency5__["default"];
    var HasTimeSeriesRuleMixin = __dependency6__["default"];
    var AxesMixin = __dependency7__["default"];
    var FormattableMixin = __dependency8__["default"];
    var NoMarginChartMixin = __dependency9__["default"];

    var groupBy = __dependency10__.groupBy;

    __exports__["default"] = ChartComponent.extend(
      LegendMixin, TimeSeriesLabelerMixin, FloatingTooltipMixin,
      HasTimeSeriesRuleMixin, AxesMixin, FormattableMixin, NoMarginChartMixin, {

      classNames: ['chart-time-series'],

      // ----------------------------------------------------------------------------
      // API -- inputs
      //
      // lineData, barData:
      // Both data sets need to be in the following format:
      // [{label: ..., time: ..., value: ...}, {...}, ...]
      // Line data will be grouped by label, while bar data is grouped by
      // time and then label
      //
      // ----------------------------------------------------------------------------
      lineData: null,
      barData: null,

      // ----------------------------------------------------------------------------
      // Time Series Chart Options
      // ----------------------------------------------------------------------------

      // Getters for formatting human-readable labels from provided data
      formatTime: d3.time.format('%Y-%m-%d'),
      formatTimeLong: d3.time.format('%a %b %-d, %Y'),

      // Data without group will be merged into a group with this name
      ungroupedSeriesName: 'Other',

      // Use basis interpolation? Smooths lines but may prevent extrema from being
      // displayed
      interpolate: false,

      // Force the Y axis to start at zero, instead of the smallest Y value provided
      yAxisFromZero: false,

      // Space between bars, as fraction of total bar + padding space
      barPadding: 0,

      // Space between bar groups, as fraction of total bar + padding space
      barGroupPadding: 0.25,

      // Bar left offset, as fraction of width of bar
      barLeftOffset: 0.0,

      // ----------------------------------------------------------------------------
      // Overrides of ChartComponent methods
      // ----------------------------------------------------------------------------

      // Combine all data for testing purposes
      finishedData: Ember.computed('_groupedLineData.@each.values', '_groupedBarData.@each', function() {
        return {
          lineData: this.get('_groupedLineData'),
          groupedBarData: this.get('_groupedBarData')
        };
      }),

      hasNoData: Ember.computed('_hasBarData', '_hasLineData', function() {
        return !this.get('_hasBarData') && !this.get('_hasLineData');
      }),

      // ----------------------------------------------------------------------------
      // Overrides of Legend methods
      // ----------------------------------------------------------------------------

      // Vertical spacing for legend, x axis labels and x axis title
      legendChartPadding: Ember.computed.alias('labelHeightOffset'),

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      _getLabelOrDefault: function(datum) {
        return datum.label && datum.label.toString() || this.get('ungroupedSeriesName');
      },

      // Puts lineData in a new format.
      // Resulting format is [{group: ..., values: ...}] where values are the
      // lineData values for that group.
      _groupedLineData: Ember.computed('lineData.@each', 'ungroupedSeriesName', function() {
        var lineData = this.get('lineData');
        if (Ember.isEmpty(lineData)) {
          return [];
        }

        var _this = this;
        var groups = groupBy(lineData, function(datum) {
          return _this._getLabelOrDefault(datum);
        });
        // _results = [];
        // for (groupName in groups) {
        //   values = groups[groupName];
        //   _results.push();
        // }
        return _.map(groups, function( values, groupName) {
          return {
            group: groupName,
            values: values
          };
        });

        // return _results;
      }),

      // puts barData in a new format.
      // Resulting format: [[{group: ..., time: ..., value: ..., label:
      // ...}, ...], [...]] where each internal array is an array of hashes
      // at the same time
      _groupedBarData: Ember.computed('barData.@each', 'ungroupedSeriesName', 'barLeftOffset', function() {
        var barData = this.get('barData');
        if (Ember.isEmpty(barData)) {
          return [];
        }

        // returns map from time to array of bar hashes
        var barTimes = groupBy(barData, function(d) {
          return d.time.getTime();
        });

        var _this = this;
        return _.map(barTimes, function(groups) {
          return _.map(groups, function(g) {
              var label = _this._getLabelOrDefault(g);
              var labelTime = g.time;
              var drawTime = _this._transformCenter(g.time);
              return {
                  group: label,
                  time: drawTime,
                  value: g.value,
                  label: label,
                  labelTime: labelTime
              };
          });
        });
      }),

      // Transforms the center of the bar graph for the drawing based on the
      // specified barLeftOffset
      _transformCenter: function(time) {
        var delta = this._getTimeDeltaFromSelectedInterval();
        var offset = this.get('barLeftOffset');
        if (offset !== 0) {
          time = this._padTimeWithIntervalMultiplier(time, delta, offset);
        }
        return time;
      },

      // Since selected interval and time delta don't use the same naming convention
      // this converts the selected interval to the time delta convention for the
      // padding functions.
      _getTimeDeltaFromSelectedInterval: function() {
        switch (this.get('selectedInterval')) {
          case 'years':
          case 'Y':
            return 'year';
          case 'quarters':
          case 'Q':
            return 'quarter';
          case 'months':
          case 'M':
            return 'month';
          case 'weeks':
          case 'W':
            return 'week';
          case 'seconds':
          case 'S':
            return 'second';
        }
      },


      // Given a time, returns the time plus half an interval
      _padTimeForward: function(time, delta) {
        return this._padTimeWithIntervalMultiplier(time, delta, 0.5);
      },

      // Given a time, returns the time minus half an interval
      _padTimeBackward: function(time, delta) {
        return this._padTimeWithIntervalMultiplier(time, delta, -0.5);
      },

      // Because of the complexities of what will and won't work with this method,
      // it's not very safe to call. Instead, call _padTimeForward or
      // _padTimeBackward. This method exists to remove code duplication from those.
      _padTimeWithIntervalMultiplier: function(time, delta, multiplier) {
        if (time != null) {
          var intervalType = delta === 'quarter' ? 'month' : delta;
          var period = delta === 'quarter' ? 3 : 1;
          var offsetDelta = d3.time[intervalType].offset(time, period) - time.getTime();
          time = offsetDelta * multiplier + time.getTime();
        }
        return new Date(time);
      },

      _barGroups: Ember.computed('barData.@each', 'ungroupedSeriesName', function() {
        var barData = this.get('barData');
        if (Ember.isEmpty(barData)) {
          return [];
        }
        var _this = this;
        var barGroups = groupBy(barData, function(datum) {
          return _this._getLabelOrDefault(datum);
        });
        return _.keys(barGroups);
      }),

      _hasLineData: Ember.computed.notEmpty('lineData'),

      _hasBarData: Ember.computed.notEmpty('barData'),

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      // position of the left of the graphic -- we want to leave space for
      // labels
      graphicLeft: Ember.computed.alias('labelWidthOffset'),

      // width of the graphic
      graphicWidth: Ember.computed('width', 'graphicLeft', function() {
        return (this.get('width') - this.get('graphicLeft'));
      }),

      graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
        return (this.get('height') - this.get('legendHeight') - this.get('legendChartPadding'));
      }),

      // ----------------------------------------------------------------------------
      // Grouped/Stacked Bar Scales
      // ----------------------------------------------------------------------------

      // Unit of time between bar samples
      timeDelta: Ember.computed('_groupedBarData', function() {
        var groupedBarData = this.get('_groupedBarData');
        if (Ember.isEmpty(groupedBarData) || (groupedBarData.length < 2)) {
          return 'month';
        }

        // difference in time between first bar data group and second bar
        // data group
        var firstBarTime = groupedBarData[0][0].time;
        var secondBarTime = groupedBarData[1][0].time;
        var oneDayInSeconds = 24*60*60*1000;
        var diffTimeDays = (secondBarTime - firstBarTime) / (oneDayInSeconds);

        // Some fuzzy bar interval computation, I just picked 2 day buffer
        if (diffTimeDays > 351) {
          return 'year';
        } else if (diffTimeDays > 33) {
          return 'quarter';
        } else if (diffTimeDays > 9) {
          return 'month';
        } else if (diffTimeDays > 3) {
          return 'week';
        } else {
          return 'day';
        }
      }),

      // this method seems very flaky to me; making padding by changing domain
      // convention is to change range
      barDataExtent: Ember.computed('timeDelta', '_groupedBarData.@each', function() {
        var timeDelta = this.get('timeDelta');
        var groupedBarData = this.get('_groupedBarData');
        if (Ember.isEmpty(groupedBarData)) {
          return [new Date(), new Date()];
        }

        var first = _.first(groupedBarData);
        var last = _.last(groupedBarData);
        var startTime = new Date(first[0].time);
        var endTime = new Date(last[0].time);

        // Add the padding needed for the edges of the bar
        var paddedStart = this._padTimeBackward(startTime, timeDelta);
        var paddedEnd = this._padTimeForward(endTime, timeDelta);
        return [ new Date(paddedStart), new Date(paddedEnd) ];
      }),

      // The time range over which all bar groups are drawn
      xBetweenGroupDomain: Ember.computed.alias('barDataExtent'),

      // The range of labels assigned within each group
      xWithinGroupDomain: Ember.computed.alias('_barGroups'),

      // The space (in pixels) allocated to each bar, including padding
      barWidth: Ember.computed('xGroupScale', function() {
        return this.get('xGroupScale').rangeBand();
      }),

      paddedGroupWidth: Ember.computed('timeDelta', 'xTimeScale', 'xBetweenGroupDomain', function() {
        var timeDelta = this.get('timeDelta');
        var scale = this.get('xTimeScale');
        var t1 = this.get('xBetweenGroupDomain')[0];
        var t2 = (timeDelta === 'quarter') ? d3.time['month'].offset(t1, 3) : d3.time[timeDelta].offset(t1, 1);
        return (scale(t2) - scale(t1));
      }),
      // ----------------------------------------------------------------------------
      // Line Drawing Scales
      // ----------------------------------------------------------------------------

      lineSeriesNames: Ember.computed('_groupedLineData', function() {
        var data = this.get('_groupedLineData');
        if (Ember.isEmpty(data)) {
          return [];
        }
        return data.map(function(d) {
          return d.group;
        });
      }),

      lineDataExtent: Ember.computed('_groupedLineData.@each.values', function() {
        var data = this.get('_groupedLineData');
        if (Ember.isEmpty(data)) {
          return [new Date(), new Date()];
        }

        var extents = _.map(data, 'values').map(function(series) {
          return d3.extent(series.map(function(d) {
            return d.time;
          }));
        });

        return [
          d3.min(extents, function(e) {
            return e[0];
          }),
          d3.max(extents, function(e) {
            return e[1];
          })
        ];
      }),

      // The set of all time series
      xBetweenSeriesDomain: Ember.computed.alias('lineSeriesNames'),

      // The range of all time series
      xWithinSeriesDomain: Ember.computed.alias('lineDataExtent'),

      // ----------------------------------------------------------------------------
      // Ticks and Scales
      // ----------------------------------------------------------------------------

      // Override maxNumberOfLabels in the time series labeler mixin, setting it to
      // the dynamically computed number of ticks going on the time series axis
      maxNumberOfLabels: Ember.computed.alias('numXTicks'),

      // Create a domain that spans the larger range of bar or line data
      xDomain: Ember.computed('xBetweenGroupDomain', 'xWithinSeriesDomain',
        '_hasBarData', '_hasLineData', function() {

        if (!this.get('_hasBarData')) {
          return this.get('xWithinSeriesDomain');
        }
        if (!this.get('_hasLineData')) {
          return this.get('xBetweenGroupDomain');
        }
        var minOfGroups = this.get('xBetweenGroupDomain')[0];
        var maxOfGroups = this.get('xBetweenGroupDomain')[1];
        var minOfSeries = this.get('xWithinSeriesDomain')[0];
        var maxOfSeries = this.get('xWithinSeriesDomain')[1];

        return [ Math.min(minOfGroups, minOfSeries), Math.max(maxOfGroups, maxOfSeries) ];
      }),

      // Largest and smallest values in line and bar data
      // Use raw bar data instead of doubly grouped hashes in groupedBarData
      yDomain: Ember.computed( '_groupedLineData', '_groupedBarData',
        '_hasBarData', '_hasLineData', 'yAxisFromZero', function() {

        var lineData = this.get('_groupedLineData');
        var groupData = this.get('_groupedBarData');

        var maxOfSeries = d3.max(lineData, function(d) {
          return d3.max(d.values, function(dd) {
            return dd.value;
          });
        });

        var minOfSeries = d3.min(lineData, function(d) {
          return d3.min(d.values, function(dd) {
            return dd.value;
          });
        });

        var maxOfGroups = d3.max(groupData, function(d) {
          return d3.max(d, function(dd) {
            return dd.value;
          });
        });

        var minOfGroups = d3.min(groupData, function(d) {
          return d3.min(d, function(dd) {
            return dd.value;
          });
        });

        var hasBarData = this.get('_hasBarData');
        var hasLineData = this.get('_hasLineData');

        // Find the extent of whatever data is drawn on the graph,
        // e.g. max of only line data, or max of line
        var min, max;
        if (!hasBarData) {
          min = minOfSeries;
          max = maxOfSeries;
        } else if (!hasLineData) {
          min = minOfGroups;
          max = maxOfGroups;
        } else {
          min = Math.min(minOfGroups, minOfSeries);
          max = Math.max(maxOfGroups, maxOfSeries);
        }

        // Ensure the extent contains zero if that is desired. If all values in
        // the y-domain are equal, assign it a range so data can be displayed
        if (this.get('yAxisFromZero') || min === max) {
          if (max < 0) {
            return [min, 0];
          }
          if (min > 0) {
            return [0, max];
          }
          if ((min === max && max === 0)) {
            return [-1, 1];
          }
        }

        return [min, max];
      }),

      yRange: Ember.computed('graphicTop', 'graphicHeight', function() {
        return [ this.get('graphicTop') + this.get('graphicHeight'), this.get('graphicTop') ];
      }),

      yScale: Ember.computed('yDomain', 'yRange', 'numYTicks', function() {
        return d3.scale.linear()
          .domain(this.get('yDomain'))
          .range(this.get('yRange'))
          .nice(this.get('numYTicks'));
      }),

      xRange: Ember.computed( 'graphicLeft', 'graphicWidth', function() {
        return [ this.get('graphicLeft'), this.get('graphicLeft') + this.get('graphicWidth') ];
      }),

      xTimeScale: Ember.computed('xDomain', 'xRange', function() {
        return d3.time.scale()
          .domain(this.get('xDomain'))
          .range(this.get('xRange'));
      }),

      xGroupScale: Ember.computed('xWithinGroupDomain', 'paddedGroupWidth',
        'barPadding', 'barGroupPadding', function() {
        return d3.scale.ordinal()
          .domain(this.get('xWithinGroupDomain'))
          .rangeRoundBands([ 0, this.get('paddedGroupWidth')],
            this.get('barPadding')/2, this.get('barGroupPadding')/2);
      }),

      // Override axis mix-in min and max values to listen to the scale's domain
      minAxisValue: Ember.computed('yScale', function() {
        var yScale = this.get('yScale');
        return yScale.domain()[0];
      }),

      maxAxisValue: Ember.computed('yScale', function() {
        var yScale = this.get('yScale');
        return yScale.domain()[1];
      }),

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------


      showDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', true);

          var time = data.labelTime != null ? data.labelTime : data.time;
          var content = "<span class=\"tip-label\">" + (_this.get('formatTime')(time)) + "</span>";
          var formatLabelFunction = _this.get('formatLabelFunction');

          var addValueLine = function(d) {
            content += "<span class=\"name\">" + d.group + ": </span>";
            return content += "<span class=\"value\">" + (formatLabelFunction(d.value)) + "</span><br/>";
          };

          if (Ember.isArray(data.values)) {
            data.values.forEach(addValueLine);
          } else {
            addValueLine(data);
          }

          return _this.showTooltip(content, d3.event);
        };
      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }

        var _this = this;
        return function(data, i, element) {
          d3.select(element).classed('hovered', false);
          return _this.hideTooltip();
        };
      }),

      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      // Number of pixels to shift graphics away from origin line
      zeroDisplacement: 1,

      groupAttrs: Ember.computed('paddedGroupWidth', function() {
        var _this = this;
        return {
          transform: function() {
            return "translate(" + (-_this.get('paddedGroupWidth') / 2) + ",0)";
          }
        };
      }),

      groupedBarAttrs: Ember.computed( 'xTimeScale', 'xGroupScale', 'barWidth', 'yScale',
        'zeroDisplacement', 'barLeftOffset', function() {

        var xTimeScale = this.get('xTimeScale');
        var xGroupScale = this.get('xGroupScale');
        var yScale = this.get('yScale');
        var zeroDisplacement = this.get('zeroDisplacement');

        return {
          "class": function(d,i) {
            return ("grouping-" + i);
          },

          'stroke-width': 0,
          width: this.get('barWidth'),
          x: function(d) {
            return (xGroupScale(d.label) + xTimeScale(d.time));
          },

          y: function(d) {
            return (d.value > 0) ? yScale(d.value) : (yScale(0) + zeroDisplacement);
          },

          height: function(d) {
            // prevent zero-height bars from causing errors because of zeroDisplacement
            var zeroLine = Math.max(0, yScale.domain()[0]);
            return Math.max(0,
                (d.value > zeroLine) ?
                  (Math.abs(yScale(zeroLine) - yScale(d.value)) - zeroDisplacement)
                  :
                  (Math.abs(yScale(d.value) - yScale(zeroLine)) - zeroDisplacement)
            );
          }
        };
      }),

      line: Ember.computed( 'xTimeScale', 'yScale', 'interpolate', function() {
        var _this = this;
        return d3.svg.line()
          .x( function(d) { return _this.get('xTimeScale')(d.time); })
          .y( function(d) { return _this.get('yScale')(d.value); })
          .interpolate( this.get('interpolate') ? 'basis' : 'linear');
      }),

      // Line styles. Implements Craig's design spec, which ensures that out of the
      // first six lines, there are always two distinguishing styles between every
      // pair of lines.
      // 1st line: ~2px, base color, solid
      // 2nd line: ~1px, 66% tinted, solid
      // 3rd line: ~2px, base color, dotted
      // 4th line: ~1px, 66% tinted, dotted
      // 5th line: ~3px, 33% tinted, solid
      // 6th line: ~3px, 33% tinted, dotted
      lineColorFn: Ember.computed( function() {
        var _this = this;
        return function(d,i) {
          var ii;
          switch (i) {
            case 0:
              ii = 0;
              break;
            case 1:
              ii = 2;
              break;
            case 2:
              ii = 0;
              break;
            case 3:
              ii = 2;
              break;
            case 4:
              ii = 0;
              break;
            case 5:
              ii = 1;
              break;
            default:
              ii = i;
          }
          return _this.get('getSeriesColor')(d,ii);
        };
      }),

      lineAttrs: Ember.computed('line', 'getSeriesColor', function() {
        var _this = this;
        return {
            "class": function(d,i) {
              return ("line series-" + i);
            },
            d: function(d) {
              return _this.get('line')(d.values);
            },
            stroke: this.get('lineColorFn'),
            'stroke-width': function(d, i) {
              switch (i) {
                case 0:
                  return 2;
                case 1:
                  return 1.5;
                case 2:
                  return 2;
                case 3:
                  return 1.5;
                case 4:
                  return 2.5;
                case 5:
                  return 2.5;
                default:
                  return 2;
              }
            },

            'stroke-dasharray': function(d, i) {
              switch (i) {
                  case 2:
                  case 3:
                  case 5:
                    return '2,2';
                  default:
                    return '';
              }
            }
        };
      }),

      // ----------------------------------------------------------------------------
      // Color Configuration
      // ----------------------------------------------------------------------------

      numLines: Ember.computed.alias('xBetweenSeriesDomain.length'),
      numBarsPerGroup: Ember.computed.alias('xWithinGroupDomain.length'),

      numColorSeries: 6, // Ember.computed.alias 'numLines'
      numSecondaryColorSeries: Ember.computed.alias('numBarsPerGroup'),

      // Use primary colors for bars if there are no lines

      secondaryMinimumTint: Ember.computed('numLines', function() {
        return (this.get('numLines') === 0) ? 0.0 : 0.4;
      }),

      secondaryMaximumTint: Ember.computed( 'numLines', function() {
        return (this.get('numLines') === 0) ? 0.8 : 0.85;
      }),

      // ----------------------------------------------------------------------------
      // Legend Configuration
      // ----------------------------------------------------------------------------

      hasLegend: Ember.computed( 'legendItems.length', 'showLegend', function() {
        return (this.get('legendItems.length') > 1) && (this.get('showLegend'));
      }),

      legendItems: Ember.computed('xBetweenSeriesDomain', 'xWithinGroupDomain',
        'getSeriesColor', 'getSecondarySeriesColor', function() {

        // getSeriesColor = this.get('getSeriesColor');
        // lineAttrs = this.get('lineAttrs');

        var _this = this;
        var result = this.get('xBetweenSeriesDomain').map( function(d, i) {
          // Line legend items
          var res = {
            label: d,
            stroke: _this.get('lineAttrs')['stroke'](d, i),
            width: _this.get('lineAttrs')['stroke-width'](d, i),
            dotted: _this.get('lineAttrs')['stroke-dasharray'](d, i),
            icon: function() { return 'line'; },
            selector: ".series-" + i
          };
          return res;
        }).concat( _this.get('xWithinGroupDomain').map(function(d, i) {
          // Bar legend items
          var color = _this.get('getSecondarySeriesColor')(d, i);
          var res = {
            stroke: color,
            fill: color,
            label: d,
            icon: function() { return 'square'; },
            selector: (".grouping-" + i)
          };
          return res;
        }));
        return result;
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      removeAllGroups: function() {
        this.get('viewport').selectAll('.bars').remove();
      },

      groups: Ember.computed( function() {
        return this.get('viewport').selectAll('.bars').data(this.get('_groupedBarData'));
      })["volatile"](),

      removeAllSeries: function() {
        this.get('viewport').selectAll('.series').remove();
      },

      series: Ember.computed( function() {
        return this.get('viewport').selectAll('.series').data(this.get('_groupedLineData'));
      })["volatile"](),

      xAxis: Ember.computed( function() {
        var xAxis = this.get('viewport').select('.x.axis');
        if (xAxis.empty()) {
          return this.get('viewport')
            .insert('g', ':first-child')
            .attr('class', 'x axis');
        } else {
          return xAxis;
        }
      })["volatile"](),

      yAxis: Ember.computed( function() {
        var yAxis = this.get('viewport').select('.y.axis');
        if (yAxis.empty()) {
          return this.get('viewport')
            .insert('g', ':first-child')
            .attr('class', 'y axis');
        } else {
          return yAxis;
        }
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      renderVars: ['barLeftOffset', 'labelledTicks', 'xGroupScale', 'xTimeScale', 'yScale'],

      drawChart: function() {
        this.updateBarData();
        this.updateLineData();
        this.updateLineMarkers();
        this.updateAxes();
        this.updateBarGraphic();
        this.updateLineGraphic();
        if (this.get('hasLegend')) {
          this.drawLegend();
        } else {
          this.clearLegend();
        }
      },

      updateAxes: function() {
        var xAxis = d3.svg.axis()
          .scale(this.get('xTimeScale'))
          .orient('bottom')
          .tickValues(this.get('labelledTicks'))
          .tickSubdivide(this.get('numberOfMinorTicks'))
          .tickFormat(this.get('formattedTime'))
          .tickSize(6, 3);

        var graphicTop = this.get('graphicTop');
        var graphicHeight = this.get('graphicHeight');
        var gXAxis = this.get('xAxis');

        gXAxis.attr({
            transform: "translate(0," + graphicTop + graphicHeight + ")"
          }).call(xAxis);

        //tickSize isn't doing anything here, it should take two arguments
        var yAxis = d3.svg.axis()
          .scale(this.get('yScale'))
          .orient('right')
          .ticks(this.get('numYTicks'))
          .tickSize(this.get('graphicWidth'))
          .tickFormat(this.get('formatValueAxis'));

        var gYAxis = this.get('yAxis');

        // find the correct size of graphicLeft in order to fit the Labels perfectly
        this.set('graphicLeft', this.maxLabelLength(gYAxis.selectAll('text')) + this.get('labelPadding'));

        var graphicLeft = this.get('graphicLeft');
        gYAxis.attr('transform', "translate(" + graphicLeft + ",0)")
          .call(yAxis);

        // Ensure ticks other than the zeroline are minor ticks
        gYAxis.selectAll('g')
          .filter(function(d) { return d; })
          .classed('major', false)
          .classed('minor', true);

        gYAxis.selectAll('text')
          .style('text-anchor', 'end')
          .attr({ x: -this.get('labelPadding') });
      },

      updateBarData: function() {
        // Always remove the previous bars, this allows us to maintain the
        // rendering order of bars behind lines
        this.removeAllGroups();

        var groups = this.get('groups');
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');

        // Ensure bars are always inserted behind lines
        groups.enter()
          .insert('g', '.series')
          .attr('class', 'bars');
        groups.exit().remove();

        var bars = groups.selectAll('rect').data( function(d) { return d; });
        bars.enter().append('rect')
          .on("mouseover", function(d,i) {
            return showDetails(d,i,this);
          })
          .on("mouseout", function(d,i) {
            return hideDetails(d,i,this);
          });
        bars.exit().remove();
      },

      updateBarGraphic: function() {
        var groups = this.get('groups');
        groups.attr(this.get('groupAttrs'));
        groups.selectAll('rect')
          .style('fill', this.get('getSecondarySeriesColor'))
          .attr(this.get('groupedBarAttrs'));
      },

      updateLineData: function() {
        // Always remove the previous lines, this allows us to maintain the
        // rendering order of bars behind lines
        this.removeAllSeries();

        var series = this.get('series');
        series.enter()
          .append('g').attr('class', 'series')
          .append('path').attr('class', 'line');
        series.exit()
          .remove();
      },

      updateLineGraphic: function() {
        var series = this.get('series');
        var graphicTop = this.get('graphicTop');
        series.attr('transform', "translate(0, " + graphicTop + ")");
        return series.select('path.line')
          .attr(this.get('lineAttrs'));
      }
    });
  });
;define("ember-charts/mixins/time-series-labeler", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // # Creates time series labels that are spaced reasonably.
    // # Provides this.formattedTime. Depends on this.xDomain and this.selectedInterval.
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // # When set to true, ticks are drawn in the middle of an interval. By default,
      // # they are drawn at the start of an interval.
      centerAxisLabels: false,

      // # Interval for ticks on time axis can be:
      // # years, months, weeks, days
      selectedInterval: 'M',

      // # The maximum number of labels which will appear on the x axis of the
      // # chart. If there would be more labels than this (e.g. if you are
      // # charting 13 intervals or more) then we use the "labelled" functions
      // # below to reduce the number of labels in a natural way.
      maxNumberOfLabels: 10,

      // # This is the number of subdivisions between each major tick on the x
      // # axis. Minor ticks have no labels. For instance, if your maxNumberOfLabels
      // # is 10, and you are charting 20 weeks, there will be 10
      // # major ticks with one subivision (minor ticks) between.
      numberOfMinorTicks: Ember.computed('xDomain', 'selectedInterval', 'labelledTicks', function() {   
        var labelledTicks = this.get('labelledTicks');
        var xDomain = this.get('xDomain'); 
        var start = xDomain[0];
        var stop = xDomain[1];
        
        var allTicks = (function() {
          switch (this.get('selectedInterval')) {
            case 'years':
            case 'Y':
              return d3.time.years(start, stop);
            case 'quarters':
            case 'Q':
              return d3.time.months(start, stop, 3);
            case 'months':
            case 'M':
              return this.monthsBetween(start, stop);
            case 'weeks':
            case 'W':
              return this.weeksBetween(start, stop);
            case 'hours':
            case 'H':
              return d3.time.hours(start, stop);
            case 'seconds':
            case 'S':
              return this.secondsBetween(start, stop);
          }
        }).call(this);
        if (labelledTicks.length < 2) {
          return 0;
        }
        var findTick = function(tick) {
          return function(x) {
            return +x === +tick;
          };
        };
        var secondIndex = _.findIndex( allTicks, findTick( labelledTicks[1] ));
        var firstIndex  = _.findIndex( allTicks, findTick( labelledTicks[0] ));
        return secondIndex - firstIndex - 1;
      }),

      // #  This is the set of ticks on which labels appear.
      labelledTicks: Ember.computed('xDomain', 'maxNumberOfLabels', 'centerAxisLabels', 'selectedInterval', function() {
        var domain = this.get('xDomain');
        var ticks = this.get('tickLabelerFn')(domain[0], domain[1]);
        if (!this.get('centerAxisLabels')) {
          return ticks;
        } else {
          count = 1;
        }

        var interval;
        switch (this.get('selectedInterval')) {
            case 'years':
            case 'Y':
              interval = 'year';
              break;
            case 'quarters':
            case 'Q':
              interval = 'quarter';
              break;
            case 'months':
            case 'M':
              interval = 'month';
              break;
            case 'weeks':
            case 'W':
              interval = 'week';
              break;
            case 'hours':
            case 'H':
              interval = 'hour';
              break;
            case 'seconds':
            case 'S':
              interval = 'second';
              break;
        }

        if (interval === 'quarter') {
          var count = 3;
          interval = 'month';
        }

        return ticks.map(function(tick) {
          return this._advanceMiddle(tick, interval, count);
        });
      }),

      _advanceMiddle: function(time, interval, count) {
        return new Date (time = time.getTime()/2 + d3.time[interval].offset(time, count)/2);
      },

      // # the years which should be labelled
      labelledYears:  function(start, stop) {
        var years = d3.time.years(start, stop);

        // # if we have too many labelled years then we reduce to the maximum
        // # number of years labelled such that they are uniformly distributed
        // # in the range
        if (years.length > this.get('maxNumberOfLabels')) {
          var skipVal = Math.ceil(years.length / this.get('maxNumberOfLabels'));
          return d3.time.years(start, stop, skipVal);
        } else {
          return years;
        }
      },

      // # the quarters which should be labelled
      labelledQuarters: function(start, stop) {
        var quarters = d3.time.months(start, stop, 3);

        // # if we have too many quarters then we only display quarter labels
        // # on years
        if (quarters.length > this.get('maxNumberOfLabels')) {
          return this.labelledYears(start, stop);
        } else {
          return quarters;
        }
      },

      monthsBetween: function(start, stop, skip) {
        if (skip == null) {
          skip = 1;
        }
        return d3.time.months(start, stop).filter( function (d, i) { 
          return (i % skip === 0);
        });
      },

      // # the months which should be labelled
      labelledMonths: function(start, stop) {
        var months = this.monthsBetween(start, stop);

        // # if we have too many months then we reduce to the maximum number of
        // # months labelled such that they are uniformly distributed in the
        // # range
        if (months.length > this.get('maxNumberOfLabels')) {
          var skipVal = Math.ceil(months.length / this.get('maxNumberOfLabels'));
          return this.monthsBetween(start, stop, skipVal);
        } else {
          return months;
        }
      },

      weeksBetween: function(start, stop, skip) {
        if (skip == null) {
          skip = 1;
        }
        return d3.time.weeks(start, stop).filter( function(d, i) {
          return (i % skip === 0);
        });
      },

      secondsBetween: function(start, stop, skip) {
        if (skip == null) {
          skip = 1;
        }
        return d3.time.seconds(start, stop).filter(function(d, i) {
          return (i % skip === 0);
        });
      },

      // # the weeks which should be labelled
      labelledWeeks: function(start, stop) {
        var weeks = this.weeksBetween(start, stop);

        // # if we have too many weeks then we reduce to the maximum number of
        // # weeks labelled such that they are uniformly distributed in the
        // # range
        if (weeks.length > this.get('maxNumberOfLabels')) {
          var skipVal = Math.ceil(weeks.length / this.get('maxNumberOfLabels'));
          return this.weeksBetween(start, stop, skipVal);
        } else {
          return weeks;
        }
      },

      labelledDays:  function(start, stop) {
        var days = d3.time.days(start, stop);

        if (days.length > this.get('maxNumberOfLabels')) {
          var skipVal = Math.ceil(days.length / this.get('maxNumberOfLabels'));
          return d3.time.days(start, stop).filter(function(d, i) { 
            return (i % skipVal === 0);
          });
        } else {
          return days;
        }
      },

      labelledHours: function(start, stop) {
        var hours = d3.time.hours(start, stop);

        if (hours.length > this.get('maxNumberOfLabels')) {
          var skipVal = Math.ceil(hours.length / this.get('maxNumberOfLabels'));
          return d3.time.hours(start, stop).filter( function(d, i) {
            return (i % skipVal === 0);
          });
        } else {
          return hours;
        }
      },

      // # Returns the function which returns the labelled intervals between
      // # start and stop for the selected interval.
      tickLabelerFn: Ember.computed('maxNumberOfLabels', 'selectedInterval', function() {
        var _this = this;
        switch (this.get('selectedInterval')) {
          case 'years':
          case 'Y':
            return function(start, stop) {
              return _this.labelledYears(start, stop);
            };
          case 'quarters':
          case 'Q':
            return function(start, stop) {
              return _this.labelledQuarters(start, stop);
            };
          case 'months':
          case 'M':
            return function(start, stop) {
              return _this.labelledMonths(start, stop);
            };
          case 'weeks':
          case 'W':
            return function(start, stop) {
              return _this.labelledWeeks(start, stop);
            };
          case 'days':
          case 'D':
            return function(start, stop) {
              return _this.labelledDays(start, stop);
            };
          case 'hours':
          case 'H':
            return function(start, stop) {
              return _this.labelledHours(start, stop);
            };
          case 'seconds':
          case 'S':
            return function(start, stop) {
              return _this.labelledSeconds(start, stop);
            };
          default:
            return d3.time.years;
        }
      }),

      quarterFormat: function(d) {
        var month = d.getMonth() % 12;
        var prefix = "";
        if (month < 3) {
          prefix = 'Q1';
        } else if (month < 6) {
          prefix = 'Q2';
        } else if (month < 9) {
          prefix = 'Q3';
        } else {
          prefix = 'Q4';
        }
        var suffix = d3.time.format('%Y')(d);

        return (prefix + ' ' + suffix);
      },

      // # See https://github.com/mbostock/d3/wiki/Time-Formatting
      formattedTime: Ember.computed('selectedInterval', function() {
        switch (this.get('selectedInterval')) {
          case 'years':
          case 'Y':
            return d3.time.format('%Y');
          case 'quarters':
          case 'Q':
            return this.quarterFormat;
          case 'months':
          case 'M':
            return d3.time.format("%b '%y");
          case 'weeks':
          case 'W':
            return d3.time.format('%-m/%-d/%y');
          case 'days':
          case 'D':
            return d3.time.format('%a');
          case 'hours':
          case 'H':
            return d3.time.format('%H');
          case 'seconds':
          case 'S':
            return d3.time.format('%M : %S');
          default:
            return d3.time.format('%Y');
        }
      })
      
    });
  });
;define("ember-charts/mixins/has-time-series-rule", 
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Mixin.create({

      // # ----------------------------------------------------------------------
      // # HasTimeSeriesRule -- Overview
      // # ----------------------------------------------------------------------
      // # Provides mouseover interaction for time series line chart. As user
      // # moves mouse to left and right, markers are placed on the line chart.

      // # ----------------------------------------------------------------------
      // # API -- Inputs
      // #
      // # $viewport: the viewport of the chart on which the time series rule
      // # will be displayed
      // # xRange: the range of positions of the chart in the x dimension
      // # yRange: the range of positions of the chart in the y dimension
      // # xTimeScale: a mapping from time to x position
      // # hasLineData: specifies if the mixing in class has line data
      // # showDetails: function to be called on mouseing over the line marker
      // # hideDetails: function to be called on mouseing out of the line marker
      // # lineColorFn: function which returns a line color, used for fill
      // # color of markers
      // # graphicHeight: height of graphic containing lines
      // # isInteractive: specifies whether the chart is interactive
      // # ----------------------------------------------------------------------
      xRange: null,
      yRange: null,
      xTimeScale: null,
      showDetails: null,
      hideDetails: null,
      lineColorFn: null,
      graphicHeight: null,

      // # ----------------------------------------------------------------------
      // # Drawing Functions
      // # ----------------------------------------------------------------------

      updateLineMarkers: function() {
        var lineMarkers = this._getLineMarkers();
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');

        lineMarkers.enter()
          .append('path')
          .on("mouseover", function(d,i) { return showDetails(d,i,this); })
          .on("mouseout", function(d,i) { return hideDetails(d,i,this); })
          .attr({
            "class": 'line-marker',
            fill: this.get('lineColorFn'),
            d: d3.svg.symbol().size(50).type('circle') 
          });

        lineMarkers.exit().remove();

        // # Update the line marker icons with the latest position data
        lineMarkers.attr({
          transform: function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          }
        });

        lineMarkers.style({
          'stroke-width': function(d) {
            return d3.select(d.path).attr('stroke-width');
          }
        });
      },

      // # ----------------------------------------------------------------------
      // # Selections
      // # ----------------------------------------------------------------------

      // # Returns a selection containing the line markers, which binds the line
      // # marker data upon each update
      _getLineMarkers: function() {
        return this.get('viewport').selectAll('.line-marker').data(this._lineMarkerData());
      },

      // # ----------------------------------------------------------------------
      // # Event Bindings
      // # ----------------------------------------------------------------------

      // # Bind event handlers to the viewport to keep the position of line
      // # markers up to date. Responsibility for showing and hiding
      // # the lineMarkers is delegated to the chart.
      didInsertElement: function() {
        var _this = this;
        this._super();

        d3.select(this.$('svg')[0]).on('mousemove', function() {
          if (!_this.get('isInteractive')) {
            return;
          }
          // # Check if we are within the domain/range of the data
          if (_this._isEventWithinValidRange()) {
            Ember.run(_this, _this.get('updateLineMarkers'));
          }
        });
      },

      // # ----------------------------------------------------------------------
      // # Private Methods -- Data
      // # ----------------------------------------------------------------------

      // # The amount of acceptable error in the x-position of the vertical line rule,
      // # in msec. This is necessary because bisection is used to find where to place
      // # the vertical rule in time domain. The default tolerance here is one hour
      _lineMarkerTolerance: 60 * 1000,

      // # The mouse position of an event with respect to the chart viewport
      _mousePosition: function() {
        if (!d3.event) {
          return null;
        }
        return d3.mouse(this.get('$viewport'));
      },

      // # if the mouse position is within the xRange and yRange of the
      // # implementing object
      _isEventWithinValidRange: function() {
        var xRange = this.get('xRange');
        var yRange = this.get('yRange');
        var x = this._mousePosition()[0];
        var y = this._mousePosition()[1];

        var inX = d3.min(xRange) < x < d3.max(xRange);
        var inY = d3.min(yRange) < y < d3.max(yRange);
        return inX && inY;
      },

      // # To locate each marker for the given location of the rule on the x-axis
      _lineMarkerData: function() {
        var mousePosition = this._mousePosition();
        if (Ember.isEmpty(mousePosition)) {
          return [];
        }

        var invXScale = this.get('xTimeScale').invert;
        var invYScale = this.get('yScale').invert;
        var lineMarkerTolerance = this.get('_lineMarkerTolerance');

        var timeX = invXScale(mousePosition[0]);

        var markerData = [];
        this.get('viewport').selectAll('path.line').each(function(d) {
          // # Count up the number of bisections, stopping after bisecting
          // # maxIterations number of times. In case the bisection does not
          // # converge, stop after 25 iterations, which should be enough for any
          // # reasonable time range
          var iterations = 0;
          var maxIterations = 25;

          // # Perform a binary search along the length of each SVG path, calling
          // # getPointAtLength and testing where it falls relative to the position
          // # corresponding to the location of the rule
          var searchStart = 0;
          var searchEnd = this.getTotalLength();
          var searchLen = searchEnd / 2;

          var point = this.getPointAtLength(searchLen);
          while (Math.abs(timeX - invXScale(point.x)) > lineMarkerTolerance && maxIterations > ++iterations) {
            if (timeX < invXScale(point.x)) {
              searchEnd = searchLen;
            } else {
              searchStart = searchLen;
            }
            searchLen = (searchStart + searchEnd) / 2;
            point = this.getPointAtLength(searchLen);
          }

          // # Push location of the point, information that will be displayed on hover,
          // # and a reference to the line graphic that the point marks, on to a list
          // # which will be used to construct a d3 selection of each line marker
          return markerData.push({
            x: point.x,
            y: point.y,
            group: d.group,
            value: invYScale(point.y),
            time: invXScale(point.x),
            path: this
          });
        });
        return markerData;
      }

    });
  });
;define("ember-charts/components/vertical-bar-chart", 
  ["ember","ember-charts/components/chart-component","ember-charts/mixins/legend","ember-charts/mixins/floating-tooltip","ember-charts/mixins/axes","ember-charts/mixins/formattable","ember-charts/mixins/sortable-chart","ember-charts/mixins/no-margin-chart","ember-charts/utils/group-by","ember-charts/utils/label-trimmer","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var ChartComponent = __dependency2__["default"];
    var LegendMixin = __dependency3__["default"];
    var FloatingTooltipMixin = __dependency4__["default"];
    var AxesMixin = __dependency5__["default"];
    var FormattableMixin = __dependency6__["default"];
    var SortableChartMixin = __dependency7__["default"];
    var NoMarginChartMixin = __dependency8__["default"];

    var groupBy = __dependency9__.groupBy;
    var LabelTrimmer = __dependency10__["default"];

    __exports__["default"] = ChartComponent.extend(LegendMixin, FloatingTooltipMixin, AxesMixin,
      FormattableMixin, SortableChartMixin, NoMarginChartMixin, {

      classNames: ['chart-vertical-bar'],

      // ----------------------------------------------------------------------------
      // Vertical Bar Chart Options
      // ----------------------------------------------------------------------------

      // Data without group will be merged into a group with this name
      ungroupedSeriesName: 'Other',

      // If stackBars is yes then it stacks bars, otherwise it groups them
      // horizontally. Stacking discards negative data.
      // TODO(nick): make stacked bars deal gracefully with negative data
      stackBars: false,

      // Space between bars, as fraction of bar size
      withinGroupPadding: 0,

      // Space between bar groups, as fraction of group size
      betweenGroupPadding: Ember.computed('numBars', function() {
        // Use padding to make sure bars have a maximum thickness.
        //
        // TODO(tony): Use exact padding + bar width calculation
        // We have some set amount of bewtween group padding we use depending
        // on the number of bars there are in the chart. Really, what we would want
        // to do is have the equation for bar width based on padding and use that
        // to set the padding exactly.
        var scale = d3.scale.linear().domain([1,8]).range([1.25,0.25]).clamp(true);
        return scale(this.get('numBars'));
      }),

      numBars: Ember.computed('xBetweenGroupDomain', 'xWithinGroupDomain', function() {
        return this.get('xBetweenGroupDomain.length') * this.get('xWithinGroupDomain.length') || 0;
      }), 

      // Space allocated for rotated labels on the bottom of the chart. If labels
      // are rotated, they will be extended beyond labelHeight up to maxLabelHeight
      maxLabelHeight: 50,

      // ----------------------------------------------------------------------------
      // Data
      // ----------------------------------------------------------------------------

      // Aggregates objects provided in `data` in a dictionary, keyed by group names
      groupedData: Ember.computed('sortedData', 'stackBars', 'ungroupedSeriesName', function() {
        var data = this.get('sortedData');
        if (Ember.isEmpty(data)) {
        	return [];
       	}

        var _this = this;
        data = groupBy(data, function(d) { 
          return (d.group || _this.get('ungroupedSeriesName'));
        });

        // After grouping, the data points may be out of order, and therefore not properly
        // matched with their value and color. Here, we resort to ensure proper order.
        // This could potentially be addressed with a refactor where sorting happens after
        // grouping across the board.
        // TODO(ember-charts-lodash): Use _.mapValues instead of the each loop.
        _.each(_.keys(data), function(groupName) {
          data[groupName] = _.sortBy( data[groupName], 'label');
        });

        return data;
      }),

      groupNames: Ember.computed('groupedData', function() {
        return _.keys( this.get('groupedData'));
      }),

      // We know the data is grouped because it has more than one label. If there
      // are no labels on the data then every data object will have
      // 'ungroupedSeriesName' as its group name and the number of group
      // labels will be 1. If we are passed ungrouped data we will display
      // each data object in its own group.
      isGrouped: Ember.computed('groupNames.length', function() {
        var result = (this.get('groupNames.length') > 1);
        return result;
      }),

      finishedData: Ember.computed('groupedData', 'isGrouped', 'stackBars', 'sortedData', function() {
        var y0, stackedValues;
        if (this.get('isGrouped')) {
          if (Ember.isEmpty( this.get('groupedData'))) {
            return [];
          }

          return _.map( this.get('groupedData'), function(values, groupName) {
            y0 = 0;
            stackedValues = _.map( values, function(d) {
              return {
                y0: y0,
                y1: y0 += Math.max(d.value, 0),
                value: d.value,
                group: d.group,
                label: d.label,
                color: d.color
              };
            });

            return {
              group: groupName,
              values: values,
              stackedValues: stackedValues,
              totalValue: y0
            };
          });

        } else if (this.get('stackBars')) {
          if (Ember.isEmpty(this.get('data'))) {
            return [];
          }
          // If we do not have grouped data and are drawing stacked bars, keep the
          // data in one group so it gets stacked
          y0 = 0;
          stackedValues = _.map( this.get('data'), function(d) {
            return {
              y0: y0,
              y1: y0 += Math.max(d.value, 0)
            };
          });
          
          return [{
            group: this.get('data.firstObject.group'),
            values: this.get('data'),
            stackedValues: stackedValues,
            totalValue: y0
          }];

        } else {

          if (Ember.isEmpty(this.get('data'))) {
            return [];
          }
          // If we have grouped data and do not have stackBars turned on, split the
          // data up so it gets drawn in separate groups and labeled
          return _.map( this.get('sortedData'), function(d) {
            return {
              group: d.label,
              values: [d]
            };
          });
        }
      // TODO(tony): Need to have stacked bars as a dependency here and the
      // calculation be outside of this
      }),

      // ----------------------------------------------------------------------------
      // Layout
      // ----------------------------------------------------------------------------

      labelHeightOffset: Ember.computed('_shouldRotateLabels', 'maxLabelHeight', 'labelHeight',
        'labelPadding', function() {

        var labelSize = this.get('_shouldRotateLabels') ? this.get('maxLabelHeight') : this.get('labelHeight');
        return labelSize + this.get('labelPadding');
      }),

      legendChartPadding: Ember.computed.alias('labelHeightOffset'),

      // Chart Graphic Dimensions
      graphicLeft: Ember.computed.alias('labelWidthOffset'),

      graphicWidth: Ember.computed('width', 'labelWidthOffset', function() {
         return this.get('width') - this.get('labelWidthOffset');
      }), 

      graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
        return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
      }),

      // ----------------------------------------------------------------------------
      // Ticks and Scales
      // ----------------------------------------------------------------------------

      // Vertical position/length of each bar and its value
      yDomain: Ember.computed('finishedData', 'stackBars', function() {
        var finishedData = this.get('finishedData');
        var minOfGroups = d3.min(finishedData, function(d) {
          return _.min( d.values.map( function(dd) { 
            return dd.value; 
          }));
        });

        var maxOfGroups = d3.max(finishedData, function(d) {
          return _.max(d.values.map(function(dd) { 
            return dd.value; 
          }));
        });

        var maxOfStacks = d3.max(finishedData, function(d) { 
          return d.totalValue;
        });

        // minOfStacks is always zero since we do not compute negative stacks
        // TODO(nick): make stacked bars deal gracefully with negative data
        var minOfStacks = d3.min(finishedData, function() { return 0; });

        var min, max;
        if (this.get('stackBars')) {
          min = minOfStacks;
          max = maxOfStacks;
        } else {
          min = minOfGroups;
          max = maxOfGroups;
        }

        // force one end of the range to include zero
        if (min > 0) {
          return [0, max];
        }
        if (max < 0) {
          return [min, 0];
        }
        if (min === 0 && max === 0) {
          return [0, 1];
        } else {
          return [min, max];
        }
      }),

      yScale: Ember.computed('graphicTop', 'graphicHeight', 'yDomain', 'numYTicks', function() {
        return d3.scale.linear()
          .domain(this.get('yDomain'))
          .range([ this.get('graphicTop') + this.get('graphicHeight'), this.get('graphicTop') ])
          .nice(this.get('numYTicks'));
      }), 

      individualBarLabels: Ember.computed('groupedData.@each', function() {

        var groups = _.map(_.values(this.get('groupedData')), function(g) {
          return _.pluck(g, 'label');
        });
        return _.uniq( _.flatten(groups));
      }), 

      // The range of labels assigned to each group
      xBetweenGroupDomain: Ember.computed.alias('groupNames'),
      // xBetweenGroupDomain: [],

      // The range of labels assigned within each group
      xWithinGroupDomain: Ember.computed.alias('individualBarLabels'),

      // The space in pixels allocated to each group
      groupWidth: Ember.computed('xBetweenGroupScale', function() {
        return this.get('xBetweenGroupScale').rangeBand();
      }),

      // The space in pixels allocated to each bar
      barWidth: Ember.computed('xWithinGroupScale', function() {
        return this.get('xWithinGroupScale').rangeBand();
      }),

      // The scale used to position bars within each group
      // If we do not have grouped data, use the withinGroupPadding around group
      // data since we will have constructed groups for each bar.
      xWithinGroupScale: Ember.computed('isGrouped', 'stackBars', 'xWithinGroupDomain', 'groupWidth',
        'withinGroupPadding', 'betweenGroupPadding', function() {

        if (this.get('isGrouped') || this.get('stackBars')) {
          return d3.scale.ordinal()
            .domain(this.get('xWithinGroupDomain'))
            .rangeRoundBands( [0, this.get('groupWidth')], this.get('withinGroupPadding')/2, 0);

        } else {
          return d3.scale.ordinal()
            .domain(this.get('xWithinGroupDomain'))
            .rangeRoundBands([ 0, this.get('groupWidth') ],
              this.get('betweenGroupPadding')/2, this.get('betweenGroupPadding')/2 );
        }
      }),

      // The scale used to position each group and label across the horizontal axis
      // If we do not have grouped data, do not add additional padding around groups
      // since this will only add whitespace to the left/right of the graph.
      xBetweenGroupScale: Ember.computed('isGrouped', 'stackBars', 'graphicWidth', 'labelWidth',
        'xBetweenGroupDomain', 'betweenGroupPadding', function() {

        // var labelWidth = this.get('labelWidth');
        var betweenGroupPadding;

        if (this.get('isGrouped') || this.get('stackBars')) {
          betweenGroupPadding = this.get('betweenGroupPadding');
        } else {
          betweenGroupPadding = 0;
        }

        return d3.scale.ordinal()
          .domain(this.get('xBetweenGroupDomain'))
          .rangeRoundBands([0, this.get('graphicWidth')], betweenGroupPadding / 2, betweenGroupPadding / 2);
      
      }),

      // Override axis mix-in min and max values to listen to the scale's domain
      minAxisValue: Ember.computed('yScale', function() {
        var yScale = this.get('yScale');
        return yScale.domain()[0];
      }), 

      maxAxisValue: Ember.computed('yScale', function() {
        var yScale = this.get('yScale');
        return yScale.domain()[1];
      }),

      // ----------------------------------------------------------------------------
      // Color Configuration
      // ----------------------------------------------------------------------------

      numColorSeries: Ember.computed.alias('individualBarLabels.length'),

      // ----------------------------------------------------------------------------
      // Legend Configuration
      // ----------------------------------------------------------------------------

      hasLegend: Ember.computed('stackBars', 'isGrouped', 'legendItems.length', 'showLegend', function() {
        return this.get('stackBars') || this.get('isGrouped') && this.get('legendItems.length') > 1 && this.get('showLegend');
      }), 

      legendItems: Ember.computed('individualBarLabels', 'getSeriesColor', function() {
        var getSeriesColor = this.get('getSeriesColor');
        return this.get('individualBarLabels').map( function(d, i) {
          var color = getSeriesColor(d, i);
          return {
            label: d,
            fill: color,
            stroke: color,
            icon: function() { 
              return 'square';
            },
            selector: ".grouping-" + i
          };
        });
      }), 

      // ----------------------------------------------------------------------------
      // Tooltip Configuration
      // ----------------------------------------------------------------------------

      showDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }
        var _this = this;
        return function(data, i, element) {

          // Specify whether we are on an individual bar or group
          var isGroup = Ember.isArray(data.values);

          // Do hover detail style stuff here
          element = isGroup ? element.parentNode.parentNode : element;
          d3.select(element).classed('hovered', true);

          // Show tooltip
          var content =  (data.group) ? "<span class=\"tip-label\">" + data.group + "</span>" : '';

          var formatLabel = _this.get('formatLabelFunction');
          var addValueLine = function(d) {
            content +="<span class=\"name\">" + d.label + ": </span>";
            return content += "<span class=\"value\">" + formatLabel(d.value) + "</span><br/>";
          };

          if (isGroup) {
            // Display all bar details if hovering over axis group label
            data.values.forEach(addValueLine);
          } else {
            // Just hovering over single bar
            addValueLine(data);
          }
          return _this.showTooltip(content, d3.event);
        };
      }),

      hideDetails: Ember.computed('isInteractive', function() {
        if (!this.get('isInteractive')) {
          return Ember.K;
        }
        var _this = this;
        return function(data, i, element) {
          // if we exited the group label undo for the group
          if (Ember.isArray(data.values)) {
            element = element.parentNode.parentNode;
          }
          // Undo hover style stuff
          d3.select(element).classed('hovered', false);

          // Hide Tooltip
          return _this.hideTooltip();
        };
      }),


      // ----------------------------------------------------------------------------
      // Styles
      // ----------------------------------------------------------------------------

      groupAttrs: Ember.computed('graphicLeft', 'graphicTop', 'xBetweenGroupScale', function() {
        var xBetweenGroupScale = this.get('xBetweenGroupScale');
        var _this = this;
        return {
          transform: function(d) {
            var dx = xBetweenGroupScale(d.group) ? _this.get('graphicLeft') + xBetweenGroupScale(d.group) : _this.get('graphicLeft');
            var dy = _this.get('graphicTop');
            
            return "translate(" + dx + ", " + dy + ")";
          }
        };
      }),

      stackedBarAttrs: Ember.computed('yScale', 'groupWidth', function() {
        // zeroDisplacement is the number of pixels to shift graphics away from
        // the origin line so that they do not overlap with it
        var zeroDisplacement = 1;
        var yScale = this.get('yScale');
        var _this = this;
        return {
          "class": function(d,i) { return "grouping-" + i; },
          'stroke-width': 0,
          width: function() { return _this.get('groupWidth'); },
          x: null,
          y: function(d) { return yScale(d.y1) + zeroDisplacement; },
          height: function(d) { return (yScale(d.y0) - yScale(d.y1)); }
        };
      }),

      groupedBarAttrs: Ember.computed('yScale', 'getSeriesColor', 'barWidth', 'xWithinGroupScale', function() {
        var zeroDisplacement = 1;
        var yScale = this.get('yScale');
        var _this = this;
        return {
          "class": function(d,i) { return "grouping-" + i; },
          'stroke-width': 0,
          width: function() { return _this.get('barWidth'); },
          x: function (d) { return _this.get('xWithinGroupScale')(d.label); },
          height: function (d) { return Math.max(0, Math.abs( yScale(d.value) - yScale(0) ) - zeroDisplacement); },
          y: function(d) {
            if (d.value > 0) {
              return yScale(d.value);
            } else {
              return (yScale(0) + zeroDisplacement);
            }
          }
        };
      }),

      labelAttrs: Ember.computed('barWidth', 'isGrouped', 'stackBars', 'groupWidth',
        'xWithinGroupScale', 'graphicTop', 'graphicHeight', 'labelPadding', function() {

        var _this = this;
        return {
          'stroke-width': 0,
          transform: function (d) {
            var dx = _this.get('barWidth')/2;
            if (_this.get('isGrouped') || _this.get('stackBars')) {
              dx += _this.get('groupWidth')/2 - _this.get('barWidth')/2;
            } else {
              dx += _this.get('xWithinGroupScale')(d.group);
            }
            var dy = _this.get('graphicTop') + _this.get('graphicHeight') + _this.get('labelPadding');
            return "translate(" + dx +", " + dy + ")";
          }
        };
      }),

      // ----------------------------------------------------------------------------
      // Selections
      // ----------------------------------------------------------------------------

      groups: Ember.computed(function() {
        return this.get('viewport').selectAll('.bars').data(this.get('finishedData'));
      })["volatile"](),

      yAxis: Ember.computed(function() {
        var yAxis = this.get('viewport').select('.y.axis');
        if (yAxis.empty()) {
          return this.get('viewport')
            .insert('g', ':first-child')
            .attr('class', 'y axis');
        } else {
          return yAxis;
        }
      })["volatile"](),

      // ----------------------------------------------------------------------------
      // Label Layout
      // ----------------------------------------------------------------------------

      // Space available for labels that are horizontally displayed. This is either
      // the unpadded group width or bar width depending on whether data is grouped
      maxLabelWidth: Ember.computed('isGrouped', 'stackBars', 'groupWidth', 'barWidth', function() {
        if (this.get('isGrouped') || this.get('stackBars')) {
          return this.get('groupWidth');
        } else {
          return this.get('barWidth');
        }
      }),

      _shouldRotateLabels: false,

      setRotateLabels: function() {
        var labels, maxLabelWidth, rotateLabels;
        labels = this.get('groups').select('.groupLabel text');
        maxLabelWidth = this.get('maxLabelWidth');
        rotateLabels = false;
        if (this.get('rotatedLabelLength') > maxLabelWidth) {
          labels.each(function() {
            if (this.getBBox().width > maxLabelWidth) {
              return rotateLabels = true;
            }
          });
        }
        return this.set('_shouldRotateLabels', rotateLabels);
      },

      // Calculate the number of degrees to rotate labels based on how widely labels
      // will be spaced, but never rotate the labels less than 20 degrees
      rotateLabelDegrees: Ember.computed('labelHeight', 'maxLabelWidth', function() {
        var radians = Math.atan( this.get('labelHeight') / this.get('maxLabelWidth'));
        var degrees = radians * 180 / Math.PI;
        return Math.max(degrees, 20);
      }),

      rotatedLabelLength: Ember.computed('maxLabelHeight', 'rotateLabelDegrees', function() {
        var rotateLabelRadians = Math.PI / 180 * this.get('rotateLabelDegrees');
        return Math.abs( this.get('maxLabelHeight') / Math.sin(rotateLabelRadians));
      }),

      // ----------------------------------------------------------------------------
      // Drawing Functions
      // ----------------------------------------------------------------------------

      renderVars: ['xWithinGroupScale', 'xBetweenGroupScale', 'yScale',
        'finishedData', 'getSeriesColor'],

      drawChart: function() {
        this.updateData();
        this.updateLayout();
        this.updateAxes();
        this.updateGraphic();
        if (this.get('hasLegend')) {
          return this.drawLegend();
        } else {
          return this.clearLegend();
        }
      },

      updateData: function() {
        var groups = this.get('groups');
        var showDetails = this.get('showDetails');
        var hideDetails = this.get('hideDetails');

        var entering = groups.enter()
          .append('g').attr('class', 'bars');
        entering.append('g').attr('class', 'groupLabel')
          .append('text')
          .on("mouseover", function(d,i) { return showDetails(d,i,this); })
          .on("mouseout", function(d,i) { return hideDetails(d,i,this); });
        groups.exit().remove();

        var subdata;
        if (this.get('stackBars')) {
          subdata = function(d) { return d.stackedValues; };
        } else {
          subdata = function(d) { return d.values; };
        }

        var bars = groups.selectAll('rect').data(subdata);
        bars.enter().append('rect')
          .on("mouseover", function(d,i) { return showDetails(d,i,this); })
          .on("mouseout", function(d,i) { return hideDetails(d,i,this); });
        return bars.exit().remove();
      },

      updateLayout: function() {
        var groups = this.get('groups');
        var labels = groups.select('.groupLabel text')
          .attr('transform', null) // remove any previous rotation attrs
          .text( function(d) { return d.group; });

        // If there is enough space horizontally, center labels underneath each
        // group. Otherwise, rotate each label and anchor it at the top of its
        // first character.
        this.setRotateLabels();
        var _this = this;
        var labelTrimmer;

        if (this.get('_shouldRotateLabels')) {
          var rotateLabelDegrees = this.get('rotateLabelDegrees');
          labelTrimmer = LabelTrimmer.create({
            getLabelSize: function () { return _this.get('rotatedLabelLength'); },
            getLabelText: function (d) { return d.group; }
          });

          return labels.call(labelTrimmer.get('trim')).attr({
            'text-anchor': 'end',
            transform: "rotate(" + (-rotateLabelDegrees) + ")",
            dy: function() { return this.getBBox().height; }
          });

        } else {
          var maxLabelWidth = this.get('maxLabelWidth');
          labelTrimmer = LabelTrimmer.create({
            getLabelSize: function () { return maxLabelWidth; },
            getLabelText: function (d) { return (d.group != null) ? d.group : ''; }
          });

          return labels.call(labelTrimmer.get('trim')).attr({
            'text-anchor': 'middle',
            dy: this.get('labelPadding')
          });
        }
      },

      updateAxes: function() {
        
        //tickSize isn't doing anything here, it should take two arguments
        var yAxis = d3.svg.axis()
          .scale(this.get('yScale'))
          .orient('right')
          .ticks(this.get('numYTicks'))
          .tickSize(this.get('graphicWidth'))
          .tickFormat(this.get('formatValueAxis'));

        var gYAxis = this.get('yAxis');

        // find the correct size of graphicLeft in order to fit the Labels perfectly
        this.set('graphicLeft', this.maxLabelLength( gYAxis.selectAll('text')) + this.get('labelPadding') );


        var graphicTop = this.get('graphicTop');
        var graphicLeft = this.get('graphicLeft');
        gYAxis.attr({ transform: "translate(" + graphicLeft + ", " + graphicTop + ")" })
          .call(yAxis);

        gYAxis.selectAll('g')
          .filter(function(d) { return (d !== 0); })
          .classed('major', false)
          .classed('minor', true);

        return gYAxis.selectAll('text')
          .style('text-anchor', 'end')
          .attr({
            x: -this.get('labelPadding')
          });
      },

      updateGraphic: function() {
        var groups = this.get('groups');

        var barAttrs = this.get('stackBars') ? this.get('stackedBarAttrs') : this.get('groupedBarAttrs');

        groups.attr( this.get('groupAttrs') );
        groups.selectAll('rect')
          .attr(barAttrs)
          .style('fill', this.get('getSeriesColor'));
        return groups.select('g.groupLabel')
          .attr(this.get('labelAttrs') );
      }

    });
  });
;define("ember-charts/templates/components/chart-component", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = Ember.HTMLBars.template((function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          dom.setNamespace("http://www.w3.org/2000/svg");
          var el1 = dom.createElement("svg");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("g");
          dom.setAttribute(el2,"class","chart-viewport");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, attribute = hooks.attribute;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [0]);
          var element1 = dom.childAt(element0, [1]);
          var attrMorph0 = dom.createAttrMorph(element0, 'width');
          var attrMorph1 = dom.createAttrMorph(element0, 'height');
          var attrMorph2 = dom.createAttrMorph(element1, 'transform');
          attribute(env, attrMorph0, element0, "width", get(env, context, "outerWidth"));
          attribute(env, attrMorph1, element0, "height", get(env, context, "outerHeight"));
          attribute(env, attrMorph2, element1, "transform", get(env, context, "transformViewport"));
          return fragment;
        }
      };
    }()));
  });
;define('ember', ['exports'], function(__exports__) {
  __exports__['default'] = window.Ember;
});

window.Ember.Charts = Ember.Namespace.create();
window.Ember.AddeparMixins = {};
window.Ember.TEMPLATES['components/chart-component'] = require('ember-charts/templates/components/chart-component')['default'];
window.Ember.Charts.BubbleChartComponent = require('ember-charts/components/bubble-chart')['default'];
window.Ember.Charts.ChartComponent = require('ember-charts/components/chart-component')['default'];
window.Ember.Charts.HorizontalBarComponent = require('ember-charts/components/horizontal-bar-component')['default'];
window.Ember.Charts.PieChartComponent = require('ember-charts/components/pie-chart')['default'];
window.Ember.Charts.ScatterChartComponent = require('ember-charts/components/scatter-chart')['default'];
window.Ember.Charts.TimeSeriesChartComponent = require('ember-charts/components/time-series-chart')['default'];
window.Ember.Charts.VerticalBarChartComponent = require('ember-charts/components/vertical-bar-chart')['default'];
window.Ember.AxesMixin = require('ember-charts/mixins/axes')['default'];
window.Ember.ColorableMixin = require('ember-charts/mixins/colorable')['default'];
window.Ember.FloatingTooltipMixin = require('ember-charts/mixins/floating-tooltip')['default'];
window.Ember.HasTimeSeriesRuleMixin = require('ember-charts/mixins/has-time-series-rule')['default'];
window.Ember.LegendMixin = require('ember-charts/mixins/legend')['default'];
window.Ember.NoMarginChartMixin = require('ember-charts/mixins/no-margin-chart')['default'];
window.Ember.PieLegendMixin = require('ember-charts/mixins/pie-legend')['default'];
window.Ember.ResizeHandlerMixin = require('ember-charts/mixins/resize-handler')['default'];
window.Ember.SortableChartMixin = require('ember-charts/mixins/sortable-chart')['default'];
window.Ember.TimeSeriesLabelerMixin = require('ember-charts/mixins/time-series-labeler')['default'];
Ember.onLoad('Ember.Application', function(Application) {
Application.initializer({
name: 'ember-charts',
initialize: function(container) {
container.register('component:bubble-chart', require('ember-charts/components/bubble-chart')['default']);
container.register('component:chart-component', require('ember-charts/components/chart-component')['default']);
container.register('component:horizontal-bar-component', require('ember-charts/components/horizontal-bar-component')['default']);
container.register('component:pie-chart', require('ember-charts/components/pie-chart')['default']);
container.register('component:scatter-chart', require('ember-charts/components/scatter-chart')['default']);
container.register('component:time-series-chart', require('ember-charts/components/time-series-chart')['default']);
container.register('component:vertical-bar-chart', require('ember-charts/components/vertical-bar-chart')['default']);
}
});
});
Ember.Charts.ChartsComponent.reopen({
layoutName: 'components/ember-charts'
});
Ember.Handlebars.helper('table-component', Ember.Charts.ChartsComponent);})();