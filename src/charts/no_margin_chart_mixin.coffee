# Remove all extra margins so that graph elements can line up with other
# elements more easily
Ember.Charts.NoMarginChartMixin = Ember.Mixin.create
  marginLeft: 0
  marginRight: 0

  # There should be no padding if there is no legend
  marginBottom: Ember.computed ->
    return 0 unless @get 'hasLegend'
    return 30
  .property 'hasLegend'

  # Gives the maximum of the lengths of the labels given in svgTextArray
  maxLabelLength: (svgTextArray) ->
    maxLabel = 0
    svgTextArray.each ->
      # this.getComputedTextLength() gives the length in pixels of a text element
      if this.getComputedTextLength() > maxLabel
        maxLabel = this.getComputedTextLength()
    return maxLabel
