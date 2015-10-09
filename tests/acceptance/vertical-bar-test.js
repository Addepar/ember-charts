import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

import { emberSelectFor } from '../helpers/utils/selector-for';

var application;

module('Acceptance | vertical-bar', {
  beforeEach: function() {
    application = startApp();
    visit('/vertical-bar');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

var countBars = function() {
  return $('.chart-vertical-bar svg g.bars').length;
};

var countRects = function() {
  return $('.chart-vertical-bar svg rect').length;
};

test('tooltip mouseover with bars: two_ranges', function(assert) {
  assert.expect(4);

  fillIn(emberSelectFor('data'), 'two_ranges');
  domTriggerEvent('.grouping-0', 'mouseover');
  andThen(function() {

    assertTooltip(assert, {
      isVisible: true,
      label: 'S&P Goldman Sachs Commodity Total Return Index',
      name: 'Cash & Cash Equivalent: ',
      value: '1,933,418.12'
    });
  });

});

test('tooltip mouseout with bars: two_ranges', function(assert) {
  assert.expect(4);
  fillIn(emberSelectFor('data'), 'two_ranges');
  domTriggerEvent('.grouping-0', 'mouseover');
  domTriggerEvent('.grouping-0', 'mouseout');

  andThen(function() {
    assertTooltip(assert, { isVisible: false });
  });

});

test('select bars: two_ranges', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'two_ranges');
  andThen(function() {
    assert.equal(countBars(), 2);
    assert.equal(countRects(), 14);
  });
});

test('select bars: three_ranges', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'three_ranges');
  andThen(function() {
    assert.equal(countBars(), 3);
    assert.equal(countRects(), 9);
  });
});

test('select bars: five_ranges', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'five_ranges');
  andThen(function() {
    assert.equal(countBars(), 5);
    assert.equal(countRects(), 25);
  });
});

test('select bars: sector_compare_return', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'sector_compare_return');
  andThen(function() {
    assert.equal(countBars(), 5);
    assert.equal(countRects(), 50);
  });
});

test('select bars: null data', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), '----');
  andThen(function() {
    assert.equal(countBars(), 0);
    assert.equal(countRects(), 0);
  });
});

test('select bars: empty data', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'empty');
  andThen(function() {
    assert.equal(countBars(), 0);
    assert.equal(countRects(), 0);
  });
});

test('select bars: asset_values', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'asset_values');
  andThen(function() {
    assert.equal(countBars(), 6);
    assert.equal(countRects(), 6);
  });
});
