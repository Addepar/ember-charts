# Dependencies
require 'dependencies/bootstrap/js/bootstrap'
require 'dependencies/ember-addepar-mixins/resize_handler'
require 'dependencies/ember-addepar-mixins/style_bindings'
require 'dist/ember-charts'

window.App = Ember.Application.create
  LOG_TRANSITIONS: true

# Data
require 'build/app/data/data'

# Controllers
require 'build/app/controllers/slide'
require 'build/app/controllers/time_series'
require 'build/app/controllers/horizontal_bar'
require 'build/app/controllers/vertical_bar'
require 'build/app/controllers/pie'
require 'build/app/controllers/scatter'
require 'build/app/controllers/bubble'

# Views
# None yet

# Router
require 'build/app/router'

# App
require 'build/app/main'

# Compiled Handlebars templates
require 'build/app/templates'
