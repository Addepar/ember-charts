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

  barSortKeys: Ember.computed('barSortKeyOptions', function() {
    return Ember.A(_.keys(this.get('barSortKeyOptions')));
  }),

  selectedBarSortKey: 'value',

  barSortKey: Ember.computed('barSortKeyOptions', 'selectedBarSortKey',
      function() {
    return this.get('barSortKeyOptions')[this.get('selectedBarSortKey')];
  }),

  barSortAscending: false,

  sliceSortKeyOptions: {
    'value': 'value',
    'original input order': 'original',
    'custom (default: alphabetical)': 'custom'
  },

  sliceSortKeys: Ember.computed('sliceSortKeyOptions', function() {
    return Ember.A(_.keys(this.get('sliceSortKeyOptions')));
  }),

  selectedSliceSortKey: 'value',

  sliceSortKey: Ember.computed('sliceSortKeyOptions', 'selectedSliceSortKey',
      function() {
    return this.get('sliceSortKeyOptions')[this.get('selectedSliceSortKey')];
  }),

  rawDataHash: Ember.computed(function() {
    var dataHash = _.cloneDeep(this._super());
    for (var datasetName in dataHash) {
      var dataset = dataHash[datasetName];
      if (dataset === null || dataset === void 0) {
        continue;
      }

      for (var datumIndex = 0; datumIndex < dataset.length; datumIndex++) {
        var datum = dataset[datumIndex];
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
