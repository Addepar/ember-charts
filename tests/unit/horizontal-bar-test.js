import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';
const asset_values = [{
    label: "Cash & Cash Equivalent",
    value: 5403418.115000006,
    type: "money",
  }, {
    label: "Fixed Income",
    value: 8231078.16438347,
    type: "money",
  }, {
    label: "Equity",
    value: 12935781.176999997,
    type: "money",
  }, {
    label: "Hedge Fund",
    value: 1621341.246006786,
    type: "money",
  }, {
    label: "Private Equity",
    value: 1574677.59,
    type: "money",
  }, {
    label: "Real Assets",
    value: 10475849.276172025,
    type: "money"
}];

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
