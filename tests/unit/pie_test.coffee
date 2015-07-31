moduleForComponent 'pie', '[Unit] Pie chart component',
  needs: [
    'template:components/ember-chart'
  ]
pieContent = 
  maxRadius: 100
  maxSlicePercent: 8
  minSlicePercent: 2
  data: [
    {
      "label": "Label 1",
      "value": 20
    },
    {
      "label": "Label 2",
      "value": 22
    },
    {
      "label": "Label 3",
      "value": 18
    },
    {
      "label": "Label 4",
      "value": 2
    },
    {
      "label": "Label 5",
      "value": 6
    },
    {
      "label": "Label 6",
      "value": 26
    },
    {
      "label": "Label 7",
      "value": 18
    },
    {
      "label": "Label 8",
      "value": 150
    },
    {
      "label": "Label 9",
      "value": 160
    },
    {
      "label": "Label 10",
      "value": 200
    },
    {
      "label": "Label 11",
      "value": 14
    },
    {
      "label": "Label 12",
      "value": 31
    },
    {
      "label": "Label 13",
      "value": 44
    },
    {
      "label": "Label 14",
      "value": 30
    },
    {
      "label": "Label 15",
      "value": 62
    },
    {
      "label": "Label 16",
      "value": 75
    },
    {
      "label": "Label 17",
      "value": 114
    },
    {
      "label": "Label 18",
      "value": 19
    }
  ]

test 'Pie chart renders', (assert) ->
  @append()

  assert.equal find('.chart-pie').length, 1, 'The pie chart renders'
test 'Legend renders', (assert) ->
  @subject pieContent
  @append()
  debugger
  assert.equal find('.legend').length, 1, 'Has a legend for other slice'
test 'Margins are the right size when showLegend is no', (assert) ->
  @subject pieContent
  @append()
  pieSubject = @subject()
  Ember.run ->
    pieSubject.set 'showLegend', no

  assert.equal @subject().get('hasLegend'), no,
    'if showLegend is no, a legend is not made'
