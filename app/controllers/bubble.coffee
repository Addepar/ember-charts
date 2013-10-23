App.EmberChartsBubbleController = App.SlideController.extend

  # ---------
  # Data Selection
  # ---------

  availableDataSets: Ember.computed ->
    _.keys @get('rawDataHash')
  .property 'rawDataHash'

  data: Ember.computed ->
    @get('rawDataHash')[@get 'selectedData']
  .property 'selectedData', 'rawDataHash'

  rawDataHash: Ember.computed ->
    many_values: App.data.many_values
    monthly_return_single_period: App.data.monthly_return_single_period
    high_net_worth_duration: App.data.high_net_worth_duration
    asset_values: App.data.asset_values
  selectedData: 'many_values'
