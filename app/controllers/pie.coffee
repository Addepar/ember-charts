App.EmberChartsPieController = App.SlideController.extend

  # ---------
  # Default Settings
  # ---------

  maxNumberOfSlices: 8
  minSlicePercent: 2
  maxRadius: 100

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
    asset_values: App.data.asset_values
    many_values: App.data.many_values
    monthly_return_single_period: App.data.monthly_return_single_period
    high_net_worth_duration: App.data.high_net_worth_duration
    '----': App.data.null
    empty: App.data.empty
    one_value: App.data.one_value
    two_values: App.data.two_values
    zero: App.data.zero
    zeroes: App.data.zeroes
    sum_to_zero: App.data.sum_to_zero
    bad_range: App.data.bad_range
  selectedData: 'asset_values'

  sortTypes: [ 'label', 'value' ]
  selectedSortType: 'value'
