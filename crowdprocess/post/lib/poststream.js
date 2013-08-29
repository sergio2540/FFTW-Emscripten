#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var lz = require('./LZString') 


function poststream(){

var folderId=1;

var s = es.pipeline(JSONStream.parse([true]),
	    es.map(function(unit,callback) {

	    	
	    	var folder = path.resolve(folderId.toString());
			
			fs.mkdirSync(folder);
			process.chdir(folder);
			
			//unit == {"output": {"stdout": "dasfdsaf","stderr": "sadsaf",files: [{"name": "dasf","content": "dsfdf"}]"}}
	   		
	   		var output = unit.output;
	   		var content;

			for(key in output){
		
				if ((key === "stdout") || (key === "stderr")){
        			
        			content = output[key];
					fs.writeFileSync(key,content);
				}
		   
				else if(key === "files"){
					
					var files = output[key];
      
            
					 for(key in files){
					 	//TODO: option decompress or not
    					content = lz.decompress(files[key]);
						fs.writeFileSync(key,content);
          			}

				}
				else {
					//OMG!!!
					throw new Error("Invalid key!");
				}
			}
			process.chdir('..');
			folderId++;
	
	   }));


return s;

}


module.exports = poststream;
