// # This allows chart data to be displayed in ascending or descending order as specified by
// # the data points property sortKey. The order is determined by sortAscending.
import Ember from 'ember';
export default Ember.Mixin.create({
  sortKey: 'value',
  sortAscending: true,

  defaultSortedData: Ember.computed('data.[]', 'sortKey', 'sortAscending', function() {
    var data = this.get('data');
    var key = this.get('sortKey');
    var sortAscending = this.get('sortAscending');

    if (Ember.isEmpty(data)) {
      return [];
    } else if (key != null) {
      if (sortAscending) {
        return _.sortBy(data, key);
      } else {
        return _.sortBy(data, key).reverse();
      }
    } else {
      return data;
    }
  }),

  sortedData: Ember.computed.alias('defaultSortedData')
});
