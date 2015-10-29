// Creates time series labels that are spaced reasonably.
//  Provides this.formattedTime. Depends on this.xDomain and this.selectedInterval.
import Ember from 'ember';

// The labeller type used to create the labels for each domain type
// Note that quarters uses a month labeller to create the labels
var domainTypeToLabellerType = {
  'S': 'seconds',
  'H': 'hours',
  'D': 'days',
  'W': 'weeks',
  'M': 'months',
  'Q': 'months',
  'Y': 'years'
},
// The lengthened representation for each domain type. This is different from
// domainTypeToLabellerType
domainTypeToLongDomainType = {
  'S': 'seconds',
  'H': 'hours',
  'D': 'days',
  'W': 'weeks',
  'M': 'months',
  'Q': 'quarters',
  'Y': 'years'
}, longDomainTypeToDomainType = {
  'seconds': 'S',
  'hours': 'H',
  'days': 'D',
  'weeks': 'W',
  'months': 'M',
  'quarters': 'Q',
  'years': 'Y'
};

// Creates time series labels that are spaced reasonably.
// Provides @formattedTime. Depends on @xDomain and @selectedInterval.
export default Ember.Mixin.create({

  // When set to true, ticks are drawn in the middle of an interval. By default,
  // they are drawn at the start of an interval.
  centerAxisLabels: false,

  // Interval for ticks on time axis can be:
  // years, months, weeks, days
  // This is used only when a dynamic x axis is not used
  selectedInterval: 'M',

  // [Dynamic X Axis] dynamically set the labelling of the x axis
  dynamicXAxis: false,

  // [Dynamic X Axis] a ratio specifying the point at which the time
  // specificity should be increased. The specificity ratio roughly
  // bounds the number of x axis labels:

  // [SPECIFICITY_RATIO*(MAX_LABELS) , MAX_LABELS]

  // Essentially, the higher the ratio (until a max of 1), the closer the
  // number of labels along the x axis is to the max number of labels
  SPECIFICITY_RATIO: 0.7,

  // [Dynamic X Axis] The two variables below are relevant only for a
  // dynamic x axis and refer to the minimum and maximum time specificity
  // for the x labels
  // For example, if one wants the specificity to range only from days to
  // quarters, the min and max specificities would be 'D' and 'Q' respectively
  // Allowable values are S, H, D, W, M, Q, Y
  minTimeSpecificity: 'S',
  maxTimeSpecificity: 'Y',

  // The domain type of the x axis (years, quarters, months...)
  // If the x axis is not dynamically labelled, then the domain type
  // is simply the selectedInterval
  MONTHS_IN_QUARTER: 3,
  xAxisTimeInterval: Ember.computed('selectedInterval', 'dynamicXAxis', function(key, value) {
    var domain;
    if(this.get('dynamicXAxis')){
      domain = value || 'M';
    }else{
      domain = this.get('selectedInterval');
    }
    // to maintain consistency, convert the domain type into its
    // single letter representation
    if (domain.length > 1) {
      return longDomainTypeToDomainType[domain];
    } else {
      return domain;
    }
  }),

  // The maximum number of labels which will appear on the x axis of the
  // chart. If there are more labels than this (e.g. if you are
  // charting 13 intervals or more) then the number of labels
  // is contracted to a lower value less than or equal to the
  // max number of labels

  // The caller of the time series chart should ideally set this to a value
  // proportional to the width of the graphical panel
  maxNumberOfLabels: 10,

  // The ordering of each time domain from most specific to least specific
  DOMAIN_ORDERING: ['S', 'H', 'D', 'W', 'M', 'Q', 'Y'],

  // This is the number of subdivisions between each major tick on the x
  // axis. Minor ticks have no labels. For instance, if your maxNumberOfLabels
  // is 10, and you are charting 20 weeks, there will be 10
  // major ticks with one subivision (minor ticks) between.
  numberOfMinorTicks: Ember.computed('xDomain', 'xAxisTimeInterval', 'labelledTicks', function() {
    var allTicks, domain, findTick, firstIndex, interval, labelledTicks, xDomain, secondIndex, start, stop;
    labelledTicks = this.get('labelledTicks');
    xDomain = this.get('xDomain');
    start = xDomain[0];
    stop = xDomain[1];
    domain = this.get('xAxisTimeInterval');
    interval = domain === 'Q' ? this.MONTHS_IN_QUARTER : 1;

    // All the ticks which occur between start and stop (including
    // unlabelled ticks)
    allTicks = d3.time[domainTypeToLabellerType[domain]](start, stop, interval);
    if (labelledTicks.length < 2) {
      return 0;
    }

    // equality for ticks
    findTick = function(tick) {
      return function(x) {
        return +x === +tick;
      };
    };

    // Returns the difference between where the second labelled value
    // occurs in the unlabelled array and where the first occurs - e.g. in
    // the above example 3 - 1 - 1 => 1 subdivision tick.
    secondIndex = _.findIndex(allTicks, findTick(labelledTicks[1]));
    firstIndex = _.findIndex(allTicks, findTick(labelledTicks[0]));
    return secondIndex - firstIndex - 1;
  }),

  //  This is the set of ticks on which labels appear.
  labelledTicks: Ember.computed('xDomain', 'centerAxisLabels', 'xAxisTimeInterval', function() {
    var count, domain, interval, j, len, results, tick, ticks;
    domain = this.get('xDomain');
    ticks = this.get('tickLabelerFn')(domain[0], domain[1]);
    if (!this.get('centerAxisLabels')) {
      return ticks;
    } else {
      count = 1;
      interval = this.domainTypeToLongDomainTypeSingular(this.get('xAxisTimeInterval'));
      if (interval === 'quarter') {
        count = this.MONTHS_IN_QUARTER;
        interval = 'month';
      }
      results = [];
      for (j = 0, len = ticks.length; j < len; j++) {
        tick = ticks[j];
        results.push(this._advanceMiddle(tick, interval, count));
      }
      return results;
    }
  }),

  _advanceMiddle: function(time, interval, count) {
    return new Date((time = time.getTime() / 2 + d3.time[interval].offset(time, count) / 2));
  },

  // The amount of time between a start and a stop in the specified units
  // Note that the d3 time library was not used to calculate all of these times
  // in order to improve runtime. This comes at the expense of accuracy, but for
  // the applications of timeBetween, it is not too important
  numTimeBetween: function(timeInterval, start, stop) {
    switch (timeInterval) {
      case 'seconds':
        return (stop - start) / 1000;
      case 'hours':
        return (stop - start) / 1000;
      case 'days':
        return (stop - start) / 86400000;
      case 'weeks':
        return d3.time.weeks(start, stop).length;
      case 'months':
        return d3.time.months(start, stop).length;
      case 'quarters':
        return d3.time.months(start, stop).length / this.MONTHS_IN_QUARTER;
      case 'years':
        return d3.time.years(start, stop).length;
    }
  },

  domainTypeToLongDomainTypeSingular: function(timeInterval) {
    var domainType = domainTypeToLongDomainType[timeInterval];
    return domainType.substring(0, domainType.length - 1);
  },

  // Dynamic x labelling tries to intelligently limit the number of labels
  // along the x axis to a specified limit. In order to do this, time
  // specificity is callibrated (e.g. for a range of 2 years, instead of having
  // the labels be in years, the specificity is increased to quarters)
  // If the minTimeSpecificity or maxTimeSpecificity are set, then the labels
  // are limited to fall between the time units between these bounds.
  dynamicXLabelling: function(start, stop) {
    var d, domainType, domainTypes, i, ind1, ind2, interval, j, labellerTypes, labels, len, maxNumberOfLabels, timeBetween, times;
    ind1 = this.get('DOMAIN_ORDERING').indexOf(this.get('minTimeSpecificity'));
    ind2 = this.get('DOMAIN_ORDERING').indexOf(this.get('maxTimeSpecificity'));


    // Refers to the metrics used for the labelling
    domainTypes = this.get('DOMAIN_ORDERING').slice(ind1, +ind2 + 1 || 9e9);

    // The labeller type to create the labels for each metric
    labellerTypes = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = domainTypes.length; j < len; j++) {
        domainType = domainTypes[j];
        results.push(domainTypeToLabellerType[domainType]);
      }
      return results;
    })();

    // The time span in various metrics
    times = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = domainTypes.length; j < len; j++) {
        d = domainTypes[j];
        results.push(this.numTimeBetween(domainTypeToLongDomainType[d], start, stop));
      }
      return results;
    }).call(this);
    labels = null;
    maxNumberOfLabels = this.get('maxNumberOfLabels');

    for (i = j = 0, len = times.length; j < len; i = ++j) {
      timeBetween = times[i];

      // quarter labels are calculated by simply getting month labels with 3
      // month gaps
      interval = null;
      if (timeBetween < maxNumberOfLabels) {
        interval = domainTypes[i] === 'Q' ? this.MONTHS_IN_QUARTER : 1;
      } else if (domainTypes[i] === this.get('maxTimeSpecificity') || times[i + 1] < maxNumberOfLabels * (this.get('SPECIFICITY_RATIO'))) {
        if (domainTypes[i] === 'Q') {
          interval = Math.ceil(this.MONTHS_IN_QUARTER * timeBetween / maxNumberOfLabels);
        } else {
          interval = Math.ceil(timeBetween / maxNumberOfLabels);
        }
      }
      if (interval != null) {
        this.set('xAxisTimeInterval', domainTypes[i]);
        labels = this.filterLabels(d3.time[labellerTypes[i]](start, stop), interval);
        break;
      }
    }
    return labels;
  },
  filterLabels: function(array, interval){
    return array.filter(function filterLabels(d, i) {
      return i % interval === 0;
    });
  },
  // Returns the function which returns the labelled intervals between
  // start and stop for the selected interval.
  tickLabelerFn: Ember.computed('dynamicXAxis', 'maxNumberOfLabels', 'xAxisTimeInterval',
    'SPECIFICITY_RATIO', 'minTimeSpecificity', 'maxTimeSpecificity',
    function() {
      if (this.get('dynamicXAxis')) {
        return _.bind(function(start, stop) {
          return this.dynamicXLabelling(start, stop);
        }, this);
      } else {
        return _.bind(function(start, stop) {
            var domain, interval, timeBetween;
            domain = this.get('xAxisTimeInterval');
            timeBetween = this.numTimeBetween(domainTypeToLongDomainType[domain], start, stop);
            if (domain === 'Q') {
              if (timeBetween > this.get('maxNumberOfLabels')) {
                return d3.time.years(start, stop);
              } else {
                return d3.time.months(start, stop, this.MONTHS_IN_QUARTER);
              }
            } else {
              if (timeBetween > this.get('maxNumberOfLabels')) {
                interval = Math.ceil(timeBetween / this.get('maxNumberOfLabels'));
              } else {
                interval = 1;
              }

              return this.filterLabels(d3.time[domainTypeToLabellerType[domain]](start, stop), interval);
            }
        }, this);
      }
    }
  ),

  quarterFormat: function(d) {
    var month, prefix, suffix;
    month = d.getMonth() % 12;
    prefix = "";
    if (month < 3) {
      prefix = 'Q1';
    } else if (month < 6) {
      prefix = 'Q2';
    } else if (month < 9) {
      prefix = 'Q3';
    } else {
      prefix = 'Q4';
    }
    suffix = d3.time.format('%Y')(d);
    return prefix + ' ' + suffix;
  },

  // See https://github.com/mbostock/d3/wiki/Time-Formatting
  formattedTime: Ember.computed('xAxisTimeInterval', function() {
    switch (this.get('xAxisTimeInterval')) {
      case 'years':
      case 'Y':
        return d3.time.format('%Y');
      case 'quarters':
      case 'Q':
        return this.quarterFormat;
      case 'months':
      case 'M':
        return d3.time.format('%b \'%y');
      case 'weeks':
      case 'W':
        return d3.time.format('%-m/%-d/%y');
      case 'days':
      case 'D':
        return d3.time.format('%-m/%-d/%y');
      case 'hours':
      case 'H':
        return d3.time.format('%H:%M:%S');
      case 'seconds':
      case 'S':
        return d3.time.format('%H:%M:%S');
      default:
        return d3.time.format('%Y');
    }
  })
});
