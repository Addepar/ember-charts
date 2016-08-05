import Ember from 'ember';
import ChartComponent from './chart-component';
import LegendMixin from '../mixins/legend';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import AxesMixin from '../mixins/axes';
import FormattableMixin from '../mixins/formattable';
import SortableChartMixin from '../mixins/sortable-chart';
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
  FloatingTooltipMixin, AxesMixin, FormattableMixin, SortableChartMixin,
  NoMarginChartMixin, AxisTitlesMixin, {

  classNames: ['chart-vertical-bar', 'chart-stacked-vertical-bar'],

  // ----------------------------------------------------------------------------
  // Vertical Bar Chart Options
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

  // Space between bar groups, as fraction of group size
  betweenBarPadding: Ember.computed('numSlices', function() {
    // Use padding to make sure bars have a maximum thickness.
    //
    // TODO(tony): Use exact padding + bar width calculation
    // We have some set amount of bewtween group padding we use depending
    // on the number of bars there are in the chart. Really, what we would want
    // to do is have the equation for bar width based on padding and use that
    // to set the padding exactly.
    var scale = d3.scale.linear().domain([1, 8]).range([1.25, 0.25]).clamp(true);
    return scale(this.get('numSlices'));
  }),

  numSlices: Ember.computed('barNames.length', 'allSliceLabels.length',
  function() {
    return this.get('barNames.length') * this.get('allSliceLabels.length') || 0;
  }),

  // Space allocated for rotated labels on the bottom of the chart. If labels
  // are rotated, they will be extended beyond labelHeight up to maxLabelHeight
  maxLabelHeight: 50,

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  // Remove any slices with that have zero-value. This allows the colors to be
  // calculated correctly for the remaining visible slices.
  filteredData: Ember.computed('data.[]', function() {
    return _.filter(this.get('data'), function(slice) {
      return (slice.value !== 0.0);
    });
  }),

  // Maps the label for each bar to the total value of each bar
  barValues: Ember.computed('groupedData.[]', function() {
    var groupedData = this.get('groupedData')
    return _.reduce(groupedData, function(result, barData, barLabel) {
      result[barLabel] = barData.reduce(function(sum, slice) {
        return sum + Math.abs(slice.value);
      }, 0);
      return result;
    }, {});
  }),

  // Returns an array with one item for every sliceLabel. Each item contains
  // the sliceLabel string, the value of the largest slice with this sliceLabel,
  // and the value of the bar that the largest slice is in.
  largestSliceData: Ember.computed('groupedData.[]', 'filteredData.[]',
  'allSliceLabels.[]', function() {
    var filteredData, groupedData, filteredSlices, largestSlice,
      largestSliceBarValue, barValues;
    filteredData = this.get('filteredData');
    groupedData = this.get('groupedData');
    barValues = this.get('barValues');
    return this.get('allSliceLabels').map(function(sliceLabel) {
      filteredSlices = _.filter(filteredData, 'sliceLabel', sliceLabel);
      largestSlice = _.max(filteredSlices, function(slice) {
          return Math.abs(slice.value);
      });
      largestSliceBarValue = barValues[largestSlice.barLabel];
      return { sliceLabel: sliceLabel,
               largestSliceValue: largestSlice.value,
               percentOfBar: (largestSlice.value / largestSliceBarValue) * 100 }
    });
  }),

  // The sliceLabels that will be explicitly shown in the chart and not
  // aggregated into the 'Other' slice.
  nonOtherSliceLabels: Ember.computed('minSlicePercent', 'maxNumberOfSlices',
  'largestSliceData.[]', function() {
    var minSlicePercent, nonOtherSliceData;
    minSlicePercent = this.get('minSlicePercent');
    nonOtherSliceData = _.take(this.get('largestSliceData'),
                               this.get('maxNumberOfSlices') - 1)
                         .filter(function(sliceData) {
        return sliceData.percentOfBar > minSlicePercent;
      });
    return _.map(nonOtherSliceData, 'sliceLabel');
  }),

  sortedData: Ember.computed('filteredData.[]', 'sortKey', 'sortAscending',
  function() {
    var data, barLabel, barData, barSum, dataGroupedByBar, key, newData,
      sortedSummedBarValues, summedBarValues, i;

    data = this.get('filteredData');
    key = this.get('sortKey');
    if (key === null) {
      return data;
    }

    dataGroupedByBar = _.groupBy(data, 'barLabel');
    summedBarValues = Ember.A();
    const reduceByValue = (previousValue, dataObject) =>
      previousValue + dataObject.value;

    for (barLabel in dataGroupedByBar) {
      barData = dataGroupedByBar[barLabel];
      if (barLabel !== null) {
        summedBarValues.pushObject({
          barLabel: barLabel,
          value: barData.reduce(reduceByValue, 0)
        });
      }
    }

    if (Ember.isEmpty(summedBarValues)) {
      return Ember.A();
    } else {
      sortedSummedBarValues = summedBarValues.sortBy(key);
      if (!this.get('sortAscending')) {
        sortedSummedBarValues = sortedSummedBarValues.reverse();
      }
      newData = Ember.A();
      for (i = 0; i < sortedSummedBarValues.length; i++) {
        barSum = sortedSummedBarValues[i];
        newData.pushObjects(dataGroupedByBar[barSum.barLabel]);
      }
      return newData;
    }
  }),

  // Aggregates objects provided in `data` in a dictionary, keyed by bar label
  groupedData: Ember.computed('sortedData', 'ungroupedSeriesName', function() {
    var data = this.get('sortedData');
    if (Ember.isEmpty(data)) {
      return {};
   	}

    data = _.groupBy(data, (d) => {
      return d.barLabel || this.get('ungroupedSeriesName');
    });

    // After grouping, the data points may be out of order, and therefore not properly
    // matched with their value and color. Here, we resort to ensure proper order.
    // This could potentially be addressed with a refactor where sorting happens after
    // grouping across the board.
    data = _.mapValues(data, function(sliceGroup) {
      return _.sortBy(sliceGroup, 'sliceLabel');
    });

    return data;
  }),

  groupedDataWithOther: Ember.computed('nonOtherSliceLabels.[]', 'barValues.[]',
  'minSlicePercent', 'otherSliceLabel', 'groupedData.[]', function() {
    var nonOtherSliceLabels, barValues, minSlicePercent, otherSliceLabel;
    nonOtherSliceLabels = this.get('nonOtherSliceLabels')
    barValues = this.get('barValues');
    minSlicePercent = this.get('minSlicePercent');
    otherSliceLabel = this.get('otherSliceLabel')
    return _.reduce(this.get('groupedData'), function(result, barData, barLabel) {
      var newBarData, otherSlice;
      newBarData = [],
      otherSlice = { barLabel: barLabel,
                     sliceLabel: otherSliceLabel,
                     value: 0,
                     _otherSlices: [] };
      barData.forEach(function(slice) {
        var percentOfBar = (slice.value / barValues[slice.barLabel]) * 100;
        if (nonOtherSliceLabels.indexOf(slice.sliceLabel) != -1) {
          newBarData.push(slice);
        } else {
          otherSlice.value += slice.value;
          otherSlice._otherSlices.push(slice);
        }
      });
      if (otherSlice.value != 0) {
        newBarData.push(otherSlice);
      }
      result[barLabel] = newBarData;
      return result;
    }, {});
  }),

  otherSlices: Ember.computed('groupedDataWithOther.[]', 'otherSliceLabel',
  function() {
    var otherSliceLabel = this.get('otherSliceLabel');
    return _.flatten(_.map(this.get('groupedDataWithOther'), function(barData) {
      return _.filter(barData, function(slice) {
        return slice.sliceLabel === otherSliceLabel;
      });
    }));
  }),

  barNames: Ember.computed('groupedData', function() {
    return _.keys(this.get('groupedData'));
  }),

  // We know the data is grouped because it has more than one label. If there
  // are no labels on the data then every data object will have
  // 'ungroupedSeriesName' as its group name and the number of group
  // labels will be 1. If we are passed ungrouped data we will display
  // each data object in its own group.
  hasMultipleBars: Ember.computed('barNames.length', function() {
    return (this.get('barNames.length') > 1);
  }),

  finishedData: Ember.computed('groupedDataWithOther.[]', 'hasMultipleBars', function() {
    var posTop, negBottom, stackedValues, sliceTypesInOther, otherSliceLabel;
    sliceTypesInOther = [];
    this.get('otherSlices').forEach(function(otherSlice) {
      otherSlice._otherSlices.forEach(function(partialSlice) {
        var sliceLabel = partialSlice.sliceLabel;
        if (sliceTypesInOther.indexOf(sliceLabel) != -1) {
          sliceTypesInOther.push(sliceLabel);
        }
      })
    })
    otherSliceLabel = this.get('otherSliceLabel')
    if (this.get('hasMultipleBars')) {
      return _.map(this.get('groupedDataWithOther'), function(values, barName) {
        posTop = 0;
        negBottom = 0;
        stackedValues = _.map(values, function(d) {
          var yMin, yMax, sliceLabel;
          if (d.value < 0) {
            yMax = negBottom;
            negBottom += d.value;
            yMin = negBottom;
          } else {
            yMin = posTop;
            posTop += d.value;
            yMax = posTop;
          }
          sliceLabel = d.sliceLabel;
          if (sliceLabel === otherSliceLabel && sliceTypesInOther.length == 1) {
            sliceLabel = sliceTypesInOther[0];
          }
          return {
            yMin: yMin,
            yMax: yMax,
            value: d.value,
            barLabel: d.barLabel,
            sliceLabel: sliceLabel,
            color: d.color
          };
        });

        return {
          barLabel: barName,
          values: values,
          stackedValues: stackedValues,
          max: posTop,
          min: negBottom
        };
      });

    } else {
      if (Ember.isEmpty(this.get('filteredData'))) {
        return Ember.A();
      }

      posTop = 0;
      negBottom = 0;
      stackedValues = _.map(this.get('filteredData'), function(d) {
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

      return Ember.A([{
        barLabel: this.get('data.firstObject.barLabel'),
        values: this.get('filteredData'),
        stackedValues: stackedValues,
        max: posTop,
        min: negBottom
      }]);
    }
  }),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  labelHeightOffset: Ember.computed('_shouldRotateLabels', 'maxLabelHeight',
  'labelHeight', 'labelPadding', function() {
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

  graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding',
  function() {
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

  yScale: Ember.computed('graphicTop', 'graphicHeight', 'yDomain', 'numYTicks',
  function() {
    return d3.scale.linear()
      .domain(this.get('yDomain'))
      .range([ this.get('graphicTop') + this.get('graphicHeight'),
               this.get('graphicTop') ])
      .nice(this.get('numYTicks'));
  }),

  allSliceLabels: Ember.computed('sortedData.[]', function() {
    return _.uniq(_.map(this.get('sortedData'), 'sliceLabel'));
  }),

  labelIDMapping: Ember.computed('allSliceLabels.[]', function() {
    var allSliceLabels = this.get('allSliceLabels');
    return _.zipObject(allSliceLabels, _.range(allSliceLabels.length));
  }),

  // The space in pixels allocated to each bar
  barWidth: Ember.computed('xBetweenBarScale', function() {
    return this.get('xBetweenBarScale').rangeBand();
  }),

  // The scale used to position each group and label across the horizontal axis
  // If we do not have grouped data, do not add additional padding around groups
  // since this will only add whitespace to the left/right of the graph.
  xBetweenBarScale: Ember.computed('graphicWidth', 'barNames',
  'betweenBarPadding', function() {
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

  // ----------------------------------------------------------------------------
  // Legend Configuration
  // ----------------------------------------------------------------------------

  hasLegend: true,

  legendItems: Ember.computed('allSliceLabels.[]', 'getSeriesColor',
  'labelIDMapping.[]', function() {
    var getSeriesColor = this.get('getSeriesColor');
    return this.get('allSliceLabels').map((label, i) => {
      var color = getSeriesColor(label, i);
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

  groupAttrs: Ember.computed('graphicLeft', 'graphicTop', 'xBetweenBarScale',
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

  stackedBarAttrs: Ember.computed('yScale', 'barWidth', 'labelIDMapping.[]',
  'strokeWidth', function() {
    var yScale, zeroDisplacement;
    zeroDisplacement = 1;
    yScale = this.get('yScale');
    return {
      "class": (barSection) => {
        var id;
        id = this.get('labelIDMapping')[barSection.sliceLabel];
        return "grouping-" + id;
      },
      'stroke-width': this.get('strokeWidth').toString()+'px',
      width: () => this.get('barWidth'),
      x: null,
      y: function(barSection) {
        return yScale(barSection.yMax) + zeroDisplacement;
      },
      height: function(barSection) {
        return yScale(barSection.yMin) - yScale(barSection.yMax);
      }
    };
  }),

  labelAttrs: Ember.computed('barWidth', 'graphicTop', 'graphicHeight',
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

  groups: Ember.computed(function() {
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

  // Space available for labels that are horizontally displayed. This is either
  // the unpadded group width or bar width depending on whether data is grouped
  maxLabelWidth: Ember.computed.readOnly('barWidth'),

  _shouldRotateLabels: false,

  setRotateLabels: function() {
    var labels, maxLabelWidth, rotateLabels;
    labels = this.get('groups').select('.groupLabel text');
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
    var groups = this.get('groups');
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');

    var entering = groups.enter()
      .append('g').attr('class', 'bars');
    entering.append('g').attr('class', 'groupLabel')
      .append('text')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    groups.exit().remove();

    var subdata = function(d) { return d.stackedValues; };

    var bars = groups.selectAll('rect').data(subdata);
    bars.enter().append('rect')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    return bars.exit().remove();
  },

  updateLayout: function() {
    var groups = this.get('groups');
    var labels = groups.select('.groupLabel text')
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
    var groups = this.get('groups');
    var barAttrs = this.get('stackedBarAttrs');

    groups.attr(this.get('groupAttrs') );
    groups.selectAll('rect')
      .attr(barAttrs)
      .style('fill', this.get('getSeriesColor'));
    return groups.select('g.groupLabel')
      .attr(this.get('labelAttrs') );
  }
});

export default StackedVerticalBarChartComponent;
