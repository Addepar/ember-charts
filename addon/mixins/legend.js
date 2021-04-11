import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import Ember from 'ember';
import * as d3 from 'd3';
import { isFunction, sortBy } from 'lodash-es';
import LabelTrimmer from '../utils/label-trimmer';

// Calculates maximum width of label in a row, before it gets truncated by label trimmer.
// If labelWidth < average width per label (totalAvailableWidthForLabels/label count), then do not truncate
// Else if labelWidth > average, then truncate it to average
var calcMaxLabelWidth = function(labelWidthsArray, totalAvailableWidthForLabels) {
  // Default the max label width to average width of an item
  var maxLabelWidth = totalAvailableWidthForLabels / labelWidthsArray.length;

  // Sort label widths to exclude all the short labels during iteration
  labelWidthsArray = sortBy(labelWidthsArray);
  for (var i = 0; i < labelWidthsArray.length; i++) {
    var curLabelWidth = labelWidthsArray[i];
    if (curLabelWidth < maxLabelWidth) {
      // If the label is shorter than the max labelWidth, then it shouldn't be truncated
      // and hence subtract short labels from remaining totalAvailableWidthForLabels.
      totalAvailableWidthForLabels -= curLabelWidth;
      // Distribute the remaining width equally in remaining labels and set that as max.
      var remainingLabelCount = labelWidthsArray.length - (i + 1);
      maxLabelWidth = totalAvailableWidthForLabels / remainingLabelCount;
    }
  }
  return maxLabelWidth;
};

// Select labels of current row (startIdx, endIdx) and truncate if greater than labelWidth
var truncateLabels = function(labels, startIdx, endIdx, labelWidth) {
  var labelTrimmer = LabelTrimmer.create({
    getLabelSize: function() {
      return labelWidth;
    }
  });
  // Select labels from current row and apply label trimmer
  labels.filter(function(data, idx) {
    return (idx >= startIdx && idx < endIdx);
  }).call(labelTrimmer.get('trim'));
};

// Select legendItems of current row (startIdx, endIdx) and calculate total row width
var calcLegendRowWidth = function(legendItems, startIdx, endIdx, legendLabelPadding) {
  var rowWidth = 0;
  legendItems.filter(function(data, idx) {
    return (idx >= startIdx && idx < endIdx);
  }).each(function(val, col) {
    if (col === 0) {
      rowWidth = 0;
    } else {
      rowWidth += 2 * legendLabelPadding;
    }
    rowWidth += this.getBBox().width;
  });
  return rowWidth;
};

