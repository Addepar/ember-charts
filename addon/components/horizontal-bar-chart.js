import Ember from 'ember';
import ChartComponent from './chart-component';
import FormattableMixin from '../mixins/formattable';

import FloatingTooltipMixin from '../mixins/floating-tooltip';
import SortableChartMixin from '../mixins/sortable-chart';

import LabelTrimmer from '../utils/label-trimmer';
import AxisTitlesMixin from '../mixins/axis-titles';

const HorizontalBarChartComponent = ChartComponent.extend(FloatingTooltipMixin,
  FormattableMixin, SortableChartMixin, AxisTitlesMixin, {
  classNames: ['chart-horizontal-bar'],

  // ----------------------------------------------------------------------------
  // Horizontal Bar Chart Options
  // ----------------------------------------------------------------------------

  // Minimum height of the whole chart, including padding
  defaultOuterHeight: 500,

  // Space between label and zeroline (overrides ChartView)
  // Also used to pad labels against the edges of the viewport
  labelPadding: 20,

  // Space between adjacent bars, as fraction of padded bar size
  barPadding: 0.2,

  // Constraints on size of each bar
  maxBarThickness: 60,
  minBarThickness: 20,

  /*
   * The maximum width of grouping labels. The text of the label will be
   * trimmed if it exceeds this width. This max won't be enforced if it is
   * null or undefined
   * @type {Number}
   */
  maxLabelWidth: null,

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------
  finishedData: Ember.computed.alias('sortedData'),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  /**
   * Overrides values in addon/mixins/axis-titles.js
   * Location of axis title should track the actual axis
   *   - If there are both positive and negative values
   *   - Since the chart axis will be close to center
   * @override
   */
  xAxisPositionX: Ember.computed('graphicWidth',
      'xTitleHorizontalOffset', function() {
    var position = this.get('graphicWidth') / 2 ;
    if (!Ember.isNone(this.get('xTitleHorizontalOffset'))) {
      position += this.get('xTitleHorizontalOffset');
    }
    return position;
  }),

  /**
   * X Axis Titles needs extra padding, else will intersect with the lowest bar
   * @override
   */
  xAxisPositionY: Ember.computed('graphicBottom', 'xTitleVerticalOffset', function(){
    return this.get('graphicBottom') + this.get('xTitleVerticalOffset');
  }),

  /**
   * @override
   */
  yAxisPositionY: Ember.computed('labelWidthOffset', 'yAxisTitleHeightOffset', function(){
    return -(this.get('labelWidthOffset') + this.get('yAxisTitleHeightOffset'));
  }),

  minOuterHeight: Ember.computed('numBars', 'minBarThickness', 'marginTop', 'marginBottom', function() {
    const minBarThickness = this.get('minBarThickness');
    // If minBarThickness is null or undefined, do not enforce minOuterHeight.
    if (Ember.isNone(minBarThickness)) {
      return null;
    } else {
      const minBarSpace = this.get('numBars') * minBarThickness;
      return minBarSpace + this.get('marginTop') + this.get('marginBottom');
    }
  }),

  maxOuterHeight: Ember.computed('numBars', 'maxBarThickness', 'marginTop', 'marginBottom', function() {
    const maxBarThickness = this.get('maxBarThickness');
    // If maxBarThickness is null or undefined, do not enforce maxOuterHeight.
    if (Ember.isNone(maxBarThickness)) {
      return null;
    } else {
      const maxBarSpace = this.get('numBars') * maxBarThickness;
      return maxBarSpace + this.get('marginTop') + this.get('marginBottom');
    }
  }),

  // override the default outerHeight, so the graph scrolls
  outerHeight: Ember.computed('minOuterHeight', 'maxOuterHeight', 'defaultOuterHeight', function() {
    // Note: d3.max and d3.min ignore null/undefined values
    var maxMinDefault = d3.max([this.get('defaultOuterHeight'), this.get('minOuterHeight')]);
    return d3.min([maxMinDefault, this.get('maxOuterHeight')]);
  }),

  marginTop: Ember.computed.alias('labelPadding'),

  /**
   * The margin at the bottom depends on the label and title padding and height.
   * @override
   * @type {Number}
   */
  marginBottom: Ember.computed('labelPadding', 'xTitleVerticalOffset',
      'hasXAxisTitle', function() {
    if (this.get('hasXAxisTitle')) {
      return this.get('labelPadding') + this.get('xTitleVerticalOffset');
    }

    return this.get('labelPadding');
  }),

  marginLeft: Ember.computed.alias('horizontalMarginLeft'),

  // ----------------------------------------------------------------------------
  // Graphics Properties
  // ----------------------------------------------------------------------------

  numBars: Ember.computed.alias('finishedData.length'),

  // Range of values used to size the graph, within which bars will be drawn
  xDomain: Ember.computed('minValue', 'maxValue', function() {
    const minValue = this.get('minValue');
    const maxValue = this.get('maxValue');
    if (this.get('hasNegativeValues')) {
      if (this.get('hasPositiveValues')) {
        // Mix of positive and negative values
        return [minValue, maxValue];
      } else {
        // Only negative values domain
        return [minValue, 0];
      }
    } else {
      // Only positive values domain
      return [0, maxValue];
    }
  }),

  // Scale to map value to horizontal length of bar
  xScale: Ember.computed('width', 'xDomain', function() {
    return d3.scale.linear()
      .domain(this.get('xDomain'))
      .range([0, this.get('width')]);
  }),

  // Scale to map bar index to its horizontal position
  yScale: Ember.computed('height', 'barPadding', function() {
    // Evenly split up height for bars with space between bars
    return d3.scale.ordinal()
      .domain(d3.range(this.get('numBars')))
      .rangeRoundBands([0, this.get('height')], this.get('barPadding'));
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

    return (data, i, element) => {
      // Do hover detail style stuff here
      d3.select(element).classed('hovered', true);

      // Show tooltip
      var formatLabel = this.get('formatLabelFunction');
      // Line 1
      var content = '<span class=\'tip-label\'>' + data.label + '</span>';
      // Line 2
      content += '<span class=\'name\'>' + this.get('tooltipValueDisplayName') + ': </span>';
      content += '<span class=\'value\'>' + formatLabel(data.value) + '</span>';
      return this.showTooltip(content, d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      // Undo hover style stuff
      d3.select(element).classed('hovered', false);
      // Hide Tooltip
      return this.hideTooltip();
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
        return 'translate(' + xScale(value) + ', ' + yScale(i) + ')';
      }
    };
  }),

  barAttrs: Ember.computed('xScale', 'mostTintedColor', 'leastTintedColor', 'barThickness', function() {
    var xScale = this.get('xScale');
    return {
      width: (d) => Math.abs(xScale(d.value) - xScale(0)),
      height: this.get('barThickness'),
      'stroke-width': 0,
      style: (d) => {
        if (d.color) {
          return 'fill:' + d.color;
        }
        var color = (d.value < 0) ? this.get('mostTintedColor') : this.get('leastTintedColor');
        return 'fill:' + color;
      }
    };
  }),

  /*
   * Determines whether Value Labels should go on the left side of the Y-Axis
   * Returns true if data is negative, or data is 0 and all other data is negative
   * @private
   * @param {Object}
   * @return {Boolean}
   */
  _isValueLabelLeft: function(d) {
    if (d.value < 0) {
      return true;
    }

    if (d.value === 0 && this.get('hasAllNegativeValues')) {
      return true;
    }

    return false;
  },

  valueLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
    var xScale = this.get('xScale');
    // Anchor the label 'labelPadding' away from the zero line
    // How to anchor the text depends on the direction of the bar

    return {
      x: (d) => {
        if (this._isValueLabelLeft(d)) {
          return -this.get('labelPadding');
        } else {
          return xScale(d.value) - xScale(0) + this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': (d) => (this._isValueLabelLeft(d)) ? 'end' : 'start',
      'stroke-width': 0
    };
  }),

  groupLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
    var xScale = this.get('xScale');

    // Anchor the label 'labelPadding' away from the zero line
    // How to anchor the text depends on the direction of the bar
    return {
      x: (d) => {
        if (this._isValueLabelLeft(d))  {
          return xScale(0) - xScale(d.value) + this.get('labelPadding');
        } else {
          return -this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': (d) => (this._isValueLabelLeft(d)) ? 'start' : 'end',
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
      .data(this.get('finishedData'));
  }).volatile(),

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
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  didInsertElement: function() {
    this._super(...arguments);
    // TODO (philn): This `Ember.run.next` was added to fix a bug where
    // a horizontal bar chart was rendered incorrectly the first time, but
    // correctly on subsequent renders. Still not entirely clear why that is.
    this._scheduledRedraw = Ember.run.next( () => {
      this._updateDimensions();
      this.drawOnce();
    });
  },

  /*
   * Tear down the scheduled redraw timer
   * @override
   */
  willDestroyElement: function() {
    this._super(...arguments);
    Ember.run.cancel(this._scheduledRedraw);
  },

  /**
   * Store the timer information from scheduling the chart's redraw
   */
  _scheduledRedraw: null,

  renderVars: [
    'barThickness',
    'yScale',
    'colorRange',
    'xValueDisplayName',
    'yValueDisplayName',
    'hasAxisTitles',
    'hasXAxisTitle',
    'hasYAxisTitle',
    'xTitleHorizontalOffset',
    'yTitleVerticalOffset',
    'xTitleVerticalOffset',
    'maxLabelWidth'
  ],

  drawChart: function() {
    this.updateData();
    this.updateAxes();
    this.updateGraphic();
    this.updateAxisTitles();
  },

  updateData: function() {
    var groups = this.get('groups');
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');

    var entering = groups.enter()
      .append('g').attr('class', 'bar')
      .on('mouseover', function(d, i) { return showDetails(d, i, this); })
      .on('mouseout', function(d, i) { return hideDetails(d, i, this); });
    entering.append('rect');
    entering.append('text').attr('class', 'value');
    entering.append('text').attr('class', 'group');

    return groups.exit().remove();
  },

  updateAxes: function() {
    return this.get('yAxis').attr(this.get('axisAttrs'));
  },

  /**
   * Given the list of elements for the group labels and value labels,
   * determine the width of the largest label on either side of the chart.
   * @private
   * @param {Array.<SVGTextElement>} groupLabelElements The text elements
   *  representing the group labels for the chart
   * @param {Array.<SVGTextElement>} valueLabelElements The text elements
   *  representing the value labels for the chart
   * @return {Object.<String, Number>}
   */
  _computeLabelWidths: function(groupLabelElements, valueLabelElements) {
    const maxValueLabelWidth = this._maxWidthOfElements(valueLabelElements);
    const maxGroupLabelWidth = this._maxWidthOfElements(groupLabelElements);

    const maxLabelWidth = this.get('maxLabelWidth') || this.get('outerWidth');

    // If all values are positive, the grouping labels are on the left and the
    // value labels are on the right
    if (this.get('hasAllPositiveValues')) {
      return {
        left: d3.min([maxGroupLabelWidth, maxLabelWidth]),
        right: maxValueLabelWidth
      };
    // If all values are negative, the value labels are on the left and the
    // grouping labels are on the right
    } else if (this.get('hasAllNegativeValues')) {
      return {
        left: maxValueLabelWidth,
        right: d3.min([maxGroupLabelWidth, maxLabelWidth])
      };
    // If the values are a mix of positive and negative values, there is a mix
    // value and grouping labels on each side. Find the largest one on either
    // side.
    } else {
      const positiveValues = this.get('positiveValues');
      const negativeValues = this.get('negativeValues');

      const positiveGroupingLabels = positiveValues.map((val) => {
        return this._getElementForValue(groupLabelElements, val);
      });
      const positiveValueLabels = positiveValues.map((val) => {
        return this._getElementForValue(valueLabelElements, val);
      });
      const negativeGroupingLabels = negativeValues.map((val) => {
        return this._getElementForValue(groupLabelElements, val);
      });
      const negativeValueLabels = negativeValues.map((val) => {
        return this._getElementForValue(valueLabelElements, val);
      });

      var maxNegativeValueLabelWidth = this._maxWidthOfElements(negativeValueLabels);
      var maxPositiveGroupingLabelWidth = Math.min(maxLabelWidth, this._maxWidthOfElements(positiveGroupingLabels));

      var maxPositiveValueLabelWidth = this._maxWidthOfElements(positiveValueLabels);
      var maxNegativeGroupingLabelWidth = Math.min(maxLabelWidth, this._maxWidthOfElements(negativeGroupingLabels));

      var padding = this.get('labelPadding');
      var minValue = Math.abs(this.get('minValue'));
      var maxValue = this.get('maxValue');
      var valueRange = maxValue + minValue;
      var containerWidth = this.get('outerWidth');
      var axisTitleOffset = this.get('yAxisTitleHeightOffset') + 5;
      var chartPadding = 2 * padding + axisTitleOffset;
      var chartWidth = containerWidth - maxNegativeValueLabelWidth - maxPositiveValueLabelWidth - chartPadding;

      var leftGroupLabelWidth = maxPositiveGroupingLabelWidth;
      var leftChartWidth = maxNegativeValueLabelWidth + minValue/valueRange * chartWidth;


      var rightGroupLabelWidth = maxNegativeGroupingLabelWidth;
      var rightChartWidth = maxPositiveValueLabelWidth + maxValue/valueRange * chartWidth;

      var leftWidth = maxNegativeValueLabelWidth;
      var rightWidth = maxPositiveValueLabelWidth;

      if (leftGroupLabelWidth > leftChartWidth) {
        leftWidth = leftGroupLabelWidth - minValue * (containerWidth - leftGroupLabelWidth - rightWidth - chartPadding) / maxValue;
        leftWidth = Math.min(leftWidth, containerWidth - rightWidth - chartPadding);
      } else if (rightGroupLabelWidth > rightChartWidth) {
        rightWidth = rightGroupLabelWidth - maxValue * (containerWidth - rightGroupLabelWidth - leftWidth - chartPadding) / minValue;
        rightWidth = Math.min(rightWidth, containerWidth - leftWidth - chartPadding);
      }

      /*const leftLabels = negativeValueLabels.concat(positiveGroupingLabels);
      const rightLabels = positiveValueLabels.concat(negativeGroupingLabels);

      const [leftWidth, rightWidth] = [leftLabels, rightLabels].map((elements) => {
        return this._maxWidthOfElements(elements);
      });*/
      return {
        left: leftWidth,
        right: rightWidth
      };
    }
  },

  /**
   * Given an array of elements and a value, return the element in the array
   * at the same index as the value is in the list of all values
   * @private
   * @param {Array.<HTMLElement>} elements The elements to search in
   * @param {Number} value The value to search for
   * @return {HTMLElement}
   */
  _getElementForValue: function(elements, value) {
    const index = this.get('allFinishedDataValues').indexOf(value);
    return elements[index];
  },

  /**
   * Given an array of SVG elements, return the largest computed length
   * @private
   * @param {Array.<SVGElement>} elements The array of elements
   * @return {Number}
   */
  _maxWidthOfElements: function(elements) {
    return d3.max(_.map(elements, (element) => {
      return element.getComputedTextLength();
    }));
  },

  updateGraphic: function() {
    const groups = this.get('groups')
      .attr(this.get('groupAttrs'));

    groups.select('text.group')
      .text((d) => d.label)
      .attr(this.get('groupLabelAttrs'));

    groups.select('rect')
      .attr(this.get('barAttrs'));

    groups.select('text.value')
      .text((d) => this.get('formatLabelFunction')(d.value))
      .attr(this.get('valueLabelAttrs'));

    const valueLabelElements = groups.select('text.value')[0];
    const groupLabelElements = groups.select('text.group')[0];
    const labelWidths = this._computeLabelWidths(groupLabelElements, valueLabelElements);
    // labelWidth is used for computations around the left margin, so set it
    // to the width of the left label
    this.set('labelWidth', labelWidths.left);

    // Add a few extra pixels of padding to ensure that labels don't clip off
    // the edge of the chart
    const labelPadding = this.get('labelPadding');
    const axisTitleOffset = this.get('yAxisTitleHeightOffset') + 5;

    this.setProperties({
      horizontalMarginLeft: labelWidths.left + labelPadding + axisTitleOffset,
      horizontalMarginRight: labelWidths.right + labelPadding
    });

    /*var labelWidth;
    if (this.get('hasAllPositiveValues')) {
      labelWidth = labelWidths.left;
    } else if (this.get('hasAllNegativeValues')) {
      labelWidth = labelWidths.right;
    } else {
      // If the chart contains a mix of negative and positive values, there are
      // grouping labels on both sides of the chart
      labelWidth = d3.max([labelWidths.left, labelWidths.right]);
    }*/
    var labelWidth = this.get('maxLabelWidth') || this.get('outerWidth');
    const labelTrimmer = LabelTrimmer.create({
      getLabelSize: () => labelWidth,
      getLabelText: (d) => d.label
    });

    groups.select('text.group')
      .call(labelTrimmer.get('trim'));
  }
});

export default HorizontalBarChartComponent;
