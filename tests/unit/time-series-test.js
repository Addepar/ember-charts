 import Ember from "ember";
 import { test, moduleForComponent } from 'ember-qunit';

 moduleForComponent('time-series-chart', '[Unit] Time series component', {
   needs: [ 'template:components/chart-component'],
   beforeEach: function () {},
   afterEach: function () {}
 });

var timeSeriesContentBarNonDynamic = {
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

  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 0, 'no right margin');
  assert.equal(component.get('marginBottom'), 0, 'no bottom margin');
});

test('Margins are the right size when there is a legend', function(assert) {
  var component = this.subject(timeSeriesContentBarNonDynamic);
  assert.expect(3);

  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 0, 'no right margin');
  assert.equal(component.get('marginBottom'), 30, 'bottom margin for legend');
});

test('Margins are the right size when showLegend is no', function(assert) {
  var component = this.subject(timeSeriesContentBarNonDynamic);

  Ember.run(function() {
    component.set('showLegend', false);
  });

  assert.equal(component.get('hasLegend'), false, 'has no legend if you dont show');
  assert.equal(component.get('marginLeft'), 0, 'no left margin');
  assert.equal(component.get('marginRight'), 0, 'no right margin');
  assert.equal(component.get('marginBottom'), 0, 'no bottom margin if showLegend is no');

});

var timeSeriesContentLineNonDynamic = {
  yAxisFromZero: false,
  dynamicXAxis: false,
  selectedInterval: '',
  minTimeSpecificity: 'S',
  maxTimeSpecificity: 'Y',
  lineData: []
};

test('The number of labels should be equal to the number of day intervals', function(assert) {
  var BUFFER, content, maxLabels;
  content = $.extend({}, timeSeriesContentLineNonDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-1"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-10"),
      value: 2
    }
  ];
  content.selectedInterval = 'D';
  BUFFER = 3;
  this.subject(content);
  maxLabels = this.subject().get('maxNumberOfLabels');
  if (maxLabels < 9) {
    // this case occurs if the graphical window is too narrow and
    // the number of ticks defaults to the number of x ticks
    return assert.equal(this.subject().get('labelledTicks').length <= maxLabels, true, 'The number of labelled days is less than or equal to the max number of labels');
  } else {
    return assert.equal(Math.abs(this.subject().get('labelledTicks').length - 9) <= BUFFER, true, 'The number of labelled days is correct');
  }
});

test('The number of labels should be equal to the number of month intervals', function(assert) {
  var BUFFER, content, maxLabels;
  content = $.extend({}, timeSeriesContentLineNonDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-1"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2011-12-07"),
      value: 2
    }
  ];
  content.selectedInterval = 'M';
  BUFFER = 3;
  this.subject(content);
  maxLabels = this.subject().get('maxNumberOfLabels');
  if (maxLabels < 9) {
    // this case occurs if the graphical window is too narrow an
    // the number of ticks defaults to the number of x ticks
    return assert.equal(this.subject().get('labelledTicks').length <= maxLabels, true, 'The number of labelled months is less than or equal to the max number of labels');
  } else {
    return assert.equal(Math.abs(this.subject().get('labelledTicks').length - 9) <= BUFFER, true, 'The number of labelled months is correct');
  }
});

// Put a small time interval like days with a ridiculously long time span like
// 30 years and make sure the number of labels doesn't exceed the max number
// of labels
test('The number of labels should not exceed the max number of labels', function(assert) {
  var content, maxLabels;
  content = $.extend({}, timeSeriesContentLineNonDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-1"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2040-12-07"),
      value: 2
    }
  ];
  content.selectedInterval = 'D';
  this.subject(content);
  maxLabels = this.subject().get('maxNumberOfLabels');
  return assert.equal(this.subject().get('labelledTicks').length <= maxLabels, true, 'The number of labels does not exceed the max number of labels');
});

