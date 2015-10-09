import Ember from 'ember';
import ChartComponent from './chart-component';

import FloatingTooltipMixin from '../mixins/floating-tooltip';

export default ChartComponent.extend(FloatingTooltipMixin, {
  classNames: ['chart-bubble'],

  // ----------------------------------------------------------------------------
  // Bubble Chart Options
  // ----------------------------------------------------------------------------
  // used when setting up force and
  // moving around nodes
  // TODO(tony) camel case
  layoutGravity: -0.01,
  damper: 0.1,

  // Charge function that is called for each node.
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  // Charge is negative because we want nodes to
  // repel.
  // Dividing by 8 scales down the charge to be
  // appropriate for the visualization dimensions.
  charge: Ember.computed(function() {
    return function(d) {
      return -Math.pow(d.radius, 2.0) / 8;
    };
  }),

  // Getters for formatting human-readable labels from provided data
  formatLabel: d3.format(',.2f'),

  // ----------------------------------------------------------------------------
  // Tooltip Configuration
  // ----------------------------------------------------------------------------

  showDetails: Ember.computed('isInteractive', function() {
    if (this.get('isInteractive')) {
      return Ember.K;
    }

    return function(data, i, element) {
      // Do hover detail style stuff here
      d3.select(element).classed('hovered', true);

      // Show tooltip
      var formatLabel = this.get('formatLabel');
      // Line 1
      var content = "<span class=\"tip-label\">" + data.label + "</span>";
      // Line 2
      content +="<span class=\"name\">" + this.get('tooltipValueDisplayName') + ": </span>";
      content +="<span class=\"value\">" + formatLabel(data.value) + "</span>";
      return this.showTooltip(content, d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (this.get('isInteractive')) {
      return Ember.K;
    }

    return function(data, i, element) {
      // Undo hover style stuff
      d3.select(element).classed('hovered', false);
      // Hide Tooltip
      return this.hideTooltip();
    };
  }),

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  renderVars: ['selectedSeedColor'],

  // Sqrt scaling between data and radius
  radiusScale: Ember.computed('data', 'width', 'height', function() {
    // use the max total_amount in the data as the max in the scale's domain
    var maxAmount = d3.max(this.get('data'), function(d) { return d.value; });
    var maxRadius = d3.min([this.get('width'), this.get('height')]) / 7;
    // TODO(tony): get rid of hard coded values
    return d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([2, maxRadius]);
  }),

  nodeData: Ember.computed('radiusScale', function() {
    var data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }

    var radiusScale = this.get('radiusScale');
    var _this = this;
    var nodes = data.map(function(d) {
      return {
        radius: radiusScale(d.value),
        value: d.value,
        label: d.label,
        id: d.label,
        x: Math.random() * _this.get('width') / 2,
        y: Math.random() * _this.get('height') / 2
      };
    });

    nodes.sort(function(a, b) { return b.value - a.value; });
    return nodes;
  }),

  finishedData: Ember.computed.alias('nodeData'),

  numColorSeries: Ember.computed.alias('finishedData.length'),

  drawChart: function() {
    return this.updateVis();
  },

  updateVis: function() {
    var vis = this.get('viewport');
    var nodes = this.get('nodeData');
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');
    var fill_color = this.get('getSeriesColor');

    var circles = vis.selectAll("circle")
      .data(nodes, function(d) { return d.id; });

    circles.enter().append("circle")
      // radius will be set to 0 initially.
      // see transition below
      .attr("r", 0)
      .attr("id", function(d) { return "bubble_" + d.id; })
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); });

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    circles.transition().duration(2000).attr("r", function(d) { return d.radius; });

    circles
      .attr("fill", fill_color)
      .attr("stroke-width", 2)
      .attr("stroke", function(d, i) { return d3.rgb(fill_color(d, i)).darker(); });

    circles.exit().remove();

    // Moves all circles towards the @center
    // of the visualization
    var _this = this;
    var move_towards_center = function(alpha) {
      var center = {
        x: _this.get('width') / 2,
        y: _this.get('height') / 2
      };
      return function(d) {
        d.x = d.x + (center.x - d.x) * (_this.get('damper') + 0.02) * alpha;
        d.y = d.y + (center.y - d.y) * (_this.get('damper') + 0.02) * alpha;
      };
    };

    // Start the forces
    var force = d3.layout.force()
      .nodes(nodes).size([_this.get('width'), _this.get('height')]);

    // Display all
    force.gravity(this.get('layoutGravity'))
      .charge(this.get('charge'))
      .friction(0.9)
      .on("tick", function(e) {
        circles.each(move_towards_center(e.alpha))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      });
    force.start();

    return vis.selectAll(".years").remove();
  }
});
