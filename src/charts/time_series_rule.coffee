Ember.Charts.HasTimeSeriesRule = Ember.Mixin.create

  # ----------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------

  # The amount of acceptable error in the x-position of the vertical line rule,
  # in msec. This is necessary because bisection is used to find where to place
  # the vertical rule in time domain. The default tolerance here is one hour
  lineMarkerTolerance: 60 * 1000

  # Let's get the mouse position of an event with respect to the chart viewport
  mousePosition: Ember.computed ->
    return null unless d3.event
    d3.mouse @get('$viewport')
  .volatile()

  isEventWithinValidRange: Ember.computed ->
    xRange = @get 'xRange'
    yRange = @get 'yRange'
    [x, y] = @get 'mousePosition'
    inX = d3.min(xRange) < x < d3.max(xRange)
    inY = d3.min(yRange) < y < d3.max(yRange)
    inX and inY
  .volatile()

  # To locate each marker for the given location of the rule on the x-axis
  lineMarkerData: Ember.computed ->
    mousePosition = @get 'mousePosition'
    return [] if Ember.isEmpty mousePosition

    invXScale = @get('xTimeScale').invert
    invYScale = @get('yScale').invert
    lineMarkerTolerance = @get 'lineMarkerTolerance'

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
  .volatile()

  # ----------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------

  # Volatile computed property returning a selection containing the line
  # element for the rule. If the rule does not exist, create it, and make
  # it hidden by default
  rule: Ember.computed ->
    rule = @get('viewport').select('.rule')
    if rule.empty()
      return @get('viewport')
        .insert('line', '.series')
        .style('stroke-width', 0)
        .attr('class', 'rule')
    else
      return rule
  .volatile()

  # Volatile computed property returning a selection containing the line
  # markers, which binds the line marker data upon each update
  lineMarkers: Ember.computed ->
    @get('viewport').selectAll('.line-marker').data(@get 'lineMarkerData')
  .volatile()

  # ----------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------

  updateLineMarkers: ->
    # Keep entering and exiting lines updated
    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'
    lineMarkers = @get('lineMarkers')

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
    [x,] = @get('mousePosition') or [0]
    @get('rule').attr
      x1: x
      x2: x
      y0: 0
      y1: @get('graphicHeight') - zeroDisplacement

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
    @get('hideRule')()
    d3.select(@$('svg')[0]).on 'mousemove', =>
      return unless @get('isInteractive')
      # Check if we are still in an area where we have valid
      # time-series data and should show a rule, i.e., we are within the
      # domain/range of the data
      if @get 'isEventWithinValidRange'
        @get('showRule')()
        Ember.run this, @get('updateRule')
        Ember.run this, @get('updateLineMarkers')
      else
        @get('hideRule')()

  isRuleShown: no
  # Since the rule is shown and hidden when each line is moused over
  showRule: Ember.computed ->
    (d) =>
      return unless @get('hasLineData')
      # TODO(tony): use opacity instead of stroke-width
      @get('rule').style('stroke-width', 1.5)
      @get('lineMarkers').style('opacity', 1)

  hideRule: Ember.computed ->
    (d) =>
      @get('rule').style('stroke-width', 0)
      @get('lineMarkers').style('opacity', 0)

