var fs = require('fs.extra');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'javascripts/<%= pkg.name %>',
        dest: '<%= pkg.name.slice(0,-3) %>.min.js'
      }
    },
    watch: {
        examples: {
            files: ['examples/*.html'],
            options: {
                livereload: true
            }
        },
        javascripts: {
       	    files: ['javascripts/*.js']
        }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['uglify', 'watch']);

  grunt.event.on('watch', function(action, filepath) {
  	var pkg = grunt.file.readJSON('package.json');
    fs.copy("javascripts/"+pkg.name, pkg.name);
  });

};
