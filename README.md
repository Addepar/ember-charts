# Ember Charts [![Build Status](https://secure.travis-ci.org/Addepar/ember-charts.svg?branch=master)](https://travis-ci.org/Addepar/ember-charts)

A charting library built with the Ember.js and d3.js frameworks. It includes
time series, bar, pie, and scatter charts which are easy to extend and modify.
The out-of-the-box behavior these chart components represents our thoughts on
best practices in chart interactivity and presentation.


## Demo and Documentation
https://opensource.addepar.com/ember-charts/


## Getting Started

#### JS Bin Starter Kit

https://emberjs.jsbin.com/rekawobugu/1/edit

Unfortunately, this version of Ember Charts is out of date,
and the current maintainers of Ember Charts at Addepar have not been
able to update it recently.

#### Installation with Ember CLI (Recommended)

Ember Charts is an Ember CLI addon published to the public NPM
repository at https://www.npmjs.com/package/ember-charts ,
so it can be installed like so:

```bash
# ember-cli >= 0.2.0
ember install:addon ember-charts

# ember-cli >= 0.2.3
ember install ember-charts
```

Once it's installed, you can customize the look of Ember Charts with CSS.

#### Installation with Bower (Globals-Based Version)

```bash
npm install -g bower      # install Bower
bower install ember-charts --save
```

Using Ember Charts with bower is **deprecated** and will eventually be removed.
We recommend that you migrate your apps to Ember CLI! Documentation has been
updated to show Ember CLI usage. If you need documentation for globals-based
use, please check out version 0.5.0 of Ember Charts and follow the setup
instructions under "Running Old Versions" to display the old guides.

#### Developing or Testing

After cloning this repo, install dependencies and run the demo application:

```bash
yarn
bower install
ember serve
```

Now you can:
- View the demos and read the documentation: http://localhost:4200
- Run tests: http://localhost:4200/tests


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

Ember Charts uses [Semantic Versioning](https://semver.org) to keep track of
releases using the following format:

`<major>.<minor>.<patch>`

In a nutshell, this means:
* Breaking changes to the API or behavior increases the major version
* Adding functionality in a backwards-compatible way increases the minor version
* Making backwards-compatible bug fixes increases the patch version


## Releasing a New Version (For Maintainers)
Prior to releasing, ensure that the CHANGELOG.md is updated to track any changes
that have been made since the prior release.

We increment version numbers and release using [release-it](https://github.com/webpro/release-it):

```bash
yarn run release-it <options>
```

The local configuration file for `release-it` is named `.release.json`, found in the
root directory of the repository.

By default, `release-it` without options will increment the
<patch> version number (`X.Y.Z` --> `X.Y.(Z+1)`) in the `VERSION` file and
`package.json` file, and then commit the resulting changes to the ember-charts
git repository.

If you want to control the version number, use these options:

```bash
yarn run release-it major # 1.2.3 -> 2.0.0
yarn run release-it minor # 1.2.3 -> 1.3.0
yarn run release-it X.Y.Z # 1.2.3 -> X.Y.Z
```

Ember Charts has also configured `release-it` to automatically update the `gh-pages`
branch (from which the demo and documentation website is published). This is done using
the "distribution repository" feature of `release-it`, which pushes the `/ember-dist/`
directory after constructing it with `ember build`. These options can be seen in the
`.release.json` file under "dist" options.

`release-it` is also configured to automatically publish the updated version to
`npm`. Previously we could not do this using `release-it` because it would attempt to
publish the `dist.repo` instead of the source repo, but we can now override that using
`"forcePublishSourceRepo": true` in `.release.json`.

Lastly, the new version should be released on Github, which can be done via the Github UI
after the steps above are complete.

## Copyright and License
Copyright © 2013 Addepar, Inc. All Rights Reserved

Licensed under the BSD License (the "License"); you may not use this work
except in compliance with the License. You may obtain a copy of the License in
the [LICENSE.md](LICENSE.md) file.
