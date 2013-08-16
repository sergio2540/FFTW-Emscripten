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

 * [Building projects with emscripten](https://github.com/kripken/emscripten/wiki/Building-Projects)
 * [HOWTO: Port a C/C++ Library to JavaScript (xml.js)@blog.mozakai](http://mozakai.blogspot.pt/2012/03/howto-port-cc-library-to-javascript.html)
 * [FFTW docs](http://www.fftw.org/fftw3_doc/)

##Usage:

###Install: 

```bash
  cd ./FFTW-Emscripten
  make install
```

###Compile c code: 

```bash 
   make c CC=gcc LIBC=path/to/libfftw3
```
 
###Run c code: 

```bash   
  make run-c
  make run-c ARGV=audioArray.txt
```

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

###Generate libfftw3 with [emscripten](https://github.com/kripken/emscripten/):

```bash   
  wget http://fftw.org/fftw-3.3.3.tar.gz
  tar -xvf fftw-3.3.3.tar.gz
  cd fftw-3.3.3
  path/to/emscripten/emconfigure ./configure --disable-fortran --libdir=../crowdprocess/lib
  path/to/emscripten/emmake make
  path/to/emscripten/emmake make install
```

######See:[Building projects](https://github.com/kripken/emscripten/wiki/Building-Projects) and [crowdprocess/lib](https://github.com/sergio2540/FFTW-Emscripten/tree/master/crowdprocess/lib)
