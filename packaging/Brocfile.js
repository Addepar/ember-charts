/* jshint node: true */
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');
var esTranspiler = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var es3Safe = require('broccoli-es3-safe-recast');
var templateCompiler = require('broccoli-ember-hbs-template-compiler');
var less = require('broccoli-less-single');
var wrap = require('./wrap');
var globals = require('./globals');

var addonTree = new Funnel('addon', {
  srcDir: '/',
  destDir: 'ember-charts'
});

// Compile templates
var templateTree = templateCompiler('app/templates', { module: true });
templateTree = new Funnel(templateTree, {
  srcDir: '/',
  destDir: 'ember-charts/templates'
});

var sourceTree = mergeTrees([templateTree, addonTree], {overwrite: true});

// Does a few things:
//   - Generate global exports, like Ember.Charts.ChartComponent
//   - Register all templates on Ember.TEMPLATES
//   - Register views and components with the container so they can be looked up
// Output goes into globals-output.js
var globalExports = globals(new Funnel(sourceTree, {srcDir: '/ember-charts', destDir: '/'}));

// Require.js module loader
var loader = new Funnel('bower_components', {srcDir: '/loader.js', destDir: '/a.js'});

// loader needs to be first
var jsTree = mergeTrees([sourceTree]);

// Transpile modules
var compiled = esTranspiler(jsTree, {
  moduleIds: true,
  modules: 'amd'
});

// Wrap in a function which is executed
var merged = mergeTrees([loader, compiled, globalExports]);
compiled = wrap(concat(merged, {
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/ember-charts.js'
}));

// Compile LESS
var lessTree = new Funnel('addon/styles', { srcDir: '/', destDir: '/' });
var lessMain = 'addon.less';
var lessOutput = 'ember-charts.css';
lessTree = less(lessTree, lessMain, lessOutput);
module.exports = mergeTrees([es3Safe(compiled), lessTree]);
