Ember.Charts.AxesMixin = Ember.Mixin.create
  # ------------------------------------------------------------------------
  # API -- Inputs
  #
  # graphicWidth (req.): The width of the graphic to be given axes
  # graphicHeight (req.): The width of the graphic to be given axes
  # minXTicks: The minimum number of ticks to appear on the X axis
  # minYTicks: The minimum number of ticks to appear on the Y axis
  # tickSpacing: Number of pixels between ticks on axes
  # ------------------------------------------------------------------------
  graphicWidth: null
  graphicHeight: null
  minXTicks: 3
  minYTicks: 3
  tickSpacing: 50

  # ------------------------------------------------------------------------
  # API -- Outputs
  #
  # numXTicks: Number of ticks on the X axis
  # numYTicks: Number of ticks on the Y axis
  # ------------------------------------------------------------------------
  numXTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicWidth') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minXTicks')
  .property 'graphicWidth', 'tickSpacing', 'minXTicks'

  numYTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicHeight') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minYTicks')
  .property 'graphicHeight', 'tickSpacing', 'minYTicks'
