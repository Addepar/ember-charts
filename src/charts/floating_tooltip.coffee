Ember.Charts.FloatingTooltipMixin = Ember.Mixin.create
  # ----------------------------------------------------------------------------
  # API -- inputs
  #
  # elementId: the id of the object we're attaching the tooltip to
  # ----------------------------------------------------------------------------
  elementId: null
  tooltipWidth: 40
  tooltipValueDisplayName: 'Value'

  showTooltip: (content, event) ->
    $ttid = @_getTooltip()
    $ttid.html(content)
    $ttid.show()
    @_updateTooltipPosition(event)

  hideTooltip: ->
    @_getTooltip().hide()

  # ----------------------------------------------------------------------------
  # Private Methods
  # ----------------------------------------------------------------------------
  _tooltipId: Ember.computed ->
    @get('elementId') + '_tooltip'

  _getTooltip: ->
    $("##{@get '_tooltipId'}")

  _updateTooltipPosition: (event) ->
    $tooltip = @_getTooltip()
    # Offset the tooltip away from the mouse position
    xOffset = 10
    yOffset = 10

    # Get tooltip width/height
    width = $tooltip.width()
    height = $tooltip.height()

    # Get top/left coordinates of scrolled window
    windowScrollTop = $(window).scrollTop()
    windowScrollLeft = $(window).scrollLeft()

    # Get current X,Y position of cursor even if window is scrolled
    curX = event.clientX + windowScrollLeft
    curY = event.clientY + windowScrollTop

    tooltipLeftOffset =
      if (curX - windowScrollLeft + xOffset*2 + width) > $(window).width()
        # Not enough room to put tooltip to the right of the cursor
        - (width + xOffset*2)
      else
        # Offset the tooltip to the right
        xOffset

    tooltipLeft = curX + tooltipLeftOffset

    tooltipTopOffset =
      if (curY - windowScrollTop + yOffset*2 + height) > $(window).height()
        # Not enough room to put tooltip to the below the cursor
        - (height + yOffset*2)
      else
        # Offset the tooltip below the cursor
        yOffset

    tooltipTop = curY + tooltipTopOffset

    # Tooltip must be a minimum offset away from the left/top position
    minTooltipLeft = windowScrollLeft + xOffset
    minTooltipTop = windowScrollTop + yOffset
    tooltipLeft = minTooltipLeft if tooltipLeft < minTooltipLeft
    tooltipTop = minTooltipTop if tooltipTop < windowScrollTop + yOffset

    # Place tooltip
    $tooltip.css('top', tooltipTop + 'px').css('left', tooltipLeft + 'px')

  # ----------------------------------------------------------------------------
  # Internal
  # ----------------------------------------------------------------------------

  didInsertElement: ->
    @_super()
    $("body").append("<div class='chart-float-tooltip' id='#{@get '_tooltipId'}'></div>")
    @hideTooltip()

  willDestroyElement: ->
    @_super()
    @_getTooltip().remove()
