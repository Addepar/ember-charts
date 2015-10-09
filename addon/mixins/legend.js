import Ember from 'ember';
import LabelTrimmer from '../utils/label-trimmer';
export default Ember.Mixin.create({

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
  // if you want to override default legend behavior, override showLegend
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
    return this.get('legendItemWidth') - this.get('legendIconRadius') - this.get('legendLabelPadding') * 2;
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
        return _.isFunction(d.fill) ? d.fill(d, i) : d.fill;
      },
      stroke: function(d, i) {
        return _.isFunction(d.stroke) ? d.stroke(d, i) : d.stroke;
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
  }).volatile(),

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
          .text(function(d) { return d.label; })
          .attr(this.get('legendLabelAttrs'))
          .call(labelTrimmer.get('trim'));

    var totalLabelWidth = 0;
    legend.selectAll('text').each(function() {
      return totalLabelWidth += this.getComputedTextLength();
    });
    return this.set('averageLegendLabelWidth', totalLabelWidth / this.get('legendItems.length'));
  }
});
