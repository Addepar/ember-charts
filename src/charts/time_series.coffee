Ember.Charts.TimeSeriesComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.Legend, Ember.Charts.TimeSeriesLabeler,
  Ember.Charts.FloatingTooltipMixin, Ember.Charts.HasTimeSeriesRule,
  Ember.Charts.AxesMixin,
  classNames: ['chart-time-series']

  # ----------------------------------------------------------------------------
  # Time Series Chart Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatTime: d3.time.format('%Y-%m-%d')
  formatTimeLong: d3.time.format('%a %b %-d, %Y')
  formatValue: d3.format('.2s')
  formatValueLong: d3.format(',.r')

  # Data without group will be merged into a group with this name
  ungroupedSeriesName: 'Other'

  # If stackBars is no then it stacks bars, otherwise it groups them
  # horizontally. Stacking discards negative data.
  stackBars: no

  # Use basis interpolation? Smooths lines but may prevent extrema from being
  # displayed
  interpolate: no

  # Force the Y axis to start at zero, instead of the smallest Y value provided
  yAxisFromZero: no

  # Space between bars, as fraction of total bar + padding space
  barPadding: 0

  # Space between bar groups, as fraction of total bar + padding space
  barGroupPadding: 0.25

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  groupedLineData: Ember.computed ->
    lineData = @get 'lineData'
    return [] if Ember.isEmpty lineData

    groups = Ember.Charts.Helpers.groupBy lineData, (d) =>
      d.label ? @get('ungroupedSeriesName')
    for groupName, values of groups
      group: groupName
      values: values

  .property 'lineData.@each', 'ungroupedSeriesName'

  groupedBarData: Ember.computed ->
    barData = @get 'barData'
    return [] if Ember.isEmpty barData

    barTimes = Ember.Charts.Helpers.groupBy barData, (d) -> +d.time
    barGroupsByTime = for timePoint, groups of barTimes
      # TODO: this doesn't need a groupBy since each key should be unique
      grps = Ember.Charts.Helpers.groupBy groups, (d) =>
        d.label ? @get('ungroupedSeriesName')
      for g,v of grps
        group: g
        time: v[0].time
        value: v[0].value
        label: v[0].label

  .property 'barData.@each', 'ungroupedSeriesName'

  barGroups: Ember.computed ->
    barData = @get 'barData'
    return [] if Ember.isEmpty barData
    barGroups = Ember.Charts.Helpers.groupBy barData, (d) =>
        d.label ? @get('ungroupedSeriesName')
    for groupName, values of barGroups
      groupName
  .property 'barData.@each', 'ungroupedSeriesName'

  stackedBarData: Ember.computed ->
    barData = @get 'barData'
    return [] if Ember.isEmpty barData

    barTimes = Ember.Charts.Helpers.groupBy barData, (d) -> +d.time
    barGroupsByTime = for timePoint, groups of barTimes
      # TODO: this doesn't need a groupBy since each key should be unique
      # TODO: this also needs to deal with the case where some time points are
      # missing groups
      Ember.Charts.Helpers.groupBy groups, (d) =>
        d.label ? @get('ungroupedSeriesName')

    for g in barGroupsByTime
      y0 = 0
      stackedValues = for groupName, d of g
        time = d?[0]?.time
        value = d?[0]?.value
        group: groupName
        x: time
        y0: y0
        y1: y0 += Math.max(value, 0)
      stackedValues: stackedValues
      totalValue: y0

  .property 'barData', 'ungroupedSeriesName'

  # Combine all data for testing purposes
  finishedData: Ember.computed ->
    lineData: @get('groupedLineData')
    groupedBarData: @get('groupedBarData')
    stackedBarData: @get('stackedBarData')
  .property(
    'groupedLineData.@each.values',
    'groupedBarData.@each',
    'stackedBarData.@each')

  hasNoData: Ember.computed ->
    !(@get('hasBarData') or @get('hasLineData'))
  .property 'hasBarData', 'hasLineData'

  hasLineData: Ember.computed ->
    !Ember.isEmpty(@get 'lineData')
  .property 'lineData'

  hasBarData: Ember.computed ->
    !Ember.isEmpty(@get 'barData')
  .property 'barData'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  # Vertical spacing for legend, x axis labels and x axis title
  legendChartPadding: Ember.computed.alias 'labelHeightOffset'

  graphicLeft: Ember.computed.alias 'labelWidthOffset'

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
    groupedBarData = @get 'groupedBarData'
    if Ember.isEmpty(groupedBarData) or groupedBarData.get('length') < 2
      return 'month'

    startTime = groupedBarData[0][0].time
    endTime = groupedBarData[1][0].time
    diffTimeDays = (endTime - startTime) / (24*60*60*1000)

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
  .property 'groupedBarData'

  barDataExtent: Ember.computed ->
    timeDelta = @get 'timeDelta'
    groupedBarData = @get 'groupedBarData'
    return [new Date(), new Date()] if Ember.isEmpty(groupedBarData)

    startTimeGroup = groupedBarData[0]
    startTime = startTimeGroup[0].time
    endTimeGroup = groupedBarData[groupedBarData.length - 1]
    endTime = endTimeGroup[0].time

    # pad extent by half a group interval at the beginning at end
    # in order to make room for bars
    paddedStart =
      if timeDelta is 'quarter'
        +startTime/2 + d3.time['month'].offset(startTime, -3)/2
      else
        +startTime/2 + d3.time[timeDelta].offset(startTime, -1)/2
    paddedEnd =
      if timeDelta is 'quarter'
        +endTime/2 + d3.time['month'].offset(endTime, 3)/2
      else
        +endTime/2 + d3.time[timeDelta].offset(endTime, 1)/2
    [ new Date(paddedStart), new Date(paddedEnd) ]
  .property 'timeDelta', 'groupedBarData.@each'

  individualBarLabels: Ember.computed.alias 'barGroups'

  # The time range over which all bar groups/bar stacks are drawn
  xBetweenGroupDomain: Ember.computed.alias 'barDataExtent'

  # The range of labels assigned within each group
  xWithinGroupDomain: Ember.computed.alias 'individualBarLabels'

  # The space (in pixels) allocated to each bar, including padding
  barWidth: Ember.computed ->
    @get('xGroupScale').rangeBand()
  .property 'xGroupScale'

  # The space (in pixels) allocated to each stack, including padding
  # This is separate from paddedGroupWidth because padding is calculated
  # differently
  stackWidth: Ember.computed ->
    @get('paddedStackWidth') * (1 - @get('barGroupPadding'))
  .property 'paddedStackWidth', 'barGroupPadding'

  paddedStackWidth: Ember.computed ->
    [start,end] = @get('xGroupScale').rangeExtent()
    end - start
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
    data = @get 'groupedLineData'
    return [] if Ember.isEmpty(data)
    data.map (d) -> d.group
  .property 'groupedLineData'

  lineDataExtent: Ember.computed ->
    data = @get 'groupedLineData'
    return [new Date(), new Date()] if Ember.isEmpty(data)
    extents = data.getEach('values').map (series) ->
      d3.extent series.map((d) -> d.time)
    [d3.min(extents, (e) -> e[0]), d3.max(extents, (e) -> e[1])]
  .property 'groupedLineData.@each.values'

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
    return @get('xWithinSeriesDomain') unless @get('hasBarData')
    return @get('xBetweenGroupDomain') unless @get('hasLineData')
    [minOfGroups, maxOfGroups] = @get 'xBetweenGroupDomain'
    [minOfSeries, maxOfSeries] = @get 'xWithinSeriesDomain'
    [ Math.min(minOfGroups, minOfSeries),
      Math.max(maxOfGroups, maxOfSeries) ]
  .property('xBetweenGroupDomain', 'xWithinSeriesDomain',
    'hasBarData', 'hasLineData')

  # Largest and smallest values in line and bar data
  # Use raw bar data instead of doubly grouped hashes in groupedBarData
  yDomain: Ember.computed ->
    lineData = @get 'groupedLineData'
    stackData = @get 'stackedBarData'
    groupData = @get 'groupedBarData'

    maxOfSeries = d3.max lineData, (d) -> d3.max(d.values, (dd) -> dd.value)
    minOfSeries = d3.min lineData, (d) -> d3.min(d.values, (dd) -> dd.value)
    minOfStacks = d3.min stackData, (d) -> d.totalValue
    maxOfStacks = d3.max stackData, (d) -> d.totalValue
    maxOfGroups = d3.max groupData, (d) -> d3.max(d, (dd) -> dd.value)
    minOfGroups = d3.min groupData, (d) -> d3.min(d, (dd) -> dd.value)

    hasBarData = @get 'hasBarData'
    hasLineData = @get 'hasLineData'
    stackBars = @get 'stackBars'

    # Find the extent of whatever data is drawn on the graph,
    # e.g. max of only line data, or max of line and stacked-bar data
    if !hasBarData
      min = minOfSeries
      max = maxOfSeries
    else if !hasLineData
      min = if stackBars then minOfStacks else minOfGroups
      max = if stackBars then maxOfStacks else maxOfGroups
    else if stackBars
      min = Math.min(minOfSeries, minOfStacks)
      max = Math.max(maxOfSeries, maxOfStacks)
    else
      min = Math.min(minOfGroups, minOfSeries)
      max = Math.max(maxOfGroups, maxOfSeries)

    # Ensure the extent contains zero if that is desired. If all values in
    # the y-domain are equal, assign it a range so data can be displayed
    if stackBars or @get('yAxisFromZero') or min is max
      if max < 0
        return [ min, 0 ]
      if min > 0
        return [ 0, max ]
      if min is max is 0
        return [ -1, 1 ]
    return [ min, max ]

  .property('groupedLineData', 'stackedBarData', 'groupedBarData',
    'hasBarData', 'hasLineData', 'stackBars', 'yAxisFromZero')

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

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>

      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)
      # TODO(tony): handle legend hover

      # Show tooltip
      content = "<span class=\"tip-label\">#{@get('formatTime')(data.time)}</span>"

      formatValue = @get 'formatValue'
      addValueLine = (d) ->
        content +="<span class=\"name\">#{d.group}: </span>"
        content += "<span class=\"value\">#{formatValue(d.value)}</span><br/>"
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
    transform: (d) =>
      if @get('stackBars')
        dx = -@get('stackWidth')/2
      else
        dx = -@get('paddedGroupWidth')/2
      dy = 0
      "translate(#{dx},#{dy})"
  .property 'stackBars', 'stackWidth', 'paddedGroupWidth'

  stackedBarAttrs: Ember.computed ->
    xTimeScale = @get 'xTimeScale'
    yScale = @get 'yScale'
    class: (d,i) -> "grouping-#{i}"
    'stroke-width': 0
    width: @get('stackWidth')
    x: (d) -> xTimeScale d.x
    y: (d) => yScale(d.y1) + @get('zeroDisplacement')
    height: (d) -> yScale(d.y0) - yScale(d.y1)
  .property 'xTimeScale', 'yScale', 'stackWidth', 'zeroDisplacement'

  groupedBarAttrs: Ember.computed ->
    xTimeScale = @get 'xTimeScale'
    xGroupScale = @get 'xGroupScale'
    yScale = @get 'yScale'
    zeroDisplacement = @get 'zeroDisplacement'
    class: (d,i) -> "grouping-#{i}"
    'stroke-width': 0
    width: @get('barWidth')
    x: (d) ->
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
  .property('xTimeScale', 'xGroupScale', 'barWidth', 'yScale',
    'zeroDisplacement')

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
  getLineColor: Ember.computed ->
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
    stroke: @get 'getLineColor'
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
    if @get('stackBars')
      barData = @get 'stackedBarData'
    else
      barData = @get 'groupedBarData'
    @get('viewport').selectAll('.bars').data(barData)
  .volatile()

  removeAllSeries: ->
    @get('viewport').selectAll('.series').remove()

  series: Ember.computed ->
    @get('viewport').selectAll('.series').data(@get 'groupedLineData')
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

  renderVars: ['getLabelledTicks', 'xGroupScale', 'xTimeScale', 'yScale']

  drawChart: ->
    @updateRule()
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
      .ticks(@get 'getLabelledTicks')
      .tickSubdivide(@get 'numberOfMinorTicks')
      .tickFormat(@get 'formattedTime')
      .tickSize(6, 3, 0)

    yAxis = d3.svg.axis()
      .scale(@get 'yScale')
      .orient('right')
      .ticks(@get 'numYTicks')
      .tickSize(@get 'graphicWidth')
      .tickFormat(@get 'formatValue')

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

    if @get('stackBars')
      subdata = (d) -> d.stackedValues
    else
      subdata = (d) -> d

    bars = groups.selectAll('rect').data(subdata)
    bars.enter().append('rect')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    bars.exit().remove()

  updateBarGraphic: ->
    if @get('stackBars')
      barAttrs = @get 'stackedBarAttrs'
    else
      barAttrs = @get 'groupedBarAttrs'

    groups = @get 'groups'
    groups.attr(@get 'groupAttrs')
    groups.selectAll('rect')
      .style('fill', @get 'getSecondarySeriesColor')
      .attr(barAttrs)

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

Ember.Handlebars.helper('time-series-chart', Ember.Charts.TimeSeriesComponent)
