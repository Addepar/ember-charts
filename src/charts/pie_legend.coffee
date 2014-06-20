Ember.Charts.PieLegend = Ember.Mixin.create

  # ----------------------------------------------------------------------------
  # Legend settings
  # ----------------------------------------------------------------------------

  # Padding at top and bottom of legend. Legend is positioned adjacent to the
  # bottom of the viewport, with legendVerticalPadding pixels separating top of
  # legend and chart graphic
  # TODO(tony): This should take into account the label heights of the pie to
  # guarrantee no intersection with them
  legendVerticalPadding: 30

  # Padding on left and right of legend text is a percentage of total width
  legendHorizontalPadding: Ember.computed ->
    0.2 * @get('outerWidth')
  .property 'outerWidth'

  # Maximum height of the actual text in the legend
  maxLabelHeight: Ember.computed ->
    0.05 * @get('outerHeight')
  .property 'outerWidth', 'outerHeight'

  # ----------------------------------------------------------------------------
  # Layout
  # ----------------------------------------------------------------------------

  legendWidth: Ember.computed ->
    @get('outerWidth') - @get('legendHorizontalPadding')
  .property 'outerWidth', 'legendHorizontalPadding'

  # Height of max possible text height + padding. This is not the height of the
  # actual legend displayed just the total amount of room the legend might need
  legendHeight: Ember.computed ->
    @get('maxLabelHeight') + @get('legendVerticalPadding') * 2
  .property 'maxLabelHeight', 'legendVerticalPadding'

  # ----------------------------------------------------------------------------
  # Styles
  # ----------------------------------------------------------------------------

  # Center the legend at the bottom of the chart drawing area. Since the legend
  # is inside the chart viewport, which has already been centered only consider
  # the height of the chart.
  legendAttrs: Ember.computed ->
    dx = 0
    # This will leave a bit of padding due to the fact that marginBottom is
    # larger than marginTop which centers the pie above the middle of the chart
    # Note(edward): The marginBottom is not larger than marginTop when there may
    # be labels at the top.
    # In the default case where marginTop is 0.3 * marginBottom, the below
    # evaluates to 0.
    offsetToLegend = 0.15 * (@get 'marginBottom') - (@get 'marginTop') / 2
    dy = @get('outerHeight') / 2 + offsetToLegend
    transform: "translate(#{dx}, #{dy})"
  .property 'outerHeight', 'marginTop', 'marginBottom'

  legendLabelAttrs: Ember.computed ->
    style: "text-anchor:middle;"
    y: '-.35em'

  # ----------------------------------------------------------------------------
  # Selections
  # ----------------------------------------------------------------------------

  legend: Ember.computed ->
    legend = @get('viewport').select('.legend')
    if legend.empty()
      return @get('viewport').append('g')
        .attr('class', 'legend')
    else
      return legend
  .volatile()

  # ----------------------------------------------------------------------------
  # Drawing Functions
  # ----------------------------------------------------------------------------

  clearLegend: ->
    @get('viewport')
      .select('.legend .labels')
      .remove()

  drawLegend: ->
    @clearLegend()

    legend = @get('legend')
      .attr(@get 'legendAttrs')

    # Bind hover state to the legend
    otherSlice = @get('viewport').select('.other-slice')
    if @get('isInteractive') and not otherSlice.empty()
      legend.on('mouseover', ->
        otherSlice.classed('hovered', yes)
        legend.classed('hovered', yes)
      ).on('mouseout', ->
        otherSlice.classed('hovered', no)
        legend.classed('hovered', no)
      )

    # Create text elements within .labels group for each row of labels
    labels = legend.append('g')
      .attr('class', 'labels')
    labelStrings = @get('legendItems').map (d) ->
      if d.percent? then "#{d.label} (#{d.percent}%)" else d.label
    row = labels.append('text')
      .text("Other: #{labelStrings[0]}")
      .attr(@get 'legendLabelAttrs')

    # Try adding each label. If that makes the current line too long,
    # remove it and insert the label on the next line in its own <text>
    # element, incrementing labelTop. Stop adding rows if that would
    # cause labelTop to exceed the space allocated for the legend.
    labelTop = 0
    for nextLabel in labelStrings.slice(1)
      currentText = row.text()
      row.text("#{currentText}, #{nextLabel}")
      rowNode = row.node()
      if rowNode.getBBox().width > @get('legendWidth')
        if labelTop + rowNode.getBBox().height > @get('maxLabelHeight')
          row.text("#{currentText}, ...")
          break
        else
          row.text("#{currentText},")
          labelTop += rowNode.getBBox().height
          row = labels.append('text')
            .text(nextLabel)
            .attr(@get 'legendLabelAttrs')
            .attr('dy', labelTop)

    # Align the lowermost row of the block of labels against the bottom margin
    labels.attr('transform', "translate(0, #{-labelTop})")
