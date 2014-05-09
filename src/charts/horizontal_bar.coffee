Ember.Charts.HorizontalBarComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.FloatingTooltipMixin,
  classNames: ['chart-horizontal-bar']

  # ----------------------------------------------------------------------------
  # Horizontal Bar Chart Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatValue: d3.format('.2s')
  formatValueLong: d3.format(',.r')

  # Sort key for the data
  selectedSortType: 'value'

  # Minimum height of the whole chart, including padding
  defaultOuterHeight: 500

  # Override maximum width of labels to be a percentage of the total width
  labelWidth: Ember.computed ->
    0.25 * @get('outerWidth')
  .property 'outerWidth'

  # Space between label and zeroline (overrides ChartView)
  # Also used to pad labels against the edges of the viewport
  labelPadding: 20

  # Space between adjacent bars, as fraction of padded bar size
  barPadding: 0.2

  # Constraints on size of each bar
  maxBarThickness: 60
  minBarThickness: 20

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  sortedData: Ember.computed ->
    data = @get('data')
    return [] if Ember.isEmpty(data)

    sortType = @get 'selectedSortType'
    sortFunc = switch sortType
      when 'value' then (d) => -d.value
      when 'label' then (d) => d.label
    comparator = (a,b) ->
      if sortFunc(a) < sortFunc(b) then -1
      else if sortFunc(a) > sortFunc(b) then 1
      else 0
    data.sort(comparator)
  .property 'data.@each', 'selectedSortType'

  finishedData: Ember.computed.alias 'sortedData'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  minOuterHeight: Ember.computed ->
    minBarSpace = @get('numBars') * @get('minBarThickness')
    minBarSpace + @get('marginTop') + @get('marginBottom')
  .property 'numBars', 'minBarThickness', 'marginTop', 'marginBottom'

  maxOuterHeight: Ember.computed ->
    maxBarSpace = @get('numBars') * @get('maxBarThickness')
    maxBarSpace + @get('marginTop') + @get('marginBottom')
  .property 'numBars', 'maxBarThickness', 'marginTop', 'marginBottom'

  # override the default outerHeight, so the graph scrolls
  outerHeight: Ember.computed ->
    maxMinDefault = d3.max([@get('defaultOuterHeight'), @get('minOuterHeight')])
    d3.min([ maxMinDefault, @get('maxOuterHeight') ])
  .property 'minOuterHeight', 'maxOuterHeight', 'defaultOuterHeight'

  marginTop: Ember.computed.alias 'labelPadding'
  marginBottom: Ember.computed.alias 'labelPadding'

  horizontalMargin: Ember.computed ->
    @get('labelWidth') + @get('labelPadding') * 2
  .property 'labelWidth', 'labelPadding'

  # ----------------------------------------------------------------------------
  # Graphics Properties
  # ----------------------------------------------------------------------------

  numBars: Ember.computed.alias 'finishedData.length'

  # Range of values used to size the graph, within which bars will be drawn
  xDomain: Ember.computed ->
    values = @get('finishedData').map (d) => d.value
    minValue = d3.min(values)
    maxValue = d3.max(values)
    if minValue < 0
      # Balance negative and positive axes if we have negative values
      absMax = Math.max(-minValue, maxValue)
      [ -absMax, absMax ]
    else
      # Only positive values domain
      [ 0, maxValue ]
  .property 'finishedData', 'xDomainPadding'

  # Scale to map value to horizontal length of bar
  xScale: Ember.computed ->
    d3.scale.linear()
      .domain(@get 'xDomain')
      .range([ 0, @get('width') ])
      .nice()
  .property 'width', 'xDomain'

  # Scale to map bar index to its horizontal position
  yScale: Ember.computed ->
    # Evenly split up height for bars with space between bars
    d3.scale.ordinal()
      .domain(d3.range(@get 'numBars'))
      .rangeRoundBands([ 0, @get('height') ], @get('barPadding'))
  .property 'height', 'barPadding'

  # Space in pixels allocated to each bar + padding
  barThickness: Ember.computed ->
    @get('yScale').rangeBand()
  .property 'yScale'

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)

      # Show tooltip
      formatValue = @get 'formatValue'
      # Line 1
      content = "<span class=\"tip-label\">#{data.label}</span>"
      # Line 2
      content +="<span class=\"name\">#{@get 'tooltipValueDisplayName'}: </span>"
      content +="<span class=\"value\">#{formatValue(data.value)}</span>"
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
    xScale = @get 'xScale'
    yScale = @get 'yScale'
    transform: (d, i) =>
      value = Math.min 0, d.value
      "translate(#{xScale value}, #{yScale i})"
  .property 'xScale', 'yScale'

  barAttrs: Ember.computed ->
    xScale = @get 'xScale'
    width: (d) -> Math.abs xScale(d.value) - xScale(0)
    height: @get('barThickness')
    'stroke-width': 0
    style: (d) =>
      return "fill:#{d.color}" if d.color

      if d.value < 0
        color = @get('mostTintedColor')
      else
        color = @get('leastTintedColor')
      "fill:#{color}"
  .property 'xScale', 'mostTintedColor', 'leastTintedColor', 'barThickness'

  valueLabelAttrs: Ember.computed ->
    xScale = @get 'xScale'
    # Anchor the label 'labelPadding' away from the zero line
    x: (d) =>
      if d.value < 0
        - @get('labelPadding')
      else
        xScale(d.value) - xScale(0) + @get('labelPadding')
    y: @get('barThickness') / 2
    dy: '.35em'
    # How to anchor the text depends on the direction of the bar
    'text-anchor': (d) -> if d.value < 0 then 'end' else 'start'
    'stroke-width': 0
  .property 'xScale', 'barThickness', 'labelPadding'

  groupLabelAttrs: Ember.computed ->
    xScale = @get 'xScale'
    # Anchor the label 'labelPadding' away from the zero line
    x: (d) =>
      if d.value < 0
        xScale(0) - xScale(d.value) + @get('labelPadding')
      else
        - @get('labelPadding')
    y: @get('barThickness') / 2
    dy: '.35em'
    # How to anchor the text depends on the direction of the bar
    'text-anchor': (d) -> if d.value < 0 then 'start' else 'end'
    'stroke-width': 0
  .property 'xScale', 'barThickness', 'labelPadding'

  axisAttrs: Ember.computed ->
    xScale = @get 'xScale'
    x1: xScale(0)
    x2: xScale(0)
    y1: 0
    # Thickness, counts the padding allocated to each bar as well
    y2: @get('height')
  .property 'xScale', 'height'

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  groups: Ember.computed ->
    @get('viewport')
      .selectAll('.bar').data(@get 'finishedData')
  .volatile()

  yAxis: Ember.computed ->
    yAxis = @get('viewport').select('.y.axis line')
    if yAxis.empty()
      return @get('viewport')
        .insert('g', ':first-child')
        .attr('class', 'y axis')
        .append('line')
    else
      return yAxis
  .volatile()

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  renderVars: ['barThickness', 'yScale', 'finishedData', 'colorRange']

  drawChart: ->
    @updateData()
    @updateAxes()
    @updateGraphic()

  updateData: ->
    groups = @get 'groups'
    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'

    entering = groups.enter()
      .append('g').attr('class', 'bar')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    entering.append('rect')
    entering.append('text').attr('class', 'value')
    entering.append('text').attr('class', 'group')

    exiting = groups.exit().remove()

  updateAxes: ->
    @get('yAxis').attr(@get 'axisAttrs')

  updateGraphic: ->
    groups = @get('groups')
      .attr(@get 'groupAttrs')

    groups.select('rect')
      .attr(@get 'barAttrs')

    valueLabels = groups.select('text.value')
      .text((d) => @get('formatValue') d.value)
      .attr(@get 'valueLabelAttrs')

    labelWidth = @get 'labelWidth'
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create
      getLabelSize: (d) -> labelWidth
      getLabelText: (d) -> d.label

    groupLabels = groups.select('text.group')
      .text((d) => d.label)
      .attr(@get 'groupLabelAttrs')
      .call(labelTrimmer.get 'trim')
)

Ember.Handlebars.helper('horizontal-bar-chart', Ember.Charts.HorizontalBarComponent)
