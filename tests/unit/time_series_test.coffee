moduleForComponent 'time_series', '[Unit] Time series component',
  needs: [
    'template:components/ember-chart'
  ]

test 'Time series chart renders', (assert) ->
  @append()

  assert.equal find('.chart-time-series').length, 1, 'The time series chart renders'
test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

