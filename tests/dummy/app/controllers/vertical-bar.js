import Ember from 'ember';
import SlideController from './slide';

import data from '../models/data';

import two_ranges from '../models/multi_group/two_ranges';
import three_ranges from '../models/multi_group/three_ranges';
import five_ranges from '../models/multi_group/five_ranges';
import sector_compare_return from '../models/multi_group/sector_compare_return';

import asset_values from '../models/single_group/asset_values';
import many_values from '../models/single_group/many_values';
import monthly_return_single_period from '../models/time_series/monthly_return_single_period';
import high_net_worth_duration from '../models/single_group/high_net_worth_duration';

import one_value from '../models/single_group/one_value';
import two_values from '../models/single_group/two_values';
import zero from '../models/single_group/zero';
import zeroes from '../models/single_group/zeroes';
import sum_to_zero from '../models/single_group/sum_to_zero';
import bad_range from '../models/single_group/bad_range';

export default SlideController.extend({

  // ---------
  // Default Settings
  // ---------

  betweenGroupPadding: 0,
  withinGroupPadding: 0,
  maxLabelHeight: 40,
  stackBars: false,

  // ---------
  // Data Selection
  // ---------

  availableDataSets: Ember.computed('rawDataHash', function() {
    return Ember.A( _.keys( this.get('rawDataHash')) );
  }),

  data: Ember.computed('selectedData', 'rawDataHash', function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }),

  rawDataHash: Ember.computed(function() {
  	return {
	    two_ranges: two_ranges,
	    three_ranges: three_ranges,
	    five_ranges: five_ranges,
	    sector_compare_return: sector_compare_return,
	    '----': data.null,
	    asset_values: asset_values,
	    many_values: many_values,
	    monthly_return_single_period: monthly_return_single_period,
	    high_net_worth_duration: high_net_worth_duration,

	    empty: data.empty,
	    one_value: one_value,
	    two_values: two_values,
	    zero: zero,
	    zeroes: zeroes,
	    sum_to_zero: sum_to_zero,
	    bad_range: bad_range
    };
  }),

  selectedData: 'five_ranges'

});
