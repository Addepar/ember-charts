 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('scatter-chart', '[Unit] Scatter chart component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

var scatterContent = {
  dotRadius: 7,
  hasXAxisTitle: false,
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
  var component = this.subject(scatterContent);
  Ember.run(function(){
    component.set('showLegend', false);
    assert.expect(3);

    assert.equal(component.get('marginLeft'), 0, 'no left margin');
    assert.equal(component.get('marginRight'), 30, 'right margin exists');
    assert.equal(component.get('marginBottom'), 0, 'no bottom margin');
  });
});

test('Margins are the right size when there is a legend', function(assert) {
  var component = this.subject(scatterContent);
  assert.expect(3);

  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 30, 'right margin exists');
  assert.equal(component.get('marginBottom'), 30, 'bottom margin for legend');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject(scatterContent);

  Ember.run(function() {
    component.set('showLegend', false);
  });

  assert.equal(component.get('hasLegend'), false, 'has no legend if you dont show');
  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 30, 'right margin exists');
  assert.equal(component.get('marginBottom'), 0, 'no bottom margin if showLegend is no');
});

function getDomainPaddingChartContent() {
  var chartContent = Ember.copy(scatterContent, true);

  // Numbers inside this object are taken from dummy app.
  chartContent.xDomain = [-0.9, 0.39];
  chartContent.graphicLeft = 40;
  chartContent.graphicWidth = 630;
  chartContent.numXTicks = 7;


  chartContent.yDomain = [-0.92, 0.83];
  chartContent.graphicTop = 10;
  chartContent.graphicHeight = 379;
  chartContent.numYTicks = 4;

  chartContent.graphPadding = 10;

  return chartContent;
}

test('Test domain with domain padding', function(assert) {
  var chartContent = getDomainPaddingChartContent();
  chartContent.hasXDomainPadding = true;
  chartContent.hasYDomainPadding = true;

  const component = this.subject(chartContent);

  assert.equal(component.get('xScale')(0.017), 355.35699999999997);
  assert.equal(component.get('yScale')(0.03), 199.21574999999999);
});

test('Test domain without domain padding', function(assert) {
  const chartContent = getDomainPaddingChartContent();
  chartContent.hasXDomainPadding = false;
  chartContent.hasYDomainPadding = false;

  const component = this.subject(chartContent);

  assert.equal(component.get('xScale')(0.017), 497.65);
  assert.equal(component.get('yScale')(0.03), 193.815);
});
