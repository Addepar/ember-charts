'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    contentSecurityPolicy: {
      'default-src': "'self' ghbtns.com",
      'script-src': "'self' api.github.com",
      'font-src': "'self' fast.fonts.net",
      'connect-src': "'self' api.github.com",
      'img-src': "'self' ghbtns.com avatars.githubusercontent.com",
      'style-src': "'self' 'unsafe-inline' fast.fonts.net",
      'media-src': "'self'",
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.APP.autoboot = false;
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';
    // here you can enable a production-specific feature
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.rootURL = 'ember-charts';
  }

  return ENV;
};
