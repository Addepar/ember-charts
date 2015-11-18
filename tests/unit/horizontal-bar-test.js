import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';

import sum_to_zero from '../../models/single_group/sum_to_zero';
import asset_values from '../../models/single_group/asset_values';

moduleForComponent('horizontal-bar-chart', '[Unit] Horizontal bar component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

test("it exists", function(assert) {
  assert.ok(this.subject());
});

test("correct behavior with null maxBarThickness and minBarThickness", function(assert) {
  assert.expect(2);

  const component = this.subject({
    maxBarThickness: null,
    minBarThickness: null,
  });
  assert.equal(component.get('maxOuterHeight'), null,
    'maxOuterHeight is null when maxBarThickness is null');
  assert.equal(component.get('minOuterHeight'), null,
    'minOuterHeight is null when minBarThickness is null');
});

test('Labels are truncated when labelWidthMultiplier is small', function(assert) {
  assert.expect(1);

  const component = this.subject({
    data: asset_values,
    labelWidthMultiplier: 0
  });

  this.render();

  const groupingLabels = component.$('text.group');
  const groupingTexts = $.map(groupingLabels, (element) => element.textContent);
  const allLabelsTruncated = _.all(groupingLabels, function(element) {
    return element.textContent.indexOf('...') > -1;
  });

  assert.ok(allLabelsTruncated, 'All of the grouping labels are truncated');

});

test(`Labels do not get truncated when data contains a mix of positive and
negative values`, function(assert) {
  assert.expect(1);

  const component = this.subject({
    data: sum_to_zero,
    labelWidthMultiplier: 0
  });

  this.render();

  const groupingLabels = component.$('text.group');
  const groupingTexts = $.map(groupingLabels, (element) => element.textContent);
  const containsTruncations = _.any(groupingLabels, function(element) {
    return element.textContent.indexOf('...') > -1;
  });

  assert.ok(!containsTruncations, 'None of the grouping labels are truncated');
});

test("X & Y titles coordinates are correct", function(assert){
  assert.expect(12);

  const component = this.subject({
    graphicWidth: 100,
    xTitleHorizontalOffset: 30,
    graphicBottom: 50,
    xTitleVerticalOffset: 10,
    labelWidthOffset: 40,
    graphicHeight: 70,
    yTitleVerticalOffset: 10
  });

  assert.equal(component.get('xAxisPositionX'), 80,
    'x position of X axis Title is correct');
  assert.equal(component.get('xAxisPositionY'), 60,
    'y position of X axis Title is correct');
  assert.equal(component.get('yAxisPositionY'), -40,
    'x position of Y axis Title is correct');
  assert.equal(component.get('yAxisPositionX'), -25,
    'y position of Y axis Title is correct');

  //Test when user increases graphWidth
  Ember.run(function(){
    component.set('graphicWidth', 200);
  });
  assert.equal(component.get('xAxisPositionX'), 130,
    'when graphicWidth is changed, x position of X axis Title is correct');
  assert.equal(component.get('xAxisPositionY'), 60,
    'when graphicWidth is changed, x position of X axis Title is correct');
  assert.equal(component.get('yAxisPositionY'), -40,
    'when graphicWidth is changed, x position of Y axis Title is correct');
  assert.equal(component.get('yAxisPositionX'), -25,
    'when graphicWidth is changed, y position of Y axis Title is correct');

  //Test when user increases graphicHeight + graphicBottom
  Ember.run(function(){
    component.set('graphicHeight', 200);
    component.set('graphicBottom', 180);
  });
  assert.equal(component.get('xAxisPositionX'), 130,
    'when graphicWidth is changed, x position of X axis Title is correct');
  assert.equal(component.get('xAxisPositionY'), 190,
    'when graphicWidth is changed, x position of X axis Title is correct');
  assert.equal(component.get('yAxisPositionY'), -40,
    'when graphicWidth is changed, x position of Y axis Title is correct');
  assert.equal(component.get('yAxisPositionX'), -90,
    'when graphicWidth is changed, y position of Y axis Title is correct');
});
