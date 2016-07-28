import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';

// Names of properties are the ones used by the new API;
// we copy into the properties used by the old API
// so we can use the same test file with both
// the old and new product code.
var three_ranges = [{
   sliceLabel: "Label 1",
   barLabel: "Group One",
   value: 20
}, {
   sliceLabel: "Label 1",
   barLabel: "Group Two",
   value: 32
}, {
   sliceLabel: "Label 1",
   barLabel: "Group Three",
   value: 4
}, {
   sliceLabel: "Label 2",
   barLabel: "Group One",
   value: 16
}, {
   sliceLabel: "Label 2",
   barLabel: "Group Two",
   value: 17
}, {
   sliceLabel: "Label 2",
   barLabel: "Group Three",
   value: -18
}, {
   sliceLabel: "Label 3",
   barLabel: "Group One",
   value: -18
}, {
   sliceLabel: "Label 3",
   barLabel: "Group Two",
   value: 18
}, {
   sliceLabel: "Label 3",
   barLabel: "Group Three",
   value: -19
}];
(function() {
  for (var iDatum = 0; iDatum < three_ranges.length; iDatum++) {
    three_ranges[iDatum].group = three_ranges[iDatum].barLabel;
    three_ranges[iDatum].label = three_ranges[iDatum].sliceLabel;
  }
})();

moduleForComponent('stacked-vertical-bar-chart', '[Unit] Stacked bar component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

/*
var label1, label2, label3, stackedBarContent;

label1 = "Label 1";

label2 = "Label 2";

label3 = "Label 3";

stackedBarContent = {
 data: [
   {
     sliceLabel: label1,
     barLabel: "Group 1",
     value: 20
   }, {
     sliceLabel: label2,
     barLabel: "Group 2",
     value: -32
   }, {
     sliceLabel: label3,
     barLabel: "Group 3",
     value: 4
   }, {
     sliceLabel: label3,
     barLabel: "Group 3",
     value: 16
   }, {
     sliceLabel: label2,
     barLabel: "Group 2",
     value: 17
   }
 ]
};
*/

test("it exists", function(assert) {
  assert.ok(this.subject());
});

test('Margins are the right size', function(assert) {
  var component = this.subject();
  assert.expect(3);

  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 0, 'no right margin');
  assert.equal(component.get('marginBottom'), 30, 'has top margin (because it has a legend)');
});

