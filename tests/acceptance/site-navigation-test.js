import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

var application;

module('Acceptance | site navigation', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /', function(assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/overview');
  });
});

test('visiting /overview', function(assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/overview');
  });
});

test('visiting /time-series', function(assert) {
  visit('/time-series');
  andThen(function() {
    assert.equal(currentURL(), '/time-series');
  });
});

test('visiting /horizontal-bar', function(assert) {
  visit('/horizontal-bar');
  andThen(function() {
    assert.equal(currentURL(), '/horizontal-bar');
  });
});

test('visiting /pie', function(assert) {
  visit('/pie');
  andThen(function() {
    assert.equal(currentURL(), '/pie');
  });
});

test('visiting /scatter', function(assert) {
  visit('/scatter');
  andThen(function() {
    assert.equal(currentURL(), '/scatter');
  });
});
