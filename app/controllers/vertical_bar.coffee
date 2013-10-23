App.EmberChartsVerticalBarController = App.SlideController.extend

  # ---------
  # Default Settings
  # ---------

  betweenGroupPadding: 0
  withinGroupPadding: 0
  maxLabelHeight: 40
  stackBars: no

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
    two_ranges: App.data.two_ranges
    three_ranges: App.data.three_ranges
    five_ranges: App.data.five_ranges
    sector_compare_return: App.data.sector_compare_return
    '----': App.data.null
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
  selectedData: 'three_ranges'
