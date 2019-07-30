import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

// unfortunatly triggerEvent(selector, eventName); doesn't fire d3 handler */
// see http://stackoverflow.com/a/30803644/4950029

export default async function(selector, eventName) {
  var element = $(selector)[0];
  var event = document.createEvent('SVGEvents');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
  await wait();
}
