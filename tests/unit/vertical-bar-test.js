import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';
var three_ranges = [{
   label: "Label 1",
   group: "Group One",
   value: 20
}, {
   label: "Label 1",
   group: "Group Two",
   value: 32
}, {
   label: "Label 1",
   group: "Group Three",
   value: 4
}, {
   label: "Label 2",
   group: "Group One",
   value: 16
}, {
   label: "Label 2",
   group: "Group Two",
   value: 17
}, {
   label: "Label 2",
   group: "Group Three",
   value: -18
}, {
   label: "Label 3",
   group: "Group One",
   value: -18
}, {
   label: "Label 3",
   group: "Group Two",
   value: 18
}, {
   label: "Label 3",
   group: "Group Three",
   value: -19
}];

moduleForComponent('vertical-bar-chart', '[Unit] Vertical bar component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

var label1, label2, label3, stackedBarContent;

label1 = "Label 1";

label2 = "Label 2";

label3 = "Label 3";

stackedBarContent = {
 stackBars: true,
 data: [
   {
     label: label1,
     group: "Group 1",
     value: 20
   }, {
     label: label2,
     group: "Group 2",
     value: 32
   }, {
     label: label3,
     group: "Group 3",
     value: 4
   }, {
     label: label3,
     group: "Group 3",
     value: 16
   }, {
     label: label2,
     group: "Group 2",
     value: 17
   }
 ]
};

test("it exists", function(assert) {
  assert.ok(this.subject());
});

test('Margins are the right size', function(assert) {
  var component = this.subject();
  assert.expect(3);

  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 0, 'no right margin');
  assert.equal( component.get('marginBottom'), 0, 'no bottom margin');
});

test('Stacked bar chart data is sorted correctly', function(assert) {
  var component = this.subject();
  assert.expect(8);
  Ember.run( function() {
    var data, sortedData, original = [], sorted = [], groups = [],
      totals = [], originalGroups = [];

    component.set('data', three_ranges);
    component.set('stackBars', true);

    data = component.get('data');
    sortedData = component.get('sortedData');

    original.push(data.slice(0,3));
    original.push(data.slice(3,6));
    original.push(data.slice(6,9));

    originalGroups.push(original[0].every((item) => item.group === 'Group Three'));
    originalGroups.push(original[1].every((item) => item.group === 'Group One'));
    originalGroups.push(original[2].every((item) => item.group === 'Group Two'));

    sorted.push(sortedData.slice(0,3));
    sorted.push(sortedData.slice(3,6));
    sorted.push(sortedData.slice(6,9));

    totals.push(sorted[0].map( (val) => val.value ).reduce((left,right) => left+right ));
    totals.push(sorted[1].map( (val) => val.value ).reduce((left,right) => left+right ));
    totals.push(sorted[2].map( (val) => val.value ).reduce((left,right) => left+right ));

    groups.push(sorted[0].every((item) => item.group === 'Group Three'));
    groups.push(sorted[1].every((item) => item.group === 'Group One'));
    groups.push(sorted[2].every((item) => item.group === 'Group Two'));

    assert.ok(!originalGroups[0], 'Group three is not first');
    assert.ok(!originalGroups[1], 'Group one is not second');
    assert.ok(!originalGroups[2], 'Group two is not third');

    assert.ok(groups[0], 'Group three is first');
    assert.ok(groups[1], 'Group one is second');
    assert.ok(groups[2], 'Group two is third');

    assert.ok(totals[0] < totals[1], 'Group three is the smaller than group one');
    assert.ok(totals[1] < totals[2], 'Group one is the smaller than group two');
  });
});
test('Stacked bars are grouped correctly', function(assert) {
  var labelIDMapping;
  this.subject(stackedBarContent);
  this.append();
  labelIDMapping = this.subject().get('labelIDMapping');

  assert.equal(this.$().find(".grouping-" + labelIDMapping[label1]).length, 1, 'label1 has one section');
  assert.equal(this.$().find(".grouping-" + labelIDMapping[label2]).length, 2, 'label2 has two sections');
  assert.equal(this.$().find(".grouping-" + labelIDMapping[label3]).length, 2, 'label3 has two sections');
});