export default Mixin.create({

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

  willDestroyElement: function() {
    if(this._hasMouseEventListeners) {
      let legend = this.get('legend');
      let legendItems = legend.selectAll('.legend-item');
      legendItems.on('mouseover', null);
      legendItems.on('mouseout', null);
    }
    this._super(...arguments);
  },

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------


  // Outside bounds of legend
  legendWidth: alias('width'),

  legendHeight: computed('numLegendRows', 'legendItemHeight', function() {
    return this.get('numLegendRows') * this.get('legendItemHeight');
  }),

  // Bottom margin is equal to the total amount of space the legend needs,
  _marginBottom: computed('legendHeight', 'hasLegend', 'marginTop', function() {
    // If the legend is enabled then we need some extra breathing room
    return this.get('hasLegend') ? this.get('legendHeight') : this.get('marginBottom');
  }),

  marginBottom: computed('_marginBottom', 'minimumTopBottomMargin', function() {
    return Math.max(this.get('_marginBottom'), this.get('minimumTopBottomMargin'));
  }),

  // Dynamically calculate the size of each legend item
  legendItemWidth: computed('legendWidth', 'minLegendItemWidth', 'maxLegendItemWidth',
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

  // Dynamically calculate the number of legend items in each row.
  // This is only an approximate value to estimate the maximum required space for legends
  numLegendItemsPerRow: computed('legendWidth', 'legendItemWidth', function() {
    // There's always at least 1 legend item per row
    return Math.max(Math.floor(this.get('legendWidth') / this.get('legendItemWidth')), 1);
  }),

  // Dynamically calculate the number of rows needed
  // This is only an approximate value to estimate the maximum required space for legends
  numLegendRows: computed('legendItems.length', 'numLegendItemsPerRow', function() {
    return Math.ceil(this.get('legendItems.length') / this.get('numLegendItemsPerRow'));
  }),

  // Maximum width of each label before it gets truncated
  legendLabelWidth: computed('legendItemWidth', 'legendIconRadius', 'legendLabelPadding', function() {
    return this.get('legendItemWidth') - this.get('legendIconRadius') - this.get('legendLabelPadding') * 2;
  }),

  // legendRowWidths is used to estimate how much to move the
  // labels to make them seem roughly centered
  // legendRowWidths is set every time legends are redrawn
  legendRowWidths: [],

  // numLegendItemsByRows is used to track how many legend rows will be added
  // and how many items are placed in each row
  numLegendItemsByRows: [],

  // ----------------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------------

  // Space between legend and chart (need to account for label size and perhaps
  // more). Charts will usually override this because there may be other things
  // below the chart graphic like an axis or labels or axis title.
  legendChartPadding: 0,

  // Center the legend beneath the chart. Since the legend is inside the chart
  // viewport, which has already been positioned with regards to margins,
  // only consider the height of the chart.
  legendAttrs: computed('outerWidth', 'graphicBottom', 'legendTopPadding', 'legendChartPadding', function() {
    var dx, dy, offsetToLegend;
    dx = this.get('width') / 2;
    offsetToLegend = this.get('legendChartPadding') + this.get('legendTopPadding');
    dy = this.get('graphicBottom') + offsetToLegend;
    return {
      transform: "translate(" + dx + ", " + dy + ")"
    };
  }),

  // Place each legend item such that the legend rows appear centered to the graph.
  // Spacing between legend items must be constant and equal to 2*legendLabelPadding = 20px.
  legendItemAttrs: computed('legendItemWidth', 'legendItemHeight', 'legendIconRadius',
     'legendLabelPadding', 'legendRowWidths', 'numLegendItemsByRows', function() {

    var legendRowWidths = this.get('legendRowWidths');
    var legendItemWidth = this.get('legendItemWidth');
    var legendItemHeight = this.get('legendItemHeight');
    var legendLabelPadding = this.get('legendLabelPadding');
    var legendIconRadius = this.get('legendIconRadius');
    var numLegendItemsByRows = this.get('numLegendItemsByRows');

    // Track the space already alloted to a legend.
    // This is used to translate the next legend in the row.
    var usedWidth = 0;
    return {
      "class": 'legend-item',
      width: legendItemWidth,
      'stroke-width': 0,
      transform: function(d, col) {
        // Compute the assigned row and column for the current legend
        var row = 0;
        while (col >= numLegendItemsByRows[row]) {
          col -= numLegendItemsByRows[row];
          ++row;
        }

        // If first item in the row, set usedWidth as 0.
        if (col === 0) {
          usedWidth = 0;
        }
        // Shifting the legend by "width of current legend row"/2 to the left and adding the used space
        // Adding legend icon radius because center is off by that much in our legend layout
        var dx = -legendRowWidths[row] / 2 + usedWidth + legendIconRadius;
        var dy = row * legendItemHeight + legendItemHeight / 2;

        // Add 2*legendLabelPadding between items before putting the next legend
        usedWidth += this.getBBox().width + 2 * legendLabelPadding;
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  legendIconAttrs: computed('legendIconRadius', function() {
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
        return isFunction(d.fill) ? d.fill(d, i) : d.fill;
      },
      stroke: function(d, i) {
        return isFunction(d.stroke) ? d.stroke(d, i) : d.stroke;
      },
      'stroke-width': function(d) {
        if (!d.width) {
          return 1.5;
        }
        if (isFunction(d.width)) {
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

  legendLabelAttrs: computed('legendIconRadius', 'legendLabelPadding', function() {
    return {
      x: this.get('legendIconRadius')/2 + this.get('legendLabelPadding'),
      y: '.35em'
    };
  }),

  // ----------------------------------------------------------------------------
  // Tooltip Configuration
  // ----------------------------------------------------------------------------

  showLegendDetails: computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    var _this = this;
    return function(data, i, element) {
      d3.select(element).classed('hovered', true);
      if (data.selector) {
        _this.get('viewport').selectAll(data.selector).classed('hovered', true);
      }

      var content = $("<span />");
      content.append($("<span class=\"tip-label\">").text(data.label));
      if (!isNone(data.xValue)) {
        var formatXValue = _this.get('formatXValue');
        content.append($('<span class="name" />').text(_this.get('tooltipXValueDisplayName') + ': '));
        content.append($('<span class="value" />').text(formatXValue(data.xValue)));
        if (!isNone(data.yValue)) {
          content.append('<br />');
        }
      }
      if (!isNone(data.yValue)) {
        var formatYValue = _this.get('formatYValue');
        content.append($('<span class="name" />').text(_this.get('tooltipYValueDisplayName') + ': '));
        content.append($('<span class="value" />').text(formatYValue(data.yValue)));
      }

      _this.showTooltip(content.html(), d3.event);
    };
  }),

  hideLegendDetails: computed('isInteractive', function() {
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

  legend: computed(function() {
    var legend = this.get('viewport').select('.legend-container');
    if (legend.empty()) {
      return this.get('viewport').append('g').attr('class', 'legend-container');
    } else {
      return legend;
    }
  }).volatile(),

  // Create a list of all the legend Items, icon for each legend item and corresponding labels
  // Calculate the number of legend item rows and items in each. Each time width should be bounded by min and max legend item width.
  // Calculate the label width for each legend row that minimizes truncation.
  // And then apply legendItemAttrs to apply posisioning transforms.
  // Legend layout => A legend item consists of an Icon and a label. Icon is always positioned centered at 0px within item.
  // Line icon width is 2*legendIconRadius, where other shapes are usually legendIconRadius px in width.
  // Icon is followed by label that is positioned at (legendIconRadius/2 + legendLabelPadding) px. This adds some padding between icon and label.
  // Finally we add a padding of (2*legendLabelPadding) px before next label
  drawLegend: function() {
    if (!this.get('showLegend')) {
      return;
    }
    this.clearLegend();
    var legend = this.get('legend');
    legend.attr(this.get('legendAttrs'));

    var showLegendDetails = this.get('showLegendDetails');
    var hideLegendDetails = this.get('hideLegendDetails');
    this._hasMouseEventListeners = true;
    var legendItems =
      legend.selectAll('.legend-item')
            .data(this.get('legendItems'))
            .enter()
            .append('g')
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

    var legendLabelWidths = [];
    var labels = legendItems.append('text')
          .style('text-anchor', 'start')
          .text(function(d) { return d.label; })
          .attr(this.get('legendLabelAttrs'))
          .each(function() {
            legendLabelWidths.push(this.getComputedTextLength());
          });

    var minLegendItemWidth = this.get('minLegendItemWidth');
    var maxLegendItemWidth = this.get('maxLegendItemWidth');
    var legendLabelPadding = this.get('legendLabelPadding');

    var numLegendItemsByRows = [0];
    var rowNum = 0;
    var legendWidth = this.get('legendWidth');
    var availableLegendWidth = legendWidth;

    // Calculate number of legend rows and number of items per row.
    legendItems.each(function() {
      // Calculate the current legend width with upper bound as maxLegendItemWidth
      var itemWidth = Math.min(this.getBBox().width, maxLegendItemWidth);
      // Remove padding space from available width if this is additional item in the row
      if (numLegendItemsByRows[rowNum] > 0) {
        availableLegendWidth -= (2 * legendLabelPadding);
      }

      // If available width is more than the minimum required width or the actual legend width, then add it to current row.
      if (availableLegendWidth >= minLegendItemWidth || availableLegendWidth >= itemWidth) {
        numLegendItemsByRows[rowNum]++;
      } else {
        ++rowNum;
        numLegendItemsByRows[rowNum] = 1;
        availableLegendWidth = legendWidth;
      }
      // Max width allotted for this legend must be minimum of availableLegendWidth or item width.
      availableLegendWidth -= Math.min(availableLegendWidth, itemWidth);
    });
    this.set('numLegendItemsByRows', numLegendItemsByRows);

    var startIdxCurrentRow = 0;
    var legendRowWidths = []; // Capture the width of each legend row
    var iconRadius = this.get('legendIconRadius');
    var iconToLabelPadding = iconRadius / 2 + legendLabelPadding;
    var legendItemPadding = 2 * legendLabelPadding;

    // Perform label truncation for legend items in each row.
    for (rowNum = 0; rowNum < numLegendItemsByRows.length; rowNum++) {
      var curRowItemCount = numLegendItemsByRows[rowNum];
      var totalAvailableWidthForLabels = legendWidth - // Total width of a legend row available in the chart
                                curRowItemCount * (iconRadius + iconToLabelPadding) - // Subtract width of each icon and it's padding
                                (curRowItemCount - 1) * legendItemPadding; // Subtract width of all padding between items

      // For current row, pick the label widths and caculate max allowed label width before truncation.
      var labelWidthsForCurRow = legendLabelWidths.splice(0, curRowItemCount);
      var maxLabelWidth = calcMaxLabelWidth(labelWidthsForCurRow, totalAvailableWidthForLabels);
      truncateLabels(labels, startIdxCurrentRow, startIdxCurrentRow + curRowItemCount, maxLabelWidth);

      // After label trimming, calculate the final width of the current legend row.
      // This will be used by legenItemAttrs transform method to position the row in the center.
      legendRowWidths[rowNum] = calcLegendRowWidth(legendItems, startIdxCurrentRow,
                                startIdxCurrentRow + curRowItemCount,
                                legendLabelPadding);
      startIdxCurrentRow += numLegendItemsByRows[rowNum];
    }
    this.set('legendRowWidths', legendRowWidths);

    // Assign the legend item attrs and apply transformation
    legendItems.attr(this.get('legendItemAttrs'));
    return this;
  }
});
