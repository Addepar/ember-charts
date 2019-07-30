import { module, test } from 'qunit';
import Ember from 'ember';
import AxisTitlesMixin from 'dummy/mixins/axis-titles';

module('Unit | Mixin | axis titles', function() {

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
      hasXAxisTitle: true,
      hasYAxisTitle: true
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

  test('x & y toggle flags', function(assert) {
    const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
    const subject1 = AxisTitlesObject.create({
      xValueDisplayName: "X Title",
      yValueDisplayName: "Y Title",
      hasXAxisTitle: false,
      hasYAxisTitle: false,
    });
    assert.equal(subject1.get('xAxisTitleDisplayValue'), '');
    assert.equal(subject1.get('yAxisTitleDisplayValue'), '');
    assert.equal(subject1.get('hasAxisTitles'), false);

    subject1.set('hasXAxisTitle', true);
    subject1.set('hasYAxisTitle', true);

    assert.equal(subject1.get('xAxisTitleDisplayValue'), 'X Title');
    assert.equal(subject1.get('yAxisTitleDisplayValue'), 'Y Title');
    assert.equal(subject1.get('hasAxisTitles'), true);
  });

  test('legend chart padding', function(assert) {
    const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
    const subject1 = AxisTitlesObject.create({
      xAxisTitleHeightOffset: 10,
      labelHeightOffset: 13,
    });
    assert.equal(subject1.get('legendChartPadding'), 23);
  });

  test('support hasAxisTitles', function(assert) {
    const AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
    const subject1 = AxisTitlesObject.create({
      hasAxisTitles: true
    });
    assert.equal(subject1.get('hasXAxisTitle'), true);
    assert.equal(subject1.get('hasYAxisTitle'), true);
  });
});
