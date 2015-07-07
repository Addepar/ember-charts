moduleForComponent 'time_series', '[Unit] Time series component',
  needs: [
    'template:components/ember-chart'
  ]

timeSeriesContent =
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

  assert.equal find('.chart-time-series').length, 1, 'The time series chart renders'

test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

test 'Margins are the right size when there is a legend', (assert) ->
  @subject timeSeriesContent
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 30, 'bottom margin for legend'
