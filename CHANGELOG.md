# Ember Charts Changelog

### Ember Charts 0.5.1 _(November 03, 2015)_
  Minor update
  * Allow setting tick spacing for X and Y axes separately instead of one common
    value. It is backward compatible.

### Ember Charts 0.5.0 _(October 29, 2015)_
  This release ports all coffeescript to javascript and moves our build to
  use ember-cli.

  * Javascript
  * Ember-cli
  * Fixes pie chart labels that were truncating even though there was ample
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
