// # This allows chart data to be displayed in ascending or descending order as specified by
// # the data points property sortKey. The order is determined by sortAscending.
import { isEmpty } from '@ember/utils';

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { sortBy } from 'lodash-es';

export default Mixin.create({
  sortKey: 'value',
  sortAscending: true,

  sortedData: computed('data.[]', 'sortKey', 'sortAscending', function() {
    var data = this.get('data');
    var key = this.get('sortKey');
    var sortAscending = this.get('sortAscending');

    if (isEmpty(data)) {
      return [];
    } else if (key != null) {
      if (sortAscending) {
        return sortBy(data, key);
      } else {
        return sortBy(data, key).reverse();
      }
    } else {
      return data;
    }
  })
});
