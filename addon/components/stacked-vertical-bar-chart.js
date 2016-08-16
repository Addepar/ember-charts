import Ember from 'ember';
import ChartComponent from './chart-component';
import LegendMixin from '../mixins/legend';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import AxesMixin from '../mixins/axes';
import FormattableMixin from '../mixins/formattable';
import NoMarginChartMixin from '../mixins/no-margin-chart';
import AxisTitlesMixin from '../mixins/axis-titles';
import LabelTrimmer from '../utils/label-trimmer';

/**
 * Base class for stacked vertical bar chart components.
 *
 * Supersedes the deprecated functionality of VerticalBarChartComponent
 * with stackBars: true.
 *
 * FIXME (SBC): here and in documentation.hbs:
 *  1. Remove withinGroupPadding
 *  2. s/betweenGroupPadding/withinGroupPadding/g
 */
const StackedVerticalBarChartComponent = ChartComponent.extend(LegendMixin,
  FloatingTooltipMixin, AxesMixin, FormattableMixin, NoMarginChartMixin,
  AxisTitlesMixin, {

  classNames: ['chart-vertical-bar', 'chart-stacked-vertical-bar'],

  // ----------------------------------------------------------------------------
  // Stacked Vertical Bar Chart Options
  // ----------------------------------------------------------------------------

  // The smallest slices will be combined into an "Other" slice until no slice
  // is smaller than minSlicePercent.
  minSlicePercent: 2,

  // Data without group will be merged into a group with this name
  ungroupedSeriesName: 'Other',

  // The maximum number of slices. If the number of slices is greater
  // than this then the smallest slices will be combined into an "other"
  // slice until there are at most maxNumberOfSlices.
  maxNumberOfSlices: 4,

  // If there are more slice labels than maxNumberOfSlices,
  otherSliceLabel: 'Other',

  // Width of slice outline, in pixels
  strokeWidth: 1,

  // Space between bars, as fraction of bar size
  betweenBarPadding: Ember.computed('numSlices', function() {
    // Use padding to make sure bars have a maximum thickness.
    var scale = d3.scale.linear().domain([1, 8]).range([1.25, 0.25]).clamp(true);
    return scale(this.get('numSlices'));
  }),

  numSlices: Ember.computed('barNames.length', 'allSliceLabels.length', function() {
    return this.get('barNames.length') * this.get('allSliceLabels.length') || 0;
  }),

  // Space allocated for rotated labels on the bottom of the chart. If labels
  // are rotated, they will be extended beyond labelHeight up to maxLabelHeight
  maxLabelHeight: 50,

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  dataGroupedByBar: Ember.computed('ungroupedSeriesName', 'data.[]', function() {
    var ungroupedSeriesName = this.get('ungroupedSeriesName');
    return _.groupBy(this.get('data'), (slice) => {
      return slice.barLabel || ungroupedSeriesName;
    });
  }),

  dataGroupedBySlice: Ember.computed('data.[]', function() {
    return _.groupBy(this.get('data'), 'sliceLabel');
  }),

  // Maps the label for each bar to the total (gross) value of each bar
  barValues: Ember.computed('dataGroupedByBar', function() {
    var dataGroupedByBar = this.get('dataGroupedByBar');
    return _.map(dataGroupedByBar, (barData, barLabel) => {
      var barValue = barData.reduce((sum, slice) => {
        return sum + Math.abs(slice.value);
      }, 0);
      return { barLabel: barLabel, value: barValue };
    })
  }),

  largestSliceData: Ember.computed('dataGroupedByBar', 'barValues', function() {
    var dataGroupedBySlice, largestSlice, largestBarValue;
    dataGroupedBySlice = this.get('dataGroupedBySlice');
    largestBarValue = _.max(_.pluck(this.get('barValues'), 'value'));
    return _.map(dataGroupedBySlice, (sliceTypeData, sliceLabel) => {
      largestSlice = _.max(sliceTypeData, (slice) => {
        return Math.abs(slice.value);
      });
      return {
        sliceLabel: sliceLabel,
        largestSliceValue: largestSlice.value,
        percentOfBar: Math.abs((largestSlice.value / largestBarValue) * 100)
      };
    });
  }),

  // The sliceLabels that will be explicitly shown in the chart and not
  // aggregated into the 'Other' slice.
  nonOtherSliceTypes: Ember.computed('minSlicePercent', 'maxNumberOfSlices', 'largestSliceData.[]', function() {
    var minSlicePercent, maxNumberOfSlices, largestSliceData, nonOtherSlices,
      numOtherSlices;
    minSlicePercent = this.get('minSlicePercent');
    maxNumberOfSlices = this.get('maxNumberOfSlices');
    largestSliceData = this.get('largestSliceData');

    // Filter out any slice labels that do not meet the minSlicePercent req.
    nonOtherSlices = _.filter(largestSliceData, (sliceData) => {
      return sliceData.percentOfBar >= minSlicePercent;
    });

    // Sort by slice value and take the biggest (N - 1) slices, where N is the
    // max number we can display. This saves one slice for Other.
    nonOtherSlices = _.takeRight(_.sortBy(nonOtherSlices, 'largestSliceValue'), maxNumberOfSlices - 1);

    // If only one slice will exist in 'Other', we can just display it instead
    // of 'Other'. Otherwise, just return the filtered labels.
    numOtherSlices = largestSliceData.length - nonOtherSlices.length;
    if (numOtherSlices <= 1) {
      return _.pluck(largestSliceData, 'sliceLabel');
    } else {
      return _.pluck(nonOtherSlices, 'sliceLabel');
    }
  }),

  otherSliceTypes: Ember.computed('largestSliceData.[]', 'nonOtherSliceTypes.[]', function() {
    var allSliceTypes = _.pluck(this.get('largestSliceData'), 'sliceLabel');
    return _.difference(allSliceTypes, this.get('nonOtherSliceTypes'));
  }),

  dataGroupedByBarWithOther: Ember.computed('dataGroupedByBar', 'otherSliceLabel', 'nonOtherSliceTypes.[]', function() {
    var groupedData, nonOtherSliceTypes, otherSliceLabel;
    groupedData = this.get('dataGroupedByBar');
    nonOtherSliceTypes = this.get('nonOtherSliceTypes');
    otherSliceLabel = this.get('otherSliceLabel');
    return _.reduce(groupedData, (result, barData, barLabel) => {
      var newBarData, otherSlice;
      newBarData = [];
      otherSlice = { barLabel: barLabel,
                     sliceLabel: otherSliceLabel,
                     value: 0 };
      barData.forEach((slice) => {
        if (nonOtherSliceTypes.indexOf(slice.sliceLabel) !== -1) {
          newBarData.push(slice);
        } else {
          otherSlice.value += slice.value;
        }
      });
      if (otherSlice.value !== 0) {
        newBarData.push(otherSlice);
      }
      result[barLabel] = newBarData;
      return result;
    }, {});
  }),

  barNames: Ember.computed('barValues', '_barSortingFn', function() {
    return _.pluck(_.sortBy(this.get('barValues'), this.get('_barSortingFn')), 'barLabel');
  }),

  // Data grouped by bar with all slices sorted correctly in each bar
  sortedData: Ember.computed('dataGroupedByBarWithOther', function() {
    var groupedData = this.get('dataGroupedByBarWithOther');
    return _.reduce(groupedData, (result, barData, barLabel) => {
      result[barLabel] = this.sortSlices(barData);
      return result;
    }, {});
  }),

  finishedData: Ember.computed('sortedData', 'otherSliceLabel', function() {
    var posTop, negBottom, stackedValues, otherSliceLabel;
    otherSliceLabel = this.get('otherSliceLabel');
    return _.map(this.get('sortedData'), (values, barLabel) => {
      posTop = 0;
      negBottom = 0;
      stackedValues = _.map(values, function(d) {
        var yMin, yMax;
        if (d.value < 0) {
          yMax = negBottom;
          negBottom += d.value;
          yMin = negBottom;
        } else {
          yMin = posTop;
          posTop += d.value;
          yMax = posTop;
        }
        return {
          yMin: yMin,
          yMax: yMax,
          value: d.value,
          barLabel: d.barLabel,
          sliceLabel: d.sliceLabel,
          color: d.color
        };
      });

      return {
        barLabel: barLabel,
        values: values,
        stackedValues: stackedValues,
        max: posTop,
        min: negBottom
      };
    });
  }),

  // ----------------------------------------------------------------------------
  // Slice and Bar Sorting
  // ----------------------------------------------------------------------------

  largestNetValueBar: Ember.computed('dataGroupedByBarWithOther', function() {
    return _.max(this.get('dataGroupedByBarWithOther'), (barData) => {
      return _.reduce(barData, (p, slice) => {
        return p + slice.value;
      }, 0);
    });
  }),

  // Slice sort order is determined in a 2-step process:
  // * First, take the bar with the largest NET value. For all slices in this
  //   bar, sort them by absolute value, descending.
  // * For all remaining slices that are not in the largest net value bar, sort
  //   according to the `sortRemainingSlices` function. By default, this sorts
  //   alphabetically. It can be overridden to change this behavior.
  sliceSortOrder: Ember.computed('largestNetValueBar', 'allSliceLabels.[]', function() {
    var sortedSlices, remainingSlices, sliceSortingFn, otherSliceLabel, otherLabelIndex;
    otherSliceLabel = this.get('otherSliceLabel');
    sliceSortingFn = this.get('sliceSortingFn');
    // Sort all slices in the largest bar by absolute value
    sortedSlices = _.pluck(_.sortBy(this.get('largestNetValueBar'), (slice) => {
      return -(Math.abs(slice.value));
    }), 'sliceLabel');
    // Find remaining slices that were not in largest bar, sort them using the
    // defined slice sorting function, and append them to the largest bar slices
    remainingSlices = _.difference(this.get('allSliceLabels'), sortedSlices);
    sortedSlices = sortedSlices.concat(_.sortBy(remainingSlices, sliceSortingFn));
    // Lastly, pluck the Other slice (if it exists) and push to end.
    otherLabelIndex = sortedSlices.indexOf(otherSliceLabel);
    if (otherLabelIndex !== -1) {
      sortedSlices.push(sortedSlices.splice(otherLabelIndex, 1));
    }
    return sortedSlices;
  }),

  // This is the default sorting function for slices that are not displayed
  // in the largest bar. This can be overridden to change how slice sorting
  // works for remaining slices in a given application.
  sliceSortingFn: function(sliceLabel) { return sliceLabel; },

  // Takes a set of slices and sorts them using the sliceSortOrder.
  sortSlices: function(slices) {
    var slicesByLabel = _.reduce(slices, (result, slice) => {
      result[slice.sliceLabel] = slice;
      return result;
    }, {});
    var sortOrder = this.get('sliceSortOrder');
    return sortOrder.map((sliceLabel) => {
      return slicesByLabel[sliceLabel];
    }).filter((slice) => {
      return slice;
    });
  },

  // Can either be 'asc', 'desc', or 'custom'
  barSortingOrder: 'desc',

  barSortingFn: function(barData) { return barData.barLabel; },

  _barSortingFn: Ember.computed('barSortingFn', 'barSortingOrder', function() {
    switch (this.get('barSortingOrder')) {
      case 'asc':
        return (barData) => { return barData.value; };
      case 'desc':
        return (barData) => { return -barData.value; };
      case 'custom':
        return this.get('barSortingFn');
    }
  }),


  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  labelHeightOffset: Ember.computed('_shouldRotateLabels', 'maxLabelHeight', 'labelHeight', 'labelPadding', function() {
    var labelSize;

    if (this.get('_shouldRotateLabels')) {
      labelSize = this.get('maxLabelHeight');
    } else {
      labelSize = this.get('labelHeight');
    }
    return labelSize + this.get('labelPadding');
  }),

  // Chart Graphic Dimensions
  graphicLeft: Ember.computed.alias('labelWidthOffset'),

  graphicWidth: Ember.computed('width', 'labelWidthOffset', function() {
     return this.get('width') - this.get('labelWidthOffset');
  }),

  graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
    return this.get('height') - this.get('legendHeight') -
      this.get('legendChartPadding');
  }),

  // ---------------------------------------------------------------------------
  // Ticks and Scales
  // ---------------------------------------------------------------------------

  // Vertical position/length of each bar and its value
  yDomain: Ember.computed('finishedData', function() {
    var finishedData = this.get('finishedData');

    var max = d3.max(finishedData, function(d) {
      return d.max;
    });

    var min = d3.min(finishedData, function(d) {
      return d.min;
    });

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
      .range([ this.get('graphicTop') + this.get('graphicHeight'),
               this.get('graphicTop') ])
      .nice(this.get('numYTicks'));
  }),

  allSliceLabels: Ember.computed('otherSliceTypes.[]', 'nonOtherSliceTypes.[]', 'otherSliceLabel', function() {
    var result, otherSliceTypes, nonOtherSliceTypes;
    otherSliceTypes = this.get('otherSliceTypes');
    nonOtherSliceTypes = this.get('nonOtherSliceTypes');
    result = _.clone(nonOtherSliceTypes);
    if (otherSliceTypes.length < 2) {
      result.concat(otherSliceTypes);
    } else {
      result.push(this.get('otherSliceLabel'));
    }
    return result;
  }),

  labelIDMapping: Ember.computed('allSliceLabels.[]', function() {
    var allSliceLabels = this.get('allSliceLabels');
    return _.zipObject(allSliceLabels, _.range(allSliceLabels.length));
  }),

  // The space in pixels allocated to each bar
  barWidth: Ember.computed('xBetweenBarScale', function() {
    return this.get('xBetweenBarScale').rangeBand();
  }),

  // The scale used to position each bar and label across the horizontal axis
  xBetweenBarScale: Ember.computed('graphicWidth', 'barNames', 'betweenBarPadding', function() {
    var betweenBarPadding = this.get('betweenBarPadding');

    return d3.scale.ordinal()
      .domain(this.get('barNames'))
      .rangeRoundBands([0, this.get('graphicWidth')],
                       betweenBarPadding / 2,
                       betweenBarPadding / 2);
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

  numColorSeries: Ember.computed.alias('allSliceLabels.length'),

  sliceColors: Ember.computed('allSliceLabels.[]', 'getSeriesColor', function() {
    var fnGetSeriesColor = this.get('getSeriesColor');
    var result = {};
    this.get('allSliceLabels').forEach(function(label, iLabel) {
      result[label] = fnGetSeriesColor(label, iLabel);
    });
    return result;
  }),

  fnGetSliceColor: Ember.computed('sliceColors.[]', 'getSeriesColor', function() {
    var sliceColors = this.get('sliceColors');
    var fnGetSeriesColor = this.get('getSeriesColor');

    return function(d, i) {
      if (d.sliceLabel && sliceColors[d.sliceLabel]) {
        return sliceColors[d.sliceLabel];
      } else {
        return fnGetSeriesColor(d, i);
      }
    };
  }),

  // ----------------------------------------------------------------------------
  // Legend Configuration
  // ----------------------------------------------------------------------------

  hasLegend: true,

  legendItems: Ember.computed('allSliceLabels.[]', 'sliceColors', 'labelIDMapping.[]', function() {
    var sliceColors = this.get('sliceColors');
    return this.get('allSliceLabels').map((label) => {
      var color = sliceColors[label];
      return {
        label: label,
        fill: color,
        stroke: color,
        icon: () => 'square',
        selector: ".grouping-" + this.get('labelIDMapping')[label]
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

    return (data, i, element) => {
      // Specify whether we are on an individual bar or group
      var isGroup = Ember.isArray(data.values);

      // Do hover detail style stuff here
      element = isGroup ? element.parentNode.parentNode : element;
      d3.select(element).classed('hovered', true);

      // Show tooltip
      var content = '';
      if (data.barLabel) {
        content = "<span class=\"tip-label\">" + data.barLabel + "</span>";
      }

      var formatLabel = this.get('formatLabelFunction');
      var addValueLine = function(d) {
        content += "<span class=\"name\">" + d.sliceLabel + ": </span>" +
          "<span class=\"value\">" + formatLabel(d.value) + "</span><br/>";
      };

      if (isGroup) {
        // Display all bar details if hovering over axis group label
        data.values.forEach(addValueLine);
      } else {
        // Just hovering over single bar
        addValueLine(data);
      }
      return this.showTooltip(content, d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      // if we exited the group label undo for the group
      if (Ember.isArray(data.values)) {
        element = element.parentNode.parentNode;
      }
      // Undo hover style stuff
      d3.select(element).classed('hovered', false);

      // Hide Tooltip
      return this.hideTooltip();
    };
  }),


  // ----------------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------------

  barAttrs: Ember.computed('graphicLeft', 'graphicTop', 'xBetweenBarScale', function() {
    var xBetweenBarScale = this.get('xBetweenBarScale');

    return {
      transform: (d) => {
        var dx =  this.get('graphicLeft');
        if (xBetweenBarScale(d.barLabel)) {
          dx += xBetweenBarScale(d.barLabel);
        }
        var dy = this.get('graphicTop');

        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  sliceAttrs: Ember.computed('yScale', 'barWidth', 'labelIDMapping.[]', 'strokeWidth', function() {
    var yScale, zeroDisplacement;
    zeroDisplacement = 1;
    yScale = this.get('yScale');
    return {
      "class": (slice) => {
        var id = this.get('labelIDMapping')[slice.sliceLabel];
        return "grouping-" + id;
      },
      'stroke-width': this.get('strokeWidth').toString()+'px',
      width: () => this.get('barWidth'),
      x: null,
      y: function(slice) {
        return yScale(slice.yMax) + zeroDisplacement;
      },
      height: function(slice) {
        return yScale(slice.yMin) - yScale(slice.yMax);
      }
    };
  }),

  labelAttrs: Ember.computed('barWidth', 'graphicTop', 'graphicHeight', 'labelPadding', function() {
    return {
      'stroke-width': 0,
      transform: () => {
        var dx = this.get('barWidth') / 2;
        var dy = this.get('graphicTop') + this.get('graphicHeight') +
          this.get('labelPadding');
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  // ---------------------------------------------------------------------------
  // Selections
  // ---------------------------------------------------------------------------

  bars: Ember.computed(function() {
    return this.get('viewport')
               .selectAll('.bars')
               .data(this.get('finishedData'));
  }).volatile(),

  yAxis: Ember.computed(function() {
    var yAxis = this.get('viewport').select('.y.axis');
    if (yAxis.empty()) {
      return this.get('viewport')
        .insert('g', ':first-child')
        .attr('class', 'y axis');
    } else {
      return yAxis;
    }
  }).volatile(),

  // ---------------------------------------------------------------------------
  // Label Layout
  // ---------------------------------------------------------------------------

  // Space available for labels that are horizontally displayed.
  maxLabelWidth: Ember.computed.readOnly('barWidth'),

  _shouldRotateLabels: false,

  setRotateLabels: function() {
    var labels, maxLabelWidth, rotateLabels;
    labels = this.get('bars').select('.groupLabel text');
    maxLabelWidth = this.get('maxLabelWidth');
    rotateLabels = false;
    if (this.get('rotatedLabelLength') > maxLabelWidth) {
      labels.each(function() {
        if (this.getBBox().width > maxLabelWidth) {
          rotateLabels = true;
          return;
        }
      });
    }
    return this.set('_shouldRotateLabels', rotateLabels);
  },

  // Calculate the number of degrees to rotate labels based on how widely labels
  // will be spaced, but never rotate the labels less than 20 degrees
  rotateLabelDegrees: Ember.computed('labelHeight', 'maxLabelWidth', function() {
    var radians = Math.atan(this.get('labelHeight') / this.get('maxLabelWidth'));
    var degrees = radians * 180 / Math.PI;
    return Math.max(degrees, 20);
  }),

  rotatedLabelLength: Ember.computed('maxLabelHeight', 'rotateLabelDegrees', function() {
    var rotateLabelRadians = Math.PI / 180 * this.get('rotateLabelDegrees');
    return Math.abs(this.get('maxLabelHeight') / Math.sin(rotateLabelRadians));
  }),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  renderVars: [
    'xBetweenBarScale',
    'yScale',
    'finishedData',
    'getSeriesColor',
    'xValueDisplayName',
    'yValueDisplayName',
    'hasAxisTitles', // backward compatibility support.
    'hasXAxisTitle',
    'hasYAxisTitle',
    'xTitleHorizontalOffset',
    'yTitleVerticalOffset',
    'strokeWidth'
  ],

  drawChart: function() {
    this.updateData();
    this.updateLayout();
    this.updateAxes();
    this.updateGraphic();
    this.updateAxisTitles();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },

  updateData: function() {
    var bars = this.get('bars');
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');

    var entering = bars.enter()
      .append('g').attr('class', 'bars');
    entering.append('g').attr('class', 'groupLabel')
      .append('text')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    bars.exit().remove();

    var subdata = function(d) { return d.stackedValues; };

    var slices = bars.selectAll('rect').data(subdata);
    slices.enter().append('rect')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    return slices.exit().remove();
  },

  updateLayout: function() {
    var bars = this.get('bars');
    var labels = bars.select('.groupLabel text')
      .attr('transform', null) // remove any previous rotation attrs
      .text(function(d) { return d.barLabel; });

    // If there is enough space horizontally, center labels underneath each
    // group. Otherwise, rotate each label and anchor it at the top of its
    // first character.
    this.setRotateLabels();
    var labelTrimmer;

    if (this.get('_shouldRotateLabels')) {
      var rotateLabelDegrees = this.get('rotateLabelDegrees');
      labelTrimmer = LabelTrimmer.create({
        getLabelSize: () => this.get('rotatedLabelLength'),
        getLabelText: (d) => d.barLabel
      });

      return labels.call(labelTrimmer.get('trim')).attr({
        'text-anchor': 'end',
        transform: "rotate(" + (-rotateLabelDegrees) + ")",
        dy: function() { return this.getBBox().height; }
      });

    } else {
      var maxLabelWidth = this.get('maxLabelWidth');
      labelTrimmer = LabelTrimmer.create({
        getLabelSize: () => maxLabelWidth,
        getLabelText: (d) => d.barLabel != null ? d.barLabel : ''
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
    this.set('graphicLeft',
      this.maxLabelLength(gYAxis.selectAll('text')) + this.get('labelPadding'));


    var graphicTop = this.get('graphicTop');
    var graphicLeft = this.get('graphicLeft');
    gYAxis.attr({
        transform: "translate(" + graphicLeft + ", " + graphicTop + ")"
      }).call(yAxis);

    gYAxis.selectAll('g')
      .filter(function(d) { return d !== 0; })
      .classed('major', false)
      .classed('minor', true);

    gYAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr({
        x: -this.get('labelPadding')
      });
  },

  updateGraphic: function() {
    var bars = this.get('bars');
    var sliceAttrs = this.get('sliceAttrs');

    bars.attr(this.get('barAttrs'));
    bars.selectAll('rect')
      .attr(sliceAttrs)
      .style('fill', this.get('fnGetSliceColor'));
    return bars.select('g.groupLabel')
      .attr(this.get('labelAttrs') );
  }
});

export default StackedVerticalBarChartComponent;
