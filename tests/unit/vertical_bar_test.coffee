moduleForComponent 'vertical_bar', '[Unit] Vertical bar component',
  needs: [
    'template:components/ember-chart'
  ]

label1 = "Label 1"
label2 = "Label 2"
label3 = "Label 3"
stackedBarContent =
  stackBars: yes
  data: [
      label: label1,
      group: "Group 1",
      value: 20
    ,
      label: label2,
      group: "Group 2",
      value: 32
    ,
      label: label3,
      group: "Group 3",
      value: 4
    ,
      label: label3,
      group: "Group 3",
      value: 16
    ,
      label: label2,
      group: "Group 2",
      value: 17
  ]

test 'Vertical bar renders', (assert) ->
  @append()

  assert.equal find('.chart-vertical-bar').length, 1, 'The vertical bar chart renders'

test 'Margins are the right size', (assert) ->
  @append()

  assert.equal @subject().get('marginLeft'), 0, 'no left margin'
  assert.equal @subject().get('marginRight'), 0, 'no right margin'
  assert.equal @subject().get('marginBottom'), 0, 'no bottom margin'

test 'Stacked bars Are grouped correctly', (assert) ->
  @subject stackedBarContent
  @append()

  labelIDMapping = @subject().get('labelIDMapping')
  assert.equal find(".grouping-#{labelIDMapping[label1]}").length, 1,
    'label1 has one section'
  assert.equal find(".grouping-#{labelIDMapping[label2]}").length, 2,
    'label2 has two sections'
  assert.equal find(".grouping-#{labelIDMapping[label3]}").length, 2,
    'label3 has two sections'
