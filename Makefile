#Directory with c code
C_DIR= ./c

#Directory with js code, data.json (data/), 
#script to generate program.js (pre/)
#and script for post processing (post/)
CROWDPROCESS_DIR= ./crowdprocess

#C compiler
#CC=path/to/c_compiler
#Example: CC=cc
CC = cc

#Flags to C compiler
CFLAGS=-O1

#libc: lib compiled with gcc
LIBC= $(C_DIR)/lib/libfftw3.a

#Libjs: lib compiled with emscripten
LIBJS= $(JS_DIR)/lib/libfftw3.a

#C sources
SOURCES= FFTWTest.c 

#Executable name
EXEC=FFTWTest

#Emscripten C compiler
#EMCC=path/to/emscripten/emcc
#Example:
#EMCC= /home/sergio/emscripten/emcc 
EMCC=path/to/emscripten/emcc

#Flags for emscripten C compiler
#-O<optimization level>
#See: https://github.com/kripken/emscripten/wiki/Optimizing-Code
EMCCFLAGS=-O1

#Various compiling-to-JS parameters.
#See https://github.com/kripken/emscripten/blob/master/src/settings.js
SETTINGS= -s BUILD_AS_WORKER=1 -s ASMJS=1 -s INVOKE_RUN=0

#FFTWTest arguments  

#./EXEC 1arg 
#node EXEC.js 1arg 
 
#1arg: audio array filename

ARGV="audioArray.txt"

#Audio array 

AUDIOARRAY=./audio/audioArray.txt


DATA= ./data/data.json

RESULTS_DIR= $(CROWDPROCESS_DIR)/results

all: c cp

install:
	mkdir -p $(C_DIR)/lib/
	cd ./fftw3/ && ./configure && make && make install

c: 
	mkdir -p $(C_DIR)/build/;
	cd $(C_DIR); \
	$(CC) $(CFLAGS) $(SOURCES) -o build/$(EXEC) $(LIBC)
	
run-c:
	cp -r $(AUDIOARRAY) $(C_DIR)/build; \
	cd $(C_DIR)/build; \
	./$(EXEC) $(ARGV); \
	rm -f $(C_DIR)/build/audioArray.txt

cp:
	mkdir -p $(CROWDPROCESS_DIR)/build
	mkdir -p $(CROWDPROCESS_DIR)/data
	mkdir -p $(CROWDPROCESS_DIR)/pre/build
	cd $(C_DIR) && \
	$(EMCC) $(EMCCFLAGS) $(SOURCES) ../$(CROWDPROCESS_DIR)/$(LIBJS) $(SETTINGS) -o ../$(CROWDPROCESS_DIR)/pre/build/$(EXEC).js
	cd $(CROWDPROCESS_DIR)/pre/ &&\
	cat ./data/data.json | gencpd --compress ./lib/LZString > ../$(DATA) && \
	cat ./view/view.json | gencpp --template ./template/template.mustache > ../build/$(EXEC).js

run-editor:
	@program-editor -p $(CROWDPROCESS_DIR)/build/$(EXEC).js

run-example:
	cd ./example && node FFTWTest.js && less stdout

clean:
	rm -rf $(C_DIR)/build
	rm -rf $(CROWDPROCESS_DIR)/build
	rm -rf $(CROWDPROCESS_DIR)/data
	rm -rf $(CROWDPROCESS_DIR)/pre/build
	rm -rf $(CROWDPROCESS_DIR)/example/stdout


#!!!!not tested!!!!
run-io: io process-results

#!!!!not tested!!!!
process-results:
	node post/processResults.js $(RESULTS_DIR)/results.json
io:
	mkdir -p $(RESULTS_DIR)
	@cat $(CROWDPROCESS_DIR)/$(DATA) | crowdprocess io -p $(CROWDPROCESS_DIR)/build/$(EXEC).js > $(RESULTS_DIR)/results.json




.PHONY: all c run-c cp run-io run-editor clean process-results io
