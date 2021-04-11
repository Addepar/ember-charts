import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

const LabelWidthMixin = Mixin.create({

  // Override maximum width of labels to be a percentage of the total width
  labelWidth: computed('outerWidth', 'labelWidthMultiplier', function() {
    return this.get('labelWidthMultiplier') * this.get('outerWidth');
  }),

  // The proportion of the chart's width that should be reserved for labels
  labelWidthMultiplier: 0.25,
});

export default LabelWidthMixin;
