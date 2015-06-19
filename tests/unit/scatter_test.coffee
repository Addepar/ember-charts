moduleForComponent 'scatter', '[Unit] Scatter component',
  needs: [
    'template:components/ember-chart'
  ]

test 'Scatter chart renders', (assert) ->
  @append()

  assert.equal find('.chart-scatter').length, 1, 'The scatter chart renders'
test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 30, 'right margin exists'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

