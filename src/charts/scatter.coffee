Ember.Charts.ScatterComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.Legend, Ember.Charts.FloatingTooltipMixin,
  Ember.Charts.AxesMixin,
  classNames: ['chart-scatter']

  # ----------------------------------------------------------------------------
  # Scatter Plot Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatXValue: d3.format('.2s')
  formatYValue: d3.format('.2s')
  formatXValueLong: d3.format(',.r')
  formatYValueLong: d3.format(',.r')

  # Size of each icon on the scatter plot
  dotRadius: 7
  dotShapeArea: Ember.computed ->
    Math.pow @get('dotRadius'), 2
  .property 'dotRadius'

  # Amount to pad the extent of input data so that all displayed points fit
  # neatly within the viewport, as a proportion of the x- and y-range
  graphPadding: 0.05

  # Increase the amount of space between ticks for scatter, basically if we are
  # too aggressive with the tick spacing 1) labels are more likely to be
  # squished together and 2) it is hard for the "nice"ing of the ticks, i.e.,
  # trying to end on actual tick intervals. It would be good to force ticks to
  # end where we want them, but reading the d3.js literature it was not clear
  # how to easily do that.
  tickSpacing: 80

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  isShowingTotal: no
  totalPointData: null

  # Data with invalid/negative values removed
  filteredData: Ember.computed ->
    data = @get 'data'
    return [] if Ember.isEmpty data
    data.filter (d) ->
      # Surprisingly null is finite
      d.xValue? and d.yValue? and isFinite(d.xValue) and isFinite(d.yValue)
  .property 'data.@each'

  # Aggregate the raw data by group, into separate lists of data points
  groupedData: Ember.computed ->
    data = @get('filteredData')
    return [] if Ember.isEmpty data
    groupedData = Ember.Charts.Helpers.groupBy data, (d) =>
      d.group ? @get('ungroupedSeriesName')
    v for k,v of groupedData
  .property 'filteredData.@each'

  groupNames: Ember.computed ->
    d.get(0).group for d in @get('groupedData')
  .property 'groupedData'

  numGroups: Ember.computed.alias 'groupedData.length'

  isGrouped: Ember.computed ->
    @get('numGroups') > 1
  .property 'numGroups'

  finishedData: Ember.computed.alias 'groupedData'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------
  # TODO(tony): Consider making logic for whether we are showing the title or
  # not and then axis mixin will calculate axis offset that will be added
  axisTitleHeightOffset: Ember.computed ->
    @get('axisTitleHeight') + @get('labelPadding')
  .property 'axisTitleHeight', 'labelPadding'

  # TODO(tony): Just use axisBottomOffset here
  legendChartPadding: Ember.computed ->
    @get('axisTitleHeightOffset') + @get('labelHeightOffset')
  .property 'labelHeightOffset', 'axisTitleHeightOffset'

  # Chart Graphic Dimensions
  graphicTop: Ember.computed.alias 'axisTitleHeight'
  graphicLeft: Ember.computed.alias 'labelWidthOffset'

  graphicHeight: Ember.computed ->
    @get('height') - @get('legendHeight') - @get('legendChartPadding')
  .property('height', 'legendHeight', 'legendChartPadding')

  graphicWidth: Ember.computed ->
    @get('width') - @get('labelWidthOffset')
  .property 'width', 'labelWidthOffset'

  # Height of the text for the axis titles
  axisTitleHeight: 18

  # ----------------------------------------------------------------------------
  # Ticks and Scales
  # ----------------------------------------------------------------------------

  xDomain: Ember.computed ->
    totalData = if @get('isShowingTotal') then [@get('totalPointData')] else []
    [xMin, xMax] = d3.extent totalData.concat(@get('filteredData')), (d) -> d.xValue
    if xMin is xMax is 0
      [ -1, 1 ]
    else if xMin is xMax
      [ xMin * (1 - @get('graphPadding')), xMin * (1 + @get('graphPadding')) ]
    else
      [ xMin, xMax ]
  .property 'filteredData.@each', 'isShowingTotal', 'totalPointData'

  yDomain: Ember.computed ->
    totalData = if @get('isShowingTotal') then [@get('totalPointData')] else []
    [yMin, yMax] = d3.extent totalData.concat(@get('filteredData')), (d) -> d.yValue
    if yMin is yMax is 0
      [ -1, 1 ]
    else if yMin is yMax
      [ yMin * (1 - @get('graphPadding')), yMin * (1 + @get('graphPadding')) ]
    else
      [ yMin, yMax ]
  .property('filteredData.@each', 'isShowingTotal', 'totalPointData',
    'graphPadding')

  # The X axis scale spans the range of Y values plus any graphPadding
  xScale: Ember.computed ->
    xDomain = @get 'xDomain'
    graphicLeft = @get 'graphicLeft'
    graphicWidth = @get 'graphicWidth'
    padding = (xDomain[1] - xDomain[0]) * @get('graphPadding')
    d3.scale.linear()
      .domain([ xDomain[0] - padding, xDomain[1] + padding ])
      .range([ graphicLeft, graphicLeft + graphicWidth ])
      .nice(@get 'numXTicks')
  .property('xDomain', 'graphPadding', 'graphicLeft', 'graphicWidth',
    'numXTicks')

  # The Y axis scale spans the range of Y values plus any graphPadding
  yScale: Ember.computed ->
    yDomain = @get 'yDomain'
    graphicTop = @get 'graphicTop'
    graphicHeight = @get 'graphicHeight'
    padding = (yDomain[1] - yDomain[0]) * @get('graphPadding')
    d3.scale.linear()
      .domain([ yDomain[0] - padding, yDomain[1] + padding ])
      .range([ graphicTop + graphicHeight, graphicTop ])
      .nice(@get 'numYTicks')
  .property('yDomain', 'graphPadding', 'graphicTop', 'graphicHeight',
    'numYTicks')

  # ----------------------------------------------------------------------------
  # Graphics Properties
  # ----------------------------------------------------------------------------

  # Scatterplots handle different groups by varying shape of dot first and then
  # vary color or tint of seed color.
  groupShapes: Ember.computed ->
    [
      'circle',
      'square',
      'triangle-up',
      'cross',
      'diamond'
    ]

  numGroupShapes: Ember.computed.alias 'groupShapes.length'

  # Fixed number of colors for scatter plots, total different dot types is
  # numGroupsShapes * numGroupColors
  numGroupColors: 2

  maxNumGroups: Ember.computed ->
    @get('numGroupColors') * @get('numGroupShapes')
  .property 'numGroupColors', 'numGroupShapes'

  # Only display a different icon for each group if the number of groups is less
  # than or equal to the maximum number of groups
  displayGroups: Ember.computed ->
    @get('isGrouped') and @get('numGroups') <= @get('maxNumGroups')
  .property 'isGrouped', 'numGroups', 'numGroupShapes'

  # Since we are only provided with the index of each dot within its <g>, we
  # decide the shape and color of the dot using the index of its group property
  getGroupShape: Ember.computed ->
    (d, i) =>
      i = @get('groupNames').indexOf(d.group)
      return 'circle' unless @get('displayGroups')
      @get('groupShapes')[i % @get('numGroupShapes')]

  getGroupColor: Ember.computed ->
    (d, i) =>
      colorIndex = 0
      if @get('displayGroups')
        i = @get('groupNames').indexOf(d.group)
        colorIndex = Math.floor i / @get('numGroupShapes')
      @get('colorScale') colorIndex / @get('numGroupColors')

  # ----------------------------------------------------------------------------
  # Legend Configuration
  # ----------------------------------------------------------------------------

  hasLegend: Ember.computed.alias 'isGrouped'

  legendIconRadius: Ember.computed.alias 'dotRadius'

  legendItems: Ember.computed ->
    return [] if @get('hasNoData')
    getGroupShape = @get 'getGroupShape'
    getGroupColor = @get 'getGroupColor'
    displayGroups = @get 'displayGroups'

    legendData = @get('groupedData').map (d, i) ->
      name = d.get(0).group
      value = if d.get('length') is 1 then d.get(0) else null

      label: name # `label` is displayed in legend text
      group: name # `group` is used by getGroupShape and getGroupColor
      stroke: getGroupColor
      fill: if displayGroups then getGroupColor else 'transparent'
      icon: getGroupShape
      selector: ".group-#{i}"
      # If we only have one value for this group let's show the value when we
      # hover on the legend
      xValue: value?.xValue
      yValue: value?.yValue

    if @get 'isShowingTotal'
      point = @get 'totalPointData'
      legendData.unshift
        label: point.group
        group: point.group
        stroke: getGroupColor
        selector: '.totalgroup'
        xValue: point.xValue
        yValue: point.yValue

    return legendData
  .property('hasNoData', 'groupedData', 'getGroupShape', 'getGroupColor',
    'displayGroups', 'isShowingTotal', 'totalPointData')

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  xValueDisplayName: 'X Factor'
  yValueDisplayName: 'Y Factor'

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)
      # TODO(tony): handle legend hover

      # Show tooltip
      formatXValue = @get 'formatXValue'
      formatYValue = @get 'formatYValue'
      content = "<span class=\"tip-label\">#{data.group}</span>"
      content +="<span class=\"name\">#{@get('xValueDisplayName')}: </span>"
      content +="<span class=\"value\">#{formatXValue(data.xValue)}</span><br/>"
      content +="<span class=\"name\">#{@get('yValueDisplayName')}: </span>"
      content +="<span class=\"value\">#{formatYValue(data.yValue)}</span>"
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

  groupAttrs: Ember.computed ->
    class: (d,i) -> "group group-#{i}"

  pointAttrs: Ember.computed ->
    # TODO: actually make the indices correspond to each group
    # we'll probably have to preprocess the data
    d: d3.svg.symbol()
      .size(@get 'dotShapeArea')
      .type(@get 'getGroupShape')
    fill: if @get('displayGroups') then @get('getGroupColor') else 'transparent'
    stroke: @get('getGroupColor')
    'stroke-width': 1.5
    transform: (d) =>
      dx = @get('xScale') d.xValue
      dy = @get('yScale') d.yValue
      "translate(#{dx}, #{dy})"
  .property('dotShapeArea', 'getGroupShape', 'xScale', 'yScale', 'displayGroups',
    'getGroupColor')

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  groups: Ember.computed ->
    @get('viewport').selectAll('.group')
      .data(@get 'finishedData')
  .volatile()

  selectOrCreateAxis: (selector) ->
    axis = @get('viewport').select(selector)
    if axis.empty()
      @get('viewport').insert('g', ':first-child')
    else
      axis

  selectOrCreateAxisTitle: (selector) ->
    title = @get('viewport').select(selector)
    if title.empty() then @get('viewport').append('text') else title

  xAxis: Ember.computed ->
    @selectOrCreateAxis('.x.axis')
      .attr('class', 'x axis')
  .volatile()

  yAxis: Ember.computed ->
    @selectOrCreateAxis('.y.axis')
      .attr('class', 'y axis')
  .volatile()

  xAxisTitle: Ember.computed ->
    @selectOrCreateAxisTitle('.x.axis-title')
      .attr('class', 'x axis-title')
  .volatile()

  yAxisTitle: Ember.computed ->
    @selectOrCreateAxisTitle('.y.axis-title')
      .attr('class', 'y axis-title')
  .volatile()

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  renderVars: ['xScale', 'yScale', 'dotShapeArea', 'finishedData',
    'xValueDisplayName', 'yValueDisplayName']

  drawChart: ->
    @updateTotalPointData()
    @updateData()
    @updateAxes()
    @updateGraphic()
    if @get('hasLegend')
      @drawLegend()
    else
      @clearLegend()

  totalPointShape: Ember.computed ->
    dotShapeArea = @get 'dotShapeArea'
    (selection) =>
      selection.append('path')
        .attr
          class: 'totaldot'
          d: d3.svg.symbol()
            .size(dotShapeArea)
            .type('circle')
          fill: @get('getGroupColor')

      selection.append('path')
        .attr
          class: 'totaloutline'
          d: d3.svg.symbol()
              # The outline should be just bigger than the dot area
              .size(dotShapeArea*3)
              .type('circle')
          fill: 'transparent'
          stroke: @get('getGroupColor')
          'stroke-width': 2

  updateTotalPointData: ->
    totalData = if @get('isShowingTotal') then [@get('totalPointData')] else []
    totalPoint = @get('viewport').selectAll('.totalgroup').data(totalData)
    totalPoint.exit().remove()
    totalPoint.enter().append('g')
      .attr('class', 'totalgroup')
      .call(@get 'totalPointShape')

  updateData: ->
    groups = @get('groups')
    groups.enter().append('g')
      .attr('class', 'group')
        .attr(@get 'groupAttrs')
    groups.exit().remove()

    points = groups.selectAll('.dot')
      .data((d) -> d)
    points.enter().append('path')
      .attr('class', 'dot')
    points.exit().remove()

  updateAxes: ->

    xAxis = d3.svg.axis()
      .scale(@get 'xScale')
      .orient('top')
      .ticks(@get 'numXTicks')
      .tickSize(@get 'graphicHeight')
      .tickFormat(@get 'formatXValue')

    yAxis = d3.svg.axis()
      .scale(@get 'yScale')
      .orient('right')
      .ticks(@get 'numYTicks')
      .tickSize(@get 'graphicWidth')
      .tickFormat(@get 'formatYValue')

    graphicTop = @get 'graphicTop'
    graphicHeight = @get 'graphicHeight'
    gXAxis = @get('xAxis')
      .attr('transform', "translate(0,#{graphicTop+graphicHeight})")
      .call(xAxis)

    gXAxis.selectAll('g')
      .filter((d) -> d isnt 0)
      .classed('major', no)
      .classed('minor', yes)

    labelPadding = @get 'labelPadding'
    gXAxis.selectAll('text')
      .style('text-anchor', 'middle')
      .attr
        y: (d) -> @getBBox().height + labelPadding / 2

    graphicLeft = @get 'graphicLeft'
    gYAxis = @get('yAxis')
      .attr('transform', "translate(#{graphicLeft},0)")
      .call(yAxis)

    gYAxis.selectAll('g')
      .filter((d) -> d isnt 0)
      .classed('major', no)
      .classed('minor', yes)

    gYAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr
        x: -@get('labelPadding')

    # Update Axis Titles
    xAxisPadding = @get('labelHeightOffset') + @get('labelPadding')
    @get('xAxisTitle')
      .text(@get 'xValueDisplayName')
      .style('text-anchor', 'middle')
      .attr
        x: @get('graphicWidth')/2 + @get('labelWidthOffset')
        y: @get('graphicBottom') + xAxisPadding

    @get('yAxisTitle')
      .text(@get 'yValueDisplayName')
      .style('text-anchor', 'start')
      .attr
        y: 0
        x: -@get('labelPadding')

  updateGraphic: ->

    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'

    @get('groups')
      .selectAll('.dot')
      .attr(@get 'pointAttrs')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))

    @get('viewport').select('.totalgroup')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
      .attr
        transform: (d) =>
          dx = @get('xScale') d.xValue
          dy = @get('yScale') d.yValue
          "translate(#{dx}, #{dy})"
)

Ember.Handlebars.helper('scatter-chart', Ember.Charts.ScatterComponent)
