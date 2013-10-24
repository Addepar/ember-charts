App.EmberChartsTimeSeriesController = App.SlideController.extend

  # ---------
  # Default Settings
  # ---------

  barPadding: 0
  barGroupPadding: 0.25
  stackBars: no
  yAxisFromZero: no

  # ---------
  # Data Selection
  # ---------

  availableLineDataSets: Ember.computed ->
    _.keys @get('lineDataHash')
  .property 'lineDataHash'

  availableBarDataSets: Ember.computed ->
    _.keys @get('barDataHash')
  .property 'barDataHash'

  # display line data in the chart guide
  data: Ember.computed.alias 'lineData'

  lineData: Ember.computed ->
    @get('lineDataHash')[@get 'selectedLineData']
  .property 'selectedLineData', 'lineDataHash'

  barData: Ember.computed ->
    @get('barDataHash')[@get 'selectedBarData']
  .property 'selectedBarData', 'barDataHash'

  lineDataHash: Ember.computed ->
    monthly_return_single_series: App.data.monthly_return_single_series
    monthly_return_double_series: App.data.monthly_return_double_series
    monthly_return_triple_series: App.data.monthly_return_triple_series
    monthly_return_single_period: App.data.monthly_return_single_period
    monthly_return_double_period: App.data.monthly_return_double_period
    monthly_return_negative_period: App.data.monthly_return_negative_period
    daily_curr_value: App.data.daily_curr_value
    daily_diff_value: App.data.daily_diff_value
    daily_two_series: App.data.daily_two_series
    daily_three_series: App.data.daily_three_series
    daily_four_series: App.data.daily_four_series
    daily_five_series: App.data.daily_five_series
    daily_six_series: App.data.daily_six_series
    '----': App.data.null
    value_p1d_p1y: App.data.value_p1d_p1y
    value_p1w_p1y: App.data.value_p1w_p1y
    value_p1m_p1y: App.data.value_p1m_p1y
    value_p1m_p2y: App.data.value_p1m_p2y
    value_p1m_p5y: App.data.value_p1m_p5y
    zeroes_grouped: App.data.zeroes_grouped
    zeroes_ungrouped: App.data.zeroes_ungrouped
    same_value_grouped: App.data.same_value_grouped
    same_value_ungrouped: App.data.same_value_ungrouped
    empty: App.data.empty
  barDataHash: Ember.computed.alias 'lineDataHash'
  selectedLineData: 'daily_two_series'
  selectedBarData: 'monthly_return_triple_series'

  dataIntervals: [
    'day',
    'week',
    'month',
    'year'
  ]

  tickIntervals: [
    'weeks',
    'months',
    'quarters',
    'years'
  ]
  selectedInterval: 'months'
