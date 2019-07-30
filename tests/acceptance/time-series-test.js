import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';
import Ember from 'ember';

import domTriggerEvent from '../helpers/async/dom-trigger-event';
import { emberSelectFor } from '../helpers/utils/selector-for';
import assertTooltip from '../helpers/sync/assert-tooltip';

var countBars = function() {
  return $('.chart-time-series svg g.bars').length;
};

var countRects = function() {
  return $('.chart-time-series svg rect').length;
};

moduleForAcceptance('Acceptance | time-series', {
  async beforeEach() {
    await visit('/time-series');
    await fillIn(emberSelectFor('line-data'), '----');
  }
});

test("it exists", function(assert){
  assert.ok(find('.chart-time-series'),
    'The time series chart renders');
});

test('tooltip mouseover with bars: monthly_return_single_series', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('bar-data'), 'monthly_return_single_series');
  await domTriggerEvent('.grouping-0', 'mouseover');

  assertTooltip(assert, {
    isVisible: true,
    label: '2013-05-15',
    name: 'Financial analytics software: ',
    value: '49,668.00'
  });
});

test('tooltip mouseout with bars: monthly_return_single_series', async function(assert) {
  assert.expect(4);

  await domTriggerEvent('.grouping-0', 'mouseover');
  await domTriggerEvent('.grouping-0', 'mouseout');

  assertTooltip(assert, { isVisible: false });
});

test('select bars: monthly_return_single_series', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('bar-data'), 'monthly_return_single_series');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 5);
});

test('select bars: monthly_return_double_series mouseover', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('bar-data'), 'monthly_return_double_series');
  await triggerEvent('.chart-time-series svg rect:first-child', 'mouseover');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 10);
});

test('select bars: monthly_return_double_series', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('bar-data'), 'monthly_return_double_series');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 10);
});

test('select bars: monthly_return_triple_series', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('bar-data'), 'monthly_return_triple_series');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 15);
});

test('select bars: monthly_return_triple_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'monthly_return_triple_series');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 15);
});

test('select bars: monthly_return_single_period', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'monthly_return_single_period');
    
  assert.equal(countBars(), 1);
  assert.equal(countRects(), 7);
});

test('select bars: monthly_return_double_period', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'monthly_return_double_period');
    
  assert.equal(countBars(), 2);
  assert.equal(countRects(), 14);
});

test('select bars: monthly_return_negative_period', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'monthly_return_negative_period');
    
  assert.equal(countBars(), 5);
  assert.equal(countRects(), 35);
});

test('select bars: daily_curr_value', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_curr_value');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 151);
});

test('select bars: daily_diff_value', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_diff_value');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 151);
});

test('select bars: daily_two_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_two_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 302);
});

test('select bars: daily_three_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_three_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 453);
});

test('select bars: daily_four_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_four_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 604);
});

test('select bars: daily_four_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_four_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 604);
});

test('select bars: daily_five_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_five_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 755);
});

test('select bars: daily_six_series', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'daily_six_series');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 906);
});

test('select bars: null data', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), '----');
    
  assert.equal(countBars(), 0);
  assert.equal(countRects(), 0);
});

test('select bars: value_p1d_p1y', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'value_p1d_p1y');
    
  assert.equal(countBars(), 366);
  assert.equal(countRects(), 366);
});

test('select bars: value_p1w_p1y', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'value_p1w_p1y');
    
  assert.equal(countBars(), 54);
  assert.equal(countRects(), 54);
});

test('select bars: value_p1m_p1y', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'value_p1m_p1y');
    
  assert.equal(countBars(), 13);
  assert.equal(countRects(), 13);
});

test('select bars: value_p1m_p2y', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'value_p1m_p2y');
    
  assert.equal(countBars(), 25);
  assert.equal(countRects(), 25);
});

test('select bars: value_p1m_p5y', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'value_p1m_p5y');
    
  assert.equal(countBars(), 61);
  assert.equal(countRects(), 61);
});


test('select bars: zeroes_grouped', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'zeroes_grouped');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 302);
});

test('select bars: zeroes_ungrouped', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'zeroes_ungrouped');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 151);
});

test('select bars: same_value_grouped', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('bar-data'), 'same_value_grouped');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 302);
});

test('select bars: same_value_ungrouped', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('line-data'), '----');
  await fillIn(emberSelectFor('bar-data'), 'same_value_ungrouped');
    
  assert.equal(countBars(), 151);
  assert.equal(countRects(), 151);
});

test('select bars: empty', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('line-data'), '----');
  await fillIn(emberSelectFor('bar-data'), 'empty');
    
  assert.equal(countBars(), 0);
  assert.equal(countRects(), 0);
});
