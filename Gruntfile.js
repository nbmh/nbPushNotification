/* global module */

'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    clean: {
      dist: [
        'dist/**',
        'dist/*'
      ]
    },
    concat: {
      options: {
        separator: "\n\n"
      },
      src: {
        src: [
          'src/**/*.js'
        ],
        dest: 'dist/nbPushNotification.js'
      }
    },
    uglify: {
      src: {
        options: {
          sourceMap: false,
          preserveComments: false,
          report: 'gzip'
        },
        files: {
          'dist/nbPushNotification.min.js': [
            'src/*.js',
            'src/**/*.js'
          ]
        }
      },
      dist: {
        options: {
          sourceMap: false,
          preserveComments: false,
          report: 'gzip'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: '**/*.js',
          dest: 'dist/'
        }]
      }
    },
    copy: {
      src: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**/*.js',
          dest: 'dist/'
        }]
      },
      min: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**/*.js',
          dest: 'dist/',
          rename: function(dest, src) {
            return dest + src.replace('.js', '.min.js');
          }
        }]
      }
    }
  });
    
  grunt.registerTask('dist', function () {
    grunt.task.run(['clean:dist', 'copy:min', 'uglify:dist', 'copy:src', 'uglify:src', 'concat:src']);
  });
};