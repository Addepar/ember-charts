 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';
 
 moduleForComponent('scatter-chart', '[Unit] Scatter chart component', {

   needs: [ 'template:components/chart-component'],
   beforeEach: function () {},
   afterEach: function () {}
 });

var scatterContent = {
  dotRadius: 7,
  xValueDisplayName: 'Risk',
  yValueDisplayName: 'Return',
  data: [
    {
      "group": "Energy",
      "xValue": 0.017,
      "yValue": 0.03
    },
    {
      "group": "Industrial Metals",
      "xValue": -0.28,
      "yValue": -0.08
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
  assert.equal( component.get('marginRight'), 30, 'right margin exists');
  assert.equal( component.get('marginBottom'), 0, 'no bottom margin');
});

test('Margins are the right size when there is a legend', function(assert) {
  var component = this.subject(scatterContent);
  assert.expect(3);

  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 30, 'right margin exists');
  assert.equal( component.get('marginBottom'), 30, 'bottom margin for legend');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject(scatterContent);

  Ember.run(function() {
    component.set('showLegend', false);
  });

  assert.equal( component.get('hasLegend'), false, 'has no legend if you dont show');
  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 30, 'right margin exists');
  assert.equal( component.get('marginBottom'), 0, 'no bottom margin if showLegend is no');

});
