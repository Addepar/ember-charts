# Gruntfile courtesy of trek (https://github.com/trek/)
# ember-todos-with-build-tools-tests-and-other-modern-conveniences
module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-qunit"
  grunt.loadNpmTasks "grunt-neuter"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-ember-templates"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-less"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-karma"
  grunt.loadNpmTasks "grunt-banner"
  grunt.loadNpmTasks "grunt-text-replace"
  grunt.loadNpmTasks "grunt-release-it"

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    banner: '/*!\n* <%=pkg.name %> v<%=pkg.version%>\n' +
            '* Copyright 2012-<%=grunt.template.today("yyyy")%> Addepar Inc.\n' +
            '* See LICENSE.\n*/',

    clean:
      target: ['build', 'dist' , 'gh_pages']

    coffee:
      options:
        bare: true
      src:
        expand: true
        cwd: "src/"
        src: [ "**/*.coffee" ]
        dest: "build/src/"
        ext: ".js"
      app:
        expand: true
        cwd: "app/"
        src: [ "**/*.coffee" ]
        dest: "build/app/"
        ext: ".js"
      tests:
        expand: true
        cwd: "tests/"
        src: ["**/*.coffee" ]
        dest: "build/tests/"
        ext: ".js"

    emberTemplates:
      options:
        templateName: (sourceFile) ->
          sourceFile.replace(/app\/templates\//, '')
                    .replace(/src\/templates\//, '')
      src:
        files:
          'build/src/templates.js': ["src/templates/**/*.hbs"]
      app:
        files:
          'build/app/templates.js': ["app/templates/**/*.hbs"]

    neuter:
      options:
        includeSourceURL: no
      src:
        files:
          "dist/ember-charts.js": "build/src/ember_charts.js"
      app:
        files:
          "gh_pages/app.js": "build/app/app.js"

    uglify:
      "dist/ember-charts.min.js": "dist/ember-charts.js"

    less:
      options:
        yuicompress: no
      src:
        files:
          "dist/ember-charts.css": "src/css/ember-charts.less"
      app:
        files:
          "gh_pages/css/app.css": "app/assets/css/app.less"

    ###
      Copy build/app/assets/css into gh_pages/asset and other assets from docs
    ###
    copy:
      app:
        files: [
          {src: ['dist/css/ember-charts.css'], dest: 'gh_pages/css/ember-charts.css'},
          {src: ['app/index.html'], dest: 'gh_pages/index.html'},
          {expand: true, cwd: 'dependencies/', src: ['**/*.js'], dest: 'gh_pages/lib'},
          {expand: true, cwd: 'dependencies/', src: ['**/*.css'], dest: 'gh_pages/lib'},
          {expand: true, cwd: 'vendor/', src: ['**/*.js'], dest: 'gh_pages/lib'},
          {expand: true, cwd: 'vendor/', src: ['**/*.css'], dest: 'gh_pages/lib'},
          {expand: true, cwd: 'dependencies/font-awesome/fonts/', src: ['**'], dest: 'gh_pages/lib/font-awesome/fonts'},
          {expand: true, cwd: 'app/assets/font/', src: ['**'], dest: 'gh_pages/fonts'},
          {expand: true, cwd: 'app/assets/img/', src: ['**'],  dest: 'gh_pages/img'}
        ]

    # https://github.com/yatskevich/grunt-bower-task
    bower:
      install:
        options:
          targetDir: 'vendor'
          layout: 'byComponent'
          verbose: true
          copy: false

    replace:
      global_version:
        src: ['VERSION']
        overwrite: true
        replacements: [
          from: /.*\..*\..*/
          to: '<%=pkg.version%>'
        ]
      src:
        src: ['src/dist.coffee']
        overwrite: true
        replacements: [
          from: /Ember.Charts.VERSION = '.*\..*\..*'/
          to: "Ember.Charts.VERSION = '<%=pkg.version%>'"
        ]
      app:
        src: ['app/templates/ember_charts/overview.hbs']
        overwrite: true,
        replacements: [{
          from: /The current version is .*\..*\..*./
          to: "The current version is <%=pkg.version%>."
        }]

    usebanner:
      js:
        options:
          banner: '<%=banner%>'
        files:
          src: ['dist/*.js']
      css:
        options:
          banner: '<%=banner%>'
        files:
          src: ['dist/*.css']

    ###
      Reads the projects .jshintrc file and applies coding
      standards. Doesn't lint the dependencies or test
      support files.
    ###
    jshint:
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', '!dependencies/*.*', '!test/support/*.*']
      options:
        jshintrc: ".jshintrc"

    ###
      Watch files for changes.

      Changes in dependencies/ember.js or src javascript
      will trigger the neuter task.

      Changes to any templates will trigger the emberTemplates
      task (which writes a new compiled file into dependencies/)
      and then neuter all the files again.
    ###
    watch:
      grunt:
        files: [ "Gruntfile.coffee" ]
        tasks: [ "default" ]
      src:
        files: [ "src/**/*.coffee"]
        tasks: [ "coffee:src", "neuter:src", "uglify", "usebanner:js" ]
      test:
        files: [ "tests/**/*.coffee"]
        tasks: [ "coffee:tests" ]
      src_handlebars:
        files: [ "src/**/*.hbs" ]
        tasks: [ "emberTemplates:src", "neuter:src", "uglify", "usebanner:js" ]
      app:
        files: [ "app/**/*.coffee", "dependencies/**/*.js", "vendor/**/*.js" ]
        tasks: [ "coffee:app", "neuter:app" ]
      app_handlebars:
        files: [ "app/**/*.hbs"]
        tasks: [ "emberTemplates:app", "neuter:app" ]
      less:
        files: [ "app/assets/**/*.less", "app/assets/**/*.cmss", "src/**/*.less" ]
        tasks: [ "less", "copy", "usebanner:css" ]
      copy:
        files: [ "app/index.html" ]
        tasks: [ "copy" ]
      bower:
        files: [ 'bower.json']
        tasks: [ 'bower']

    ###
      Runs all .html files found in the test/ directory through PhantomJS.
      Prints the report in your terminal.
    ###
    qunit:
      all: [ "build/tests/**/*.html" ]
        
    karma:
      continuous:  # continuous integration mode
        configFile: 'karma.conf.js'
        singleRun: true
      unit:
        configFile: 'karma.conf.js'
        singleRun: false
        exclude: ['build/src/ember_charts.js', 'build/tests/functional/*.js'],
      functional:
        configFile: 'karma.conf.js'
        singleRun: false
        exclude: ['build/src/ember_charts.js', 'build/tests/unit/*.js'],
      default:
        configFile: 'karma.conf.js'
        singleRun: false

    ###
      Find all the <whatever>_test.js files in the test folder.
      These will get loaded via script tags when the task is run.
      This gets run as part of the larger 'test' task registered
      below.
    ###
    build_test_runner_file:
      all: [ "build/tests/**/*_test.js" ]

    "release-it":
      options:
        "pkgFiles": ["package.json", "bower.json"]
        "commitMessage": "Release %s"
        "tagName": "v%s"
        "tagAnnotation": "Release %s"
        "increment": "patch"
        "buildCommand": "grunt dist"
        "distRepo": "-b gh-pages git@github.com:Addepar/ember-charts"
        "distStageDir": ".stage"
        "distBase": "gh_pages"
        "distFiles": ["**/*"]
        "publish": false

  ###
    A task to build the test runner html file that get place in
    /test so it will be picked up by the qunit task. Will
    place a single <script> tag into the body for every file passed to
    its coniguration above in the grunt.initConfig above.
  ###
  grunt.registerMultiTask "build_test_runner_file", "Creates a test runner file.", ->
    tmpl = grunt.file.read("tests/support/runner.html.tmpl")
    renderingContext = data:
      files: @filesSrc.map (fileSrc) -> fileSrc.replace "build/tests/", ""
    grunt.file.write "build/tests/runner.html", grunt.template.process(tmpl, renderingContext)

  grunt.registerTask "build_src", [ "coffee:src", "emberTemplates:src", "neuter:src" ]
  grunt.registerTask "build_app", [ "replace:app", "coffee:app", "emberTemplates:app", "neuter:app", "copy:app" ]
  grunt.registerTask "build_tests", [ "coffee:tests" ]

  grunt.registerTask "dist", [ "clean", "bower", "replace:src", "build_src", "less:src", "uglify", "usebanner" ]
  grunt.registerTask "default", [ "dist", "build_app", "build_tests", "watch" ]
