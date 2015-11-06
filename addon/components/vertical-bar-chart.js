import Ember from 'ember';
import ChartComponent from './chart-component';
import LegendMixin from '../mixins/legend';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import AxesMixin from '../mixins/axes';
import FormattableMixin from '../mixins/formattable';
import SortableChartMixin from '../mixins/sortable-chart';
import NoMarginChartMixin from '../mixins/no-margin-chart';

import { groupBy } from '../utils/group-by';
import LabelTrimmer from '../utils/label-trimmer';

export default ChartComponent.extend(LegendMixin, FloatingTooltipMixin, AxesMixin,
  FormattableMixin, SortableChartMixin, NoMarginChartMixin, {

  classNames: ['chart-vertical-bar'],

  // ----------------------------------------------------------------------------
  // Vertical Bar Chart Options
  // ----------------------------------------------------------------------------

  // Data without group will be merged into a group with this name
  ungroupedSeriesName: 'Other',

  // If stackBars is yes then it stacks bars, otherwise it groups them
  // horizontally. Stacking discards negative data.
  // TODO(nick): make stacked bars deal gracefully with negative data
  stackBars: false,

  // Space between bars, as fraction of bar size
  withinGroupPadding: 0,

  // Space between bar groups, as fraction of group size
  betweenGroupPadding: Ember.computed('numBars', function() {
    // Use padding to make sure bars have a maximum thickness.
    //
    // TODO(tony): Use exact padding + bar width calculation
    // We have some set amount of bewtween group padding we use depending
    // on the number of bars there are in the chart. Really, what we would want
    // to do is have the equation for bar width based on padding and use that
    // to set the padding exactly.
    var scale = d3.scale.linear().domain([1, 8]).range([1.25, 0.25]).clamp(true);
    return scale(this.get('numBars'));
  }),

  numBars: Ember.computed('xBetweenGroupDomain', 'xWithinGroupDomain', function() {
    return this.getWithDefault('xBetweenGroupDomain.length', 0) *
      this.getWithDefault('xWithinGroupDomain.length', 0);
  }),

  // Space allocated for rotated labels on the bottom of the chart. If labels
  // are rotated, they will be extended beyond labelHeight up to maxLabelHeight
  maxLabelHeight: 50,

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  // Override sortedData from SortableChartMixin
  sortedData: Ember.computed('stackBars', '_sortedStackedBarData',
    'defaultSortedData', function() {
    if (this.get('stackBars')) {
      return this.get('_sortedStackedBarData');
    } else {
      return this.get('defaultSortedData');
    }
  }),

  _sortedStackedBarData: Ember.computed('data.[]', 'sortKey', 'sortAscending',
    function() {
    const data = this.get('data');

    if (Ember.isEmpty(data)) {
      return [];
    }

    const groupedData = _.groupBy(data, (d) => d.group);
    const summedGroupValues = Ember.A();
    const reduceByValue = (previousValue, dataObject) =>
      previousValue + dataObject.value;

    _.forOwn(groupedData, (groupData, group) => {
      if (group !== null) {
        summedGroupValues.pushObject({
          group: group,
          value: groupData.reduce(reduceByValue, 0)
        });
      }
    });

    const key = this.get('sortKey');
    const sortAscending = this.get('sortAscending');

    if (Ember.isEmpty(summedGroupValues)) {
      return Ember.A();
    } else if (key != null) {
      let sortedGroups = summedGroupValues.sortBy(key);
      if (!sortAscending) {
        sortedGroups = sortedGroups.reverse();
      }
      const newData = Ember.A();
      sortedGroups.forEach((groupObj) => {
        const group = groupObj.group;
        newData.pushObjects(groupedData[group]);
      });

      return newData;
    } else {
      return data;
    }
  }),

  // Aggregates objects provided in `data` in a dictionary, keyed by group names
  groupedData: Ember.computed('sortedData', 'stackBars', 'ungroupedSeriesName', function() {
    var data = this.get('sortedData');
    if (Ember.isEmpty(data)) {
      // TODO(embooglement): this can't be `Ember.A()` because it needs to be an
      // actual empty array for tests to pass, and `Ember.NativeArray` adds
      // a bunch of stuff to the prototype that gets enumerated by `_.values`
      // in `individualBarLabels`
    	return [];
   	}

    data = groupBy(data, (d) => d.group || this.get('ungroupedSeriesName'));

    // After grouping, the data points may be out of order, and therefore not properly
    // matched with their value and color. Here, we resort to ensure proper order.
    // This could potentially be addressed with a refactor where sorting happens after
    // grouping across the board.
    // TODO(ember-charts-lodash): Use _.mapValues instead of the each loop.
    _.each(_.keys(data), function(groupName) {
      data[groupName] = _.sortBy(data[groupName], 'label');
    });

    return data;
  }),

  groupNames: Ember.computed('groupedData', function() {
    return _.keys(this.get('groupedData'));
  }),

  // We know the data is grouped because it has more than one label. If there
  // are no labels on the data then every data object will have
  // 'ungroupedSeriesName' as its group name and the number of group
  // labels will be 1. If we are passed ungrouped data we will display
  // each data object in its own group.
  isGrouped: Ember.computed.gt('groupNames.length', 1),

  finishedData: Ember.computed('isGrouped', '_groupedFinishedData', 'stackBars',
    '_stackedFinishedData', 'sortedData', function() {
    if (this.get('isGrouped')) {
      return this.get('_groupedFinishedData');
    } else if (this.get('stackBars')) {
      return this.get('_stackedFinishedData');
    } else if (Ember.isEmpty(this.get('data'))) {
      return [];
    } else {
      // If we have grouped data and do not have stackBars turned on, split the
      // data up so it gets drawn in separate groups and labeled
      return _.map(this.get('sortedData'), (d) => ({
        group: d.label,
        values: [d]
      }));
    }
  }),

  _groupedFinishedData: Ember.computed('groupedData.@each.{value,group,label,color}',
    function() {
    if (Ember.isEmpty(this.get('groupedData'))) {
      return [];
    }

    return _.map(this.get('groupedData'), function(values, groupName) {
      let y0 = 0;
      let stackedValues = _.map(values, function(d) {
        return {
          y0: y0,
          y1: y0 += Math.max(d.value, 0),
          value: d.value,
          group: d.group,
          label: d.label,
          color: d.color
        };
      });

      return {
        group: groupName,
        values: values,
        stackedValues: stackedValues,
        totalValue: y0
      };
    });
  }),

  _stackedFinishedData: Ember.computed('data.@each.{value}', function() {
    if (Ember.isEmpty(this.get('data'))) {
      return [];
    }

    // If we do not have grouped data and are drawing stacked bars, keep the
    // data in one group so it gets stacked
    let y0 = 0;
    const stackedValues = _.map(this.get('data'), function(d) {
      return {
        y0: y0,
        y1: y0 += Math.max(d.value, 0)
      };
    });

    return [{
      group: this.get('data.firstObject.group'),
      values: this.get('data'),
      stackedValues: stackedValues,
      totalValue: y0
    }];
  }),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  labelHeightOffset: Ember.computed('_shouldRotateLabels', 'maxLabelHeight',
    'labelHeight', 'labelPadding', function() {

    const labelSize = this.get('_shouldRotateLabels') ? this.get('maxLabelHeight') : this.get('labelHeight');
    return labelSize + this.get('labelPadding');
  }),

  legendChartPadding: Ember.computed.alias('labelHeightOffset'),

  // Chart Graphic Dimensions
  graphicLeft: Ember.computed.alias('labelWidthOffset'),

  graphicWidth: Ember.computed('width', 'labelWidthOffset', function() {
     return this.get('width') - this.get('labelWidthOffset');
  }),

  graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
    return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
  }),

  // ----------------------------------------------------------------------------
  // Ticks and Scales
  // ----------------------------------------------------------------------------

  // Vertical position/length of each bar and its value
  yDomain: Ember.computed('finishedData.[]', 'stackBars', function() {
    const finishedData = this.get('finishedData');

    let min = 0;
    let max = 0;
    if (this.get('stackBars')) {
      // minOfStacks is always zero since we do not compute negative stacks
      // TODO(nick): make stacked bars deal gracefully with negative data
      min = d3.min(finishedData, () => 0);
      max = d3.max(finishedData, (d) => d.totalValue);
    } else {
      min = d3.min(finishedData, (d) =>
        _.min(d.values, (dd) => dd.value)
      );

      max = d3.max(finishedData, (d) =>
        _.max(d.values, (dd) => dd.value)
      );
    }

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
      .range([ this.get('graphicTop') + this.get('graphicHeight'), this.get('graphicTop') ])
      .nice(this.get('numYTicks'));
  }),

  individualBarLabels: Ember.computed('groupedData.[]', function() {
    var groups = _.map(_.values(this.get('groupedData')), function(g) {
      return _.pluck(g, 'label');
    });
    return _.uniq(_.flatten(groups));
  }),

  labelIDMapping: Ember.computed('individualBarLabels.[]', function() {
    return this.get('individualBarLabels').reduce(function(previousValue, label, index) {
      previousValue[label] = index;
      return previousValue;
    }, {});
  }),

  // The range of labels assigned to each group
  xBetweenGroupDomain: Ember.computed.alias('groupNames'),
  // xBetweenGroupDomain: [],

  // The range of labels assigned within each group
  xWithinGroupDomain: Ember.computed.alias('individualBarLabels'),

  // The space in pixels allocated to each group
  groupWidth: Ember.computed('xBetweenGroupScale', function() {
    return this.get('xBetweenGroupScale').rangeBand();
  }),

  // The space in pixels allocated to each bar
  barWidth: Ember.computed('xWithinGroupScale', function() {
    return this.get('xWithinGroupScale').rangeBand();
  }),

  // The scale used to position bars within each group
  // If we do not have grouped data, use the withinGroupPadding around group
  // data since we will have constructed groups for each bar.
  xWithinGroupScale: Ember.computed('isGrouped', 'stackBars', 'xWithinGroupDomain', 'groupWidth',
    'withinGroupPadding', 'betweenGroupPadding', function() {

    if (this.get('isGrouped') || this.get('stackBars')) {
      return d3.scale.ordinal()
        .domain(this.get('xWithinGroupDomain'))
        .rangeRoundBands( [0, this.get('groupWidth')], this.get('withinGroupPadding')/2, 0);

    } else {
      return d3.scale.ordinal()
        .domain(this.get('xWithinGroupDomain'))
        .rangeRoundBands([ 0, this.get('groupWidth') ],
          this.get('betweenGroupPadding')/2, this.get('betweenGroupPadding')/2);
    }
  }),

  // The scale used to position each group and label across the horizontal axis
  // If we do not have grouped data, do not add additional padding around groups
  // since this will only add whitespace to the left/right of the graph.
  xBetweenGroupScale: Ember.computed('isGrouped', 'stackBars', 'graphicWidth', 'labelWidth',
    'xBetweenGroupDomain', 'betweenGroupPadding', function() {

    // var labelWidth = this.get('labelWidth');
    var betweenGroupPadding;

    if (this.get('isGrouped') || this.get('stackBars')) {
      betweenGroupPadding = this.get('betweenGroupPadding');
    } else {
      betweenGroupPadding = 0;
    }

    return d3.scale.ordinal()
      .domain(this.get('xBetweenGroupDomain'))
      .rangeRoundBands([0, this.get('graphicWidth')], betweenGroupPadding / 2, betweenGroupPadding / 2);

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

  numColorSeries: Ember.computed.alias('individualBarLabels.length'),

  // ----------------------------------------------------------------------------
  // Legend Configuration
  // ----------------------------------------------------------------------------

  hasLegend: Ember.computed('stackBars', 'isGrouped', 'legendItems.length', 'showLegend', function() {
    return this.get('stackBars') || this.get('isGrouped') && this.get('legendItems.length') > 1 && this.get('showLegend');
  }),

  legendItems: Ember.computed('individualBarLabels.[]', 'getSeriesColor',
    'stackBars', 'labelIDMapping.[]', function() {
    const getSeriesColor = this.get('getSeriesColor');
    return this.get('individualBarLabels').map((label, i) => {
      const color = getSeriesColor(label, i);
      if (this.get('stackBars')) {
        i = this.get('labelIDMapping')[label];
      }
      return {
        label: label,
        fill: color,
        stroke: color,
        icon: () => 'square',
        selector: ".grouping-" + i
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
      var content =  (data.group) ? "<span class=\"tip-label\">" + data.group + "</span>" : '';

      var formatLabel = this.get('formatLabelFunction');
      var addValueLine = function(d) {
        content += "<span class=\"name\">" + d.label + ": </span>";
        return content += "<span class=\"value\">" + formatLabel(d.value) + "</span><br/>";
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

  groupAttrs: Ember.computed('graphicLeft', 'graphicTop', 'xBetweenGroupScale', function() {
    const xBetweenGroupScale = this.get('xBetweenGroupScale');
    return {
      transform: (d) => {
        const dx = xBetweenGroupScale(d.group) ? this.get('graphicLeft') + xBetweenGroupScale(d.group) : this.get('graphicLeft');
        const dy = this.get('graphicTop');
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  stackedBarAttrs: Ember.computed('yScale', 'groupWidth', 'labelIDMapping.[]', function() {
    // zeroDisplacement is the number of pixels to shift graphics away from
    // the origin line so that they do not overlap with it
    const zeroDisplacement = 1;
    const yScale = this.get('yScale');
    return {
      class: (barSection) => {
        const id = this.get('labelIDMapping')[barSection.label];
        return "grouping-" + id;
      },
      'stroke-width': 0,
      width: () => this.get('groupWidth'),
      x: null,
      y: function(barSection) {
        return yScale(barSection.y1) + zeroDisplacement;
      },
      height: function(barSection) {
        return yScale(barSection.y0) - yScale(barSection.y1);
      }
    };
  }),

  groupedBarAttrs: Ember.computed('yScale', 'getSeriesColor', 'barWidth', 'xWithinGroupScale', function() {
    const zeroDisplacement = 1;
    const yScale = this.get('yScale');
    return {
      class: (d, i) => "grouping-" + i,
      'stroke-width': 0,
      width: () => this.get('barWidth'),
      x: (d) => this.get('xWithinGroupScale')(d.label),
      height: (d) => {
        return Math.max(0, Math.abs(yScale(d.value) - yScale(0)) - zeroDisplacement);
      },
      y: function(d) {
        if (d.value > 0) {
          return yScale(d.value);
        } else {
          return yScale(0) + zeroDisplacement;
        }
      }
    };
  }),

  labelAttrs: Ember.computed('barWidth', 'isGrouped', 'stackBars', 'groupWidth',
    'xWithinGroupScale', 'graphicTop', 'graphicHeight', 'labelPadding', function() {
    return {
      'stroke-width': 0,
      transform: (d) => {
        let dx = this.get('barWidth') / 2;
        if (this.get('isGrouped') || this.get('stackBars')) {
          dx += (this.get('groupWidth') - this.get('barWidth')) / 2;
        } else {
          dx += this.get('xWithinGroupScale')(d.group);
        }
        const dy = this.get('graphicTop') + this.get('graphicHeight') + this.get('labelPadding');
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  // ----------------------------------------------------------------------------
  // Selections
  // ----------------------------------------------------------------------------

  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.bars').data(this.get('finishedData'));
  }).volatile(),

  yAxis: Ember.computed(function() {
    const yAxis = this.get('viewport').select('.y.axis');
    if (yAxis.empty()) {
      return this.get('viewport')
        .insert('g', ':first-child')
        .attr('class', 'y axis');
    } else {
      return yAxis;
    }
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Label Layout
  // ----------------------------------------------------------------------------

  // Space available for labels that are horizontally displayed. This is either
  // the unpadded group width or bar width depending on whether data is grouped
  maxLabelWidth: Ember.computed('isGrouped', 'stackBars', 'groupWidth', 'barWidth', function() {
    if (this.get('isGrouped') || this.get('stackBars')) {
      return this.get('groupWidth');
    } else {
      return this.get('barWidth');
    }
  }),

  _shouldRotateLabels: false,

  setRotateLabels: function() {
    const labels = this.get('groups').select('.groupLabel text');
    const maxLabelWidth = this.get('maxLabelWidth');
    let rotateLabels = false;
    if (this.get('rotatedLabelLength') > maxLabelWidth) {
      labels.each(function() {
        if (this.getBBox().width > maxLabelWidth) {
          rotateLabels = true;
          return true;
        }
      });
    }
    return this.set('_shouldRotateLabels', rotateLabels);
  },

  // Calculate the number of degrees to rotate labels based on how widely labels
  // will be spaced, but never rotate the labels less than 20 degrees
  rotateLabelDegrees: Ember.computed('labelHeight', 'maxLabelWidth', function() {
    const radians = Math.atan(this.get('labelHeight') / this.get('maxLabelWidth'));
    const degrees = radians * 180 / Math.PI;
    return Math.max(degrees, 20);
  }),

  rotatedLabelLength: Ember.computed('maxLabelHeight', 'rotateLabelDegrees', function() {
    var rotateLabelRadians = Math.PI / 180 * this.get('rotateLabelDegrees');
    return Math.abs(this.get('maxLabelHeight') / Math.sin(rotateLabelRadians));
  }),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  renderVars: Ember.computed(function() {
    return ['xWithinGroupScale', 'xBetweenGroupScale', 'yScale',
      'finishedData', 'getSeriesColor'];
  }),

  drawChart: function() {
    this.updateData();
    this.updateLayout();
    this.updateAxes();
    this.updateGraphic();
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

    var subdata;
    if (this.get('stackBars')) {
      subdata = function(d) { return d.stackedValues; };
    } else {
      subdata = function(d) { return d.values; };
    }

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
      .text(function(d) { return d.group; });

    // If there is enough space horizontally, center labels underneath each
    // group. Otherwise, rotate each label and anchor it at the top of its
    // first character.
    this.setRotateLabels();
    var labelTrimmer;

    if (this.get('_shouldRotateLabels')) {
      var rotateLabelDegrees = this.get('rotateLabelDegrees');
      labelTrimmer = LabelTrimmer.create({
        getLabelSize: () => this.get('rotatedLabelLength'),
        getLabelText: (d) => d.group
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
        getLabelText: (d) => d.group != null ? d.group : ''
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
    this.set('graphicLeft', this.maxLabelLength(gYAxis.selectAll('text')) + this.get('labelPadding') );


    var graphicTop = this.get('graphicTop');
    var graphicLeft = this.get('graphicLeft');
    gYAxis.attr({ transform: "translate(" + graphicLeft + ", " + graphicTop + ")" })
      .call(yAxis);

    gYAxis.selectAll('g')
      .filter(function(d) { return d !== 0; })
      .classed('major', false)
      .classed('minor', true);

    return gYAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr({
        x: -this.get('labelPadding')
      });
  },

  updateGraphic: function() {
    var groups = this.get('groups');
    var barAttrs = this.get('stackBars') ? this.get('stackedBarAttrs') : this.get('groupedBarAttrs');

    groups.attr(this.get('groupAttrs'));
    groups.selectAll('rect')
      .attr(barAttrs)
      .style('fill', this.get('getSeriesColor'));
    return groups.select('g.groupLabel')
      .attr(this.get('labelAttrs') );
  }
});
