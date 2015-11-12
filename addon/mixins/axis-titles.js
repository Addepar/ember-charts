import Ember from 'ember';

/**
 * Adds axis titles to a chart and sets left/bottom margins to allow space
 * for the axis titles
 * Axis titles are set through the `xValueDisplayName` and `yValueDisplayName`
 * Spacing on the left is managed through the `horizontalMarginLeft`
 * Spacing on the bottom is managed through `axisTitleHeight` and `labelPadding`
 *
 * @mixin
 */
const AxisTitlesMixin = Ember.Mixin.create({
  /**
   * Toggle axis titles on/off
   * @type {Boolean}
   */
  hasAxisTitles: false,

  /**
   * Title for the x axis
   * @type {String}
   */
  xValueDisplayName: null,

  /**
   * Title for the y axis
   * @type {String}
   */
  yValueDisplayName: null,

  /**
   * Computed title for the x axis, if the `hasAxisTitles` boolean is false
   * `xAxisTitleDisplayValue` should be an empty string
   * @type {String}
   */
  xAxisTitleDisplayValue: Ember.computed('hasAxisTitles', 'xValueDisplayName', function(){
    return this.get('hasAxisTitles') ? this.get('xValueDisplayName') : '';
  }),

  /**
   * Computed title for the x axis, if the `hasAxisTitles` boolean is false
   * `yAxisTitleDisplayValue` should be an empty string
   * @type {String}
   */
  yAxisTitleDisplayValue: Ember.computed('hasAxisTitles', 'yValueDisplayName', function(){
    return this.get('hasAxisTitles') ? this.get('yValueDisplayName') : '';
  }),

  /**
   * Default left margin, allows for enough space for the y axis label
   * @type {Number}
   */
  horizontalMarginLeft: 20,

  /**
   * If `hasAxisTitles` is false there should be no margin on the left side,
   * while if true the left margin should be the value of `horizontalMarginLeft`
   * @type {Number}
   */
  marginLeft: Ember.computed('hasAxisTitles', 'horizontalMarginLeft', function(){
    return this.get('hasAxisTitles') ? this.get('horizontalMarginLeft') : 0;
  }),

  /**
   * Computed title height plus label padding or 0 if `hasAxisTitles` is false
   * @type {Number}
   */
  axisTitleHeightOffset: Ember.computed('axisTitleHeight', 'labelPadding', function() {
    if (this.get('hasAxisTitles')) {
      return this.get('axisTitleHeight') + this.get('labelPadding');
    } else {
      return 0;
    }
  }),

  /**
   * References and/or creates the d3 element for x axis title
   * @type {Object}
   */
  xAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.x.axis-title').attr('class', 'x axis-title');
  }).volatile(),

  /**
   * References and/or creates the d3 element for y axis title
   * @type {Object}
   */
  yAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.y.axis-title').attr('class', 'y axis-title');
  }).volatile(),

  /**
   * Amount of padding for the axis, `labelHeightOffset` + `labelPadding`
   * @type {Number}
   */
  axisPadding: Ember.computed('labelHeightOffset', 'labelPadding', function(){
    return this.get('labelHeightOffset') + this.get('labelPadding');
  }),

  /**
   * Position of x axis title on the x axis
   * @type {Number}
   */
  xAxisPositionX: Ember.computed('graphicWidth', 'labelWidthOffset', function(){
    return this.get('graphicWidth') / 2 + this.get('labelWidthOffset');
  }),

  /**
   * Position of x axis title on the y axis
   * @type {Number}
   */
  xAxisPositionY: Ember.computed('graphicBottom', 'axisPadding', function(){
    return this.get('graphicBottom') + this.get('axisPadding');
  }),

  /**
   * Position of y axis title on the x axis
   * @type {Number}
   */
  yAxisPositionX: Ember.computed('graphicHeight', 'labelWidthOffset', function(){
    return -(this.get('graphicHeight') / 2 + this.get('labelWidthOffset'));
  }),

  /**
   * Position of y axis title on the y axis
   * @type {Number}
   */
  yAxisPositionY: -20,

  /**
   * X axis transform
   * @type {string}
   */
  xAxisTransform: "rotate(0)",
  /**
   * Y axis transform
   * @type {string}
   */
  yAxisTransform: "rotate(-90)",

  /**
   * If no axis title has been created for the selector create a new one
   * @param  {String} selector
   * @return {Object}
   */
  selectOrCreateAxisTitle: function(selector) {
    var title = this.get('viewport').select(selector);
    if (title.empty()) {
      return this.get('viewport').append('text');
    } else {
      return title;
    }
  },

  /**
   * Update the x axis title and position
   */
  updateXAxisTitle: function(){
    this.get('xAxisTitle')
    .text(this.get('xAxisTitleDisplayValue'))
    .style('text-anchor', 'middle').attr({
      x: this.get('xAxisPositionX'),
      y: this.get('xAxisPositionY')
    });
  },

  /**
   * Update the y axis title and position
   */
  updateYAxisTitle: function(){
    this.get('yAxisTitle')
    .text(this.get('yAxisTitleDisplayValue'))
    .style('text-anchor', 'start').attr({
      x: this.get('yAxisPositionX'),
      y: this.get('yAxisPositionY'),
    }).attr("transform", this.get('yAxisTransform'))
    .attr("dy", "1em");
  },

  /**
   * Updates axis titles
   */
  updateAxisTitles: function(){
    this.updateXAxisTitle();
    this.updateYAxisTitle();
  }

});


export default AxisTitlesMixin;
