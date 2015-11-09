import Ember from 'ember';

export default Ember.Mixin.create({
  hasAxisTitles: false,
  xValueDisplayName: null,
  yValueDisplayName: null,

  xAxisTitleDisplayValue: Ember.computed('hasAxisTitles', 'xValueDisplayName', function(){
    return this.get('hasAxisTitles') === true ? this.get('xValueDisplayName') : '';
  }),
  yAxisTitleDisplayValue: Ember.computed('hasAxisTitles', 'yValueDisplayName', function(){
    return this.get('hasAxisTitles') === true ? this.get('yValueDisplayName') : '';
  }),
  horizontalMarginLeft: Ember.computed('hasAxisTitles', function(){
    return this.get('hasAxisTitles') === true ? 20 : 0;
  }),
  marginLeft: Ember.computed.alias('horizontalMarginLeft'),

  // TODO(tony): Consider making logic for whether we are showing the title or
  // not and then axis mixin will calculate axis offset that will be added
  axisTitleHeightOffset: Ember.computed('axisTitleHeight', 'labelPadding', function() {
    if(this.get('hasAxisTitles') === true){
      return this.get('axisTitleHeight') + this.get('labelPadding');
    }else{
      return 0;
    }
  }),

  xAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.x.axis-title').attr('class', 'x axis-title');
  }).volatile(),

  yAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.y.axis-title').attr('class', 'y axis-title');
  }).volatile(),


  axisPadding: Ember.computed(function(){
    return this.get('labelHeightOffset') + this.get('labelPadding');
  }).property('labelHeightOffset', 'labelPadding'),

  xAxisPositionX: Ember.computed(function(){
    return this.get('graphicWidth') / 2 + this.get('labelWidthOffset');
  }).property('graphicWidth', 'labelWidthOffset'),

  xAxisPositionY: Ember.computed(function(){
    return this.get('graphicBottom') + this.get('axisPadding');
  }).property('graphicBottom', 'axisPadding'),


  yAxisPositionX: Ember.computed(function(){
    return -1 * (this.get('graphicHeight') / 2 + this.get('labelWidthOffset'));
  }).property('graphicHeight', 'labelWidthOffset'),

  yAxisPositionY: Ember.computed(function(){
    return -20
  }),

  xAxisTransform: Ember.computed(function(){
    return "rotate(0)";
  }),

  yAxisTransform: Ember.computed(function(){
    return "rotate(-90)"
  }),

  selectOrCreateAxisTitle: function(selector) {
    var title = this.get('viewport').select(selector);
    if (title.empty()) {
      return this.get('viewport').append('text');
    } else {
      return title;
    }
  },

  updateXAxis: function(){
    this.get('xAxisTitle').text(this.get('xAxisTitleDisplayValue')).style('text-anchor', 'middle').attr({
      x: this.get('xAxisPositionX'),
      y: this.get('xAxisPositionY')
    });
  },

  updateYAxis: function(){
    console.log('X', this.get('yAxisPositionX'));
    console.log('Y', this.get('yAxisPositionY'));
    this.get('yAxisTitle').text(this.get('yAxisTitleDisplayValue')).style('text-anchor', 'start').attr({
      x: this.get('yAxisPositionX'),
      y: this.get('yAxisPositionY'),
    }).attr("transform", this.get('yAxisTransform')).attr("dy", "1em");
  },

  updateAxisTitles: function(){
    this.updateXAxis();
    this.updateYAxis();
  }

});
