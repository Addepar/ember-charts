import Ember from 'ember';
import ResizeHandlerMixin from '../mixins/resize-handler';
import ColorableMixin from '../mixins/colorable';

export default Ember.Component.extend(ColorableMixin, ResizeHandlerMixin, {
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
