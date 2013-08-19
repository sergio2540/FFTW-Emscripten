#!/usr/bin/env bash

sudo npm install -g https://github.com/CrowdProcess/program-editor/archive/master.tar.gz
sudo npm install -g crowdprocess-cli
sudo npm install -g
mkdir -p ./c/lib/ 
wget http://fftw.org/fftw-3.3.3.tar.gz
tar -xvf fftw-3.3.3.tar.gz
cd fftw-3.3.3 
./configure --disable-fortran --libdir=`readlink -f ../c/lib/`
sudo make
sudo make install
cd ..
