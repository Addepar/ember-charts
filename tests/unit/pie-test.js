 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';
 
 moduleForComponent('pie-chart', '[Unit] PieChartComponent', {
   needs: [ 'template:components/chart-component'],
   beforeEach: function () {},
   afterEach: function () {}
 });

 var pieContent = {
  maxRadius: 100,
  maxSlicePercent: 8,
  minSlicePercent: 2,
  data: [
    {
      "label": "Label 1",
      "value": 20
    },
    {
      "label": "Label 2",
      "value": 22
    },
    {
      "label": "Label 3",
      "value": 18
    },
    {
      "label": "Label 4",
      "value": 2
    },
    {
      "label": "Label 5",
      "value": 6
    },
    {
      "label": "Label 6",
      "value": 26
    },
    {
      "label": "Label 7",
      "value": 18
    },
    {
      "label": "Label 8",
      "value": 150
    },
    {
      "label": "Label 9",
      "value": 160
    },
    {
      "label": "Label 10",
      "value": 200
    },
    {
      "label": "Label 11",
      "value": 14
    },
    {
      "label": "Label 12",
      "value": 31
    },
    {
      "label": "Label 13",
      "value": 44
    },
    {
      "label": "Label 14",
      "value": 30
    },
    {
      "label": "Label 15",
      "value": 62
    },
    {
      "label": "Label 16",
      "value": 75
    },
    {
      "label": "Label 17",
      "value": 114
    },
    {
      "label": "Label 18",
      "value": 19
    },
    	{
		"label": "Label 19",
		"value": 129
	},
	{
		"label": "Label 20",
		"value": 52
	},
	{
		"label": "Label 21",
		"value": 200
	},
	{
		"label": "Label 22",
		"value": 14
	},
	{
		"label": "Label 23",
		"value": 31
	},
	{
		"label": "Label 24",
		"value": 44
	},
	{
		"label": "Label 25",
		"value": 30
	},
	{
		"label": "Label 26",
		"value": 62
	}
  ]
};
 
test("it exists", function(assert){
  assert.ok(this.subject());
});

test('Legend renders', function(assert) {
  var component = this.subject(pieContent);
  assert.equal(this.$().find('.legend').length, 1, 'Has a legend for other slice');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject( pieContent);

  Ember.run(function() {
	component.set('showLegend', false);
  });

  assert.equal(this.subject().get('hasLegend'), false, 'if showLegend is no, a legend is not made');
});

test('Slice percents by default', function(assert) {
  var component = this.subject( pieContent);

  assert.equal(this.subject().get('finishedData').length, 8, 'There are 8 slices by default');
  assert.equal(this.subject().get('finishedData')[0].label, 'Other', 'First slice is Other');
  assert.equal(this.subject().get('finishedData')[0].percent, 34, 'Other percent equals 34');
});
