// Remove all extra margins so that graph elements can line up with other
// elements more easily
import Ember from 'ember';

export default Ember.Mixin.create({
  marginRight: 0,

  // There should be no padding if there is no legend
  marginBottom: Ember.computed('hasLegend', function() {
    return this.get('hasLegend') ? 30 : 0;
  }),

  // Gives the maximum of the lengths of the labels given in svgTextArray
  maxLabelLength: function(svgTextArray) {
    var maxLabel = 0;
    svgTextArray.each(function() {
      // this.getComputedTextLength() gives the length in pixels of a text element
      if (this.getComputedTextLength() > maxLabel) {
        maxLabel = this.getComputedTextLength();
      }
    });
    return maxLabel;
  }
});
