/* jshint node: true */
var Writer = require('broccoli-writer');
var fs = require('fs');
var path = require('path');
var Promise = require('RSVP').Promise;
var walk = require('walk-sync');

// TODO(azirbel): Log ember version and register with Ember.libraries?
var Globals = function (inputTree) {
  var options = {};
  if (!(this instanceof Globals)) {
    return new Globals(inputTree, options);
  }
  this.inputTree = inputTree;
  this.outputPrefix = 'ember-charts';

  // The old global names aren't consistent: some are on Ember.Charts, some on
  // Ember.AddeparMixins, and some just on Ember. For backwards-compatibility
  // we need to maintain the same old names.
  this.globalNameMapping = {
    'ember-charts/components/bubble-chart': 'Ember.Charts.BubbleComponent',
    'ember-charts/components/chart-component': 'Ember.Charts.ChartComponent',
    'ember-charts/components/horizontal-bar-chart': 'Ember.Charts.HorizontalBarComponent',
    'ember-charts/components/pie-chart': 'Ember.Charts.PieComponent',
    'ember-charts/components/scatter-chart': 'Ember.Charts.ScatterComponent',
    'ember-charts/components/time-series-chart': 'Ember.Charts.TimeSeriesComponent',
    'ember-charts/components/vertical-bar-chart': 'Ember.Charts.VerticalBarComponent',

    'ember-charts/mixins/axes': 'Ember.Charts.AxesMixin',
    'ember-charts/mixins/colorable': 'Ember.Charts.Colorable',
    'ember-charts/mixins/floating-tooltip': 'Ember.Charts.FloatingTooltipMixin',
    'ember-charts/mixins/formattable': 'Ember.Charts.Formattable',
    'ember-charts/mixins/has-time-series-rule': 'Ember.Charts.HasTimeSeriesRuleMixin',
    'ember-charts/mixins/legend': 'Ember.Charts.Legend',
    'ember-charts/mixins/no-margin-chart': 'Ember.Charts.NoMarginChartMixin',
    'ember-charts/mixins/pie-legend': 'Ember.Charts.PieLegend',
    'ember-charts/mixins/resize-handler': 'Ember.Charts.ResizeHandlerMixin',
    'ember-charts/mixins/sortable-chart': 'Ember.Charts.SortableChartMixin',
    'ember-charts/mixins/time-series-labeler': 'Ember.Charts.TimeSeriesLabeler',
  };
};

Globals.prototype = Object.create(Writer.prototype);
Globals.prototype.constructor = Globals;

Globals.prototype.write = function(readTree, destDir) {
  var _this = this;

  this.addLinesToOutput = function(output, lines) {
    lines.forEach(function(line) {
      output.push(line);
    });
  };

  return new Promise(function(resolve) {
    readTree(_this.inputTree).then(function(srcDir) {
      var output = [
        "define('ember', ['exports', 'module'], function(exports, module) {",
        "  module.exports = window.Ember;",
        "});",
        "",
        "window.Ember.Charts = Ember.Namespace.create();"];

      // Get a listing of all hbs files from inputTree and make sure each one
      // is registered on Ember.TEMPLATES
      var templateFiles = walk(srcDir).filter(function(f) {
        return /^templates.*js$/.test(f);
      });
      templateFiles.forEach(function(filename) {
        // Add ember-charts namespace and remove .js extension
        var filePath = 'ember-charts/' + filename.slice(0, -3);
        var parts = filePath.split(path.sep);
        output.push("window.Ember.TEMPLATES['" +
            parts.slice(2).join('/') + "']" +
            " = require('" + filePath + "')['default'];");
      });

      // Classes to register on the application's container. We need this
      // because we used to refer to views by their full, global name
      // (Ember.Charts.HeaderTableContainer), but now we use the view name
      // (header-table-container). So Ember needs to know where to find those
      // views.
      var toRegister = [];

      // Define globals and register on the container
      for (var key in _this.globalNameMapping) {
        // Define the global object, like Ember.Charts.EmberTableComponent = ...
        output.push("window." + _this.globalNameMapping[key] +
            " = require('" + key + "')['default'];");
        // Register on the container. We only need to register views and
        // components.
        var type = key.split('/')[1].replace(/s$/, '');
        if (type === 'view' || type === 'component') {
          toRegister.push({
            type: type,
            moduleName: key,
            containerName: key.split('/')[2]
          });
        }
      }

      // On loading the ember application, register all views and components on
      // the application's container
      _this.addLinesToOutput(output, [
        "Ember.onLoad('Ember.Application', function(Application) {",
          "Application.initializer({",
            "name: 'ember-charts',",
            "initialize: function(container) {"
      ]);
      _this.addLinesToOutput(output, toRegister.map(function(item) {
        return "container.register('" + item.type + ':' + item.containerName +
            "', require('" + item.moduleName + "')['default']);";
        })
      );
      _this.addLinesToOutput(output, [
            "}",
          "});",
        "});"
      ]);

      // For backwards compatibility, set a layoutName so the component
      // actually renders
      _this.addLinesToOutput(output, [
        "Ember.Charts.ChartComponent.reopen({",
        "layoutName: 'components/ember-charts'",
        "});"
      ]);

      fs.writeFileSync(path.join(destDir, 'globals-output.js'),
          output.join("\n"));
      resolve();
    });
  });
};

module.exports = Globals;
