Ember.Charts.AxesMixin = Ember.Mixin.create


  # ----------------------------------------------------------------------------
  # Ticks
  # ----------------------------------------------------------------------------

  # TODO(tony): Move this to a tickable mixin as most charts don't use this
  # Never use less than this number of ticks
  minXTicks: 3
  minYTicks: 3

  # Approximate number of pixels between ticks on axes
  tickSpacing: 50

  # Approximate number of ticks on the X axis
  numXTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicWidth') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minXTicks')
  .property 'graphicWidth', 'tickSpacing', 'minXTicks'

  # Approximate number of ticks on the Y axis
  numYTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicHeight') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minYTicks')
  .property 'graphicHeight', 'tickSpacing', 'minYTicks'