test('Tick Filtering', function(assert) {
  var content, tickFilter, timeSeriesComponent;
  content = $.extend({}, timeSeriesContentLineNonDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-08-31"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-03-03"),
      value: 2
    }
  ];
  content.selectedInterval = 'M';
  timeSeriesComponent = this.subject(content);

  assert.equal(timeSeriesComponent.get('labelledTicks').some(function(date) {
    return date.getFullYear() === 2012;
  }), true, 'Ticks from year 2012 were present without filter');

  Ember.run(function() {
    tickFilter = function(date) {
      var UPPER_DATE_BOUND = d3.time.format('%Y-%m-%d').parse("2011-12-31");
      return UPPER_DATE_BOUND.getTime() > date.getTime();
    };
    timeSeriesComponent.set('tickFilter', tickFilter);
  });

  assert.equal(timeSeriesComponent.get('labelledTicks').some(function(date) {
    return date.getFullYear() === 2012;
  }), false, 'Ticks from year 2012 have been filtered out');
  assert.equal(timeSeriesComponent.get('labelledTicks').length > 0, true, 'Not all ticks were filtered out');
});

var timeSeriesContentLineDynamic = {
  yAxisFromZero: false,
  dynamicXAxis: true,
  maxNumberOfLabels: 1,
  lineData: []
};

test('[Dynamic X Axis] Number of labels does not exceed the maximum number of labels for a dynamic x axis', function(assert) {
  var content, i, max, results;
  content = $.extend({}, timeSeriesContentLineDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-16"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2011-09-16"),
      value: 2
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
      value: 3
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
      value: 4
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
      value: 5
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
      value: 6
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
      value: 7
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-07-16"),
      value: 8
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2012-08-16"),
      value: 9
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2015-04-16"),
      value: 10
    }
  ];
  results = [];
  for (max = i = 2; i < 100; max = ++i) {
    content.maxNumberOfLabels = max;
    this.subject(content);
    results.push(assert.equal(this.subject().get('labelledTicks').length <= max, true, 'Less than ' + max + ' labels'));
  }
  return results;
});

test('[Dynamic X Axis] Labels cannot be more specific than the minimum time specificity', function(assert) {
  var content, domainOrder, ind, ind2;
  content = $.extend({}, timeSeriesContentLineDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-16"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-17"),
      value: 2
    }
  ];
  content.maxNumberOfLabels = 20;
  content.minTimeSpecificity = 'M';
  content.maxTimeSpecificity = 'Y';
  this.subject(content);
  domainOrder = this.subject().get('DOMAIN_ORDERING');
  ind = domainOrder.indexOf('M');
  ind2 = domainOrder.indexOf(this.subject().get('xAxisTimeInterval'));
  return assert.equal(ind <= ind2, true, 'The labels are not more specific than the min time specificity');
});

test('[Dynamic X Axis] Labels cannot be less specific than the maximum time specificity', function(assert) {
  var content, domainOrder, ind, ind2;
  content = $.extend({}, timeSeriesContentLineDynamic);
  content.lineData = [
    {
      time: d3.time.format('%Y-%m-%d').parse("2011-04-16"),
      value: 1
    }, {
      time: d3.time.format('%Y-%m-%d').parse("2014-04-17"),
      value: 2
    }
  ];
  content.maxNumberOfLabels = 2;
  content.minTimeSpecificity = 'S';
  content.maxTimeSpecificity = 'D';
  this.subject(content);
  domainOrder = this.subject().get('DOMAIN_ORDERING');
  ind = domainOrder.indexOf('D');
  ind2 = domainOrder.indexOf(this.subject().get('xAxisTimeInterval'));
  return assert.equal(ind >= ind2, true, 'The labels are not less specific than the max time specificity');
});

test('Tick Spacing', function(assert) {
  var component = this.subject();
  var tickSpacing = component.get('tickSpacing');

  assert.expect(6);

  assert.equal(component.get('_innerTickSpacingX'), tickSpacing,
    'tickSpacingX should be equal to the tickSpacing if no default value is set');
  assert.equal(component.get('_innerTickSpacingY'), tickSpacing,
    'tickSpacingY should be equal to the tickSpacing if no default value is set');

  // Because in testing mode, auto-run is disabled. So we have to put async
  // code in a run loop
  Ember.run(function() {
    component.set('tickSpacingX', 0);
  });
  assert.equal(component.get('_innerTickSpacingX'), 0,
    'tickSpacingX should be changed to the new value');
  assert.equal(component.get('_innerTickSpacingY'), tickSpacing,
    'tickSpacingY should stay the same when tickSpacingX is changed');

  Ember.run(function() {
    component.set('tickSpacingY', 40);
  });
  assert.equal(component.get('_innerTickSpacingY'), 40,
    'tickSpacingY should be changed to the new value');
  assert.equal(component.get('_innerTickSpacingX'), 0,
    'tickSpacingX should stay the same when tickSpacingY is changed');
});

