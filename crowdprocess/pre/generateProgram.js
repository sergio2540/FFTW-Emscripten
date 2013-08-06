var LZString = require('./LZString');
var fs = require('fs');
//var optimist = require('optimist');
var path = require('path');


//var argv = optimist.argv;
        
//--config    

var configPath = process.cwd();

try {
    var configJSON = fs.readFileSync(configPath+"/io.json");
} catch(e){
    //TODO: melhorar as mensagens de erro
    console.error(e);
    process.exit(1);
}

try {
    var config = JSON.parse(configJSON);
}catch(e){
    console.error("Failed: var config = JSON.parse("+configJSON+");");
    console.error("Error parsing io.json");
    process.exit(1);
}
//alias

var args = [];

//TODO: Dar a possiblidade de passar argumentos
var template = fs.readFileSync("template.js",'utf8');
var arguments = config['argv'];

arguments.forEach(function (arg, index) {
        if (arg === "_.json") {
            args.push(
                       "if(Array.isArray(d))",
                           "d.forEach(function(val) { Module['arguments'].push(val.toString()); });",
                       "else",
                           "Module['arguments'].push(d.toString());"
                       );
        }
        else {
            args.push("Module['arguments'].push('" + arg + "');");
        }  
    
});



template = template.replace("{{{ARGS}}}",args.join('\n'));

//fs.writeFileSync("_.preJsTemplate.js", data);
//console.log("_.preJsTemplate.js criado.");

var output = config['output'];

 var out = [];

    output.forEach(function(file) { 
        //(file === "_.json") ? 
        //out.push("Module['return']['files']['" + file + "'] = intArrayToString(FS.root.contents['" + file + "'].contents)"); :
        out.push("Module['return']['files']['" + file + "'] = LZString.compressToBase64(intArrayToString(FS.root.contents['" + file + "'].contents))");
        
    });

template = template.replace("{{{FILES_OUT}}}",out.join('\n'));

var lz = fs.readFileSync('./LZString.js','ascii');

template = template.replace("{{{LZString}}}",lz);

    //fs.writeFileSync("_.postJsTemplate.js", postJsTemplate.join("\n"));
    //console.log("_.postJsTemplate.js criado.");
    

//var data = fs.readFileSync(process.argv[2],'binary');

var filesIn = [];

var processInputFile =  function (file){
	var data = fs.readFileSync(file,'utf8');
	var compressedData = LZString.compressToBase64(data); 
	var dirname = path.dirname(file);
	var basename = path.basename(file);
	filesIn.push("Module['FS_createDataFile']('"+ dirname +"', '"+ basename +"',LZString.decompressFromBase64('"+ compressedData +"'), true, true);");
	
};

var input = config['input'];

input.map(processInputFile);
template = template.replace("{{{FILES_IN}}}",filesIn.join('\n'));



var genetatedCode = fs.readFileSync(process.argv[2]);

template = template.replace("{{{GENERATED_CODE}}}",genetatedCode);

fs.writeFileSync(process.argv[3],template);



