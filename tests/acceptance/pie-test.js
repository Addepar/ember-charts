import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

import domTriggerEvent from '../helpers/async/dom-trigger-event';
import { emberSelectFor } from '../helpers/utils/selector-for';
import assertTooltip from '../helpers/sync/assert-tooltip';

var countArcs = function() {
  return $('.chart-pie svg g.arc').length;
};

moduleForAcceptance('Acceptance | pie', {
  async beforeEach() {
    await visit('/pie');
  }
});

test('tooltip mouseover with data: asset_values', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('data'), 'asset_values');
  await domTriggerEvent('g.arc', 'mouseover');

  assertTooltip(assert, {
    isVisible: true,
    label: 'Private Equity',
    name: 'Value: ',
    value: '1,574,677.59'
  });
});

test('tooltip mouseout with data: asset_values', async function(assert) {
  assert.expect(4);
  await fillIn(emberSelectFor('data'), 'asset_values');
  await domTriggerEvent('.arc', 'mouseover');
  await domTriggerEvent('.arc', 'mouseout');

  assertTooltip(assert, { isVisible: false });
});

test('select data: asset_values', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'asset_values');

  assert.equal(countArcs(), 6);
});

test('select data: many_values', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'many_values');

  assert.equal(countArcs(), 8);
});

test('select data: monthly_return_single_period', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'monthly_return_single_period');
    
  assert.equal(countArcs(), 7);
});

test('select data: high_net_worth_duration', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'high_net_worth_duration');
    
  assert.equal(countArcs(), 8);
});

test('select data: null data', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), '----');
    
  assert.equal(countArcs(), 0);
});

test('select data: empty data', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'empty');
    
  assert.equal(countArcs(), 0);
});

test('select data: two_values', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'two_values');
    
  assert.equal(countArcs(), 1);
});

test('select data: bad_range', async function(assert) {
  assert.expect(1);
  await fillIn(emberSelectFor('data'), 'bad_range');
    
  assert.equal(countArcs(), 4);
});
