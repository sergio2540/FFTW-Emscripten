function Run(d){

{{{LZString}}}

{{{GENERATED_CODE}}}

Module = {};
Module['preRun'] = [];
Module['return'] = {};
Module['return']['files'] = {};
Module['return']['stdout'] = '';
Module['return']['stderr'] = '';

Module['preRun'].push(function () {
	
	{{{FILES_IN}}}

	Module['print'] = function(text){
		Module['return']['stdout'] += text + '\n';
	};

	Module['printErr'] = function(text){
		Module['return']['stderr'] += text + '\n';
	};
});

Module['arguments'] = [];

{{{ARGS}}}

Module.callMain(Module['arguments']);

{{{FILES_OUT}}}

return Module['return'];

}
