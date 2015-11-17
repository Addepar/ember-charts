import Ember from 'ember';
import AxisTitlesMixin from 'dummy/mixins/axis-titles';
import { module, test } from 'qunit';

module('Unit | Mixin | axis titles');

// Replace this with your real tests.
test('it works', function(assert) {
  const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  const subject = AxisTitlesObject.create();
  assert.ok(subject);
});

test('No left margin', function(assert) {
  const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  const subject = AxisTitlesObject.create();
  assert.equal(subject.get('marginLeft'), 0);
});

test('Has left margin', function(assert) {
  const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  const subject = AxisTitlesObject.create({
    hasAxisTitles: true
  });
  assert.equal(subject.get('marginLeft'), 20);
});

test('Has x title horizontal offset', function(assert) {
  const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  const subject1 = AxisTitlesObject.create({
    xTitleHorizontalOffset: 0,
    graphicWidth: 100,
    labelWidthOffset: 20
  });
  assert.equal(subject1.get('xAxisPositionX'), 70);

  const subject2 = AxisTitlesObject.create({
    xTitleHorizontalOffset: -30,
    graphicWidth: 100,
    labelWidthOffset: 20
  });
  assert.equal(subject2.get('xAxisPositionX'), 40);
});

test('Has y title vertical offset', function(assert) {
  const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  const subject1 = AxisTitlesObject.create({
    yTitleVerticalOffset: 0,
    graphicHeight: 100,
    labelHeightOffset: 0
  });
  assert.equal(subject1.get('yAxisPositionX'), -50);

  const subject2 = AxisTitlesObject.create({
    yTitleVerticalOffset: -30,
    graphicHeight: 100,
    labelHeightOffset: 0
  });
  assert.equal(subject2.get('yAxisPositionX'), -80);
});

