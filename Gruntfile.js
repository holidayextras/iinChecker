/* jslint node: true */
'use strict';

/*
* @name /Gruntfile.js
* @description Gruntfile. Used to run tests and lint the code
*              keep this tidy, alphabeticised etc
* @author Simon Wood <simon.wood@holidayextras.com>
*/


module.exports = function( grunt ) {

	// project configuration
	grunt.initConfig( {
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			core: {
				src: ['Gruntfile.js', 'package.json']
			},
			test: {
				src: ['test/**/*.js', 'test/**/*.json']
			}
		},
		jscs: {
			options: {
				config: 'shortbreaks.jscs.json'
			},
			src: ['<%= jshint.core.src %>', '<%= jshint.test.src %>']
		},
		mochaTest: {
			options: {
				reporter: 'spec'
			},
			src: ['test/**/*.js']
		}
	} );

	// load tasks from the specified grunt plugins...
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );
	grunt.loadNpmTasks( 'grunt-mocha-test' );

	// register task alias'
	grunt.registerTask( 'default', ['jshint', 'jscs'] );
	grunt.registerTask( 'test', ['mochaTest'] );

};