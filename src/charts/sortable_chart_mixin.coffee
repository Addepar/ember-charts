# This allows chart data to be displayed in ascending order specified by
# the data points property sortKey. For pie charts this means ordering the pie
# slices, for bar charts, the bars.
Ember.Charts.SortableChartMixin = Ember.Mixin.create
  sortKey: 'value'

  sortedData: Ember.computed ->
    data = @get 'data'
    key = @get 'sortKey'
    if Ember.isEmpty(data) then [] else data.sortBy key
  .property 'data.@each', 'sortKey'
