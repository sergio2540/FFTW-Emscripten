// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  Module['print'] = function(x) {
    console.log(x);
  };
  Module['printErr'] = function(x) {
    console.log(x);
  };
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
    dump(x);
  }) : (function(x) {
    // self.postMessage(x); // enable this if you want stdout to be sent as messages
  }));
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 4976;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,254,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,254,255,255,255,2,0,0,0,254,255,255,255,2,0,0,0,255,255,255,255,1,0,0,0,84,104,101,114,101,32,119,101,114,101,32,37,100,32,116,105,109,101,32,115,116,101,112,115,32,101,110,100,105,110,103,32,97,116,32,37,51,46,50,102,32,109,105,110,117,116,101,115,32,40,37,51,46,50,102,32,104,111,117,114,115,41,46,10,0,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,111,98,106,101,99,116,46,10,0,37,115,10,0,0,0,0,0,67,117,115,116,111,109,32,70,117,101,108,32,109,111,100,101,108,0,0,0,0,0,0,0,70,105,114,101,95,70,108,97,109,101,76,101,110,103,116,104,84,97,98,108,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,108,97,109,101,32,108,101,110,103,116,104,32,116,97,98,108,101,32,119,105,116,104,32,37,100,32,99,108,97,115,115,101,115,32,111,102,32,37,102,32,102,101,101,116,46,0,0,0,0,0,0,67,85,83,84,79,77,0,0,70,105,114,101,95,70,108,97,109,101,83,99,111,114,99,104,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,83,116,97,110,100,97,114,100,0,0,0,0,0,0,0,0,82,117,110,110,105,110,103,32,102,105,114,101,83,105,109,32,119,105,116,104,32,82,111,119,115,58,37,100,44,32,85,58,37,108,102,44,32,68,105,114,58,37,108,102,10,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,112,97,114,116,105,99,108,101,32,116,111,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,65,116,65,122,105,109,117,116,104,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,116,121,112,101,32,118,97,108,117,101,32,40,97,114,103,32,35,51,41,32,105,115,32,110,111,116,32,70,73,82,69,95,84,89,80,69,95,68,69,65,68,44,32,70,73,82,69,95,84,89,80,69,95,72,69,82,66,44,32,111,114,32,70,73,82,69,95,84,89,80,69,95,87,79,79,68,46,0,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,68,101,115,116,114,111,121,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,102,111,114,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,32,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,101,120,116,105,110,99,116,105,111,110,32,109,111,105,115,116,117,114,101,32,37,53,46,52,102,32,105,115,32,116,111,111,32,115,109,97,108,108,46,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,100,101,112,116,104,32,37,53,46,52,102,32,105,115,32,116,111,111,32,115,109,97,108,108,46,0,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,34,37,115,34,32,110,117,109,98,101,114,32,37,100,32,101,120,99,101,101,100,115,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,114,97,110,103,101,32,91,48,46,46,37,100,93,46,0,0,0,0,0,0,99,97,116,97,108,111,103,33,61,78,85,76,76,32,38,38,32,70,117,101,108,67,97,116,95,77,97,103,105,99,67,111,111,107,105,101,40,99,97,116,97,108,111,103,41,61,61,70,73,82,69,95,67,65,84,65,76,79,71,95,77,65,71,73,67,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,72,101,97,118,121,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,77,97,120,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,78,70,70,76,49,51,0,0,77,101,100,105,117,109,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,78,70,70,76,49,50,0,0,76,105,103,104,116,32,76,111,103,103,105,110,103,32,83,108,97,115,104,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,111,112,101,110,32,111,117,116,112,117,116,32,109,97,112,32,34,37,115,34,46,10,0,0,0,0,0,0,0,0,78,70,70,76,49,49,0,0,84,105,109,98,101,114,32,40,108,105,116,116,101,114,32,38,32,117,110,100,101,114,115,116,111,114,121,41,0,0,0,0,78,70,70,76,49,48,0,0,72,97,114,100,119,111,111,100,32,76,105,116,116,101,114,0,78,70,70,76,48,57,0,0,67,108,111,115,101,100,32,84,105,109,98,101,114,32,76,105,116,116,101,114,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,78,111,87,105,110,100,78,111,83,108,111,112,101,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,78,70,70,76,48,56,0,0,83,111,117,116,104,101,114,110,32,82,111,117,103,104,0,0,78,70,70,76,48,55,0,0,68,111,114,109,97,110,116,32,66,114,117,115,104,32,38,32,72,97,114,100,119,111,111,100,32,83,108,97,115,104,0,0,114,0,0,0,0,0,0,0,78,70,70,76,48,54,0,0,66,114,117,115,104,32,40,50,32,102,116,41,0,0,0,0,78,70,70,76,48,53,0,0,67,104,97,112,97,114,114,97,108,32,40,54,32,102,116,41,0,0,0,0,0,0,0,0,78,70,70,76,48,52,0,0,84,97,108,108,32,71,114,97,115,115,32,40,50,46,53,32,102,116,41,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,111,109,98,117,115,116,105,111,110,40,41,58,32,102,117,101,108,32,109,111,100,101,108,32,37,100,32,100,111,101,115,110,39,116,32,101,120,105,115,116,32,105,110,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,46,0,0,0,0,0,0,0,0,78,70,70,76,48,51,0,0,84,105,109,98,101,114,32,40,103,114,97,115,115,32,38,32,117,110,100,101,114,115,116,111,114,121,41,0,0,0,0,0,78,70,70,76,48,50,0,0,83,104,111,114,116,32,71,114,97,115,115,32,40,49,32,102,116,41,0,0,0,0,0,0,32,32,37,53,46,50,102,32,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,109,97,112,115,32,119,105,116,104,32,37,100,32,99,111,108,115,32,97,110,100,32,37,100,32,114,111,119,115,46,10,0,0,0,0,0,0,78,70,70,76,48,49,0,0,119,0,0,0,0,0,0,0,78,111,32,67,111,109,98,117,115,116,105,98,108,101,32,70,117,101,108,0,0,0,0,0,102,108,97,109,101,46,77,97,112,0,0,0,0,0,0,0,78,111,70,117,101,108,0,0,105,103,110,46,77,97,112,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,119,105,116,104,32,37,100,32,102,117,101,108,32,109,111,100,101,108,115,46,10,0,0,0,0,115,108,111,112,101,46,77,97,112,0,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,97,108,108,111,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,101,114,114,111,114,32,98,117,102,102,101,114,46,10,0,0,0,97,115,112,101,99,116,46,77,97,112,0,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,67,114,101,97,116,101,40,41,58,32,117,110,97,98,108,101,32,116,111,32,100,117,112,108,105,99,97,116,101,32,102,117,101,108,32,99,97,116,97,108,111,103,32,34,37,115,34,32,110,97,109,101,46,10,0,0,99,97,116,97,108,111,103,33,61,32,78,85,76,76,32,38,38,32,70,117,101,108,67,97,116,95,77,97,103,105,99,67,111,111,107,105,101,40,99,97,116,97,108,111,103,41,61,61,70,73,82,69,95,67,65,84,65,76,79,71,95,77,65,71,73,67,0,0,0,0,0,0,102,105,114,101,76,105,98,46,99,0,0,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,87,105,110,100,83,108,111,112,101,77,97,120,0,70,105,114,101,95,83,112,114,101,97,100,78,111,87,105,110,100,78,111,83,108,111,112,101,0,0,0,0,0,0,0,0,70,105,114,101,95,83,112,114,101,97,100,65,116,65,122,105,109,117,116,104,0,0,0,0,70,105,114,101,95,70,117,101,108,80,97,114,116,105,99,108,101,65,100,100,0,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,68,101,115,116,114,111,121,0,0,0,70,105,114,101,95,70,117,101,108,77,111,100,101,108,67,114,101,97,116,101,0,0,0,0,70,105,114,101,95,70,117,101,108,67,111,109,98,117,115,116,105,111,110,0,0,0,0,0,70,105,114,101,95,70,117,101,108,67,97,116,97,108,111,103,68,101,115,116,114,111,121,0,70,105,114,101,95,70,108,97,109,101,83,99,111,114,99,104,0,0,0,0,0,0,0,0,70,105,114,101,95,70,108,97,109,101,76,101,110,103,116,104,84,97,98,108,101,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,192,146,64,0,0,0,0,0,0,104,64,0,0,0,0,0,0,88,64,0,0,0,0,0,0,72,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,156,196,32,176,114,104,161,63,0,0,0,0,0,88,171,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,167,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,91,64,2,0,0,0,1,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,0,62,64,2,0,0,0,2,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,112,151,64,3,0,0,0,1,0,0,0,68,139,108,231,251,169,193,63,0,0,0,0,0,112,151,64,4,0,0,0,1,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,64,159,64,4,0,0,0,1,0,0,0,90,100,59,223,79,141,199,63,0,0,0,0,0,64,91,64,4,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,0,62,64,4,0,0,0,3,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,112,151,64,5,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,159,64,5,0,0,0,1,0,0,0,90,100,59,223,79,141,151,63,0,0,0,0,0,64,91,64,5,0,0,0,3,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,151,64,6,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,88,155,64,6,0,0,0,1,0,0,0,113,61,10,215,163,112,189,63,0,0,0,0,0,64,91,64,6,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,0,62,64,7,0,0,0,1,0,0,0,57,180,200,118,190,159,170,63,0,0,0,0,0,88,155,64,7,0,0,0,1,0,0,0,106,188,116,147,24,4,182,63,0,0,0,0,0,64,91,64,7,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,0,62,64,7,0,0,0,3,0,0,0,156,196,32,176,114,104,145,63,0,0,0,0,0,56,152,64,8,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,64,159,64,8,0,0,0,1,0,0,0,90,100,59,223,79,141,167,63,0,0,0,0,0,64,91,64,8,0,0,0,1,0,0,0,113,61,10,215,163,112,189,63,0,0,0,0,0,0,62,64,9,0,0,0,1,0,0,0,244,253,212,120,233,38,193,63,0,0,0,0,0,136,163,64,9,0,0,0,1,0,0,0,219,249,126,106,188,116,147,63,0,0,0,0,0,64,91,64,9,0,0,0,1,0,0,0,121,233,38,49,8,172,124,63,0,0,0,0,0,0,62,64,10,0,0,0,1,0,0,0,68,139,108,231,251,169,193,63,0,0,0,0,0,64,159,64,10,0,0,0,1,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,64,91,64,10,0,0,0,1,0,0,0,113,61,10,215,163,112,205,63,0,0,0,0,0,0,62,64,10,0,0,0,3,0,0,0,90,100,59,223,79,141,183,63,0,0,0,0,0,112,151,64,11,0,0,0,1,0,0,0,68,139,108,231,251,169,177,63,0,0,0,0,0,112,151,64,11,0,0,0,1,0,0,0,229,208,34,219,249,126,202,63,0,0,0,0,0,64,91,64,11,0,0,0,1,0,0,0,254,212,120,233,38,49,208,63,0,0,0,0,0,0,62,64,12,0,0,0,1,0,0,0,90,100,59,223,79,141,199,63,0,0,0,0,0,112,151,64,12,0,0,0,1,0,0,0,207,247,83,227,165,155,228,63,0,0,0,0,0,64,91,64,12,0,0,0,1,0,0,0,125,63,53,94,186,73,232,63,0,0,0,0,0,0,62,64,13,0,0,0,1,0,0,0,207,247,83,227,165,155,212,63,0,0,0,0,0,112,151,64,13,0,0,0,1,0,0,0,33,176,114,104,145,237,240,63,0,0,0,0,0,64,91,64,13,0,0,0,1,0,0,0,207,247,83,227,165,155,244,63,0,0,0,0,0,0,62,64,64,9,0,0,0,0,0,0,154,153,153,153,153,153,185,63,123,20,174,71,225,122,132,63,0,0,0,0,24,9,0,0,8,9,0,0,0,0,0,0,0,0,0,0,0,0,240,63,184,30,133,235,81,184,190,63,1,0,0,0,168,8,0,0,160,8,0,0,0,0,0,0,0,0,0,0,0,0,240,63,51,51,51,51,51,51,195,63,4,0,0,0,128,8,0,0,120,8,0,0,0,0,0,0,0,0,0,0,0,0,4,64,0,0,0,0,0,0,208,63,1,0,0,0,16,8,0,0,8,8,0,0,0,0,0,0,0,0,0,0,0,0,24,64,154,153,153,153,153,153,201,63,4,0,0,0,240,7,0,0,232,7,0,0,0,0,0,0,0,0,0,0,0,0,0,64,154,153,153,153,153,153,201,63,3,0,0,0,216,7,0,0,208,7,0,0,0,0,0,0,0,0,0,0,0,0,4,64,0,0,0,0,0,0,208,63,3,0,0,0,168,7,0,0,160,7,0,0,0,0,0,0,0,0,0,0,0,0,4,64,154,153,153,153,153,153,217,63,4,0,0,0,144,7,0,0,136,7,0,0,0,0,0,0,154,153,153,153,153,153,201,63,51,51,51,51,51,51,211,63,3,0,0,0,32,7,0,0,24,7,0,0,0,0,0,0,154,153,153,153,153,153,201,63,0,0,0,0,0,0,208,63,3,0,0,0,8,7,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,208,63,4,0,0,0,224,6,0,0,216,6,0,0,0,0,0,0,0,0,0,0,0,0,240,63,51,51,51,51,51,51,195,63,3,0,0,0,152,6,0,0,144,6,0,0,0,0,0,0,102,102,102,102,102,102,2,64,154,153,153,153,153,153,201,63,3,0,0,0,120,6,0,0,112,6,0,0,0,0,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,208,63,3,0,0,0,16,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  var _llvm_pow_f64=Math.pow;
  var _exp=Math.exp;
  var _sqrt=Math.sqrt;
  var _fabs=Math.abs;
  var _cos=Math.cos;
  var _sin=Math.sin;
  var _asin=Math.asin;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function createSimpleOutput() {
          var fn = function (val) {
            if (val === null || val === 10) {
              fn.printer(fn.buffer.join(''));
              fn.buffer = [];
            } else {
              fn.buffer.push(utf8.processCChar(val));
            }
          };
          return fn;
        }
        if (!output) {
          stdoutOverridden = false;
          output = createSimpleOutput();
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = createSimpleOutput();
        }
        if (!error.printer) error.printer = Module['printErr'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"](((Math.min((+(Math.floor((ret)/(+(4294967296))))), (+(4294967295))))|0)>>>0),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      if (FS.streams[stream]) FS.streams[stream].error = false;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else if (offset >= stream.object.contents.length) {
        return 0;
      } else {
        var bytesRead = 0;
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        assert(size >= 0);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          assert(bytesRead >= -1);
          if (bytesRead != -1) {
            stream.position += bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.streams[stream];
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  var ___strtok_state=0;
  function _strtok_r(s, delim, lasts) {
      var skip_leading_delim = 1;
      var spanp;
      var c, sc;
      var tok;
      if (s == 0 && (s = getValue(lasts, 'i8*')) == 0) {
        return 0;
      }
      cont: while (1) {
        c = getValue(s++, 'i8');
        for (spanp = delim; (sc = getValue(spanp++, 'i8')) != 0;) {
          if (c == sc) {
            if (skip_leading_delim) {
              continue cont;
            } else {
              setValue(lasts, s, 'i8*');
              setValue(s - 1, 0, 'i8');
              return s - 1;
            }
          }
        }
        break;
      }
      if (c == 0) {
        setValue(lasts, 0, 'i8*');
        return 0;
      }
      tok = s - 1;
      for (;;) {
        c = getValue(s++, 'i8');
        spanp = delim;
        do {
          if ((sc = getValue(spanp++, 'i8')) == c) {
            if (c == 0) {
              s = 0;
            } else {
              setValue(s - 1, 0, 'i8');
            }
            setValue(lasts, s, 'i8*');
            return tok;
          }
        } while (sc != 0);
      }
      abort('strtok_r error!');
    }function _strtok(s, delim) {
      return _strtok_r(s, delim, ___strtok_state);
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var _floor=Math.floor;
  var _atanf=Math.atan;
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var _fabsf=Math.abs;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
___strtok_state = Runtime.staticAlloc(4);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=+env.NaN;var o=+env.Infinity;var p=0;var q=0;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ab=env.asmPrintInt;var ac=env.asmPrintFloat;var ad=env.min;var ae=env.invoke_ii;var af=env.invoke_v;var ag=env.invoke_iii;var ah=env.invoke_vi;var ai=env._open;var aj=env._fabsf;var ak=env._snprintf;var al=env._lseek;var am=env._fclose;var an=env._strtok_r;var ao=env._abort;var ap=env._fprintf;var aq=env._sqrt;var ar=env._printf;var as=env._close;var at=env._pread;var au=env._fopen;var av=env.__reallyNegative;var aw=env._strtol;var ax=env._asin;var ay=env._atanf;var az=env._fabs;var aA=env._strtok;var aB=env.___setErrNo;var aC=env._fwrite;var aD=env._fseek;var aE=env._send;var aF=env._write;var aG=env._ftell;var aH=env._sprintf;var aI=env._rewind;var aJ=env._strdup;var aK=env._sin;var aL=env._sysconf;var aM=env._fread;var aN=env.__parseInt;var aO=env._fputc;var aP=env._read;var aQ=env.__formatString;var aR=env._atoi;var aS=env.___assert_func;var aT=env._cos;var aU=env._pwrite;var aV=env._recv;var aW=env._llvm_pow_f64;var aX=env._fsync;var aY=env._floor;var aZ=env.___errno_location;var a_=env._isspace;var a$=env._sbrk;var a0=env._exp;var a1=env._time;
// EMSCRIPTEN_START_FUNCS
function a6(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function a7(){return i|0}function a8(a){a=a|0;i=a}function a9(a,b){a=a|0;b=b|0;if((p|0)==0){p=a;q=b}}function ba(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function bb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function bc(a){a=a|0;C=a}function bd(a){a=a|0;D=a}function be(a){a=a|0;E=a}function bf(a){a=a|0;F=a}function bg(a){a=a|0;G=a}function bh(a){a=a|0;H=a}function bi(a){a=a|0;I=a}function bj(a){a=a|0;J=a}function bk(a){a=a|0;K=a}function bl(a){a=a|0;L=a}function bm(){}function bn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0.0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0.0,V=0.0,W=0,Y=0,Z=0.0,_=0,$=0;d=i;i=i+96|0;e=d|0;f=e;g=i;i=i+16|0;j=g;k=i;i=i+16|0;l=k;m=i;i=i+16|0;n=m;o=i;i=i+16|0;p=o;q=i;i=i+16|0;r=q;if((a|0)==0){aS(2728,160,2896,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,160,2896,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){s=a+24|0;u=c[(c[s>>2]|0)+(b<<2)>>2]|0;if((u|0)==0){break}if((c[u+12>>2]|0)==0){v=u}else{w=0;x=u;while(1){h[(c[(c[x+16>>2]|0)+(w<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(w<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(w<<2)>>2]|0)+80>>3]=0.0;u=w+1|0;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;if(u>>>0<(c[y+12>>2]|0)>>>0){w=u;x=y}else{v=y;break}}}h[v+88>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+96>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+104>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+112>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+120>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+128>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+136>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+144>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+152>>3]=0.0;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;bI(j|0,0,16);bI(l|0,0,16);bI(n|0,0,16);bI(p|0,0,16);bI(r|0,0,16);bI(f|0,0,96);h[x+56>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+80>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+248>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+240>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+256>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+264>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+280>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+320>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+312>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+328>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+288>>3]=1.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+296>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+304>>3]=0.0;c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+336>>2]=0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+344>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+208>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+216>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+224>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+232>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+160>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+168>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+176>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+184>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+192>>3]=0.0;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+200>>3]=0.0;c[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+4>>2]=1;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;w=c[x+12>>2]|0;if((w|0)==0){c[a+4>>2]=0;z=0;i=d;return z|0}y=c[x+16>>2]|0;u=0;A=0.0;do{B=c[y+(u<<2)>>2]|0;C=+h[B+48>>3];D=k+(c[B+88>>2]<<3)|0;h[D>>3]=C+ +h[D>>3];A=A+C;u=u+1|0;}while(u>>>0<w>>>0);if(A>1.0e-6){E=0;F=x}else{c[a+4>>2]=0;z=0;i=d;return z|0}while(1){w=c[(c[F+16>>2]|0)+(E<<2)>>2]|0;u=c[w+88>>2]|0;C=+h[k+(u<<3)>>3];if(C>1.0e-6){h[w+64>>3]=+h[w+48>>3]/C;w=c[(c[s>>2]|0)+(b<<2)>>2]|0;y=c[(c[w+16>>2]|0)+(E<<2)>>2]|0;D=e+(u*48|0)+(c[y+96>>2]<<3)|0;h[D>>3]=+h[y+64>>3]+ +h[D>>3];G=w}else{G=F}w=E+1|0;H=c[G+12>>2]|0;if(w>>>0<H>>>0){E=w;F=G}else{break}}if((H|0)==0){I=G}else{x=0;w=G;while(1){D=c[(c[w+16>>2]|0)+(x<<2)>>2]|0;h[D+72>>3]=+h[e+((c[D+88>>2]|0)*48|0)+(c[D+96>>2]<<3)>>3];D=x+1|0;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;if(D>>>0<(c[y+12>>2]|0)>>>0){x=D;w=y}else{I=y;break}}}h[I+56>>3]=+h[k>>3]/A;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+64>>3]=+h[k+8>>3]/A;w=c[(c[s>>2]|0)+(b<<2)>>2]|0;if((c[w+12>>2]|0)==0){J=0.0;K=w}else{x=0;C=0.0;y=w;D=c[w+16>>2]|0;while(1){w=c[D+(x<<2)>>2]|0;u=c[w+88>>2]|0;L=+h[w>>3];B=g+(u<<3)|0;h[B>>3]=+h[B>>3]+ +h[w+72>>3]*L*(1.0- +h[w+32>>3]);M=+h[w+64>>3];B=m+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+8>>3];B=o+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+24>>3];B=q+(u<<3)|0;h[B>>3]=+h[B>>3]+M*+h[w+40>>3];w=y+104|0;h[w>>3]=L+ +h[w>>3];w=c[(c[s>>2]|0)+(b<<2)>>2]|0;B=c[w+16>>2]|0;u=c[B+(x<<2)>>2]|0;L=+h[u+16>>3];if(L>1.0e-6){N=C+ +h[u>>3]/L}else{N=C}u=x+1|0;if(u>>>0<(c[w+12>>2]|0)>>>0){x=u;C=N;y=w;D=B}else{J=N;K=w;break}}}C=+h[K+56>>3]*+h[m>>3]+0.0;A=+h[q>>3];do{if(A>0.0){L=.174/+P(+A,.19);if(L<=1.0){Q=L;break}Q=1.0}else{Q=1.0}}while(0);h[K+72>>3]=+h[g>>3]*+h[o>>3]*Q;D=c[(c[s>>2]|0)+(b<<2)>>2]|0;A=C+ +h[D+64>>3]*+h[m+8>>3];L=+h[q+8>>3];do{if(L>0.0){M=.174/+P(+L,.19);if(M<=1.0){R=M;break}R=1.0}else{R=1.0}}while(0);L=+h[g+8>>3];h[D+80>>3]=L*+h[o+8>>3]*R;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+112>>3]=384.0/A;y=c[(c[s>>2]|0)+(b<<2)>>2]|0;C=+h[y+32>>3];if(C>1.0e-6){x=y+104|0;h[x>>3]=+h[x>>3]/C;x=c[(c[s>>2]|0)+(b<<2)>>2]|0;S=J/+h[x+32>>3];T=x}else{S=J;T=y}h[T+120>>3]=+X(+((S+.1)*(+O(+A)*.681+.792)))/(A*.2595+192.0);C=S/(3.348/+P(+A,.8189));M=133.0/+P(+A,.7913);U=+P(+A,1.5);V=U/(U*.0594+495.0)*+P(+C,+M);U=V*+X(+((1.0-C)*M));y=(c[(c[s>>2]|0)+(b<<2)>>2]|0)+72|0;h[y>>3]=U*+h[y>>3];y=(c[(c[s>>2]|0)+(b<<2)>>2]|0)+80|0;h[y>>3]=U*+h[y>>3];U=+P(+S,-.3)*5.275;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+128>>3]=U;U=+P(+A,.54)*.02526;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+136>>3]=U;U=+X(+(+P(+A,.55)*-.133))*7.47;M=+X(+(A*-359.0e-6))*.715;V=U*+P(+C,+(-0.0-M));h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+152>>3]=V;V=+P(+C,+M)/U;h[(c[(c[s>>2]|0)+(b<<2)>>2]|0)+144>>3]=V;if(L<1.0e-6){c[a+4>>2]=0;z=0;i=d;return z|0}y=c[s>>2]|0;x=c[y+(b<<2)>>2]|0;do{if((c[x+12>>2]|0)!=0){w=0;L=0.0;B=x;u=y;while(1){W=c[(c[B+16>>2]|0)+(w<<2)>>2]|0;V=+h[W>>3];if((c[W+88>>2]|0)==0){Y=B+88|0;h[Y>>3]=+h[Y>>3]+V*+h[W+56>>3];Z=L;_=c[s>>2]|0}else{Z=L+V*+X(+(-500.0/+h[W+8>>3]));_=u}W=w+1|0;$=c[_+(b<<2)>>2]|0;if(W>>>0<(c[$+12>>2]|0)>>>0){w=W;L=Z;B=$;u=_}else{break}}if(Z<=1.0e-6){break}h[$+96>>3]=+h[$+88>>3]*2.9/Z}}while(0);c[a+4>>2]=0;z=0;i=d;return z|0}}while(0);$=c[a+16>>2]|0;aH(c[a+20>>2]|0,2088,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=$,t)|0)|0;c[a+4>>2]=-1;z=-1;i=d;return z|0}function bo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0.0,u=0.0,v=0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0,F=0,G=0.0,H=0,I=0.0,J=0.0,K=0.0,L=0.0;e=i;i=i+16|0;f=e|0;g=f;if((a|0)==0){aS(2728,436,2768,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,436,2768,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){j=a+24|0;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if((k|0)==0){break}do{if((c[k+4>>2]|0)==0){bn(a,b)|0;l=c[(c[j>>2]|0)+(b<<2)>>2]|0}else{m=0;while(1){if(m>>>0>=6){break}if(+N(+(+h[d+(m<<3)>>3]- +h[k+160+(m<<3)>>3]))<1.0e-6){m=m+1|0}else{break}}if((m|0)!=6){l=k;break}c[a+4>>2]=0;n=0;i=e;return n|0}}while(0);h[l+160>>3]=+h[d>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+168>>3]=+h[d+8>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+176>>3]=+h[d+16>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+184>>3]=+h[d+24>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+192>>3]=+h[d+32>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+200>>3]=+h[d+40>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+248>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+240>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+256>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+264>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+344>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if((c[k+12>>2]|0)==0){c[a+4>>2]=0;n=0;i=e;return n|0}bI(g|0,0,16);o=0;p=0;q=0.0;r=k;while(1){k=c[(c[r+16>>2]|0)+(o<<2)>>2]|0;if((c[k+88>>2]|0)==0){s=+h[d+(c[2992+(c[k+96>>2]<<2)>>2]<<3)>>3];u=q+s*+h[k+56>>3]*+h[k>>3];v=p;w=s}else{u=q;v=p+1|0;w=+h[d+(((c[k+92>>2]|0)==2?4:5)<<3)>>3]}h[k+80>>3]=w;k=o+1|0;x=c[j>>2]|0;y=c[x+(b<<2)>>2]|0;if(k>>>0<(c[y+12>>2]|0)>>>0){o=k;p=v;q=u;r=y}else{break}}do{if((v|0)==0){z=0.0;A=+h[y+40>>3];B=x+(b<<2)|0}else{q=+h[y+88>>3];if(q>1.0e-6){C=u/q}else{C=0.0}r=x+(b<<2)|0;q=+h[y+40>>3];s=+h[y+96>>3]*(1.0-C/q)+-.226;if(s>=q){z=s;A=q;B=r;break}z=q;A=q;B=r}}while(0);r=c[B>>2]|0;p=c[r+12>>2]|0;if((p|0)==0){D=0.0}else{o=c[r+16>>2]|0;k=0;q=0.0;while(1){E=c[o+(k<<2)>>2]|0;s=+h[E+80>>3];F=c[E+88>>2]|0;G=+h[E+64>>3];H=f+(F<<3)|0;h[H>>3]=+h[H>>3]+s*G;I=q+(s*1116.0+250.0)*G*+h[r+56+(F<<3)>>3]*+h[E+56>>3];E=k+1|0;if(E>>>0<p>>>0){k=E;q=I}else{D=I;break}}}q=+h[r+104>>3];I=+h[f>>3];if(A>1.0e-6){G=I/A;J=1.0-G*2.59+G*G*5.11-G*G*G*3.52}else{J=0.0}k=r+240|0;h[k>>3]=+h[k>>3]+ +h[r+72>>3]*(I<A?J:0.0);I=+h[f+8>>3];if(z>1.0e-6){G=I/z;K=1.0-G*2.59+G*G*5.11-G*G*G*3.52}else{K=0.0}k=c[(c[j>>2]|0)+(b<<2)>>2]|0;p=k+240|0;h[p>>3]=+h[p>>3]+ +h[k+80>>3]*(I<z?K:0.0);I=D*q;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+256>>3]=+h[k+240>>3]*+h[k+112>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;if(I>1.0e-6){L=+h[k+240>>3]*+h[k+120>>3]/I}else{L=0.0}h[k+248>>3]=L;k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+264>>3]=+h[k+248>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+344>>3]=+h[k+248>>3];k=c[(c[j>>2]|0)+(b<<2)>>2]|0;h[k+304>>3]=+h[k+248>>3];h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+352>>3]=0.0;h[(c[(c[j>>2]|0)+(b<<2)>>2]|0)+272>>3]=0.0;c[a+4>>2]=0;n=0;i=e;return n|0}}while(0);f=c[a+16>>2]|0;aH(c[a+20>>2]|0,1848,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=f,t)|0)|0;c[a+4>>2]=-1;n=-1;i=e;return n|0}function bp(a,b,d,e,f,g){a=a|0;b=b|0;d=+d;e=+e;f=+f;g=+g;var j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,S=0.0,T=0.0,V=0.0,W=0,X=0.0,Y=0.0,Z=0.0,_=0,$=0.0,aa=0.0,ab=0.0,ac=0;j=i;if((a|0)==0){aS(2728,663,2744,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,663,2744,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){k=a+24|0;l=c[(c[k>>2]|0)+(b<<2)>>2]|0;if((l|0)==0){break}if(+N(+(+h[l+224>>3]-f))<1.0e-6){m=l}else{h[l+320>>3]=+h[l+128>>3]*f*f;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+224>>3]=f;m=c[(c[k>>2]|0)+(b<<2)>>2]|0}if(+N(+(+h[m+208>>3]-d))<1.0e-6){n=m}else{if(d<1.0e-6){o=0.0}else{p=+h[m+152>>3];o=p*+P(+d,+(+h[m+136>>3]))}h[m+312>>3]=o;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+208>>3]=d;n=c[(c[k>>2]|0)+(b<<2)>>2]|0}p=+h[n+320>>3];q=+h[n+312>>3];r=p+q;if(g<180.0){s=g+180.0}else{s=g+-180.0}u=+h[n+248>>3];do{if(u<1.0e-6){v=0.0;w=1.0;x=0.0;y=0.0;z=r;A=0.0;B=0}else{if(r<1.0e-6){v=0.0;w=1.0;x=0.0;y=u;z=0.0;A=0.0;B=0;break}L151:do{if(f<1.0e-6){C=e;D=r;E=(r+1.0)*u;F=d}else{do{if(d<1.0e-6){G=(r+1.0)*u;H=r;I=s}else{if(+N(+(s-e))<1.0e-6){G=(r+1.0)*u;H=r;I=s;break}if(s>e){J=360.0-s+e}else{J=e-s}K=J*.017453293;L=u*q;M=u*p+L*+Q(+K);S=L*+R(+K);K=+O(+(M*M+S*S));L=u+K;T=L/u+-1.0;l=T>1.0e-6;V=+U(+(+N(+S)/K));W=S>=0.0;do{if(M<0.0){if(W){X=3.141592653589793-V;break}else{X=V+3.141592653589793;break}}else{if(W){X=V;break}X=6.283185307179586-V}}while(0);V=s+X*57.29577951;if(V>360.0){Y=V+-360.0}else{Y=V}if(l){G=L;H=T;I=Y}else{C=Y;D=T;E=L;F=0.0;break L151}}}while(0);C=I;D=H;E=G;F=+P(+(H*+h[n+144>>3]),+(1.0/+h[n+136>>3]))}}while(0);V=+h[n+240>>3]*.9;if(F>V){if(V<1.0e-6){Z=0.0}else{M=+h[n+152>>3];Z=M*+P(+V,+(+h[n+136>>3]))}_=1;$=V;aa=Z;ab=(Z+1.0)*u}else{_=0;$=F;aa=D;ab=E}if($<=1.0e-6){v=0.0;w=1.0;x=C;y=ab;z=aa;A=$;B=_;break}V=$*.002840909+1.0;if(V<=1.00001){v=0.0;w=V;x=C;y=ab;z=aa;A=$;B=_;break}v=+O(+(V*V+-1.0))/V;w=V;x=C;y=ab;z=aa;A=$;B=_}}while(0);h[n+232>>3]=g;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+216>>3]=e;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+328>>3]=z;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+280>>3]=A;c[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+336>>2]=B;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+344>>3]=y;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+264>>3]=y;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+352>>3]=x;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+272>>3]=x;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+288>>3]=w;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+296>>3]=v;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+304>>3]=y*(1.0-v)/(v+1.0);h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+360>>3]=0.0;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;h[(c[(c[k>>2]|0)+(b<<2)>>2]|0)+376>>3]=0.0;c[a+4>>2]=0;ac=0;i=j;return ac|0}}while(0);B=c[a+16>>2]|0;aH(c[a+20>>2]|0,1576,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=B,t)|0)|0;c[a+4>>2]=-1;ac=-1;i=j;return ac|0}function bq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,n=0;d=i;e=(a|0)==0?4488:a;a=bB(40)|0;if((a|0)==0){f=c[m>>2]|0;ap(f|0,280,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;g=0;i=d;return g|0}c[a>>2]=19520904;f=aJ(e|0)|0;c[a+16>>2]=f;if((f|0)==0){j=c[m>>2]|0;ap(j|0,2584,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;bC(a);g=0;i=d;return g|0}j=bD(1024,1)|0;c[a+20>>2]=j;if((j|0)==0){k=c[m>>2]|0;ap(k|0,2488,(t=i,i=i+8|0,c[t>>2]=e,t)|0)|0;bC(f);bC(a);g=0;i=d;return g|0}k=a+4|0;c[k>>2]=-1;l=b+1|0;c[a+8>>2]=l;n=bD(b+2|0,4)|0;c[a+24>>2]=n;if((n|0)==0){n=c[m>>2]|0;ap(n|0,2384,(t=i,i=i+16|0,c[t>>2]=e,c[t+8>>2]=l,t)|0)|0;bC(j);bC(f);bC(a);g=0;i=d;return g|0}else{c[a+28>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0;c[k>>2]=0;g=a;i=d;return g|0}return 0}function br(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0;d=i;e=bq(a,b>>>0<13?13:b)|0;if((e|0)==0){f=0;i=d;return f|0}else{g=0}while(1){if(g>>>0>=14){j=0;break}if((bv(e,g,c[4e3+(g<<5)>>2]|0,c[4028+(g<<5)>>2]|0,+h[4008+(g<<5)>>3],+h[4016+(g<<5)>>3],1.0,c[4024+(g<<5)>>2]|0)|0)==0){g=g+1|0}else{k=160;break}}if((k|0)==160){g=c[m>>2]|0;b=c[e+20>>2]|0;ap(g|0,1544,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;bw(e)|0;f=0;i=d;return f|0}while(1){if(j>>>0>=39){f=e;k=166;break}if((bx(e,c[3064+(j*24|0)>>2]|0,c[3068+(j*24|0)>>2]|0,+h[3072+(j*24|0)>>3],+h[3080+(j*24|0)>>3],32.0,8.0e3,.0555,.01)|0)==0){j=j+1|0}else{break}}if((k|0)==166){i=d;return f|0}ap(c[m>>2]|0,1544,(t=i,i=i+8|0,c[t>>2]=c[e+20>>2],t)|0)|0;bw(e)|0;f=0;i=d;return f|0}function bs(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;var f=0,g=0,j=0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,u=0,v=0,w=0,x=0.0;f=i;if((a|0)==0){aS(2728,878,2800,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,878,2800,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){g=a+24|0;j=c[(c[g>>2]|0)+(b<<2)>>2]|0;if((j|0)==0){break}k=+h[j+264>>3];if(k<1.0e-6){c[a+4>>2]=0;l=0;i=f;return l|0}do{if(+h[j+328>>3]<1.0e-6){m=179}else{n=+N(+(+h[j+272>>3]-d));if(n<1.0e-6){m=179;break}if(n>180.0){o=360.0-n}else{o=n}n=+h[j+296>>3];p=1.0-n*+Q(+(o*.017453293));if(p>1.0e-6){h[j+344>>3]=(1.0-n)*k/p;break}else{h[j+344>>3]=+h[j+248>>3];break}}}while(0);if((m|0)==179){h[j+344>>3]=k}h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+352>>3]=d;do{if((e|0)!=0){q=c[(c[g>>2]|0)+(b<<2)>>2]|0;p=+h[q+112>>3]*+h[q+344>>3]*+h[q+240>>3]/60.0;if((e&1|0)!=0){h[q+360>>3]=p}L254:do{if((e&2|0)!=0){if(p<1.0e-6){h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=0.0;break}q=c[a+12>>2]|0;do{if((q|0)!=0){r=q-1|0;s=c[a+28>>2]|0;if(+h[s+(r<<3)>>3]>p){u=r;v=0}else{break}do{r=((u-v|0)>>>1)+v|0;w=+h[s+(r<<3)>>3]>p;v=w?v:r+1|0;u=w?r:u;}while((v|0)!=(u|0));h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=+((v+1|0)>>>0>>>0)*+h[a+32>>3];break L254}}while(0);n=+P(+p,.46)*.45;h[(c[(c[g>>2]|0)+(b<<2)>>2]|0)+368>>3]=n}}while(0);if((e&4|0)==0){break}q=c[(c[g>>2]|0)+(b<<2)>>2]|0;if(p<1.0e-6){h[q+376>>3]=0.0;break}else{n=+h[q+208>>3]/88.0;x=+P(+p,1.166667);h[q+376>>3]=x/+O(+(p+n*n*n));break}}}while(0);c[a+4>>2]=0;l=0;i=f;return l|0}}while(0);e=c[a+16>>2]|0;aH(c[a+20>>2]|0,736,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=e,t)|0)|0;c[a+4>>2]=-1;l=-1;i=f;return l|0}function bt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0;e=i;if((a|0)==0){aS(2728,1027,2944,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1027,2944,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){f=a+24|0;g=c[(c[f>>2]|0)+(b<<2)>>2]|0;if((g|0)==0){break}j=+h[g+112>>3]*+h[g+344>>3]*+h[g+240>>3]/60.0;L284:do{if((d&2|0)!=0){if(j<1.0e-6){h[g+368>>3]=0.0;break}k=c[a+12>>2]|0;do{if((k|0)!=0){l=k-1|0;m=c[a+28>>2]|0;if(+h[m+(l<<3)>>3]>j){n=0;o=l}else{break}do{l=((o-n|0)>>>1)+n|0;p=+h[m+(l<<3)>>3]>j;o=p?l:o;n=p?n:l+1|0;}while((n|0)!=(o|0));h[g+368>>3]=+((o+1|0)>>>0>>>0)*+h[a+32>>3];break L284}}while(0);h[g+368>>3]=+P(+j,.46)*.45}}while(0);do{if((d&4|0)!=0){g=c[(c[f>>2]|0)+(b<<2)>>2]|0;if(j<1.0e-6){h[g+376>>3]=0.0;break}else{q=+h[g+208>>3]/88.0;r=+P(+j,1.166667);h[g+376>>3]=r/+O(+(j+q*q*q));break}}}while(0);c[a+4>>2]=0;s=0;i=e;return s|0}}while(0);d=c[a+16>>2]|0;aH(c[a+20>>2]|0,488,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=d,t)|0)|0;c[a+4>>2]=-1;s=-1;i=e;return s|0}function bu(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,j=0,k=0,l=0,m=0;e=i;if((a|0)==0){aS(2728,1163,2968,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1163,2968,2656);return 0}f=a+28|0;g=c[f>>2]|0;if((g|0)!=0){bC(g);c[f>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0}if((b|0)==0){c[a+4>>2]=0;j=0;i=e;return j|0}g=bD(b,8)|0;k=g;c[f>>2]=k;if((g|0)==0){g=c[a+20>>2]|0;aH(g|0,384,(t=i,i=i+16|0,c[t>>2]=b,h[t+8>>3]=d,t)|0)|0;c[a+4>>2]=-1;j=-1;i=e;return j|0}else{l=0;m=k}while(1){k=l+1|0;h[m+(l<<3)>>3]=+P(+(+(k>>>0>>>0)*d/.45),2.1739130434782608);if(k>>>0>=b>>>0){break}l=k;m=c[f>>2]|0}c[a+12>>2]=b;h[a+32>>3]=d;c[a+4>>2]=0;j=0;i=e;return j|0}function bv(a,b,d,e,f,g,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;g=+g;j=+j;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0;l=i;if((a|0)==0){aS(2728,1559,2872,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1559,2872,2656);return 0}m=c[a+8>>2]|0;if(m>>>0<b>>>0){n=c[a+20>>2]|0;o=c[a+16>>2]|0;aH(n|0,1376,(t=i,i=i+32|0,c[t>>2]=d,c[t+8>>2]=b,c[t+16>>2]=o,c[t+24>>2]=m,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}if(f<1.0e-6){m=c[a+20>>2]|0;aH(m|0,1296,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,h[t+16>>3]=f,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}if(g<1.0e-6){m=c[a+20>>2]|0;aH(m|0,1200,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,h[t+16>>3]=g,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}m=a+24|0;o=c[m>>2]|0;if((c[o+(b<<2)>>2]|0)==0){q=o}else{by(a,b)|0;q=c[m>>2]|0}o=(k|0)==0?1:k;k=bD(1,384)|0;c[q+(b<<2)>>2]=k;do{if((k|0)!=0){q=bD(o,4)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+16>>2]=q;if((q|0)==0){break}c[c[(c[m>>2]|0)+(b<<2)>>2]>>2]=b;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+32>>3]=f;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+40>>3]=g;h[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+48>>3]=j;q=aJ(((d|0)==0?4488:d)|0)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+20>>2]=q;q=aJ(((e|0)==0?4488:e)|0)|0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+24>>2]=q;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+4>>2]=0;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+8>>2]=o;c[(c[(c[m>>2]|0)+(b<<2)>>2]|0)+12>>2]=0;q=c[(c[m>>2]|0)+(b<<2)>>2]|0;if((c[q+8>>2]|0)!=0){n=0;r=q;do{c[(c[r+16>>2]|0)+(n<<2)>>2]=0;n=n+1|0;r=c[(c[m>>2]|0)+(b<<2)>>2]|0;}while(n>>>0<(c[r+8>>2]|0)>>>0)}c[a+4>>2]=0;p=0;i=l;return p|0}}while(0);by(a,b)|0;m=c[a+16>>2]|0;aH(c[a+20>>2]|0,1096,(t=i,i=i+24|0,c[t>>2]=d,c[t+8>>2]=b,c[t+16>>2]=m,t)|0)|0;c[a+4>>2]=-1;p=-1;i=l;return p|0}function bw(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0,j=0,k=0;if((a|0)==0){aS(2728,1473,2920,1472);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1473,2920,1472);return 0}b=a+24|0;d=c[b>>2]|0;if((d|0)!=0){e=a+8|0;f=0;g=d;while(1){if((c[g+(f<<2)>>2]|0)==0){i=g}else{by(a,f)|0;i=c[b>>2]|0}d=f+1|0;if(d>>>0>(c[e>>2]|0)>>>0){break}else{f=d;g=i}}bC(i);c[b>>2]=0}b=a+28|0;i=c[b>>2]|0;if((i|0)!=0){bC(i);c[b>>2]=0;c[a+12>>2]=0;h[a+32>>3]=0.0}b=a+20|0;i=c[b>>2]|0;if((i|0)!=0){bC(i);c[b>>2]=0}b=c[a+16>>2]|0;if((b|0)==0){j=a;bC(j);k=a+4|0;c[k>>2]=0;return 0}bC(b);j=a;bC(j);k=a+4|0;c[k>>2]=0;return 0}function bx(a,b,d,e,f,g,j,k,l){a=a|0;b=b|0;d=d|0;e=+e;f=+f;g=+g;j=+j;k=+k;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0.0,v=0.0;m=i;if((a|0)==0){aS(2728,1775,2824,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1775,2824,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){n=a+24|0;o=(c[n>>2]|0)+(b<<2)|0;p=c[o>>2]|0;if((p|0)==0){break}if((d-1|0)>>>0>1&(d|0)!=3){q=c[a+20>>2]|0;aH(q|0,816,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}q=c[p+12>>2]|0;p=bD(1,104)|0;c[(c[(c[o>>2]|0)+16>>2]|0)+(q<<2)>>2]=p;if((p|0)==0){p=c[a+20>>2]|0;o=c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+20>>2]|0;s=c[a+16>>2]|0;aH(p|0,624,(t=i,i=i+24|0,c[t>>2]=o,c[t+8>>2]=b,c[t+16>>2]=s,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+92>>2]=d;h[c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]>>3]=e;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+8>>3]=f;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+16>>3]=g;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+24>>3]=j;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+32>>3]=k;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+40>>3]=l;c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+88>>2]=(d|0)!=1;if(g>1.0e-6){u=e*f/g}else{u=0.0}h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+48>>3]=u;if(f>1.0e-6){v=+X(+(-138.0/f))}else{v=0.0}h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+56>>3]=v;s=0;while(1){if(+h[3016+(s<<3)>>3]>f){s=s+1|0}else{break}}c[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+96>>2]=s;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+64>>3]=0.0;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+72>>3]=0.0;h[(c[(c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(q<<2)>>2]|0)+80>>3]=0.0;o=(c[(c[n>>2]|0)+(b<<2)>>2]|0)+12|0;c[o>>2]=(c[o>>2]|0)+1;c[(c[(c[n>>2]|0)+(b<<2)>>2]|0)+4>>2]=0;c[a+4>>2]=0;r=0;i=m;return r|0}}while(0);d=c[a+16>>2]|0;aH(c[a+20>>2]|0,936,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=d,t)|0)|0;c[a+4>>2]=-1;r=-1;i=m;return r|0}function by(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;if((a|0)==0){aS(2728,1661,2848,2656);return 0}if((c[a>>2]|0)!=19520904){aS(2728,1661,2848,2656);return 0}do{if((c[a+8>>2]|0)>>>0>=b>>>0){e=a+24|0;f=c[e>>2]|0;g=c[f+(b<<2)>>2]|0;if((g|0)==0){break}h=c[g+16>>2]|0;if((h|0)==0){j=g}else{if((c[g+8>>2]|0)==0){k=h}else{g=0;l=h;h=f;while(1){f=c[l+(g<<2)>>2]|0;if((f|0)==0){m=h}else{bC(f);c[(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+16>>2]|0)+(g<<2)>>2]=0;m=c[e>>2]|0}f=g+1|0;n=c[m+(b<<2)>>2]|0;o=c[n+16>>2]|0;if(f>>>0<(c[n+8>>2]|0)>>>0){g=f;l=o;h=m}else{k=o;break}}}bC(k);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+16>>2]=0;j=c[(c[e>>2]|0)+(b<<2)>>2]|0}h=c[j+20>>2]|0;if((h|0)==0){p=j}else{bC(h);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+20>>2]=0;p=c[(c[e>>2]|0)+(b<<2)>>2]|0}h=c[p+24>>2]|0;if((h|0)==0){q=p}else{bC(h);c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+24>>2]=0;q=c[(c[e>>2]|0)+(b<<2)>>2]|0}bC(q);c[(c[e>>2]|0)+(b<<2)>>2]=0;c[a+4>>2]=0;r=0;i=d;return r|0}}while(0);q=c[a+16>>2]|0;aH(c[a+20>>2]|0,1016,(t=i,i=i+16|0,c[t>>2]=b,c[t+8>>2]=q,t)|0)|0;c[a+4>>2]=-1;r=-1;i=d;return r|0}function bz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,P=0,Q=0,R=0,S=0,T=0,U=0,W=0,X=0,Y=0.0,Z=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0,aj=0.0,ak=0,al=0,an=0,ao=0,aq=0,as=0.0,at=0,av=0,aw=0.0,ax=0.0,ay=0,az=0,aB=0,aC=0.0,aE=0,aF=0,aH=0,aJ=0,aK=0.0,aL=0,aN=0;b=i;i=i+304|0;e=b|0;f=b+128|0;g=b+256|0;j=d+4|0;k=aR(c[j>>2]|0)|0;c[1242]=k;l=aR(c[j>>2]|0)|0;c[1244]=l;n=9842.5197/+(l|0);h[556]=n;h[557]=n;n=+bF(c[d+12>>2]|0);o=+bF(c[d+16>>2]|0);p=+bF(c[d+8>>2]|0)/100.0;ar(576,(t=i,i=i+24|0,c[t>>2]=k,h[t+8>>3]=n,h[t+16>>3]=o,t)|0)|0;k=c[1242]|0;l=c[1244]|0;j=_(l,k)|0;q=bD(j,8)|0;r=q;do{if((q|0)!=0){s=bD(j,8)|0;u=s;if((s|0)==0){break}v=bD(j,8)|0;w=v;if((v|0)==0){break}v=bD(j,8)|0;x=v;if((v|0)==0){break}v=bD(j,8)|0;y=v;if((v|0)==0){break}v=bD(j,8)|0;z=v;if((v|0)==0){break}v=bD(j,8)|0;A=v;if((v|0)==0){break}v=bD(j,8)|0;B=v;if((v|0)==0){break}C=bD(j,8)|0;D=C;if((C|0)==0){break}E=bD(j,8)|0;F=E;if((E|0)==0){break}G=bD(j,8)|0;H=G;if((G|0)==0){break}I=bD(j,4)|0;J=I;if((I|0)==0){break}I=d+20|0;K=au(c[I>>2]|0,1992)|0;if((K|0)==0){L=c[I>>2]|0;ar(1712,(t=i,i=i+8|0,c[t>>2]=L,t)|0)|0;P=-1;i=b;return P|0}L=d+24|0;I=au(c[L>>2]|0,1992)|0;if((I|0)==0){Q=c[L>>2]|0;ar(1712,(t=i,i=i+8|0,c[t>>2]=Q,t)|0)|0;P=-1;i=b;return P|0}aD(K|0,0,2)|0;Q=aG(K|0)|0;aI(K|0);L=bB(Q+1|0)|0;R=j<<3;S=bB(R)|0;T=bB(R)|0;aM(L|0,1,Q|0,K|0)|0;a[L+Q|0]=0;Q=aA(L|0,1192)|0;R=(j|0)>0;if(R){U=0;W=Q;do{h[S+(U<<3)>>3]=+bE(W,0);W=aA(0,1192)|0;U=U+1|0;}while((U|0)<(j|0))}bC(L);aD(I|0,0,2)|0;U=aG(I|0)|0;aI(I|0);W=bB(U+1|0)|0;aM(W|0,1,U|0,I|0)|0;a[W+U|0]=0;U=aA(W|0,1192)|0;do{if(R){Q=0;X=U;do{h[T+(Q<<3)>>3]=+bE(X,0);X=aA(0,1192)|0;Q=Q+1|0;}while((Q|0)<(j|0));bC(W);if(!R){break}Y=n*196.850393701;Q=j<<3;bI(v|0,0,Q|0);bI(C|0,0,Q|0);bI(E|0,0,Q|0);bI(G|0,0,Q|0);bI(s|0,0,Q|0);Q=0;do{h[w+(Q<<3)>>3]=+h[S+(Q<<3)>>3]/100.0;X=T+(Q<<3)|0;Z=+h[X>>3]+-90.0;if(Z<0.0){$=Z+360.0}else{$=Z}h[X>>3]=$;h[x+(Q<<3)>>3]=360.0-$;c[J+(Q<<2)>>2]=1;h[y+(Q<<3)>>3]=Y;h[z+(Q<<3)>>3]=o;h[A+(Q<<3)>>3]=p;h[r+(Q<<3)>>3]=999999999.0;Q=Q+1|0;}while((Q|0)<(j|0))}else{bC(W)}}while(0);am(K|0)|0;am(I|0)|0;W=c[1244]|0;Y=+M(+(+((W|0)/2|0|0)));h[r+(~~(Y+ +(W|0)*+M(+(+((c[1242]|0)/2|0|0))))<<3)>>3]=0.0;W=br(560,14)|0;T=W+24|0;S=c[(c[T>>2]|0)+4>>2]|0;if((bv(W,14,480,360,.197,+h[S+40>>3],+h[S+48>>3],1)|0)!=0){bw(W)|0;P=0;i=b;return P|0}S=c[c[(c[(c[T>>2]|0)+4>>2]|0)+16>>2]>>2]|0;if((bx(W,14,c[S+92>>2]|0,.23,3500.0,+h[S+16>>3],+h[S+24>>3],+h[S+32>>3],+h[S+40>>3])|0)!=0){S=c[m>>2]|0;s=c[W+20>>2]|0;ap(S|0,352,(t=i,i=i+8|0,c[t>>2]=s,t)|0)|0;bw(W)|0;P=0;i=b;return P|0}bu(W,500,.1)|0;Y=+h[556];Z=+h[557];s=0;do{aa=+(c[144+(s<<2)>>2]|0);ab=aa*Y;ac=+(c[80+(s<<2)>>2]|0);ad=ac*Z;h[e+(s<<3)>>3]=+O(+(Y*aa*ab+Z*ac*ad));do{if((s|0)<8){h[f+(s<<3)>>3]=+(s|0)*45.0}else{ac=+V(+(ab/ad));aa=ac;S=f+(s<<3)|0;h[S>>3]=aa;do{if((43534>>>(s>>>0)&1|0)==0){ae=aa}else{if((3971>>>(s>>>0)&1|0)==0){af=aa}else{ag=+N(+ac)*57.29577951;h[S>>3]=ag;af=ag}if((61496>>>(s>>>0)&1|0)==0){ae=af;break}ag=180.0-af*57.29577951;h[S>>3]=ag;ae=ag}}while(0);if((21984>>>(s>>>0)&1|0)==0){break}if((61496>>>(s>>>0)&1|0)==0){ah=ae}else{ac=+N(+ae)*57.29577951+180.0;h[S>>3]=ac;ah=ac}if((3971>>>(s>>>0)&1|0)==0){break}h[S>>3]=360.0- +N(+ah)*57.29577951}}while(0);s=s+1|0;}while((s|0)<16);L509:do{if(R){s=0;Z=999999999.0;do{Y=+h[r+(s<<3)>>3];Z=Y<Z?Y:Z;s=s+1|0;}while((s|0)<(j|0));if(Z>=999999999.0){ai=0;aj=0.0;break}s=g|0;I=g+8|0;K=g+16|0;G=g+24|0;E=g+32|0;C=g+40|0;v=0;Y=Z;U=c[1242]|0;while(1){L=v+1|0;if((U|0)<=0){ai=L;aj=Y;break L509}Q=0;X=0;ad=999999999.0;ak=c[1244]|0;al=U;while(1){if((ak|0)>0){an=Q;ao=0;ab=ad;aq=ak;while(1){ac=+h[r+(an<<3)>>3];do{if(ac>Y){if(ac>=ab){as=ab;at=aq;break}as=ac;at=aq}else{av=c[J+(an<<2)>>2]|0;h[s>>3]=+h[A+(an<<3)>>3];h[I>>3]=+h[B+(an<<3)>>3];aa=+h[D+(an<<3)>>3];h[K>>3]=aa;h[G>>3]=aa;h[E>>3]=+h[F+(an<<3)>>3];h[C>>3]=+h[H+(an<<3)>>3];bo(W,av,s)|0;aa=+h[y+(an<<3)>>3];ag=+h[z+(an<<3)>>3];aw=+h[w+(an<<3)>>3];ax=+h[x+(an<<3)>>3];bp(W,av,aa,ag,aw,ax)|0;ay=0;ax=ab;while(1){az=(c[80+(ay<<2)>>2]|0)+X|0;aB=(c[144+(ay<<2)>>2]|0)+ao|0;do{if((az|0)>=(c[1242]|0)|(az|0)<0|(aB|0)<0){aC=ax}else{aE=c[1244]|0;if((aB|0)>=(aE|0)){aC=ax;break}aF=(_(aE,az)|0)+aB|0;aE=r+(aF<<3)|0;aw=+h[aE>>3];if(aw<=Y){aC=ax;break}ag=+h[f+(ay<<3)>>3];bs(W,av,ag,0)|0;ag=+h[(c[(c[T>>2]|0)+(av<<2)>>2]|0)+344>>3];if(ag<=1.0e-6){aC=ax;break}aa=Y+ +h[e+(ay<<3)>>3]/ag;if(aa<aw){h[aE>>3]=aa;bt(W,av,2)|0;h[u+(aF<<3)>>3]=+h[(c[(c[T>>2]|0)+(av<<2)>>2]|0)+368>>3]}if(aa>=ax){aC=ax;break}aC=aa}}while(0);aB=ay+1|0;if((aB|0)<16){ay=aB;ax=aC}else{break}}as=aC;at=c[1244]|0}}while(0);ay=ao+1|0;aH=an+1|0;if((ay|0)<(at|0)){an=aH;ao=ay;ab=as;aq=at}else{break}}aJ=aH;aK=as;aL=at;aN=c[1242]|0}else{aJ=Q;aK=ad;aL=ak;aN=al}aq=X+1|0;if((aq|0)<(aN|0)){Q=aJ;X=aq;ad=aK;ak=aL;al=aN}else{break}}if(aK<999999999.0){v=L;Y=aK;U=aN}else{ai=L;aj=Y;break}}}else{ai=0;aj=0.0}}while(0);ar(208,(t=i,i=i+24|0,c[t>>2]=ai,h[t+8>>3]=aj,h[t+16>>3]=aj/60.0,t)|0)|0;bA(x,2568);bA(w,2472);bA(r,2376);bA(u,2352);P=0;i=b;return P|0}}while(0);ap(c[m>>2]|0,2256,(t=i,i=i+16|0,c[t>>2]=l,c[t+8>>2]=k,t)|0)|0;P=1;i=b;return P|0}function bA(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0.0,k=0;d=i;e=au(b|0,2320)|0;if((e|0)==0){ar(1712,(t=i,i=i+8|0,c[t>>2]=b,t)|0)|0;i=d;return}if((c[1242]|0)>0){b=0;do{f=c[1244]|0;if((f|0)>0){g=_(f,b)|0;f=0;while(1){j=+h[a+(g<<3)>>3];ap(e|0,2240,(t=i,i=i+8|0,h[t>>3]=j==999999999.0?0.0:j,t)|0)|0;k=f+1|0;if((k|0)<(c[1244]|0)){g=g+1|0;f=k}else{break}}}aO(10,e|0)|0;b=b+1|0;}while((b|0)<(c[1242]|0))}am(e|0)|0;i=d;return}function bB(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[1124]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=4536+(h<<2)|0;j=4536+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[1124]=e&~(1<<g)}else{if(l>>>0<(c[1128]|0)>>>0){ao();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{ao();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[1126]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=4536+(p<<2)|0;m=4536+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[1124]=e&~(1<<r)}else{if(l>>>0<(c[1128]|0)>>>0){ao();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{ao();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[1126]|0;if((l|0)!=0){q=c[1129]|0;d=l>>>3;l=d<<1;f=4536+(l<<2)|0;k=c[1124]|0;h=1<<d;do{if((k&h|0)==0){c[1124]=k|h;s=f;t=4536+(l+2<<2)|0}else{d=4536+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[1128]|0)>>>0){s=g;t=d;break}ao();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[1126]=m;c[1129]=e;n=i;return n|0}l=c[1125]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[4800+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[1128]|0;if(r>>>0<i>>>0){ao();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){ao();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){ao();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){ao();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){ao();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{ao();return 0}}}while(0);L640:do{if((e|0)!=0){f=d+28|0;i=4800+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[1125]=c[1125]&~(1<<c[f>>2]);break L640}else{if(e>>>0<(c[1128]|0)>>>0){ao();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L640}}}while(0);if(v>>>0<(c[1128]|0)>>>0){ao();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[1126]|0;if((f|0)!=0){e=c[1129]|0;i=f>>>3;f=i<<1;q=4536+(f<<2)|0;k=c[1124]|0;g=1<<i;do{if((k&g|0)==0){c[1124]=k|g;y=q;z=4536+(f+2<<2)|0}else{i=4536+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[1128]|0)>>>0){y=l;z=i;break}ao();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[1126]=p;c[1129]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[1125]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[4800+(A<<2)>>2]|0;L688:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L688}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[4800+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[1126]|0)-g|0)>>>0){o=g;break}q=K;m=c[1128]|0;if(q>>>0<m>>>0){ao();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){ao();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){ao();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){ao();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){ao();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{ao();return 0}}}while(0);L738:do{if((e|0)!=0){i=K+28|0;m=4800+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[1125]=c[1125]&~(1<<c[i>>2]);break L738}else{if(e>>>0<(c[1128]|0)>>>0){ao();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L738}}}while(0);if(L>>>0<(c[1128]|0)>>>0){ao();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=4536+(e<<2)|0;r=c[1124]|0;j=1<<i;do{if((r&j|0)==0){c[1124]=r|j;O=m;P=4536+(e+2<<2)|0}else{i=4536+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[1128]|0)>>>0){O=d;P=i;break}ao();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=4800+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[1125]|0;l=1<<Q;if((m&l|0)==0){c[1125]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=579;break}else{l=l<<1;m=j}}if((T|0)==579){if(S>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[1128]|0;if(m>>>0<i>>>0){ao();return 0}if(j>>>0<i>>>0){ao();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[1126]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[1129]|0;if(S>>>0>15){R=J;c[1129]=R+o;c[1126]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[1126]=0;c[1129]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[1127]|0;if(o>>>0<J>>>0){S=J-o|0;c[1127]=S;J=c[1130]|0;K=J;c[1130]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[1116]|0)==0){J=aL(8)|0;if((J-1&J|0)==0){c[1118]=J;c[1117]=J;c[1119]=-1;c[1120]=2097152;c[1121]=0;c[1235]=0;c[1116]=(a1(0)|0)&-16^1431655768;break}else{ao();return 0}}}while(0);J=o+48|0;S=c[1118]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[1234]|0;do{if((O|0)!=0){P=c[1232]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L830:do{if((c[1235]&4|0)==0){O=c[1130]|0;L832:do{if((O|0)==0){T=609}else{L=O;P=4944;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=609;break L832}else{P=M}}if((P|0)==0){T=609;break}L=R-(c[1127]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=a$(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=618}}while(0);do{if((T|0)==609){O=a$(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[1117]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[1232]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[1234]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=a$($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=618}}while(0);L852:do{if((T|0)==618){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=629;break L830}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[1118]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((a$(O|0)|0)==-1){a$(m|0)|0;W=Y;break L852}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=629;break L830}}}while(0);c[1235]=c[1235]|4;ad=W;T=626}else{ad=0;T=626}}while(0);do{if((T|0)==626){if(S>>>0>=2147483647){break}W=a$(S|0)|0;Z=a$(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=629}}}while(0);do{if((T|0)==629){ad=(c[1232]|0)+aa|0;c[1232]=ad;if(ad>>>0>(c[1233]|0)>>>0){c[1233]=ad}ad=c[1130]|0;L872:do{if((ad|0)==0){S=c[1128]|0;if((S|0)==0|ab>>>0<S>>>0){c[1128]=ab}c[1236]=ab;c[1237]=aa;c[1239]=0;c[1133]=c[1116];c[1132]=-1;S=0;do{Y=S<<1;ac=4536+(Y<<2)|0;c[4536+(Y+3<<2)>>2]=ac;c[4536+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[1130]=ab+ae;c[1127]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[1131]=c[1120]}else{S=4944;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=641;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==641){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[1130]|0;Y=(c[1127]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[1130]=Z+ai;c[1127]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[1131]=c[1120];break L872}}while(0);if(ab>>>0<(c[1128]|0)>>>0){c[1128]=ab}S=ab+aa|0;Y=4944;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=651;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==651){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[1130]|0)){J=(c[1127]|0)+K|0;c[1127]=J;c[1130]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[1129]|0)){J=(c[1126]|0)+K|0;c[1126]=J;c[1129]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L917:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=4536+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[1128]|0)>>>0){ao();return 0}if((c[U+12>>2]|0)==(Z|0)){break}ao();return 0}}while(0);if((Q|0)==(U|0)){c[1124]=c[1124]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[1128]|0)>>>0){ao();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}ao();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ap=O;aq=e}}else{ap=L;aq=g}while(1){g=ap+20|0;L=c[g>>2]|0;if((L|0)!=0){ap=L;aq=g;continue}g=ap+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ap=L;aq=g}}if(aq>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[aq>>2]=0;an=ap;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[1128]|0)>>>0){ao();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){ao();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{ao();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=4800+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[1125]=c[1125]&~(1<<c[P>>2]);break L917}else{if(m>>>0<(c[1128]|0)>>>0){ao();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L917}}}while(0);if(an>>>0<(c[1128]|0)>>>0){ao();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);ar=ab+(($|al)+aa)|0;as=$+K|0}else{ar=Z;as=K}J=ar+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=as|1;c[ab+(as+W)>>2]=as;J=as>>>3;if(as>>>0<256){V=J<<1;X=4536+(V<<2)|0;P=c[1124]|0;m=1<<J;do{if((P&m|0)==0){c[1124]=P|m;at=X;au=4536+(V+2<<2)|0}else{J=4536+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[1128]|0)>>>0){at=U;au=J;break}ao();return 0}}while(0);c[au>>2]=_;c[at+12>>2]=_;c[ab+(W+8)>>2]=at;c[ab+(W+12)>>2]=X;break}V=ac;m=as>>>8;do{if((m|0)==0){av=0}else{if(as>>>0>16777215){av=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;av=as>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=4800+(av<<2)|0;c[ab+(W+28)>>2]=av;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[1125]|0;Q=1<<av;if((X&Q|0)==0){c[1125]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((av|0)==31){aw=0}else{aw=25-(av>>>1)|0}Q=as<<aw;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(as|0)){break}ax=X+16+(Q>>>31<<2)|0;m=c[ax>>2]|0;if((m|0)==0){T=724;break}else{Q=Q<<1;X=m}}if((T|0)==724){if(ax>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[ax>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[1128]|0;if(X>>>0<$>>>0){ao();return 0}if(m>>>0<$>>>0){ao();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=4944;while(1){ay=c[W>>2]|0;if(ay>>>0<=Y>>>0){az=c[W+4>>2]|0;aA=ay+az|0;if(aA>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ay+(az-39)|0;if((W&7|0)==0){aB=0}else{aB=-W&7}W=ay+(az-47+aB)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aC=0}else{aC=-_&7}_=aa-40-aC|0;c[1130]=ab+aC;c[1127]=_;c[ab+(aC+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[1131]=c[1120];c[ac+4>>2]=27;c[W>>2]=c[1236];c[W+4>>2]=c[4948>>2];c[W+8>>2]=c[4952>>2];c[W+12>>2]=c[4956>>2];c[1236]=ab;c[1237]=aa;c[1239]=0;c[1238]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aA>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aA>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=4536+(K<<2)|0;S=c[1124]|0;m=1<<W;do{if((S&m|0)==0){c[1124]=S|m;aD=Z;aE=4536+(K+2<<2)|0}else{W=4536+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[1128]|0)>>>0){aD=Q;aE=W;break}ao();return 0}}while(0);c[aE>>2]=ad;c[aD+12>>2]=ad;c[ad+8>>2]=aD;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aF=0}else{if(_>>>0>16777215){aF=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aF=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=4800+(aF<<2)|0;c[ad+28>>2]=aF;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[1125]|0;Q=1<<aF;if((Z&Q|0)==0){c[1125]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aF|0)==31){aG=0}else{aG=25-(aF>>>1)|0}Q=_<<aG;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aH=Z+16+(Q>>>31<<2)|0;m=c[aH>>2]|0;if((m|0)==0){T=759;break}else{Q=Q<<1;Z=m}}if((T|0)==759){if(aH>>>0<(c[1128]|0)>>>0){ao();return 0}else{c[aH>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[1128]|0;if(Z>>>0<m>>>0){ao();return 0}if(_>>>0<m>>>0){ao();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[1127]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[1127]=_;ad=c[1130]|0;Q=ad;c[1130]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aZ()|0)>>2]=12;n=0;return n|0}function bC(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[1128]|0;if(b>>>0<e>>>0){ao()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ao()}h=f&-8;i=a+(h-8)|0;j=i;L1089:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ao()}if((n|0)==(c[1129]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[1126]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=4536+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ao()}if((c[k+12>>2]|0)==(n|0)){break}ao()}}while(0);if((s|0)==(k|0)){c[1124]=c[1124]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ao()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ao()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ao()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){ao()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ao()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ao()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=4800+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[1125]=c[1125]&~(1<<c[v>>2]);q=n;r=o;break L1089}else{if(p>>>0<(c[1128]|0)>>>0){ao()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1089}}}while(0);if(A>>>0<(c[1128]|0)>>>0){ao()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[1128]|0)>>>0){ao()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[1128]|0)>>>0){ao()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ao()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){ao()}do{if((e&2|0)==0){if((j|0)==(c[1130]|0)){B=(c[1127]|0)+r|0;c[1127]=B;c[1130]=q;c[q+4>>2]=B|1;if((q|0)==(c[1129]|0)){c[1129]=0;c[1126]=0}if(B>>>0<=(c[1131]|0)>>>0){return}bG(0)|0;return}if((j|0)==(c[1129]|0)){B=(c[1126]|0)+r|0;c[1126]=B;c[1129]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1195:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=4536+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[1128]|0)>>>0){ao()}if((c[u+12>>2]|0)==(j|0)){break}ao()}}while(0);if((g|0)==(u|0)){c[1124]=c[1124]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[1128]|0)>>>0){ao()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}ao()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[1128]|0)>>>0){ao()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[1128]|0)>>>0){ao()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){ao()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{ao()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=4800+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[1125]=c[1125]&~(1<<c[t>>2]);break L1195}else{if(f>>>0<(c[1128]|0)>>>0){ao()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1195}}}while(0);if(E>>>0<(c[1128]|0)>>>0){ao()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[1128]|0)>>>0){ao()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[1128]|0)>>>0){ao()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[1129]|0)){H=B;break}c[1126]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=4536+(d<<2)|0;A=c[1124]|0;E=1<<r;do{if((A&E|0)==0){c[1124]=A|E;I=e;J=4536+(d+2<<2)|0}else{r=4536+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[1128]|0)>>>0){I=h;J=r;break}ao()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=4800+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[1125]|0;d=1<<K;do{if((r&d|0)==0){c[1125]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=938;break}else{A=A<<1;J=E}}if((N|0)==938){if(M>>>0<(c[1128]|0)>>>0){ao()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[1128]|0;if(J>>>0<E>>>0){ao()}if(B>>>0<E>>>0){ao()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[1132]|0)-1|0;c[1132]=q;if((q|0)==0){O=4952}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[1132]=-1;return}function bD(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=_(b,a)|0;if((b|a)>>>0<=65535){d=e;break}d=((e>>>0)/(a>>>0)|0|0)==(b|0)?e:-1}}while(0);b=bB(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}bI(b|0,0,d|0);return b|0}function bE(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((a_(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==45){i=f;j=1}else if((g<<24>>24|0)==43){i=f;j=0}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=1004}else{if((e|0)>0){v=0.0;w=e;x=l;y=1004}else{z=0.0;A=0.0}}if((y|0)==1004){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(I*10|0)-48+(J<<24>>24)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(aZ()|0)>>2]=34;N=1.0;O=8;P=511;y=1021}else{if((m|0)==0){Q=1.0}else{N=1.0;O=8;P=m;y=1021}}if((y|0)==1021){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=1021}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function bF(a){a=a|0;return+(+bE(a,0))}function bG(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[1116]|0)==0){b=aL(8)|0;if((b-1&b|0)==0){c[1118]=b;c[1117]=b;c[1119]=-1;c[1120]=2097152;c[1121]=0;c[1235]=0;c[1116]=(a1(0)|0)&-16^1431655768;break}else{ao();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[1130]|0;if((b|0)==0){d=0;return d|0}e=c[1127]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[1118]|0;g=_((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=4944;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=a$(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=a$(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=a$(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[1232]=(c[1232]|0)-j;h=c[1130]|0;m=(c[1127]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[1130]=j+o;c[1127]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[1131]=c[1120];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[1127]|0)>>>0<=(c[1131]|0)>>>0){d=0;return d|0}c[1131]=-1;d=0;return d|0}function bH(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bK(a,b){a=a|0;b=b|0;return a2[a&1](b|0)|0}function bL(a){a=a|0;a3[a&1]()}function bM(a,b,c){a=a|0;b=b|0;c=c|0;return a4[a&1](b|0,c|0)|0}function bN(a,b){a=a|0;b=b|0;a5[a&1](b|0)}function bO(a){a=a|0;$(0);return 0}function bP(){$(1)}function bQ(a,b){a=a|0;b=b|0;$(2);return 0}function bR(a){a=a|0;$(3)}
// EMSCRIPTEN_END_FUNCS
var a2=[bO,bO];var a3=[bP,bP];var a4=[bQ,bQ];var a5=[bR,bR];return{_strlen:bH,_free:bC,_main:bz,_memset:bI,_malloc:bB,_memcpy:bJ,_calloc:bD,runPostSets:bm,stackAlloc:a6,stackSave:a7,stackRestore:a8,setThrew:a9,setTempRet0:bc,setTempRet1:bd,setTempRet2:be,setTempRet3:bf,setTempRet4:bg,setTempRet5:bh,setTempRet6:bi,setTempRet7:bj,setTempRet8:bk,setTempRet9:bl,dynCall_ii:bK,dynCall_v:bL,dynCall_iii:bM,dynCall_vi:bN}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_open": _open, "_fabsf": _fabsf, "_snprintf": _snprintf, "_lseek": _lseek, "_fclose": _fclose, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_sqrt": _sqrt, "_printf": _printf, "_close": _close, "_pread": _pread, "_fopen": _fopen, "__reallyNegative": __reallyNegative, "_strtol": _strtol, "_asin": _asin, "_atanf": _atanf, "_fabs": _fabs, "_strtok": _strtok, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_fseek": _fseek, "_send": _send, "_write": _write, "_ftell": _ftell, "_sprintf": _sprintf, "_rewind": _rewind, "_strdup": _strdup, "_sin": _sin, "_sysconf": _sysconf, "_fread": _fread, "__parseInt": __parseInt, "_fputc": _fputc, "_read": _read, "__formatString": __formatString, "_atoi": _atoi, "___assert_func": ___assert_func, "_cos": _cos, "_pwrite": _pwrite, "_recv": _recv, "_llvm_pow_f64": _llvm_pow_f64, "_fsync": _fsync, "_floor": _floor, "___errno_location": ___errno_location, "_isspace": _isspace, "_sbrk": _sbrk, "_exp": _exp, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = false;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
