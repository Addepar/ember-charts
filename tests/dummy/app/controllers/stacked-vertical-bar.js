import Ember from 'ember';
import VerticalBarController from './vertical-bar';

const StackedVerticalBarController = VerticalBarController.extend({
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
      }
    }
    return dataHash;
  })
});

export default StackedVerticalBarController;
