(function(){;
define('ember', ['exports', 'module'], function(exports, module) {
  module.exports = window.Ember;
});

window.Ember.Charts = Ember.Namespace.create();
window.Ember.Charts.BubbleComponent = require('ember-charts/components/bubble-chart')['default'];
window.Ember.Charts.ChartComponent = require('ember-charts/components/chart-component')['default'];
window.Ember.Charts.HorizontalBarComponent = require('ember-charts/components/horizontal-bar-chart')['default'];
window.Ember.Charts.PieComponent = require('ember-charts/components/pie-chart')['default'];
window.Ember.Charts.ScatterComponent = require('ember-charts/components/scatter-chart')['default'];
window.Ember.Charts.TimeSeriesComponent = require('ember-charts/components/time-series-chart')['default'];
window.Ember.Charts.VerticalBarComponent = require('ember-charts/components/vertical-bar-chart')['default'];
window.Ember.Charts.AxesMixin = require('ember-charts/mixins/axes')['default'];
window.Ember.Charts.Colorable = require('ember-charts/mixins/colorable')['default'];
window.Ember.Charts.FloatingTooltipMixin = require('ember-charts/mixins/floating-tooltip')['default'];
window.Ember.Charts.Formattable = require('ember-charts/mixins/formattable')['default'];
window.Ember.Charts.HasTimeSeriesRuleMixin = require('ember-charts/mixins/has-time-series-rule')['default'];
window.Ember.Charts.Legend = require('ember-charts/mixins/legend')['default'];
window.Ember.Charts.NoMarginChartMixin = require('ember-charts/mixins/no-margin-chart')['default'];
window.Ember.Charts.PieLegend = require('ember-charts/mixins/pie-legend')['default'];
window.Ember.Charts.ResizeHandlerMixin = require('ember-charts/mixins/resize-handler')['default'];
window.Ember.Charts.SortableChartMixin = require('ember-charts/mixins/sortable-chart')['default'];
window.Ember.Charts.TimeSeriesLabeler = require('ember-charts/mixins/time-series-labeler')['default'];})();