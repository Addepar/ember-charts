import Ember from 'ember';
import * as d3 from 'd3';

export default Ember.Mixin.create({

  // # ----------------------------------------------------------------------
  // # HasTimeSeriesRule -- Overview
  // # ----------------------------------------------------------------------
  // # Provides mouseover interaction for time series line chart. As user
  // # moves mouse to left and right, markers are placed on the line chart.

  // # ----------------------------------------------------------------------
  // # API -- Inputs
  // #
  // # $viewport: the viewport of the chart on which the time series rule
  // # will be displayed
  // # xRange: the range of positions of the chart in the x dimension
  // # yRange: the range of positions of the chart in the y dimension
  // # xTimeScale: a mapping from time to x position
  // # hasLineData: specifies if the mixing in class has line data
  // # showDetails: function to be called on mouseing over the line marker
  // # hideDetails: function to be called on mouseing out of the line marker
  // # lineColorFn: function which returns a line color, used for fill
  // # color of markers
  // # graphicHeight: height of graphic containing lines
  // # isInteractive: specifies whether the chart is interactive
  // # ----------------------------------------------------------------------
  xRange: null,
  yRange: null,
  xTimeScale: null,
  showDetails: null,
  hideDetails: null,
  lineColorFn: null,
  graphicHeight: null,

  willDestroyElement: function() {
    if(this._hasMouseEventListeners) {
      let lineMarkers = this._getLineMarkers();
      lineMarkers.on('mouseover', null);
      lineMarkers.on('mouseout', null);
    }

    this._super(...arguments);
  },

  // # ----------------------------------------------------------------------
  // # Drawing Functions
  // # ----------------------------------------------------------------------

  updateLineMarkers: function() {
    var lineMarkers = this._getLineMarkers();
    var showDetails = this.get('showDetails');
    var hideDetails = this.get('hideDetails');
    this._hasMouseEventListeners = true;

    lineMarkers.enter()
      .append('path')
      .on("mouseover", function(d, i) { return showDetails(d, i, this); })
      .on("mouseout", function(d, i) { return hideDetails(d, i, this); })
      .attr({
        class: 'line-marker',
        fill: this.get('lineColorFn'),
        d: d3.svg.symbol().size(50).type('circle')
      });

    lineMarkers.exit().remove();

    // # Update the line marker icons with the latest position data
    lineMarkers.attr({
      transform: function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      }
    });

    lineMarkers.style({
      'stroke-width': function(d) {
        return d3.select(d.path).attr('stroke-width');
      }
    });
  },

  // # ----------------------------------------------------------------------
  // # Selections
  // # ----------------------------------------------------------------------

  // # Returns a selection containing the line markers, which binds the line
  // # marker data upon each update
  _getLineMarkers: function() {
    return this.get('viewport').selectAll('.line-marker').data(this._lineMarkerData());
  },

  // # ----------------------------------------------------------------------
  // # Event Bindings
  // # ----------------------------------------------------------------------

  // # Bind event handlers to the viewport to keep the position of line
  // # markers up to date. Responsibility for showing and hiding
  // # the lineMarkers is delegated to the chart.
  didInsertElement: function() {
    var _this = this;
    this._super();

    d3.select(this.$('svg')[0]).on('mousemove', function() {
      if (!_this.get('isInteractive')) {
        return;
      }
      // # Check if we are within the domain/range of the data
      if (_this._isEventWithinValidRange()) {
        Ember.run(_this, _this.get('updateLineMarkers'));
      }
    });
  },

  // # ----------------------------------------------------------------------
  // # Private Methods -- Data
  // # ----------------------------------------------------------------------

  // # The amount of acceptable error in the x-position of the vertical line rule,
  // # in msec. This is necessary because bisection is used to find where to place
  // # the vertical rule in time domain. The default tolerance here is one hour
  _lineMarkerTolerance: 60 * 1000,

  // # The mouse position of an event with respect to the chart viewport
  _mousePosition: function() {
    if (!d3.event) {
      return null;
    }
    return d3.mouse(this.get('$viewport'));
  },

  // # if the mouse position is within the xRange and yRange of the
  // # implementing object
  _isEventWithinValidRange: function() {
    var xRange = this.get('xRange');
    var yRange = this.get('yRange');
    var x = this._mousePosition()[0];
    var y = this._mousePosition()[1];

    var inX = d3.min(xRange) < x < d3.max(xRange);
    var inY = d3.min(yRange) < y < d3.max(yRange);
    return inX && inY;
  },

  // # To locate each marker for the given location of the rule on the x-axis
  _lineMarkerData: function() {
    var mousePosition = this._mousePosition();
    if (Ember.isEmpty(mousePosition)) {
      return [];
    }

    var invXScale = this.get('xTimeScale').invert;
    var invYScale = this.get('yScale').invert;
    var lineMarkerTolerance = this.get('_lineMarkerTolerance');

    var timeX = invXScale(mousePosition[0]);

    var markerData = [];
    this.get('viewport').selectAll('path.line').each(function(d) {
      // # Before working on the line we need to check that we have the SVG Line
      // # and not any arbitrary node.  Note: you would think that 'path' would
      // # select for SVG
      if (this instanceof SVGPathElement) {
        // # Count up the number of bisections, stopping after bisecting
        // # maxIterations number of times. In case the bisection does not
        // # converge, stop after 25 iterations, which should be enough for any
        // # reasonable time range
        var iterations = 0;
        var maxIterations = 25;

        // # Perform a binary search along the length of each SVG path, calling
        // # getPointAtLength and testing where it falls relative to the position
        // # corresponding to the location of the rule
        var searchStart = 0;
        var searchEnd = this.getTotalLength();
        var searchLen = searchEnd / 2;

        var point = this.getPointAtLength(searchLen);
        while (Math.abs(timeX - invXScale(point.x)) > lineMarkerTolerance && maxIterations > ++iterations) {
          if (timeX < invXScale(point.x)) {
            searchEnd = searchLen;
          } else {
            searchStart = searchLen;
          }
          searchLen = (searchStart + searchEnd) / 2;
          point = this.getPointAtLength(searchLen);
        }

        // # Push location of the point, information that will be displayed on hover,
        // # and a reference to the line graphic that the point marks, on to a list
        // # which will be used to construct a d3 selection of each line marker
        return markerData.push({
          x: point.x,
          y: point.y,
          group: d.group,
          value: invYScale(point.y),
          time: invXScale(point.x),
          path: this
        });
      }
    });
    return markerData;
  }

});
