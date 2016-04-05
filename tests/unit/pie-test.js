 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';
 import asset_values from '../../models/single_group/asset_values';

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

test('Legend renders correctly', function(assert) {
  const component = this.subject({
    data: asset_values,
    minSlicePercent: 15
  });
  const legend = this.$().find('.legend');
  const legendText = $('text', legend).text();
  const expectedLegendText = "Other: Private Equity (4%), Hedge Fund (4%), Cash & Cash Equivalent (13%)";
  assert.equal(legend.length, 1, 'Has a legend for other slice');
  assert.equal(legendText, expectedLegendText,
    'Legend contains text for all values in the other slice');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject(pieContent);

  Ember.run(function() {
    component.set('showLegend', false);
  });

  assert.equal(this.subject().get('hasLegend'), false, 'if showLegend is no, a legend is not made');
});

test('Slice percents by default', function(assert) {
  var component = this.subject(pieContent);

  assert.equal(this.subject().get('finishedData').length, 8, 'There are 8 slices by default');
  assert.equal(this.subject().get('finishedData')[0].label, 'Other', 'First slice is Other');
  assert.equal(this.subject().get('finishedData')[0].percent, 34, 'Other percent equals 34');
});

test('Percentage labels can have decimal points', function(assert) {
  //-------------------- Begin Setup ------------------------//
  var countDecimals = function(value) {
    if (Math.floor(value) === value) {
      return 0;
    }
    return value.toString().split(".")[1].length || 0;
  };

  // Verify that there is an expected number of decimal places in each label
  //
  // NOTE: There could be fewer decimal places than maxDecimalPlace if the percentage
  // happens to be a whole number
  var verifyDecimalPlaces = function(items) {
    for (var i = 0; i < items.length; i++) {
      assert.ok(countDecimals(items[i].percent) <= pieContent.maxDecimalPlace);
    }
  };
  //-------------------- End Setup ------------------------//

  pieContent.maxDecimalPlace = 2;
  var component = this.subject(pieContent);

  var finishedData = this.subject().get('finishedData');
  var otherItems = finishedData[0]._otherItems;
  var pieItems = finishedData.slice(1, finishedData.length);

  verifyDecimalPlaces(pieItems);
  verifyDecimalPlaces(otherItems);
});
