/* jslint node: true */
'use strict';

/*
* @name /Gruntfile.js
* @description Le Gruntfile...
*              keep this tidy, alphabeticised etc
* @since Ddd Mmm D YYYY
* @author Your Name <your.name@holidayextras.com>
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
		}
	} );

	// load tasks from the specified grunt plugins...
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jscs-checker' );

	// register task alias'
	grunt.registerTask( 'default', ['jshint', 'jscs'] );
	grunt.registerTask( 'test', ['test'] );

};