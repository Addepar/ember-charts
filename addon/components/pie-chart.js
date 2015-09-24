import Ember from 'ember';
import ChartComponent from './chart-component';
import FormattableMixin from '../mixins/formattable';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import SortableChartMixin from '../mixins/sortable-chart';
import PieLegendMixin from '../mixins/pie-legend';

import LabelTrimmer from '../utils/label-trimmer';

export default ChartComponent.extend(FloatingTooltipMixin,
  FormattableMixin, SortableChartMixin, PieLegendMixin, {

  classNames: ['chart-pie'],
  // ----------------------------------------------------------------------------
  // Pie Chart Options
  // ----------------------------------------------------------------------------

  // The smallest slices will be combined into an "Other" slice until no slice is
  // smaller than minSlicePercent. "Other" is also guaranteed to be larger than
  // minSlicePercent.
  minSlicePercent: 5,

  // The maximum number of slices. If the number of slices is greater
  // than this then the smallest slices will be combined into an "other"
  // slice until there are at most maxNumberOfSlices.
  maxNumberOfSlices: 8,

  // Override maximum width of labels to be a percentage of the total width
  labelWidth: Ember.computed('outerWidth', function() {
    return 0.25 * this.get('outerWidth');
  }),

  // Essentially we don't want a maximum pieRadius
  maxRadius: 2000,

  // top and bottom margin will never be smaller than this
  // you can use this to ensure that your labels don't get pushed off
  // the top / bottom when your labels are large or the chart is very small
  minimumTopBottomMargin: 0,

  // ----------------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------------

  // Data with invalid/negative values removed
  filteredData: Ember.computed('data.[]', function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(child) {
      return (child.value >= 0);
    });
  }),

  // Negative values that have been discarded from the data
  rejectedData: Ember.computed('data.[]', function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(child) {
      return child.value < 0;
    });
  }),

  // Valid data points that have been sorted by selectedSortType
  sortedData: Ember.computed('filteredData', 'sortKey', function() {
    var data = this.get('filteredData');
    var total = data.reduce(function(p, child) {
      return child.value + p;
    }, 0);
    if (total === 0) {
      return [];
    }

    data = data.map(function(d) {
      return {
        color: d.color,
        label: d.label,
        value: d.value,
        percent: d3.round(100.0 * d.value / total)
      };
    });

    return _.sortBy(data, this.get('sortKey'));
  }),

  // This takes the sorted slices that have percents calculated and returns
  // sorted slices that obey the "other" slice aggregation rules
  sortedDataWithOther: Ember.computed('sortedData', 'maxNumberOfSlices', 'minSlicePercent', function() {
    var lastItem, overflowSlices, slicesLeft;

    var data = _.cloneDeep(this.get('sortedData')).reverse();
    var maxNumberOfSlices = this.get('maxNumberOfSlices');
    var minSlicePercent = this.get('minSlicePercent');
    var otherItems = [];
    var otherSlice = {
      label: 'Other',
      percent: 0,
      _otherItems: otherItems
    };

    // First make an other slice out of any slices below percent threshold
    // Find the first slice below
    var lowPercentIndex = _.indexOf(data, _.find(data, function(d) {
      return d.percent < minSlicePercent;
    }));

    // Guard against not finding any slices below the threshold
    if (lowPercentIndex < 0) {
      lowPercentIndex = data.length;
    } else {
    	// Add low percent slices to other slice
      _.takeRight(data, data.length - lowPercentIndex).forEach(function(d) {
        otherItems.push(d);
        return otherSlice.percent += d.percent;
      });

      // Ensure Other slice is larger than minSlicePercent
      if (otherSlice.percent < minSlicePercent) {
        lastItem = data[lowPercentIndex - 1];
        if (lastItem.percent < minSlicePercent) {
          lowPercentIndex -= 1;
          otherItems.push(lastItem);
          otherSlice.percent += lastItem.percent;
        }
      }
    }

    // Reduce max number of slices that we can have if we now have an other slice
    if (otherSlice.percent > 0) {
      maxNumberOfSlices -= 1;
    }

    // Next, continue putting slices in other slice if there are too many
    // take instead of first see https://lodash.com/docs#take
    // drop instead of rest 
    slicesLeft = _.take(data, lowPercentIndex);

    overflowSlices = _.drop(slicesLeft, maxNumberOfSlices);

    if (overflowSlices.length > 0) {
      overflowSlices.forEach(function(d) {
        otherItems.push(d);
        return otherSlice.percent += d.percent;
      });
      slicesLeft = _.take(slicesLeft, maxNumberOfSlices);
    }

    // only push other slice if there is more than one other item
    if (otherItems.length === 1) {
      slicesLeft.push(otherItems[0]);
    } else if (otherSlice.percent > 0) {
      slicesLeft.push(otherSlice);
    }

    // make slices appear in descending order
    return slicesLeft.reverse();
  }),

  otherData: Ember.computed('sortedDataWithOther.[]', 'sortFunction', function() {
    var _ref;
    var otherSlice = _.find(this.get('sortedDataWithOther'), function(d) {
      return d._otherItems;
    });
    var otherItems = (_ref = otherSlice != null ? otherSlice._otherItems : void 0) != null ? _ref : [];
    return _.sortBy(otherItems, this.get('sortFunction')).reverse();
  }),

  otherDataValue: Ember.computed('otherData.[]', function() {
    var otherItems, value;
    value = 0;
    otherItems = this.get('otherData');
    if (otherItems != null) {
      _.each(otherItems, function(item) {
        return value += item.value;
      });
    }
    return value;
  }),

  finishedData: Ember.computed.alias('sortedDataWithOther'),

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  // TODO(tony): This should probably be merged with the API for controlling
  // a legend in general, very similar to that code

  // For the pie chart, horizontalMargin and verticalMargin are used to center
  // the graphic in the middle of the viewport
  horizontalMargin: Ember.computed('labelPadding', 'labelWidth', function() {
    return this.get('labelPadding') + this.get('labelWidth');
  }),

  // Bottom margin is equal to the total amount of space the legend needs,
  // or 10% of the viewport if there is no legend
  _marginBottom: Ember.computed('legendHeight', 'hasLegend', 'marginTop', function() {
    return this.get('hasLegend') ? this.get('legendHeight') : this.get('marginTop');
  }),

  marginBottom: Ember.computed('_marginBottom', 'minimumTopBottomMargin', function() {
    return Math.max(this.get('_marginBottom'), this.get('minimumTopBottomMargin'));
  }),

  _marginTop: Ember.computed('outerHeight', function() {
    return Math.max(1, this.get('outerHeight') * 0.1);
  }),

  marginTop: Ember.computed('_marginTop', 'minimumTopBottomMargin', function() {
    return Math.max(this.get('_marginTop'), this.get('minimumTopBottomMargin'));
  }),

  // ----------------------------------------------------------------------------
  // Graphics Properties
  // ----------------------------------------------------------------------------

  numSlices: Ember.computed.alias('finishedData.length'),

  // Offset slices so that the largest slice finishes at 12 o'clock
  startOffset: Ember.computed('finishedData', function() {
    var data = this.get('finishedData');
    var sum = data.reduce(function(p, d) {
      return d.percent + p;
    }, 0);
    return _.last(data).percent / sum * 2 * Math.PI;
  }),

  // Radius of the pie graphic, resized to fit the viewport.
  pieRadius: Ember.computed('maxRadius', 'width', 'height', function() {
    return d3.min([this.get('maxRadius'), this.get('width') / 2, this.get('height') / 2]);
  }),


  // Radius at which labels will be positioned
  labelRadius: Ember.computed('pieRadius', 'labelPadding', function() {
    return this.get('pieRadius') + this.get('labelPadding');
  }),

  // ----------------------------------------------------------------------------
  // Color Configuration
  // ----------------------------------------------------------------------------

  getSliceColor: Ember.computed('numSlices', 'colorScale', function() {
    var _this = this;
    return function(d, i) {
      var index, numSlices, _ref;
      if ((_ref = d.data) != null ? _ref.color : void 0) {
        return d.data.color;
      }
      numSlices = _this.get('numSlices');
      index = numSlices - i - 1;
      if (numSlices !== 1) {
        index = index / (numSlices - 1);
      }
      return _this.get('colorScale')(index);
    };
  }),

  // ----------------------------------------------------------------------------
  // Legend Configuration
  // ----------------------------------------------------------------------------

  legendItems: Ember.computed('otherData', 'rejectedData', function() {
    return this.get('otherData').concat(this.get('rejectedData'));
  }),

  hasLegend: Ember.computed('legendItems.length', 'showLegend', function() {
    return this.get('legendItems.length') > 0 && this.get('showLegend');
  }),

  // ----------------------------------------------------------------------------
  // Tooltip Configuration
  // ----------------------------------------------------------------------------

  showDetails: Ember.computed('isInteractive', function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(d, i, element) {
      var content, data, formatLabelFunction, value;
      d3.select(element).classed('hovered', true);
      data = d.data;
      if (data._otherItems) {
        value = _this.get('otherDataValue');
      } else {
        value = data.value;
      }
      formatLabelFunction = _this.get('formatLabelFunction');
      content = "<span class=\"tip-label\">" + data.label + "</span>";
      content += "<span class=\"name\">" + (_this.get('tooltipValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatLabelFunction(value)) + "</span>";
      return _this.showTooltip(content, d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    var _this = this;
    return function(d, i, element) {
      d3.select(element).classed('hovered', false);
      var data = d.data;
      if (data._otherItems) {
        return _this.get('viewport').select('.legend').classed('hovered', false);
      } else {
        return _this.hideTooltip();
      }
    };
  }),

  // ----------------------------------------------------------------------------
  // Styles/Layout Functions
  // ----------------------------------------------------------------------------

  // SVG transform to center pie in the viewport
  transformViewport: Ember.computed('marginLeft', 'marginTop', 'width', 'height', function() {
    var cx = this.get('marginLeft') + this.get('width') / 2;
    var cy = this.get('marginTop') + this.get('height') / 2;
    return "translate(" + cx + "," + cy + ")";
  }),

  // Arc drawing function for pie with specified pieRadius
  arc: Ember.computed('pieRadius', function() {
    return d3.svg.arc().outerRadius(this.get('pieRadius')).innerRadius(0);
  }),

  // Pie layout function starting with the largest slice at zero degrees or
  // 12 oclock. Since the data is already sorted, this goes largest to smallest
  // counter clockwise
  pie: Ember.computed('startOffset', function() {
    return d3.layout.pie().startAngle(this.get('startOffset')).endAngle(this.get('startOffset') + Math.PI * 2).sort(null).value(function(d) {
      return d.percent;
    });
  }),

  groupAttrs: Ember.computed(function() {
    return {
      'class': function(d) {
        return ((d.data._otherItems) ? 'arc other-slice' : 'arc');
      }
    };
  }),

  sliceAttrs: Ember.computed('arc', 'getSliceColor', function() {
    return {
      d: this.get('arc'),
      fill: this.get('getSliceColor'),
      stroke: this.get('getSliceColor')
    };
  }),

  labelAttrs: Ember.computed('arc', 'labelRadius', 'numSlices', 'mostTintedColor', function() {
    var mostTintedColor;
    var arc = this.get('arc');
    var labelRadius = this.get('labelRadius');
    // these are the label regions that are already filled
    var usedLabelPositions = {
      left: [],
      right: []
    };
    // assumes height of all the labels are the same
    var labelOverlap = function(side, ypos, height) {
      var positions = usedLabelPositions[side];
      _.each(positions, function(pos) {
        if (Math.abs(ypos - pos) < height) {
          return true;
        }
      });
      return false;
    };
    if (this.get('numSlices') > 1) {
      return {
        dy: '.35em',
        // Clear any special label styling that may have been set when only
        // displaying one data point on the chart
        style: null,
        'stroke-width': 0,
          // Anchor the text depending on whether the label is on the left or
          // right side of the pie, note that because of the angle offset we do
          // for the first pie slice we need to pay attention to the angle being
          // greater than 2*Math.PI
        'text-anchor': function(d) {
          var angle = (d.endAngle - d.startAngle) * 0.5 + d.startAngle;
          return ((Math.PI < angle && angle < 2 * Math.PI)) ? 'end' : 'start';
        },

        // Position labels just outside of arc center outside of pie, making sure
        // not to create any two labels too close to each other. Since labels are
        // placed sequentially, we check the height where the last label was
        // placed,and if the new label overlaps the last, move the new label one
        // label's height away
        transform: function(d) {
          var x = arc.centroid(d)[0];
          var y = arc.centroid(d)[1];

          var f = function(d) {
            return d / Math.sqrt(x * x + y * y) * labelRadius;
          };
          var labelXPos = f(x);
          var labelYPos = f(y);
          var labelHeight = this.getBBox().height;
          var side = labelXPos > 0 ? 'right' : 'left';
          if (labelOverlap(side, labelYPos, labelHeight)) {
            if (side === 'right') {
              labelYPos = _.max(usedLabelPositions[side]) + labelHeight;
            } else {
              labelYPos = _.min(usedLabelPositions[side]) - labelHeight;
            }
          }
          usedLabelPositions[side].push(labelYPos);
          return "translate(" + labelXPos + "," + labelYPos + ")";
        }
      };
    } else {
      // When there is only one label, position it in the middle of the chart.
      // This resolves a bug where rendering a chart with a single label multiple
      // times may cause the label to jitter, since lastXPos and lastYPos retain
      // their values from the last layout of the chart.
      mostTintedColor = this.get('mostTintedColor');
      return {
        dy: '.71em',
        'stroke-width': 0,
        'text-anchor': 'middle',
        transform: null,
        style: "fill:" + mostTintedColor + ";"
      };
    }
  }),

  // ----------------------------------------------------------------------------
  // Selections
  // ----------------------------------------------------------------------------

  groups: Ember.computed(function() {
    var data = this.get('pie')(this.get('finishedData'));
    return this.get('viewport').selectAll('.arc').data(data);
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  renderVars: ['pieRadius', 'labelWidth', 'finishedData'],

  drawChart: function() {
    this.updateData();
    this.updateGraphic();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },


  updateData: function() {
    var entering, groups, hideDetails, showDetails;
    groups = this.get('groups');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    entering = groups.enter().append('g').attr({
      "class": 'arc'
    }).on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    entering.append('path').attr('class', 'slice');
    entering.append('text').attr('class', 'data');
    return groups.exit().remove();
  },

  updateGraphic: function() {
    var groups = this.get('groups').attr(this.get('groupAttrs'));
    groups.select('path').attr(this.get('sliceAttrs'));
    
    var labelWidth = this.get('labelWidth');
    var labelTrimmer = LabelTrimmer.create({
      getLabelSize: function() {
        return labelWidth;
      },
      getLabelText: function(d) {
        return d.data.label;
      }
    });

    return groups.select('text.data').text(function(d) {
      return d.data.label;
    }).attr(this.get('labelAttrs'))
      .call(labelTrimmer.get('trim'))
      .text(function(d) {
        return "" + this.textContent + ", " + d.data.percent + "%";
    });
  }

});
