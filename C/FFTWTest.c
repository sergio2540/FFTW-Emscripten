#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "fftw3.h"
#include <math.h>

static void print_usage (char *progname){
	printf ("\nUsage : %s <input file> <output file>\n", progname) ;
	puts ("\n"
		"    Where the output file will contain a line for each frame\n"
		"    and a column for each channel.\n"
		) ;
}

void printArray(float* Array, int channels, int frames, char *filename){
  
  int k, m;
  for (k = 0; k < frames ; k++){ 
    for (m = 0; m < channels ; m++)
      printf ("  %12.10f", Array [k * channels + m]) ;
    printf ("\n") ;
  } 

  return;
}

void createDFT(int N, float* audioArray, float* dftArray) {
  
  fftw_complex *in, *out;
  fftw_plan p;
  int nFrames;

  in = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * N);
  out = (fftw_complex*) fftw_malloc(sizeof(fftw_complex) * N);

  for (nFrames = 0; nFrames < N; nFrames++){
    in[nFrames][0] = audioArray[nFrames];
    in[nFrames][1] = 0;
  }

  p = fftw_plan_dft_1d(N, in, out, FFTW_FORWARD, FFTW_ESTIMATE);
  
  fftw_execute(p); 

  for (nFrames = 0; nFrames < N; nFrames++)
    dftArray[nFrames] = sqrtf( out[nFrames][0]*out[nFrames][0] + out[nFrames][1]*out[nFrames][1]);

  fftw_destroy_plan(p);
  fftw_free(in); 
  fftw_free(out);

}

int main (int argc, char * argv []){

	char 		*progname, *infilename;
  	float * audioArray;
  	float * dftArray;

	progname = strrchr (argv [0], '/') ;
	progname = progname ? progname + 1 : argv [0] ;

	if (argc != 2)
	{
		print_usage(progname);
		return 1 ;
	} 

	infilename = argv [1] ;

	if (infilename [0] == '-'){
  	printf ("Error : Input filename (%s) looks like an option.\n\n", infilename) ;
		print_usage (progname) ;
		return 1 ;
	}

	  
	int frames = 61258;
	int channels = 1;

	audioArray = malloc(frames*channels * sizeof(float));
	dftArray = malloc(frames*channels*sizeof(float)); //magnitude and stuff
	  
	FILE * pFile = fopen(argv[1],"r");
	if (pFile==NULL) {fputs ("File error",stderr); exit (1);}

	// obtain file size:
	fseek (pFile , 0 , SEEK_END);
	int lSize = ftell (pFile);
	rewind (pFile);
	  
	// allocate memory to contain the whole file:
	char *buffer = (char*) malloc (sizeof(char)*lSize);
	if (buffer == NULL) {fputs ("Memory error",stderr); exit (2);}

	// copy the file into the buffer:
	int result = fread (buffer,1,lSize,pFile);
	if (result != lSize) {fputs ("Reading error",stderr); exit (3);}

	/* the whole file is now loaded in the memory buffer. */
	  
	int i = 0;
	char *pch = strtok (buffer,"\n");
	while (pch != NULL)
	{
	   audioArray[i] = atof(pch);
	   i++;
	   pch = strtok (NULL, "\n");
	}

	// terminate
	fclose (pFile);
	free (buffer);
	  

	createDFT(frames, audioArray, dftArray);

	printArray(dftArray, channels,frames,argv[1]);
	  
	return 0;

} /* main */

