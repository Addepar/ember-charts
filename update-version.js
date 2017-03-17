
/**
 * Ember-charts previously relied on a grunt task to increment the version
 * number found in the 'VERSION' file using the grunt-text-replace plugin.
 * When removing grunt, we lost this auto-incrementing functionality.
 * The new `release-it` node package can handle updating our version numbers
 * in `package.json` and `bower.json`, but is incapable of updating the
 * `VERSION` file because it does not follow JSON key-value formatting.
 *
 * This custom helper is run by `release-it` prior to committing the release
 * but after bumping the version in `package.json`. It pulls the updated
 * version and uses this to rewrite the `VERSION` file.
 */
(function() {
  'use strict';

  var fs   = require('fs'),
      path = require('path');

  function getNewVersion() {
    var packageJson = fs.readFileSync(path.resolve('package.json'))
    return JSON.parse(packageJson).version.toString();
  }

  fs.writeFileSync(path.resolve('VERSION'), getNewVersion() + "\n");
}());
