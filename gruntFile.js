module.exports = function(grunt) {
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-inline');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');


	grunt.initConfig({
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'src/css',
					src: ['*.css', '!*.min.css'],
					dest: 'dist/css',
					ext: '.min.css'
				}]
			}
		},
		uglify: {
			build: {
				files: [{
					expand: true,
					cwd: 'src/js',
					src: ['*.js','!*.min.js'],
					dest: 'dist/js',
					ext: '.min.js'
				}]
			}
		},
		inline: {
	        dist: {
	            src: 'src/index.html',
	            dest: 'index.html'
	        }
    	},
    	htmlmin: {
    		dist: {
    			options: {
    				removeComments: true,
    				collapseWhitespace: true
    			},
    			files: {
    				'index.html': 'index.html'
    			}
    		}
    	}
	});

	grunt.registerTask('default', ["cssmin", "uglify","inline", "htmlmin"]);
};