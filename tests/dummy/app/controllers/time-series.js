import Ember from 'ember';
import SlideController from './slide';
import data from '../models/data';

import monthly_return_single_series from '../models/time_series/monthly_return_single_series';
import monthly_return_double_series from '../models/time_series/monthly_return_double_series';
import monthly_return_triple_series from '../models/time_series/monthly_return_triple_series';

import monthly_return_single_period from '../models/time_series/monthly_return_single_period';
import monthly_return_double_period from '../models/time_series/monthly_return_double_period';
import monthly_return_negative_period from '../models/time_series/monthly_return_negative_period';

import daily_curr_value from '../models/time_series/daily_curr_value';
import daily_diff_value from '../models/time_series/daily_diff_value';
import daily_two_series from '../models/time_series/daily_two_series';
import daily_three_series from '../models/time_series/daily_three_series';
import daily_four_series from '../models/time_series/daily_four_series';
import daily_five_series from '../models/time_series/daily_five_series';
import daily_six_series from '../models/time_series/daily_six_series';

import value_p1d_p1y from '../models/time_series/value_p1d_p1y';
import value_p1w_p1y from '../models/time_series/value_p1w_p1y';
import value_p1m_p1y from '../models/time_series/value_p1m_p1y';
import value_p1m_p2y from '../models/time_series/value_p1m_p2y';
import value_p1m_p5y from '../models/time_series/value_p1m_p5y';

import zeroes_grouped from '../models/time_series/zeroes_grouped';
import zeroes_ungrouped from '../models/time_series/zeroes_ungrouped';

import same_value_grouped from '../models/time_series/same_value_grouped';
import same_value_ungrouped from '../models/time_series/same_value_ungrouped';


export default SlideController.extend({

  // ---------
  // Default Settings
  // ---------

  barPadding: 0,
  barGroupPadding: 0.25,
  barLeftOffset: 0.0,
  yAxisFromZero: false,

  // ---------
  // Data Selection
  // ---------

  availableLineDataSets: Ember.computed('lineDataHash', function() {
    return Ember.A( _.keys( this.get('lineDataHash')));
  }),

  availableBarDataSets: Ember.computed('barDataHash', function() {
    return Ember.A( _.keys( this.get('barDataHash')));
  }),
    
  // display line data in the chart guide
  data: Ember.computed.alias('lineData'),

  lineData: Ember.computed('selectedLineData', 'lineDataHash', function() {
    return this.get('lineDataHash')[this.get('selectedLineData')];
  }),

  barData: Ember.computed('selectedBarData', 'barDataHash', function() {
    return this.get('barDataHash')[this.get('selectedBarData')];
  }),

  lineDataHash: Ember.computed(function() {
    return {
      monthly_return_single_series: monthly_return_single_series,
      monthly_return_double_series: monthly_return_double_series,
      monthly_return_triple_series: monthly_return_triple_series,

      monthly_return_single_period: monthly_return_single_period,
      monthly_return_double_period: monthly_return_double_period,
      monthly_return_negative_period: monthly_return_negative_period,

      daily_curr_value: daily_curr_value,
      daily_diff_value: daily_diff_value,
      daily_two_series: daily_two_series,
      daily_three_series: daily_three_series,
      daily_four_series: daily_four_series,
      daily_five_series: daily_five_series,
      daily_six_series: daily_six_series,

      '----': data.null,

      value_p1d_p1y: value_p1d_p1y,
      value_p1w_p1y: value_p1w_p1y,
      value_p1m_p1y: value_p1m_p1y,
      value_p1m_p2y: value_p1m_p2y,
      value_p1m_p5y: value_p1m_p5y,
      zeroes_grouped: zeroes_grouped,
      zeroes_ungrouped: zeroes_ungrouped,
      same_value_grouped: same_value_grouped,
      same_value_ungrouped: same_value_ungrouped,
      
      empty: data.empty
    };
  }),
      
  barDataHash: Ember.computed.alias('lineDataHash'),
  selectedLineData: 'daily_two_series',
  selectedBarData: 'monthly_return_triple_series',

  dataIntervals: Ember.A(['day', 'week', 'month', 'year']),
  tickIntervals: Ember.A(['weeks', 'months', 'quarters', 'years']),
  selectedInterval: 'months'

});