test('Date Difference', function(assert) {
  // We are going to make sure the Delta between two dates matches what we expect
  assert.expect(7);
  var startDate = new Date('2014-01-01'),
    endDate = new Date('2016-01-01'),
    component = this.subject(),
    testingParams = [
      {interval: 'seconds', expected: 63072000},
      {interval: 'hours', expected: 17520},
      {interval: 'days', expected: 730},
      {interval: 'weeks', expected: 104},
      {interval: 'months', expected: 24},
      {interval: 'quarters', expected: 8},
      {interval: 'years', expected: 2}
    ];

  for (var i in testingParams) {
    assert.equal(component.numTimeBetween(testingParams[i].interval, startDate.getTime(), endDate.getTime()),
      testingParams[i].expected,
      'Expected value found for the numTimeBetween function: ' + testingParams[i].interval);
  }
});

test('Quarterly Filter', function(assert) {
  // We want to make sure the Quarter filter is working as expected.
  assert.expect(9);
  var startDate = new Date('2014-01-01'),
    endDate = new Date('2016-01-01'),
    component = this.subject(),
    candidateMonths = d3.time.months(startDate.getTime(), endDate.getTime()),
    filteredMonths;

  filteredMonths = component.filterLabelsForQuarters(candidateMonths);
  assert.equal(filteredMonths.length, 8, 'The filtered results contains the correct number of labels');
  for (var i in filteredMonths) {
    assert.equal(filteredMonths[i].getMonth() % 3,
      0, 'The filtered month is the start of a quarter');
  }
});


test('Minor Tick Filter', function(assert) {
  assert.expect(13);
  var component = this.subject(),
    candidateLabels = null,
    expectedFiltered = [1404198000000, 1406876400000, 1409554800000, 1412146800000, 1414825200000, 1417420800000, 1435734000000, 1438412400000, 1441090800000, 1443682800000, 1446361200000, 1448956800000],
    filteredCount = 0,
    filteredMonths, len, item, i;

  candidateLabels = [
    new Date('Wed Jan 01 2014 00:00:00 GMT-0800 (PST)'),
    new Date('Tue Jul 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Thu Jan 01 2015 00:00:00 GMT-0800 (PST)'),
    new Date('Wed Jul 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Sat Feb 01 2014 00:00:00 GMT-0800 (PST)'),
    new Date('Fri Aug 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Sun Feb 01 2015 00:00:00 GMT-0800 (PST)'),
    new Date('Sat Aug 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Sat Mar 01 2014 00:00:00 GMT-0800 (PST)'),
    new Date('Mon Sep 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Sun Mar 01 2015 00:00:00 GMT-0800 (PST)'),
    new Date('Tue Sep 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Tue Apr 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Wed Oct 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Wed Apr 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Thu Oct 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Thu May 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Sat Nov 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Fri May 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Sun Nov 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Sun Jun 01 2014 00:00:00 GMT-0700 (PDT)'),
    new Date('Mon Dec 01 2014 00:00:00 GMT-0800 (PST)'),
    new Date('Mon Jun 01 2015 00:00:00 GMT-0700 (PDT)'),
    new Date('Tue Dec 01 2015 00:00:00 GMT-0800 (PST)')
  ];

  Ember.run(function() {
    component.set('xAxis', {
      selectAll: function() {
        Ember.merge(Array.prototype, {
          style: function(){
            // using closure to set the result set
            filteredMonths = this;
            return this;
          },
          attr: function(){ return null; }
        });
        return candidateLabels;
      }
    });

    component.set('labelledTicks', candidateLabels);
    component.set('maxNumberOfMinorTicks', 2);
    component.set('minorTickInterval', 2);
  });

  component.filterMinorTicks();
  // we expect to see 12 filtered items here.
  assert.equal(filteredMonths.length, 12,
    "The correct number of labels have been converted to minor ticks");

  len = filteredMonths.length;
  for (i = 0; i < len; i++) {
    item = filteredMonths[i];
    assert.notEqual(expectedFiltered.indexOf(item.getTime()), -1,
      "A label was correctly filtered out - #["+i+"] " + item.getTime() + " which wasn't in: " + expectedFiltered.join(', '));
  }
});
