#
# Router
################################################################################

App.Router.map ->
  @route 'license'
  @resource 'emberCharts', path: '/ember-charts', ->
    @route 'overview'
    @route 'documentation'
    @route 'pie'
    @route 'horizontal_bar'
    @route 'vertical_bar'
    @route 'time_series'
    @route 'scatter'
    # @route 'bubble'

App.IndexRoute = Ember.Route.extend
  redirect: ->
    @transitionTo 'emberCharts.overview'

App.EmberChartsIndexRoute = Ember.Route.extend
  redirect: ->
    @transitionTo 'emberCharts.overview'

App.EmberChartsOverviewRoute = Ember.Route.extend
  activate: ->
    controller = @controllerFor('emberCharts')
    controller.set 'showLargeHero', yes

  deactivate: ->
    controller = @controllerFor('emberCharts')
    controller.set 'showLargeHero', no
