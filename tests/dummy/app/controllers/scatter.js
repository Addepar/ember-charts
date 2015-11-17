import Ember from 'ember';
import SlideController from './slide';
import data from '../models/data';

import grouped_percent from '../models/multi_value/grouped_percent';
import grouped_money from '../models/multi_value/grouped_money';
import ungrouped_percent from '../models/multi_value/ungrouped_percent';
import ungrouped_money from '../models/multi_value/ungrouped_money';
import grouped_zero from '../models/multi_value/grouped_zero';
import grouped_zeroes from '../models/multi_value/grouped_zeroes';
import ungrouped_zero from '../models/multi_value/ungrouped_zero';
import ungrouped_zeroes from '../models/multi_value/ungrouped_zeroes';

export default SlideController.extend({

  // ---------
  // Data Selection
  // ---------

  availableDataSets: Ember.computed('rawDataHash', function() {
    return Ember.A(_.keys(this.get('rawDataHash')));
  }),

  data: Ember.computed('selectedData', 'rawDataHash', function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }),

  isShowingTotal: false,

  hasXAxisTitle: false,
  hasYAxisTitle: false,

  xValueDisplayName: 'Risk',
  yValueDisplayName: 'Return',

  // A simple default portfolio total calculation by adding both factors. Often
  // the portfolio total is a separate data source provided as a reference.
  totalPointData: Ember.computed('data', function() {
    var data = this.get('data');
    return {
    	group: 'Portfolio Total',
    	xValue: _.reduce(data, function(prev, d) {
    		return prev + d.xValue;
    	}, 0),
    	yValue: _.reduce(data, function(prev, d) {
    		return  prev + d.yValue;
    	}, 0)
  	};
  }),

  // Select which raw data we will pull from
  selectedData: 'groupedPercent',
  dotRadius: 7,

  rawDataHash: Ember.computed(function() {
  	return {
	    groupedPercent: grouped_percent,
	    groupedMoney: grouped_money,
	    ungroupedPercent: ungrouped_percent,
	    ungroupedMoney: ungrouped_money,
	    '----': data.null,
	    empty: data.empty,
	    groupedZero: grouped_zero,
	    groupedZeroes: grouped_zeroes,
	    ungroupedZero: ungrouped_zero,
	    ungroupedZeroes: ungrouped_zeroes
    };
  })

});
