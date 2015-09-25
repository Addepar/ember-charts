import { test, moduleForComponent } from 'ember-qunit';

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

test("it exists", function(assert){
  assert.ok(this.subject());
});

test('Margins are the right size', function(assert) {
  var component = this.subject();
  assert.expect(3);

  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 0, 'no right margin');
  assert.equal( component.get('marginBottom'), 0, 'no bottom margin');
});

test('Stacked bars Are grouped correctly', function(assert) {
  var labelIDMapping;
  this.subject(stackedBarContent);
  this.append();
  labelIDMapping = this.subject().get('labelIDMapping');
  assert.equal(find(".grouping-" + labelIDMapping[label1]).length, 1, 'label1 has one section');
  assert.equal(find(".grouping-" + labelIDMapping[label2]).length, 2, 'label2 has two sections');
  return assert.equal(find(".grouping-" + labelIDMapping[label3]).length, 2, 'label3 has two sections');
});
