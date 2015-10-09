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
