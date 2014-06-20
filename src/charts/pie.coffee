Ember.Charts.PieComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.PieLegend, Ember.Charts.FloatingTooltipMixin,
  classNames: ['chart-pie']
  # ----------------------------------------------------------------------------
  # Pie Chart Options
  # ----------------------------------------------------------------------------

  # Getters for formatting human-readable labels from provided data
  formatValue: d3.format('.2s')
  formatValueLong: d3.format(',.r')

  # The smallest slices will be combined into an "Other" slice until no slice is
  # smaller than minSlicePercent. "Other" is also guaranteed to be larger than
  # minSlicePercent.
  minSlicePercent: 5

  # The maximum number of slices. If the number of slices is greater
  # than this then the smallest slices will be combined into an "other"
  # slice until there are at most maxNumberOfSlices.
  maxNumberOfSlices: 8

  # Override maximum width of labels to be a percentage of the total width
  labelWidth: Ember.computed ->
    0.25 * @get('outerWidth')
  .property 'outerWidth'

  # Essentially we don't want a maximum radius
  maxRadius: 2000

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  sortFunction: Ember.computed ->
    switch @get 'selectedSortType'
      when 'value' then (d) -> d.percent
      when 'label' then (d) -> d.label
      else (d) -> d.percent
  .property 'selectedSortType'

  # Data with invalid/negative values removed
  filteredData: Ember.computed ->
    data = @get 'data'
    return [] if Ember.isEmpty data
    data.filter (child) -> child.value >= 0
  .property 'data.@each'

  # Negative values that have been discarded from the data
  rejectedData: Ember.computed ->
    data = @get 'data'
    return [] if Ember.isEmpty data
    data.filter (child) -> child.value < 0
  .property 'data.@each'

  # Valid data points that have been sorted by selectedSortType
  sortedData: Ember.computed ->
    data = @get 'filteredData'
    total = data.reduce (p, child) ->
      child.value + p
    , 0
    return [] if total is 0

    data = data.map (d) ->
      color: d.color
      label: d.label
      value: d.value
      percent: d3.round( 100 * d.value / total )

    _.sortBy data, @get('sortFunction')
  .property 'filteredData', 'sortFunc'

  # This takes the sorted slices that have percents calculated and returns
  # sorted slices that obey the "other" slice aggregation rules
  sortedDataWithOther: Ember.computed ->
    data = _.cloneDeep(@get 'sortedData').reverse()
    maxNumberOfSlices = @get 'maxNumberOfSlices'
    minNumberOfSlices = @get 'minNumberOfSlices'
    minSlicePercent = @get 'minSlicePercent'
    otherItems = []
    otherSlice = label: 'Other', percent: 0, _otherItems: otherItems

    # First make an other slice out of any slices below percent threshold
    # Find the first slice below
    lowPercentIndex = _.indexOf data, _.find(data, (d) =>
      d.percent < minSlicePercent
    )

    # Guard against not finding any slices below the threshold
    if lowPercentIndex < 0
      lowPercentIndex = data.length
    else
      # Add low percent slices to other slice
      _.rest(data, lowPercentIndex).forEach (d) ->
        otherItems.push(d)
        otherSlice.percent += d.percent
      # Ensure Other slice is larger than minSlicePercent
      if otherSlice.percent < minSlicePercent
        lastItem = data[lowPercentIndex - 1]
        if lastItem.percent < minSlicePercent
          lowPercentIndex -= 1
          otherItems.push lastItem
          otherSlice.percent += lastItem.percent

    # Reduce max number of slices that we can have if we now have an other slice
    maxNumberOfSlices -= 1 if otherSlice.percent > 0

    # Next, continue putting slices in other slice if there are too many
    slicesLeft = _.first(data, lowPercentIndex)
    overflowSlices = _.rest(slicesLeft, maxNumberOfSlices)
    if overflowSlices.length > 0
      overflowSlices.forEach (d) ->
        otherItems.push(d)
        otherSlice.percent += d.percent
      slicesLeft = _.first slicesLeft, maxNumberOfSlices

    # only push other slice if there is more than one other item
    if otherItems.length is 1
      slicesLeft.push(otherItems[0])
    else if otherSlice.percent > 0
      slicesLeft.push(otherSlice)

    # make slices appear in descending order
    return slicesLeft.reverse()
  .property 'sortedData', 'maxNumberOfSlices', 'minSlicePercent'

  otherData: Ember.computed ->
    otherSlice = _.find @get('sortedDataWithOther'), (d) -> d._otherItems
    otherItems = otherSlice?._otherItems ? []
    _.sortBy(otherItems, @get 'sortFunction').reverse()
  .property 'sortedDataWithOther', 'sortFunction'

  finishedData: Ember.computed.alias 'sortedDataWithOther'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  # TODO(tony): This should probably be merged with the API for controlling
  # a legend in general, very similar to that code

  # For the pie chart, horizontalMargin and verticalMargin are used to center
  # the graphic in the middle of the viewport
  horizontalMargin: Ember.computed ->
    @get('labelPadding') + @get('labelWidth')
  .property 'labelPadding', 'labelWidth'

  # Bottom margin is equal to the total amount of space the legend might need
  marginBottom: Ember.computed ->
    @get('legendHeight')
  .property 'legendHeight'

  # Top margin will only be a percentage of the bottom margin since we don't
  # have a legend there and would like the pie to lift to the top
  # Note(edward): There can be multiple legends on the top depending on the data.
  # If 2nd and 3rd largest slices sum to less than 15%, then there will be at
  # least two legends stacked on the top of the pie, and so we need to return a
  # larger marginTop.
  marginTop: Ember.computed ->
    finishedData = @get('finishedData')
    dataLength = finishedData.length
    if finishedData.length > 2 and
    finishedData[dataLength - 3].percent + finishedData[dataLength - 2].percent < 15
      @get('marginBottom')
    else
      0.3 * @get('marginBottom')
  .property 'marginBottom', 'finishedData'

  # ----------------------------------------------------------------------------
  # Graphics Properties
  # ----------------------------------------------------------------------------

  numSlices: Ember.computed.alias 'finishedData.length'

  # Offset slices so that the largest slice finishes at 12 o'clock
  startOffset: Ember.computed ->
    data = @get 'finishedData'
    sum = data.reduce((p, d) ->
      d.percent + p
    , 0)
    _.last(data).percent / sum * 2 * Math.PI
  .property 'finishedData'

  # Radius of the pie graphic, resized to fit the viewport.
  radius: Ember.computed ->
    d3.min [ @get('maxRadius'), @get('width') / 2, @get('height') / 2 ]
  .property 'maxRadius', 'width', 'height'

  # Radius at which labels will be positioned
  labelRadius: Ember.computed ->
    @get('radius') + @get('labelPadding')
  .property 'radius', 'labelPadding'

  # ----------------------------------------------------------------------------
  # Color Configuration
  # ----------------------------------------------------------------------------

  getSliceColor: Ember.computed ->
    (d, i) =>
      return d.data.color if d.data?.color

      numSlices = @get 'numSlices'
      # Data is sorted ascending so need to reverse to pick color
      index = numSlices - i - 1
      index = index / (numSlices - 1)  unless numSlices is 1
      @get('colorScale') index
  .property 'numSlices', 'colorScale'

  # ----------------------------------------------------------------------------
  # Legend Configuration
  # ----------------------------------------------------------------------------

  legendItems: Ember.computed ->
    @get('otherData').concat(@get 'rejectedData')
  .property 'otherData', 'rejectedData'

  hasLegend: Ember.computed ->
    @get('legendItems.length') > 0
  .property 'legendItems.length'

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (d, i, element) =>
      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)

      # Show tooltip
      data = d.data
      if data._otherItems
        # If we are on the other slice just highlight legend without tooltip
        @get('viewport').select('.legend').classed('hovered', yes)
      else
        # Show tooltip when not on hover
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
    (d, i, element) =>
      # Undo hover style stuff
      d3.select(element).classed('hovered', no)

      data = d.data
      if data._otherItems
        @get('viewport').select('.legend').classed('hovered', no)
      else
        @hideTooltip()
  .property 'isInteractive'

  # ----------------------------------------------------------------------------
  # Styles/Layout Functions
  # ----------------------------------------------------------------------------

  # SVG transform to center pie in the viewport
  transformViewport: Ember.computed ->
    cx = @get('marginLeft') + @get('width') / 2
    cy = @get('marginTop') + @get('height') / 2
    "translate(#{cx},#{cy})"
  .property 'marginLeft', 'marginTop', 'width', 'height'

  # Arc drawing function for pie with specified radius
  arc: Ember.computed ->
    arc = d3.svg.arc()
      .outerRadius(@get 'radius')
      .innerRadius(0)
  .property 'radius'

  # Pie layout function starting with the largest slice at zero degrees or
  # 12 oclock. Since the data is already sorted, this goes largest to smallest
  # counter clockwise
  pie: Ember.computed ->
    d3.layout.pie()
      .startAngle(@get 'startOffset')
      .endAngle(@get('startOffset') + Math.PI * 2)
      .sort(null) # turn off sorting since our data is already sorted
      .value((d) -> d.percent)
  .property 'startOffset'

  groupAttrs: Ember.computed ->
    class: (d) -> if d.data._otherItems then 'arc other-slice' else 'arc'

  sliceAttrs: Ember.computed ->
    d: @get 'arc'
    fill: @get 'getSliceColor'
    stroke: @get 'getSliceColor'
  .property 'arc', 'getSliceColor'

  labelAttrs: Ember.computed ->
    arc = @get 'arc'
    labelRadius = @get 'labelRadius'
    lastXPos = 0
    lastYPos = 0
    if @get('numSlices') > 1
      dy: '.35em'
      # Clear any special label styling that may have been set when only
      # displaying one data point on the chart
      style: null
      'stroke-width': 0
      # Anchor the text depending on whether the label is on the left or
      # right side of the pie, note that because of the angle offset we do
      # for the first pie slice we need to pay attention to the angle being
      # greater than 2*Math.PI
      'text-anchor': (d) ->
        angle = (d.endAngle - d.startAngle) * 0.5 + d.startAngle
        if ( Math.PI < angle < 2 * Math.PI ) then 'end' else 'start'
      # Position labels just outside of arc center outside of pie, making sure
      # not to create any two labels too close to each other. Since labels are
      # placed sequentially, we check the height where the last label was
      # placed,and if the new label overlaps the last, move the new label one
      # label's height away
      transform: (d) ->
        [x, y] = arc.centroid(d)
        f = (d) -> d / Math.sqrt(x * x + y * y) * labelRadius
        labelXPos = f x
        labelYPos = f y
        labelHeight = @getBBox().height
        isSwitchingSides = lastXPos > 0 > labelXPos or lastXPos < 0 < labelXPos
        labelsTooClose = Math.abs(labelYPos - lastYPos) < labelHeight
        if labelsTooClose and not isSwitchingSides
          if labelYPos < lastYPos
            labelYPos = lastYPos - labelHeight
          else
            labelYPos = lastYPos + labelHeight
        lastXPos = labelXPos
        lastYPos = labelYPos
        "translate(#{labelXPos},#{labelYPos})"
    else
      # When there is only one label, position it in the middle of the chart.
      # This resolves a bug where rendering a chart with a single label multiple
      # times may cause the label to jitter, since lastXPos and lastYPos retain
      # their values from the last layout of the chart.
      mostTintedColor = @get 'mostTintedColor'
      dy: '.71em'
      'stroke-width': 0
      'text-anchor': 'middle'
      transform: null
      style: "fill:#{mostTintedColor};"
  .property 'arc', 'labelRadius', 'numSlices', 'mostTintedColor'

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  groups: Ember.computed ->
    data = @get('pie') @get('finishedData')
    @get('viewport').selectAll('.arc').data(data)
  .volatile()

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  renderVars: ['radius', 'labelWidth', 'finishedData']

  drawChart: ->
    @updateData()
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
      .append('g')
      .attr(class: 'arc')
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))
    entering.append('path').attr('class', 'slice')
    entering.append('text').attr('class', 'data')

    groups.exit().remove()

  updateGraphic: ->
    groups = @get('groups')
      .attr(@get 'groupAttrs')

    groups.select('path')
      .attr(@get 'sliceAttrs')

    labelWidth = @get 'labelWidth'
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create
      getLabelSize: (d) -> labelWidth
      getLabelText: (d) -> d.data.label

    groups.select('text.data')
      .text((d) -> d.data.label)
      .attr(@get 'labelAttrs')
      .call(labelTrimmer.get 'trim')
      .text((d) -> "#{this.textContent}, #{d.data.percent}%")
)

Ember.Handlebars.helper('pie-chart', Ember.Charts.PieComponent)
