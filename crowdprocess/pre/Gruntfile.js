module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      files: ['gencp','../../Makefile'],
      tasks: ['shell']
    },
   shell: {
    makejs: {
        command: 'make cp EMCC=~/emscripten/emcc',
        options: {
            stdout: true,
            stderr: true,
	    execOptions: {
                cwd: '../../'
            }
        }
    }
  }
});


  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['watch','shell']);

};
