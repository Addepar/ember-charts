// usage: 
// assertTooltip(assert, {
//      isVisible: true,
//      label: '2013-05-15',
//      name: 'Financial analytics software: ',
//      value: '49,668.00' 
// });
import Ember from 'ember';
import selectorFor from '../selector-for';

export default Ember.Test.registerHelper('assertTooltip', function(app, assert, expected) {

  var toolTipInfo = {
		isVisible: $('.chart-float-tooltip').is(":visible"),
		label:     $('.chart-float-tooltip .tip-label').text(),
		name:      $('.chart-float-tooltip .name').text(),
		value:     $('.chart-float-tooltip .value').text()
  };

  assert.equal( toolTipInfo.isVisible, expected.isVisible );
  assert.ok( !expected.label || expected.label && (toolTipInfo.label === expected.label) );
  assert.ok( !expected.name  || expected.name && (toolTipInfo.name  === expected.name) );
  assert.ok( !expected.value || expected.value && (toolTipInfo.value === expected.value) );

});