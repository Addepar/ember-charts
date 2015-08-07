 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';
 
 moduleForComponent('time-series-chart', '[Unit] Time series component', {

   needs: [ 'template:components/chart-component'],
   beforeEach: function () {},
   afterEach: function () {}
 });

var timeSeriesContent = {
  barPadding: 0,
  barGroupPadding: 0,
  barLeftOffset: 0,
  barData: [{
      time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
      label: "Software & Programming",
      value: 63540,
      type: "money"
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
      label: "Telecommunication",
      value: 31005,
      type: "money"
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
      label: "Financial analytics software",
      value: 69669,
      type: "money"
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
      label: "Software & Programming",
      value: 74860,
      type: "money"
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
      label: "Telecommunication",
      value: 14513,
      type: "money"
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
      label: "Financial analytics software",
      value: 68344,
      type: "money"
  }]
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

test('Margins are the right size when there is a legend', function(assert) {
  var component = this.subject(timeSeriesContent);
  assert.expect(3);

  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 0, 'no right margin');
  assert.equal( component.get('marginBottom'), 30, 'bottom margin for legend');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject(timeSeriesContent);

  Ember.run(function() {
    component.set('showLegend', false);
  });

  assert.equal( component.get('hasLegend'), false, 'has no legend if you dont show');
  assert.equal( component.get('marginLeft'), 0, 'no left margin');
  assert.equal( component.get('marginRight'), 0, 'no right margin');
  assert.equal( component.get('marginBottom'), 0, 'no bottom margin if showLegend is no');

});