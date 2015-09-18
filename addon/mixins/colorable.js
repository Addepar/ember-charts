import Ember from 'ember';
export default Ember.Mixin.create({

  selectedSeedColor: 'rgb(65, 65, 65)',

  // Create two color ranges. The primary range is usually used for the main
  // graphic. The secondary range is lighter and used for layered graphics
  // underneath the main graphic.

  // Tint is the amount of white to mix the seed color with. 0.8 means 80% white
  tint: 0.8,
  minimumTint: 0,
  maximumTint: 0.66,
  colorScaleType: d3.scale.linear,

  // colorScale is the end of the color scale pipeline so we rerender on that
  renderVars: ['colorScale'],

  colorRange: Ember.computed('selectedSeedColor', 'getColorRange', function() {
    var seedColor = this.get('selectedSeedColor');
    return this.get('getColorRange')(seedColor);
  }),

  getColorRange: Ember.computed('minimumTint', 'maximumTint', function() {
    var _this = this;
    return function(seedColor) {
      var interpolate, maxTintRGB, minTintRGB;
      interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
      minTintRGB = interpolate(_this.get('minimumTint'));
      maxTintRGB = interpolate(_this.get('maximumTint'));
      return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
    };
  }),

  colorScale: Ember.computed('selectedSeedColor', 'getColorScale', function() {
    var seedColor = this.get('selectedSeedColor');
    return this.get('getColorScale')(seedColor);
  }),

  getColorScale: Ember.computed('getColorRange', 'colorScaleType', function() {
    var _this = this;
    return function(seedColor) {
      var colorRange = _this.get('getColorRange')(seedColor);
      return _this.get('colorScaleType')().range(colorRange);
    };
  }),

  secondaryMinimumTint: 0.4,
  secondaryMaximumTint: 0.85,
  secondaryColorScaleType: d3.scale.linear,

  secondaryColorRange: Ember.computed('selectedSeedColor', 'secondaryMinimumTint', 'secondaryMaximumTint', function() {
    var seedColor = this.get('selectedSeedColor');
    var interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
    var minTintRGB = interpolate(this.get('secondaryMinimumTint'));
    var maxTintRGB = interpolate(this.get('secondaryMaximumTint'));

    return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
  }),

  secondaryColorScale: Ember.computed('secondaryColorScaleType', 'secondaryColorRange', function() {
    return this.get('secondaryColorScaleType')().range( this.get('secondaryColorRange') );
  }),

  // ----------------------------------------------------------------------------
  // Output
  // ----------------------------------------------------------------------------

  // TODO: Shouldn't this already be part of the d3 color scale stuff?

  // Darkest color (seed color)
  leastTintedColor: Ember.computed('colorRange.[]', function() {
    return this.get('colorRange')[0];
  }),

  // Lightest color (fully tinted color)
  mostTintedColor: Ember.computed('colorRange.[]', function() {
    return this.get('colorRange')[1];
  }),

  numColorSeries: 1,

  getSeriesColor: Ember.computed('numColorSeries', 'getColorRange', 'getColorScale', 'selectedSeedColor', function() {
    var numColorSeries = this.get('numColorSeries');
    var selectedSeedColor = this.get('selectedSeedColor');

    var _this = this;
    return function(d, i) {
      var seedColor = d.color || selectedSeedColor;
      var colorRange = _this.get('getColorRange')(seedColor);
      var colorScale = _this.get('getColorScale')(seedColor);
      if (numColorSeries === 1) {
        return colorRange[0];
      } else {
        return colorScale(i / (numColorSeries - 1));
      }
    };
  }),

  numSecondaryColorSeries: 1,

  getSecondarySeriesColor: Ember.computed('numSecondaryColorSeries', 'secondaryColorRange', 'secondaryColorScale', function() {
    var numSecondaryColorSeries = this.get('numSecondaryColorSeries');

    var _this = this;
    return function(d, i) {
      if (numSecondaryColorSeries === 1) {
        return _this.get('secondaryColorRange')[0];
      } else {
        return _this.get('secondaryColorScale')(i / (numSecondaryColorSeries - 1));
      }
    };
  })
});
