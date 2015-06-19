moduleForComponent 'vertical_bar', '[Unit] Vertical bar component',
  needs: [
    'template:components/ember-chart'
  ]

test 'Vertical bar renders', (assert) ->
  @append()

  assert.equal find('.chart-vertical-bar').length, 1, 'The vertical bar chart renders'
test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

