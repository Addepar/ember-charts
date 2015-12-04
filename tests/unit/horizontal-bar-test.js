import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';

import sum_to_zero from '../../models/single_group/sum_to_zero';
import asset_values from '../../models/single_group/asset_values';
import all_negatives from '../../models/single_group/all_negatives';

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

test("Margin bottom depends on the label padding and title offset",
    function(assert) {
  assert.expect(2);

  const component = this.subject({
    labelPadding: 100,
    xTitleVerticalOffset: 30
  });
  assert.equal(component.get('marginBottom'), 100,
    'Margin bottom is independent of the xTitleVerticalOffset when there is ' +
        'no xAxis title');

  Ember.run(function(){
    component.set('hasXAxisTitle', true);
  });
  assert.equal(component.get('marginBottom'), 130,
    'Margin bottom is depedent on the xTitleVerticalOffset when there is x ' +
        'Axis title');
});

test("Value/Grouping Labels appear on the left/right when all data is 0 or negative",
    function(assert) {
  assert.expect(1);

  const component = this.subject({
    data: all_negatives,
  });

  this.render();

  const barGroups = component.$('g.bar');
  const allLabelsCorrectlyPositioned = _.all(barGroups, function(group) {
    const groupLabel = $('text.group', group);
    const valueLabel = $('text.value', group);
    return valueLabel.offset().left < groupLabel.offset().left;
  });

  assert.ok(allLabelsCorrectlyPositioned,
    'The value labels are all to the left of the group labels');
});

test("Labels aren't trimmed when width is small", function(assert) {
   assert.expect(1);
  const testData = [{
    label: "some really long label that is really long",
    value: 10000,
    type: "money"
  }, {
    label: "another label",
    value: -100,
    type: "money"
  }];

  const component = this.subject({
    data: testData,
  });

  this.render();
  // Charts set their defaultOuterWidth when they're rendered, so it has to be
  // set after rendering
  Ember.run(() => component.set('defaultOuterWidth', 300));

  const groupLabels = component.$('text.group');
  const noLabelsTruncated = _.all(groupLabels, function(label) {
    return label.textContent.indexOf('...') === -1;
  });
  assert.ok(noLabelsTruncated, 'For charts with a mix of positive and negative values, labels are not' +
      'truncated when width is small');
});

test("Positve and Negative Data 1 - Labels are flush with edges of the chart", function(assert) {
  assert.expect(3);

  const testData = [{
    label: "Label 1",
    value: -5,
    type: "percent"
  }, {
    label: "Label 2 - There is a long grouping label on the right that should be flush",
    value: -1,
    type: "percent"
  }, {
    label: "Label 3",
    value: 0,
    type: "percent"
  }, {
    label: "Label 4",
    value: 0,
    type: "percent"
  }, {
    label: "Label 5",
    value: 0,
    type: "percent"
  }, {
    label: "Label 6 - There is a long grouping label on the left that is not flush",
    value: 2,
    type: "percent"
  }];

  const component = this.subject({
    data: testData
  });

  this.render();

  const longValueLabel = component.$("text.value:first");
  const longGroupLabel = component.$("text.group:eq(1)");
  const chartViewport = component.$('.chart-viewport');

  assert.equal(longValueLabel.position().left, chartViewport.position().left,
    'Largest Left Value Label + Bar Width is longer than Left Group Labels, ' +
        'therefore Left Value Label should be flush on the left');
  assert.equal(longGroupLabel.position().right, chartViewport.position().right,
    'Right Group label is longer than Largest Right Value Labels + Bar Widths, ' +
        'therefore Right Group Label should be flush on the right');


  const groupLabels = component.$('text.group');
  const valueLabels = component.$('text.value');
  const noValueLabelsTruncated = _.all(valueLabels, function(label) {
    return label.textContent.indexOf('...') === -1;
  });

  const noGroupLabelsTruncated = _.all(groupLabels, function(label) {
    return label.textContent.indexOf('...') === -1;
  });

  assert.ok(noGroupLabelsTruncated && noValueLabelsTruncated, 'Labels are not truncated');
});

test("Positve and Negative Data 2 - Labels are flush with edges of the chart", function(assert) {
  assert.expect(3);

  const testData = [{
    label: "Label 1",
    value: -2,
    type: "percent"
  }, {
    label: "Label 2 - There is a long grouping label on the right that should not be flush",
    value: -1,
    type: "percent"
  }, {
    label: "Label 3",
    value: 0,
    type: "percent"
  }, {
    label: "Label 4",
    value: 1,
    type: "percent"
  }, {
    label: "Label 5 - There is a long grouping label on the left that should be flush" +
        "ADDING EXTRA WORDS HERE TO MAKE IT LONGER THAN THE BAR",
    value: 2,
    type: "percent"
  }, {
    label: "Label 6",
    value: 4,
    type: "percent"
  }];

  const component = this.subject({
    data: testData
  });

  this.render();

  debugger;

  const longValueLabel = component.$("text.value:last");
  const longGroupLabel = component.$("text.group:eq(4)");
  const chartViewport = component.$('.chart-viewport');

  assert.equal(longValueLabel.position().right, chartViewport.position().right,
    'Largest Right Value Label + Bar Width is longer than Right Group Labels, ' +
        'therefore Right Value Label should be flush on the right');
  assert.equal(longGroupLabel.position().left, chartViewport.position().left,
    'Left Group label is longer than Largest Left Value Labels + Bar Widths, ' +
        'therefore Left Group Label should be flush on the left');

  const groupLabels = component.$('text.group');
  const valueLabels = component.$('text.value');
  const noValueLabelsTruncated = _.all(valueLabels, function(label) {
    return label.textContent.indexOf('...') === -1;
  });

  const noGroupLabelsTruncated = _.all(groupLabels, function(label) {
    return label.textContent.indexOf('...') === -1;
  });

  assert.ok(noGroupLabelsTruncated && noValueLabelsTruncated, 'Labels are not truncated');
});

