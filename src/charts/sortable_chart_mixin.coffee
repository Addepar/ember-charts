Ember.Charts.SortableChartMixin = Ember.Mixin.create
  # Sort key for the data
  sortKey: 'value'

  sortedData: Ember.computed ->
    data = @get 'data'
    key = @get 'sortKey'
    if Ember.isEmpty(data) then [] else data.sortBy key
  .property 'data.@each', 'sortKey'
