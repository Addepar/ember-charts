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

  isShowingTotal: yes
  totalPointData: Ember.computed ->
    group: 'Portfolio Total'
    xValue: 5
    yValue: 0

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
