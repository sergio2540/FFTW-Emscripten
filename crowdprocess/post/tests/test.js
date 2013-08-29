var test_input = require('./test_input'); 
var poststream = require('../lib/poststream');
var fs = require('fs');
var es = require('event-stream');

var test = require('tape');



test_input_separated = test_input.map(function(unit){return [unit]});

//test_input_all = [test_input];

var input_stream = es.pipeline(es.readArray(test_input_separated),
							   es.stringify());
	
	//atencao aos eventos
	input_stream.pipe(poststream());

	
test('create directories 1, 2 and 3.',function(t){
	
	t.plan(2*3);

	fs.stat("./1",function(err,stats){
		t.error(err,'directory 1 exists');
		t.ok(stats.isDirectory(),'1 should be a directory.');
	});
	fs.stat("./2",function(err,stats){
		t.error(err,'directory 2 exists');
		t.ok(stats.isDirectory(),'2 should be a directory.');
	});
	fs.stat("./3",function(err,stats){
		t.error(err,'directory 3 exists');
		t.ok(stats.isDirectory(),'3 should be a directory.');
	});

});

test('create stdout and stderr files in directory 1.',function(t){
	
	t.plan(2*2);
	

	fs.stat("./1/stdout",function(err,stats){
	
		t.error(err,'stdout exists.\n')
		t.ok(stats.isFile(),'stdout should be a file.');
	});

	fs.stat("./1/stderr",function(err,stats){
		t.error(err,'stderr exists\n')
		t.ok(stats.isFile(),'stderr should be a file.');
	});

	/*
	fs.stat("./files",function(err,stats){
		t.error(err,'test stderr is a file throw a exception!')
		t.ok(stats.isDirectory(),':) files is a file.');
	});
*/
	
});

test('create stdout and stderr files in directory 2.',function(t){
	
	t.plan(2*2);
	

	fs.stat("./2/stdout",function(err,stats){
	
		t.error(err,'stdout exists.')
		t.ok(stats.isFile(),'stdout should be a file.');
	});

	fs.stat("./2/stderr",function(err,stats){
		t.error(err,'stderr exists.')
		t.ok(stats.isFile(),':) stderr should be a file.');
	});


	
});

test('create stdout and stderr files in directory 3.',function(t){
	
	t.plan(2*2);


	fs.stat("./3/stdout",function(err,stats){
	
		t.error(err,'stdout exists.')
		t.ok(stats.isFile(),'stdout should be a file.');
	});

	fs.stat("./3/stderr",function(err,stats){
		t.error(err,'stderr exists.')
		t.ok(stats.isFile(),'stderr should be a file.');
	});



});
