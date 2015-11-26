import Ember from 'ember';
import ChartComponent from './chart-component';

import LegendMixin from '../mixins/legend';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import AxesMixin from '../mixins/axes';
import NoMarginChartMixin from '../mixins/no-margin-chart';
import AxisTitlesMixin from '../mixins/axis-titles';

import { groupBy } from '../utils/group-by';

const ScatterChartComponent = ChartComponent.extend(LegendMixin, FloatingTooltipMixin,
  AxesMixin, NoMarginChartMixin, AxisTitlesMixin, {

  classNames: ['chart-scatter'],

  // ----------------------------------------------------------------------------
  // Scatter Plot Options
  // ----------------------------------------------------------------------------

  // Getters for formatting human-readable labels from provided data
  formatXValue: d3.format(',.2f'),
  formatYValue: d3.format(',.2f'),

  // Size of each icon on the scatter plot
  dotRadius: 7,

  dotShapeArea: Ember.computed('dotRadius', function() {
    return Math.pow(this.get('dotRadius'), 2);
  }),

  // Amount to pad the extent of input data so that all displayed points fit
  // neatly within the viewport, as a proportion of the x- and y-range
  graphPadding: 0.05,

  // Increase the amount of space between ticks for scatter, basically if we are
  // too aggressive with the tick spacing 1) labels are more likely to be
  // squished together and 2) it is hard for the "nice"ing of the ticks, i.e.,
  // trying to end on actual tick intervals. It would be good to force ticks to
  // end where we want them, but reading the d3.js literature it was not clear
  // how to easily do that.
  tickSpacing: 80,

  // NoMarginChartMixin makes right margin 0 but we need that room because the
  // last label of the axis is commonly too large
  marginRight: Ember.computed.alias('horizontalMargin'),

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  isShowingTotal: false,
  totalPointData: null,

  // Data with invalid/negative values removed
  filteredData: Ember.computed('data.@each', function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(d) {
      return (d.xValue != null) && (d.yValue != null) && isFinite(d.xValue) && isFinite(d.yValue);
    });
  }),

  // Aggregate the raw data by group, into separate lists of data points
  groupedData: Ember.computed('filteredData.@each', function() {
    var data = this.get('filteredData');
    if (Ember.isEmpty(data)) {
      return [];
    }

    var groupedData = groupBy(data, (d) => d.group || this.get('ungroupedSeriesName'));

    this.set('groupNames', _.keys(groupedData));
    return _.values(groupedData);
  }),

  groupNames: [],

  numGroups: Ember.computed.alias('groupedData.length'),

  isGrouped: Ember.computed('numGroups', function() {
    return this.get('numGroups') > 1;
  }),

  finishedData: Ember.computed.alias('groupedData'),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  // Chart Graphic Dimensions
  graphicTop: Ember.computed.alias('axisTitleHeight'),
  graphicLeft: Ember.computed.alias('labelWidthOffset'),

  graphicHeight: Ember.computed('height', 'legendHeight', 'legendChartPadding', function() {
    return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
  }),

  graphicWidth: Ember.computed('width', 'labelWidthOffset', function() {
    return this.get('width') - this.get('labelWidthOffset');
  }),

  // ----------------------------------------------------------------------------
  // Ticks and Scales
  // ----------------------------------------------------------------------------

  xDomain: Ember.computed('filteredData.@each', 'isShowingTotal', 'totalPointData', function() {
    var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    var _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
      return d.xValue;
    });
    var xMin = _ref[0];
    var xMax = _ref[1];
    if ((xMin === xMax && xMax === 0)) {
      return [-1, 1];
    } else if (xMin === xMax) {
      return [xMin * (1 - this.get('graphPadding')), xMin * (1 + this.get('graphPadding'))];
    } else {
      return [xMin, xMax];
    }
  }),

  yDomain: Ember.computed('filteredData.@each', 'isShowingTotal', 'totalPointData', 'graphPadding', function() {
    var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    var _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
      return d.yValue;
    });
    var yMin = _ref[0];
    var yMax = _ref[1];

    if ((yMin === yMax && yMax === 0)) {
      return [-1, 1];
    } else if (yMin === yMax) {
      return [yMin * (1 - this.get('graphPadding')), yMin * (1 + this.get('graphPadding'))];
    } else {
      return [yMin, yMax];
    }
  }),

  // The X axis scale spans the range of Y values plus any graphPadding
  xScale: Ember.computed('xDomain', 'graphPadding', 'graphicLeft', 'graphicWidth', 'numXTicks', function() {
    var xDomain = this.get('xDomain');
    var graphicLeft = this.get('graphicLeft');
    var graphicWidth = this.get('graphicWidth');
    var padding = (xDomain[1] - xDomain[0]) * this.get('graphPadding');

    return d3.scale.linear()
            .domain([xDomain[0] - padding, xDomain[1] + padding]).range([graphicLeft, graphicLeft + graphicWidth])
            .nice(this.get('numXTicks'));
  }),

  // The Y axis scale spans the range of Y values plus any graphPadding
  yScale: Ember.computed('yDomain', 'graphPadding', 'graphicTop', 'graphicHeight', 'numYTicks', function() {
    var yDomain = this.get('yDomain');
    var graphicTop = this.get('graphicTop');
    var graphicHeight = this.get('graphicHeight');
    var padding = (yDomain[1] - yDomain[0]) * this.get('graphPadding');

    return d3.scale.linear().domain([yDomain[0] - padding, yDomain[1] + padding])
            .range([graphicTop + graphicHeight, graphicTop])
            .nice(this.get('numYTicks'));
  }),

  // ----------------------------------------------------------------------------
  // Graphics Properties
  // ----------------------------------------------------------------------------

  // Scatterplots handle different groups by varying shape of dot first and then
  // vary color or tint of seed color.
  groupShapes: Ember.computed(function() {
    return ['circle', 'square', 'triangle-up', 'cross', 'diamond'];
  }),

  numGroupShapes: Ember.computed.alias('groupShapes.length'),

  // Fixed number of colors for scatter plots, total different dot types is
  // numGroupsShapes * numGroupColors
  numGroupColors: 2,

  maxNumGroups: Ember.computed('numGroupColors', 'numGroupShapes', function() {
    return this.get('numGroupColors') * this.get('numGroupShapes');
  }),

  // Only display a different icon for each group if the number of groups is less
  // than or equal to the maximum number of groups
  displayGroups: Ember.computed('isGrouped', 'numGroups', 'numGroupShapes', function() {
    return this.get('isGrouped') && this.get('numGroups') <= this.get('maxNumGroups');
  }),

  // Since we are only provided with the index of each dot within its <g>, we
  // decide the shape and color of the dot using the index of its group property
  getGroupShape: Ember.computed(function() {
    return (d, i) => {
      i = this.get('groupNames').indexOf(d.group);
      if (!this.get('displayGroups')) {
        return 'circle';
      }
      return this.get('groupShapes')[i % this.get('numGroupShapes')];
    };
  }),

  getGroupColor: Ember.computed(function() {
    return (d, i) => {
      var colorIndex = 0;
      if (this.get('displayGroups')) {
        i = this.get('groupNames').indexOf(d.group);
        colorIndex = Math.floor(i / this.get('numGroupShapes'));
      }
      return this.get('colorScale')(colorIndex / this.get('numGroupColors'));
    };
  }),

  // ----------------------------------------------------------------------------
  // Legend Configuration
  // ----------------------------------------------------------------------------

  hasLegend: Ember.computed('isGrouped', 'showLegend', function() {
    return this.get('isGrouped') && this.get('showLegend');
  }),

  legendIconRadius: Ember.computed.alias('dotRadius'),

  legendItems: Ember.computed('hasNoData', 'groupedData', 'getGroupShape', 'getGroupColor',
        'displayGroups', 'isShowingTotal', 'totalPointData', function() {

    if (this.get('hasNoData')) {
      return [];
    }
    var getGroupShape = this.get('getGroupShape');
    var getGroupColor = this.get('getGroupColor');
    var displayGroups = this.get('displayGroups');

    var legendData = this.get('groupedData').map(function(d, i) {
      var name = d[0].group;
      var value = d.length === 1 ? d[0] : null;
      return {
        label: name,
        group: name,
        stroke: getGroupColor,
        fill: displayGroups ? getGroupColor : 'transparent',
        icon: getGroupShape,
        selector: ".group-" + i,
        xValue: value != null ? value.xValue : void 0,
        yValue: value != null ? value.yValue : void 0
      };
    });

    if (this.get('isShowingTotal')) {
      var point = this.get('totalPointData');
      legendData.unshift({
        label: point.group,
        group: point.group,
        stroke: getGroupColor,
        selector: '.totalgroup',
        xValue: point.xValue,
        yValue: point.yValue
      });
    }

    return legendData;
  }),

  // ----------------------------------------------------------------------------
  // Tooltip Configuration
  // ----------------------------------------------------------------------------

  xValueDisplayName: 'X Factor',
  yValueDisplayName: 'Y Factor',

  showDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      d3.select(element).classed('hovered', true);
      var formatXValue = this.get('formatXValue');
      var formatYValue = this.get('formatYValue');
      var content = "<span class=\"tip-label\">" + data.group + "</span>";
      content += "<span class=\"name\">" + (this.get('xValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatXValue(data.xValue)) + "</span><br/>";
      content += "<span class=\"name\">" + (this.get('yValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatYValue(data.yValue)) + "</span>";

      return this.showTooltip(content, d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (data, i, element) => {
      d3.select(element).classed('hovered', false);
      return this.hideTooltip();
    };
  }),

  // ----------------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------------

  groupAttrs: Ember.computed(function() {
    return {
      "class": function(d, i) {
        return "group group-" + i;
      }
    };
  }),

  pointAttrs: Ember.computed('dotShapeArea', 'getGroupShape', 'xScale',
    'yScale', 'displayGroups', 'getGroupColor', function() {
    return {
      d: d3.svg.symbol().size(this.get('dotShapeArea')).type(this.get('getGroupShape')),
      fill: this.get('displayGroups') ? this.get('getGroupColor') : 'transparent',
      stroke: this.get('getGroupColor'),
      'stroke-width': 1.5,
      transform: (d) => {
        var dx = this.get('xScale')(d.xValue);
        var dy = this.get('yScale')(d.yValue);
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }),

  // ----------------------------------------------------------------------------
  // Selections
  // ----------------------------------------------------------------------------

  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.group').data(this.get('finishedData'));
  }).volatile(),

  selectOrCreateAxis: function(selector) {
    var axis = this.get('viewport').select(selector);
    if (axis.empty()) {
      return this.get('viewport').insert('g', ':first-child');
    } else {
      return axis;
    }
  },

  xAxis: Ember.computed(function() {
    return this.selectOrCreateAxis('.x.axis').attr('class', 'x axis');
  }).volatile(),

  yAxis: Ember.computed(function() {
    return this.selectOrCreateAxis('.y.axis').attr('class', 'y axis');
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  renderVars: [
    'xScale',
    'yScale',
    'dotShapeArea',
    'finishedData',
    'xValueDisplayName',
    'yValueDisplayName',
    'hasAxisTitles', // backward compatibility support.
    'hasXAxisTitle',
    'hasYAxisTitle',
    'xTitleHorizontalOffset',
    'yTitleVerticalOffset'
  ],

  drawChart: function() {
    this.updateTotalPointData();
    this.updateData();
    this.updateAxes();
    this.updateGraphic();
    this.updateAxisTitles();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },

  totalPointShape: Ember.computed(function() {
    var dotShapeArea = this.get('dotShapeArea');

    return (selection) => {
      selection.append('path').attr({
        "class": 'totaldot',
        d: d3.svg.symbol().size(dotShapeArea).type('circle'),
        fill: this.get('getGroupColor')
      });

      return selection.append('path').attr({
        "class": 'totaloutline',
        d: d3.svg.symbol().size(dotShapeArea * 3).type('circle'),
        fill: 'transparent',
        stroke: this.get('getGroupColor'),
        'stroke-width': 2
      });
    };
  }),

  updateTotalPointData: function() {
    var totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    var totalPoint = this.get('viewport')
                        .selectAll('.totalgroup')
                        .data(totalData);
    totalPoint.exit().remove();

    return totalPoint.enter()
            .append('g')
            .attr('class', 'totalgroup')
            .call(this.get('totalPointShape'));
  },

  updateData: function() {
    var groups, points;
    groups = this.get('groups');
    groups.enter()
      .append('g')
      .attr('class', 'group')
      .attr(this.get('groupAttrs'));
    groups.exit().remove();
    points = groups.selectAll('.dot').data(function(d) {
      return d;
    });
    points.enter()
      .append('path')
      .attr('class', 'dot');

    return points.exit().remove();
  },

  updateAxes: function() {
    var xAxis = d3.svg.axis().scale(this.get('xScale')).orient('top').ticks(this.get('numXTicks')).tickSize(this.get('graphicHeight')).tickFormat(this.get('formatXValue'));
    var yAxis = d3.svg.axis().scale(this.get('yScale')).orient('right').ticks(this.get('numYTicks')).tickSize(this.get('graphicWidth')).tickFormat(this.get('formatYValue'));
    var graphicTop = this.get('graphicTop');
    var graphicHeight = this.get('graphicHeight');
    var gXAxis = this.get('xAxis')
            .attr('transform', "translate(0," + (graphicTop + graphicHeight) + ")")
            .call(xAxis);
    gXAxis.selectAll('g').filter(function(d) {
      return d !== 0;
    }).classed('major', false)
      .classed('minor', true);

    var labelPadding = this.get('labelPadding');
    gXAxis.selectAll('text').style('text-anchor', 'middle').attr({
      y: function() {
        return this.getBBox().height + labelPadding / 2;
      }
    });
    var gYAxis = this.get('yAxis');

    this.set('graphicLeft', this.maxLabelLength(gYAxis.selectAll('text')) + this.get('labelPadding'));
    var graphicLeft = this.get('graphicLeft');
    gYAxis.attr('transform', "translate(" + graphicLeft + ",0)").call(yAxis);

    gYAxis.selectAll('g').filter(function(d) {
      return d !== 0;
    }).classed('major', false).classed('minor', true);

    gYAxis.selectAll('text').style('text-anchor', 'end').attr({
      x: -this.get('labelPadding')
    });
  },

  updateGraphic: function() {
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');

    this.get('groups')
      .selectAll('.dot')
      .attr(this.get('pointAttrs'))
    .on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });

    return this.get('viewport').select('.totalgroup').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    }).attr({
      transform: (d) => {
        var dx, dy;
        dx = this.get('xScale')(d.xValue);
        dy = this.get('yScale')(d.yValue);
        return "translate(" + dx + ", " + dy + ")";
      }
    });
  }
});

export default ScatterChartComponent;
