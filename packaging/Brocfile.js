/* jshint node: true */
var mergeTrees = require('broccoli-merge-trees');
// TODO(azirbel): This is deprecated
var pickFiles = require('broccoli-static-compiler');
var esTranspiler = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var es3Safe = require('broccoli-es3-safe-recast');
var HtmlbarsCompiler = require('ember-cli-htmlbars');
var less = require('broccoli-less-single');
var wrap = require('./wrap');
var globals = require('./globals');

var addonTree = pickFiles('addon', {
  srcDir: '/',
  destDir: 'ember-charts'
});

// Compile templates
var templateTree = new HtmlbarsCompiler('app/templates', {
  isHtmlBars: true,

  // provide the templateCompiler that is paired with your Ember version
  templateCompiler: require('../bower_components/ember/ember-template-compiler')
});

templateTree = pickFiles(templateTree, {srcDir: '/', destDir: 'ember-charts/templates'});

var sourceTree = mergeTrees([templateTree, addonTree], {overwrite: true});

// Does a few things:
//   - Generate global exports, like Ember.Charts.ChartComponent
//   - Register all templates on Ember.TEMPLATES
//   - Register views and components with the container so they can be looked up
// Output goes into globals-output.js
var globalExports = globals(pickFiles(sourceTree, {srcDir: '/ember-charts', destDir: '/'}));

// Require.js module loader
var loader = pickFiles('bower_components', {srcDir: '/loader.js', destDir: '/'});

var jsTree = mergeTrees([sourceTree, globalExports, loader]);

// Transpile modules
var compiled = esTranspiler(jsTree, {
  filterExtensions:['js', 'es6'],
  stage: 0,
  moduleIds: true,
  modules: 'amd'
});

// Wrap in a function which is executed
compiled = concat(compiled, {
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/ember-charts.js'
});
compiled = wrap(compiled);

// Compile LESS
var lessTree = pickFiles('addon/styles', { srcDir: '/', destDir: '/' });
var lessMain = 'addon.less';
var lessOutput = 'ember-charts.css';
lessTree = less(lessTree, lessMain, lessOutput);
module.exports = mergeTrees([es3Safe(compiled), lessTree]);
