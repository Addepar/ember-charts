import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

import domTriggerEvent from '../helpers/async/dom-trigger-event';
import { emberSelectFor } from '../helpers/utils/selector-for';
import assertTooltip from '../helpers/sync/assert-tooltip';

var countBars = function() {
  return $('.chart-vertical-bar svg g.bars').length;
};

var countRects = function() {
  return $('.chart-vertical-bar svg rect').length;
};

moduleForAcceptance('Acceptance | vertical-bar', {
  async beforeEach() {
    await visit('/vertical-bar');
  }
});

test('tooltip mouseover with bars: two_ranges', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('data'), 'two_ranges');
  await domTriggerEvent('.grouping-0', 'mouseover');

  assertTooltip(assert, {
    isVisible: true,
    label: 'S&P Goldman Sachs Commodity Total Return Index',
    name: 'Cash & Cash Equivalent: ',
    value: '1,933,418.12'
  });
});

test('tooltip mouseout with bars: two_ranges', async function(assert) {
  assert.expect(4);

  await fillIn(emberSelectFor('data'), 'two_ranges');
  await domTriggerEvent('.grouping-0', 'mouseover');
  await domTriggerEvent('.grouping-0', 'mouseout');

  assertTooltip(assert, { isVisible: false });
});

test('select bars: two_ranges', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('data'), 'two_ranges');

  assert.equal(countBars(), 2);
  assert.equal(countRects(), 14);
});

test('select bars: three_ranges', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('data'), 'three_ranges');

  assert.equal(countBars(), 3);
  assert.equal(countRects(), 9);
});

test('select bars: five_ranges', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('data'), 'five_ranges');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 25);
});

test('select bars: sector_compare_return', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('data'), 'sector_compare_return');

  assert.equal(countBars(), 5);
  assert.equal(countRects(), 50);
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

test('select bars: asset_values', async function(assert) {
  assert.expect(2);

  await fillIn(emberSelectFor('data'), 'asset_values');

  assert.equal(countBars(), 6);
  assert.equal(countRects(), 6);
});
