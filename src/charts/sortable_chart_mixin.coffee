# This allows chart data to be displayed in ascending order specified by
# the data points property sortKey. For pie charts this means ordering the pie
# slices, for bar charts, the bars.
Ember.Charts.SortableChartMixin = Ember.Mixin.create
  sortKey: 'value'
  sortDescending: no
  sortedData: Ember.computed ->
    data = @get 'data'
    key = @get 'sortKey'
    desc = @get 'sortDescending'
    if Ember.isEmpty(data)
      []
    else if key?
      if desc
        data.sortBy(key).reverse()
      else
        data.sortBy key
    else
      data
  .property 'data.[]', 'sortKey', 'sortDescending'
