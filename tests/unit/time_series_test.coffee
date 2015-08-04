moduleForComponent 'time_series', '[Unit] Time series component',
  needs: [
    'template:components/ember-chart'
  ]

timeSeriesContentBarNonDynamic =
  barPadding: 0
  barGroupPadding: 0
  barLeftOffset: 0
  barData: [
      time: d3.time.format('%Y-%m-%d').parse "2013-05-15"
      label: "Software & Programming"
      value: 63540
      type: "money"
    ,
      time: d3.time.format('%Y-%m-%d').parse "2013-05-15"
      label: "Telecommunication"
      value: 31005
      type: "money"
    ,
      time: d3.time.format('%Y-%m-%d').parse "2013-05-15"
      label: "Financial analytics software"
      value: 69669
      type: "money"
    ,
      time: d3.time.format('%Y-%m-%d').parse "2013-06-15"
      label: "Software & Programming"
      value: 74860
      type: "money"
    ,
      time: d3.time.format('%Y-%m-%d').parse "2013-06-15"
      label: "Telecommunication"
      value: 14513
      type: "money"
    ,
      time: d3.time.format('%Y-%m-%d').parse "2013-06-15"
      label: "Financial analytics software"
      value: 68344
      type: "money"
  ]

test 'Time series chart renders', (assert) ->
  @append()

  assert.equal find('.chart-time-series').length, 1, 'The time series
    chart renders'

test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

test 'Margins are the right size when there is a legend', (assert) ->
  @subject timeSeriesContentBarNonDynamic
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 30, 'bottom margin for legend'

test 'Margins are the right size when showLegend is no', (assert) ->
  @subject timeSeriesContentBarNonDynamic
  @append()
  timeSubject = @subject()
  Ember.run ->
    timeSubject.set 'showLegend', no

  assert.equal @subject().get('hasLegend'), no, 'has no legend if you dont show'
  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0,
    'no bottom margin if showLegend is no'

timeSeriesContentLineNonDynamic =
  yAxisFromZero: no
  dynamicXAxis: no
  selectedInterval: ''
  minTimeSpecificity: 'S'
  maxTimeSpecificity: 'Y'
  lineData: []

test 'The number of labels should be equal to the number of day intervals',
(assert) ->
  content = $.extend({}, timeSeriesContentLineNonDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-1"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2011-04-10"
      value: 2
  ]
  content.selectedInterval = 'D'
  # The amount the number of labels can be off by to still be correct
  BUFFER = 3
  @subject content

  maxLabels = @subject().get('maxNumberOfLabels')
  if maxLabels < 9
    # this case occurs if the graphical window is too narrow and
    # the number of ticks defaults to the number of x ticks
    assert.equal @subject().get('labelledTicks').length <= maxLabels,
      true, 'The number of labelled days is less than or equal to
      the max number of labels'
  else
    assert.equal Math.abs(@subject().get('labelledTicks').length - 9) <= BUFFER,
      true, 'The number of labelled days is correct'

test 'The number of labels should be equal to the number of month intervals', 
(assert) ->
  content = $.extend({}, timeSeriesContentLineNonDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-1"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2011-12-07"
      value: 2
  ]
  content.selectedInterval = 'M'
  # The amount the number of labels can be off by to still be correct
  BUFFER = 3
  @subject content

  maxLabels = @subject().get('maxNumberOfLabels')
  if maxLabels < 9
    # this case occurs if the graphical window is too narrow an
    # the number of ticks defaults to the number of x ticks
    assert.equal @subject().get('labelledTicks').length <= maxLabels,
      true, 'The number of labelled months is less than or equal to
      the max number of labels'
  else
    assert.equal Math.abs(@subject().get('labelledTicks').length - 9) <= BUFFER,
      true, 'The number of labelled months is correct'


# Put a small time interval like days with a ridiculously long time span like
# 30 years and make sure the number of labels doesn't exceed the max number
# of labels
test 'The number of labels should not exceed the max number of labels',
(assert) ->
  content = $.extend({}, timeSeriesContentLineNonDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-1"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2040-12-07"
      value: 2
  ]
  content.selectedInterval = 'D'
  @subject content

  maxLabels = @subject().get('maxNumberOfLabels')
  assert.equal @subject().get('labelledTicks').length <= maxLabels,
    true, 'The number of labels does not exceed the max number of labels'

timeSeriesContentLineDynamic =
  yAxisFromZero: no
  dynamicXAxis: yes
  maxNumberOfLabels: 1
  lineData: []

test '[Dynamic X Axis] Number of labels does not exceed the maximum number of
labels for a dynamic x axis', (assert) ->
  content = $.extend({}, timeSeriesContentLineDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-16"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2011-09-16"
      value: 2
    ,
      time: d3.time.format('%Y-%m-%d').parse "2011-10-16"
      value: 3
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-01-16"
      value: 4
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-02-16"
      value: 5
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-03-16"
      value: 6
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-04-16"
      value: 7
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-07-16"
      value: 8
    ,
      time: d3.time.format('%Y-%m-%d').parse "2012-08-16"
      value: 9
    ,
      time: d3.time.format('%Y-%m-%d').parse "2015-04-16"
      value: 10
  ]

  for max in [2...100]
    content.maxNumberOfLabels = max
    @subject content
    assert.equal @subject().get('labelledTicks').length <= max, true,
    'Less than ' + max + ' labels'

test '[Dynamic X Axis] Labels cannot be more specific than the
  minimum time specificity', (assert) ->
  content = $.extend({}, timeSeriesContentLineDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-16"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2011-04-17"
      value: 2
  ]
  content.maxNumberOfLabels = 20
  content.minTimeSpecificity = 'M'
  content.maxTimeSpecificity = 'Y'
  @subject content
  domainOrder = @subject().get('DOMAIN_ORDERING')

  ind = domainOrder.indexOf('M')
  ind2 = domainOrder.indexOf(@subject().get('xAxisTimeInterval'))
  assert.equal ind <= ind2, true,
  'The labels are not more specific than the min time specificity'


test '[Dynamic X Axis] Labels cannot be less specific
  than the maximum time specificity', (assert) ->
  content = $.extend({}, timeSeriesContentLineDynamic)
  content.lineData = [
      time: d3.time.format('%Y-%m-%d').parse "2011-04-16"
      value: 1
    ,
      time: d3.time.format('%Y-%m-%d').parse "2014-04-17"
      value: 2
  ]
  content.maxNumberOfLabels = 2
  content.minTimeSpecificity = 'S'
  content.maxTimeSpecificity = 'D'

  @subject content
  domainOrder = @subject().get('DOMAIN_ORDERING')

  ind = domainOrder.indexOf('D')
  ind2 = domainOrder.indexOf(@subject().get('xAxisTimeInterval'))
  assert.equal ind >= ind2, true,
  'The labels are not less specific than the max time specificity'

