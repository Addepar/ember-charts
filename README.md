# Ember Charts [![Build Status](https://secure.travis-ci.org/Addepar/ember-charts.svg?branch=master)](http://travis-ci.org/Addepar/ember-charts)

A charting library built with the Ember.js and d3.js frameworks. It includes
time series, bar, pie, and scatter charts which are easy to extend and modify.
The out-of-the-box behavior these chart components represents our thoughts on
best practices in chart interactivity and presentation.


## Demo and Documentation
http://opensource.addepar.com/ember-charts/


## Getting Started

#### JS Bin Starter Kit

http://emberjs.jsbin.com/rekawobugu/1/edit

#### Installation with Ember CLI (Recommended)

```bash
# ember-cli >= 0.2.0
ember install:addon ember-charts

# ember-cli >= 0.2.3
ember install ember-charts
```

Once it's installed, you can customize the look of ember-charts with CSS.

#### Installation with Bower (Globals-Based Version)

```bash
npm install -g bower      # install Bower
bower install ember-charts --save
```

Or, just include `dist/ember-charts.js` and `dist/ember-charts.css` in your app.

Using Ember Charts with bower is **deprecated** and will eventually be removed.
We recommend that you migrate your apps to Ember CLI! Documentation has been
updated to show Ember CLI usage. If you need documentation for globals-based
use, please check out version 0.5.0 of Ember Charts and follow the setup
instructions under "Running Old Versions" to display the old guides.

#### Developing or Testing

After cloning this repo, install dependencies and run the demo app:

```bash
npm install
bower install
ember serve
```

Now you can:
- View the examples at: http://localhost:4200
- Run tests at: http://localhost:4200/tests

Before submitting a pull request, please compile the globals-based version of
Ember Charts (the `dist` folder):

```bash
npm install -g grunt-cli      # install grunt
grunt dist
```

## Dependencies
* ember
* lodash
* d3
* jquery-ui


## Browser Support

We aim to support the last two major versions of every common browser.

If you need to support further browsers, we welcome pull requests with fixes.

Touch support may work but has not been tested.


## Contributing

Got something to add? Great! Bug reports, feature ideas, and (especially) pull
requests are extremely helpful, and this project wouldn't be where it is today
without lots of help from the community.

Please read the [contribution guidelines](CONTRIBUTING.md) for directions on
opening issues and working on the project.


## Versioning

Ember Charts uses [Semantic Versioning](http://semver.org) to keep track of
releases using the following format:

`<major>.<minor>.<patch>`

In a nutshell, this means:
* Breaking changes to the API or behavior increases the major version
* Adding functionality in a backwards-compatible way increases the minor version
* Making backwards-compatible bug fixes increases the patch version


## Maintainers
Update version numbers and release using https://github.com/webpro/grunt-release-it:

```
$ vim CHANGELOG.md
$ grunt release-it:<options>
```

By default, this will release a new patch version. Other suggested commands:

```
$ grunt release-it:minor
$ grunt release-it:major
$ grunt release-it:X.Y.Z
```

Ember Charts uses the "distribution repository" feature of `release-it` to push to
the `gh-pages` branch and update documentation. When prompted, do NOT update the
tag for the distribution repository. We'll streamline the release process a bit
more soon.


## Copyright and License
Copyright © 2013 Addepar, Inc. All Rights Reserved

Licensed under the BSD License (the "License"); you may not use this work
except in compliance with the License. You may obtain a copy of the License in
the LICENSE.md file.
