import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

import { emberSelectFor } from '../helpers/utils/selector-for';

var application;

module('Acceptance | horizontal-bar', {
  beforeEach: function() {
    application = startApp();
    visit('/horizontal-bar');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

var countBars = function() {
  return $('.chart-horizontal-bar svg g.bar').length;
};

var countRects = function() {
  return $('.chart-horizontal-bar svg rect').length;
};

test('tooltip mouseover with bars: asset_values', function(assert) {
  assert.expect(4);

  fillIn(emberSelectFor('data'), 'asset_values');
  domTriggerEvent('.bar rect', 'mouseover');
  andThen(function() {
    assertTooltip(assert, {
      isVisible: true,
      label: 'Private Equity',
      name: 'Value: ',
      value: '1,574,677.59'
    });
  });
});

test('tooltip mouseout with bars: asset_values', function(assert) {
  assert.expect(4);
  fillIn(emberSelectFor('data'), 'asset_values');
  domTriggerEvent('.bar rect', 'mouseover');
  domTriggerEvent('.bar rect', 'mouseout');

  andThen(function() {
    assertTooltip(assert, { isVisible: false });
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

test('select bars: many_values', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'many_values');
  andThen(function() {
    assert.equal(countBars(), 26);
    assert.equal(countRects(), 26);
  });
});

test('select bars: monthly_return_single_period', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'monthly_return_single_period');
  andThen(function() {
    assert.equal(countBars(), 7);
    assert.equal(countRects(), 7);
  });
});

test('select bars: high_net_worth_duration', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'high_net_worth_duration');
  andThen(function() {
    assert.equal(countBars(), 8);
    assert.equal(countRects(), 8);
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

test('select bars: two_values', function(assert) {
  assert.expect(2);
  fillIn(emberSelectFor('data'), 'two_values');
  andThen(function() {
    assert.equal(countBars(), 2);
    assert.equal(countRects(), 2);
  });
});
