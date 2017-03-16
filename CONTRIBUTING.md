# Contributing to Ember Charts

Looking to contribute something to Ember Charts? Here's how you can help.

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.


## Using the issue tracker

The [issue tracker](https://github.com/Addepar/ember-charts/issues) is
the preferred channel for [bug reports](#bug-reports),
[feature requests](#feature-requests) and
[submitting pull requests](#pull-requests), but please respect the following
restrictions:

* Please **do not** use the issue tracker for personal support requests.  Stack
  Overflow
  ([`ember-charts`](http://stackoverflow.com/questions/tagged/ember-charts) tag)
  is a better place to get help.

* Please **do not** derail or troll issues. Keep the discussion on topic and
  respect the opinions of others.


## Bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful, so thanks!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been
   reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the
   latest `master` or development branch in the repository.

3. **Isolate the problem** &mdash; ideally create a reduced test
   case and a live example. The starter kit JS Bin on the README page is a
   helpful template.


## Feature requests

Feature requests are welcome, but take a moment to find out whether your idea
fits with the scope and aims of Ember Charts. It's up to *you* to make a strong
case to convince the Ember Charts developer community of the merits of this
feature. Please provide as much detail and context as possible.


## Writing Code in Ember Charts

Ember Charts uses newer/non-portable JavaScript features, such as
ECMAScript 6 modules. Contributing to Ember Charts requires that you have NPM
(for pulling in dependencies) locally installed.

The folder structure of Ember Charts is as follows:

- The `ember-charts/addon` folder contains almost all the source code for the
  ES6 modules making up the ember-charts project itself.
- The `ember-charts/app` folder contains very thin wrappers around the modules
  in the `addon` folder, used as part of the test executor and demo app.
- The `ember-charts/tests` folder contains the tests for Ember Charts, including:
  * Unit tests: `ember-charts/tests/unit`
  * The demo application you get with `ember serve`: `ember-charts/tests/dummy`
  * Acceptance tests for the demo app: `ember-charts/tests/acceptance`


## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic
help. They should remain focused in scope and avoid containing unrelated
commits.

**Please ask first** before embarking on any significant pull request (e.g.
implementing features, refactoring code, porting to a different language),
otherwise you risk spending a lot of time working on something that
other Ember Charts developers might not want to merge into the project.


Adhering to the following process is the best way to get your work
included in Ember Charts:

1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork,
   and configure the remotes:

   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/ember-charts.git
   # Navigate to the newly cloned directory
   cd ember-charts
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/Addepar/ember-charts.git
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout master
   git pull upstream master
   ```

3. Create a new topic branch (off the main project development branch) to
   contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```

4. Commit your changes in logical chunks. Please adhere to these [git commit
   message guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   or your code is unlikely be merged into the main project. Use Git's
   [interactive rebase](https://help.github.com/articles/interactive-rebase)
   feature to tidy up your commits before making them public.

5. Locally merge (or rebase) the upstream development branch into your topic branch:

   ```bash
   git pull [--rebase] upstream master
   ```

6. Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

7. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/)
    with a clear title and description against the `master` branch.

**IMPORTANT**: By submitting a patch, you agree to allow Addepar to
license your work under the terms of the [BSD License](LICENSE.md).


## Running tests

Like many other Ember-CLI packages, Ember Charts runs its tests with:

```bash
ember test
```

When you push any changes to any branch of the Addepar/ember-charts
git repository on GitHub, `ember test` will be automatically run
by [Travis-CI](https://travis-ci.org/Addepar/ember-charts).
Unfortunately, as far as we know, this service is not
available for your GitHub fork repo.


## Syntax:

* Two spaces, no tabs.
* No trailing whitespace. Blank lines should not have any space.
* a = b and not a=b.
* Follow the conventions you see used in the source already.


## License

As noted above, by contributing your code, you agree to license
your contribution under the [BSD License](LICENSE.md).


#### NOTE: Largely copied from https://github.com/twbs/bootstrap/blob/master/CONTRIBUTING.md
