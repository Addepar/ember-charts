import Ember from 'ember';
import LegendMixin from 'dummy/mixins/legend';
import { module, test } from 'qunit';

module('Unit | Mixin | legends');

test('it works', function(assert) {
  const LegendObject = Ember.Object.extend(LegendMixin);
  const legend = LegendObject.create();
  assert.ok(legend);
});

test('at least 1 legend item per row', function(assert) {
  const LegendObject = Ember.Object.extend(LegendMixin);
  const legend = LegendObject.create();
  legend.set('width', 1);
  legend.set('legendItems', []);
  assert.equal(legend.get('numLegendItemsPerRow'), 1);
});

test('no legend rows', function(assert) {
  const LegendObject = Ember.Object.extend(LegendMixin);
  const legend = LegendObject.create();
  legend.set('width', 1);
  legend.set('legendItems', []);
  assert.equal(legend.get('numLegendRows'), 0);
});

test('drwaing legend works', function(assert) {
  const LegendObject = Ember.Object.extend(LegendMixin);
  const legend = LegendObject.create();
  var legendData = [{
      label: 'short legend',
      icon: (d, i) => { return 'line'; }
  }];
  var svg = document.createElementNS("https://www.w3.org/2000/svg", "svg");
  var viewport = d3.select(svg)
                  .append('g')
                  .attr('class', 'chart-viewport');
  legend.set('viewport', viewport);
  legend.set('legendItems', legendData);
  legend.set('width', 1);
  legend.set('graphicBottom', 0);
  assert.ok(legend.drawLegend());
});
