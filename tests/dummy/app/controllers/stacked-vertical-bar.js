import Ember from 'ember';
import VerticalBarController from './vertical-bar';

const StackedVerticalBarController = VerticalBarController.extend({
  betweenBarPadding: 0,
  strokeWidth: 1,

  barSortKeyOptions: {
    'value': 'value',
    'original input order': 'original',
    'custom (default: alphabetical)': 'custom'
  },

  barSortKeys: Ember.computed(function() {
    return Ember.A(_.keys(this.get('barSortKeyOptions')));
  }),

  selectedBarSortKey: 'value',

  sortKey: Ember.computed('selectedBarSortKey', function() {
    return this.get('barSortKeyOptions')[this.get('selectedBarSortKey')];
  }),

  sliceSortKeyOptions: {
    'value': 'value',
    'original input order': 'original',
    'custom (default: alphabetical)': 'custom'
  },

  sliceSortKeys: Ember.computed(function() {
    return Ember.A(_.keys(this.get('sliceSortKeyOptions')));
  }),

  selectedSliceSortKey: 'value',

  sliceSortKey: Ember.computed('selectedSliceSortKey', function() {
    return this.get('sliceSortKeyOptions')[this.get('selectedSliceSortKey')];
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
