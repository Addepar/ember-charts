import Ember from "ember";
import { test, moduleForComponent } from 'ember-qunit';

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

moduleForComponent('stacked-vertical-bar-chart', '[Unit] Stacked bar component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

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

test('In total, the correct number of stacking slices is displayed', function(assert) {
  assert.expect(1);

  this.subject({data: three_ranges});
  this.render();

  assert.equal(this.$('svg rect').length, three_ranges.length,
    "For " + three_ranges.length + " data points, that many stacking slices are shown");
});

// Passed in to Array.prototype.sort(), which has the bogus default behavior of
// coercing every value in the array to a string and sorting alphabetically
const diff = function(x, y) {
  return (x - y);
};

const getFloatAttrValueOfSvgSlice = function(slice, attributeName) {
  return parseFloat(slice.attributes[attributeName].value);
};

const getHeightOfSvgSlice = function(slice) {
  return getFloatAttrValueOfSvgSlice(slice, 'height');
};

const PERCENT_TOLERANCE = 0.01;

const equalsWithTolerance = function(actual, expected) {
  var tolerance = Math.abs(expected * PERCENT_TOLERANCE);
  return ((actual < 0.0) === (expected < 0.0)) &&
    (Math.abs(actual - expected) < tolerance);
};

test('Within each bar, the stacking slices have the correct heights relative to each other',
function(assert) {
  var dataByBarLabel, barData, svgBarsByBarLabel, barLabel, svgBar, slices,
    barHeight, sliceHeights, iSlice, expectedSliceHeights, barDatum;

  assert.expect(three_ranges.length);

  dataByBarLabel = _.groupBy(_.cloneDeep(three_ranges), 'barLabel');

  // Compute the expected heights of each slice as a percentage
  // of the height of the whole bar.
  _.forEach(dataByBarLabel, function(barData) {
    var iDatum;
    var grossBarSum = 0.0;
    for (iDatum = 0; iDatum < barData.length; iDatum++) {
      grossBarSum += Math.abs(barData[iDatum].value);
    }
    for (iDatum = 0; iDatum < barData.length; iDatum++) {
      barData[iDatum].percentOfBar = Math.abs(barData[iDatum].value) / grossBarSum;
    }
  });

  this.subject({data: three_ranges});
  this.render();

  // Find all the SVG bars.
  svgBarsByBarLabel = {};
  this.$('svg g.bars').each(function() {
    svgBarsByBarLabel[$(this).text()] = this;
  });

  // For each SVG bar:
  for (barLabel in svgBarsByBarLabel) {
    svgBar = svgBarsByBarLabel[barLabel];
    slices = $('rect', svgBar);

    // Find the actual heights of each slice in the bar,
    // and the overall height of the bar.
    sliceHeights = _.map(slices, getHeightOfSvgSlice);
    barHeight = _.sum(sliceHeights);
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
          expectedSliceHeights[iSlice]),
        "The bar for '" + barLabel +
          "' has a slice with height " + expectedSliceHeights[iSlice] +
          " px out of " + barHeight +
          " px (actual height: " + sliceHeights[iSlice] +
          " px)");
    }
  }
});

test('The bars have the correct heights relative to each other', function(assert) {
  var dataByBarLabel, grossBarSums, minGrossBarSum, expectedBarHeightRatios,
    actualBarHeights, minActualBarHeight, barLabel, expectedBarHeight;

  dataByBarLabel = _.groupBy(three_ranges, 'barLabel');
  assert.expect(_.keys(dataByBarLabel).length);

  // Compute the expected heights of each bar as a percentage
  // of the expected height of the shortest bar.
  grossBarSums = _.mapValues(dataByBarLabel, function(barData) {
    var sum = 0.0;
    for (var iDatum = 0; iDatum < barData.length; iDatum++) {
      sum += Math.abs(barData[iDatum].value);
    }
    return sum;
  });
  minGrossBarSum = _.min(_.values(grossBarSums));
  expectedBarHeightRatios = _.mapValues(grossBarSums, function(sum) {
    return (sum / minGrossBarSum);
  });

  this.subject({data: three_ranges});
  this.render();

  // Find the height of each SVG bar by summing the heights of its slices,
  // as well as the shortest height.
  actualBarHeights = {};
  this.$('svg g.bars').each(function() {
    var slices = $('rect', this);
    actualBarHeights[$(this).text()] = _.sum(_.map(slices, getHeightOfSvgSlice));
  });
  minActualBarHeight = _.min(_.values(actualBarHeights));

  // Compare the expected and actual heights
  // and assert that they are approximately equal.
  for (barLabel in expectedBarHeightRatios) {
    expectedBarHeight = minActualBarHeight * expectedBarHeightRatios[barLabel];
    assert.ok(
      equalsWithTolerance(
        actualBarHeights[barLabel],
        expectedBarHeight),
      "The bar for '" + barLabel +
        "' has a height of " + expectedBarHeight +
        " px (actual height: " + actualBarHeights[barLabel] +
        " px)");
  }
});

