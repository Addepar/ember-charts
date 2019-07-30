const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary'),
  ]).then(urls => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'default',
          devDependencies: { }
        },
        {
          name: 'ember-1.12',
          bower: {
            dependencies: {
              ember: '~1.12.0',
              'ember-cli-shims': 'ember-cli/ember-cli-shims#0.0.3',
            },
            resolutions: {
              ember: '~1.12.0',
              'ember-cli-shims': '0.0.3',
            },
          },
          npm: {
            devDependencies: {
              'ember-cli-shims': null,
              'ember-source': null,
            },
          },
        },
        {
          name: 'ember-1.13',
          bower: {
            dependencies: {
              ember: '~1.13.0',
              'ember-cli-shims': '0.0.6',
            },
            resolutions: {
              ember: '~1.13.0',
              'ember-cli-shims': '0.0.6',
            },
          },
          npm: {
            devDependencies: {
              'ember-cli-shims': null,
              'ember-source': null,
            },
          },
        },
      ]
    };
  });
};
