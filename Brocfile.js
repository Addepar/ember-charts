/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

/*
  This Brocfile specifes the options for the dummy test app of this
  addon, located in `/tests/dummy`

  This Brocfile does *not* influence how the addon or the app using it
  behave. You most likely want to be modifying `./index.js` or app's Brocfile
*/

var app = new EmberAddon();
app.import(app.bowerDirectory + '/jquery-ui/themes/base/jquery-ui.css');
app.import(app.bowerDirectory + '/d3/d3.js');
app.import(app.bowerDirectory + '/lodash/lodash.js');

module.exports = app.toTree();