test('The bars have the correct heights relative to the values on the y-axis ticks',
function(assert) {
  var dataByBarLabel, grossBarSums, pixelsPerDataUnit,
    expectedBarHeights, actualBarHeights, barLabel;

  dataByBarLabel = _.groupBy(three_ranges, 'barLabel');
  assert.expect(1 + _.keys(dataByBarLabel).length);

  // Compute the expected heights of each bar as a percentage
  // of the expected height of the shortest bar.
  grossBarSums = _.mapValues(dataByBarLabel, function(barData) {
    var sum = 0.0;
    for (var iDatum = 0; iDatum < barData.length; iDatum++) {
      sum += Math.abs(barData[iDatum].value);
    }
    return sum;
  });

  this.subject({data: three_ranges});
  this.render();

  // Find the number of pixels between consecutive y-axis ticks,
  // and the data value difference that number of pixels represents.
  pixelsPerDataUnit = (() => {
    assert.ok(this.$('svg g.y.axis g.tick').length >= 2,
      "There are at least 2 Y-axis ticks in the graph");

    var firstTickSvg = this.$('svg g.y.axis g.tick')[0];
    var secondTickSvg = this.$('svg g.y.axis g.tick')[1];

    var firstTickTransformY =
      parseFloat($(firstTickSvg).attr('transform').match(/\d+(\.\d+)?/g)[1]);
    var secondTickTransformY =
      parseFloat($(secondTickSvg).attr('transform').match(/\d+(\.\d+)?/g)[1]);

    var firstTickLabel = parseFloat($(firstTickSvg).text());
    var secondTickLabel = parseFloat($(secondTickSvg).text());

    var transformYDiff = (firstTickTransformY  - secondTickTransformY);
    var labelDiff = (secondTickLabel - firstTickLabel);

    return (transformYDiff / labelDiff);
  })();

  // Find the expected height in pixels of each SVG bar.
  expectedBarHeights = _.mapValues(grossBarSums, function(sum) {
    return (sum * pixelsPerDataUnit);
  });

  // Find the height of each SVG bar by summing the heights of its slices.
  actualBarHeights = {};
  this.$('svg g.bars').each(function() {
    var slices = $('rect', this);
    actualBarHeights[$(this).text()] = _.sum(_.map(slices, getHeightOfSvgSlice));
  });

  // Compare the expected and actual heights
  // and assert that they are approximately equal.
  for (barLabel in expectedBarHeights) {
    assert.ok(
      equalsWithTolerance(
        actualBarHeights[barLabel],
        expectedBarHeights[barLabel]),
      "The bar for '" + barLabel +
        "' has a height of " + actualBarHeights[barLabel] +
        " px (actual height: " + actualBarHeights[barLabel] +
        " px, pixels per data unit: " + pixelsPerDataUnit +
        ", gross sum of slice data values: " + grossBarSums[barLabel] +
        ")");
  }
});

const getYCoordOfSvgSlice = function(slice) {
  return getFloatAttrValueOfSvgSlice(slice, 'y');
};

const compareSlicesByYCoord = function(a, b) {
  return (getYCoordOfSvgSlice(a) - getYCoordOfSvgSlice(b));
};

