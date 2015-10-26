import Ember from 'ember';
import AxisTitlesMixin from '../../../mixins/axis-titles';
import { module, test } from 'qunit';

module('Unit | Mixin | axis titles');

// Replace this with your real tests.
test('it works', function(assert) {
  var AxisTitlesObject = Ember.Object.extend(AxisTitlesMixin);
  var subject = AxisTitlesObject.create();
  assert.ok(subject);
});
