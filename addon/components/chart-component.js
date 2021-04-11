import { scheduleOnce, schedule } from '@ember/runloop';
import { isNone, isEmpty } from '@ember/utils';
import { lt, gt, lte, gte, alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import * as d3 from 'd3';
import { uniq } from 'lodash-es';
import ResizeHandlerMixin from '../mixins/resize-handler';
import ColorableMixin from '../mixins/colorable';

const ChartComponent = Component.extend(ColorableMixin, ResizeHandlerMixin, {
  layoutName: 'components/chart-component',
  classNames: ['chart-frame', 'scroll-y'],
  isInteractive: true,

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  // Margin between viewport and svg boundary
  horizontalMargin: 30,
  verticalMargin: 30,

  /**
   * Optional property to set specific left margin
   * @type {Number}
   */
  horizontalMarginLeft: null,

  /**
   * Optional property to set specific right margin
   * @type {Number}
   */
  horizontalMarginRight: null,

  /**
   * An array of the values in the data that is passed into the chart
   * @type {Array.<Number>}
   */
  allFinishedDataValues: computed('finishedData.@each.value', function() {
    return this.get('finishedData').map((d) => d.value);
  }),

  /**
   * The minimum value of the data in the chart
   * @type {Number}
   */
  minValue: computed('allFinishedDataValues.[]', function() {
    return d3.min(this.get('allFinishedDataValues'));
  }),

  /**
   * The maximum value of the data in the chart
   * @type {Number}
   */
  maxValue: computed('allFinishedDataValues.[]', function() {
    return d3.max(this.get('allFinishedDataValues'));
  }),

  /**
   * An array of the values which are at least 0
   * @type {Array<Number>}
   */
  positiveValues: computed('allFinishedDataValues.[]', function() {
    return this.get('allFinishedDataValues').filter((val) => val >= 0);
  }),

  /**
   * An array of the values which are less than 0
   * @type {Array<Number>}
   */
  negativeValues: computed('allFinishedDataValues.[]', function() {
    return this.get('allFinishedDataValues').filter((val) => val < 0);
  }),

  /**
   * Whether or not the data contains negative values.
   * @type {Boolean}
   */
  hasNegativeValues: lt('minValue', 0),

  /**
   * Whether or not the data contains positive values.
   * @type {Boolean}
   */
  hasPositiveValues: gt('maxValue', 0),

  /**
   * Whether or not the data contains only positive values.
   * @type {Boolean}
   */
  hasAllNegativeValues: lte('maxValue', 0),

  /**
   * Whether or not the data contains only negative values.
   * @type {Boolean}
   */
  hasAllPositiveValues: gte('minValue', 0),

  /**
   * Either a passed in value from `horizontalMarginRight`
   * or the default value from `horizontalMargin`
   * @type {Number}
   */
  marginRight: computed('horizontalMarginRight', 'horizontalMargin', function(){
    const horizontalMarginRight = this.get('horizontalMarginRight');
    if (isNone(horizontalMarginRight)) {
      return this.get('horizontalMargin');
    } else {
      return horizontalMarginRight;
    }
  }),

  /**
   * Either a passed in value from `horizontalMarginLeft`
   * or the default value from `horizontalMargin`
   * @type {Number}
   */
  marginLeft: computed('horizontalMarginLeft', 'horizontalMargin', function(){
    const horizontalMarginLeft = this.get('horizontalMarginLeft');
    if (isNone(horizontalMarginLeft)) {
      return this.get('horizontalMargin');
    } else {
      return horizontalMarginLeft;
    }
  }),

  marginTop: alias('verticalMargin'),
  marginBottom: alias('verticalMargin'),

  // TODO: Rename outer to SVG?
  defaultOuterHeight: 500,
  defaultOuterWidth: 700,
  outerHeight: alias('defaultOuterHeight'),
  outerWidth: alias('defaultOuterWidth'),

  width: computed('outerWidth', 'marginLeft', 'marginRight', function() {
    return Math.abs(this.get('outerWidth') - this.get('marginLeft') - this.get('marginRight'));
  }),

  height: computed('outerHeight', 'marginBottom', 'marginTop', function() {
    return Math.max(1, this.get('outerHeight') - this.get('marginBottom') - this.get('marginTop'));
  }),

  // Hierarchy of chart view is:
  // 1 Outside most element is div.chart-frame
  // 2 Next element is svg
  // 3 Finally, g.chart-viewport
  $viewport: computed(function() {
    return this.$('.chart-viewport')[0];
  }),

  viewport: computed(function() {
    return d3.select(this.get('$viewport'));
  }),

  // Transform the view commonly displaced by the margin
  transformViewport: computed('marginLeft', 'marginTop', function() {
    const left = this.get('marginLeft');
    const top = this.get('marginTop');
    return `translate(${left},${top})`;
  }),

  // ----------------------------------------------------------------------------
  // Labels
  // ----------------------------------------------------------------------------
  // Padding between label and zeroline, or label and graphic
  labelPadding: 10,

  // Padding allocated for axes on left of graph
  labelWidth: 30,
  labelHeight: 15,

  labelWidthOffset: computed('labelWidth', 'labelPadding', function() {
    return this.get('labelWidth') + this.get('labelPadding');
  }),

  labelHeightOffset: computed('labelHeight', 'labelPadding', function() {
    return this.get('labelHeight') + this.get('labelPadding');
  }),

  // ----------------------------------------------------------------------------
  // Graphic/NonGraphic Layout
  // I.e., some charts will care about the dimensions of the actual chart graphic
  // space vs. other drawing space, e.g., axes, labels, legends.
  // TODO(tony): Consider this being a mixin for axes/legends and it just happens
  // to be a redundant mixin. This is a problem though because we would not want
  // to override things like graphicTop, we instead would want the changes to be
  // cumulative.
  // ----------------------------------------------------------------------------
  graphicTop: 0,
  graphicLeft: 0,
  graphicWidth: alias('width'),
  graphicHeight: alias('height'),

  graphicBottom: computed('graphicTop', 'graphicHeight', function() {
    return this.get('graphicTop') + this.get('graphicHeight');
  }),

  graphicRight: computed('graphicLeft', 'graphicWidth', function() {
    return this.get('graphicLeft') + this.get('graphicWidth');
  }),

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  hasNoData: computed('finishedData', function() {
    return isEmpty(this.get('finishedData'));
  }),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  // Observe important variables and trigger chart redraw when they change
  concatenatedProperties: ['renderVars'],

  // Every chart will trigger a redraw when these variables change, through the
  // magic of concatenatedProperties any class that overrides the variable
  // renderVars will actually just be appending names to the list
  renderVars: [
    'finishedData',
    'width',
    'height',
    'margin',
    'isInteractive'
  ],

  init: function() {
    this._super();
    this._scheduledDrawCount = 0;
    uniq(this.get('renderVars')).forEach((renderVar) => {
      this.addObserver(renderVar, this.drawOnce);
      // This is just to ensure that observers added above fire even
      // if that renderVar is not consumed elsewhere.
      this.get(renderVar);
    });
  },

  willDestroyElement: function() {
    uniq(this.get('renderVars')).forEach((renderVar) => {
      this.removeObserver(renderVar, this, this.drawOnce);
    });
    this._super();
  },

  didInsertElement: function() {
    this._super();
    scheduleOnce('afterRender', this, function() {
      if (this.isDestroying || !this.element) {
        return;
      }
      this._updateDimensions();
      this.drawOnce();
    });
  },

  drawOnce: function() {
    this._scheduledDrawCount++;
    schedule('afterRender', this, this.draw);
  },

  onResizeEnd: function() {
    this._updateDimensions();
  },

  // Wrap the chart in a container div that is the same size
  _updateDimensions: function() {
    this.set('defaultOuterHeight', this.$().height());
    this.set('defaultOuterWidth', this.$().width());
  },

  clearChart: function() {
    this.$('.chart-viewport').children().remove();
  },

  getHasScheduledDraw() {
    return this._scheduledDrawCount > 0;
  },

  // Remove previous drawing
  draw: function() {
    this._scheduledDrawCount--;
    if (this._scheduledDrawCount > 0) {
      return;
    }
    if ((this._state || this.state) !== "inDOM") {
      return;
    }

    if (this.get('hasNoData')) {
      return this.clearChart();
    } else {
      return this.drawChart();
    }
  }
});

export default ChartComponent;
