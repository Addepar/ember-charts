import Ember from 'ember';
export default Ember.Object.extend({

    // Reserved space for extra characters
    reservedCharLength: 0,

    getLabelSize: function() {
      return 100;
    },

    getLabelText: function(d) {
      return d.label;
    },

    trim: Ember.computed('getLabelSize', 'getLabelText', function() {

      var getLabelSize = this.get('getLabelSize');
      var getLabelText = this.get('getLabelText');
      var reservedCharLength = this.get('reservedCharLength');

      return function(selection) {

        return selection.text(function(d) {

          var bbW = this.getBBox().width;
          var label = getLabelText(d);
          if (!label) {
            return '';
          }
          var charWidth = bbW / label.length;
          var textLabelWidth = getLabelSize(d, selection) - reservedCharLength * charWidth;
          var numChars = Math.floor(textLabelWidth / charWidth);

          if (numChars - 3 <= 0) {
            return '...';
          } else if (bbW > textLabelWidth) {
            return label.slice(0, numChars - 3) + '...';
          } else {
            return label;
          }
        });
      };
    })
});
