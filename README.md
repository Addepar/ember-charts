# Ember Charts

A charting library built with the Ember.js and d3.js frameworks. It includes
time series, bar, pie, and scatter charts which are easy to extend and modify.
The out-of-the-box behavior these chart components represents our thoughts on
best practices in chart interactivity and presentation.


## Demo and Documentation
http://addepar.github.io/ember-charts/


## Getting Started

#### JS Bin Starter Kit

http://emberjs.jsbin.com/rekawobugu/1/edit

#### Installation

With bower: `bower install ember-charts --save`

Or, just include `dist/ember-charts.js` and `dist/ember-charts.css` in your app.

Once it's installed, you can customize the look of ember-charts with CSS.

#### Developing or Testing

After cloning this repo, install dependencies and compile with grunt:

```bash
$ npm install -g grunt-cli
$ npm install
$ grunt
```

To view examples, start the node server. From the root directory:

`$ node example.js`.

You can view the examples at http://localhost:8000/gh_pages.

## Dependencies
* d3
* ember
* jquery
* jquery-ui
* lodash

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


### Maintainers
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
Copyright © 2015 Addepar, Inc. All Rights Reserved

Licensed under the BSD License (the "License"); you may not use this work
except in compliance with the License. You may obtain a copy of the License in
the LICENSE file.
