import Ember from 'ember';
const PieLegendMixin = Ember.Mixin.create({

  // ----------------------------------------------------------------------------
  // Legend settings
  // ----------------------------------------------------------------------------

  // Padding at top and bottom of legend. Legend is positioned adjacent to the
  // bottom of the viewport, with legendVerticalPadding pixels separating top of
  // legend and chart graphic
  // TODO(tony): This should take into account the label heights of the pie to
  // guarrantee no intersection with them
  legendVerticalPadding: 30,

  // Padding on left and right of legend text is a percentage of total width
  legendHorizontalPadding: Ember.computed('outerWidth', function() {
    return 0.2 * this.get('outerWidth');
  }),

  // Maximum height of the actual text in the legend
  maxLabelHeight: Ember.computed('outerHeight', function() {
    return 0.05 * this.get('outerHeight');
  }),

  // Toggle for whether or not to show the legend
  // if you want to override default legend behavior, override showLegend
  showLegend: true,

  // ----------------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------------

  legendWidth: Ember.computed('outerWidth', 'legendHorizontalPadding', function() {
    return this.get('outerWidth') - this.get('legendHorizontalPadding');
  }),

  // Height of max possible text height + padding. This is not the height of the
  // actual legend displayed just the total amount of room the legend might need
  legendHeight: Ember.computed('maxLabelHeight', 'legendVerticalPadding', function() {
    return this.get('maxLabelHeight') + this.get('legendVerticalPadding') * 2;
  }),

  // ----------------------------------------------------------------------------
  // Styles
  // ----------------------------------------------------------------------------

  // Center the legend at the bottom of the chart drawing area. Since the legend
  // is inside the chart viewport, which has already been centered only consider
  // the height of the chart.

  legendAttrs: Ember.computed('outerHeight', 'marginTop', 'marginBottom', function() {
    var dx = 0;
    // This will leave a bit of padding due to the fact that marginBottom is
    // larger than marginTop which centers the pie above the middle of the chart
    // Note(edward): The marginBottom is not larger than marginTop when there may
    // be labels at the top.
    // In the default case where marginTop is 0.3 * marginBottom, the below
    // evaluates to 0.
    var offsetToLegend = 0.15 * (this.get('marginBottom')) - (this.get('marginTop')) / 2;
    var dy = this.get('outerHeight') / 2 + offsetToLegend;

    return {
      transform: "translate(" + dx + ", " + dy + ")"
    };
  }),

  legendLabelAttrs: Ember.computed(function() {
    return {
      style: "text-anchor:middle;",
      y: '-.35em'
    };
  }),

  // ----------------------------------------------------------------------------
  // Selections
  // ----------------------------------------------------------------------------

  legend: Ember.computed(function() {
    var legend = this.get('viewport').select('.legend');
    if (legend.empty()) {
      return this.get('viewport').append('g').attr('class', 'legend');
    } else {
      return legend;
    }
  }).volatile(),

  // ----------------------------------------------------------------------------
  // Drawing Functions
  // ----------------------------------------------------------------------------

  clearLegend: function() {
    return this.get('viewport').select('.legend .labels').remove();
  },

  drawLegend: function() {
    var currentText, rowNode;
    if (!this.get('showLegend')) {
      return;
    }
    this.clearLegend();
    var legend = this.get('legend').attr(this.get('legendAttrs'));

    // Bind hover state to the legend
    var otherSlice = this.get('viewport').select('.other-slice');
    if (this.get('isInteractive') && !otherSlice.empty()) {
      legend.on('mouseover', function() {
        otherSlice.classed('hovered', true);
        return legend.classed('hovered', true);
      }).on('mouseout', function() {
        otherSlice.classed('hovered', false);
        return legend.classed('hovered', false);
      });
    }

    // Create text elements within .labels group for each row of labels
    var labels = legend.append('g').attr('class', 'labels');
    var labelStrings = this.get('legendItems').map(function(d) {
      if (d.percent != null) {
        return "" + d.label + " (" + d.percent + "%)";
      } else {
        return d.label;
      }
    });
    var row = labels.append('text')
                .text("Other: " + labelStrings[0])
                .attr(this.get('legendLabelAttrs'));

    // Try adding each label. If that makes the current line too long,
    // remove it and insert the label on the next line in its own <text>
    // element, incrementing labelTop. Stop adding rows if that would
    // cause labelTop to exceed the space allocated for the legend.
    var labelTop = 0;

    const remainingLabelStrings = labelStrings.slice(1);
    for (var i = 0; i < remainingLabelStrings.length; i++) {
      let nextLabel = remainingLabelStrings[i];
      currentText = row.text();
      row.text("" + currentText + ", " + nextLabel);
      rowNode = row.node();
      if (rowNode.getBBox().width > this.get('legendWidth')) {
        if (labelTop + rowNode.getBBox().height > this.get('maxLabelHeight')) {
          row.text("" + currentText + ", ...");
          break;
        } else {
          row.text("" + currentText + ",");
          labelTop += rowNode.getBBox().height;
          row = labels.append('text').text(nextLabel).attr(this.get('legendLabelAttrs')).attr('dy', labelTop);
        }
      }
    }
    // Align the lowermost row of the block of labels against the bottom margin
    return labels.attr('transform', "translate(0, " + (-labelTop) + ")");
  }
});

export default PieLegendMixin;
