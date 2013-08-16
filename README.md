FFTW-Emscripten
===========

FFTW example compiled to JavaScript.

##Requirements:

  * [FFTW](https://github.com/FFTW/fftw3)
  * [Emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)
  * [program-editor](https://github.com/crowdprocess/program-editor)
  * [crowdprocess-cli](https://github.com/CrowdProcess/crp-cli)

##Recommended reading:

 * [Mustache manual](http://mustache.github.io/mustache.5.html)
 * [Emscripten/wiki/Filesystem Guide](https://github.com/kripken/emscripten/wiki/Filesystem-Guide)
  
#####See: [template.mustache](https://github.com/sergio2540/FireSim-Emscripten/blob/master/crowdprocess/pre/template/template.mustache)

 * [HOWTO: Port a C/C++ Library to JavaScript (xml.js)@blog.mozakai](http://mozakai.blogspot.pt/2012/03/howto-port-cc-library-to-javascript.html)
 * [FFTW docs](http://www.fftw.org/fftw3_doc/)

##Usage:

###Install: 

```bash
  cd ./FFTW-Emscripten
  make install
```

####Compile c code: 
  `make c CC=gcc LIBC=path/to/libfftw3`
 
####Run c code: 
   
  `make run-c`
   or 
  `make run-c ARGV=audioArray.txt`

###Compile js code: 

```bash 
  make cp EMCC=path/to/emscripten/emcc
```

###Generate data.json:

######See: [Explain crowdprocess/pre/data](https://gist.github.com/sergio2540/b5b45f9e13e533ea056d)

###Generate program.js:

######See: [Explain crowdprocess/view/data](https://gist.github.com/sergio2540/fac873fccde43bb98b44)
       
###Run js with [program-editor](https://github.com/crowdprocess/program-editor): 

```bash
   make run-editor
```
###Run js with [crowdprocess-cli](https://github.com/CrowdProcess/crp-cli):
```bash
   make run-io
```

#####See: [Makefile](https://github.com/sergio2540/FFTW-Emscripten/blob/master/Makefile)
