import Ember from 'ember';
import ChartComponent from './chart-component';
import LegendMixin from '../mixins/legend';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import AxesMixin from '../mixins/axes';
import FormattableMixin from '../mixins/formattable';
import NoMarginChartMixin from '../mixins/no-margin-chart';
import SortableChartMixin from '../mixins/sortable-chart';
import AxisTitlesMixin from '../mixins/axis-titles';
import LabelTrimmer from '../utils/label-trimmer';

/**
 * Base class for stacked vertical bar chart components.
 *
 * Supersedes the deprecated functionality of VerticalBarChartComponent
 * with stackBars: true.
 * @class
 * @augments ChartComponent
 */
const StackedVerticalBarChartComponent = ChartComponent.extend(LegendMixin,
  FloatingTooltipMixin, AxesMixin, FormattableMixin, NoMarginChartMixin,
  AxisTitlesMixin, SortableChartMixin, {

  classNames: ['chart-vertical-bar', 'chart-stacked-vertical-bar'],

  // ---------------------------------------------------------------------------
  // Stacked Vertical Bar Chart Options
  // ---------------------------------------------------------------------------

  /**
   * The smallest slices will be combined into an 'Other' slice until no slice
   * is smaller than minSlicePercent.
   * @type {number}
   */
  minSlicePercent: 2,

  /**
   * Data without a barLabel will be merged into a bar with this name
   * @type {string}
   */
  ungroupedSeriesName: 'Other',

  /**
   * The maximum number of slices. If the number of slices is greater
   * than this, the smallest slices will be combined into an 'Other' slice until
   * there are at most maxNumberOfSlices (including the 'Other' slice).
   * @type {number}
   */
  maxNumberOfSlices: 10,

  /**
   * If there are more slice labels than maxNumberOfSlices and/or if there are
   * slice types that do not meet the `minSlicePercent`, the smallest slices
   * will be aggregated into an 'Other' slice. This property defines the label
   * for this aggregate slice.
   * @type {string}
   */
  otherSliceLabel: 'Other',

  /**
   * Width of slice outline, in pixels
   * @type {number}
   */
  strokeWidth: 1,

  /**
   * Space between bars, as fraction of bar size
   * @type {number}
   */
  betweenBarPadding: Ember.computed('numSlices', function() {
    // Use padding to make sure bars have a maximum thickness.
    var scale = d3.scale.linear().domain([1, 8]).range([1.25, 0.25]).clamp(true);
    return scale(this.get('numSlices'));
  }),

  /**
   * Number of unique slice types in the chart (ie, number of legend items)
   * @type {number}
   */
  numSlices: Ember.computed('barNames.length', 'allSliceLabels.length', function() {
    return this.get('barNames.length') * this.get('allSliceLabels.length') || 0;
  }),

  /**
   * Space allocated for rotated labels on the bottom of the chart. If labels
   * are rotated, they will be extended beyond labelHeight up to maxLabelHeight
   * @type {number}
   */
  maxLabelHeight: 50,

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  /**
   * Input data mapped by barLabel. Any data without a barLabel will be
   * aggregated into the bar labelled by `ungroupedSeriesName`.
   * Key: barLabel
   * Value: Array of slice objects (sliceLabel, barLabel, value)
   * @type {Object.<string, Array.<Object>>}
   */
  dataGroupedByBar: Ember.computed('ungroupedSeriesName', 'data.[]', function() {
    var ungroupedSeriesName = this.get('ungroupedSeriesName');
    return _.groupBy(this.get('data'), (slice) => {
      return slice.barLabel || ungroupedSeriesName;
    });
  }),

  originalBarOrder: Ember.computed('data.[]', function() {
    var barOrder = [];
    this.get('data').forEach(datum => {
      if (barOrder.indexOf(datum.barLabel) === -1) {
        barOrder.push(datum.barLabel);
      }
    });
    return barOrder;
  }),

  /**
   * Input data mapped by sliceLabel.
   * Key: sliceLabel
   * Value: Array of slice objects (sliceLabel, barLabel, value)
   * @type {Object.<string, Array.<Object>>}
   */
  dataGroupedBySlice: Ember.computed('data.[]', function() {
    return _.groupBy(this.get('data'), 'sliceLabel');
  }),

  /**
   * The gross value of the largest bar (ie, largest difference between top
   * and bottom of any bar in the chart).
   * Used to determine whether a given slice meets the minSlicePercent threshold
   * as a percentage of this largest bar.
   * @type {number}
   */
  largestGrossBarValue: Ember.computed('dataGroupedByBar', function() {
    var grossBarValues = _.map(this.get('dataGroupedByBar'), (barData) => {
      return barData.reduce((sum, slice) => {
        return sum + Math.abs(slice.value);
      }, 0);
    });
    return _.max(grossBarValues);
  }),


  /**
   * The label and largest slice data for each unique slice label.
   * Finds the largest slice (by absolute value) for each slice label and then
   * calculates the percentage of the largest gross value bar for these
   * largest slices. Used to determine which slices get aggregated into the
   * 'Other' slice in `nonOtherSliceTypes`.
   * @type {Array.<Object>}
   */
  largestSliceData: Ember.computed('dataGroupedBySlice', 'largestGrossBarValue', function() {
    var dataGroupedBySlice, largestSlice, largestBarValue, largestSliceData;
    dataGroupedBySlice = this.get('dataGroupedBySlice');
    largestBarValue = this.get('largestGrossBarValue');
    largestSliceData = _.map(dataGroupedBySlice, (sliceTypeData, sliceLabel) => {
      largestSlice = _.max(sliceTypeData, (slice) => {
        return Math.abs(slice.value);
      });
      return {
        sliceLabel: sliceLabel,
        percentOfBar: Math.abs((largestSlice.value / largestBarValue) * 100)
      };
    });
    return largestSliceData.filter((sliceData) => {
      return !(isNaN(sliceData.percentOfBar) || sliceData.percentOfBar === 0);
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
    nonOtherSlices = _.takeRight(_.sortBy(nonOtherSlices, 'percentOfBar'), maxNumberOfSlices - 1);

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

  sortedData: Ember.computed('dataGroupedByBarWithOther', 'sliceSortingFn', 'otherSliceLabel', function() {
    var groupedData, otherSliceLabel, sortedSlices;
    groupedData = this.get('dataGroupedByBarWithOther');
    otherSliceLabel = this.get('otherSliceLabel');
    return _.reduce(groupedData, (result, barData, barLabel) => {
      sortedSlices = _.clone(barData).sort(this.get('sliceSortingFn'));
      for (var i = 0; i < sortedSlices.length; i++) {
        if (sortedSlices[i].sliceLabel === otherSliceLabel) {
          sortedSlices.push(sortedSlices.splice(i, 1)[0]);
          break;
        }
      }
      result[barLabel] = sortedSlices;
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

  defaultCompareFn: function(label1, label2) {
    if (label1 < label2) {
      return -1;
    } else if (label1 > label2) {
      return 1;
    } else {
      return 0;
    }
  },

  sliceSortKey: 'value',

  sliceOrderByValue: Ember.computed('netBarValues.[]', 'dataGroupedByBarWithOther', function() {
    var sortedBars, sliceOrder, slicesInBar, allSlices;
    allSlices = this.get('dataGroupedByBarWithOther');
    sortedBars = _.sortBy(this.get('netBarValues'), 'value').reverse();
    sliceOrder = [];
    sortedBars.forEach(bar => {
      slicesInBar = _.sortBy(allSlices[bar.barLabel], slice => {
        return -Math.abs(slice.value);
      });
      slicesInBar.forEach(slice => {
        if (sliceOrder.indexOf(slice.sliceLabel) === -1) {
          sliceOrder.push(slice.sliceLabel);
        }
      });
    });
    return sliceOrder;
  }),

  valueSliceSortingFn: Ember.computed('sliceOrderByValue.[]', function() {
    var sliceOrder = this.get('sliceOrderByValue');
    return (slice1, slice2) => {
      return this.defaultCompareFn(sliceOrder.indexOf(slice1.sliceLabel),
                                   sliceOrder.indexOf(slice2.sliceLabel));
    };
  }),

  customSliceSortingFn: Ember.computed(function() {
    return (slice1, slice2) => {
      return this.defaultCompareFn(slice1.sliceLabel, slice2.sliceLabel);
    };
  }),

  sliceSortingFn: Ember.computed('valueSliceSortingFn', 'customSliceSortingFn', 'sliceSortKey', function() {
    var sliceSortKey = this.get('sliceSortKey');
    if (sliceSortKey === 'value') {
      return this.get('valueSliceSortingFn');
    } else if (sliceSortKey === 'custom') {
      return this.get('customSliceSortingFn');
    } else if (sliceSortKey === 'original') {
      return () => {};
    } else {
      throw new Error("Invalid sliceSortKey");
    }
  }),

  barSortKey: Ember.computed.alias('sortKey'),

  /**
   * Array containing an object for each bar. These objects contain the barLabel
   * and net value for each bar. Used for bar sorting in `barNames`.
   * @type {Array.<Object>}
   */
  netBarValues: Ember.computed('dataGroupedByBar', function() {
    var dataGroupedByBar = this.get('dataGroupedByBar');
    return _.map(dataGroupedByBar, (barData, barLabel) => {
      var barValue = barData.reduce((sum, slice) => {
        return sum + slice.value;
      }, 0);
      return { barLabel: barLabel, value: barValue };
    });
  }),

  barNames: Ember.computed('netBarValues', 'barSortingFn', 'sortAscending', function() {
    var sortedBars, sortedBarNames;
    sortedBars = this.get('netBarValues').sort(this.get('barSortingFn'));
    sortedBarNames = _.pluck(sortedBars, 'barLabel');
    if (!this.get('sortAscending')) {
      sortedBarNames.reverse();
    }
    return sortedBarNames;
  }),

  // This function is used to compare bar data (NOT bar labels)
  // in order to sort the bars of the chart.
  //
  customBarSortingFn: Ember.computed(function() {
    return (barData1, barData2) => {
      return this.defaultCompareFn(barData1.barLabel, barData2.barLabel);
    };
  }),

  valueBarSortingFn: Ember.computed(function() {
    return (barData1, barData2) => {
      return this.defaultCompareFn(barData1.value, barData2.value);
    };
  }),

  originalOrderSortingFn: Ember.computed('originalBarOrder.[]', function() {
    var originalOrder = this.get('originalBarOrder');
    return (barData1, barData2) => {
      return this.defaultCompareFn(originalOrder.indexOf(barData1.barLabel),
                                   originalOrder.indexOf(barData2.barLabel));
    };
  }),

  barSortingFn: Ember.computed('valueBarSortingFn', 'customBarSortingFn', 'originalOrderSortingFn', 'barSortKey', function() {
    var barSortKey = this.get('barSortKey');
    if (barSortKey === 'value') {
      return this.get('valueBarSortingFn');
    } else if (barSortKey === 'custom') {
      return this.get('customBarSortingFn');
    } else if (barSortKey === 'original') {
      return this.get('originalOrderSortingFn');
    } else {
      throw new Error("Invalid barSortKey");
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
      var content = $('<span />');
      if (data.barLabel) {
        content.append($('<span class="tip-label" />').text(data.barLabel));
      }

      var formatLabel = this.get('formatLabelFunction');
      var addValueLine = function(d) {
        var label = $('<span class="name" />').text(d.sliceLabel + ": ");
        content.append(label);
        var value = $('<span class="value" />').text(formatLabel(d.value));
        content.append(value);
        // TODO (michaelr; SBC): the <br /> was dropped by accident
        // from the regular vertical-bar-chart.js on the parent branch Addepar;
        // it needs to be added back to that file after merging to/from Addepar
        content.append('<br />');
      };

      if (isGroup) {
        // Display all bar details if hovering over axis group label
        data.values.forEach(addValueLine);
      } else {
        // Just hovering over single bar
        addValueLine(data);
      }
      return this.showTooltip(content.html(), d3.event);
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

    gYAxis.selectAll('g')
      .filter(function(d) { return d === 0; })
      .classed('major', true);

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
