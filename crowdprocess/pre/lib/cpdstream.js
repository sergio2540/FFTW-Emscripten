var fs = require('fs');
var path = require('path');
var async = require('async');
var es = require('event-stream');
var JSONStream = require('JSONStream');

var compress;


function process_file(file,callback){

	var filename = file.content;
	
	fs.readFile(filename,'binary',function(err,data){
		if(err){
			callback(err); //eachcallback
		}

		if(compress){
			file.content = compress(data);
			file.compress = true;
		}
		else  file.content = data;

			  callback(null); //eachcallback
	});
				  
}


function process_data_unit(obj,callback){

	if((obj.input) && (obj.input.files)){
		if(Array.isArray(obj.input.files)){
			async.each(obj.input.files,process_file,function(err){
				if(err) callback(err,null);
				callback(null,obj);
			});
			
		}
		else {
			callback(null,obj);		
		}
	}else {
		callback(null,obj);	
	}

	

}

//stdin: pre_data.json
//stdout: data.json	




module.exports = function(sourceCompress){	
		
	var s = es.pipeline(
		JSONStream.parse(),
		es.map(function(obj,callback){	
		

			if(sourceCompress){
				compress = require(path.resolve(sourceCompress)).compress;			
			}
		
			//validate json
			//or make this tests
		 	//need else with error message
		
			async.each(obj,process_data_unit,function(err){
					if(err) callback(err,null);
			
					callback(null,obj);	
			});
			
		
	
		}),
	    JSONStream.stringify(false)
	);

	return s;

}
