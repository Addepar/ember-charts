Ember.Charts.FloatingTooltipMixin = Ember.Mixin.create
  # ----------------------------------------------------------------------------
  # Interface
  # ----------------------------------------------------------------------------
  tooltipId: Ember.computed ->
    @get('elementId') + '_tooltip'

  tooltipWidth: 40

  tooltipValueDisplayName: 'Value'

  showTooltip: (content, event) ->
    $ttid = @get '$tooltip'
    $ttid.html(content)
    $ttid.show()
    @updatePosition(event)

  hideTooltip: ->
    @get('$tooltip').hide()

  updatePosition: (event) ->
    $tooltipId = @get '$tooltip'
    # Offset the tooltip away from the mouse position
    xOffset = 10
    yOffset = 10

    # Get tooltip width/height
    width = $tooltipId.width()
    height = $tooltipId.height()

    # Get top/left coordinates of scrolled window
    windowScrollTop = $(window).scrollTop()
    windowScrollLeft = $(window).scrollLeft()

    # Get current X,Y position of cursor even if window is scrolled
    curX = event.clientX + windowScrollLeft
    curY = event.clientY + windowScrollTop


    tooltipLeft = curX +
      if (curX - windowScrollLeft + xOffset*2 + width) > $(window).width()
        # Not enough room to put tooltip to the right of the cursor
        - (width + xOffset*2)
      else
        # Offset the tooltip to the right
        xOffset

    tooltipTop = curY +
      if (curY - windowScrollTop + yOffset*2 + height) > $(window).height()
        # Not enough room to put tooltip to the below the cursor
        - (height + yOffset*2)
      else
        # Offset the tooltip below the cursor
        yOffset

    # Tooltip must be a minimum offset away from the left/top position
    minTooltipLeft = windowScrollLeft + xOffset
    minTooltipTop = windowScrollTop + yOffset
    tooltipLeft = minTooltipLeft if tooltipLeft < minTooltipLeft
    tooltipTop = minTooltipTop if tooltipTop < windowScrollTop + yOffset

    # Place tooltip
    $tooltipId.css('top', tooltipTop + 'px').css('left', tooltipLeft + 'px')

  # ----------------------------------------------------------------------------
  # Internal
  # ----------------------------------------------------------------------------

  didInsertElement: ->
    @_super()
    $("body").append("<div class='chart-float-tooltip' id='#{@get 'tooltipId'}'></div>")
    @hideTooltip()

  willDestroyElement: ->
    @_super()
    @get('$tooltip').remove()

  widthDidChange: ->
    @get('$tooltip').css('width', @get('tooltipWidth'))
  , 'tooltipWidth'

  $tooltip: Ember.computed ->
    $("##{@get 'tooltipId'}")
  .volatile()

