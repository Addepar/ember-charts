/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-charts',

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/d3/d3.js');
    app.import(app.bowerDirectory + '/lodash/lodash.js');
  },

  afterInstall: function() {
    this.addBowerPackageToProject('d3');
    this.addBowerPackageToProject('lodash');
  }
};