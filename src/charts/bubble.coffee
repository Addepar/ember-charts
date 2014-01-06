Ember.Charts.BubbleComponent = Ember.Charts.ChartComponent.extend(
  Ember.Charts.FloatingTooltipMixin,
  classNames: ['chart-bubble']

  # ----------------------------------------------------------------------------
  # Bubble Chart Options
  # ----------------------------------------------------------------------------
  # used when setting up force and
  # moving around nodes
  # TODO(tony) camel case
  layoutGravity: -0.01
  damper: 0.1

  # Charge function that is called for each node.
  # Charge is proportional to the diameter of the
  # circle (which is stored in the radius attribute
  # of the circle's associated data.
  # This is done to allow for accurate collision
  # detection with nodes of different sizes.
  # Charge is negative because we want nodes to
  # repel.
  # Dividing by 8 scales down the charge to be
  # appropriate for the visualization dimensions.
  charge: Ember.computed ->
    (d) -> -Math.pow(d.radius, 2.0) / 8

  # Getters for formatting human-readable labels from provided data
  formatValue: d3.format('.2s')
  formatValueLong: d3.format(',.r')

  # ----------------------------------------------------------------------------
  # Tooltip Configuration
  # ----------------------------------------------------------------------------

  showDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>

      # Do hover detail style stuff here
      d3.select(element).classed('hovered', yes)

      # Show tooltip
      formatValue = @get 'formatValue'
      # Line 1
      content = "<span class=\"tip-label\">#{data.label}</span>"
      # Line 2
      content +="<span class=\"name\">#{@get 'tooltipValueDisplayName'}: </span>"
      content +="<span class=\"value\">#{formatValue(data.value)}</span>"
      @showTooltip(content, d3.event)
  .property 'isInteractive'

  hideDetails: Ember.computed ->
    return Ember.K unless @get('isInteractive')
    (data, i, element) =>
      # Undo hover style stuff
      d3.select(element).classed('hovered', no)
      # Hide Tooltip
      @hideTooltip()
  .property 'isInteractive'

  # ----------------------------------------------------------------------------
  # Data
  # ----------------------------------------------------------------------------

  renderVars: ['selectedSeedColor']

  # Sqrt scaling between data and radius
  radiusScale: Ember.computed ->
    # use the max total_amount in the data as the max in the scale's domain
    maxAmount = d3.max(@data, (d) -> d.value)
    maxRadius = d3.min([@get('width'),@get('height')]) / 7
    # TODO(tony): get rid of hard coded values
    d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([2, maxRadius])
  .property 'data', 'width', 'height'

  nodeData: Ember.computed ->
    data = @get 'data'
    return [] if Ember.isEmpty(data)

    radiusScale = @get 'radiusScale'
    nodes = data.map (d) =>
      radius: radiusScale d.value
      value: d.value
      label: d.label
      id: d.label
      x: Math.random() * @get('width') / 2
      y: Math.random() * @get('height') / 2
    nodes.sort (a,b) -> b.value - a.value
    nodes
  .property 'radiusScale'

  finishedData: Ember.computed.alias 'nodeData'

  numColorSeries: Ember.computed.alias 'finishedData.length'

  drawChart: ->
    @updateVis()

  updateVis: ->
    vis = @get 'viewport'
    nodes = @get 'nodeData'
    showDetails = @get 'showDetails'
    hideDetails = @get 'hideDetails'
    fill_color = @get 'getSeriesColor'

    circles = vis.selectAll("circle")
      .data(nodes, (d) -> d.id)

    circles.enter().append("circle")
      # radius will be set to 0 initially.
      # see transition below
      .attr("r", 0)
      .attr("id", (d) -> "bubble_#{d.id}")
      .on("mouseover", (d,i) -> showDetails(d,i,this))
      .on("mouseout", (d,i) -> hideDetails(d,i,this))

    # Fancy transition to make bubbles appear, ending with the
    # correct radius
    circles.transition().duration(2000).attr("r", (d) -> d.radius)

    circles
      .attr("fill", fill_color)
      .attr("stroke-width", 2)
      .attr("stroke", (d,i) -> d3.rgb(fill_color(d,i)).darker())

    circles.exit().remove()

    # Moves all circles towards the @center
    # of the visualization
    move_towards_center = (alpha) =>
      center = {x: @get('width') / 2, y: @get('height') / 2}
      (d) =>
        d.x = d.x + (center.x - d.x) * (@get('damper') + 0.02) * alpha
        d.y = d.y + (center.y - d.y) * (@get('damper') + 0.02) * alpha

    # Start the forces
    force = d3.layout.force()
      .nodes(nodes).size([@get('width'), @get('height')])

    # Display all
    force.gravity(@get('layoutGravity'))
      .charge(@get('charge'))
      .friction(0.9)
      .on "tick", (e) ->
        circles.each(move_towards_center(e.alpha))
          .attr("cx", (d) -> d.x)
          .attr("cy", (d) -> d.y)
    force.start()

    vis.selectAll(".years").remove()

)

Ember.Handlebars.helper('bubble-chart', Ember.Charts.BubbleComponent)