// FIXME(SBC): Should we really be testing the internal properties of the SBC component class?
test('Stacked bar chart data is sorted correctly', function(assert) {
  var component = this.subject();
  assert.expect(8);
  Ember.run(function() {
    var data, sortedData, original = [], sorted = [], groups = [],
      totals = [], originalGroups = [];

    component.set('data', three_ranges);

    data = component.get('data');
    sortedData = component.get('sortedData');

    original.push(data.slice(0,3));
    original.push(data.slice(3,6));
    original.push(data.slice(6,9));

    originalGroups.push(original[0].every((item) => item.barLabel === 'Group Three'));
    originalGroups.push(original[1].every((item) => item.barLabel === 'Group One'));
    originalGroups.push(original[2].every((item) => item.barLabel === 'Group Two'));

    sorted.push(sortedData.slice(0,3));
    sorted.push(sortedData.slice(3,6));
    sorted.push(sortedData.slice(6,9));

    totals.push(sorted[0].map((val) => val.value).reduce((left,right) => left+right));
    totals.push(sorted[1].map((val) => val.value).reduce((left,right) => left+right));
    totals.push(sorted[2].map((val) => val.value).reduce((left,right) => left+right));

    groups.push(sorted[0].every((item) => item.barLabel === 'Group Three'));
    groups.push(sorted[1].every((item) => item.barLabel === 'Group One'));
    groups.push(sorted[2].every((item) => item.barLabel === 'Group Two'));

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

// FIXME(SBC): This test is broken and perhaps should be removed.
//
// It seems to be trying to check that each _slice label_ has
// the correct number of slices displayed, but it actually
// counts and compares against the number of SVG slices per _bar_.
//
// Or it is trying to check that each _bar_ has the correct number
// of slices displayed, but it wrongly uses as the expected value
// the number of slices per _slice label_.
//
// Either way it only works by coincidence on the test dataset
// `stackedBarContent`.
//
/*
test('Stacked bars are grouped correctly', function(assert) {
  var labelIDMapping;
  this.subject(stackedBarContent);
  this.append();
  labelIDMapping = this.subject().get('labelIDMapping');

  assert.equal(this.$().find(".grouping-" + labelIDMapping[label1]).length, 1, 'label1 has one section');
  assert.equal(this.$().find(".grouping-" + labelIDMapping[label2]).length, 2, 'label2 has two sections');
  assert.equal(this.$().find(".grouping-" + labelIDMapping[label3]).length, 2, 'label3 has two sections');
});
*/

test('In total, the correct number of stacking slices is displayed', function(assert) {
  assert.expect(1);

  this.subject({data: three_ranges});
  this.render();

  assert.equal(this.$('svg rect').length, three_ranges.length,
    "For " + three_ranges.length + " data points, that many stacking slices are shown");
});

// FIXME (SBC): Remove this test? It is not as good as it looks;
// even with the old code that failed to draw negative slices, the test would pass
// because the slices _are_ drawn, just with zero height.
test('Each bar has the correct number of stacking slices', function(assert) {
  var dataByBarLabel = _.groupBy(three_ranges, function(datum) { return datum.barLabel; });
  assert.expect(2 * _.keys(dataByBarLabel).length);

  this.subject({data: three_ranges});
  this.render();

  // Find all the SVG bars.
  var barElementsByBarLabel = {};
  this.$('svg g.bars').each(function() {
    barElementsByBarLabel[$(this).text()] = this;
  });

  // For each SVG bar: verify that a bar with that label is expected,
  // and that the expected bar has the same number of slices.
  for (var barLabel in dataByBarLabel) {
    var expectedBarData = dataByBarLabel[barLabel];
    var actualBar = barElementsByBarLabel[barLabel];
    assert.notEqual(actualBar, void 0,
      "A bar for '" + barLabel + "' appears in the stacked bar chart");
    assert.equal($('rect', actualBar).length, expectedBarData.length,
      "The bar for '" + barLabel + "' has " + expectedBarData.length + " slices");
  }
});

const diff = function(x, y) {
  return (x - y);
};

const equalsWithTolerance = function(actual, expected, percentTolerance) {
  var tolerance = expected * percentTolerance;
  return (Math.abs(actual - expected) < tolerance);
};

const PERCENT_TOLERANCE = 0.01;

test('Within each bar, the stacking slices have the correct heights', function(assert) {
  var dataByBarLabel, barLabel, barData, grossBarSum, iDatum, barElementsByBarLabel, bar, slices,
    barHeight, sliceHeights, iSlice, sliceHeight, expectedSliceHeights, barDatum;

  assert.expect(three_ranges.length);

  dataByBarLabel = _.groupBy(
    _.cloneDeep(three_ranges),
    function(datum) { return datum.barLabel; });

  // Compute the expected heights of each slice as a percentage
  // of the height of the whole bar.
  for (barLabel in dataByBarLabel) {
    barData = dataByBarLabel[barLabel];

    grossBarSum = 0.0;
    for (iDatum = 0; iDatum < barData.length; iDatum++) {
      grossBarSum += Math.abs(barData[iDatum].value);
    }
    for (iDatum = 0; iDatum < barData.length; iDatum++) {
      barData[iDatum].percentOfBar = Math.abs(barData[iDatum].value) / grossBarSum;
    }
  }

  this.subject({data: three_ranges});
  this.render();

  // Find all the SVG bars.
  barElementsByBarLabel = {};
  this.$('svg g.bars').each(function() {
    barElementsByBarLabel[$(this).text()] = this;
  });

  // For each SVG bar:
  for (barLabel in barElementsByBarLabel) {
    bar = barElementsByBarLabel[barLabel];
    slices = $('rect', bar);

    // Find the actual heights of each slice in the bar,
    // and the overall height of the bar.
    barHeight = 0.0;
    sliceHeights = [];
    for (iSlice = 0; iSlice < slices.length; iSlice++) {
      sliceHeight = parseFloat(slices[iSlice].attributes.height.value);
      sliceHeights.push(sliceHeight);
      barHeight += sliceHeight;
    }
    sliceHeights.sort(diff);

    // Find the absolute expected heights of each slice
    // using the actual overall height of the bar.
    expectedSliceHeights = [];
    for (iSlice = 0; iSlice < slices.length; iSlice++) {
      barDatum = dataByBarLabel[barLabel][iSlice];
      expectedSliceHeights.push(barHeight * barDatum.percentOfBar);
    }
    expectedSliceHeights.sort(diff);

    // Check that each slice has the correct height.
    // Note: we can't check that the slice also maps to the correct slice label,
    // because the SVG doesn't carry this information.
    //
    // FIXME(SBC): is there a workaround for the noted limitation?
    // E.g. by looking at the hover tooltip or color palette?
    //
    for (iSlice = 0; iSlice < slices.length; iSlice++) {
      assert.ok(
        equalsWithTolerance(
          sliceHeights[iSlice],
          expectedSliceHeights[iSlice],
          PERCENT_TOLERANCE),
        "The bar for '" + barLabel +
          "' has a slice with height " + expectedSliceHeights[iSlice] +
          " px out of " + barHeight +
          " px (actual height: " + sliceHeights[iSlice] +
          " px)");
    }
  }
});

/*
test('Stacking slices within a single bar do not cover up each other', function(assert) {

  this.subject(stackedBarContent);
  this.render();
  debugger;

});
*/
