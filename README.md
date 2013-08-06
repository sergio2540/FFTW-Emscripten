FFTW-Emscripten
===========

FFTW compiled to JavaScript.

##Requirements:
  * [FFTW](https://github.com/FFTW/fftw3)
  * [Emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)
  * [program-editor](https://github.com/crowdprocess/program-editor)


##Usage:

####Compile c code: 
  `make c CC=gcc LIBC=path/to/libfftw3`
 
####Run c code: 
   
  `make run-c`
   or 
  `make run-c ARGV=audioArray.txt`

####Compile js code: 
  `make cp EMCC=path/to/emscripten/emcc`

####Run js with [program-editor](https://github.com/crowdprocess/program-editor): 
   `make run-editor`

#####See: [Makefile](https://github.com/sergio2540/FFTW-Emscripten/blob/master/Makefile)
