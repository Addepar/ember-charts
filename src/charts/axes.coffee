Ember.Charts.AxesMixin = Ember.Mixin.create
  # ------------------------------------------------------------------------
  # API -- Inputs
  #
  # graphicWidth (req.): The width of the graphic to be given axes
  # graphicHeight (req.): The width of the graphic to be given axes
  # minXTicks: The minimum number of ticks to appear on the X axis
  # minYTicks: The minimum number of ticks to appear on the Y axis
  # tickSpacing: Number of pixels between ticks on axes
  # minAxisValue: The minimum value appearing on an axis using numeric values
  # maxAxisValue: The maximum value appearing on an axis using numeric values
  # ------------------------------------------------------------------------
  graphicWidth: null
  graphicHeight: null
  minXTicks: 3
  minYTicks: 3
  tickSpacing: 50

  minAxisValue: 0
  maxAxisValue: 0

  # ------------------------------------------------------------------------
  # API -- Outputs
  #
  # numXTicks: Number of ticks on the X axis
  # numYTicks: Number of ticks on the Y axis
  # formatValueAxis: Overridable formatter for numeric values along an axis
  # ------------------------------------------------------------------------
  numXTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicWidth') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minXTicks')
  .property 'graphicWidth', 'tickSpacing', 'minXTicks'

  numYTicks: Ember.computed ->
    calculatedTicks = Math.floor @get('graphicHeight') / @get('tickSpacing')
    Math.max calculatedTicks, @get('minYTicks')
  .property 'graphicHeight', 'tickSpacing', 'minYTicks'

  formatValueAxis: Ember.computed ->
    # Base the format prefix on largest magnitude (e.g. if we cross from
    # hundreds of thousands into millions, use millions)
    magnitude =
      Math.max Math.abs(@get('minAxisValue')), Math.abs(@get('maxAxisValue'))
    prefix = d3.formatPrefix magnitude
    formatter = (value) ->
      "#{prefix.scale(value)}#{prefix.symbol}"
  .property 'minAxisValue', 'maxAxisValue'
