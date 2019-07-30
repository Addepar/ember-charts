import Ember from 'ember';
import { keys } from 'lodash-es';
import SlideController from './slide';

import many_values from '../models/single_group/many_values';
import monthly_return_single_period from '../models/time_series/monthly_return_single_period';
import high_net_worth_duration from '../models/single_group/high_net_worth_duration';
import asset_values from '../models/single_group/asset_values';

export default SlideController.extend({

  // ---------
  // Data Selection
  // ---------

  availableDataSets: Ember.computed('rawDataHash', function() {
    return Ember.A(keys(this.get('rawDataHash')));
  }), 

  data: Ember.computed('selectedData', 'rawDataHash', function() {
    return this.get('rawDataHash')[ this.get('selectedData')];
  }),

  selectedData: 'many_values',

  rawDataHash: Ember.computed(function() {
  	return {
      many_values: many_values,
    	monthly_return_single_period: monthly_return_single_period,
    	high_net_worth_duration: high_net_worth_duration,
    	asset_values: asset_values
   	};
  })

});
