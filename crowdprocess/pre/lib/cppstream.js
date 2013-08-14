var fs = require('fs');

var es = require('event-stream');
var async = require('async');
var Mustache = require('mustache');
var JSONStream = require('JSONStream');

var cpdstream = require('./cpdstream');


module.exports = function(template,compress){

var gview;
var t;

var s = es.pipeline(            
			JSONStream.parse(),
			es.map(function(view,callback){
				
				gview = view;

				async.parallel({
					template : function(callback){
							fs.readFile(template,'utf8',callback);
					},
					code : function(callback){
							fs.readFile(view.program.code,'utf8',callback);
					},
					compress : function(callback){
							fs.readFile(view.program.compress,'utf8',callback);
					}
				},function(err,results){

					if(err) callback(err,null);

					
					t = results.template;
					gview.program.code = results.code;
					gview.program.compress = results.compress;
				
					callback(null,view.program.data);

				});
			}),
			JSONStream.stringify(false),
			cpdstream("./lib/LZString.js"),
			JSONStream.parse([true]),
			es.map(function(data,callback){
				gview.program.data = data;
				var z = Mustache.compile(t)
				callback(null,z(gview));
			})
			
);

return s;
}
