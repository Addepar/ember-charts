import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

import { emberSelectFor } from '../helpers/utils/selector-for';

var application;

module('Acceptance | pie', {
  beforeEach: function() {
    application = startApp();
    visit('/pie');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

var countArcs = function() {
  return $('.chart-pie svg g.arc').length;
};

test('tooltip mouseover with data: asset_values', function(assert) {
  assert.expect(4);

  fillIn(emberSelectFor('data'), 'asset_values');
  domTriggerEvent('g.arc', 'mouseover');
  andThen(function() {
    assertTooltip(assert, {
      isVisible: true,
      label: 'Private Equity',
      name: 'Value: ',
      value: '1,574,677.59'
    });
  });
});

test('tooltip mouseout with data: asset_values', function(assert) {
  assert.expect(4);
  fillIn(emberSelectFor('data'), 'asset_values');
  domTriggerEvent('.arc', 'mouseover');
  domTriggerEvent('.arc', 'mouseout');

  andThen(function() {
    assertTooltip(assert, { isVisible: false });
  });
});

test('select data: asset_values', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'asset_values');
  andThen(function() {
    assert.equal(countArcs(), 6);
  });
});

test('select data: many_values', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'many_values');
  andThen(function() {
    assert.equal(countArcs(), 8);
  });
});

test('select data: monthly_return_single_period', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'monthly_return_single_period');
  andThen(function() {
    assert.equal(countArcs(), 7);
  });
});

test('select data: high_net_worth_duration', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'high_net_worth_duration');
  andThen(function() {
    assert.equal(countArcs(), 8);
  });
});

test('select data: null data', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), '----');
  andThen(function() {
    assert.equal(countArcs(), 0);
  });
});

test('select data: empty data', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'empty');
  andThen(function() {
    assert.equal(countArcs(), 0);
  });
});

test('select data: two_values', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'two_values');
  andThen(function() {
    assert.equal(countArcs(), 1);
  });
});

test('select data: bad_range', function(assert) {
  assert.expect(1);
  fillIn(emberSelectFor('data'), 'bad_range');
  andThen(function() {
    assert.equal(countArcs(), 3);
  });
});
