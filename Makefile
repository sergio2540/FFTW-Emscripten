#Directory with c code
C_DIR= ./c

#Directory with js code
JS_DIR= ./js

#Directory with js code, data.json (data/), 
#script to generate program.js (pre/)
#and script for post processing (post/)
CROWDPROCESS_DIR= ./crowdprocess

#C compiler
CC = gcc

#Flags to C compiler
CFLAGS=-O2 

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
EMCC=~/emscripten/emcc

#Flags for emscripten C compiler
#-O<optimization level>
#See: https://github.com/kripken/emscripten/wiki/Optimizing-Code
EMCCFLAGS=-O0

#Various compiling-to-JS parameters.
#See https://github.com/kripken/emscripten/blob/master/src/settings.js
SETTINGS= -s BUILD_AS_WORKER=1 -s ASMJS=1 -s INVOKE_RUN=0

#FFTWTest arguments  

#./EXEC 1arg 
#node EXEC.js 1arg 
 
#1arg: audio array filename

ARGV= "audioArray.txt"

#Audio array 

AUDIOARRAY= ./audio/audioArray.txt

#Data file
#See /crowdprocess/data/data.json and #Firesim arguments  

#Fixed


DATA= ./data/data.json

RESULTS_DIR= $(CROWDPROCESS_DIR)/results

all: c js cp

c: 
	mkdir -p $(C_DIR)/build/;
	cd $(C_DIR); \
	$(CC) $(CFLAGS) $(SOURCES) -o build/$(EXEC) $(LIBC)
	
run-c:
	cp -r $(AUDIOARRAY) $(C_DIR)/build; \
	cd $(C_DIR)/build; \
	./$(EXEC) $(ARGV); \
	rm -f $(C_DIR)/build/audioArray.txt

js:
	mkdir -p $(JS_DIR)/build; \
	cd $(C_DIR); \
	$(EMCC) $(EMCCFLAGS) $(SOURCES) ../$(LIBJS) $(SETTINGS) -o ../$(JS_DIR)/build/$(EXEC).js 
 
run-js:
	cd $(JS_DIR)/build/ && node ./$(EXEC).js $(ARGV)

cp: js
	mkdir -p $(CROWDPROCESS_DIR)/build
	cp -r $(AUDIOARRAY) $(CROWDPROCESS_DIR)/pre/; \
	cd $(CROWDPROCESS_DIR)/pre/; \
	node generateProgram.js ../../$(JS_DIR)/build/$(EXEC).js ../build/$(EXEC).js; \
	rm -f ./audioArray.txt

run-editor:
	@program-editor -p $(CROWDPROCESS_DIR)/build/$(EXEC).js
clean:
	rm -rf $(C_DIR)/build
	rm -rf $(JS_DIR)/build
	rm -rf $(CROWDPROCESS_DIR)/build


#!!!!not tested!!!!
run-io: cp io process-results

#!!!!not tested!!!!
process-results:
	node post/processResults.js $(RESULTS_DIR)/results.json
io:
	mkdir -p $(RESULTS_DIR)
	@cat $(CROWDPROCESS_DIR)/$(DATA) | crowdprocess io -p $(CROWDPROCESS_DIR)/build/$(EXEC).js > $(RESULTS_DIR)/results.json




.PHONY: all c run-c js run-js cp run-io run-editor clean process-results io
