import { isArray } from '@ember/array';
import { alias, readOnly } from '@ember/object/computed';
import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Ember from 'ember';
import * as d3 from 'd3';
import {
  clone,
  difference,
  filter,
  groupBy,
  map,
  max,
  maxBy,
  range,
  reduce,
  sortBy,
  takeRight,
  zipObject
} from 'lodash-es';
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
 * @class
 * @augments ChartComponent
 */
const StackedVerticalBarChartComponent = ChartComponent.extend(LegendMixin,
  FloatingTooltipMixin, AxesMixin, FormattableMixin, NoMarginChartMixin,
  AxisTitlesMixin, {

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
   * Default space between bars, as a fraction of bar size. This can be
   * overridden to be any value between 0 and 1.
   * If not overridden, the default padding here is calculated as a function of
   * the number of bars in the chart. More bars results in a smaller padding
   * ratio, and vice versa. The range values (0.625, 0.125) result in padding
   * values that copies the default padding settings in unstacked
   * VerticalBarChartComponent, and were chosen to create a good default look
   * for any chart, regardless of how many bars it contains.
   *
   * NOTE:
   * If you DO NOT want the betweenBarPadding to dynamically change based
   * on number of slices, this should be overridden to some fixed number between
   * 0 and 1.
   *
   * If you DO want the betweenBarPadding to dynamically change but don't like
   * the default domain/range values set here, override this to adjust those
   * accordingly. View the following D3 documentation for more detail about
   * domain and range settings:
   * https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md#ordinal_domain
   * @type {number}
   */
  betweenBarPadding: computed('barNames.length', function() {
    var scale = d3.scale.linear().domain([1, 8]).range([0.625, 0.125]).clamp(true);
    return scale(this.get('barNames.length'));
  }),

  /**
   * Space allocated for rotated labels on the bottom of the chart. If labels
   * are rotated, they will be extended beyond labelHeight up to maxLabelHeight
   * @type {number}
   */
  maxLabelHeight: 50,

  willDestroyElement: function() {
    if(this._hasMouseEventListeners) {
      let viewportBars = this.getViewportBars();
      viewportBars.on('mouseover', null);
      viewportBars.on('mouseout', null);

      let slices = viewportBars.selectAll('rect');
      slices.on('mouseover', null);
      slices.on('mouseout', null);
    }

    this._super(...arguments);
  },

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  /**
   * Input data mapped by sliceLabel.
   * Key: sliceLabel
   * Value: Array of slice objects (sliceLabel, barLabel, value)
   * @type {Object.<string, Array.<Object>>}
   */
  dataGroupedBySlice: computed('data.[]', function() {
    return groupBy(this.get('data'), 'sliceLabel');
  }),

  /**
   * Input data mapped by barLabel. Any data without a barLabel will be
   * aggregated into the bar labelled by `ungroupedSeriesName`. This does not
   * account for the 'Other' slice computations, i.e. all slices are represented
   * here even if they do not meet the minSlicePercent criteria.
   * Key: barLabel
   * Value: Array of slice objects (sliceLabel, barLabel, value)
   * @type {Object.<string, Array.<Object>>}
   */
  dataGroupedByBar: computed('ungroupedSeriesName', 'data.[]',
      function() {
    var ungroupedSeriesName = this.get('ungroupedSeriesName');
    return groupBy(this.get('data'), (slice) => {
      return slice.barLabel || ungroupedSeriesName;
    });
  }),

  /**
   * The gross value of the largest bar (ie, largest difference between top
   * and bottom of any bar in the chart).
   * Used to determine whether a given slice meets the minSlicePercent threshold
   * as a percentage of this largest bar.
   * @type {number}
   */
  largestGrossBarValue: computed('dataGroupedByBar', function() {
    var grossBarValues = map(this.get('dataGroupedByBar'), (barData) => {
      return barData.reduce((sum, slice) => {
        return sum + Math.abs(slice.value);
      }, 0);
    });
    return max(grossBarValues);
  }),

  /**
   * The label and largest slice data for each unique slice label.
   * Finds the largest slice (by absolute value) for each slice label and then
   * calculates the percentage of the largest gross value bar for these
   * largest slices. Used to determine which slices get aggregated into the
   * 'Other' slice in `nonOtherSliceTypes`.
   * @type {Array.<Object>}
   */
  largestSliceData: computed('dataGroupedBySlice', 'largestGrossBarValue',
      function() {
    var dataGroupedBySlice, largestSlice, largestBarValue, largestSliceData;
    dataGroupedBySlice = this.get('dataGroupedBySlice');
    largestBarValue = this.get('largestGrossBarValue');
    largestSliceData = map(dataGroupedBySlice, (slices, sliceLabel) => {
      largestSlice = maxBy(slices, (slice) => {
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

  /**
   * The sliceLabels that will be explicitly shown in the chart and not
   * aggregated into the 'Other' slice. The parameters for which slice labels
   * get bucket in 'Other' are `minSlicePercent` and `maxNumberOfSlices`.
   * @see minSlicePercent
   * @see maxNumberOfSlices
   * @type {Array.<string>}
   */
  nonOtherSliceTypes: computed('minSlicePercent', 'maxNumberOfSlices',
      'largestSliceData.[]', function() {
    var minSlicePercent, maxNumberOfSlices, largestSliceData, nonOtherSlices;
    minSlicePercent = this.get('minSlicePercent');
    largestSliceData = this.get('largestSliceData');

    // First, filter out any slice labels that do not meet the minSlicePercent
    // threshold. These slices are 'too thin' to show on their own, as they will
    // create too much noise in the stacked bar chart, so we lump them into
    // the one 'Other' slice.
    nonOtherSlices = filter(largestSliceData, (sliceData) => {
      return sliceData.percentOfBar >= minSlicePercent;
    });

    // Next, sort the remaining slices by size and take the biggest (N - 1)
    // slices, where N is the max number we can display (this saves one slice
    // for 'Other').
    maxNumberOfSlices = this.get('maxNumberOfSlices');
    nonOtherSlices = takeRight(sortBy(nonOtherSlices, 'percentOfBar'), maxNumberOfSlices - 1);

    // At this point, everything in `nonOtherSlices` meets both the thresholds
    // set by `minSlicePercent` and `maxNumberOfSlices` and deserves to be shown
    // on its own with its own legend items.
    if (largestSliceData.length - nonOtherSlices.length <= 1) {
      // If 0 or 1 slice labels were filtered out, we can just show all slice
      // labels explicitly. We only want the 'Other' slice if it has at least
      // 2 slice labels contained aggregated inside.
      return map(largestSliceData, 'sliceLabel');
    } else {
      // Otherwise, just return the slice labels that passed the filters.
      return map(nonOtherSlices, 'sliceLabel');
    }
  }),

  /**
   * The sliceLabels that will be aggregated into the 'Other' slice and not
   * explicitly shown in the legend.
   * @type {Array.<string>}
   */
  otherSliceTypes: computed('largestSliceData.[]',
      'nonOtherSliceTypes.[]', function() {
    var allSliceTypes = map(this.get('largestSliceData'), 'sliceLabel');
    return difference(allSliceTypes, this.get('nonOtherSliceTypes'));
  }),

  /**
   * Input data mapped by barLabel AFTER 'Other' slices have been calculated
   * and with slices sorted correctly for each bar. Bar sorting is handled by
   * `barNames`, but slice sorting is handled here.
   * Key: barLabel
   * Value: Array of [sorted] slice objects (sliceLabel, barLabel, value)
   * @type {Object.<string, Array.Object>>}
   */
  sortedData: computed('dataGroupedByBar', 'otherSliceLabel',
      'nonOtherSliceTypes.[]', 'sliceSortingFn', function() {
    var groupedData, nonOtherSliceTypes, otherSliceLabel;
    groupedData = this.get('dataGroupedByBar');
    nonOtherSliceTypes = this.get('nonOtherSliceTypes');
    otherSliceLabel = this.get('otherSliceLabel');
    return reduce(groupedData, (result, barData, barLabel) => {
      // Create an empty 'Other' slice. Go through every slice in each bar
      // and look for slices that need to be aggregated into 'Other', updating
      // the value of the otherSlice along the way.
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
      newBarData.sort(this.get('sliceSortingFn'));
      if (otherSlice.value !== 0) {
        newBarData.push(otherSlice);
      }
      result[barLabel] = newBarData;
      return result;
    }, {});
  }),

  /**
   * Final data to be consumed by d3 and rendered into the chart.
   * Contains positioning information of slice above/below x-axis, labels,
   * and color.
   * @type {Array.<Object>}
   */
  finishedData: computed('sortedData', function() {
    var posTop, negBottom, stackedSlices;
    return map(this.get('sortedData'), (slices, barLabel) => {
      // We need to track the top and bottom of the bar so we know where to
      // add any positive or negative slices, respectively.
      posTop = 0;
      negBottom = 0;
      stackedSlices = map(slices, function(slice) {
        var yMin, yMax;
        if (slice.value < 0) {
          yMax = negBottom;
          negBottom += slice.value;
          yMin = negBottom;
        } else {
          yMin = posTop;
          posTop += slice.value;
          yMax = posTop;
        }
        return {
          yMin: yMin,
          yMax: yMax,
          value: slice.value,
          barLabel: slice.barLabel,
          sliceLabel: slice.sliceLabel,
          color: slice.color
        };
      });

      return {
        barLabel: barLabel,
        slices: slices,
        stackedSlices: stackedSlices,
        max: posTop,
        min: negBottom
      };
    });
  }),

  // ---------------------------------------------------------------------------
  // Slice and Bar Sorting
  // ---------------------------------------------------------------------------

  /**
   * Key used to determine slice sorting order. Can be 'value', 'none', or
   * 'other'.
   * @see valueSliceSortingFn
   * @see originalOrderSliceSortingFn
   * @see customSliceSortingFn
   * @type {string}
   */
  sliceSortKey: 'value',

  /**
   * Slice order for when sliceSortKey is set to `value`
   * Starting with the largest net-value bar, sort slices in each bar by abs.
   * value, and add these to the slice order (from largest to smallest)
   * assuming they are not already in the order. Then repeat this process for
   * all bars to make sure all slices are listed in the order.
   * @see sliceSortKey
   * @see valueSliceSortingFn
   * @type {Array.<string>}
   */
  sliceOrderByValue: computed('netBarValues.[]', 'dataGroupedByBar',
      'otherSliceLabel', function() {
    var sortedBars, sliceOrder, slicesInBar, allSlicesByBar;
    allSlicesByBar = this.get('dataGroupedByBar');
    sortedBars = sortBy(this.get('netBarValues'), 'value').reverse();
    sliceOrder = [];
    sortedBars.forEach(bar => {
      slicesInBar = sortBy(allSlicesByBar[bar.barLabel], slice => {
        return -Math.abs(slice.value);
      });
      slicesInBar.forEach(slice => {
        if (sliceOrder.indexOf(slice.sliceLabel) === -1) {
          sliceOrder.push(slice.sliceLabel);
        }
      });
    });
    sliceOrder.push(this.get('otherSliceLabel'));
    return sliceOrder;
  }),

  /**
   * Comparison function for slices for when sliceSortKey is 'value'
   * @see sliceSortKey
   * @see sliceOrderByValue
   * @type {function}
   */
  valueSliceSortingFn: computed('sliceOrderByValue.[]', function() {
    var sliceOrder = this.get('sliceOrderByValue');
    return (slice1, slice2) => {
      return this.defaultCompareFn(sliceOrder.indexOf(slice1.sliceLabel),
                                   sliceOrder.indexOf(slice2.sliceLabel));
    };
  }),

  /**
   * Comparison function for slices when sliceSortKey is 'custom'
   * Can override the custom sorting function to sort by any comparison
   * function. By default, this sorts slices alphabetically by sliceLabel.
   * @see sliceSortKey
   * @type {function}
   */
  customSliceSortingFn: computed(function() {
    return (slice1, slice2) => {
      return this.defaultCompareFn(slice1.sliceLabel, slice2.sliceLabel);
    };
  }),

  /**
   * Comparison function for slices when sliceSortKey is 'none'
   * Sort each slice within its bar based on the order it is listed in the
   * original input data.
   * @see sliceSortKey
   * @type {function}
   */
  originalOrderSliceSortingFn: computed('data.[]', function() {
    var data = this.get('data');
    return (slice1, slice2) => {
      return this.defaultCompareFn(data.indexOf(slice1), data.indexOf(slice2));
    };
  }),

  /**
   * The current slice sorting function, depending on what sliceSortKey is.
   * @type {function}
   */
  sliceSortingFn: computed('valueSliceSortingFn', 'customSliceSortingFn',
      'originalOrderSliceSortingFn', 'sliceSortKey', function() {
    var sliceSortKey = this.get('sliceSortKey');
    if (sliceSortKey === 'value') {
      return this.get('valueSliceSortingFn');
    } else if (sliceSortKey === 'custom') {
      return this.get('customSliceSortingFn');
    } else if (sliceSortKey === 'none' || isNone(sliceSortKey)) {
      return this.get('originalOrderSliceSortingFn');
    } else {
      throw new Error("Invalid sliceSortKey");
    }
  }),

  /**
   * Key used to determine bar sorting order. Can be 'value', 'none', or
   * 'other'.
   * @see valueBarSortingFn
   * @see originalOrderBarSortingFn
   * @see customBarSortingFn
   * @type {string}
   */
  barSortKey: 'value',


  /**
   * Whether bars should be sorted by the `barSortKey` in ascending or
   * descending order.
   * @type {boolean}
   */
  barSortAscending: true,

  /**
   * Comparison function for when bar data when barSortKey is 'value'
   * Sort bars based on the net value of each bar.
   * @see barSortKey
   * @type {function}
   */
  valueBarSortingFn: computed(function() {
    return (barData1, barData2) => {
      return this.defaultCompareFn(barData1.value, barData2.value);
    };
  }),

  /**
   * The original order that bar labels are listed from the input data.
   * We preserve this order so that bars can be sorted in the original input
   * order when `barSortKey` is set to 'none'.
   * @see originalOrderBarSortingFn
   * @type {Array.<String>}
   */
  originalBarOrder: computed('data.[]', function() {
    var barOrder = [];
    this.get('data').forEach(datum => {
      if (barOrder.indexOf(datum.barLabel) === -1) {
        barOrder.push(datum.barLabel);
      }
    });
    return barOrder;
  }),

  /**
   * Comparison function for bar data when barSortKey is 'custom'
   * Can override the custom sorting function to sort by any comparison
   * function. By default, this sorts bars alphabetically by sliceLabel.
   * @see barSortKey
   * @type {function}
   */
  customBarSortingFn: computed(function() {
    return (barData1, barData2) => {
      return this.defaultCompareFn(barData1.barLabel, barData2.barLabel);
    };
  }),

  /**
   * Comparison function for bar data when barSortKey is 'none'
   * Sort bars based on the order each barLabel appears in the original input
   * data.
   * @see originalBarOrder
   * @see barSortKey
   * @type {function}
   */
  originalOrderBarSortingFn: computed('originalBarOrder.[]', function() {
    var originalOrder = this.get('originalBarOrder');
    return (barData1, barData2) => {
      return this.defaultCompareFn(originalOrder.indexOf(barData1.barLabel),
                                   originalOrder.indexOf(barData2.barLabel));
    };
  }),

  /**
   * The current bar sorting function, depending on what barSortKey is.
   * @type {function}
   */
  barSortingFn: computed('valueBarSortingFn', 'customBarSortingFn',
      'originalOrderBarSortingFn', 'barSortKey', function() {
    var barSortKey = this.get('barSortKey');
    if (barSortKey === 'value') {
      return this.get('valueBarSortingFn');
    } else if (barSortKey === 'custom') {
      return this.get('customBarSortingFn');
    } else if (barSortKey === 'none' || isNone(barSortKey)) {
      return this.get('originalOrderBarSortingFn');
    } else {
      throw new Error("Invalid barSortKey");
    }
  }),

  /**
   * Array containing an object for each bar. These objects contain the barLabel
   * and net value for each bar. Used for bar sorting in `barNames`.
   * @type {Array.<Object>}
   */
  netBarValues: computed('dataGroupedByBar', function() {
    var dataGroupedByBar = this.get('dataGroupedByBar');
    return map(dataGroupedByBar, (barData, barLabel) => {
      var barValue = barData.reduce((sum, slice) => {
        return sum + slice.value;
      }, 0);
      return { barLabel: barLabel, value: barValue };
    });
  }),

  /**
   * Order in which bars should appear in the chart, by bar label. This list
   * is sorted using the appropriate barSortingFn.
   * @see barSortingFn
   * @type {Array.<string>}
   */
  barNames: computed('netBarValues', 'barSortingFn', 'barSortAscending',
      function() {
    var sortedBars, sortedBarNames;
    sortedBars = this.get('netBarValues').sort(this.get('barSortingFn'));
    sortedBarNames = map(sortedBars, 'barLabel');
    if (!this.get('barSortAscending')) {
      sortedBarNames.reverse();
    }
    return sortedBarNames;
  }),

  /**
   * Explicitly written version of the default comparison function that is used
   * by Array#sort. Used by every slice and bar comparison functions that are
   * comparing specific parameters.
   * @function
   */
  defaultCompareFn: function(reference1, reference2) {
    if (reference1 < reference2) {
      return -1;
    } else if (reference1 > reference2) {
      return 1;
    } else {
      return 0;
    }
  },

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  labelHeightOffset: computed('_shouldRotateLabels', 'maxLabelHeight',
      'labelHeight', 'labelPadding', function() {
    var labelSize;

    if (this.get('_shouldRotateLabels')) {
      labelSize = this.get('maxLabelHeight');
    } else {
      // Inherited from parent class ChartComponent
      labelSize = this.get('labelHeight');
    }
    return labelSize + this.get('labelPadding');
  }),

  // Chart Graphic Dimensions
  graphicLeft: alias('labelWidthOffset'),

  graphicWidth: computed('width', 'labelWidthOffset', function() {
     return this.get('width') - this.get('labelWidthOffset');
  }),

  graphicHeight: computed('height', 'legendHeight', 'legendChartPadding',
      function() {
    return this.get('height') - this.get('legendHeight') -
      this.get('legendChartPadding');
  }),

  // ---------------------------------------------------------------------------
  // Ticks and Scales
  // ---------------------------------------------------------------------------

  // Vertical position/length of each bar and its value
  yDomain: computed('finishedData', function() {
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

  yScale: computed('graphicTop', 'graphicHeight', 'yDomain', 'numYTicks',
      function() {
    return d3.scale.linear()
      .domain(this.get('yDomain'))
      .range([ this.get('graphicTop') + this.get('graphicHeight'),
               this.get('graphicTop') ])
      .nice(this.get('numYTicks'));
  }),

  /**
   * All slice labels to show in the chart legend. Includes 'Other' slice if the
   * 'Other' slice is present.
   * @type {Array.<string>}
   */
  allSliceLabels: computed('nonOtherSliceTypes.[]', 'otherSliceTypes.[]',
      'otherSliceLabel', function() {
    var result = clone(this.get('nonOtherSliceTypes'));
    if (this.get('otherSliceTypes').length > 0) {
      result.push(this.get('otherSliceLabel'));
    }
    return result;
  }),

  labelIDMapping: computed('allSliceLabels.[]', function() {
    var allSliceLabels = this.get('allSliceLabels');
    return zipObject(allSliceLabels, range(allSliceLabels.length));
  }),

  // The space in pixels allocated to each bar
  barWidth: computed('xBetweenBarScale', function() {
    return this.get('xBetweenBarScale').rangeBand();
  }),

  // The scale used to position each bar and label across the horizontal axis
  xBetweenBarScale: computed('graphicWidth', 'barNames',
      'betweenBarPadding', function() {
    var betweenBarPadding = this.get('betweenBarPadding');

    return d3.scale.ordinal()
      .domain(this.get('barNames'))
      .rangeRoundBands([0, this.get('graphicWidth')],
                       // inner padding (between bars)
                       betweenBarPadding,
                       // outer padding (between outer bars and edge)
                       betweenBarPadding);
  }),

  // Override axis mix-in min and max values to listen to the scale's domain
  minAxisValue: computed('yScale', function() {
    var yScale = this.get('yScale');
    return yScale.domain()[0];
  }),

  maxAxisValue: computed('yScale', function() {
    var yScale = this.get('yScale');
    return yScale.domain()[1];
  }),

  // ---------------------------------------------------------------------------
  // Color Configuration
  // ---------------------------------------------------------------------------

  /**
   * Total number of colors needed to display.
   * When calculating the default slice colors, D3 divides a color gradient up
   * using this number to create an 'even' distribution of colors.
   * @type {number}
   */
  numColorSeries: alias('allSliceLabels.length'),

  /**
   * Map between sliceLabels and default slice color.
   * These colors are calculated by D3 with `getSeriesColor`, which maps the
   * range of sliceLabels against a color gradient. In order to customize the
   * colors for each individual sliceLabel, this property can be overridden or
   * extended.
   * @type {Object.<string,string>}
   */
  sliceColors: computed('allSliceLabels.[]', 'getSeriesColor',
      function() {
    var fnGetSeriesColor = this.get('getSeriesColor');
    var result = {};
    this.get('allSliceLabels').forEach(function(label, labelIndex) {
      result[label] = fnGetSeriesColor(label, labelIndex);
    });
    return result;
  }),

  /**
   * Function that returns the correct color for a given slice.
   * Used by D3 to dynamically set the color for each slice rect element in
   * `updateGraphic`.
   * @type {function}
   */
  fnGetSliceColor: computed('sliceColors.[]', function() {
    var sliceColors = this.get('sliceColors');
    return function(d) {
      return sliceColors[d.sliceLabel];
    };
  }),

  // ---------------------------------------------------------------------------
  // Legend Configuration
  // ---------------------------------------------------------------------------

  hasLegend: true,

  legendItems: computed('allSliceLabels.[]', 'sliceColors',
      'labelIDMapping', function() {
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

  // ---------------------------------------------------------------------------
  // Tooltip Configuration
  // ---------------------------------------------------------------------------

  showDetails: computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      // Specify whether we are on an individual bar or group
      var isGroup = isArray(data.slices);

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
        content.append('<br />');
      };

      if (isGroup) {
        // Display all bar details if hovering over axis group label
        data.slices.forEach(addValueLine);
      } else {
        // Just hovering over single bar
        addValueLine(data);
      }
      return this.showTooltip(content.html(), d3.event);
    };
  }),

  hideDetails: computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      // if we exited the group label undo for the group
      if (isArray(data.slices)) {
        element = element.parentNode.parentNode;
      }
      // Undo hover style stuff
      d3.select(element).classed('hovered', false);

      // Hide Tooltip
      return this.hideTooltip();
    };
  }),


  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  barAttrs: computed('graphicLeft', 'graphicTop', 'xBetweenBarScale',
      function() {
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

  sliceAttrs: computed('yScale', 'barWidth', 'labelIDMapping',
      'strokeWidth', function() {
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

  labelAttrs: computed('barWidth', 'graphicTop', 'graphicHeight',
      'labelPadding', function() {
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

  getViewportBars() {
    return this.get('viewport').selectAll('.bars');
  },

  bars: computed(function() {
    return this.getViewportBars().data(this.get('finishedData'));
  }).volatile(),

  yAxis: computed(function() {
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
  maxLabelWidth: readOnly('barWidth'),

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
    this.set('_shouldRotateLabels', rotateLabels);
  },

  // Calculate the number of degrees to rotate labels based on how widely labels
  // will be spaced, but never rotate the labels less than 20 degrees
  rotateLabelDegrees: computed('labelHeight', 'maxLabelWidth',
      function() {
    var radians = Math.atan(this.get('labelHeight') /
                            this.get('maxLabelWidth'));
    var degrees = radians * 180 / Math.PI;
    return Math.max(degrees, 20);
  }),

  rotatedLabelLength: computed('maxLabelHeight', 'rotateLabelDegrees',
      function() {
    var rotateLabelRadians = Math.PI / 180 * this.get('rotateLabelDegrees');
    return Math.abs(this.get('maxLabelHeight') / Math.sin(rotateLabelRadians));
  }),

  // ---------------------------------------------------------------------------
  // Drawing Functions
  // ---------------------------------------------------------------------------

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
    this._hasMouseEventListeners = true;

    var entering = bars.enter()
      .append('g').attr('class', 'bars');
    entering.append('g').attr('class', 'groupLabel')
      .append('text')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    bars.exit().remove();

    var subdata = function(d) { return d.stackedSlices; };

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
