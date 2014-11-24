module.exports = function (grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: ['dist', '*.zip'],
            post: ['dist/js/auth', 'dist/js/helper', 'dist/js/ui', 'dist/css/*', '!dist/css/*.min.css']
        },
        copy: {
            dist: {
                files: [
                    { src: ['**/*', '!**/*.css'], dest: 'dist/', cwd: 'src/', expand: true }
                ]
            }
        },
        jshint: {
            beforeconcat: ['gruntfile.js', 'src/js/**/*.js'],
        },
        less: {
            options: {
                cleancss: true
            },
            src: { cwd: 'dist/css', dest: 'dist/css', src: '*.less', ext: '.css', expand: true }
        },
        useminPrepare: {
            html: 'dist/index.php'
        },
        usemin: {
            html: 'dist/index.php'
        },
        concat: {
            options: {
                sourcesContent: true
            }
        },
        rev: {
            assets: {
                files: [
                    { src: ["dist/js/*.js", "dist/css/*.min.css"] }
                ]
            }
        },
        compress: {
            dist: {
                options: {
                    archive: "AdobePassRefApp.zip"
                },
                cwd:'./',
                src: ['**', '!node_modules/**', '!**/src/**/*.css'],
                expand:true,
                dest:'./'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('build', ['clean:dist', 'jshint:beforeconcat', 'copy', 'less', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'rev', 'usemin', 'clean:post']);
    grunt.registerTask('build_dev', ['clean:dist', 'jshint:beforeconcat', 'copy', 'less']);
    grunt.registerTask('zip', ['clean:dist', 'compress']);
    grunt.registerTask('zip_dev', ['compress']);
    grunt.registerTask('default', 'build');
};
