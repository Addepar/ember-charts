Ember.Charts.TimeSeriesComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.Legend, Ember.Charts.TimeSeriesLabeler,
  Ember.Charts.FloatingTooltipMixin, Ember.Charts.HasTimeSeriesRule,
  Ember.Charts.AxesMixin, Ember.Charts.Formattable,
  classNames: ['chart-time-series']

  # ----------------------------------------------------------------------------
  # API -- inputs
  #
  # lineData, barData:
  # Both data sets need to be in the following format:
  # [{label: ..., time: ..., value: ...}, {...}, ...]
  # Line data will be grouped by label, while bar data is grouped by
  # time and then label
  #
  # ----------------------------------------------------------------------------
  lineData: null
  barData: null

  # ----------------------------------------------------------------------------
  # Time Series Chart Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatTime: d3.time.format('%Y-%m-%d')
  formatTimeLong: d3.time.format('%a %b %-d, %Y')

  # Data without group will be merged into a group with this name
  ungroupedSeriesName: 'Other'

  # Use basis interpolation? Smooths lines but may prevent extrema from being
  # displayed
  interpolate: no

  # Force the Y axis to start at zero, instead of the smallest Y value provided
  yAxisFromZero: no

  # Space between bars, as fraction of total bar + padding space
  barPadding: 0

  # Space between bar groups, as fraction of total bar + padding space
  barGroupPadding: 0.25

  # Bar left offset, as fraction of width of bar
  barLeftOffset: 0.0

  # ----------------------------------------------------------------------------
  # Overrides of ChartComponent methods
  # ----------------------------------------------------------------------------

  # Combine all data for testing purposes
  finishedData: Ember.computed ->
    lineData: @get('_groupedLineData')
    groupedBarData: @get('_groupedBarData')
  .property(
    '_groupedLineData.@each.values',
    '_groupedBarData.@each')

  hasNoData: Ember.computed ->
    not @get('_hasBarData') and not @get('_hasLineData')
  .property '_hasBarData', '_hasLineData'

  # ----------------------------------------------------------------------------
  # Overrides of Legend methods
  # ----------------------------------------------------------------------------

  # Vertical spacing for legend, x axis labels and x axis title
  legendChartPadding: Ember.computed.alias 'labelHeightOffset'

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  _getLabelOrDefault: (datum) ->
    datum.label?.toString() or @get('ungroupedSeriesName')

  # Puts lineData in a new format.
  # Resulting format is [{group: ..., values: ...}] where values are the
  # lineData values for that group.
  _groupedLineData: Ember.computed ->
    lineData = @get 'lineData'
    return [] if Ember.isEmpty lineData

    groups = Ember.Charts.Helpers.groupBy lineData, (datum) =>
      @_getLabelOrDefault(datum)
    for groupName, values of groups
      group: groupName
      values: values
  .property 'lineData.@each', 'ungroupedSeriesName'

  # puts barData in a new format.
  # Resulting format: [[{group: ..., time: ..., value: ..., label:
  # ...}, ...], [...]] where each internal array is an array of hashes
  # at the same time
  _groupedBarData: Ember.computed ->
    barData = @get 'barData'
    return [] if Ember.isEmpty barData

    # returns map from time to array of bar hashes
    barTimes = Ember.Charts.Helpers.groupBy barData, (d) -> d.time.getTime()
    barGroupsByTime = for timePoint, groups of barTimes
      for g in groups
        label = @_getLabelOrDefault(g)
        labelTime = g.time
        drawTime = @_transformCenter(g.time)
        group: label, time: drawTime, value: g.value, label: label, \
          labelTime: labelTime
  .property 'barData.@each', 'ungroupedSeriesName', 'barLeftOffset'

  # Transforms the center of the bar graph for the drawing based on the
  # specified barLeftOffset
  _transformCenter: (time) ->
    delta = @_getTimeDeltaFromSelectedInterval()
    offset = @get 'barLeftOffset'
    unless offset is 0
      time = @_padTimeWithIntervalMultiplier time, delta, offset
    time

  # Since selected interval and time delta don't use the same naming convention
  # this converts the selected interval to the time delta convention for the
  # padding functions.
  _getTimeDeltaFromSelectedInterval: () ->
    switch @get('selectedInterval')
      when 'years', 'Y' then 'year'
      when 'quarters', 'Q' then 'quarter'
      when 'months', 'M' then 'month'
      when 'weeks' , 'W'  then 'week'
      when 'seconds', 'S' then 'second'

  # Given a time, returns the time plus half an interval
  _padTimeForward: (time, delta) ->
    @_padTimeWithIntervalMultiplier(time, delta, 0.5)

  # Given a time, returns the time minus half an interval
  _padTimeBackward: (time, delta) ->
    @_padTimeWithIntervalMultiplier(time, delta, -0.5)

  # Because of the complexities of what will and won't work with this method,
  # it's not very safe to call. Instead, call _padTimeForward or
  # _padTimeBackward. This method exists to remove code duplication from those.
  _padTimeWithIntervalMultiplier: (time, delta, multiplier) ->
    if time?
      intervalType = if delta is 'quarter' then 'month' else delta
      period = if delta is 'quarter' then 3 else 1

      # Since d3 offset does not support non-integer offsets or direct querying
      # of the offset delta, compute it.
      offsetDelta = d3.time[intervalType].offset(time, period) - time.getTime()
      time = offsetDelta * multiplier + time.getTime()
    new Date(time)

  _barGroups: Ember.computed ->
    barData = @get 'barData'
    return [] if Ember.isEmpty barData
    barGroups = Ember.Charts.Helpers.groupBy barData, (datum) =>
      @_getLabelOrDefault(datum)
    _.keys(barGroups)
  .property 'barData.@each', 'ungroupedSeriesName'

  _hasLineData: Ember.computed.notEmpty 'lineData'

  _hasBarData: Ember.computed.notEmpty 'barData'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  # position of the left of the graphic -- we want to leave space for
  # labels
  graphicLeft: Ember.computed.alias 'labelWidthOffset'

  # width of the graphic
  graphicWidth: Ember.computed ->
    @get('width') - @get('labelWidthOffset')
  .property 'width', 'labelWidthOffset'

  graphicHeight: Ember.computed ->
    @get('height') - @get('legendHeight') - @get('legendChartPadding')
  .property('height', 'legendHeight', 'legendChartPadding')

  # ----------------------------------------------------------------------------
  # Grouped/Stacked Bar Scales
  # ----------------------------------------------------------------------------

  # Unit of time between bar samples
  timeDelta: Ember.computed ->
    groupedBarData = @get '_groupedBarData'
    if Ember.isEmpty(groupedBarData) or groupedBarData.get('length') < 2
      return 'month'

    # difference in time between first bar data group and second bar
    # data group
    firstBarTime = groupedBarData[0][0].time
    secondBarTime = groupedBarData[1][0].time
    oneDayInSeconds = 24*60*60*1000
    diffTimeDays = (secondBarTime - firstBarTime) / (oneDayInSeconds)

    # Some fuzzy bar interval computation, I just picked 2 day buffer
    if diffTimeDays > 351
      'year'
    else if diffTimeDays > 33
      'quarter'
    else if diffTimeDays > 9
      'month'
    else if diffTimeDays > 3
      'week'
    else
      'day'
  .property '_groupedBarData'

  barDataExtent: Ember.computed ->
    timeDelta = @get 'timeDelta'
    groupedBarData = @get '_groupedBarData'
    return [new Date(), new Date()] if Ember.isEmpty(groupedBarData)

    first = _.first(groupedBarData)
    last = _.last(groupedBarData)
    startTime = new Date(first[0].time)
    endTime = new Date(last[0].time)

    # Add the padding needed for the edges of the bar
    paddedStart = @_padTimeBackward(startTime, timeDelta)
    paddedEnd = @_padTimeForward(endTime, timeDelta)
    [ new Date(paddedStart), new Date(paddedEnd) ]
  .property 'timeDelta', '_groupedBarData.@each'

  # The time range over which all bar groups are drawn
  xBetweenGroupDomain: Ember.computed.alias 'barDataExtent'

  # The range of labels assigned within each group
  xWithinGroupDomain: Ember.computed.alias '_barGroups'

  # The space (in pixels) allocated to each bar, including padding
  barWidth: Ember.computed ->
    @get('xGroupScale').rangeBand()
  .property 'xGroupScale'

  paddedGroupWidth: Ember.computed ->
    timeDelta = @get 'timeDelta'
    scale = @get 'xTimeScale'
    t1 = @get('xBetweenGroupDomain')[0]
    t2 =
      if timeDelta is 'quarter'
        d3.time['month'].offset(t1, 3)
      else
        d3.time[timeDelta].offset(t1, 1)
    scale(t2) - scale(t1)
  .property 'timeDelta', 'xTimeScale', 'xBetweenGroupDomain'

  # ----------------------------------------------------------------------------
  # Line Drawing Scales
  # ----------------------------------------------------------------------------

  lineSeriesNames: Ember.computed ->
    data = @get '_groupedLineData'
    return [] if Ember.isEmpty(data)
    data.map (d) -> d.group
  .property '_groupedLineData'

  lineDataExtent: Ember.computed ->
    data = @get '_groupedLineData'
    return [new Date(), new Date()] if Ember.isEmpty(data)
    extents = data.getEach('values').map (series) ->
      d3.extent series.map((d) -> d.time)
    [d3.min(extents, (e) -> e[0]), d3.max(extents, (e) -> e[1])]
  .property '_groupedLineData.@each.values'

  # The set of all time series
  xBetweenSeriesDomain: Ember.computed.alias 'lineSeriesNames'

  # The range of all time series
  xWithinSeriesDomain: Ember.computed.alias 'lineDataExtent'

  # ----------------------------------------------------------------------------
  # Ticks and Scales
  # ----------------------------------------------------------------------------

  # Override maxNumberOfLabels in the time series labeler mixin, setting it to
  # the dynamically computed number of ticks going on the time series axis
  maxNumberOfLabels: Ember.computed.alias 'numXTicks'

  # Create a domain that spans the larger range of bar or line data
  xDomain: Ember.computed ->
    return @get('xWithinSeriesDomain') unless @get('_hasBarData')
    return @get('xBetweenGroupDomain') unless @get('_hasLineData')
    [minOfGroups, maxOfGroups] = @get 'xBetweenGroupDomain'
    [minOfSeries, maxOfSeries] = @get 'xWithinSeriesDomain'
    [ Math.min(minOfGroups, minOfSeries),
      Math.max(maxOfGroups, maxOfSeries) ]
  .property('xBetweenGroupDomain', 'xWithinSeriesDomain',
    '_hasBarData', '_hasLineData')

  # Largest and smallest values in line and bar data
  # Use raw bar data instead of doubly grouped hashes in groupedBarData
  yDomain: Ember.computed ->
    lineData = @get '_groupedLineData'
    groupData = @get '_groupedBarData'

    maxOfSeries = d3.max lineData, (d) -> d3.max(d.values, (dd) -> dd.value)
    minOfSeries = d3.min lineData, (d) -> d3.min(d.values, (dd) -> dd.value)
    maxOfGroups = d3.max groupData, (d) -> d3.max(d, (dd) -> dd.value)
    minOfGroups = d3.min groupData, (d) -> d3.min(d, (dd) -> dd.value)

    hasBarData = @get '_hasBarData'
    hasLineData = @get '_hasLineData'

    # Find the extent of whatever data is drawn on the graph,
    # e.g. max of only line data, or max of line
    if !hasBarData
      min = minOfSeries
      max = maxOfSeries
    else if !hasLineData
      min = minOfGroups
      max = maxOfGroups
    else
      min = Math.min(minOfGroups, minOfSeries)
      max = Math.max(maxOfGroups, maxOfSeries)

    # Ensure the extent contains zero if that is desired. If all values in
    # the y-domain are equal, assign it a range so data can be displayed
    if @get('yAxisFromZero') or min is max
      if max < 0
        return [ min, 0 ]
      if min > 0
        return [ 0, max ]
      if min is max is 0
        return [ -1, 1 ]
    return [ min, max ]

  .property('_groupedLineData', '_groupedBarData',
    '_hasBarData', '_hasLineData', 'yAxisFromZero')

  yRange: Ember.computed ->
    [ @get('graphicTop') + @get('graphicHeight'), @get('graphicTop') ]
  .property 'graphicTop', 'graphicHeight'

  yScale: Ember.computed ->
    d3.scale.linear()
      .domain(@get('yDomain'))
      .range(@get('yRange'))
      .nice(@get 'numYTicks')
  .property 'yDomain', 'yRange', 'numYTicks'

  xRange: Ember.computed ->
    [ @get('graphicLeft'), @get('graphicLeft') + @get('graphicWidth') ]
  .property 'graphicLeft', 'graphicWidth'

  xTimeScale: Ember.computed ->
    xDomain = @get 'xDomain'
    d3.time.scale()
      .domain(@get('xDomain'))
      .range(@get('xRange'))
  .property 'xDomain', 'xRange'

  xGroupScale: Ember.computed ->
    d3.scale.ordinal()
      .domain(@get 'xWithinGroupDomain')
      .rangeRoundBands([ 0, @get('paddedGroupWidth')],
        @get('barPadding')/2, @get('barGroupPadding')/2)
  .property('xWithinGroupDomain', 'paddedGroupWidth',
    'barPadding', 'barGroupPadding')

  # Override axis mix-in min and max values to listen to the scale's domain
  minAxisValue: Ember.computed ->
    yScale = @get 'yScale'
    yScale.domain()[0]
  .property 'yScale'

  maxAxisValue: Ember.computed ->
    yScale = @get 'yScale'
    yScale.domain()[1]
  .property 'yScale'

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>

      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)
      # TODO(tony): handle legend hover

      # Show tooltip. Use overridden label time if one exists.
      time = if data.labelTime? then data.labelTime else data.time
      content = "<span class=\"tip-label\">#{@get('formatTime')(time)}</span>"

      formatLabelFunction = @get 'formatLabelFunction'
      addValueLine = (d) ->
        content +="<span class=\"name\">#{d.group}: </span>"
        content += "<span class=\"value\">#{formatLabelFunction(d.value)}</span><br/>"
      if Ember.isArray(data.values)
        # Display all bar details if hovering over axis label
        data.values.forEach addValueLine
      else
        # Just hovering over single bar
        addValueLine data
      @showTooltip(content, d3.event)
  .property 'isInteractive'

  hideDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Undo hover style stuff
      d3.select(element).classed('hovered', no)

      # Hide Tooltip
      @hideTooltip()
  .property 'isInteractive'

  # ----------------------------------------------------------------------------
  # Styles
  # ----------------------------------------------------------------------------

  # Number of pixels to shift graphics away from origin line
  zeroDisplacement: 1

  groupAttrs: Ember.computed ->
    transform: (d) => "translate(#{-@get('paddedGroupWidth')/2},0)"
  .property 'paddedGroupWidth'

  groupedBarAttrs: Ember.computed ->
    xTimeScale = @get 'xTimeScale'
    xGroupScale = @get 'xGroupScale'
    yScale = @get 'yScale'
    zeroDisplacement = @get 'zeroDisplacement'
    class: (d,i) -> "grouping-#{i}"
    'stroke-width': 0
    width: @get('barWidth')
    x: (d) =>
      xGroupScale(d.label) + xTimeScale(d.time)
    y: (d) ->
      if d.value > 0
        yScale(d.value)
      else
        yScale(0) + zeroDisplacement
    height: (d) =>
      # prevent zero-height bars from causing errors because of zeroDisplacement
      zeroLine = Math.max 0, yScale.domain()[0]
      Math.max 0, if d.value > zeroLine
        Math.abs(yScale(zeroLine) - yScale(d.value)) - zeroDisplacement
      else
        Math.abs(yScale(d.value) - yScale(zeroLine)) - zeroDisplacement
  .property( 'xTimeScale', 'xGroupScale', 'barWidth', 'yScale',
    'zeroDisplacement', 'barLeftOffset' )

  line: Ember.computed ->
    d3.svg.line()
      .x((d) => @get('xTimeScale') d.time)
      .y((d) => @get('yScale') d.value)
      .interpolate(if @get('interpolate') then 'basis' else 'linear')
  .property 'xTimeScale', 'yScale', 'interpolate'

  # Line styles. Implements Craig's design spec, which ensures that out of the
  # first six lines, there are always two distinguishing styles between every
  # pair of lines.
  # 1st line: ~2px, base color, solid
  # 2nd line: ~1px, 66% tinted, solid
  # 3rd line: ~2px, base color, dotted
  # 4th line: ~1px, 66% tinted, dotted
  # 5th line: ~3px, 33% tinted, solid
  # 6th line: ~3px, 33% tinted, dotted
  lineColorFn: Ember.computed ->
    (d,i) =>
      getSeriesColor = @get 'getSeriesColor'
      switch i
        when 0 then getSeriesColor(d, 0)
        when 1 then getSeriesColor(d, 2)
        when 2 then getSeriesColor(d, 0)
        when 3 then getSeriesColor(d, 2)
        when 4 then getSeriesColor(d, 0)
        when 5 then getSeriesColor(d, 1)
        else        getSeriesColor(d, i)

  lineAttrs: Ember.computed ->
    getSeriesColor = @get 'getSeriesColor'
    line = @get 'line'
    class: (d,i) -> "line series-#{i}"
    d: (d) -> line d.values
    stroke: @get 'lineColorFn'
    'stroke-width': (d, i) =>
      switch i
        when 0 then 2
        when 1 then 1.5
        when 2 then 2
        when 3 then 1.5
        when 4 then 2.5
        when 5 then 2.5
        else        2
    'stroke-dasharray': (d, i) =>
      switch i
        when 2,3,5 then '2,2'
        else ''
  .property 'line', 'getSeriesColor'

  # ----------------------------------------------------------------------------
  # Color Configuration
  # ----------------------------------------------------------------------------

  numLines: Ember.computed.alias 'xBetweenSeriesDomain.length'
  numBarsPerGroup: Ember.computed.alias 'xWithinGroupDomain.length'

  numColorSeries: 6 # Ember.computed.alias 'numLines'
  numSecondaryColorSeries: Ember.computed.alias 'numBarsPerGroup'

  # Use primary colors for bars if there are no lines

  secondaryMinimumTint: Ember.computed ->
    if @get('numLines') is 0 then 0 else 0.4
  .property 'numLines'

  secondaryMaximumTint: Ember.computed ->
    if @get('numLines') is 0 then 0.8 else 0.85
  .property 'numLines'

  # ----------------------------------------------------------------------------
  # Legend Configuration
  # ----------------------------------------------------------------------------

  hasLegend: Ember.computed ->
    @get('legendItems.length') > 1
  .property 'legendItems.length'

  legendItems: Ember.computed ->
    getSeriesColor = @get 'getSeriesColor'
    lineAttrs = @get 'lineAttrs'
    @get('xBetweenSeriesDomain').map (d, i) =>
      # Line legend items
      label: d
      stroke: lineAttrs['stroke'](d, i)
      width: lineAttrs['stroke-width'](d, i)
      dotted: lineAttrs['stroke-dasharray'](d, i)
      icon: -> 'line'
      selector: ".series-#{i}"
    .concat @get('xWithinGroupDomain').map (d, i) =>
      # Bar legend items
      color = @get('getSecondarySeriesColor')(d, i)
      stroke: color
      fill: color
      label: d
      icon: -> 'square'
      selector: ".grouping-#{i}"
  .property('xBetweenSeriesDomain', 'xWithinGroupDomain',
    'getSeriesColor', 'getSecondarySeriesColor')

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  removeAllGroups: ->
    @get('viewport').selectAll('.bars').remove()

  groups: Ember.computed ->
    @get('viewport').selectAll('.bars').data(@get '_groupedBarData')
  .volatile()

  removeAllSeries: ->
    @get('viewport').selectAll('.series').remove()

  series: Ember.computed ->
    @get('viewport').selectAll('.series').data(@get '_groupedLineData')
  .volatile()

  xAxis: Ember.computed ->
    xAxis = @get('viewport').select('.x.axis')
    if xAxis.empty()
      return @get('viewport')
        .insert('g', ':first-child')
        .attr('class', 'x axis')
    else
      return xAxis
  .volatile()

  yAxis: Ember.computed ->
    yAxis = @get('viewport').select('.y.axis')
    if yAxis.empty()
      return @get('viewport')
        .insert('g', ':first-child')
        .attr('class', 'y axis')
    else
      return yAxis
  .volatile()

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  renderVars: ['barLeftOffset', 'labelledTicks', 'xGroupScale', 'xTimeScale',
    'yScale']

  drawChart: ->
    @updateBarData()
    @updateLineData()
    @updateLineMarkers()
    @updateAxes()
    @updateBarGraphic()
    @updateLineGraphic()
    if @get('hasLegend')
      @drawLegend()
    else
      @clearLegend()

  updateAxes: ->
    xAxis = d3.svg.axis()
      .scale(@get 'xTimeScale')
      .orient('bottom')
      .tickValues(@get 'labelledTicks')
      .tickSubdivide(@get 'numberOfMinorTicks')
      .tickFormat(@get 'formattedTime')
      .tickSize(6, 3)

    #tickSize isn't doing anything here, it should take two arguments
    yAxis = d3.svg.axis()
      .scale(@get 'yScale')
      .orient('right')
      .ticks(@get 'numYTicks')
      .tickSize(@get 'graphicWidth')
      .tickFormat(@get 'formatValueAxis')

    graphicTop = @get 'graphicTop'
    graphicHeight = @get 'graphicHeight'
    gXAxis = @get('xAxis')
      .attr(transform: "translate(0,#{graphicTop+graphicHeight})")
      .call(xAxis)

    graphicLeft = @get 'graphicLeft'
    gYAxis = @get('yAxis')
      .attr('transform', "translate(#{graphicLeft},0)")
      .call(yAxis)

    # Ensure ticks other than the zeroline are minor ticks
    gYAxis.selectAll('g')
      .filter((d) -> d)
      .classed('major', no)
      .classed('minor', yes)

    gYAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr
        x: -@get('labelPadding')

  updateBarData: ->
    # Always remove the previous bars, this allows us to maintain the
    # rendering order of bars behind lines
    @removeAllGroups()

    groups = @get 'groups'
    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'

    # Ensure bars are always inserted behind lines
    groups.enter()
      .insert('g', '.series')
      .attr('class', 'bars')
    groups.exit().remove()

    bars = groups.selectAll('rect').data((d) -> d)
    bars.enter().append('rect')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    bars.exit().remove()

  updateBarGraphic: ->
    groups = @get 'groups'
    groups.attr(@get 'groupAttrs')
    groups.selectAll('rect')
      .style('fill', @get 'getSecondarySeriesColor')
      .attr(@get 'groupedBarAttrs')

  updateLineData: ->
    # Always remove the previous lines, this allows us to maintain the
    # rendering order of bars behind lines
    @removeAllSeries()

    series = @get 'series'
    series.enter()
      .append('g').attr('class', 'series')
      .append('path').attr('class', 'line')
    series.exit()
      .remove()

  updateLineGraphic: ->
    series = @get 'series'
    graphicTop = @get 'graphicTop'
    series.attr('transform', "translate(0, #{graphicTop})")
    series.select('path.line')
      .attr(@get 'lineAttrs')
)

Ember.Handlebars.helper 'time-series-chart', Ember.Charts.TimeSeriesComponent
