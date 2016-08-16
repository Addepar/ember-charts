import Ember from 'ember';
import VerticalBarController from './vertical-bar';

const StackedVerticalBarController = VerticalBarController.extend({
  betweenBarPadding: 0,
  strokeWidth: 1,

  barSortingOptions: {
    'ascending': 'asc',
    'descending': 'desc',
    'custom (default: alphabetical)': 'custom'
  },

  barSorting: Ember.computed(function() {
    return Ember.A(_.keys(this.get('barSortingOptions')));
  }),

  selectedBarSorting: 'descending',

  barSortingOrder: Ember.computed('selectedBarSorting', 'barSortingOptions', function() {
    return this.get('barSortingOptions')[this.get('selectedBarSorting')];
  }),

  rawDataHash: Ember.computed(function() {
    var dataHash = _.cloneDeep(this._super());
    for (var datasetName in dataHash) {
      var dataset = dataHash[datasetName];
      if (dataset === null || dataset === void 0) {
        continue;
      }

      for (var iDatum = 0; iDatum < dataset.length; iDatum++) {
        var datum = dataset[iDatum];
        datum.barLabel = datum.group;
        datum.sliceLabel = datum.label;
        delete datum.group;
        delete datum.label;
      }
    }
    return dataHash;
  }),
});

export default StackedVerticalBarController;
