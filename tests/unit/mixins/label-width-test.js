import Ember from 'ember';
import LabelWidthMixin from '../../../mixins/label-width';
import { module, test } from 'qunit';

module('Unit | Mixin | label width');

test('it works', function(assert) {
  var LabelWidthObject = Ember.Object.extend(LabelWidthMixin);
  var subject = LabelWidthObject.create();
  assert.ok(subject);
});

test('Can specify the proportion of outerWidth used for labels', function(assert) {
  assert.expect(1);

  var LabelWidthObject = Ember.Object.extend(LabelWidthMixin);
  var subject = LabelWidthObject.create({
    outerWidth: 100,
    labelWidthMultiplier: 0.5
  });
  assert.equal(subject.get('labelWidth'), 50,
    'labelWidth is dependent on labelWidthMultiplier');
});
