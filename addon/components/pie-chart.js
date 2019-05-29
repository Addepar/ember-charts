import Ember from 'ember';
import ChartComponent from './chart-component';
import FormattableMixin from '../mixins/formattable';
import FloatingTooltipMixin from '../mixins/floating-tooltip';
import SortableChartMixin from '../mixins/sortable-chart';
import PieLegendMixin from '../mixins/pie-legend';
import LabelWidthMixin from '../mixins/label-width';

import LabelTrimmer from '../utils/label-trimmer';

const PieChartComponent = ChartComponent.extend(FloatingTooltipMixin,
  FormattableMixin, SortableChartMixin, PieLegendMixin, LabelWidthMixin, {

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

  // Essentially we don't want a maximum pieRadius
  maxRadius: 2000,

  // top and bottom margin will never be smaller than this
  // you can use this to ensure that your labels don't get pushed off
  // the top / bottom when your labels are large or the chart is very small
  minimumTopBottomMargin: 0,

  // Allows the user to configure maximum number of decimal places in data labels
  maxDecimalPlace: 0,

  // When the Pie Chart has a high probability of having label intersections in
  // its default form, rotate the Pie by this amount so that the smallest slices
  // will start from the 2 o'clock to 4 o'clock positions.
  rotationOffset: 1/4 * Math.PI,

  // Allows the user to configure whether Rounded Zero Percent Slices should be
  // included inside of the Pie Chart. For example, if maxDecimalPlace = 0 and
  // there was a slice of 0.3%, that slice would be rounded down to 0%
  includeRoundedZeroPercentSlices: true,

  willDestroyElement: function() {
    if(this._hasMouseEventListeners) {
      let viewportArc = this.getViewportArc();
      viewportArc.on('mouseover', null);
      viewportArc.on('mouseout', null);
    }
    this._super(...arguments);
  },

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
      return child.value >= 0;
    });
  }),

  // Negative values that have been discarded from the data
  rejectedData: Ember.computed('data.[]', function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter((child) => child.value < 0);
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

    data = data.map((d) => {
      return {
        color: d.color,
        label: d.label,
        value: d.value,
        percent: 100.0*d.value / total
      };
    });

    return _.sortBy(data, this.get('sortKey'));
  }),

  otherLabel: 'Other',

  // This takes the sorted slices that have percents calculated and returns
  // sorted slices that obey the "other" slice aggregation rules
  //
  // When Other is the largest slice, Other is last and the data is sorted in order
  // When Other is not the largest slice, Other is the first and the data after it is sorted in order
  sortedDataWithOther: Ember.computed('sortedData', 'maxNumberOfSlices', 'minSlicePercent', 'maxDecimalPlace', 'includeRoundedZeroPercentSlices', function() {
    var lastItem, overflowSlices, slicesLeft;

    var data = _.cloneDeep(this.get('sortedData')).reverse();
    var maxNumberOfSlices = this.get('maxNumberOfSlices');
    var minSlicePercent = this.get('minSlicePercent');
    var otherItems = [];
    var otherSlice = {
      label: this.get('otherLabel'),
      percent: 0.0,
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

    // Only push other slice if there is more than one other item
    if (otherItems.length === 1) {
      slicesLeft.push(otherItems[0]);
    } else if (otherSlice.percent > 0) {
      // When Other is the largest slice, add to the front of the list. Otherwise to the back
      //
      // Ensures that excessively large "Other" slices will be accounted during pie chart rotation.
      // This will prevent labels from intersecting when "Other" is extremely large
      if (otherSlice.percent > slicesLeft[0].percent) {
        slicesLeft.unshift(otherSlice);
      } else {
        slicesLeft.push(otherSlice);
      }
    }

    // Round all slices to the appropriate decimal place
    var maxDecimalPlace = this.get('maxDecimalPlace');
    var roundSlices = function(sliceList) {
      sliceList.forEach(function(slice) {
        slice.percent = d3.round(1.0 * slice.percent, maxDecimalPlace);
      });
    };

    roundSlices(slicesLeft);
    roundSlices(otherItems);

    // Filter zero percent slices out of the pie chart after they have been rounded
    var filterRoundedZeroPercentSlices = function(sliceList) {
      return sliceList.filter(function(slice) {
        return slice.percent !== 0;
      });
    };

    if (this.get('includeRoundedZeroPercentSlices') === false) {
      slicesLeft = filterRoundedZeroPercentSlices(slicesLeft);
    }

    return slicesLeft.reverse();
  }),

  otherData: Ember.computed('sortedDataWithOther.[]', 'sortFunction', function() {
    var otherSlice = _.find(this.get('sortedDataWithOther'), function(d) {
      return d._otherItems;
    });

    var otherItems;
    if (otherSlice != null && otherSlice._otherItems != null) {
      otherItems = otherSlice._otherItems;
    } else {
      otherItems = [];
    }

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

  // Normally, the pie chart should offset slices so that the largest slice
  // finishes at 12 o'clock
  //
  // However, always setting the largest slice at 12 o'clock can cause significant
  // difficulty while dealing with label intersections. This problem is exacerbated
  // when certain configurations of pie charts lead to a high density of
  // small slice labels at the 6 o'clock or 11:30 positions.
  //
  // Therefore, rotate the pie and concentrate all small slices at 8 to 10 o'clock
  // if there is a high density of small slices inside the pie. This will ensure
  // that there is plenty of space for labels
  startOffset: Ember.computed('finishedData', 'sortKey', 'rotationOffset', function() {
    var detectDenseSmallSlices = function (finishedData) {
      // This constant determines how many slices to use to calculate the
      // average small slice percentage. The smaller the constant, the more it
      // focuses on the smallest slices within the pie.
      //
      // Empirically, using a sample size of 2 works very well.
      var smallSliceSampleSize = 2;

      var sortedData = _.sortBy(finishedData, "percent");
      var startIndex = 0;
      var endIndex = Math.min(smallSliceSampleSize, sortedData.length);
      var largestSlicePercent = _.last(sortedData).percent;

      var averageSmallSlicesPercent = sortedData.slice(startIndex, endIndex).reduce(function(p,d) {
        return d.percent / (endIndex - startIndex) + p;
      }, 0);

      // When slices smaller than 2.75 percent are concentrated in any location,
      // there is a high probability of label intersections.
      //
      // However, empirical label intersect evidence has demonstrated that this
      // threshold must be increased to 5% when there are multiple small slices
      // from the 5 o'clock to 7 o'clock positions
      if (averageSmallSlicesPercent <= 2.75) {
        return true;
      } else if ((averageSmallSlicesPercent <= 5) && (45 <= largestSlicePercent) && (largestSlicePercent <= 55)) {
        return true;
      }
      return false;
    };

    var finishedData = this.get('finishedData');
    if (Ember.isEmpty(finishedData)) {
      return 0;
    }

    // The sum is not necessarily 100% all of the time because of rounding
    //
    // For example, consider finishedData percentages (1.3%, 1.3%, 1.4%, 96%).
    // They will round to (1%, 1%, 1%, and 96%) when maxDecimalPlace = 0 by
    // default, which then sums to 99%.
    var sum = finishedData.reduce(function(p, d) {
      return d.percent + p;
    }, 0);

    if (detectDenseSmallSlices(finishedData)) {
      return this.get('rotationOffset');
    } else {
      return _.last(finishedData).percent / sum * 2 * Math.PI;
    }
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
    return (d, i) => {
      var index, numSlices;
      if (d.data && d.data.color) {
        return d.data.color;
      }
      numSlices = this.get('numSlices');
      index = numSlices - i - 1;
      if (numSlices !== 1) {
        index = index / (numSlices - 1);
      }
      return this.get('colorScale')(index);
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
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return (d, i, element) => {
      var content, data, formatLabelFunction, value;
      d3.select(element).classed('hovered', true);
      data = d.data;
      if (data._otherItems) {
        value = this.get('otherDataValue');
      } else {
        value = data.value;
      }
      formatLabelFunction = this.get('formatLabelFunction');

      content = $('<span>');
      content.append($('<span class="tip-label">').text(data.label));
      content.append($('<span class="name">').text(this.get('tooltipValueDisplayName') + ': '));
      content.append($('<span class="value">').text(formatLabelFunction(value)));
      return this.showTooltip(content.html(), d3.event);
    };
  }),

  hideDetails: Ember.computed('isInteractive', function() {
    if (!this.get('isInteractive')) {
      return Ember.K;
    }

    return (d, i, element) => {
      d3.select(element).classed('hovered', false);
      var data = d.data;
      if (data._otherItems) {
        return this.get('viewport').select('.legend').classed('hovered', false);
      } else {
        return this.hideTooltip();
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
        return d.data._otherItems ? 'arc other-slice' : 'arc';
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
      return _.some(positions, function(pos) {
        return Math.abs(ypos - pos) < height;
      });
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
          var angle = ((d.endAngle - d.startAngle) * 0.5 + d.startAngle) % (2*Math.PI);
          return (Math.PI < angle && angle < 2 * Math.PI) ? 'end' : 'start';
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

          // When labelYPos is adjusted to prevent label overlapping, this function
          // interpolates the updated labelXPos using the Pythagorean Theorem
          // so that the new label position will be realigned with the pie surface.
          //
          // This is extremely important. Only updating the labelYPos without
          // updating the corresponding labelXPos could accidentally place the label
          // in such a way that intersects with the pie itself!
          //
          // Note - There is an edge case for 12 o'clock and 6 o'clock
          // label overlaps when the updated labelYPos becomes larger than the
          // labelRadius. In this case, we set the labelXPos to 0 instead of
          // letting it be negative (which would incorrectly place the label
          // on the opposite side of the pie).
          var calculateXPos = function(labelYPos) {
            return Math.sqrt(Math.max(Math.pow(labelRadius,2) - Math.pow(labelYPos,2), 0));
          };

          if (labelOverlap(side, labelYPos, labelHeight)) {
            if (side === 'right') {
              labelYPos = _.max(usedLabelPositions[side]) + labelHeight;
              labelXPos = calculateXPos(labelYPos);
            } else {
              labelYPos = _.min(usedLabelPositions[side]) - labelHeight;
              labelXPos = -1 * calculateXPos(labelYPos);
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

  getViewportArc() {
    return this.get('viewport').selectAll('.arc');
  },

  groups: Ember.computed(function() {
    var data = this.get('pie')(this.get('finishedData'));
    return this.getViewportArc().data(data);
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  renderVars: [
    'pieRadius',
    'labelWidth',
    'finishedData',
    'startOffset'
  ],

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
    this._hasMouseEventListeners = true;
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

    var maxLabelWidth = this.get('outerWidth') / 2 - this.get('labelPadding');
    var labelTrimmer = LabelTrimmer.create({
      // override from LabelTrimmer
      reservedCharLength: 4,
      getLabelSize: function(d, selection) {
        // To calculate the label size, we need to identify the horizontal position `xPos` of the current label from the center.
        // Subtracting `xPos` from `maxLabelWidth` will provide the maximum space available for the label.

        // First select the text element from `selection` that is being currently trimmed.
        var text = selection.filter(function(data) {
          return data === d;
        });
        // Then calculate horizontal translation (0,0 is at the center of the pie) of the text element by:
        // a) Read the current transform of the element via text.attr("transform"). The transform has been applied by `this.get('labelAttrs')`.
        // b) parse the transform string to return instance of d3.transform()
        // c) from transform object, read translate[0] property for horizontal translation
        var xPos = d3.transform(text.attr("transform")).translate[0];
        return maxLabelWidth - Math.abs(xPos);
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

export default PieChartComponent;
