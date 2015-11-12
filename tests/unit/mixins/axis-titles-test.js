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
