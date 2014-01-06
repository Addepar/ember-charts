Ember.Charts.Legend = Ember.Mixin.create

  # ----------------------------------------------------------------------------
  # Legend settings
  # ----------------------------------------------------------------------------

  # Padding between legend and chart
  legendTopPadding: 10

  # Acceptable dimensions for each legend item
  legendItemHeight: 18
  minLegendItemWidth: 120
  maxLegendItemWidth: 160

  # Radius of each legend icon
  legendIconRadius: 9

  # Padding between each legend icon and padding
  legendLabelPadding: 10

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  # Outside bounds of legend
  legendWidth: Ember.computed.alias 'width'

  legendHeight: Ember.computed ->
    @get('numLegendRows') * @get('legendItemHeight')
  .property 'numLegendRows', 'legendItemHeight'

  # Dynamically calculate the size of each legend item
  legendItemWidth: Ember.computed ->
    itemWidth = @get('legendWidth') / @get('legendItems.length')
    return @get('minLegendItemWidth') if itemWidth < @get('minLegendItemWidth')
    return @get('maxLegendItemWidth') if itemWidth > @get('maxLegendItemWidth')
    itemWidth
  .property('legendWidth', 'minLegendItemWidth', 'maxLegendItemWidth',
    'legendItems.length')

  # Dynamically calculate the number of legend items in each row
  numLegendItemsPerRow: Ember.computed ->
    Math.floor(@get('legendWidth') / @get('legendItemWidth'))
  .property 'legendWidth', 'legendItemWidth'

  # Dynamically calculate the number of rows needed
  numLegendRows: Ember.computed ->
    Math.ceil(@get('legendItems.length') / @get('numLegendItemsPerRow'))
  .property 'legendItems.length', 'numLegendItemsPerRow'

  # Maximum width of each label before it gets truncated
  legendLabelWidth: Ember.computed ->
    @get('legendItemWidth') - @get('legendIconRadius') -
      @get('legendLabelPadding') * 2
  .property 'legendItemWidth', 'legendIconRadius', 'legendLabelPadding'

  # ----------------------------------------------------------------------------
  # Styles
  # ----------------------------------------------------------------------------

  # Space between legend and chart (need to account for label size and perhaps
  # more). Charts will usually override this because there may be other things
  # below the chart graphic like an axis or labels or axis title.
  legendChartPadding: 0

  # Center the legend beneath the chart. Since the legend is inside the chart
  # viewport, which has already been positioned with regards to margins,
  # only consider the height of the chart.
  legendAttrs: Ember.computed ->
    dx = @get('outerWidth') / 2
    offsetToLegend = @get('legendChartPadding') + @get('legendTopPadding')
    dy = @get('graphicBottom') + offsetToLegend
    transform: "translate(#{dx}, #{dy})"
  .property('outerWidth', 'graphicBottom', 'legendTopPadding',
    'legendChartPadding')

  # Place each legend item, breaking across rows. Center them if there is one
  # row
  legendItemAttrs: Ember.computed ->
    legendItemWidth = @get 'legendItemWidth'
    legendItemHeight = @get 'legendItemHeight'
    numItemsPerRow = @get 'numLegendItemsPerRow'
    numAllItems = @get 'legendItems.length'
    isSingleRow = @get('numLegendRows') is 1
    class: 'legend-item'
    width: legendItemWidth
    'stroke-width': 0
    transform: (d, i) =>
      col = i % numItemsPerRow
      row = Math.floor(i / numItemsPerRow)
      items = if isSingleRow then numAllItems else numItemsPerRow
      dx = col * legendItemWidth - items/2 * legendItemWidth + 1/2
      dy = row * legendItemHeight + legendItemHeight/2
      "translate(#{dx}, #{dy})"
  .property('legendItemWidth', 'legendItemHeight',
    'numLegendItemsPerRow', 'legendItems.length', 'numLegendRows')

  legendIconAttrs: Ember.computed ->
    iconRadius = @get 'legendIconRadius'
    legendItemHeight = @get 'legendItemHeight'
    d: (d, i) ->
      # TODO(tony): I am uncomfortable with this intimacy between legend and
      # time series chart
      # Legend icon for line graphics
      if d.icon(d) is 'line'
        "M #{-iconRadius} 0 L #{iconRadius} 0"
      else
        d3.svg.symbol()
          .type(d.icon(d, i))
          .size(Math.pow(iconRadius, 2))(d,i)
    fill: (d, i) ->
      if _.isFunction d.fill then d.fill(d, i) else d.fill
    stroke: (d, i) ->
      if _.isFunction d.stroke then d.stroke(d, i) else d.stroke
    'stroke-width': (d) ->
      return 1.5 unless d.width
      if _.isFunction d.width then d.width(d, i) else d.width
    'stroke-dasharray': (d) ->
      return '2,2' if d.dotted
  .property 'legendIconRadius', 'legendItemHeight'

  legendLabelAttrs: Ember.computed ->
    x: @get('legendIconRadius')/2 + @get('legendLabelPadding')
    y: '.35em'
  .property 'legendIconRadius', 'legendLabelPadding', 'legendItemHeight'

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showLegendDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)
      if data.selector
        @get('viewport').selectAll(data.selector).classed('hovered', yes)

      # Show tooltip
      content = "<span class=\"tip-label\">#{data.label}</span>"
      if data.xValue?
        formatXValue = @get 'formatXValue'
        formatYValue = @get 'formatYValue'
        content +="<span class=\"name\">#{@get('tooltipXValueDisplayName')}: </span>"
        content +="<span class=\"value\">#{formatXValue(data.xValue)}</span><br/>"
        content +="<span class=\"name\">#{@get('tooltipYValueDisplayName')}: </span>"
        content +="<span class=\"value\">#{formatYValue(data.yValue)}</span>"
      @showTooltip(content, d3.event)
  .property 'isInteractive'

  hideLegendDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Undo hover style stuff
      d3.select(element).classed('hovered', no)
      if data.selector
        @get('viewport').selectAll(data.selector).classed('hovered', no)
      # Hide Tooltip
      @hideTooltip()
  .property 'isInteractive'

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  clearLegend: ->
    @get('viewport')
      .select('.legend-container')
      .remove()

  legend: Ember.computed ->
    # TODO(tony): This is stuff that should be done with handlebars
    legend = @get('viewport')
      .select('.legend-container')
    if legend.empty()
      return @get('viewport')
        .append('g')
        .attr('class', 'legend-container')
    else
      return legend
  .volatile()

  drawLegend: ->
    @clearLegend()
    legend = @get 'legend'

    legend.attr(@get 'legendAttrs')

    showLegendDetails = @get 'showLegendDetails'
    hideLegendDetails = @get 'hideLegendDetails'
    legendItems = legend.selectAll('.legend-item')
      .data(@get 'legendItems')
      .enter().append('g')
      .attr(@get 'legendItemAttrs')
      .on("mouseover", (d,i) -> showLegendDetails(d,i,this))
      .on("mouseout", (d,i) -> hideLegendDetails(d,i,this))

    legendIconAttrs = @get 'legendIconAttrs'
    isShowingTotal = @get 'isShowingTotal'
    totalPointShape = @get 'totalPointShape'
    legendItems.each (d, i) ->
      sel = d3.select(this)
      if (i is 0) and isShowingTotal
        sel.append('g')
          .attr('class', 'icon')
          .call(totalPointShape)
      else
        d3.select(this).append('path')
          .attr('class', 'icon')
          .attr(legendIconAttrs)

    legendLabelWidth = @get 'legendLabelWidth'
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create
      getLabelSize: (d) -> legendLabelWidth
      getLabelText: (d) -> d.label

    labels = legendItems.append('text')
      .style('text-anchor', 'start')
      .text((d) -> d.label)
      .attr(@get 'legendLabelAttrs')
      .call(labelTrimmer.get 'trim')
