var mergeTrees = require('broccoli-merge-trees');
// TODO(azirbel): This is deprecated
var pickFiles = require('broccoli-static-compiler');
var es3Safe = require('broccoli-es3-safe-recast');
var wrap = require('./wrap');
var globals = require('./globals');

var addonTree = pickFiles('addon', {
  srcDir: '/',
  destDir: 'ember-charts'
});

// Does a few things:
//   - Generate global exports, like Ember.Table.EmberTableComponent
// Output goes into globals-output.js
var globalExports = globals(pickFiles(addonTree, {srcDir: '/ember-charts', destDir: '/'}));

// Wrap in a function which is executed
var wrapped = wrap(globalExports);

var es3SafeTree = es3Safe(wrapped);

module.exports = mergeTrees([es3SafeTree]);
