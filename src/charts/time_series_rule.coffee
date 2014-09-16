Ember.Charts.HasTimeSeriesRule = Ember.Mixin.create
  # ----------------------------------------------------------------------
  # HasTimeSeriesRule -- Overview
  # ----------------------------------------------------------------------
  # Provides mouseover interaction for time series line chart. As user
  # moves mouse to left and right, markers are placed on the line chart.

  # ----------------------------------------------------------------------
  # API -- Inputs
  #
  # $viewport: the viewport of the chart on which the time series rule
  # will be displayed
  # xRange: the range of positions of the chart in the x dimension
  # yRange: the range of positions of the chart in the y dimension
  # xTimeScale: a mapping from time to x position
  # hasLineData: specifies if the mixing in class has line data
  # showDetails: function to be called on mouseing over the line marker
  # hideDetails: function to be called on mouseing out of the line marker
  # lineColorFn: function which returns a line color, used for fill
  # color of markers
  # graphicHeight: height of graphic containing lines
  # isInteractive: specifies whether the chart is interactive
  # ----------------------------------------------------------------------
  xRange: null
  yRange: null
  xTimeScale: null
  showDetails: null
  hideDetails: null
  lineColorFn: null
  graphicHeight: null

  # ----------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------

  updateLineMarkers: ->
    lineMarkers = @_getLineMarkers()
    showDetails = @get('showDetails')
    hideDetails = @get('hideDetails')

    lineMarkers.enter()
      .append('path')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
      .attr
        class: 'line-marker'
        fill: @get 'lineColorFn'
        d: d3.svg.symbol().size(50).type('circle')

    lineMarkers.exit().remove()

    # Update the line marker icons with the latest position data
    lineMarkers.attr
      transform: (d) ->
        "translate(#{d.x},#{d.y})"

    lineMarkers.style
      'stroke-width': (d) ->
        d3.select(d.path).attr('stroke-width')

  # ----------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------

  # Returns a selection containing the line markers, which binds the line
  # marker data upon each update
  _getLineMarkers: ->
    @get('viewport').selectAll('.line-marker').data(@_lineMarkerData())

  # ----------------------------------------------------------------------
  # Event Bindings
  # ----------------------------------------------------------------------

  # Bind event handlers to the viewport to keep the position of line
  # markers up to date. Responsibility for showing and hiding
  # the lineMarkers is delegated to the chart.
  didInsertElement: ->
    @_super()
    d3.select(@$('svg')[0]).on 'mousemove', =>
      return unless @get('isInteractive')
      # Check if we are within the domain/range of the data
      if @_isEventWithinValidRange()
        Ember.run this, @get('updateLineMarkers')

  # ----------------------------------------------------------------------
  # Private Methods -- Data
  # ----------------------------------------------------------------------

  # The amount of acceptable error in the x-position of the vertical line rule,
  # in msec. This is necessary because bisection is used to find where to place
  # the vertical rule in time domain. The default tolerance here is one hour
  _lineMarkerTolerance: 60 * 1000

  # The mouse position of an event with respect to the chart viewport
  _mousePosition: ->
    return null unless d3.event
    d3.mouse @get('$viewport')

  # if the mouse position is within the xRange and yRange of the
  # implementing object
  _isEventWithinValidRange: ->
    xRange = @get 'xRange'
    yRange = @get 'yRange'
    [x, y] = @_mousePosition()
    inX = d3.min(xRange) < x < d3.max(xRange)
    inY = d3.min(yRange) < y < d3.max(yRange)
    inX and inY

  # To locate each marker for the given location of the rule on the x-axis
  _lineMarkerData: ->
    mousePosition = @_mousePosition()
    return [] if Ember.isEmpty mousePosition

    invXScale = @get('xTimeScale').invert
    invYScale = @get('yScale').invert
    lineMarkerTolerance = @get '_lineMarkerTolerance'

    timeX = invXScale mousePosition[0]

    markerData = []
    @get('viewport').selectAll('path.line').each (d,i) ->
      # Count up the number of bisections, stopping after bisecting
      # maxIterations number of times. In case the bisection does not
      # converge, stop after 25 iterations, which should be enough for any
      # reasonable time range
      iterations = 0
      maxIterations = 25

      # Perform a binary search along the length of each SVG path, calling
      # getPointAtLength and testing where it falls relative to the position
      # corresponding to the location of the rule
      searchStart = 0
      searchEnd = this.getTotalLength()
      searchLen = searchEnd / 2

      point = this.getPointAtLength(searchLen)
      while (Math.abs(timeX - invXScale(point.x)) > lineMarkerTolerance and
             maxIterations > ++iterations)
        if timeX < invXScale(point.x)
          searchEnd = searchLen
        else
          searchStart = searchLen
        searchLen = (searchStart + searchEnd) / 2
        point = this.getPointAtLength(searchLen)

      # Push location of the point, information that will be displayed on hover,
      # and a reference to the line graphic that the point marks, on to a list
      # which will be used to construct a d3 selection of each line marker
      markerData.push
        x: point.x
        y: point.y
        group: d.group
        value: invYScale(point.y)
        time: invXScale(point.x)
        path: this
    return markerData
