var es = require('event-stream');
var path = require('path');
var JSONStream = require('JSONStream');
var async = require('async');
var levelup = require('levelup');
var db = levelup("./db");

program.version('0.0.0')
        .usage('[options] <file ...>')
	.option('-k, --key <keyFunction.js>','js file with key function that takes data and return a unique key')
        .parse(process.argv);


var key;

function ord(data){

  	db.put(JSON.stringify(key(data)),JSON.stringify(data),{keyEnconding :'json'});

}

es.pipeline(process.stdin,
	    JSON.parse(),
	    es.map(function(dataUnit,callback){
		if(program.key) key = require(path.resolve(key)).key;
		async.each(dataUnit,ord,function(err){
			if(err) callback(err,null);
			callback(null,dataUnit);
		});
	    }),
	    db.createValueStream(),
	    process.stdout);






//put
//get
//delete


