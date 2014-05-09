Ember.Charts.Colorable = Ember.Mixin.create

  selectedSeedColor: 'rgb(65, 65, 65)'

  # Create two color ranges. The primary range is usually used for the main
  # graphic. The secondary range is lighter and used for layered graphics
  # underneath the main graphic.

  # Tint is the amount of white to mix the seed color with. 0.8 means 80% white
  tint: 0.8
  minimumTint: 0
  maximumTint: 0.66
  colorScaleType: d3.scale.linear

  # colorScale is the end of the color scale pipeline so we rerender on that
  renderVars: ['colorScale']

  colorRange: Ember.computed ->
    seedColor = @get 'selectedSeedColor'
    @get('getColorRange')(seedColor)
  .property 'selectedSeedColor', 'getColorRange'

  getColorRange: Ember.computed ->
    (seedColor) =>
      interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)')
      minTintRGB = interpolate(@get 'minimumTint')
      maxTintRGB = interpolate(@get 'maximumTint')
      [ d3.rgb(minTintRGB), d3.rgb(maxTintRGB) ]
  .property 'minimumTint', 'maximumTint'

  colorScale: Ember.computed ->
    seedColor = @get 'selectedSeedColor'
    @get('getColorScale')(seedColor)
  .property 'selectedSeedColor', 'getColorScale'

  getColorScale: Ember.computed ->
    (seedColor) =>
      colorRange = @get('getColorRange')(seedColor)
      @get('colorScaleType')().range(colorRange)
  .property 'getColorRange', 'colorScaleType'

  secondaryMinimumTint: 0.4
  secondaryMaximumTint: 0.85
  secondaryColorScaleType: d3.scale.linear

  secondaryColorRange: Ember.computed ->
    seedColor = @get 'selectedSeedColor'
    interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)')
    minTintRGB = interpolate(@get 'secondaryMinimumTint')
    maxTintRGB = interpolate(@get 'secondaryMaximumTint')
    [ d3.rgb(minTintRGB), d3.rgb(maxTintRGB) ]
  .property 'selectedSeedColor', 'secondaryMinimumTint', 'secondaryMaximumTint'

  secondaryColorScale: Ember.computed ->
    @get('secondaryColorScaleType')().range(@get 'secondaryColorRange')
  .property 'secondaryColorRange', 'secondaryColorScaleType'

  # ----------------------------------------------------------------------------
  # Output
  # ----------------------------------------------------------------------------

  # TODO: Shouldn't this already be part of the d3 color scale stuff?

  # Darkest color (seed color)
  leastTintedColor: Ember.computed ->
    @get('colorRange')[0]
  .property 'colorRange.@each'

  # Lightest color (fully tinted color)
  mostTintedColor: Ember.computed ->
    @get('colorRange')[1]
  .property 'colorRange.@each'

  numColorSeries: 1
  getSeriesColor: Ember.computed ->
    numColorSeries = @get 'numColorSeries'
    selectedSeedColor = @get 'selectedSeedColor'
    (d, i) =>
      seedColor = d.color or selectedSeedColor
      colorRange = @get('getColorRange')(seedColor)
      colorScale = @get('getColorScale')(seedColor)

      if numColorSeries is 1
        colorRange[0]
      else
        colorScale(i / (numColorSeries - 1))
  .property 'numColorSeries', 'getColorRange', 'getColorScale',
    'selectedSeedColor'

  numSecondaryColorSeries: 1
  getSecondarySeriesColor: Ember.computed ->
    numSecondaryColorSeries = @get 'numSecondaryColorSeries'
    (d, i) =>
      if numSecondaryColorSeries is 1
        @get('secondaryColorRange')[0]
      else
        @get('secondaryColorScale') i / (numSecondaryColorSeries - 1)
  .property('numSecondaryColorSeries', 'secondaryColorRange',
    'secondaryColorScale')
