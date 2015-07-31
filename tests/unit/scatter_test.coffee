moduleForComponent 'scatter', '[Unit] Scatter component',
  needs: [
    'template:components/ember-chart'
  ]
scatterContent = 
  dotRadius: 7
  xValueDisplayName: 'Risk'
  yValueDisplayName: 'Return'
  data: [
    {
      "group": "Energy",
      "xValue": 0.017,
      "yValue": 0.03
    },
    {
      "group": "Industrial Metals",
      "xValue": -0.28,
      "yValue": -0.08
    }
  ]

test 'Scatter chart renders', (assert) ->
  @append()

  assert.equal find('.chart-scatter').length, 1, 'The scatter chart renders'

test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 30, 'right margin exists'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

test 'Margins are the right size when there is a legend', (assert) ->
  @subject scatterContent
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 30, 'right margin exists'
  assert.equal @subject().get('marginBottom'), 30, 'bottom margin for legend'

test 'Margins are the right size when showLegend is false', (assert) ->
  @subject scatterContent
  @append()
  scatterSubj = @subject()
  Ember.run ->
    scatterSubj.set 'showLegend', no

  assert.equal @subject().get('hasLegend'), no, 'has no legend if you dont show'
  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 30, 'right margin exists'
  assert.equal @subject().get('marginBottom'), 0, 'no legend if showLegend is no'
