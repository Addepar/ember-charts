# Ember Charts Changelog

### Ember Charts 1.2.2 _(October 24, 2018)_
  Fixes minor bugs and implements some minor security improvements throughout the repository.

  * Updates lodash dependency to v4.17.4
  * Fixes a minor bug for horizontal bar charts where the width could be set to a negative
    value in certain edge cases, causing issues (#217)
  * Fixes a minor bug with chart colors in which the chart would not be able to parse an RGB color
    passed in by the user
  * Changes links in README, config files, and dummy app to use HTTPS instead of HTTP, and removes
    usages of target="_BLANK" in dummy app to remove security vulnerability (#223)

### Ember Charts 1.2.1 _(March 16, 2017)_
  Minor documentation updates and small bugfixes:

  * Updates documentation for installing and maintaining ember-charts (#192, #201)
  * Removes grunt dependencies and grunt-generated global dist files that were
    necessary prior to the Ember-CLI upgrade, and updates the documentation
    accordingly (#201)
  * Fixes a bug where labels in line series charts could be off by one day (#198)
  * Prevent modifying attributes during the render cycle (#189, improves #155)

### Ember Charts 1.2.0 _(October 28, 2016)_
  Most important: A number of reflected cross-site scripting (XSS) vulnerabilities
  were fixed (1050884d5bc17658f017666fbca15605481661ad, #177, #178).
  Our sincerest apologies for these. If you have further
  concerns about the security of Ember-Charts or other Addepar software,
  always feel free to send email to [security at addepar dot com].

  Second most important: A new Stacked Vertical Bar chart (#171) has been added!
  It works a little differently from the partial bar stacking feature of
  Vertical Bar charts, which is now deprecated. Please consult the documentation
  of this feature and the demo application to learn more.

  Finally, some bug fixes and smaller features:

  * In Horizontal Bar charts: When the chart is interactive (allows ToolTips
    on mouse hover), the chart width now adjusts for the presence of a scrollbar (#190)
  * In Scatter charts: The chart height now honors the bottom margin
    setting for the chart (#188)
  * In Time Series charts:
    * Minor ticks will no longer be drawn with overlapping labels when the chart is made
      narrow enough to hide the labels and then made wider again (#176)
    * If the heuristically computed interval between bars is different
      from the interval you selected, then the bars will now be drawn in
      the correct place even if you also specify a bar offset (#185)
  * In Pie charts:
    * The Other slice width is no longer incorrectly rounded to 0% (#181)
    * There is now a `includeRoundedZeroPercentSlices` boolean property
      to toggle whether or not to show 0% width slices (#181)
  * In (unstacked) Vertical Bar charts:
    * When you mouse-hover over a stacking slice in a stacked chart (stacked
      using the deprecated old functionality) with only one bar,
      the legend ToolTip no longer shows "undefined: NaN"; fixes bug #167 (#171)
    * Per-bar color overrides are once again respected;
      this was regressed by 1.1.0 change #173 (#182)
    * For charts without bar groups, we once again respect `sortKey: "value"`
      in order to sort bars by value; this was regressed by 0.5.0 change #81 (#183)

### Ember Charts 1.1.0 _(August 9, 2016)_
  A major update with a ton of goodies for Time Series charts (#169)!

  * Minor ticks for Time Series charts have been fixed!
  * Label rotation is now available for greater label density
  * Custom interval specific filters can be added to your time series labeling
    implementation (#154)
  * Label filtering has been improved:
    * Now removes based on modulus to maintain consistent and coherent
      label spacing
    * Dynamic Labels option has been optimized with many of the iterators and
      loops replaced with MATH and computed properties
    * Dynamic labeling used to pick an interval that was more specific than the
      one that fits the graph

  Plus extra bug fixes and smaller features:

  * Incorrect wording in the documentation was fixed (#153, #170)
  * Fixed color on Scatter chart legend (#152)
  * Allow configuring whether to add margin padding to Scatter charts with the
    new `hasXDomainPadding` and `hasYDomainPadding` boolean properties (#150)
  * Pie Chart Decimal Point Formatting (#158)
  * Pie Chart Label Intersect Improvement (#159, #162)
  * Mismatched Node type would throw exceptions (#168)
  * Vertical Bar charts no longer incorrectly color their bars when their
    input data do not have the same number of bar data points for all bar groups;
    fixes bug #172 (#173)
  * The wrong bars were being highlighted on legend mouse hover in Vertical Bar charts;
    fixes bug #172 (#173)

### Ember Charts 1.0.0 _(November 4, 2015)_
  The first version of Ember Charts in the npm repository!
  Now Ember-CLI can download the modules-based version from the npm repo.
  Otherwise identical to 0.5.1.

### Ember Charts 0.5.1 _(November 3, 2015)_
  Minor update
  * Allow setting tick spacing for X and Y axes separately instead of one common
    value. It is backward compatible. (#113)

### Ember Charts 0.5.0 _(October 29, 2015)_
  This release ports all CoffeeScript to JavaScript and moves our build to
  use Ember-CLI, bringing support for Ember 1.9 and 1.10.

  Also:
  * Modules-based rather than globals-based usage
  * Documentation updates; thanks Okal (#78)
  * In grouped Vertical Bar charts, bars within a group are now sorted alphabetically
    by their bar label (#81) --
    NOTE: this caused a regression for ungrouped charts fixed in 1.2.0 (#183)
  * All charts that support sorting their data (have a `sortKey` property)
    now can sort ascending or descending with a `sortAscending` boolean property (#83, #84)
  * The placement of ticks in Time Series charts now adjusts when you resize the chart (#85)
  * We removed padding from charts that did not need it (#87, #91)
  * The hover ToolTip is now shown on the Other slice of Pie charts
    (14761a713c198d5d1dc8ae9f8168d488ad3537b1)
  * Pie charts now have a `showLegend` boolean property to toggle their legend (#92, #93)
  * Added heuristics to better choose appropriate X-axis tick spacing and labels
    for Time Series charts (#96)
  * Some improvements to the bar stacking in Vertical Bar charts (#98, #99);
    NOTE: this functionality has been deprecated by #171
  * Fixes Pie chart labels that were truncating even though there was ample
    whitespace

### Ember Charts 0.4.0 _(February 18, 2015)_

This will be the last ember-charts release to support Ember 1.8 and earlier
compiled templates. See #77 for more information on our upgrade process.

* Arbitrary keys are now supported for sorting pie and bar charts
* Custom label format strings are now supported for pie, bar, and time series
  charts
* Hours are now a supported option for selectedInterval in time series charts
* Numerous bugfixes and enhancements to pie charts
  * Margins no longer are larger than they need to be for labels and legends
  * Labels in pie charts can no longer overlap each other
  * A minimum margin option is now available for pie charts
* Other Bugfixes
  * Time series charts now rerender after data loads
  * Observers are torn down to fix application memory leaks
  * Hours and days now respect maxNumberOfLabels setting in time series charts
* Demo App and Documentation updated

### Ember Charts 0.3.0 _(October 23, 2014)_

* Make the group optional when building a tooltip
* Fix code style in chart functions for clarity
* Implement sort-by-value on vertical bar charts
* Allow axis labels on time series charts to be centered
* Fix bug `Assertion failed: Expected hash or Mixin instance`
* Implement more useful value labeling
* Refactor time series charts API
  * Remove stacked bar option
  * Add left bar offset
  * General refactoring and documentation
* Add Lo-Dash dependency to overview page
* Fix example app compilation dependencies
* Remove deprecation warning for `this.state`

### Ember Charts 0.2.0 _(July 21, 2014)_

* New README.md, CONTRIBUTING.md, and JS Bin example
* Add addepar-mixins as a part of charts
* Add bower install for external dependencies

### Ember Charts 0.1.0 _(June 20, 2014)_

* Initial release
