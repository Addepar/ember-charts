import Ember from 'ember';

export default Ember.Mixin.create({
  xValueDisplayName: null,
  yValueDisplayName: null,
  // TODO(tony): Consider making logic for whether we are showing the title or
  // not and then axis mixin will calculate axis offset that will be added
  axisTitleHeightOffset: Ember.computed('axisTitleHeight', 'labelPadding', function() {
    return this.get('axisTitleHeight') + this.get('labelPadding');
  }),

  xAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.x.axis-title').attr('class', 'x axis-title');
  }).volatile(),

  yAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.y.axis-title').attr('class', 'y axis-title');
  }).volatile(),

  selectOrCreateAxisTitle: function(selector) {
    var title = this.get('viewport').select(selector);
    if (title.empty()) {
      return this.get('viewport').append('text');
    } else {
      return title;
    }
  },
  updateAxisTitles: function(){
    var xAxisPadding = this.get('labelHeightOffset') + this.get('labelPadding');
    this.get('xAxisTitle').text(this.get('xValueDisplayName')).style('text-anchor', 'middle').attr({
      x: this.get('graphicWidth') / 2 + this.get('labelWidthOffset'),
      y: this.get('graphicBottom') + xAxisPadding
    });

    return this.get('yAxisTitle').text(this.get('yValueDisplayName')).style('text-anchor', 'start').attr({
      y: 0,
      x: 0
    });
  }
});
