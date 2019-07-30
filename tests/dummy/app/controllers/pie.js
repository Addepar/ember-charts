import Ember from 'ember';
import { keys } from 'lodash-es';
import SlideController from './slide';

import data from '../models/data';

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
import has_zero_and_decimal_value from '../models/single_group/has_zero_and_decimal_value';
import high_density_small_value_labels from '../models/single_group/high_density_small_value_labels';
import many_small_one_large from '../models/single_group/many_small_one_large';
import long_grouping_labels_non_negative from '../models/single_group/long_grouping_labels_non_negative';
import hard_range from '../models/single_group/hard_range';
import contains_zero from '../models/single_group/contains_zero';
import large_other_small_normal_slices from '../models/single_group/large_other_small_normal_slices';
import one_very_large_slice from '../models/single_group/one_very_large_slice';
import hard_range_2 from '../models/single_group/hard_range_2';
import tiny_slice_one from '../models/single_group/tiny_slice_one';
import tiny_slice_two from '../models/single_group/tiny_slice_two';


export default SlideController.extend({

  // ---------
  // Default Settings
  // ---------

  maxNumberOfSlices: 8,
  minSlicePercent: 2,
  maxRadius: 250,
  labelWidthMultiplier: 0.25,
  maxDecimalPlace: 0,
  includeRoundedZeroPercentSlices: true,

  // ---------
  // Data Selection
  // ---------

  availableDataSets: Ember.computed('rawDataHash', function() {
    return Ember.A(keys(this.get('rawDataHash')));
  }),

  data: Ember.computed('selectedData', 'rawDataHash', function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }),

  rawDataHash: Ember.computed(function() {
    return {
      asset_values: asset_values,
      many_values: many_values,
      monthly_return_single_period: monthly_return_single_period,
      high_net_worth_duration: high_net_worth_duration,
      '----': data.null,
      empty: data.empty,
      one_value: one_value,
      two_values: two_values,
      zero: zero,
      zeroes: zeroes,
      sum_to_zero: sum_to_zero,
      bad_range: bad_range,
      has_zero_and_decimal_value: has_zero_and_decimal_value,
      high_density_small_value_labels: high_density_small_value_labels,
      many_small_one_large: many_small_one_large,
      long_grouping_labels_non_negative: long_grouping_labels_non_negative,
      hard_range: hard_range,
      contains_zero: contains_zero,
      large_other_small_normal_slices: large_other_small_normal_slices,
      one_very_large_slice: one_very_large_slice,
      hard_range_2: hard_range_2,
      tiny_slice_one: tiny_slice_one,
      tiny_slice_two: tiny_slice_two
    };
  }),

  selectedData: 'asset_values'

});
