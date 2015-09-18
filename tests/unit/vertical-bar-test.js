 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';
 
 moduleForComponent('vertical-bar-chart', '[Unit] Vertical bar component', {

   needs: [ 'template:components/chart-component'],
   beforeEach: function () {},
   afterEach: function () {}
 });
 
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