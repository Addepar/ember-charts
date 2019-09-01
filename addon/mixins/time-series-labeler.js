// Creates time series labels that are spaced reasonably.
//  Provides this.formattedTime. Depends on this.xDomain and this.selectedInterval.
import Ember from 'ember';
import * as d3 from 'd3';

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
// Provides @formattedTime.
// Depends on @xDomain, @selectedInterval, and @tickFilter.
export default Ember.Mixin.create({

  // When set to true, ticks are drawn in the middle of an interval. By default,
  // they are drawn at the start of an interval.
  centerAxisLabels: false,

  // Interval for ticks on time axis can be:
  // years, months, weeks, days
  // This is used only when a dynamic x axis is not used
  selectedInterval: 'M',
  // There are also cases where the selected interval is different from a
  // computed interval for the Aggregation of Bars.  If there is a delta then
  // this will be set and used for the bar offset.
  computedBarInterval: null,

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
    if (this.get('dynamicXAxis')) {
      domain = value || 'M';
    } else {
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

  // D3 No longer handles "minor ticks" for the user, but has instead reverted
  // to a strategy of allowing the user to handle rendered ticks as they see
  // fit.
  // maxNumberOfMinorTicks sets a threshold that is useful when determining our
  // interval. This represents the number of ticks that could be drawn between
  // major ticks. For instance, we may 'allow' 2 minor ticks, but only need
  // to render a single minor tick between labels.
  //
  // minorTickInterval is the modulo for the items to be removed.  This number
  // will be between 1 and the maxNumberOfMinorTicks
  //
  // A maxNumberOfMinorTicks=0 and minorTickInterval=1 essentailly disables the
  // minor tick feature.
  maxNumberOfMinorTicks: 0,
  minorTickInterval: 1,

  filterMinorTicks: function () {
    var gXAxis = this.get('xAxis'),
      minorTickInterval = this.get('minorTickInterval'),
      labels, ticks, minorDates;
    // for the labels we need to reset all of the styles in case the graph updates
    // by being resized.
    gXAxis.selectAll('line').attr("y2", "6");
    gXAxis.selectAll('text').style("display", "block");

    // Need comparison data to do our tick label filtering
    minorDates = this.get('labelledTicks').map(function(item) {
      return new Date(item).getTime();
    }).filter(function(value, index) {
      return index % minorTickInterval !== 0;
    });

    // We have an issue where the nodes come back out of order.  This is a
    // side effect of redrawing the axis.  D3 don't give two [cares] about the
    // insertion order of nodes - they are simply translated into place.  This
    // occurs when the selection with the NEW data is made - the existing ones
    // updated - then the new ones appended on .enter(...)
    labels = gXAxis.selectAll('text').filter(function(value) {
      return minorDates.length > 0 && minorDates.indexOf(value.getTime()) !== -1;
    });
    ticks = gXAxis.selectAll('line').filter(function(value, index) {
      return index % minorTickInterval !== 0;
    });
    labels.style("display", "none");
    ticks.attr("y2", "12");
  },

  // A candidate set of ticks on which labels can appear.
  unfilteredLabelledTicks: Ember.computed('xDomain', 'centerAxisLabels', 'xAxisTimeInterval', function() {
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

  /**
   * A function that can be passed in if there's tick labels we specifically
   * wish to filter out (for example first label, last label, overflows, etc)
   *
   * NOTE: This function filters the ticks after they have been centered (when
   * specified), meaning that the functionality here is not trivially replicable
   * simply by modifying `this.filterLabels` in the `tickLabelerFn` implementation.
   *
   * @type {function}
   */
  tickFilter: Ember.computed(function() {
    return function() {
      return true;
    };
  }),

  //  This is the set of ticks on which labels appear.
  labelledTicks: Ember.computed('unfilteredLabelledTicks', 'tickFilter', function() {
    return this.get('unfilteredLabelledTicks').filter(this.get('tickFilter'));
  }),

  // We need a method to figure out the interval specifity
  intervalSpecificity: Ember.computed('times', 'minTimeSpecificity', function(){
    var ind1, ind2, domainTypes, maxNumberOfLabels, i, len, timeBetween;

    // Now the real trick is if there is any allowance for minor ticks we should
    // consider inflating the max allowed ticks to see if we can fit in a more
    // specific domain.  Previous versions would increase the specifity one step
    // which would then be cut out in filtering.
    // A single minor tick alows us to double our capacity - 2 to triple
    maxNumberOfLabels = this.get('maxNumberOfLabels') * (this.get('maxNumberOfMinorTicks') + 1);

    // Find the segments that we'll test for (inclusive)
    ind1 = this.get('DOMAIN_ORDERING').indexOf(this.get('minTimeSpecificity'));
    ind2 = this.get('DOMAIN_ORDERING').indexOf(this.get('maxTimeSpecificity')) + 1;
    // Refers to the metrics used for the labelling
    if (ind2 < 0) {
      domainTypes = this.get('DOMAIN_ORDERING').slice(ind1);
    } else {
      domainTypes = this.get('DOMAIN_ORDERING').slice(ind1, ind2);
    }

    for (i = 0, len = domainTypes.length; i < len; i++) {
      timeBetween = this.get('times')[domainTypes[i]];
      if (timeBetween <= maxNumberOfLabels) {
        return domainTypes[i];
      }
    }
    return this.get('maxTimeSpecificity');
  }),

  times: Ember.computed('xDomain', function() {
    var ret, domain, start, stop, types, len, i;

    ret = {};
    domain = this.get('xDomain');
    start = domain[0];
    stop = domain[1];
    types = this.get('DOMAIN_ORDERING');

    for (i = 0, len = types.length; i < len; i++) {
      ret[types[i]] = this.numTimeBetween(domainTypeToLongDomainType[types[i]], start, stop);
    }
    return ret;
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
        return (stop - start) / 3600000;
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
    var timeUnit, candidateLabels;

    timeUnit = this.get('intervalSpecificity');
    this.set('xAxisTimeInterval', timeUnit);
    candidateLabels = d3.time[domainTypeToLabellerType[timeUnit]](start, stop);
    if (timeUnit === 'Q') {
      // Normalize quarters
      candidateLabels = this.filterLabelsForQuarters(candidateLabels);
    }
    return this.filterLabels(candidateLabels, timeUnit);
  },

  // So we need to filter and do a little math to see if we are going have any
  // minor ticks in our graph.  We'll be using the maxNumberOfMinorTicks as a
  // control to know if we're filtering or simply relegating the labels to a
  // mere tick.
  filterLabels: function(labelCandidates, domain){
    var maxNumberOfLabels, maxNumberOfMinorTicks, modulo, len;

    maxNumberOfLabels = this.get('maxNumberOfLabels');
    maxNumberOfMinorTicks = this.get('maxNumberOfMinorTicks');
    len = labelCandidates.length;

    if (len > maxNumberOfLabels && typeof(this.customFilterLibrary[domain]) === "function") {
      labelCandidates = this.customFilterLibrary[domain](maxNumberOfLabels, maxNumberOfMinorTicks, labelCandidates);
      len = labelCandidates.length;
    } else if (len > maxNumberOfLabels) {
      // This tells us how many times we can half the results until we're at or
      // below our maxNumberOfLabels threshold. Derived from:
      // len ∕ 2ⁿ ≤ maxNumberOfLabels
      // Math.log(x) / Math.LN2
      modulo = Math.ceil(Math.log(len/(maxNumberOfLabels * (maxNumberOfMinorTicks + 1))) / Math.LN2) + 1;
      labelCandidates = labelCandidates.filter(function(d, i) {
        return i % Math.pow(2, modulo) === 0;
      });
      len = labelCandidates.length;
    }

    // So now we figure out (if we have added space for) the number of minor
    // ticks that will be shown in the presentiation.
    if (maxNumberOfMinorTicks > 0) {
      this.set('minorTickInterval', Math.ceil(len / maxNumberOfLabels));
    }
    return labelCandidates;
  },

  filterLabelsForQuarters: function(dates){
    // Pretty simple; getMonth is a 0 based index of the month.  We do modulo
    // for the time being.
    return dates.filter(function(d) {
      return d.getMonth() % 3 === 0;
    });
  },

  // We have an option of suppling custom filters based on the date type.  This
  // way we can append any special behavior or pruning algorithm to Months that
  // wouldn't be applicable to Weeks
  customFilterLibrary: {},

  // Returns the function which returns the labelled intervals between
  // start and stop for the selected interval.
  tickLabelerFn: Ember.computed('dynamicXAxis', 'maxNumberOfLabels', 'maxNumberOfMinorTicks', 'xAxisVertLabels',
    'xAxisTimeInterval', 'SPECIFICITY_RATIO', 'minTimeSpecificity', 'maxTimeSpecificity',
    function() {
      if (this.get('dynamicXAxis')) {
        return (start, stop) => {
          return this.dynamicXLabelling(start, stop);
        };
      } else {
        return (start, stop) => {
          var domain, candidateLabels;
          domain = this.get('xAxisTimeInterval');
          // So we're going to use the interval we defined as a the maxTimeSpecificity
          this.set('maxTimeSpecificity', domain);
          candidateLabels = d3.time[domainTypeToLabellerType[domain]](start, stop);
          if (domain === 'Q') {
            // Normalize quarters
            candidateLabels = this.filterLabelsForQuarters(candidateLabels);
          }
          return this.filterLabels(candidateLabels, domain);
        };
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
