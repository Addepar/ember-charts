import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

import { emberSelectFor } from '../helpers/utils/selector-for';

var application;

module('Acceptance | time-series', {
  beforeEach: function() {
    application = startApp();
    visit('/time-series');
    fillIn( emberSelectFor('line-data'), '----');
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

var countBars = function() {
  return $('.chart-time-series svg g.bars').length;
};

var countRects = function() {
  return $('.chart-time-series svg rect').length;
};

test("it exists", function(assert){
  assert.equal(find('.chart-time-series').length, 1,
    'The time series chart renders');
});

test('tooltip mouseover with bars: monthly_return_single_series', function(assert) {
  assert.expect(4);

  fillIn( emberSelectFor('bar-data'), 'monthly_return_single_series');
  domTriggerEvent('.grouping-0', 'mouseover');
  andThen(function() {

    assertTooltip(assert, {
      isVisible: true,
      label: '2013-05-15',
      name: 'Financial analytics software: ',
      value: '49,668.00'
    });
  });

});

test('tooltip mouseout with bars: monthly_return_single_series', function(assert) {
  assert.expect(4);

  domTriggerEvent('.grouping-0', 'mouseover');
  domTriggerEvent('.grouping-0', 'mouseout');

  andThen(function() {
    assertTooltip(assert, { isVisible: false });
  });

});

test('select bars: monthly_return_single_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_single_series');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 5);
  });
});

test('select bars: monthly_return_double_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_double_series');
  triggerEvent('.chart-time-series svg rect:eq(0)', 'mouseover');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 10);
  });
});

test('select bars: monthly_return_double_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_double_series');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 10);
  });
});

test('select bars: monthly_return_triple_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_triple_series');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 15);
  });
});

test('select bars: monthly_return_triple_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_triple_series');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 15);
  });
});

test('select bars: monthly_return_single_period', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_single_period');
  andThen(function() {
    assert.equal( countBars(), 1);
    assert.equal( countRects(), 7);
  });
});

test('select bars: monthly_return_double_period', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_double_period');
  andThen(function() {
    assert.equal( countBars(), 2);
    assert.equal( countRects(), 14);
  });
});

test('select bars: monthly_return_negative_period', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'monthly_return_negative_period');
  andThen(function() {
    assert.equal( countBars(), 5);
    assert.equal( countRects(), 35);
  });
});

test('select bars: daily_curr_value', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_curr_value');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 151);
  });
});

test('select bars: daily_diff_value', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_diff_value');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 151);
  });
});

test('select bars: daily_two_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_two_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 302);
  });
});

test('select bars: daily_three_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_three_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 453);
  });
});

test('select bars: daily_four_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_four_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 604);
  });
});

test('select bars: daily_four_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_four_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 604);
  });
});

test('select bars: daily_five_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_five_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 755);
  });
});

test('select bars: daily_six_series', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'daily_six_series');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 906);
  });
});

test('select bars: null data', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), '----');
  andThen(function() {
    assert.equal( countBars(), 0);
    assert.equal( countRects(), 0);
  });
});

test('select bars: value_p1d_p1y', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'value_p1d_p1y');
  andThen(function() {
    assert.equal( countBars(), 366);
    assert.equal( countRects(), 366);
  });
});

test('select bars: value_p1w_p1y', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'value_p1w_p1y');
  andThen(function() {
    assert.equal( countBars(), 54);
    assert.equal( countRects(), 54);
  });
});

test('select bars: value_p1m_p1y', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'value_p1m_p1y');
  andThen(function() {
    assert.equal( countBars(), 13);
    assert.equal( countRects(), 13);
  });
});

test('select bars: value_p1m_p2y', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'value_p1m_p2y');
  andThen(function() {
    assert.equal( countBars(), 25);
    assert.equal( countRects(), 25);
  });
});

test('select bars: value_p1m_p5y', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'value_p1m_p5y');
  andThen(function() {
    assert.equal( countBars(), 61);
    assert.equal( countRects(), 61);
  });
});


test('select bars: zeroes_grouped', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'zeroes_grouped');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 302);
  });
});

test('select bars: zeroes_ungrouped', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'zeroes_ungrouped');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 151);
  });
});

test('select bars: same_value_grouped', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('bar-data'), 'same_value_grouped');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 302);
  });
});

test('select bars: same_value_ungrouped', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('line-data'), '----');
  fillIn( emberSelectFor('bar-data'), 'same_value_ungrouped');
  andThen(function() {
    assert.equal( countBars(), 151);
    assert.equal( countRects(), 151);
  });
});

test('select bars: empty', function(assert) {
  assert.expect(2);
  fillIn( emberSelectFor('line-data'), '----');
  fillIn( emberSelectFor('bar-data'), 'empty');
  andThen(function() {
    assert.equal( countBars(), 0);
    assert.equal( countRects(), 0);
  });
});
