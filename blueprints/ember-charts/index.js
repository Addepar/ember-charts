module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function(options) {
    // We assume that handlebars, ember, and jquery already exist
    return this.addBowerPackagesToProject([
      {
        'name': 'd3',
        'target': '~3.5.3'
      }, {
        'name': 'lodash',
        'target': '~4.17.10'
      }
    ]);
  }
};