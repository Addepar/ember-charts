require 'build/src/charts/templates'
require 'dependencies/ember-addepar-mixins/resize_handler'
require 'dependencies/ember-addepar-mixins/style_bindings'

Ember.Charts = Ember.Namespace.create()
Ember.Charts.VERSION = '0.3.0'

Ember.libraries?.register 'Ember Charts', Ember.Charts.VERSION

require 'build/src/charts/helpers'
require 'build/src/charts/colorable'
require 'build/src/charts/formattable'
require 'build/src/charts/axes'
require 'build/src/charts/floating_tooltip'
require 'build/src/charts/time_series_rule'
require 'build/src/charts/time_series_labeler'
require 'build/src/charts/legend'
require 'build/src/charts/pie_legend'
require 'build/src/charts/chart'
require 'build/src/charts/sortable_chart_mixin'

require 'build/src/charts/horizontal_bar'
require 'build/src/charts/pie'
require 'build/src/charts/vertical_bar'
require 'build/src/charts/scatter'
require 'build/src/charts/time_series'
require 'build/src/charts/bubble'
