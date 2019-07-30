import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

import domTriggerEvent from '../helpers/async/dom-trigger-event';
import { emberSelectFor } from '../helpers/utils/selector-for';
import assertTooltip from '../helpers/sync/assert-tooltip';

var countBars = function() {
  return $('.chart-horizontal-bar svg g.bar').length;
};

var countRects = function() {
  return $('.chart-horizontal-bar svg rect').length;
};

moduleForAcceptance('Acceptance | horizontal-bar', {
  async beforeEach() {
    await visit('/horizontal-bar');
  }
});

test('tooltip mouseover with bars: asset_values', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('data'), 'asset_values');
  await domTriggerEvent('.bar rect', 'mouseover');
  assertTooltip(assert, {
    isVisible: true,
    label: 'Private Equity',
    name: 'Value: ',
    value: '1,574,677.59'
  });
});

test('tooltip mouseout with bars: asset_values', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('data'), 'asset_values');
  await domTriggerEvent('.bar rect', 'mouseover');
  await domTriggerEvent('.bar rect', 'mouseout');

  assertTooltip(assert, { isVisible: false });
});

test('select bars: asset_values', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'asset_values');

  assert.equal(countBars(), 6);
  assert.equal(countRects(), 6);
});

test('select bars: many_values', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'many_values');

  assert.equal(countBars(), 26);
  assert.equal(countRects(), 26);
});

test('select bars: monthly_return_single_period', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'monthly_return_single_period');

  assert.equal(countBars(), 7);
  assert.equal(countRects(), 7);
});

test('select bars: high_net_worth_duration', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'high_net_worth_duration');

  assert.equal(countBars(), 8);
  assert.equal(countRects(), 8);
});

test('select bars: null data', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), '----');

  assert.equal(countBars(), 0);
  assert.equal(countRects(), 0);
});

test('select bars: empty data', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'empty');

  assert.equal(countBars(), 0);
  assert.equal(countRects(), 0);
});

test('select bars: two_values', async function(assert) {
  assert.expect(2);
  await fillIn(emberSelectFor('data'), 'two_values');

  assert.equal(countBars(), 2);
  assert.equal(countRects(), 2);
});
