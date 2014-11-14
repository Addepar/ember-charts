Ember.Charts.Formattable = Ember.Mixin.create
  # Getters for formatting human-readable labels from provided data
  formatLabelFunction: Ember.computed ->
    d3.format(",#{@get('formatLabel')}")
  .property 'formatLabel'

  # String that will be used to format label using d3.format function
  # More info about d3.format: https://github.com/mbostock/d3/wiki/Formatting
  formatLabel: '.2f'
