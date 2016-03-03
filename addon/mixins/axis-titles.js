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
   * Toggle axis X title on/off
   * @type {Boolean}
   */
  hasXAxisTitle: false,

  /**
   * Toggle axis Y title on/off
   * @type {Boolean}
   */
  hasYAxisTitle: false,

  /**
   * A deprecated property to support backward compatability.
   * TODO: Add ember deprecated helper function for this property.
   * @deprecated
   */
  hasAxisTitles: Ember.computed('hasXAxisTitle', 'hasYAxisTitle', {
    get() {
      return this.get('hasXAxisTitle') || this.get('hasYAxisTitle');
    },
    set(key, value) {
      this.set('hasXAxisTitle', value);
      this.set('hasYAxisTitle', value);
      return value;
    }
  }),

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
   * A variable to allow user to config the amount of horizontal offset for x
   * axis title.
   * @type {Number}
   */
  xTitleHorizontalOffset: Ember.computed('width', 'graphicWidth', function(){
    return -(this.get('width') - this.get('graphicWidth')) / 2;
  }),

  /**
   * A variable to allow user to config the amount of veritcal offset for x
   * axis title.
   * @type {Number}
   */
  xTitleVerticalOffset: 10,

  /**
   * A variable to allow user to config the amount of offset for y axis title.
   * @type {Number}
   */
  yTitleVerticalOffset: 0,

  /**
   * Computed title for the x axis, if the `hasXAxisTitle` boolean is false
   * `xAxisTitleDisplayValue` should be an empty string
   * @type {String}
   */
  xAxisTitleDisplayValue: Ember.computed('hasXAxisTitle', 'xValueDisplayName', function(){
    return this.get('hasXAxisTitle') ? this.get('xValueDisplayName') : '';
  }),

  /**
   * Computed title for the x axis, if the `hasYAxisTitle` boolean is false
   * `yAxisTitleDisplayValue` should be an empty string
   * @type {String}
   */
  yAxisTitleDisplayValue: Ember.computed('hasYAxisTitle', 'yValueDisplayName', function(){
    return this.get('hasYAxisTitle') ? this.get('yValueDisplayName') : '';
  }),

  /**
   * Default left margin, allows for enough space for the y axis label
   * @type {Number}
   */
  horizontalMarginLeft: 20,

  // Height of the text for the axis titles
  axisTitleHeight: 10,

  /**
   * If `hasYAxisTitle` is false there should be no margin on the left side,
   * while if true the left margin should be the value of `horizontalMarginLeft`
   * @type {Number}
   */
  marginLeft: Ember.computed('hasYAxisTitle', 'horizontalMarginLeft', function(){
    return this.get('hasYAxisTitle') ? this.get('horizontalMarginLeft') : 0;
  }),

  // TODO(tony): Just use axisBottomOffset here
  legendChartPadding: Ember.computed('labelHeightOffset', 'xAxisTitleHeightOffset', function() {
    return this.get('xAxisTitleHeightOffset') + this.get('labelHeightOffset');
  }),

  /**
   * Computed title height plus label padding or 0 if `hasXAxisTitle` is false
   * @type {Number}
   */
  xAxisTitleHeightOffset: Ember.computed('hasXAxisTitle', 'axisTitleHeight',
      'labelPadding', function() {
    if (this.get('hasXAxisTitle')) {
      return this.get('axisTitleHeight') + this.get('labelPadding');
    } else {
      return 0;
    }
  }),

  /**
   * The horizontal offset of the Y axis title, if there is a Y axis title
   * Computed based on the height of the axis title, plus 10 pixels of extra
   * margin
   * @type {Number}
   */
  yAxisTitleHeightOffset: Ember.computed('hasYAxisTitle', 'axisTitleHeight',
      function() {
    if (this.get('hasYAxisTitle')) {
      return this.get('axisTitleHeight') + 10;
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
   * Position of x axis title on the x axis
   * @type {Number}
   */
  xAxisPositionX: Ember.computed('graphicWidth', 'labelWidthOffset',
      'xTitleHorizontalOffset', function() {
    var position = this.get('graphicWidth') / 2 + this.get('labelWidthOffset');
    if (!Ember.isNone(this.get('xTitleHorizontalOffset'))) {
      position += this.get('xTitleHorizontalOffset');
    }
    return position;
  }),

  /**
   * Position of x axis title on the y axis. The y-coordinate of x Axis Title
   * depends on the y-coordinate of the bottom of the graph, label height &
   * padding and optional title offset. Caller can set `xTitleVerticalOffset`
   * to adjust the y-coordinate of the label on the graph.
   * @type {Number}
   */
  xAxisPositionY: Ember.computed('graphicBottom', 'labelHeightOffset',
      'labelPadding', 'xTitleVerticalOffset', function(){
    return this.get('graphicBottom') + this.get('labelHeightOffset') +
      this.get('labelPadding') + this.get('xTitleVerticalOffset');
  }),

  /**
   * Position of y axis title on the x axis
   * @type {Number}
   */
  yAxisPositionX: Ember.computed('graphicHeight', 'yTitleVerticalOffset',
      function() {
    var position = -(this.get('graphicHeight') / 2);
    if (!Ember.isNone(this.get('yTitleVerticalOffset'))) {
      position += this.get('yTitleVerticalOffset');
    }
    return position;
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
    .style('text-anchor', 'middle').attr({
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
