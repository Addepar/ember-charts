import Ember from 'ember';
export default Ember.Mixin.create({

  // # ----------------------------------------------------------------------------
  // # API -- inputs
  // #
  // # elementId: the id of the object we're attaching the tooltip to
  // # ----------------------------------------------------------------------------
  elementId: null,
  tooltipWidth: 40,
  tooltipValueDisplayName: 'Value',

  showTooltip: function(content, event) {
    var $ttid = this._getTooltip();
    $ttid.html(content);
    $ttid.show();
    return this._updateTooltipPosition(event);
  },

  hideTooltip: function() {
    return this._getTooltip().hide();
  },

  // # ----------------------------------------------------------------------------
  // # Private Methods
  // # ----------------------------------------------------------------------------
  _tooltipId: Ember.computed(function() {
    return this.get('elementId') + '_tooltip';
  }),

  _getTooltip: function() {
    return $("#" + this.get('_tooltipId'));
  },

  _updateTooltipPosition: function(event) {
    var $tooltip = this._getTooltip();
    // # Offset the tooltip away from the mouse position
    var xOffset = 10;
    var yOffset = 10;

    // # Get tooltip width/height
    var width = $tooltip.width();
    var height = $tooltip.height();

    // # Get top/left coordinates of scrolled window
    var windowScrollTop = $(window).scrollTop();
    var windowScrollLeft = $(window).scrollLeft();

    // # Get current X,Y position of cursor even if window is scrolled
    var curX = event.clientX + windowScrollLeft;
    var curY = event.clientY + windowScrollTop;

    var tooltipLeftOffset;
    if ((curX - windowScrollLeft + xOffset * 2 + width) > $(window).width()) {
      // # Not enough room to put tooltip to the right of the cursor
      tooltipLeftOffset = -(width + xOffset * 2);
    } else {
      // # Offset the tooltip to the right
      tooltipLeftOffset = xOffset;
    }

    var tooltipLeft = curX + tooltipLeftOffset;

    var tooltipTopOffset;
    if ((curY - windowScrollTop + yOffset * 2 + height) > $(window).height()) {
      // # Not enough room to put tooltip to the below the cursor
      tooltipTopOffset = -(height + yOffset * 2);
    } else {
      // # Offset the tooltip below the cursor
      tooltipTopOffset = yOffset;
    }

    var tooltipTop = curY + tooltipTopOffset;

    // # Tooltip must be a minimum offset away from the left/top position
    var minTooltipLeft = windowScrollLeft + xOffset;
    var minTooltipTop = windowScrollTop + yOffset;
    if (tooltipLeft < minTooltipLeft) {
      tooltipLeft = minTooltipLeft;
    }
    if (tooltipTop < windowScrollTop + yOffset) {
      tooltipTop = minTooltipTop;
    }

    // # Place tooltip
    return $tooltip.css('top', tooltipTop + 'px').css('left', tooltipLeft + 'px');
  },

  // # ----------------------------------------------------------------------------
  // # Internal
  // # ----------------------------------------------------------------------------

  didInsertElement: function() {
    this._super();
    $("body").append("<div class='chart-float-tooltip' id='" + this.get('_tooltipId') + "'></div>");
    return this.hideTooltip();
  },

  willDestroyElement: function() {
    this._super();
    return this._getTooltip().remove();
  }
});
