App.EmberChartsScatterController = App.SlideController.extend

  # ---------
  # Data Selection
  # ---------

  availableDataSets: Ember.computed ->
    _.keys @get('rawDataHash')
  .property 'rawDataHash'

  data: Ember.computed ->
    @get('rawDataHash')[@get 'selectedData']
  .property 'selectedData', 'rawDataHash'

  isShowingTotal: no

  xValueDisplayName: 'Risk'
  yValueDisplayName: 'Return'

  # A simple default portfolio total calculation by adding both factors. Often
  # the portfolio total is a separate data source provided as a reference.
  totalPointData: Ember.computed ->
    data = @get('data')
    group: 'Portfolio Total'
    xValue: data.reduce( ((prev, d) -> prev + d.xValue), 0 )
    yValue: data.reduce( ((prev, d) -> prev + d.yValue), 0 )
  .property 'data'

  # Select which raw data we will pull from
  selectedData: 'groupedPercent'
  rawDataHash: Ember.computed ->
    groupedPercent: App.data.groupedPercent
    groupedMoney: App.data.groupedMoney
    ungroupedPercent: App.data.ungroupedPercent
    ungroupedMoney: App.data.ungroupedMoney
    '----': App.data.null
    empty: App.data.empty
    groupedZero: App.data.groupedZero
    groupedZeroes: App.data.groupedZeroes
    ungroupedZero: App.data.ungroupedZero
    ungroupedZeroes: App.data.ungroupedZeroes

  dotRadius: 7
