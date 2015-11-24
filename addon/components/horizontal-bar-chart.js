import Ember from 'ember';
import ChartComponent from './chart-component';
import FormattableMixin from '../mixins/formattable';

import FloatingTooltipMixin from '../mixins/floating-tooltip';
import SortableChartMixin from '../mixins/sortable-chart';
import LabelWidthMixin from '../mixins/label-width';

import LabelTrimmer from '../utils/label-trimmer';

export default ChartComponent.extend(FloatingTooltipMixin,
  FormattableMixin, SortableChartMixin, LabelWidthMixin, {
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

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  finishedData: Ember.computed.alias('sortedData'),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

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
  marginBottom: Ember.computed.alias('labelPadding'),

  // horizontalMargin: Ember.computed.readOnly('labelWidth'),

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
        // Balance negative and positive axes if we have a mix of positive and
        // negative values
        const absMax = d3.max([-minValue, maxValue]);
        return [-absMax, absMax];
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
      .range([0, this.get('width')])
      .nice();
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
      var content = "<span class=\"tip-label\">" + data.label + "</span>";
      // Line 2
      content += "<span class=\"name\">" + this.get('tooltipValueDisplayName') + ": </span>";
      content += "<span class=\"value\">" + formatLabel(data.value) + "</span>";
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
        return "translate(" + xScale(value) + ", " + yScale(i) + ")";
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
          return "fill:" + d.color;
        }
        var color = (d.value < 0) ? this.get('mostTintedColor') : this.get('leastTintedColor');
        return "fill:" + color;
      }
    };
  }),

  valueLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
    var xScale = this.get('xScale');
    // Anchor the label 'labelPadding' away from the zero line
    // How to anchor the text depends on the direction of the bar
    return {
      x: (d) => {
        if (d.value < 0) {
          return -this.get('labelPadding');
        } else {
          return xScale(d.value) - xScale(0) + this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': (d) => d.value < 0 ? 'end' : 'start',
      'stroke-width': 0
    };
  }),

  groupLabelAttrs: Ember.computed('xScale', 'barThickness', 'labelPadding', function() {
    var xScale = this.get('xScale');

    // Anchor the label 'labelPadding' away from the zero line
    // How to anchor the text depends on the direction of the bar
    return {
      x: (d) => {
        if (d.value < 0) {
          return xScale(0) - xScale(d.value) + this.get('labelPadding');
        } else {
          return -this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': (d) => d.value < 0 ? 'start' : 'end',
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

  renderVars: [
    'barThickness',
    'yScale',
    'finishedData',
    'colorRange'
  ],

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
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });
    entering.append('rect');
    entering.append('text').attr('class', 'value');
    entering.append('text').attr('class', 'group');

    return groups.exit().remove();
  },

  updateAxes: function() {
    return this.get('yAxis').attr(this.get('axisAttrs'));
  },

  updateGraphic: function() {
    var groups = this.get('groups')
      .attr(this.get('groupAttrs'));

    groups.select('text.value')
      .text((d) => this.get('formatLabelFunction')(d.value))
      .attr(this.get('valueLabelAttrs'));

    const valueLabelElements = groups.select('text.value')[0];
    const maxValueLabelWidth = d3.max(_.map(valueLabelElements, (element) => {
      return element.getComputedTextLength();
    }));

    const groupLabelElements = groups.select('text.group')[0];
    const maxGroupLabelWidth = d3.max(_.map(groupLabelElements, (element) => {
      return element.getComputedTextLength();
    }));

    this.set('horizontalMarginLeft', maxGroupLabelWidth + this.get('labelPadding') + 5);
    this.set('horizontalMarginRight', maxValueLabelWidth + this.get('labelPadding') + 5);

    groups.select('rect')
      .attr(this.get('barAttrs'));

    var labelWidth;
    // If the chart contains a mix of negative and positive values, the axis
    // and labels are in the middle of the chart, not at the edges of the chart,
    // so allow more space to compute how the label is trimmed.
    if (this.get('hasNegativeValues') && this.get('hasPositiveValues')) {
      labelWidth = this.get('outerWidth') / 2;
    } else {
      labelWidth = this.get('labelWidth');
    }
    var labelTrimmer = LabelTrimmer.create({
      getLabelSize: () => labelWidth,
      getLabelText: (d) => d.label
    });

    return groups.select('text.group')
      .text((d) => d.label)
      .attr(this.get('groupLabelAttrs'))
      .call(labelTrimmer.get('trim'));
  }
});
