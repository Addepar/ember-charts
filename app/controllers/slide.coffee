App.SlideController = Ember.Controller.extend
  prettyPrintedData: Ember.computed ->
    JSON.stringify(@get('data'), null, '\t')
  .property 'data'

  seedColors:
    purple: 'rgb(100,60,120)'
    yellow: 'rgb(250,165,30)'
    maroon: 'rgb(150,0,35)'
    red: 'rgb(235,35,35)'
    blue: 'rgb(30,120,190)'
    navy: 'rgb(25,75,120)'
    green: 'rgb(60,110,80)'
    gray: 'rgb(65,65,65)'
    black: 'rgb(00,00,00)'

  seedColorNames: Ember.computed ->
    _.keys @get('seedColors')
  .property 'seedColors'

  selectedSeedColorName: 'black'

  selectedSeedColor: Ember.computed ->
    @get('seedColors')[@get 'selectedSeedColorName']
  .property 'selectedSeedColorName', 'seedColors.@each'

App.ScrubberComponent = Ember.Component.extend
  tagName: 'input'
  attributeBindings: ['min', 'max', 'step', 'type']
  type: 'range'
  min: 0
  max: 10
  step: 1
  change: ->
    value = @$()[0].value
    @set('value', +value)
