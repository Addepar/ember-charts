# This allows chart data to be displayed in ascending or descending order as specified by
# the data points property sortKey. The order is determined by sortAscending.
Ember.Charts.SortableChartMixin = Ember.Mixin.create
  sortKey: 'value'
  sortAscending: yes
  sortedData: Ember.computed ->
    data = @get 'data'
    key = @get 'sortKey'
    sortAscending = @get 'sortAscending'
    if Ember.isEmpty(data)
      []
    else if key?
      if sortAscending
        data.sortBy key
      else
        data.sortBy(key).reverse()
    else
      data
  .property 'data.[]', 'sortKey', 'sortAscending'
