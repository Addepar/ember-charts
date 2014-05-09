Ember.Charts.VerticalBarComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.Legend, Ember.Charts.FloatingTooltipMixin,
  Ember.Charts.AxesMixin,
  classNames: ['chart-vertical-bar']

  # ----------------------------------------------------------------------------
  # Vertical Bar Chart Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatValue: d3.format('.2s')
  formatValueLong: d3.format(',.r')

  # Data without group will be merged into a group with this name
  ungroupedSeriesName: 'Other'

  # If stackBars is yes then it stacks bars, otherwise it groups them
  # horizontally. Stacking discards negative data.
  stackBars: no

  # Space between bars, as fraction of bar size
  withinGroupPadding: 0

  # Space between bar groups, as fraction of group size
  betweenGroupPadding: Ember.computed ->
    # Use padding to make sure bars have a maximum thickness.
    #
    # TODO(tony): Use exact padding + bar width calculation
    # We have some set amount of bewtween group padding we use depending
    # on the number of bars there are in the chart. Really, what we would want
    # to do is have the equation for bar width based on padding and use that
    # to set the padding exactly.
    scale = d3.scale.linear().domain([1,8]).range([1.25,0.25]).clamp(yes)
    scale @get('numBars')
  .property 'numBars'

  numBars: Ember.computed ->
    @get('xBetweenGroupDomain.length') * @get('xWithinGroupDomain.length') or 0
  .property 'xBetweenGroupDomain', 'xWithinGroupDomain'

  # Space allocated for rotated labels on the bottom of the chart. If labels
  # are rotated, they will be extended beyond labelHeight up to maxLabelHeight
  maxLabelHeight: 50

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  # Aggregates objects provided in `data` in a dictionary, keyed by group names
  groupedData: Ember.computed ->
    data = @get 'data'
    return [] if Ember.isEmpty data
    Ember.Charts.Helpers.groupBy data, (d) =>
      d.group ? @get('ungroupedSeriesName')
  .property 'data.@each', 'ungroupedSeriesName'

  groupNames: Ember.computed ->
    for groupName, values of @get('groupedData')
      groupName
  .property 'groupedData'

  # We know the data is grouped because it has more than one label. If there
  # are no labels on the data then every data object will have
  # 'ungroupedSeriesName' as its group name and the number of group
  # labels will be 1. If we are passed ungrouped data we will display
  # each data object in its own group.
  isGrouped: Ember.computed ->
    @get('groupNames.length') > 1
  .property 'groupNames.length'

  finishedData: Ember.computed ->
    if @get('isGrouped')
      return [] if Ember.isEmpty @get('groupedData')
      for groupName, values of @get('groupedData')
        y0 = 0
        stackedValues = for d in values
          y0: y0
          y1: y0 += Math.max(d.value, 0)
          value: d.value
          group: d.group
          label: d.label
          color: d.color
        group: groupName
        values: values
        stackedValues: stackedValues
        totalValue: y0
    else if @get('stackBars')
      return [] if Ember.isEmpty @get('data')
      # If we do not have grouped data and are drawing stacked bars, keep the
      # data in one group so it gets stacked
      y0 = 0
      stackedValues = for d in @get('data')
        y0: y0
        y1: y0 += Math.max(d.value, 0)
      [
        group: @get('data.firstObject.group')
        values: @get('data')
        stackedValues: stackedValues
        totalValue: y0
      ]
    else
      return [] if Ember.isEmpty @get('data')
      # If we have grouped data and do not have stackBars turned on, split the
      # data up so it gets drawn in separate groups and labeled
      for d in @get('data')
        group: d.label
        values: [d]
  # TODO(tony): Need to have stacked bars as a dependency here and the
  # calculation be outside of this
  .property 'groupedData', 'isGrouped', 'stackBars'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  labelHeightOffset: Ember.computed ->
    labelSize =
      if @get('_shouldRotateLabels')
        @get('maxLabelHeight')
      else
        @get('labelHeight')
    labelSize + @get('labelPadding')
  .property('_shouldRotateLabels', 'maxLabelHeight', 'labelHeight',
    'labelPadding')

  legendChartPadding: Ember.computed.alias 'labelHeightOffset'

  # Chart Graphic Dimensions
  graphicLeft: Ember.computed.alias 'labelWidthOffset'

  graphicWidth: Ember.computed ->
     @get('width') - @get('labelWidthOffset')
  .property 'width', 'labelWidthOffset'

  graphicHeight: Ember.computed ->
    @get('height') - @get('legendHeight') - @get('legendChartPadding')
  .property('height', 'legendHeight', 'legendChartPadding')

  # ----------------------------------------------------------------------------
  # Ticks and Scales
  # ----------------------------------------------------------------------------

  # Vertical position/length of each bar and its value
  yDomain: Ember.computed ->
    finishedData = @get 'finishedData'

    minOfGroups = d3.min finishedData, (d) ->
      _.min d.values.map((dd) -> dd.value)
    maxOfGroups = d3.max finishedData, (d) ->
      _.max d.values.map((dd) -> dd.value)
    maxOfStacks = d3.max finishedData, (d) -> d.totalValue
    # minOfStacks is always zero since we do not compute negative stacks
    minOfStacks = d3.min finishedData, (d) -> 0

    if @get('stackBars')
      min = minOfStacks
      max = maxOfStacks
    else
      min = minOfGroups
      max = maxOfGroups

    # force one end of the range to include zero
    if min > 0
      return [ 0, max ]
    if max < 0
      return [ min, 0 ]
    if min is max is 0
      return [ 0, 1 ]
    else
      return [ min, max ]
  .property 'finishedData', 'stackBars'

  yScale: Ember.computed ->
    d3.scale.linear()
      .domain(@get 'yDomain')
      .range([ @get('graphicTop') + @get('graphicHeight'), @get('graphicTop') ])
      .nice(@get 'numYTicks')
  .property 'graphicTop', 'graphicHeight', 'yDomain', 'numYTicks'

  individualBarLabels: Ember.computed ->
    groups = _.values(@get 'groupedData').map (g) ->
      _.pluck g, 'label'
    _.uniq _.flatten(groups)
  .property 'groupedData.@each'

  # The range of labels assigned to each group
  xBetweenGroupDomain: Ember.computed.alias 'groupNames'

  # The range of labels assigned within each group
  xWithinGroupDomain: Ember.computed.alias 'individualBarLabels'

  # The space in pixels allocated to each group
  groupWidth: Ember.computed ->
    @get('xBetweenGroupScale').rangeBand()
  .property 'xBetweenGroupScale'

  # The space in pixels allocated to each bar
  barWidth: Ember.computed ->
    @get('xWithinGroupScale').rangeBand()
  .property 'xWithinGroupScale'

  # The scale used to position bars within each group
  # If we do not have grouped data, use the withinGroupPadding around group
  # data since we will have constructed groups for each bar.
  xWithinGroupScale: Ember.computed ->
    if @get('isGrouped') or @get('stackBars')
      d3.scale.ordinal()
        .domain(@get 'xWithinGroupDomain')
        .rangeRoundBands([ 0, @get('groupWidth') ],
          @get('withinGroupPadding')/2, 0)
    else
      d3.scale.ordinal()
        .domain(@get 'xWithinGroupDomain')
        .rangeRoundBands([ 0, @get('groupWidth') ],
          @get('betweenGroupPadding')/2, @get('betweenGroupPadding')/2)
  .property('isGrouped', 'stackBars', 'xWithinGroupDomain', 'groupWidth',
    'withinGroupPadding', 'betweenGroupPadding')

  # The scale used to position each group and label across the horizontal axis
  # If we do not have grouped data, do not add additional padding around groups
  # since this will only add whitespace to the left/right of the graph.
  xBetweenGroupScale: Ember.computed ->
    labelWidth = @get 'labelWidth'
    if @get('isGrouped') or @get('stackBars')
      betweenGroupPadding = @get('betweenGroupPadding')
    else
      betweenGroupPadding = 0
    d3.scale.ordinal()
      .domain(@get 'xBetweenGroupDomain')
      .rangeRoundBands([ 0, @get('graphicWidth') ],
        betweenGroupPadding/2, betweenGroupPadding/2)
  .property('isGrouped', 'stackBars', 'graphicWidth', 'labelWidth',
    'xBetweenGroupDomain', 'betweenGroupPadding')

  # ----------------------------------------------------------------------------
  # Color Configuration
  # ----------------------------------------------------------------------------

  numColorSeries: Ember.computed.alias 'individualBarLabels.length'

  # ----------------------------------------------------------------------------
  # Legend Configuration
  # ----------------------------------------------------------------------------

  hasLegend: Ember.computed ->
    @get('stackBars') or @get('isGrouped') and @get('legendItems.length') > 1
  .property 'stackBars', 'isGrouped', 'legendItems.length'

  legendItems: Ember.computed ->
    getSeriesColor = @get 'getSeriesColor'
    @get('individualBarLabels').map (d, i) ->
      color = getSeriesColor(d, i)
      label: d
      fill: color
      stroke: color
      icon: -> 'square'
      selector: ".grouping-#{i}"
  .property 'individualBarLabels', 'getSeriesColor'

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>

      # Specify whether we are on an individual bar or group
      isGroup = Ember.isArray(data.values)

      # Do hover detail style stuff here
      element = if isGroup then element.parentNode.parentNode else element
      d3.select(element).classed('hovered', yes)

      # Show tooltip
      content = "<span class=\"tip-label\">#{data.group}</span>"

      formatValue = @get 'formatValue'
      addValueLine = (d) ->
        content +="<span class=\"name\">#{d.label}: </span>"
        content += "<span class=\"value\">#{formatValue(d.value)}</span><br/>"

      if isGroup
        # Display all bar details if hovering over axis group label
        data.values.forEach addValueLine
      else
        # Just hovering over single bar
        addValueLine data
      @showTooltip(content, d3.event)
  .property 'isInteractive'

  hideDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>

      # if we exited the group label undo for the group
      if Ember.isArray(data.values)
        element = element.parentNode.parentNode
      # Undo hover style stuff
      d3.select(element).classed('hovered', no)

      # Hide Tooltip
      @hideTooltip()
  .property 'isInteractive'


  # ----------------------------------------------------------------------------
  # Styles
  # ----------------------------------------------------------------------------

  groupAttrs: Ember.computed ->
    xBetweenGroupScale = @get 'xBetweenGroupScale'
    transform: (d) =>
      dx = @get('graphicLeft') + xBetweenGroupScale(d.group)
      dy = @get('graphicTop')
      "translate(#{dx}, #{dy})"
  .property 'graphicLeft', 'graphicTop', 'xBetweenGroupScale'

  stackedBarAttrs: Ember.computed ->
    # zeroDisplacement is the number of pixels to shift graphics away from
    # the origin line so that they do not overlap with it
    zeroDisplacement = 1
    yScale = @get 'yScale'
    class: (d,i) -> "grouping-#{i}"
    'stroke-width': 0
    width: (d) => @get('groupWidth')
    x: null
    y: (d) => yScale(d.y1) + zeroDisplacement
    height: (d) -> yScale(d.y0) - yScale(d.y1)
  .property 'yScale', 'groupWidth'

  groupedBarAttrs: Ember.computed ->
    zeroDisplacement = 1
    yScale = @get 'yScale'

    class: (d,i) -> "grouping-#{i}"
    'stroke-width': 0
    width: (d) => @get('barWidth')
    x: (d) => @get('xWithinGroupScale')(d.label)
    height: (d) -> Math.max 0,
      Math.abs(yScale(d.value) - yScale(0)) - zeroDisplacement
    y: (d) ->
      if d.value > 0
        yScale(d.value)
      else
        yScale(0) + zeroDisplacement
  .property 'yScale', 'getSeriesColor', 'barWidth', 'xWithinGroupScale'

  labelAttrs: Ember.computed ->
    'stroke-width': 0
    transform: (d) =>
      dx = @get('barWidth')/2
      if @get('isGrouped') or @get('stackBars')
        dx += @get('groupWidth')/2 - @get('barWidth')/2
      else
        dx += @get('xWithinGroupScale')(d.group)
      dy = @get('graphicTop') + @get('graphicHeight') + @get('labelPadding')
      "translate(#{dx}, #{dy})"
  .property('barWidth', 'isGrouped', 'stackBars', 'groupWidth',
    'xWithinGroupScale', 'graphicTop', 'graphicHeight', 'labelPadding')

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  groups: Ember.computed ->
    @get('viewport').selectAll('.bars').data(@get 'finishedData')
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
  # Label Layout
  # ----------------------------------------------------------------------------

  # Space available for labels that are horizontally displayed. This is either
  # the unpadded group width or bar width depending on whether data is grouped
  maxLabelWidth: Ember.computed ->
    if @get('isGrouped') or @get('stackBars')
      maxLabelWidth = @get 'groupWidth'
    else
      maxLabelWidth = @get 'barWidth'
  .property 'isGrouped', 'stackBars', 'groupWidth', 'barWidth'

  _shouldRotateLabels: no
  setRotateLabels: ->
    labels = @get('groups').select('.groupLabel text')
    maxLabelWidth = @get 'maxLabelWidth'
    rotateLabels = no
    # Only rotate labels if doing so gives us more space
    if @get('rotatedLabelLength') > maxLabelWidth
      labels.each (d) ->
        if @getBBox().width > maxLabelWidth
          rotateLabels = yes
    @set '_shouldRotateLabels', rotateLabels

  # Calculate the number of degrees to rotate labels based on how widely labels
  # will be spaced, but never rotate the labels less than 20 degrees
  rotateLabelDegrees: Ember.computed ->
    radians = Math.atan @get('labelHeight') / @get('maxLabelWidth')
    degrees = radians * 180 / Math.PI
    Math.max degrees, 20
  .property 'labelHeight', 'maxLabelWidth'

  rotatedLabelLength: Ember.computed ->
    rotateLabelRadians = Math.PI / 180 * @get('rotateLabelDegrees')
    Math.abs @get('maxLabelHeight') / Math.sin(rotateLabelRadians)
  .property 'maxLabelHeight', 'rotateLabelDegrees'

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  renderVars: ['xWithinGroupScale', 'xBetweenGroupScale', 'yScale',
    'finishedData', 'getSeriesColor']

  drawChart: ->
    @updateData()
    @updateLayout()
    @updateAxes()
    @updateGraphic()
    if @get('hasLegend')
      @drawLegend()
    else
      @clearLegend()

  updateData: ->
    groups = @get 'groups'
    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'

    entering = groups.enter()
      .append('g').attr('class', 'bars')
    entering.append('g').attr('class', 'groupLabel')
      .append('text')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    exiting = groups.exit().remove()

    if @get('stackBars')
      subdata = (d) -> d.stackedValues
    else
      subdata = (d) -> d.values

    bars = groups.selectAll('rect').data(subdata)
    bars.enter().append('rect')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    bars.exit().remove()

  updateLayout: ->
    groups = @get('groups')
    labels = groups.select('.groupLabel text')
      .attr('transform', null) # remove any previous rotation attrs
      .text((d) -> d.group)

    # If there is enough space horizontally, center labels underneath each
    # group. Otherwise, rotate each label and anchor it at the top of its
    # first character.
    @setRotateLabels()

    if @get('_shouldRotateLabels')
      rotateLabelDegrees = @get 'rotateLabelDegrees'
      labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create
        getLabelSize: (d) => @get 'rotatedLabelLength'
        getLabelText: (d) -> d.group
      labels.call(labelTrimmer.get 'trim').attr
        'text-anchor': 'end'
        transform: "rotate(#{-rotateLabelDegrees})"
        dy: (d) -> @getBBox().height

    else
      maxLabelWidth = @get 'maxLabelWidth'
      labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create
        getLabelSize: (d) -> maxLabelWidth
        getLabelText: (d) -> d.group ? ''
      labels.call(labelTrimmer.get 'trim').attr
        'text-anchor': 'middle'
        dy: @get('labelPadding')

  updateAxes: ->
    yAxis = d3.svg.axis()
      .scale(@get 'yScale')
      .orient('right')
      .ticks(@get 'numYTicks')
      .tickSize(@get 'graphicWidth')
      .tickFormat(@get 'formatValue')

    graphicTop = @get 'graphicTop'
    graphicLeft = @get 'graphicLeft'
    gYAxis = @get('yAxis')
      .attr(transform: "translate(#{graphicLeft},#{graphicTop})")
      .call(yAxis)

    gYAxis.selectAll('g')
      .filter((d) -> d isnt 0)
      .classed('major', no)
      .classed('minor', yes)

    gYAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr
        x: -@get('labelPadding')

  updateGraphic: ->
    groups = @get('groups')

    if @get('stackBars')
      barAttrs = @get 'stackedBarAttrs'
    else
      barAttrs = @get 'groupedBarAttrs'

    groups.attr(@get 'groupAttrs')
    groups.selectAll('rect')
      .style('fill', @get('getSeriesColor'))
      .attr(barAttrs)
    labels = groups.select('g.groupLabel')
      .attr(@get 'labelAttrs')
)

Ember.Handlebars.helper('vertical-bar-chart', Ember.Charts.VerticalBarComponent)
