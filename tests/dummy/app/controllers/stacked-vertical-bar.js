import Ember from 'ember';
import VerticalBarController from './vertical-bar';

const StackedVerticalBarController = VerticalBarController.extend({
  betweenBarPadding: 0,
  strokeWidth: 1,

  barSortingKeyOptions: {
    'value': 'value',
    'custom (default: alphabetical)': 'custom'
  },

  barSortingKeys: Ember.computed(function() {
    return Ember.A(_.keys(this.get('barSortingKeyOptions')));
  }),

  selectedBarSortingKey: 'value',

  sortKey: Ember.computed('selectedBarSortingKey', function() {
    return this.get('barSortingKeyOptions')[this.get('selectedBarSortingKey')];
  }),

  sortAscending: false,

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
