moduleForComponent 'pie', '[Unit] Pie chart component',
  needs: [
    'template:components/ember-chart'
  ]

test 'it renders', (assert) ->
  @append()

  assert.equal find('.chart-pie').length, 1, 'The pie chart renders'
