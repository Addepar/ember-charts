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

  /*
   * Returns a function which scales a value in the data to a horizontal position
   * @private
   * @param {Number} width The width of the chart to use for scaling
   * @return {Function}
   */
  _xScaleForWidth: function(width) {
    return d3.scale.linear()
      .domain(this.get('xDomain'))
      .range([0, width]);
  },

  // Scale to map value to horizontal length of bar
  xScale: Ember.computed('width', 'xDomain', function() {
    return this._xScaleForWidth(this.get('width'));
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
      return this;
    }

    return (data, i, element) => {
      // Do hover detail style stuff here
      d3.select(element).classed('hovered', true);

      // Show tooltip
      var formatLabel = this.get('formatLabelFunction');
      var content = $('<span>');
      content.append($('<span class="tip-label">').text(data.label));
      content.append($('<span class="name">').text(this.get('tooltipValueDisplayName') + ': '));
      content.append($('<span class="value">').text(formatLabel(data.value)));
      return this.showTooltip(content.html(), d3.event);

    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return this;
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
      width: (d) => this._computeBarWidth(d.value, xScale),
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
    const maxLabelWidth = this.get('maxLabelWidth');

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
    } else {
      return this._computeMixedLabelWidths(groupLabelElements, valueLabelElements);
    }
  },

  /*
   * Determine the label widths on either side of a chart which contains a mix of positive
   * and negative values
   * @private
   * @param {Array.<SVGTextElement>} groupLabelElements The text elements
   *  representing the group labels for the chart
   * @param {Array.<SVGTextElement>} valueLabelElements The text elements
   *  representing the value labels for the chart
   * @return {Object.<String, Number>}
   */
  _computeMixedLabelWidths: function(groupLabelElements, valueLabelElements) {
    const minValue = this.get('minValue');
    const maxValue = this.get('maxValue');
    const maxLabelWidth = this.get('maxLabelWidth');

    // The grouping labels for positive values appear on the left side of the chart axis, and
    // vice-versa for negative values and right labels
    const leftGroupingLabels = this.get('positiveValues').map((val) => {
      return this._getElementForValue(groupLabelElements, val);
    });
    const rightGroupingLabels = this.get('negativeValues').map((val) => {
      return this._getElementForValue(groupLabelElements, val);
    });
    const maxLeftGroupingLabelWidth = d3.min([maxLabelWidth,
      this._maxWidthOfElements(leftGroupingLabels)]);
    const maxRightGroupingLabelWidth = d3.min([maxLabelWidth,
      this._maxWidthOfElements(rightGroupingLabels)]);

    // The value label that is furthest to the left is the one representing the minimum
    // value in the chart, and vice-versa for the right side and maximum value
    const leftMostValueLabelWidth = this._getElementWidthForValue(valueLabelElements, minValue);
    const rightMostValueLabelWidth = this._getElementWidthForValue(valueLabelElements, maxValue);

    const padding = (2 * this.get('labelPadding')) + this.get('yAxisTitleHeightOffset');
    const outerWidth = this.get('outerWidth');
    const width = outerWidth - leftMostValueLabelWidth - rightMostValueLabelWidth - padding;
    const xScale = this._xScaleForWidth(width);

    const maxNegativeBarWidth = this._computeBarWidth(minValue, xScale);
    const maxPositiveBarWidth = this._computeBarWidth(maxValue, xScale);

    var leftWidth, rightWidth;
    // If the sum of the widths of the longest bar in a direction and its value label is larger
    // than the longest grouping label on the same side of the chart, then the relevant width on
    // that side is the width of the value label
    if (maxNegativeBarWidth + leftMostValueLabelWidth > maxLeftGroupingLabelWidth) {
      leftWidth = leftMostValueLabelWidth;
    // In the case where the left grouping label is wider than the sum of the largest left bar
    // and its value label, the goal is to find the distance between the left edge of the chart
    // and the end of the left bar.
    } else {
      // We can no longer use `maxNegativeBarWidth` from above, because it was computed with the
      // assumption that the value labels made up the outer margins of the chart, which is not
      // true in this case.
      // The amount of space to the left of the axis is fixed at the width of the grouping label.
      // The amount of space to the right of most positive bar is fixed at the width of the
      // value label for that bar. Knowing this, we can compute the width of the positive bar.
      let realPositiveBarWidth = outerWidth - maxLeftGroupingLabelWidth - rightMostValueLabelWidth - padding;
      // From the positive bar width, we can compute the negative bar width
      let realNegativeBarWidth = this._getMostNegativeBarWidth(realPositiveBarWidth);
      leftWidth = maxLeftGroupingLabelWidth - realNegativeBarWidth;
    }

    // This is the inverse of the logic above used for leftWidth
    if (maxPositiveBarWidth + rightMostValueLabelWidth > maxRightGroupingLabelWidth) {
      rightWidth = rightMostValueLabelWidth;
    } else {
      let realNegativeBarWidth = outerWidth - maxRightGroupingLabelWidth - leftMostValueLabelWidth - padding;
      let realPositiveBarWidth = this._getMostPositiveBarWidth(realNegativeBarWidth);
      rightWidth = maxRightGroupingLabelWidth - realPositiveBarWidth;
    }

    return {
      left: leftWidth,
      right: rightWidth
    };
  },

  /*
   * Compute the width of a bar in the chart, given its value and a scaling function
   * @see _xScaleForWidth
   * @private
   * @param {Number} value The value to compute the bar width for
   * @param {Function} scaleFunction The function that scales values to the width of the chart
   * @return {Number}
   */
  _computeBarWidth: function(value, scaleFunction) {
    return Math.abs(scaleFunction(value) - scaleFunction(0));
  },

  /*
   * For charts with a mix of positive and negative values, given the width of
   * the most positive bar, get the width of the most negative bar. The ratio
   * of the widths of the two bars is the same as the ratio between the min and
   * max values
   * @private
   * @param {Number} mostPositiveBarWidth
   * @return {Number}
   */
  _getMostNegativeBarWidth: function(mostPositiveBarWidth) {
    const max = this.get('maxValue');
    const min = Math.abs(this.get('minValue'));
    return mostPositiveBarWidth * (min / max);
  },

  /*
   * For charts with a mix of positive and negative values, given the width of
   * the most negative bar, get the width of the most positive bar. The ratio
   * of the widths of the two bars is the same as the ratio between the max and
   * min values
   * @private
   * @param {Number} mostNegativeBarWidth
   * @return {Number}
   */
  _getMostPositiveBarWidth: function(mostNegativeBarWidth) {
    const max = this.get('maxValue');
    const min = Math.abs(this.get('minValue'));
    return mostNegativeBarWidth * (max / min);
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
   * Given an array of SVG elements and a value, return the width of the element in the array
   * at the same index as the value is in the list of all values
   * @private
   * @param {Array.<SVGElement>} elements The elements to search in
   * @param {Number} value The value to search for
   * @return {Number}
   */
  _getElementWidthForValue: function(elements, value) {
    return this._getElementForValue(elements, value).getComputedTextLength();
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
    // the edge of the chart.  If the chart can be scrolled around we need a
    // little extra padding to deal with the scrollbars.
    const labelPadding = this.get('labelPadding');
    const axisTitleOffset = this.get('yAxisTitleHeightOffset');

    this.setProperties({
      horizontalMarginLeft: labelWidths.left + labelPadding + axisTitleOffset,
      horizontalMarginRight: labelWidths.right + labelPadding + (this.get('isInteractive') ? 15 : 0)
    });

    const maxLabelWidth = this.get('maxLabelWidth');
    if (!Ember.isNone(maxLabelWidth)) {
      const labelTrimmer = LabelTrimmer.create({
        getLabelSize: () => maxLabelWidth,
        getLabelText: (d) => d.label
      });

      groups.select('text.group')
        .call(labelTrimmer.get('trim'));
    }

  }
});

export default HorizontalBarChartComponent;
