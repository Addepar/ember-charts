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

// Adds additional slice types to the three_ranges data for higher granularity
// and more thorough testing of slice sorting mechanics.
var sliceSortingData = _.cloneDeep(three_ranges).concat([{
  sliceLabel: "Label 4",
  barLabel: "Group One",
  value: -10
}, {
  sliceLabel: "Label 4",
  barLabel: "Group Two",
  value: -10
}, {
  sliceLabel: "Label 4",
  barLabel: "Group Three",
  value: 15
}, {
  sliceLabel: "Label 5",
  barLabel: "Group One",
  value: 10
}, {
  sliceLabel: "Label 5",
  barLabel: "Group Three",
  value: 10
}, {
  sliceLabel: "Label 6",
  barLabel: "Group One",
  value: 20
}, {
  sliceLabel: "Label 6",
  barLabel: "Group Three",
  value: 20
}]);

moduleForComponent('stacked-vertical-bar-chart', '[Unit] Stacked bar component', {
  needs: [ 'template:components/chart-component'],
  beforeEach: function () {},
  afterEach: function () {}
});

test('Margins are the right size', function(assert) {
  assert.expect(3);
  var component = this.subject();

  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 0, 'no right margin');
  assert.equal(component.get('marginBottom'), 30, 'has top margin (because it has a legend)');
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

/**
 * Helper function to extract transform values from an HTML element.
 * These values are stored inside a string in the 'transform' attribute, so
 * some massaging must be done.
 *
 * For example, if the HTML looks as follows:
 *   <g class='tick' transform='translate(0.0, 42.0)' ... />
 * then calling this helper with this element will return either 0.0 or 42.0,
 * depending on whether index is 0 or 1.
 * @function
 * @param  {jQuery} $element - HTML element wrapped in jQuery
 * @param  {number} index - Either 0 or 1, whether to extract the x transform
 *                          value or y transform value
 * @return {float}
 */
const getFloatTransformValue = function($element, index) {
  return parseFloat($element.attr('transform').match(/\d+(\.\d+)?/g)[index]);
};

const equalsWithTolerance = function(actual, expected) {
  // Allowed error tolerance
  var EPSILON = 0.000001;
  return Math.abs(actual - expected) < EPSILON;
};

test('Within each bar, the stacking slices have the correct heights relative to each other',
    function(assert) {
  var dataByBarLabel, barData, svgBarsByBarLabel, barLabel, svgBar, slices,
    barHeight, sliceHeights, sliceIndex, expectedSliceHeights, barDatum;
  assert.expect(three_ranges.length);

  dataByBarLabel = _.groupBy(_.cloneDeep(three_ranges), 'barLabel');

  // Compute the expected heights of each slice as a percentage
  // of the height of the whole bar.
  _.forEach(dataByBarLabel, function(barData) {
    var grossBarSum = _.sum(barData, slice => Math.abs(slice.value));
    for (sliceIndex = 0; sliceIndex < barData.length; sliceIndex++) {
      barData[sliceIndex].percentOfBar = Math.abs(barData[sliceIndex].value) / grossBarSum;
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
    for (sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      barDatum = dataByBarLabel[barLabel][sliceIndex];
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
    for (sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
      assert.ok(
        equalsWithTolerance(
          sliceHeights[sliceIndex],
          expectedSliceHeights[sliceIndex]),
        "The bar for '" + barLabel +
          "' has a slice with height " + expectedSliceHeights[sliceIndex] +
          " px out of " + barHeight +
          " px (actual height: " + sliceHeights[sliceIndex] +
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
    return _.sum(barData, slice => Math.abs(slice.value));
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
  var dataByBarLabel, grossBarSums, pixelsPerDataUnit, expectedBarHeights,
    actualBarHeights, barLabel;

  dataByBarLabel = _.groupBy(three_ranges, 'barLabel');
  assert.expect(1 + _.keys(dataByBarLabel).length);

  // Compute the expected heights of each bar as a percentage
  // of the expected height of the shortest bar.
  grossBarSums = _.mapValues(dataByBarLabel, function(barData) {
    return _.sum(barData, slice => Math.abs(slice.value));
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

    var firstTickTransformY = getFloatTransformValue($(firstTickSvg), 1);
    var secondTickTransformY = getFloatTransformValue($(secondTickSvg), 1);

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

test('All stacking slices with the same label have the same color as shown in the legend',
    function(assert) {
  var component, sliceLabels, legendColorsBySliceLabel;

  sliceLabels = _.keys(_.groupBy(three_ranges, 'sliceLabel'));
  assert.expect(1 + (3 * sliceLabels.length));

  component = this.subject({data: three_ranges});
  this.render();

  legendColorsBySliceLabel = {};
  component.$('svg g.legend-item').each(function() {
    var label = $(this).text();
    assert.notEqual(-1, sliceLabels.indexOf(label),
      "The slice label '" + label + "', which is in the chart legend, " +
      "also appears in the data for the chart");
    // FIXME (SBC): The below line is actually a test bug.
    // In product code, we set the color of the legend box using
    // the <path fill> element attribute, as in <path fill="#c0ffee" ... />.
    // We don't use CSS on the element, either in a separate file, or with script,
    // or with the <path style> attribute (<path style="fill: #c0ffee" ... />).
    //
    // jQuery helps elide this distinction for WebKit, Blink, and Gecko,
    // but we need to check whether it also does so for Edge and Trident.
    //
    // Either that, or we need to fix the test bug by pulling out the attribute
    // directly. Unfortunately, this causes its own problems,
    // because there are multiple different strings for the same color,
    // and one browser may use both simultaneously.
    //
    // Example: Chrome uses <path fill="#c0ffee" ... /> here in the legend,
    // but in the slices it uses <rect style="fill: rgb(192, 255, 238)" ... />.
    // For some reason, jQuery+Chrome does not coerce all the color strings
    // to the same format if you read the <path fill> attribute,
    // but it does if you do the wrong thing and read the <path> CSS.
    //
    legendColorsBySliceLabel[label] = $('path', this).css('fill');
  });
  assert.equal(_.keys(legendColorsBySliceLabel).length, sliceLabels.length,
    'Every slice label in the data for the chart also appears in the chart legend');

  const getSliceColor = function() {
    return $(this).css('fill');
  };

  sliceLabels.forEach(function(label) {
    var sliceSelector = 'svg rect.grouping-' + component.get('labelIDMapping')[label];
    var slices = component.$(sliceSelector);

    var allSliceColors = slices.map(getSliceColor);
    var uniqueSliceColors = _.uniq(allSliceColors);

    assert.equal(uniqueSliceColors.length, 1,
      "All slices for '" + label + "' have this color: " + uniqueSliceColors[0]);
    assert.equal(uniqueSliceColors[0], legendColorsBySliceLabel[label],
      "The slice color '" + uniqueSliceColors[0] +
      "' is the same as the legend color '" + legendColorsBySliceLabel[label] + "'");
  });
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
    for (var sliceIndex = 1; sliceIndex < slices.length; sliceIndex++) {
      var aboveSliceY = getYCoordOfSvgSlice(slices[sliceIndex-1]);
      var aboveSliceHeight = getFloatAttrValueOfSvgSlice(slices[sliceIndex-1], 'height');
      var thisSliceY = getYCoordOfSvgSlice(slices[sliceIndex]);
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

  Ember.run(() => { component.set('strokeWidth', '5'); });
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
  xAxisTransformY = getFloatTransformValue(xAxisElement, 1);

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


/**
 * Helper function that performs 3 assertions pertaining to the 'Other' slice:
 *    1) The slice labels shown in the legend are as expected
 *    2) The total number of slices in the DOM is as expected
 *    3) The existence of the 'Other' slice is as expected
 * @function
 * @param  {Object} assert - assert object from the test being run
 * @param  {StackedVerticalBarChartComponent} component	- SBC component being tested
 * @param  {number} expectedSliceLabels - number of legend items expected
 * @param  {number} expectedSliceCount - number of total slices expected
 * @param  {string} scenarioIndex - unique string for assertion being run
 */
function assertOtherSliceIsCorrect(assert, component, expectedSliceLabels,
    expectedSliceCount, scenarioIndex) {
  var $slices, $otherSliceLegendItem, otherSliceLabel;
  $slices = $('g.bars rect'); // All slices that exist in the DOM
  otherSliceLabel = component.get('otherSliceLabel');
  $otherSliceLegendItem = $('g.legend-item:contains(' + otherSliceLabel + ')');
  assert.ok(_.isEqual(component.get('allSliceLabels'), expectedSliceLabels),
    'The slice labels match expectation for scenario ' + scenarioIndex);
  assert.equal($slices.length, expectedSliceCount, 'The correct number of slices are shown');
  if (expectedSliceLabels.indexOf(otherSliceLabel) === -1) {
    assert.ok($otherSliceLegendItem.length === 0, 'No Other slice is shown');
  } else {
    assert.ok($otherSliceLegendItem.length === 1, 'The Other slice is shown');
  }
}

test("'Other' slice correctly aggregates smallest slices when there are too many",
    function(assert) {
  var component, otherSliceLabel, expectedSliceLabels, scenarioThreeData,
  scenarioFourData;
  assert.expect(12);
  component = this.subject({ data: three_ranges });
  this.render();
  otherSliceLabel = component.get('otherSliceLabel');

  // SCENARIO ONE:
  // Number of unique slice labels in data = 3
  // maxNumberOfSlices = 2
  // All slice labels meet minSlicePercent threshold
  // EXPECTATION:
  // Because the number of slice label types exceeds the max, the smallest 2
  // will need to be aggregated into an Other slice.
  Ember.run(() => { component.set('maxNumberOfSlices', 2); });
  expectedSliceLabels = ['Label 1', otherSliceLabel];
  assertOtherSliceIsCorrect(assert, component, expectedSliceLabels, 6, 'One');

  // SCENARIO TWO:
  // Number of unique slice labels in data = 3
  // maxNumberOfSlices = 3
  // All slice labels meet minSlicePercent threshold
  // EXPECTATION:
  // The number of slice labels is equal to the max and they all meet the min
  // slice threshold, so there should not be an 'Other' slice.
  Ember.run(() => { component.set('maxNumberOfSlices', 3); });
  expectedSliceLabels = ['Label 1', 'Label 2', 'Label 3'];
  assertOtherSliceIsCorrect(assert, component, expectedSliceLabels, 9, 'Two');

  // SCENARIO THREE:
  // Number of unique slice labels in data = 3
  // maxNumberOfSlices = 3
  // One slice label does NOT meet minSlicePercent
  // EXPECTATION: The slice label that fails to meet the minSlicePercent would
  // normally fall into the 'Other' slice, but it is the ONLY slice in 'Other',
  // so in this case it will actually get displayed despite being < min %
  scenarioThreeData = _.cloneDeep(three_ranges);
  scenarioThreeData.forEach(datum => {
    if (datum.sliceLabel === 'Label 2') {
      datum.value = 0.05;
    }
  });
  Ember.run(() => { component.set('data', scenarioThreeData); });
  expectedSliceLabels = ['Label 1', 'Label 2', 'Label 3'];
  assertOtherSliceIsCorrect(assert, component, expectedSliceLabels, 9, 'Three');

  // SCENARIO FOUR:
  // Number of unique slice labels in data = 3
  // maxNumberOfSlices = 3
  // Two slice label do NOT meet minSlicePercent
  // EXPECTATION: Because now two slices fail to meet the minSlicePercent
  // instead of just one, we can display the Other slice. Only the one slice
  // label that met the min slice % threshold should have its own legend item
  scenarioFourData = _.cloneDeep(scenarioThreeData);
  scenarioFourData.forEach((datum) => {
    if (datum.sliceLabel === 'Label 3') {
      datum.value = 0.05;
    }
  });
  Ember.run(() => { component.set('data', scenarioFourData); });
  expectedSliceLabels = ['Label 1', otherSliceLabel];
  assertOtherSliceIsCorrect(assert, component, expectedSliceLabels, 6, 'Four');
});

test("'Other' slice is end-aligned (either positive or negative) for every bar",
    function(assert) {
  var component, nonOtherSlices, otherSliceYPos, otherSliceOnEnd;
  assert.expect(3);
  component = this.subject({
    data: sliceSortingData,
    maxNumberOfSlices: 4
  });
  this.render();

  // Find the Other slice in each bar and verify that it is on the end of the
  // bar (either top or bottom, depending on its sign)
  this.$('g.bars').each((iBar, bar) => {
    nonOtherSlices = $(bar).find('rect').not('.grouping-3').toArray();
    otherSliceYPos = parseInt($(bar).find('rect.grouping-3').attr('y'));
    otherSliceOnEnd = nonOtherSlices.every((slice) => otherSliceYPos < $(slice).attr('y')) ||
                      nonOtherSlices.every((slice) => otherSliceYPos > $(slice).attr('y'));
    assert.ok(otherSliceOnEnd, "The 'Other' slice is at an end of bar " + iBar);
  });
});

test('Slices are sorted in correct order for each sliceSortKey', function(assert) {
  var component, expectedSliceOrders, sliceSortOrder, xAxisElement,
  xAxisTransformY, positiveSlices, negativeSlices, allSlices,
  currentSliceGrouping, nextSliceGrouping, sliceOutOfOrder;
  assert.expect(9);
  component = this.subject({
    data: sliceSortingData,
    maxNumberOfSlices: 6,
  });
  this.render();

  expectedSliceOrders = {
    'original': [ 'grouping-0', 'grouping-1', 'grouping-2',
                  'grouping-3', 'grouping-4', 'grouping-5' ],
    'value':    [ 'grouping-0', 'grouping-2', 'grouping-1',
                  'grouping-3', 'grouping-5', 'grouping-4' ],
    'custom':   [ 'grouping-0', 'grouping-1', 'grouping-2',
                  'grouping-3', 'grouping-4', 'grouping-5' ]
  };
  xAxisElement = this.$('.tick:not(.minor)');
  xAxisTransformY = getFloatTransformValue(xAxisElement, 1);
  ['original', 'value', 'custom'].forEach(sliceSortKey => {
    Ember.run(() => { component.set('sliceSortKey', sliceSortKey); });
    sliceSortOrder = expectedSliceOrders[sliceSortKey];

    // Check the slice ordering for each bar. This needs to be done separately
    // for positive and negative slices.
    this.$('g.bars').each((iBar, bar) => {
      allSlices = $(bar).find('rect').toArray();
      positiveSlices = [];
      negativeSlices = [];
      // Sort all (positive AND negative) slice elements by 'y' value
      _.sortBy(allSlices, slice => parseInt($(slice).attr('y'))).forEach(slice => {
        if ($(slice).attr('y') < xAxisTransformY) {
          // Populate positive slice stack from start of array so that slices
          // are ordered outward from the x-axis
          positiveSlices.unshift(slice);
        } else {
          // Populate negative slice stack from end of array so that slices
          // are ordered outward from the x-axis
          negativeSlices.push(slice);
        }
      });
      // Verify that every slice in each stack is higher in the sort order than
      // the next slice. Trigger a flag if this is not true.
      sliceOutOfOrder = false;
      [positiveSlices, negativeSlices].forEach(stack => {
        for (var i = 0; i < stack.length - 1; i++) {
          currentSliceGrouping = $(stack[i]).attr('class');
          nextSliceGrouping = $(stack[i + 1]).attr('class');
          if (sliceSortOrder.indexOf(currentSliceGrouping) >
          sliceSortOrder.indexOf(nextSliceGrouping)) {
            sliceOutOfOrder = true;
          }
        }
      });
      assert.ok(!sliceOutOfOrder, 'All slices are ordered correctly in bar ' +
        iBar + ' with sliceSortKey=' + sliceSortKey);
    });
  });
});

test('If a slice has a label, it is shown in all bars regardless of minSlicePercent',
    function(assert) {
  var modifiedData, component, $label4Slices;
  assert.expect(2);
  // Modify input data so there is a slice in the largest net value bar (Group
  // Two) that will definitely NOT be aggregated into the Other slice due to its
  // high value. Put this same slice type in the other bars, but with values
  // that will definitely fail to meet the minimum slice percent threshold.
  modifiedData = three_ranges.concat([{
    sliceLabel: 'Label 4',
    barLabel: 'Group One',
    value: 0.05
  }, {
    sliceLabel: 'Label 4',
    barLabel: 'Group Two',
    value: 20
  }, {
    sliceLabel: 'Label 4',
    barLabel: 'Group Three',
    value: 0.05
  }]);
  component = this.subject({
    data: modifiedData,
    maxNumberOfSlices: 3
  });
  this.render();
  assert.ok(component.get('sliceOrderByValue').indexOf('Label 4') !== -1,
    'Label 4 slices are not aggregated into the Other slice initially');
  $label4Slices = this.$('.grouping-0');
  assert.equal($label4Slices.length, 3, 'All three slices for Label 4 are ' +
    'rendered on the DOM, despite some not meeting the min slice % threshold');
});

test('Zero-value slices are never shown in the legend', function(assert) {
  var component, $legendItems;
  assert.expect(1);
  component = this.subject({
    data: [{ sliceLabel: 'Test', barLabel: 'Test', value: 0 }]
  });
  this.render();

  $legendItems = this.$('.legend-container').children();
  assert.equal($legendItems.length, 0, 'No legend items are displayed');
});


/**
 * Helper function that performs 2 assertions pertaining to bar sorting:
 *    1) Bar sorting order is correct in the `barNames` property, which is
 *       inevitably determines how D3 renders the bar order
 *    2) Bar sorting is visually correct on the page (ie, whether the D3
 *       domain to determine bar order is working correctly)
 *
 * @function
 * @param  {Object} assert - Assert object from the test being run
 * @param  {StackedVerticalBarChartComponent} component - SBC component being tested
 * @param  {Array.<string>} expectedBarOrder - Order of bars by label, left to right
 * @param  {string} message - Additional message to include to uniquely identify
 *                          	each iteration of this helper function being run
 */
function assertBarSortingIsCorrect(assert, component, expectedBarOrder, message) {
  var sortedBarElements, sortedBarElementLabels;
  assert.ok(_.isEqual(component.get('barNames'), expectedBarOrder),
    'Bars are logically sorted correctly (in data structure) for ' + message);
  sortedBarElements = _.sortBy($('.bars'), bar => getFloatTransformValue($(bar), 0));
  sortedBarElementLabels = _.map(sortedBarElements, bar => $(bar).text());
  assert.ok(_.isEqual(sortedBarElementLabels, expectedBarOrder), 'Bars are ' +
    'visually sorted correctly (in the DOM) for ' + message);
}

// Test both the logical and visual bar sorting (ie, making sure the chart
// visually represents the sorted data in the component, and that both of these
// are sorted as expected) for every combination of barSortKey and
// barSortAscending
test('Bars are sorted correctly', function(assert) {
  var component, expectedBarOrder;
  assert.expect(16);
  component = this.subject({ data: three_ranges });
  this.render();

  // barSortKey = 'value', barSortAscending = true
  expectedBarOrder = ['Group Three', 'Group One', 'Group Two'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'ascending by value');

  // barSortKey = 'value', barSortAscending = false
  Ember.run(() => { component.set('barSortAscending', false); });
  expectedBarOrder = ['Group Two', 'Group One', 'Group Three'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'descending by value');

  // barSortKey = 'original', barSortAscending = true
  Ember.run(() => {
    component.set('barSortKey', 'original');
    component.set('barSortAscending', true);
  });
  expectedBarOrder = ['Group One', 'Group Two', 'Group Three'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'ascending by original order');

  // barSortKey = 'original', barSortAscending = false
  Ember.run(() => { component.set('barSortAscending', false); });
  expectedBarOrder = ['Group Three', 'Group Two', 'Group One'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'descending by original order');

  // barSortKey = 'custom', barSortAscending = true
  // customBarSortingFn is default function (alphabetical sort)
  Ember.run(() => {
    component.set('barSortKey', 'custom');
    component.set('barSortAscending', true);
  });
  expectedBarOrder = ['Group One', 'Group Three', 'Group Two'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'ascending alphabetical');

  // barSortKey = 'custom', barSortAscending = false
  // customBarSortingFn is default function (alphabetical sort)
  Ember.run(() => { component.set('barSortAscending', false); });
  expectedBarOrder = ['Group Two', 'Group Three', 'Group One'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'descending alphabetical');

  // barSortKey = 'custom', barSortAscending = true
  // Override the default customBarSortingFn so that it instead will sum the
  // integers of a bar's value and sort by this value
  Ember.run(() => {
    component.set('customBarSortingFn',
      function(barData1, barData2) {
        function getDigitSum(barData) {
          return ('' + Math.abs(barData.value))
          .split('')
          .reduce((sum, num) => sum + parseInt(num), 0);
        }
        return getDigitSum(barData1) - getDigitSum(barData2);
      });
    component.set('barSortAscending', true);
  });
  expectedBarOrder = ['Group Three', 'Group One', 'Group Two'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'ascending custom sort (sum of integers in bar value)');

  // barSortKey = 'custom', barSortAscending = false
  // Same overridden customBarSortingFn as previous assertion
  Ember.run(() => { component.set('barSortAscending', false); });
  expectedBarOrder = ['Group Two', 'Group One', 'Group Three'];
  assertBarSortingIsCorrect(assert, component, expectedBarOrder,
    'descending custom sort (sum of integers in bar value)');
});
