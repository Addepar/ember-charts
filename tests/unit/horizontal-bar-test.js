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
