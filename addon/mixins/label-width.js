import Ember from 'ember';

const LabelWidthMixin = Ember.Mixin.create({

  // Override maximum width of labels to be a percentage of the total width
  labelWidth: Ember.computed('outerWidth', 'labelWidthMultiplier', function() {
    return this.get('labelWidthMultiplier') * this.get('outerWidth');
  }),

  // The proportion of the chart's width that should be reserved for labels
  labelWidthMultiplier: 0.25,
});

export default LabelWidthMixin;
