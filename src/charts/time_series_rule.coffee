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
  # getLineColor: function which returns a line color, used for fill
  # color of markers
  # graphicHeight: height of graphic containing lines
  # isInteractive: specifies whether the chart is interactive
  # ----------------------------------------------------------------------
  xRange: null
  yRange: null
  xTimeScale: null
  hasLineData: null
  showDetails: null
  hideDetails: null
  getLineColor: null
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
        fill: @get 'getLineColor'
        d: d3.svg.symbol().size(50).type('circle')

    lineMarkers.exit().remove()

    # Update the line marker icons with the latest position data
    lineMarkers.attr
      transform: (d) ->
        "translate(#{d.x},#{d.y})"

    lineMarkers.style
      'stroke-width': (d) ->
        d3.select(d.path).attr('stroke-width')

  updateRule: ->
    # Get the position at which to locate the rule, relative to the chart
    # viewport (which encloses the chart graphic). Displace the end of the
    # rule so it does not overlap with the x-axis
    zeroDisplacement = 1

    # Update volatile computed properties by calling their getters; also,
    # set the location of the rule to the current x-position of the mouse
    [x,] = @_mousePosition() or [0]
    @_getRule().attr
      x1: x
      x2: x
      y0: 0
      y1: @get('graphicHeight') - zeroDisplacement

  # ----------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------

  # Volatile computed property returning a selection containing the line
  # element for the rule. If the rule does not exist, create it, and make
  # it hidden by default
  _getRule: ->
    rule = @get('viewport').select('.rule')
    if rule.empty()
      return @get('viewport')
        .insert('line', '.series')
        .style('stroke-width', 1.5)
        .attr('class', 'rule')
    else
      return rule

  # Returns a selection containing the line markers, which binds the line
  # marker data upon each update
  _getLineMarkers: ->
    @get('viewport').selectAll('.line-marker').data(@_lineMarkerData())

  # ----------------------------------------------------------------------
  # Event Bindings
  # ----------------------------------------------------------------------

  # Bind event handlers to the viewport to keep the position of the rule
  # and line markers up to date. Responsibility for showing and hiding
  # the rule and lineMarkers is delegated to the chart, which should call
  # showRule and hideRule below to control their visibility.
  didInsertElement: ->
    @_super()
    # We have to do this partly so that the rule renders first and is always in
    # the back
    @_hideRule()
    d3.select(@$('svg')[0]).on 'mousemove', =>
      return unless @get('isInteractive')
      # Check if we are still in an area where we have valid
      # time-series data and should show a rule, i.e., we are within the
      # domain/range of the data
      if @_isEventWithinValidRange()
        @_showRule()
        Ember.run this, @get('updateRule')
        Ember.run this, @get('updateLineMarkers')
      else
        @_hideRule()

  # Since the rule is shown and hidden when each line is moused over
  _showRule: ->
    return unless @get('hasLineData')
    @_getRule().style('stroke-width', 1.5)
    @_getLineMarkers().style('opacity', 1)

  _hideRule: ->
    @_getRule().style('stroke-width', 0)
    @_getLineMarkers().style('opacity', 0)

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
