# Creates time series labels that are spaced reasonably.
# Provides @formattedTime. Depends on @xDomain and @selectedInterval.

Ember.Charts.TimeSeriesLabeler = Ember.Mixin.create

  # Interval for ticks on time axis can be:
  # years, months, weeks, days
  selectedInterval: 'M'

  # The maximum number of labels which will appear on the x axis of the
  # chart. If there would be more labels than this (e.g. if you are
  # charting 13 intervals or more) then we use the "labelled" functions
  # below to reduce the number of labels in a natural way.
  maxNumberOfLabels: 10

  # This is the number of subdivisions between each major tick on the x
  # axis. Minor ticks have no labels. For instance, if your maxNumberOfLabels
  # is 10, and you are charting 20 weeks, there will be 10
  # major ticks with one subivision (minor ticks) between.
  numberOfMinorTicks: Ember.computed ->
    labelledTicks = @get 'labelledTicks'
    [start, stop] = @get 'xDomain'

    # All the ticks which occur between start and stop (including
    # unlabelled ticks)
    allTicks = switch @get('selectedInterval')
      when 'years', 'Y' then d3.time.years(start, stop)
      when 'quarters', 'Q' then d3.time.months(start, stop, 3)
      when 'months', 'M' then @monthsBetween(start, stop)
      when 'weeks' , 'W'  then @weeksBetween(start, stop)
      when 'seconds', 'S' then @secondsBetween(start, stop)

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
  .property 'xDomain', 'selectedInterval'

  #  This is the set of ticks on which labels appear.
  labelledTicks: Ember.computed ->
    domain = @get 'xDomain'
    @get('getLabelledTicks')(domain[0], domain[1])
  .property 'xDomain'

  # the years which should be labelled
  labelledYears: (start, stop) ->
    years = d3.time.years(start, stop)

    # if we have too many labelled years then we reduce to the maximum
    # number of years labelled such that they are uniformly distributed
    # in the range
    if years.length > @get('maxNumberOfLabels')
      skipVal = Math.ceil(years.length / @get('maxNumberOfLabels'))
      d3.time.years(start, stop, skipVal)
    else
      years

  # the quarters which should be labelled
  labelledQuarters: (start, stop) ->
    quarters = d3.time.months(start, stop, 3)

    # if we have too many quarters then we only display quarter labels
    # on years
    if quarters.length > @get('maxNumberOfLabels')
      @labelledYears(start, stop)
    else
      quarters

  monthsBetween: (start, stop, skip = 1) ->
    d3.time.months(start, stop).filter((d, i) -> !(i % skip))

  # the months which should be labelled
  labelledMonths: (start, stop) ->
    months = @monthsBetween(start, stop)

    # if we have too many months then we reduce to the maximum number of
    # months labelled such that they are uniformly distributed in the
    # range
    if months.length > @get('maxNumberOfLabels')
      skipVal = Math.ceil(months.length / @get('maxNumberOfLabels'))
      @monthsBetween(start, stop, skipVal)
    else
      months

  weeksBetween: (start, stop, skip = 1) ->
    d3.time.weeks(start, stop).filter((d, i) -> !(i % skip))

  secondsBetween: (start, stop, skip = 1) ->
    d3.time.seconds(start, stop).filter((d, i) -> !(i % skip))

  # the weeks which should be labelled
  labelledWeeks: (start, stop) ->
    weeks = @weeksBetween(start, stop)

    # if we have too many weeks then we reduce to the maximum number of
    # weeks labelled such that they are uniformly distributed in the
    # range
    if weeks.length > @get('maxNumberOfLabels')
      skipVal = Math.ceil(weeks.length / @get('maxNumberOfLabels'))
      @weeksBetween(start, stop, skipVal)
    else
      weeks

  # Returns the function which returns the labelled intervals between
  # start and stop for the selected interval.
  getLabelledTicks: Ember.computed ->
    switch @get 'selectedInterval'
      when 'years', 'Y' then ((start, stop) => @labelledYears(start, stop))
      when 'quarters', 'Q' then ((start, stop) => @labelledQuarters(start,stop))
      when 'months', 'M' then ((start, stop) => @labelledMonths(start, stop))
      when 'weeks' , 'W'  then ((start, stop) => @labelledWeeks(start, stop))
      when 'days' , 'D' then d3.time.days
      when 'seconds', 'S' then ((start, stop) => @labelledSeconds(start, stop))
      else d3.time.years
  .property 'maxNumberOfLabels', 'selectedInterval'

  quarterFormat: (d) ->
    prefix =
      switch d.getMonth() % 12
        when 0 then 'Q1'
        when 3 then 'Q2'
        when 6 then 'Q3'
        when 9 then 'Q4'
    suffix =
      d3.time.format('%Y') (d)

    prefix + ' ' + suffix

  # See https://github.com/mbostock/d3/wiki/Time-Formatting
  formattedTime: Ember.computed ->
    switch @get 'selectedInterval'
      when 'years','Y' then d3.time.format('%Y')
      when 'quarters' , 'Q'  then @quarterFormat
      when 'months' , 'M' then d3.time.format("%b '%y")
      when 'weeks' , 'W'  then d3.time.format('%-m/%-d/%y')
      when 'days' , 'D' then d3.time.format('%a')
      when 'seconds' , 'S' then d3.time.format('%M : %S')
      else d3.time.format('%Y')
  .property 'selectedInterval'

