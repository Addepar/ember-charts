import Ember from 'ember';

// unfortunatly triggerEvent(selector, eventName); doesn't fire d3 handler */
// see http://stackoverflow.com/a/30803644/4950029

export default Ember.Test.registerAsyncHelper('domTriggerEvent', function(app, selector, eventName) {
  var element = $(selector)[0];
  var event = document.createEvent('SVGEvents');
  event.initEvent(eventName, true, true);
  return element.dispatchEvent(event);
});
