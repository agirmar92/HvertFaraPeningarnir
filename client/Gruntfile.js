module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['js/app.js', 'js/constants/*.js', 'js/controllers/*.js'],
        dest: 'build/app.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jasmine: true,
          angular: true,
          element: true,
          module: true,
          d3pie: true,
          console: true,
          by: true,
          io: true,
          _: false,
          $: false,
          jQuery: true,
          hfpApp: true,
          CanvasJS: true,
          Firebase: true
        },
      },
      uses_defaults: ['Gruntfile.js', 'js/app.js'],
      with_overrides: {
        options: {
          curly: false,
          undef: true,
        },
        files: {
          src: ['Gruntfile.js', 'js/app.js', 'js/constants/*.js', 'js/controllers/*.js', 'js/factories/*.js']
        },
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint',  'uglify']);

};
