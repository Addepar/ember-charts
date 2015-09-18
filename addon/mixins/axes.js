import Ember from 'ember';
export default Ember.Mixin.create({

  // # ------------------------------------------------------------------------
  // # API -- Inputs
  // #
  // # graphicWidth (req.): The width of the graphic to be given axes
  // # graphicHeight (req.): The width of the graphic to be given axes
  // # minXTicks: The minimum number of ticks to appear on the X axis
  // # minYTicks: The minimum number of ticks to appear on the Y axis
  // # tickSpacing: Number of pixels between ticks on axes
  // # minAxisValue: The minimum value appearing on an axis using numeric values
  // # maxAxisValue: The maximum value appearing on an axis using numeric values
  // # ------------------------------------------------------------------------
  graphicWidth: null,
  graphicHeight: null,
  minXTicks: 3,
  minYTicks: 3,
  tickSpacing: 50,

  minAxisValue: 0,
  maxAxisValue: 0,

  // # ------------------------------------------------------------------------
  // # API -- Outputs
  // #
  // # numXTicks: Number of ticks on the X axis
  // # numYTicks: Number of ticks on the Y axis
  // # formatValueAxis: Overridable formatter for numeric values along an axis
  // # ------------------------------------------------------------------------
  numXTicks: Ember.computed('graphicWidth', 'tickSpacing', 'minXTicks', function() {
    var calculatedTicks = Math.floor(this.get('graphicWidth') / this.get('tickSpacing'));
    return Math.max(calculatedTicks, this.get('minXTicks'));
  }),

  numYTicks: Ember.computed('graphicHeight', 'tickSpacing', 'minYTicks', function() {
    var calculatedTicks = Math.floor(this.get('graphicHeight') / this.get('tickSpacing'));
    return Math.max(calculatedTicks, this.get('minYTicks'));
  }),

  formatValueAxis: Ember.computed('minAxisValue', 'maxAxisValue', function() {
    // # Base the format prefix on largest magnitude (e.g. if we cross from
    // # hundreds of thousands into millions, use millions)
    var magnitude = Math.max(Math.abs(this.get('minAxisValue')), Math.abs(this.get('maxAxisValue')));
    var prefix = d3.formatPrefix(magnitude);
    return function(value) {
      return "" + (prefix.scale(value)) + prefix.symbol;
    };
  })
});

