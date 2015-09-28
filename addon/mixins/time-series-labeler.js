// # Creates time series labels that are spaced reasonably.
// # Provides this.formattedTime. Depends on this.xDomain and this.selectedInterval.
import Ember from 'ember';
export default Ember.Mixin.create({

  // # When set to true, ticks are drawn in the middle of an interval. By default,
  // # they are drawn at the start of an interval.
  centerAxisLabels: false,

  // # Interval for ticks on time axis can be:
  // # years, months, weeks, days
  selectedInterval: 'M',

  // # The maximum number of labels which will appear on the x axis of the
  // # chart. If there would be more labels than this (e.g. if you are
  // # charting 13 intervals or more) then we use the "labelled" functions
  // # below to reduce the number of labels in a natural way.
  maxNumberOfLabels: 10,

  // # This is the number of subdivisions between each major tick on the x
  // # axis. Minor ticks have no labels. For instance, if your maxNumberOfLabels
  // # is 10, and you are charting 20 weeks, there will be 10
  // # major ticks with one subivision (minor ticks) between.
  numberOfMinorTicks: Ember.computed('xDomain', 'selectedInterval', 'labelledTicks', function() {   
    var labelledTicks = this.get('labelledTicks');
    var xDomain = this.get('xDomain'); 
    var start = xDomain[0];
    var stop = xDomain[1];
    
    var allTicks = (function() {
      switch (this.get('selectedInterval')) {
        case 'years':
        case 'Y':
          return d3.time.years(start, stop);
        case 'quarters':
        case 'Q':
          return d3.time.months(start, stop, 3);
        case 'months':
        case 'M':
          return this.monthsBetween(start, stop);
        case 'weeks':
        case 'W':
          return this.weeksBetween(start, stop);
        case 'hours':
        case 'H':
          return d3.time.hours(start, stop);
        case 'seconds':
        case 'S':
          return this.secondsBetween(start, stop);
      }
    }).call(this);
    if (labelledTicks.length < 2) {
      return 0;
    }
    var findTick = function(tick) {
      return function(x) {
        return +x === +tick;
      };
    };
    var secondIndex = _.findIndex( allTicks, findTick( labelledTicks[1] ));
    var firstIndex  = _.findIndex( allTicks, findTick( labelledTicks[0] ));
    return secondIndex - firstIndex - 1;
  }),

  // #  This is the set of ticks on which labels appear.
  labelledTicks: Ember.computed('xDomain', 'maxNumberOfLabels', 'centerAxisLabels', 'selectedInterval', function() {
    var domain = this.get('xDomain');
    var ticks = this.get('tickLabelerFn')(domain[0], domain[1]);
    if (!this.get('centerAxisLabels')) {
      return ticks;
    } else {
      count = 1;
    }

    var interval;
    switch (this.get('selectedInterval')) {
        case 'years':
        case 'Y':
          interval = 'year';
          break;
        case 'quarters':
        case 'Q':
          interval = 'quarter';
          break;
        case 'months':
        case 'M':
          interval = 'month';
          break;
        case 'weeks':
        case 'W':
          interval = 'week';
          break;
        case 'hours':
        case 'H':
          interval = 'hour';
          break;
        case 'seconds':
        case 'S':
          interval = 'second';
          break;
    }

    if (interval === 'quarter') {
      var count = 3;
      interval = 'month';
    }

    return ticks.map(function(tick) {
      return this._advanceMiddle(tick, interval, count);
    });
  }),

  _advanceMiddle: function(time, interval, count) {
    return new Date (time = time.getTime()/2 + d3.time[interval].offset(time, count)/2);
  },

  // # the years which should be labelled
  labelledYears:  function(start, stop) {
    var years = d3.time.years(start, stop);

    // # if we have too many labelled years then we reduce to the maximum
    // # number of years labelled such that they are uniformly distributed
    // # in the range
    if (years.length > this.get('maxNumberOfLabels')) {
      var skipVal = Math.ceil(years.length / this.get('maxNumberOfLabels'));
      return d3.time.years(start, stop, skipVal);
    } else {
      return years;
    }
  },

  // # the quarters which should be labelled
  labelledQuarters: function(start, stop) {
    var quarters = d3.time.months(start, stop, 3);

    // # if we have too many quarters then we only display quarter labels
    // # on years
    if (quarters.length > this.get('maxNumberOfLabels')) {
      return this.labelledYears(start, stop);
    } else {
      return quarters;
    }
  },

  monthsBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.months(start, stop).filter( function (d, i) { 
      return (i % skip === 0);
    });
  },

  // # the months which should be labelled
  labelledMonths: function(start, stop) {
    var months = this.monthsBetween(start, stop);

    // # if we have too many months then we reduce to the maximum number of
    // # months labelled such that they are uniformly distributed in the
    // # range
    if (months.length > this.get('maxNumberOfLabels')) {
      var skipVal = Math.ceil(months.length / this.get('maxNumberOfLabels'));
      return this.monthsBetween(start, stop, skipVal);
    } else {
      return months;
    }
  },

  weeksBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.weeks(start, stop).filter( function(d, i) {
      return (i % skip === 0);
    });
  },

  secondsBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.seconds(start, stop).filter(function(d, i) {
      return (i % skip === 0);
    });
  },

  // # the weeks which should be labelled
  labelledWeeks: function(start, stop) {
    var weeks = this.weeksBetween(start, stop);

    // # if we have too many weeks then we reduce to the maximum number of
    // # weeks labelled such that they are uniformly distributed in the
    // # range
    if (weeks.length > this.get('maxNumberOfLabels')) {
      var skipVal = Math.ceil(weeks.length / this.get('maxNumberOfLabels'));
      return this.weeksBetween(start, stop, skipVal);
    } else {
      return weeks;
    }
  },

  labelledDays:  function(start, stop) {
    var days = d3.time.days(start, stop);

    if (days.length > this.get('maxNumberOfLabels')) {
      var skipVal = Math.ceil(days.length / this.get('maxNumberOfLabels'));
      return d3.time.days(start, stop).filter(function(d, i) { 
        return (i % skipVal === 0);
      });
    } else {
      return days;
    }
  },

  labelledHours: function(start, stop) {
    var hours = d3.time.hours(start, stop);

    if (hours.length > this.get('maxNumberOfLabels')) {
      var skipVal = Math.ceil(hours.length / this.get('maxNumberOfLabels'));
      return d3.time.hours(start, stop).filter( function(d, i) {
        return (i % skipVal === 0);
      });
    } else {
      return hours;
    }
  },

  // # Returns the function which returns the labelled intervals between
  // # start and stop for the selected interval.
  tickLabelerFn: Ember.computed('maxNumberOfLabels', 'selectedInterval', function() {
    var _this = this;
    switch (this.get('selectedInterval')) {
      case 'years':
      case 'Y':
        return function(start, stop) {
          return _this.labelledYears(start, stop);
        };
      case 'quarters':
      case 'Q':
        return function(start, stop) {
          return _this.labelledQuarters(start, stop);
        };
      case 'months':
      case 'M':
        return function(start, stop) {
          return _this.labelledMonths(start, stop);
        };
      case 'weeks':
      case 'W':
        return function(start, stop) {
          return _this.labelledWeeks(start, stop);
        };
      case 'days':
      case 'D':
        return function(start, stop) {
          return _this.labelledDays(start, stop);
        };
      case 'hours':
      case 'H':
        return function(start, stop) {
          return _this.labelledHours(start, stop);
        };
      case 'seconds':
      case 'S':
        return function(start, stop) {
          return _this.labelledSeconds(start, stop);
        };
      default:
        return d3.time.years;
    }
  }),

  quarterFormat: function(d) {
    var month = d.getMonth() % 12;
    var prefix = "";
    if (month < 3) {
      prefix = 'Q1';
    } else if (month < 6) {
      prefix = 'Q2';
    } else if (month < 9) {
      prefix = 'Q3';
    } else {
      prefix = 'Q4';
    }
    var suffix = d3.time.format('%Y')(d);

    return (prefix + ' ' + suffix);
  },

  // # See https://github.com/mbostock/d3/wiki/Time-Formatting
  formattedTime: Ember.computed('selectedInterval', function() {
    switch (this.get('selectedInterval')) {
      case 'years':
      case 'Y':
        return d3.time.format('%Y');
      case 'quarters':
      case 'Q':
        return this.quarterFormat;
      case 'months':
      case 'M':
        return d3.time.format("%b '%y");
      case 'weeks':
      case 'W':
        return d3.time.format('%-m/%-d/%y');
      case 'days':
      case 'D':
        return d3.time.format('%a');
      case 'hours':
      case 'H':
        return d3.time.format('%H');
      case 'seconds':
      case 'S':
        return d3.time.format('%M : %S');
      default:
        return d3.time.format('%Y');
    }
  })
  
});
