# Creates time series labels that are spaced reasonably.
# Provides @formattedTime. Depends on @xDomain and @selectedInterval.
Ember.Charts.TimeSeriesLabeler = Ember.Mixin.create

  # When set to true, ticks are drawn in the middle of an interval. By default,
  # they are drawn at the start of an interval.
  centerAxisLabels: no

  # Interval for ticks on time axis can be:
  # years, months, weeks, days
  # This is used only when a dynamic x axis is not used
  selectedInterval: 'M'

  # [Dynamic X Axis] dynamically set the labelling of the x axis
  dynamicXAxis: no

  # [Dynamic X Axis] a ratio specifying the point at which the time
  # specificity should be increased. The specificity ratio roughly
  # bounds the number of x axis labels:
  #
  # [SPECIFICITY_RATIO*(MAX_LABELS) , MAX_LABELS]
  #
  # Essentially, the higher the ratio (until a max of 1), the closer the
  # number of labels along the x axis is to the max number of labels
  SPECIFICITY_RATIO: 0.7

  # [Dynamic X Axis] The two variables below are relevant only for a
  # dynamic x axis and refer to the minimum and maximum time specificity
  # for the x labels
  # For example, if one wants the specificity to range only from days to
  # quarters, the min and max specificities would be 'D' and 'Q' respectively
  # Allowable values are S, H, D, W, M, Q, Y
  minTimeSpecificity: 'S'
  maxTimeSpecificity: 'Y'

  MONTHS_IN_QUARTER: 3

  # The domain type of the x axis (years, quarters, months...)
  # If the x axis is not dynamically labelled, then the domain type
  # is simply the selectedInterval
  xAxisTimeInterval: Ember.computed (key, value) ->
    domain = if @get 'dynamicXAxis'
    then value ? 'M' # 'M' is just the default domain type
    else @get 'selectedInterval'

    # to maintain consistency, convert the domain type into its
    # single letter representation
    if domain.length > 1
      longDomainTypeToDomainType[domain]
    else
      domain
  .property 'selectedInterval', 'dynamicXAxis'

  # The maximum number of labels which will appear on the x axis of the
  # chart. If there are more labels than this (e.g. if you are
  # charting 13 intervals or more) then the number of labels
  # is contracted to a lower value less than or equal to the
  # max number of labels
  #
  # The caller of the time series chart should ideally set this to a value
  # proportional to the width of the graphical panel
  maxNumberOfLabels: 10

  # The ordering of each time domain from most specific to least specific
  DOMAIN_ORDERING: ['S','H','D','W','M','Q','Y']

  # This is the number of subdivisions between each major tick on the x
  # axis. Minor ticks have no labels. For instance, if your maxNumberOfLabels
  # is 10, and you are charting 20 weeks, there will be 10
  # major ticks with one subivision (minor ticks) between.
  numberOfMinorTicks: Ember.computed ->
    labelledTicks = @get 'labelledTicks'
    [start, stop] = @get 'xDomain'
    domain = @get('xAxisTimeInterval')

    interval = if domain is 'Q' then @MONTHS_IN_QUARTER else 1
    # All the ticks which occur between start and stop (including
    # unlabelled ticks)
    allTicks = d3.time[domainTypeToLabellerType[domain]](start, stop, interval)

    return 0 if (labelledTicks.length < 2)

    # equality for ticks
    findTick = (tick) ->
      (x) -> +x is +tick

    # Returns the difference between where the second labelled value
    # occurs in the unlabelled array and where the first occurs - e.g. in
    # the above example 3 - 1 - 1 => 1 subdivision tick.
    secondIndex = _.findIndex(allTicks, findTick(labelledTicks[1]))
    firstIndex = _.findIndex(allTicks, findTick(labelledTicks[0]))
    secondIndex - firstIndex - 1
  .property 'xDomain', 'xAxisTimeInterval', 'labelledTicks'

  #  This is the set of ticks on which labels appear.
  labelledTicks: Ember.computed ->
    domain = @get 'xDomain'
    ticks = @get('tickLabelerFn')(domain[0], domain[1])
    unless @get 'centerAxisLabels'
      ticks
    else
      count = 1
      interval = @domainTypeToLongDomainTypeSingular (@get 'xAxisTimeInterval')
      if interval is 'quarter'
        count = @MONTHS_IN_QUARTER
        interval = 'month'
      (@_advanceMiddle(tick, interval, count) for tick in ticks)
  .property 'xDomain', 'centerAxisLabels', 'xAxisTimeInterval'

  _advanceMiddle: (time, interval, count) ->
    new Date (time = time.getTime()/2 + d3.time[interval].offset(time, count)/2)

  # The amount of time between a start and a stop in the specified units
  # Note that the d3 time library was not used to calculate all of these times
  # in order to improve runtime. This comes at the expense of accuracy, but for
  # the applications of timeBetween, it is not too important
  numTimeBetween : (timeInterval, start, stop) ->
    switch timeInterval
      when 'seconds' then (stop - start)/1000
      when 'hours' then (stop - start)/1000
      when 'days' then (stop - start)/86400000
      when 'weeks' then  d3.time.weeks(start, stop).length
      when 'months' then d3.time.months(start, stop).length
      when 'quarters' then d3.time.months(start, stop).length/@MONTHS_IN_QUARTER
      when 'years' then d3.time.years(start, stop).length

  # The labeller type used to create the labels for each domain type
  # Note that quarters uses a month labeller to create the labels
  domainTypeToLabellerType =
    'S': 'seconds'
    'H': 'hours'
    'D': 'days'
    'W': 'weeks'
    'M': 'months'
    'Q': 'months'
    'Y': 'years'

  # The lengthened representation for each domain type. This is different from
  # domainTypeToLabellerType
  domainTypeToLongDomainType =
    'S': 'seconds'
    'H': 'hours'
    'D': 'days'
    'W': 'weeks'
    'M': 'months'
    'Q': 'quarters'
    'Y': 'years'

  domainTypeToLongDomainTypeSingular: (timeInterval) ->
    domainType = domainTypeToLongDomainType[timeInterval]
    domainType.substring(0, domainType.length - 1)

  longDomainTypeToDomainType =
    'seconds': 'S'
    'hours': 'H'
    'days': 'D'
    'weeks': 'W'
    'months': 'M'
    'quarters': 'Q'
    'years': 'Y'

  # Dynamic x labelling tries to intelligently limit the number of labels
  # along the x axis to a specified limit. In order to do this, time
  # specificity is callibrated (e.g. for a range of 2 years, instead of having
  # the labels be in years, the specificity is increased to quarters)
  # If the minTimeSpecificity or maxTimeSpecificity are set, then the labels
  # are limited to fall between the time units between these bounds.
  dynamicXLabelling: (start,stop) ->
    ind1 = @get('DOMAIN_ORDERING').indexOf(@get 'minTimeSpecificity')
    ind2 = @get('DOMAIN_ORDERING').indexOf(@get 'maxTimeSpecificity')
    
    # Refers to the metrics used for the labelling
    domainTypes = @get('DOMAIN_ORDERING')[ind1..ind2]

    # The labeller type to create the labels for each metric
    labellerTypes =
      domainTypeToLabellerType[domainType] for domainType in domainTypes

    #The time span in various metrics
    times = (@numTimeBetween(domainTypeToLongDomainType[d], start, stop) for d in domainTypes)

    labels = null
    maxNumberOfLabels = (@get 'maxNumberOfLabels')

    for timeBetween, i in times
      interval = null
      if timeBetween < maxNumberOfLabels
        # quarter labels are calculated by simply getting month labels with 3
        # month gaps
        interval = if domainTypes[i] is 'Q' then @MONTHS_IN_QUARTER else 1
      else if domainTypes[i] is @get('maxTimeSpecificity') or
      times[i+1] < maxNumberOfLabels*(@get 'SPECIFICITY_RATIO')
        if domainTypes[i] is 'Q'
          interval = Math.ceil(@MONTHS_IN_QUARTER*timeBetween/maxNumberOfLabels)
        else
          interval = Math.ceil(timeBetween/maxNumberOfLabels)
      if interval?
        @set 'xAxisTimeInterval', domainTypes[i]
        labels = d3.time[labellerTypes[i]](start,stop)
        .filter((d, i) -> not (i % interval))
        break
    labels

  # Returns the function which returns the labelled intervals between
  # start and stop for the selected interval.
  tickLabelerFn: Ember.computed ->
    if @get 'dynamicXAxis'
      ((start, stop) => @dynamicXLabelling(start, stop))
    else
      ((start, stop) =>
        domain = @get 'xAxisTimeInterval'
        timeBetween =
          @numTimeBetween(domainTypeToLongDomainType[domain], start, stop)
        
        # quarters is a special case
        if domain is 'Q'
          if timeBetween > @get('maxNumberOfLabels')
            # if we have too many quarters then we only display quarter labels
            # on years
            d3.time.years(start, stop)
          else
            d3.time.months(start, stop, @MONTHS_IN_QUARTER)
        else
          interval = if timeBetween > @get('maxNumberOfLabels')
          then Math.ceil(timeBetween / @get('maxNumberOfLabels'))
          else 1
          d3.time[domainTypeToLabellerType[domain]](start, stop)
          .filter((d, i) -> not (i % interval)))
  .property 'dynamicXAxis', 'maxNumberOfLabels', 'xAxisTimeInterval',
    'SPECIFICITY_RATIO', 'minTimeSpecificity', 'maxTimeSpecificity'

  quarterFormat: (d) ->
    month = d.getMonth() % 12
    prefix = ""
    if month < 3
      prefix = 'Q1'
    else if month < 6
      prefix = 'Q2'
    else if month < 9
      prefix = 'Q3'
    else
      prefix = 'Q4'
    suffix =
      d3.time.format('%Y') (d)

    prefix + ' ' + suffix

  # See https://github.com/mbostock/d3/wiki/Time-Formatting
  formattedTime: Ember.computed ->
    switch @get 'xAxisTimeInterval'
      when 'years','Y' then d3.time.format('%Y')
      when 'quarters' , 'Q'  then @quarterFormat
      when 'months' , 'M' then d3.time.format('%b \'%y')
      when 'weeks' , 'W'  then d3.time.format('%-m/%-d/%y')
      when 'days' , 'D' then d3.time.format('%-m/%-d/%y')
      when 'hours' , 'H' then d3.time.format('%H:%M:%S')
      when 'seconds' , 'S' then d3.time.format('%H:%M:%S')
      else d3.time.format('%Y')
  .property 'xAxisTimeInterval'
