import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import * as d3 from 'd3';

export default Mixin.create({

  // # Getters for formatting human-readable labels from provided data
  formatLabelFunction: computed('formatLabel', function() {
    return d3.format("," + this.get('formatLabel'));
  }),

  // # String that will be used to format label using d3.format function
  // # More info about d3.format: https://github.com/mbostock/d3/wiki/Formatting
  formatLabel: '.2f'
});