test('Stacking slices within a single bar do not cover up each other', function(assert) {
  var dataByBarLabel, numExpectedAssertions;

  numExpectedAssertions = 0;
  dataByBarLabel = _.groupBy(three_ranges, 'barLabel');
  _.values(dataByBarLabel).forEach(function(barData) {
    numExpectedAssertions += Math.max(0, barData.length - 1);
  });
  assert.expect(numExpectedAssertions);

  this.subject({data: three_ranges});
  this.render();

  // For each SVG bar:
  this.$('svg g.bars').each(function() {
    var barLabel = $(this).text();

    // The slice elements are not sorted from top to bottom;
    // re-sort them in that order (least y-coord to greatest y-coord,
    // since the y-axis starts at top and grows down),
    // so the slices "next" to each other appear next to each other
    // in the slice array.
    var slices = $('rect', this);
    slices.sort(compareSlicesByYCoord);

    // For each pair of slices "next" to each other,
    // check that the two slices in that pair do not overlap.
    for (var iSlice = 1; iSlice < slices.length; iSlice++) {
      var aboveSliceY = getYCoordOfSvgSlice(slices[iSlice-1]);
      var aboveSliceHeight = getFloatAttrValueOfSvgSlice(slices[iSlice-1], 'height');
      var thisSliceY = getYCoordOfSvgSlice(slices[iSlice]);
      assert.ok(
        equalsWithTolerance(
          thisSliceY,
          aboveSliceY + aboveSliceHeight),
        "The bar for '" + barLabel +
          "' has a slice whose top is at position " + thisSliceY +
          " px; the previous slice's top is at position " + aboveSliceY +
          " px and has a height of " + aboveSliceHeight +
          " px");
    }
  });
});

const isColorWhite = function(colorString) {
  return (-1 !== [
    'rgb(255, 255, 255)',
    'rgb(255,255,255)',
    'rgba(255, 255, 255, 255)',
    'rgba(255,255,255,255)',
    '#ffffff',
    '#fff',
    'white',
  ].indexOf(colorString));
};

test('Configurable, white lines exist between slices in a stacked bar', function(assert) {
  var component, allSliceElements, allSlicesAreOutlined, allSlicesAre5px;
  assert.expect(2);

  component = this.subject({data: three_ranges});
  this.render();
  allSliceElements = this.$('rect');
  allSlicesAreOutlined = allSliceElements.toArray().every(function(slice) {
    var $slice, isOutlineVisible, isOutlineWhite;
    $slice = $(slice);
    isOutlineVisible = ($slice.attr('stroke-width') === '1px');
    isOutlineWhite = isColorWhite($slice.css('stroke'));
    return isOutlineVisible && isOutlineWhite;
  });
  assert.ok(allSlicesAreOutlined,
    'All slices have a 1px white outline by default');

  Ember.run(function() {
    component.set('strokeWidth', '5');
  });
  allSliceElements = this.$('rect');
  allSlicesAre5px = allSliceElements.toArray().every(function(slice) {
    return $(slice).attr('stroke-width') === '5px';
  });
  assert.ok(allSlicesAre5px,
    'The width of the slice outline is configurable and updates with the ' +
    '`strokeWidth` property in the controller');
});

test('Negative value slices are displayed below the y=0 axis', function(assert) {
  var component, xAxisElement, xAxisTransformY, negativeSlices;
  negativeSlices = three_ranges.filter((slice) => slice.value < 0);
  assert.expect(negativeSlices.length * 2);

  component = this.subject({data: three_ranges});
  this.render();

  xAxisElement = this.$('.tick:not(.minor)');
  xAxisTransformY = parseInt(xAxisElement.attr('transform').match(/\d+/g)[1]);

  negativeSlices.forEach(function(slice) {
    var $containerBar, sliceSelector, $negativeSlice, sliceSpecificMessage;
    $containerBar = $('.bars:contains(' + slice.barLabel + ')');
    sliceSelector = '.grouping-' + component.get('labelIDMapping')[slice.sliceLabel];
    $negativeSlice = $containerBar.find(sliceSelector);
    sliceSpecificMessage = 'Negative slice (bar label: ' + slice.barLabel +
     '; slice label: ' + slice.sliceLabel + ') ';

    assert.ok(parseInt($negativeSlice.attr('y')) >= xAxisTransformY,
      sliceSpecificMessage + 'is visually negative (below the x-axis)');
    assert.ok(parseInt($negativeSlice.attr('height')) > 0,
      sliceSpecificMessage + 'has a positive, non-zero height');
  });
});
