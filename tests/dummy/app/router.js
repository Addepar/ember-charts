import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  	this.route('license');
  	
	this.route('overview');
	this.route('documentation');
	this.route('pie');
	this.route('horizontal-bar');
	this.route('vertical-bar');
	this.route('time-series');
	this.route('scatter');
	// this.route('bubble');

});

export default Router;
