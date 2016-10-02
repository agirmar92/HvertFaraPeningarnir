// Karma configuration
// Generated on Sun Apr 10 2016 16:41:24 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/angular-loading-bar/src/loading-bar.js',
        'http://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-1.1.2.js',
        'https://cdn.firebase.com/js/client/2.2.4/firebase.js',
        'https://cdn.firebase.com/libs/angularfire/1.1.3/angularfire.min.js',
        'js/**/*.js',
        'spec/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
        'js/canvasjs.min.js',
        'js/d3pie.min.js',
        'js/d3pie.js',
        'js/controllers/chartController.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'js/**/*.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
        type: 'cobertura',
        dir:  'coverage/'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', /*'Firefox', 'Safari'*/],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
