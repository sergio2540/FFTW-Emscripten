function Run(data){

Module = {};
Module['preRun'] = [];

//OUTPUT
Module['return'] = {};
Module['return']['output'] = {};
Module['return']['output']['files'] = {};
Module['return']['output']['stdout'] = '';
Module['return']['output']['stderr'] = '';

//PATH CODE
Module['dirname'] = function dirname(path){

  return path.substring(0,path.lastIndexOf('/')+1);
}

Module['basename'] = function basename(path){

  return path.substring(path.lastIndexOf('/')+1);
}

//COMPRESS CODE
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// this work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.3.0

var LZString = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  
  compressToBase64 : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    
    input = this.compress(input);
    
    while (i < input.length*2) {
      
      if (i%2==0) {
        chr1 = input.charCodeAt(i/2) >> 8;
        chr2 = input.charCodeAt(i/2) & 255;
        if (i/2+1 < input.length) 
          chr3 = input.charCodeAt(i/2+1) >> 8;
        else 
          chr3 = NaN;
      } else {
        chr1 = input.charCodeAt((i-1)/2) & 255;
        if ((i+1)/2 < input.length) {
          chr2 = input.charCodeAt((i+1)/2) >> 8;
          chr3 = input.charCodeAt((i+1)/2) & 255;
        } else 
          chr2=chr3=NaN;
      }
      i+=3;
      
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      
      output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      
    }
    
    return output;
  },
  
  decompressFromBase64 : function (input) {
    var output = "",
        ol = 0, 
        output_,
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;
    
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    
    while (i < input.length) {
      
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      
      if (ol%2==0) {
        output_ = chr1 << 8;
        flush = true;
        
        if (enc3 != 64) {
          output += String.fromCharCode(output_ | chr2);
          flush = false;
        }
        if (enc4 != 64) {
          output_ = chr3 << 8;
          flush = true;
        }
      } else {
        output = output + String.fromCharCode(output_ | chr1);
        flush = false;
        
        if (enc3 != 64) {
          output_ = chr2 << 8;
          flush = true;
        }
        if (enc4 != 64) {
          output += String.fromCharCode(output_ | chr3);
          flush = false;
        }
      }
      ol+=3;
    }
    
    return this.decompress(output);
    
  },

  compressToUTF16 : function (input) {
    var output = "",
        i,c,
        current,
        status = 0;
    
    input = this.compress(input);
    
    for (i=0 ; i<input.length ; i++) {
      c = input.charCodeAt(i);
      switch (status++) {
        case 0:
          output += String.fromCharCode((c >> 1)+32);
          current = (c & 1) << 14;
          break;
        case 1:
          output += String.fromCharCode((current + (c >> 2))+32);
          current = (c & 3) << 13;
          break;
        case 2:
          output += String.fromCharCode((current + (c >> 3))+32);
          current = (c & 7) << 12;
          break;
        case 3:
          output += String.fromCharCode((current + (c >> 4))+32);
          current = (c & 15) << 11;
          break;
        case 4:
          output += String.fromCharCode((current + (c >> 5))+32);
          current = (c & 31) << 10;
          break;
        case 5:
          output += String.fromCharCode((current + (c >> 6))+32);
          current = (c & 63) << 9;
          break;
        case 6:
          output += String.fromCharCode((current + (c >> 7))+32);
          current = (c & 127) << 8;
          break;
        case 7:
          output += String.fromCharCode((current + (c >> 8))+32);
          current = (c & 255) << 7;
          break;
        case 8:
          output += String.fromCharCode((current + (c >> 9))+32);
          current = (c & 511) << 6;
          break;
        case 9:
          output += String.fromCharCode((current + (c >> 10))+32);
          current = (c & 1023) << 5;
          break;
        case 10:
          output += String.fromCharCode((current + (c >> 11))+32);
          current = (c & 2047) << 4;
          break;
        case 11:
          output += String.fromCharCode((current + (c >> 12))+32);
          current = (c & 4095) << 3;
          break;
        case 12:
          output += String.fromCharCode((current + (c >> 13))+32);
          current = (c & 8191) << 2;
          break;
        case 13:
          output += String.fromCharCode((current + (c >> 14))+32);
          current = (c & 16383) << 1;
          break;
        case 14:
          output += String.fromCharCode((current + (c >> 15))+32, (c & 32767)+32);
          status = 0;
          break;
      }
    }
    
    return output + String.fromCharCode(current + 32);
  },
  

  decompressFromUTF16 : function (input) {
    var output = "",
        current,c,
        status=0,
        i = 0;
    
    while (i < input.length) {
      c = input.charCodeAt(i) - 32;
      
      switch (status++) {
        case 0:
          current = c << 1;
          break;
        case 1:
          output += String.fromCharCode(current | (c >> 14));
          current = (c&16383) << 2;
          break;
        case 2:
          output += String.fromCharCode(current | (c >> 13));
          current = (c&8191) << 3;
          break;
        case 3:
          output += String.fromCharCode(current | (c >> 12));
          current = (c&4095) << 4;
          break;
        case 4:
          output += String.fromCharCode(current | (c >> 11));
          current = (c&2047) << 5;
          break;
        case 5:
          output += String.fromCharCode(current | (c >> 10));
          current = (c&1023) << 6;
          break;
        case 6:
          output += String.fromCharCode(current | (c >> 9));
          current = (c&511) << 7;
          break;
        case 7:
          output += String.fromCharCode(current | (c >> 8));
          current = (c&255) << 8;
          break;
        case 8:
          output += String.fromCharCode(current | (c >> 7));
          current = (c&127) << 9;
          break;
        case 9:
          output += String.fromCharCode(current | (c >> 6));
          current = (c&63) << 10;
          break;
        case 10:
          output += String.fromCharCode(current | (c >> 5));
          current = (c&31) << 11;
          break;
        case 11:
          output += String.fromCharCode(current | (c >> 4));
          current = (c&15) << 12;
          break;
        case 12:
          output += String.fromCharCode(current | (c >> 3));
          current = (c&7) << 13;
          break;
        case 13:
          output += String.fromCharCode(current | (c >> 2));
          current = (c&3) << 14;
          break;
        case 14:
          output += String.fromCharCode(current | (c >> 1));
          current = (c&1) << 15;
          break;
        case 15:
          output += String.fromCharCode(current | c);
          status=0;
          break;
      }
      
      
      i++;
    }
    
    return this.decompress(output);
    //return output;
    
  },


  
  compress: function (uncompressed) {
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_result= "",
        context_data_string="", 
        context_data_val=0, 
        context_data_position=0,
        ii;
    
    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!context_dictionary.hasOwnProperty(context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      
      context_wc = context_w + context_c;
      if (context_dictionary.hasOwnProperty(context_wc)) {
        context_w = context_wc;
      } else {
        if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data_string += String.fromCharCode(context_data_val);
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          
          
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }
    
    // Output the code for w.
    if (context_w !== "") {
      if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data_string += String.fromCharCode(context_data_val);
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data_string += String.fromCharCode(context_data_val);
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
        
        
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }
    
    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == 15) {
        context_data_position = 0;
        context_data_string += String.fromCharCode(context_data_val);
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }
    
    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == 15) {
        context_data_string += String.fromCharCode(context_data_val);
        break;
      }
      else context_data_position++;
    }
    return context_data_string;
  },
  
  decompress: function (compressed) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = "",
        i,
        w,
        bits, resb, maxpower, power,
        c,
        errorCount=0,
        literal,
        data = {string:compressed, val:compressed.charCodeAt(0), position:32768, index:1};
    
    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }
    
    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = 32768;
        data.val = data.string.charCodeAt(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }
    
    switch (next = bits) {
      case 0: 
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = String.fromCharCode(bits);
        break;
      case 1: 
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = String.fromCharCode(bits);
        break;
      case 2: 
        return "";
    }
    dictionary[3] = c;
    w = result = c;
    while (true) {
      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = 32768;
          data.val = data.string.charCodeAt(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0: 
          if (errorCount++ > 10000) return "Error";
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1: 
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = 32768;
              data.val = data.string.charCodeAt(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = String.fromCharCode(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2: 
          return result;
      }
      
      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
      
      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result += entry;
      
      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      
      w = entry;
      
      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
      
    }
  }
};


module.exports.compress = LZString.compressToBase64.bind(LZString);
module.exports.decompress = LZString.decompressFromBase64.bind(LZString);



Module['compress'] = module.exports.compress;
Module['decompress'] = module.exports.decompress;





Module['preRun'].push(function () {

if((data.input) && (data.input.files)){ 
        var files = data.input.files;
	files.forEach(function(file) {
 
		var dirname = Module['dirname'](file.name);
		var basename = Module['basename'](file.name);
		
	
		var content = ((file.decompress) || (file.compress)) ? Module['decompress'](file.content) : file.content;
		

		Module['FS_createDataFile'](dirname,basename,content,true,true); 
	}); 

}
		
		var dirname = Module['dirname'](Module['dirname']('/audioArray.txt'));
		var basename = Module['basename'](Module['basename']('/audioArray.txt'));
		
		var content = Module['decompress']('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nuqYypiamy5t6pAqnZqUqpSvYOqZmpGakqqa6pKanBqbUpKqmBqXapZiklqSipZanKqQWpFamFqcmptak5qdqpKqnnlk2pcan+FnzOxC65qbapkakWqVWpranyqSGpBpaNqeOpDan6qTWpzakzqZKplakDqbKp/ymzqb6pdamgKe2pt5ZhqTYpNKk9qeRWy6l2KZ+WU5YHli+JUakjqY1mJql9qWmpwqnlsdRWC6mKqaWWgym5qfOpg6m3qRCp0amrqcOppan4qZOpCanUqSupH6k4iZ+pPCn6qWeW15Y4VhepSSlZyZ8pe6mbqb3mmFZNllvJLamyprSprZZzqZ2pR6nEieP22RZwVjuWyGn1LhypaGm0KempAZbgaaepWqljqd+pcynBSRRp0GmpqWKWD6lvqV+pBZYb5kOpean/qTRp76meqd+WVFbmqURW3ak4aTupHQkkaXcp1y4gacxpJ6k15rhpsamN8QxpnGlGlhhpMGm2KXepLy50qY/J06maKXOWKIk/qYUpiGlqaX+prGlAaVpphmmiqYBpummjqaaWE6lGaSxp4ykhMZvJpmmKqU+pi6nUab4ppGlWCWxp6y5gqRppjGlBqW5peml2aX6pBGk8aaUp/onsaT5pZmncKQ5pCmkvqRxpfmkcaRFpRGlRaV5pxGkyaTFp/CkWaUWpSaldqclpQmk6aUKpiWkJabaWKWn6aYVp+GlpaVZpcqkmadlp4ilxaVepjmkeqcVplWmoaaVp+WklaU5pDZaYqaep/mlNabypoWlKaTJpUikVaVlpWKmRac+pjCk5aYNpHWnRaTCp6WmWaWsp9WnjaUUpeWkjabVpxmljaRNpPWn1qTNpo2khafpp1WmLaWFpqZatabxp82mracJpsmm+aQ1pbWldactpimm0aWtpRWmPqQFp8WlgaaGpZGkDaW6pNWnDaddp4mknaT9prSm7aWdpDCn7aZlp72l7acYppqn5adZp22mFaf9pc2l3af9p8OkCKb9p7mmzaRdpGqkI6cWpfGlmFpJpemmQVh2pV2m9aXdpsOmAaf9p4KnBacDpb2nE6Y9p1am5aQDpYOmo6QTpp2no6Rlp52ltqYdpn2nyKZNpx2kHaZtpX2lLaSSWXOnk6Y4p66kRqdep7Om3aRTpSOks6SDp3klcafJpMZYJ5oV+u6lQaYXxlGl35kzpPOl06QLpUunmaWzpT2mA6Qzpkun7qeqpBunbaTDp9On7KXzpeukc6Xcurmn3aUNpSfbzlkFpxukcSYrp9Knm6S6W6umq6ZSpVuku6UrpXUng6Zbpjsk7iZrphOnKaShpxqm26fGpXumy6XhWUOnu6T7JGumvqXDpVOmg6eLphun2adcpROmIaa1xgenXLlnpcemZydbpBmnJiWrpKelPya7pupaQadJp1imwabfJcGlyaY6pjS4NSQXpoemF6T7pQenoaZDpW5Z+6VXpQOmNKWJpuekFaQ9pv6l96dopKuksafnpjWm66R9pCMmR6fHpUqnPaTXpZWnC6f4pEumsyb3p+EkLabaWoml6qYipAyn8abZpmOm9qfbpM+kd6ZhpeemQqdjpo+lN6b8pGSnT6c7pHumI6Xhp8+lR6bLpnukt6RMpU2lhphupaen4yfRprelL6c1pl6kX6VrpcimvaeFpkvaeaSYpy+naaa+J6em/6d9p3+kD6bzpYBkCaYkpyemZKehpselAGaAZJunj6Sjpbemn6anp1Om4GQgZg+nv6YLpN2mxae1pjOll6WbppBnUGfjp7ek1KTGp/ukv6cAZtOnMGZwZWGnsGX1pdBn8GSPpeBna6fAZj+lMGUQZBqm8GeRpieln6YFpSelr6ZQZ+BnCGR/pFylk6UoZChk46QIZ9+kL6frpZBnX6Rtp02kGGVQZ62koFtUpxekwGXVpkhnyGWoZl2lTqTTpFBmL6VYZehniGfQZABmOGUIZRukSGSfpxBkP6cYZOKn2GefpQ+kMGb4ZdumuGSIZCemGGYgZ6hlOGSJpoGkoGUXpk+nWGR4Zjen6GeYZ3mkhGW4ZKRkQ6WXpCRnRGWYZBBmhGakZE+mWGdnpmhnSGcEZORnlqczpSRk0GSoZIBkFGVEZYunOGTUZyhmm6c0ZDRkdKXYZ2RnFGX9ppRkRGYkZ7hkZ6Uupihlj6SQpWhktaXvp+allGdwZLBmc6fUZySlBGekZtRngSbvp/SmzGTrpUxk/8XfpW6n9GboZlRkTGeUZ8+mQVq/pzmm0GWIZu6bYGd1pixktGfkZGRlrGRAZGOkLGeMZLyk76VsZaRkVGZkZlxnvGYwZVRmDGRcuohlaGTnpN6mfGZ0ZghkfGSMZuRlfGXUZtxnyLofphBneGXLpMhmXKVcZ7RlNGWcZyJk2GVmpXhmeGb+WOxmTGdHpJxlLGf1pQul/GQcZjxkgmQCZbRm4mVCZ9xlRKeVpYRk7aZnp5JnbGRCZTJl9GeCZvxkbGXEu8GnJGXcZ1xlUmeiZ1RlomTyZMJlY6f/pW+mAmbIZmmlsmfzpUhkraXyZbKmwVhwZ/hkymdCZApmNGfCZRxmsmYUZBJnymQMZuxmsGRvpnWnAaVAZXen8mccZ5BmMmXwZQpl0mevpu5aGmbyZWRnWmaCZa6mwGSiZqWmumRiZzxk/6TwZZJl3cQHp7Jn6md8ZHqkXGQGZJhnsqV/pjpk/GUaZUxkhmSqZNmmimQfplSl6mf8ZnJlOmVGZRBZX6cmZMRki6QEZmpm+mXMZ9pkimRXpuylXljmZkpnHqf0ZmZngGdqZg+nEVmWZXBmN6VWZaBklmYKZthlWmVoZsZny6enpmZlgmeqZ0xn9maaZLJkQaXaZI5k9mS6Zk5b16VgZTSnDmdWZbpl5GVtpkZkTmaAmtenwafWmELETSRVJsMnmmXEZSJl1mYepQJmhmTbpiZnFmWkZEpmO6eeZqJkkmdoZcZm6mU2ZphlPGUgZKxlFGfmZ4pk2mXOZ25nlmQiZ3GkXmTUpd5kJmeGZL5n0mR+ZP5kridyZ+SmV6aOZYpncKS8Z3umqGa2ZqZndcc2Z4ekb6bOZuhak6dSZupmBmeEZSWkYGR2ZsRl9mWEpKFlQWdzpcpk4KYWZDJm6qZOZuZkFFn+Zx+mAGRaZaJnAWQ4pYFlDGZRxPi4upnPpcJnb6d6ZGFnI6bWZ3RlzmfCWUBl46R6ZQ5kFmTfpUxmQmQOZvRmYWXiZV8nUWc3p75lKmRspTumBGTiZRFn3mcpZillmmRGZDFm36ffxGGbrmUmZ0Zkl6bBZ35mImVKZrRnOmaSZIuaoWWJZW+kiWfsZapnnqazpwZkmmW+ZelkIWU5Z96maWa5ZCykVKXRZCunVyf2pnekyWWRZm+mEmWFZDhk0mV5Z0pkGmZBZx5m4yfRZO5nMWQ3pHln2WUBZw+kUmZgZFpxAVqgmLmmJWYJpCxkuGcEpulkpWT4ZaplYWfOZARmdmQ6Znpk1meVZDS5jmX4ZlJkZWQ1ZBFmtWVmZFFnZWfpZMenTmeJZVVlSWVJZZ5kWWRWZCpk96SOZJlkeafWZlllrKbjp+Fm7mQJZDYkcmfiZC5nLWVVZyplcGUNZNO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');
		
		
		Module['FS_createDataFile'](dirname,basename,content,true,true);
	
		

	Module['print'] = function(text){
		Module['return']['output']['stdout'] += text + '\n';
	};

	Module['printErr'] = function(text){
		Module['return']['output']['stderr'] += text + '\n';
	};
});

//

//EMSCRIPTEN CODE
// Note: Some Emscripten settings will significantly limit the speed of the generated code.
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
else if (ENVIRONMENT_IS_SHELL) {
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
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
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
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
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
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
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
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
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
STATICTOP = STATIC_BASE + 32064;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stdout;
var _stderr;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([2,0,1,0,2,0,3,0,2,0,7,0,3,1,0,0,2,0,1,0,2,0,3,0,2,0,9,0,2,0,27,0,2,0,63,0,3,1,0,0,2,0,1,0,2,0,3,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,2,0,9,0,2,0,27,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,2,0,9,0,2,0,24,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,2,0,9,0,2,0,19,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,2,0,9,0,2,0,15,0,3,1,0,0,0,0,0,0,2,0,1,0,2,0,3,0,2,0,9,0,3,1,0,0,4,0,9,0,3,1,0,0,4,0,8,0,3,1,0,0,4,0,7,0,3,1,0,0,4,0,64,0,3,1,0,0,4,0,6,0,3,1,0,0,4,0,5,0,3,1,0,0,4,0,4,0,3,1,0,0,4,0,32,0,3,1,0,0,4,0,3,0,3,1,0,0,4,0,25,0,3,1,0,0,4,0,20,0,3,1,0,0,4,0,2,0,3,1,0,0,4,0,16,0,3,1,0,0,4,0,15,0,3,1,0,0,4,0,12,0,3,1,0,0,4,0,10,0,3,1,0,0,4,0,8,0,3,1,0,0,4,0,6,0,3,1,0,0,4,0,5,0,3,1,0,0,4,0,4,0,3,1,0,0,4,0,3,0,3,1,0,0,4,1,9,0,3,1,0,0,4,1,8,0,3,1,0,0,4,1,7,0,3,1,0,0,4,1,64,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,5,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,3,0,3,1,0,0,4,1,25,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,15,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,2,1,1,0,2,1,3,0,2,1,7,0,3,1,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,27,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,24,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,19,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,15,0,3,1,0,0,0,0,0,0,4,1,8,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,2,1,1,0,2,1,3,0,2,1,7,0,3,1,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,27,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,19,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,15,0,3,1,0,0,0,0,0,0,4,1,8,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,2,1,1,0,2,1,3,0,2,1,7,0,3,1,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,27,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,19,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,15,0,3,1,0,0,0,0,0,0,4,1,8,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,4,1,8,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,8,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,2,1,1,0,2,1,3,0,2,1,7,0,3,1,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,27,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,19,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,15,0,3,1,0,0,0,0,0,0,4,1,9,0,3,1,0,0,4,1,8,0,3,1,0,0,4,1,7,0,3,1,0,0,4,1,64,0,3,1,0,0,4,1,6,0,3,1,0,0,4,1,5,0,3,1,0,0,4,1,4,0,3,1,0,0,4,1,32,0,3,1,0,0,4,1,3,0,3,1,0,0,4,1,25,0,3,1,0,0,4,1,20,0,3,1,0,0,4,1,2,0,3,1,0,0,4,1,16,0,3,1,0,0,4,1,15,0,3,1,0,0,4,1,12,0,3,1,0,0,4,1,10,0,3,1,0,0,2,1,1,0,2,1,3,0,2,1,7,0,3,1,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,27,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,24,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,19,0,3,1,0,0,0,0,0,0,2,1,1,0,2,1,3,0,2,1,9,0,2,1,15,0,3,1,0,0,0,0,0,0,4,0,2,0,3,1,0,0,128,9,0,0,0,0,0,0,84,73,77,69,79,85,84,0,120,164,106,215,86,183,199,232,219,112,32,36,238,206,189,193,175,15,124,245,42,198,135,71,19,70,48,168,1,149,70,253,216,152,128,105,175,247,68,139,177,91,255,255,190,215,92,137,34,17,144,107,147,113,152,253,142,67,121,166,33,8,180,73,98,37,30,246,64,179,64,192,81,90,94,38,170,199,182,233,93,16,47,214,83,20,68,2,129,230,161,216,200,251,211,231,230,205,225,33,214,7,55,195,135,13,213,244,237,20,90,69,5,233,227,169,248,163,239,252,217,2,111,103,138,76,42,141,66,57,250,255,129,246,113,135,34,97,157,109,12,56,229,253,68,234,190,164,169,207,222,75,96,75,187,246,112,188,191,190,198,126,155,40,250,39,161,234,133,48,239,212,5,29,136,4,57,208,212,217,229,153,219,230,248,124,162,31,101,86,172,196,68,34,41,244,151,255,42,67,167,35,148,171,57,160,147,252,195,89,91,101,146,204,12,143,125,244,239,255,209,93,132,133,79,126,168,111,224,230,44,254,20,67,1,163,161,17,8,78,130,126,83,247,53,242,58,189,187,210,215,42,145,211,134,235,0,0,0,0,16,0,0,0,0,8,0,0,8,0,0,0,0,0,1,0,0,0,0,0,92,5,0,0,112,86,0,0,154,5,0,0,40,112,0,0,50,5,0,0,40,100,0,0,188,3,0,0,136,95,0,0,66,1,0,0,24,91,0,0,106,1,0,0,88,87,0,0,186,1,0,0,16,84,0,0,8,5,0,0,72,80,0,0,136,2,0,0,200,75,0,0,118,3,0,0,240,73,0,0,130,4,0,0,88,120,0,0,80,0,0,0,40,119,0,0,32,5,0,0,56,117,0,0,40,6,0,0,56,116,0,0,108,4,0,0,208,114,0,0,20,2,0,0,208,112,0,0,132,3,0,0,232,110,0,0,86,2,0,0,48,109,0,0,196,3,0,0,96,107,0,0,0,0,0,0,0,0,0,0,62,5,0,0,0,88,0,0,224,3,0,0,72,113,0,0,226,3,0,0,96,100,0,0,84,5,0,0,176,95,0,0,200,0,0,0,48,91,0,0,208,2,0,0,120,87,0,0,0,0,0,0,0,0,0,0,242,2,0,0,240,77,0,0,214,0,0,0,208,107,0,0,94,5,0,0,184,98,0,0,42,4,0,0,56,94,0,0,174,4,0,0,8,90,0,0,16,2,0,0,80,86,0,0,84,2,0,0,32,83,0,0,162,4,0,0,56,79,0,0,20,0,0,0,48,75,0,0,186,0,0,0,144,73,0,0,164,5,0,0,56,121,0,0,0,0,0,0,0,0,0,0,0,7,1,12,2,17,3,22,4,7,5,12,6,17,7,22,8,7,9,12,10,17,11,22,12,7,13,12,14,17,15,22,1,5,6,9,11,14,0,20,5,5,10,9,15,14,4,20,9,5,14,9,3,14,8,20,13,5,2,9,7,14,12,20,5,4,8,11,11,16,14,23,1,4,4,11,7,16,10,23,13,4,0,11,3,16,6,23,9,4,12,11,15,16,2,23,0,6,7,10,14,15,5,21,12,6,3,10,10,15,1,21,8,6,15,10,6,15,13,21,4,6,11,10,2,15,9,21,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,2,0,0,0,30,4,0,0,104,4,0,0,72,6,0,0,70,1,0,0,0,0,0,0,3,0,0,0,62,3,0,0,56,6,0,0,60,6,0,0,208,5,0,0,0,0,0,0,1,0,0,0,112,2,0,0,86,0,0,0,224,2,0,0,82,4,0,0,0,0,0,0,0,0,0,0,22,5,0,0,88,5,0,0,116,3,0,0,136,4,0,0,0,0,0,0,5,0,0,0,3,1,0,0,4,0,0,0,3,1,0,0,2,0,0,0,46,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,254,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,172,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,168,4,0,0,0,0,0,0,0,0,0,0,2,0,0,0,156,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,100,4,0,0,0,0,0,0,0,0,0,0,2,0,0,0,108,5,0,0,0,0,0,0,0,0,0,0,2,0,0,0,18,1,0,0,0,0,0,0,0,0,0,0,3,0,0,0,98,4,0,0,0,0,0,0,0,0,0,0,3,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,160,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,160,4,0,0,0,0,0,0,0,0,0,0,3,0,0,0,82,6,0,0,0,0,0,0,0,0,0,0,3,0,0,0,82,5,0,0,0,0,0,0,0,0,0,0,2,0,0,0,12,6,0,0,0,0,0,0,0,0,0,0,2,0,0,0,144,3,0,0,0,0,0,0,0,0,0,0,1,0,0,0,124,5,0,0,0,0,0,0,0,0,0,0,3,0,0,0,174,3,0,0,0,0,0,0,0,0,0,0,1,0,0,0,106,6,0,0,0,0,0,0,0,0,0,0,2,0,0,0,120,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,182,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,144,5,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,226,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,26,5,0,0,0,0,0,0,0,0,0,0,1,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,192,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,240,5,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,24,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,126,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,38,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,104,2,0,0,0,0,0,0,0,0,0,0,250,4,0,0,46,2,0,0,82,3,0,0,164,4,0,0,250,4,0,0,232,5,0,0,4,5,0,0,70,5,0,0,250,4,0,0,136,1,0,0,22,4,0,0,76,3,0,0,250,4,0,0,48,3,0,0,246,5,0,0,172,1,0,0,250,4,0,0,222,4,0,0,140,1,0,0,70,4,0,0,250,4,0,0,50,2,0,0,86,5,0,0,204,5,0,0,250,4,0,0,216,3,0,0,72,3,0,0,82,2,0,0,250,4,0,0,172,5,0,0,180,0,0,0,114,0,0,0,242,3,0,0,218,2,0,0,208,0,0,0,78,3,0,0,242,3,0,0,4,4,0,0,178,0,0,0,132,0,0,0,250,4,0,0,164,0,0,0,106,3,0,0,238,3,0,0,250,4,0,0,46,2,0,0,82,0,0,0,164,4,0,0,242,3,0,0,226,5,0,0,228,3,0,0,0,3,0,0,242,3,0,0,34,2,0,0,84,4,0,0,100,1,0,0,242,3,0,0,46,2,0,0,60,5,0,0,164,4,0,0,250,4,0,0,182,3,0,0,204,0,0,0,4,3,0,0,250,4,0,0,236,2,0,0,164,1,0,0,212,5,0,0,250,4,0,0,220,3,0,0,126,2,0,0,50,3,0,0,42,1,0,0,168,2,0,0,140,3,0,0,80,5,0,0,242,3,0,0,230,2,0,0,156,1,0,0,140,4,0,0,42,1,0,0,58,0,0,0,196,0,0,0,8,6,0,0,250,4,0,0,200,3,0,0,166,2,0,0,194,0,0,0,250,4,0,0,54,3,0,0,218,1,0,0,164,4,0,0,42,1,0,0,194,4,0,0,96,2,0,0,36,5,0,0,42,1,0,0,48,0,0,0,240,3,0,0,64,4,0,0,42,1,0,0,236,3,0,0,6,3,0,0,88,4,0,0,242,3,0,0,46,2,0,0,36,4,0,0,52,5,0,0,250,4,0,0,46,2,0,0,10,6,0,0,120,3,0,0,250,4,0,0,46,2,0,0,198,0,0,0,222,1,0,0,242,3,0,0,0,5,0,0,122,2,0,0,84,6,0,0,42,1,0,0,148,5,0,0,128,5,0,0,20,5,0,0,42,1,0,0,190,3,0,0,28,1,0,0,16,6,0,0,42,1,0,0,46,2,0,0,174,2,0,0,164,4,0,0,42,1,0,0,32,1,0,0,114,4,0,0,124,2,0,0,42,1,0,0,46,2,0,0,6,0,0,0,230,1,0,0,42,1,0,0,122,4,0,0,38,0,0,0,232,0,0,0,250,4,0,0,162,2,0,0,166,5,0,0,196,2,0,0,250,4,0,0,26,2,0,0,206,2,0,0,218,3,0,0,250,4,0,0,90,0,0,0,150,5,0,0,220,2,0,0,42,1,0,0,236,5,0,0,10,2,0,0,164,4,0,0,0,0,0,0,36,0,0,0,220,1,0,0,46,0,0,0,0,0,0,0,182,2,0,0,18,5,0,0,86,4,0,0,0,0,0,0,130,2,0,0,252,0,0,0,40,4,0,0,0,0,0,0,80,3,0,0,78,0,0,0,36,1,0,0,0,0,0,0,2,5,0,0,212,3,0,0,128,4,0,0,0,0,0,0,228,1,0,0,184,3,0,0,74,3,0,0,0,0,0,0,210,3,0,0,98,6,0,0,152,2,0,0,8,0,0,0,0,1,0,0,8,0,0,0,0,1,0,0,8,0,0,0,0,1,0,0,224,4,0,0,240,118,0,0,254,3,0,0,144,119,0,0,0,0,0,0,0,0,0,0,134,0,0,0,112,120,0,0,136,0,0,0,8,120,0,0,124,0,0,0,192,103,0,0,126,0,0,0,160,97,0,0,128,0,0,0,40,93,0,0,130,0,0,0,56,89,0,0,144,0,0,0,128,85,0,0,146,0,0,0,48,82,0,0,34,3,0,0,216,77,0,0,36,3,0,0,216,74,0,0,100,2,0,0,248,120,0,0,32,3,0,0,192,119,0,0,26,3,0,0,88,118,0,0,28,3,0,0,208,116,0,0,22,3,0,0,136,115,0,0,88,0,0,0,240,113,0,0,98,0,0,0,152,111,0,0,244,1,0,0,40,110,0,0,226,4,0,0,64,108,0,0,228,4,0,0,208,106,0,0,238,4,0,0,184,104,0,0,236,4,0,0,144,103,0,0,248,4,0,0,32,102,0,0,246,4,0,0,184,101,0,0,68,6,0,0,48,101,0,0,242,4,0,0,192,100,0,0,232,4,0,0,240,99,0,0,230,4,0,0,120,99,0,0,124,3,0,0,16,99,0,0,122,3,0,0,104,98,0,0,128,3,0,0,0,98,0,0,126,3,0,0,112,97,0,0,210,0,0,0,0,97,0,0,136,3,0,0,168,96,0,0,184,2,0,0,72,96,0,0,188,2,0,0,240,95,0,0,38,3,0,0,88,95,0,0,30,3,0,0,0,95,0,0,224,5,0,0,168,94,0,0,90,2,0,0,232,93,0,0,40,3,0,0,128,93,0,0,244,3,0,0,248,92,0,0,248,3,0,0,136,92,0,0,214,1,0,0,48,92,0,0,216,1,0,0,232,91,0,0,206,1,0,0,112,91,0,0,208,1,0,0,232,90,0,0,210,1,0,0,160,90,0,0,212,1,0,0,88,90,0,0,202,1,0,0,192,89,0,0,204,1,0,0,128,89,0,0,146,2,0,0,80,89,0,0,144,2,0,0,216,88,0,0,142,2,0,0,168,88,0,0,140,2,0,0,56,88,0,0,16,0,0,0,216,87,0,0,192,0,0,0,64,87,0,0,138,3,0,0,16,87,0,0,22,2,0,0,192,86,0,0,52,2,0,0,32,86,0,0,60,2,0,0,224,85,0,0,56,2,0,0,152,85,0,0,62,2,0,0,32,85,0,0,50,4,0,0,216,84,0,0,54,4,0,0,136,84,0,0,46,4,0,0,72,84,0,0,188,0,0,0,248,83,0,0,242,1,0,0,200,83,0,0,10,3,0,0,104,83,0,0,254,2,0,0,8,83,0,0,58,2,0,0,152,82,0,0,204,2,0,0,0,82,0,0,188,4,0,0,144,81,0,0,64,3,0,0,96,81,0,0,56,3,0,0,8,81,0,0,58,3,0,0,160,80,0,0,52,3,0,0,48,80,0,0,152,3,0,0,232,79,0,0,154,3,0,0,168,79,0,0,150,3,0,0,24,79,0,0,22,1,0,0,80,78,0,0,90,3,0,0,184,77,0,0,156,4,0,0,48,77,0,0,142,4,0,0,240,76,0,0,174,1,0,0,152,76,0,0,58,4,0,0,40,76,0,0,38,6,0,0,168,75,0,0,0,0,0,0,0,0,0,0,234,0,0,0,32,120,0,0,236,0,0,0,216,119,0,0,238,0,0,0,168,103,0,0,240,0,0,0,136,97,0,0,242,0,0,0,16,93,0,0,244,0,0,0,32,89,0,0,246,0,0,0,104,85,0,0,248,0,0,0,24,82,0,0,64,2,0,0,160,77,0,0,152,4,0,0,192,74,0,0,146,4,0,0,224,120,0,0,148,4,0,0,168,119,0,0,94,2,0,0,24,118,0,0,158,4,0,0,184,116,0,0,154,4,0,0,112,115,0,0,250,1,0,0,216,113,0,0,160,5,0,0,128,111,0,0,116,2,0,0,16,110,0,0,18,0,0,0,40,108,0,0,12,0,0,0,184,106,0,0,220,4,0,0,160,104,0,0,218,4,0,0,120,103,0,0,216,4,0,0,8,102,0,0,214,4,0,0,160,101,0,0,212,4,0,0,24,101,0,0,210,4,0,0,168,100,0,0,208,4,0,0,216,99,0,0,206,4,0,0,96,99,0,0,234,3,0,0,248,98,0,0,232,3,0,0,80,98,0,0,230,3,0,0,232,97,0,0,200,4,0,0,88,97,0,0,104,1,0,0,232,96,0,0,74,2,0,0,144,96,0,0,8,3,0,0,48,96,0,0,132,5,0,0,216,95,0,0,16,3,0,0,64,95,0,0,12,3,0,0,232,94,0,0,198,1,0,0,144,94,0,0,90,4,0,0,208,93,0,0,18,3,0,0,104,93,0,0,66,6,0,0,224,92,0,0,64,6,0,0,112,92,0,0,32,6,0,0,24,92,0,0,34,6,0,0,208,91,0,0,28,6,0,0,88,91,0,0,30,6,0,0,208,90,0,0,24,6,0,0,136,90,0,0,26,6,0,0,64,90,0,0,44,6,0,0,168,89,0,0,46,6,0,0,104,89,0,0,72,5,0,0,8,89,0,0,74,5,0,0,192,88,0,0,76,5,0,0,96,88,0,0,78,5,0,0,32,88,0,0,14,6,0,0,192,87,0,0,30,5,0,0,40,87,0,0,66,4,0,0,216,86,0,0,68,4,0,0,168,86,0,0,180,2,0,0,8,86,0,0,176,2,0,0,200,85,0,0,172,2,0,0,80,85,0,0,170,2,0,0,240,84,0,0,96,0,0,0,192,84,0,0,100,0,0,0,112,84,0,0,104,0,0,0,48,84,0,0,60,3,0,0,224,83,0,0,244,4,0,0,176,83,0,0,142,0,0,0,80,83,0,0,216,2,0,0,240,82,0,0,246,2,0,0,128,82,0,0,44,0,0,0,232,81,0,0,248,1,0,0,120,81,0,0,66,0,0,0,72,81,0,0,68,0,0,0,240,80,0,0,72,0,0,0,136,80,0,0,76,0,0,0,24,80,0,0,108,2,0,0,200,79,0,0,110,2,0,0,112,79,0,0,114,2,0,0,216,78,0,0,254,5,0,0,48,78,0,0,102,1,0,0,128,77,0,0,96,1,0,0,16,77,0,0,108,1,0,0,208,76,0,0,94,0,0,0,120,76,0,0,96,6,0,0,8,76,0,0,170,4,0,0,136,75,0,0,0,0,0,0,0,0,0,0,188,5,0,0,56,107,0,0,190,5,0,0,8,119,0,0,138,2,0,0,80,102,0,0,186,5,0,0,48,97,0,0,180,5,0,0,184,92,0,0,182,5,0,0,240,88,0,0,200,5,0,0,56,85,0,0,202,5,0,0,168,81,0,0,116,0,0,0,80,77,0,0,118,0,0,0,168,74,0,0,120,0,0,0,168,120,0,0,122,0,0,0,56,120,0,0,108,0,0,0,168,118,0,0,110,0,0,0,248,116,0,0,112,0,0,0,192,115,0,0,246,3,0,0,40,114,0,0,28,2,0,0,216,111,0,0,88,2,0,0,96,110,0,0,92,2,0,0,144,108,0,0,110,5,0,0,144,106,0,0,112,5,0,0,240,104,0,0,98,5,0,0,232,103,0,0,100,5,0,0,56,102,0,0,102,5,0,0,216,101,0,0,104,5,0,0,120,101,0,0,120,5,0,0,144,100,0,0,122,5,0,0,16,100,0,0,56,1,0,0,152,99,0,0,98,3,0,0,40,99,0,0,40,1,0,0,128,98,0,0,92,3,0,0,24,98,0,0,58,6,0,0,192,97,0,0,134,3,0,0,24,97,0,0,76,4,0,0,192,96,0,0,72,4,0,0,104,96,0,0,134,4,0,0,8,96,0,0,138,4,0,0,112,95,0,0,180,3,0,0,24,95,0,0,34,4,0,0,112,94,0,0,192,2,0,0,0,94,0,0,132,4,0,0,152,93,0,0,184,0,0,0,64,93,0,0,18,6,0,0,160,92,0,0,22,6,0,0,72,92,0,0,154,1,0,0,0,92,0,0,162,1,0,0,136,91,0,0,166,1,0,0,0,91,0,0,152,1,0,0,184,90,0,0,160,1,0,0,112,90,0,0,158,1,0,0,216,89,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,24,73,0,0,40,73,0,0,8,73,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,24,5,0,0,20,3,0,0,104,77,0,0,78,6,0,0,184,5,0,0,248,107,0,0,16,1,0,0,110,1,0,0,216,98,0,0,42,6,0,0,94,4,0,0,88,94,0,0,168,5,0,0,238,1,0,0,40,90,0,0,102,2,0,0,238,1,0,0,144,86,0,0,150,4,0,0,240,1,0,0,56,83,0,0,90,6,0,0,6,6,0,0,88,79,0,0,252,1,0,0,6,6,0,0,72,75,0,0,0,0,0,0,2,0,0,0,68,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,6,0,0,0,1,0,0,0,114,50,104,99,0,0,0,0,114,50,104,99,48,49,0,0,114,50,104,99,49,48,0,0,114,50,104,99,49,49,0,0,104,99,50,114,0,0,0,0,104,99,50,114,48,49,0,0,104,99,50,114,49,48,0,0,104,99,50,114,49,49,0,0,100,104,116,0,0,0,0,0,114,101,100,102,116,48,48,0,114,101,100,102,116,48,49,0,114,101,100,102,116,49,48,0,114,101,100,102,116,49,49,0,114,111,100,102,116,48,48,0,114,111,100,102,116,48,49,0,114,111,100,102,116,49,48,0,114,111,100,102,116,49,49,0,56,73,0,0,88,73,0,0,0,0,0,0,1,0,0,0,8,4,0,0,0,0,0,0,1,0,0,0,0,0,0,0,8,4,0,0,4,0,0,0,1,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,92,6,0,0,0,0,0,0,0,0,0,0,3,0,0,0,118,4,0,0,0,0,0,0,0,0,0,0,2,0,0,0,150,2,0,0,0,0,0,0,0,0,0,0,3,0,0,0,58,5,0,0,0,0,0,0,0,0,0,0,1,0,0,0,106,4,0,0,0,0,0,0,0,0,0,0,40,5,0,0,194,2,0,0,176,3,0,0,234,2,0,0,176,4,0,0,0,0,0,0,64,0,0,0,0,0,0,0,32,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,8,0,0,0,8,0,0,0,0,0,1,0,0,0,0,0,128,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,128,0,0,0,128,0,0,0,2,0,0,0,2,0,0,0,0,0,16,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,16,0,0,0,16,0,0,0,2,0,0,0,2,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,4,0,0,0,4,0,0,0,0,4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,16,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,16,0,0,0,16,0,0,32,0,0,0,32,0,0,0,0,64,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,64,0,0,0,64,0,0,128,0,0,0,128,0,0,0,0,128,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,128,0,0,0,128,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,16,0,0,0,16,0,0,0,0,0,4,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,8,0,0,0,8,0,0,0,0,0,8,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,8,0,0,0,8,0,0,16,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,16,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,32,0,0,0,32,0,0,0,64,0,0,0,0,0,0,0,128,16,16,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,4,0,0,0,0,0,32,0,0,0,32,0,0,0,0,199,9,0,0,0,0,0,16,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,16,0,0,0,16,0,0,0,0,16,0,0,0,16,0,0,0,0,2,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,32,0,0,0,32,0,0,4,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,4,0,0,0,4,0,0,0,0,64,0,0,0,64,0,0,0,8,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,4,0,0,0,4,0,0,0,32,0,0,0,0,0,0,64,0,0,0,64,0,0,0,0,32,0,0,0,32,0,0,64,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,234,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,70,6,0,0,1,0,0,0,72,73,0,0,104,73,0,0,255,255,255,255,254,255,255,255,252,255,255,255,248,255,255,255,240,255,255,255,224,255,255,255,192,255,255,255,0,0,0,0,4,0,0,0,8,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,0,0,0,0,8,0,0,0,96,92,0,0,8,0,0,0,200,26,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,104,92,0,0,24,0,0,0,200,26,0,0,0,0,0,0,0,128,139,64,0,0,0,0,0,32,120,64,0,0,0,0,0,32,113,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,208,92,0,0,48,0,0,0,200,26,0,0,0,0,0,0,0,0,62,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,216,92,0,0,64,0,0,0,200,26,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,88,93,0,0,80,0,0,0,200,26,0,0,0,0,0,0,0,128,119,64,0,0,0,0,0,0,101,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,96,93,0,0,104,0,0,0,200,26,0,0,0,0,0,0,0,128,113,64,0,0,0,0,0,128,102,64,0,0,0,0,0,0,100,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,192,93,0,0,128,0,0,0,200,26,0,0,0,0,0,0,0,128,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,200,93,0,0,152,0,0,0,200,26,0,0,0,0,0,0,0,128,99,64,0,0,0,0,0,0,81,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,48,94,0,0,176,0,0,0,200,26,0,0,0,0,0,0,0,0,83,64,0,0,0,0,0,0,69,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,136,94,0,0,192,0,0,0,200,26,0,0,0,0,0,0,0,0,78,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,216,94,0,0,200,0,0,0,200,26,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,224,94,0,0,208,0,0,0,200,26,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,48,95,0,0,216,0,0,0,200,26,0,0,0,0,0,0,0,64,137,64,0,0,0,0,0,224,112,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,56,95,0,0,224,0,0,0,200,26,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,168,95,0,0,232,0,0,0,200,26,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,208,95,0,0,240,0,0,0,200,26,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,32,96,0,0,248,0,0,0,200,26,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,40,96,0,0,0,1,0,0,200,26,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,128,96,0,0,8,1,0,0,200,26,0,0,0,0,0,0,0,64,112,64,0,0,0,0,0,128,97,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,136,96,0,0,16,1,0,0,200,26,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,216,96,0,0,24,1,0,0,200,26,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,224,96,0,0,32,1,0,0,200,26,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,72,97,0,0,40,1,0,0,200,26,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,97,0,0,48,1,0,0,200,26,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,216,97,0,0,56,1,0,0,200,26,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,224,97,0,0,64,1,0,0,200,26,0,0,0,0,0,0,0,0,122,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,56,98,0,0,72,1,0,0,200,26,0,0,0,0,0,0,0,0,104,64,0,0,0,0,0,0,85,64,0,0,0,0,0,0,85,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,72,98,0,0,80,1,0,0,200,26,0,0,0,0,0,0,0,64,96,64,0,0,0,0,0,128,81,64,0,0,0,0,0,128,81,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,160,98,0,0,88,1,0,0,200,26,0,0,0,0,0,0,0,0,80,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,240,98,0,0,96,1,0,0,200,26,0,0,0,0,0,0,0,0,62,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,64,99,0,0,8,6,0,0,200,26,0,0,0,0,0,0,0,0,32,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,80,99,0,0,0,0,0,0,0,0,78,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,144,99,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,176,99,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,208,99,0,0,0,0,0,0,0,64,137,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,90,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,80,100,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,136,100,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,216,100,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,8,101,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,0,74,64,0,0,0,0,0,0,64,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,16,101,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,144,101,0,0,0,0,0,0,0,64,112,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,152,101,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,208,101,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,240,101,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,248,101,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,60,64,0,0,0,0,0,0,60,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,152,102,0,0,0,0,0,0,0,0,89,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,72,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,8,103,0,0,0,0,0,0,0,64,97,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,103,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,104,0,0,0,0,0,0,0,0,52,64,0,0,0,0,0,0,36,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,168,22,0,0,11,0,0,0,8,0,0,0,8,104,0,0,0,0,0,0,0,0,52,64,0,0,0,0,0,0,34,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,168,22,0,0,10,0,0,0,9,0,0,0,16,104,0,0,0,0,0,0,0,0,53,64,0,0,0,0,0,0,34,64,0,0,0,0,0,0,49,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,8,0,0,0,24,104,0,0,0,0,0,0,0,0,52,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,11,0,0,0,48,104,0,0,0,0,0,0,0,0,78,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,84,64].concat([0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,32,104,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,64,0,0,0,40,104,0,0,0,0,0,0,0,96,117,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,74,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,6,0,0,0,56,104,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,5,0,0,0,64,104,0,0,0,0,0,0,0,0,34,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,4,0,0,0,72,104,0,0,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,32,0,0,0,80,104,0,0,0,0,0,0,0,128,97,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,3,0,0,0,88,104,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,25,0,0,0,96,104,0,0,0,0,0,0,0,64,93,64,0,0,0,0,0,128,76,64,0,0,0,0,0,192,84,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,20,0,0,0,104,104,0,0,0,0,0,0,0,128,82,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,2,0,0,0,120,104,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,16,0,0,0,128,104,0,0,0,0,0,0,0,0,75,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,15,0,0,0,136,104,0,0,0,0,0,0,0,0,73,64,0,0,0,0,0,0,38,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,14,0,0,0,144,104,0,0,0,0,0,0,0,0,67,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,13,0,0,0,152,104,0,0,0,0,0,0,0,128,76,64,0,0,0,0,0,0,46,64,0,0,0,0,0,0,51,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,128,0,0,0,208,104,0,0,0,0,0,0,0,96,137,64,0,0,0,0,0,64,103,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,12,0,0,0,224,104,0,0,0,0,0,0,0,0,65,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,11,0,0,0,232,104,0,0,0,0,0,0,0,0,52,64,0,0,0,0,0,0,36,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,10,0,0,0,72,105,0,0,0,0,0,0,0,0,60,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,176,22,0,0,0,0,0,0,9,0,0,0,80,105,0,0,0,0,0,0,0,0,57,64,0,0,0,0,0,0,42,64,0,0,0,0,0,0,49,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,8,0,0,0,96,105,0,0,0,0,0,0,0,0,50,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,7,0,0,0,112,105,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,64,0,0,0,128,105,0,0,0,0,0,0,0,96,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,6,0,0,0,144,105,0,0,0,0,0,0,0,0,38,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,5,0,0,0,160,105,0,0,0,0,0,0,0,0,34,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,4,0,0,0,176,105,0,0,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,32,0,0,0,192,105,0,0,0,0,0,0,0,64,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,3,0,0,0,208,105,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,25,0,0,0,224,105,0,0,0,0,0,0,0,128,95,64,0,0,0,0,0,128,78,64,0,0,0,0,0,192,85,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,20,0,0,0,240,105,0,0,0,0,0,0,0,128,85,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,2,0,0,0,0,106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,16,0,0,0,16,106,0,0,0,0,0,0,0,0,75,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,15,0,0,0,32,106,0,0,0,0,0,0,0,0,75,64,0,0,0,0,0,0,46,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,12,0,0,0,56,106,0,0,0,0,0,0,0,128,67,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,10,0,0,0,72,106,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,184,22,0,0,0,0,0,0,9,0,0,0,88,106,0,0,104,1,0,0,96,23,0,0,0,0,0,0,0,0,78,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,8,0,0,0,96,106,0,0,112,1,0,0,96,23,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,7,0,0,0,168,106,0,0,120,1,0,0,96,23,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,64,0,0,0,176,106,0,0,128,1,0,0,96,23,0,0,0,0,0,0,0,64,137,64,0,0,0,0,0,224,112,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,0,0,6,0,0,0,232,106,0,0,136,1,0,0,96,23,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,5,0,0,0,240,106,0,0,144,1,0,0,96,23,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,0,107,0,0,152,1,0,0,96,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,8,107,0,0,160,1,0,0,96,23,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,3,0,0,0,24,107,0,0,168,1,0,0,96,23,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,25,0,0,0,32,107,0,0,176,1,0,0,96,23,0,0,0,0,0,0,0,64,112,64,0,0,0,0,0,128,97,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,20,0,0,0,40,107,0,0,184,1,0,0,96,23,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,48,107,0,0,192,1,0,0,96,23,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,80,107,0,0,200,1,0,0,96,23,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,15,0,0,0,88,107,0,0,208,1,0,0,96,23,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,0,0,12,0,0,0,128,107,0,0,216,1,0,0,96,23,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,144,107,0,0,224,1,0,0,96,23,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,152,107,0,0,232,1,0,0,96,23,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,5,0,0,0,160,107,0,0,248,1,0,0,96,23,0,0,0,0,0,0,0,0,62,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,176,107,0,0,8,2,0,0,96,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,32,0,0,0,184,107,0,0,24,2,0,0,96,23,0,0,0,0,0,0,0,128,119,64,0,0,0,0,0,0,101,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,25,0,0,0,192,107,0,0,48,2,0,0,96,23,0,0,0,0,0,0,0,128,113,64,0,0,0,0,0,128,102,64,0,0,0,0,0,0,100,64,0,0,0,0,0,0,0,0,20,0,0,0,200,107,0,0,72,2,0,0,96,23,0,0,0,0,0,0,0,128,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,16,0,0,0,16,108,0,0,96,2,0,0,96,23,0,0,0,0,0,0,0,128,99,64,0,0,0,0,0,0,81,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,8,0,0,0,24,108,0,0,120,2,0,0,104,23,0,0,0,0,0,0,0,0,81,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,6,0,0,0,88,108,0,0,128,2,0,0,104,23,0,0,0,0,0,0,0,0,70,64,0,0,0,0,0,0,54,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,128,108,0,0,136,2,0,0,104,23,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,168,108,0,0,144,2,0,0,104,23,0,0,0,0,0,0,0,64,121,64,0,0,0,0,0,192,96,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,20,0,0,0,184,108,0,0,152,2,0,0,104,23,0,0,0,0,0,0,0,0,108,64,0,0,0,0,0,128,83,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,200,108,0,0,160,2,0,0,104,23,0,0,0,0,0,0,0,0,32,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,216,108,0,0,168,2,0,0,104,23,0,0,0,0,0,0,0,0,101,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,12,0,0,0,240,108,0,0,176,2,0,0,104,23,0,0,0,0,0,0,0,0,92,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,0,109,0,0,184,2,0,0,104,23,0,0,0,0,0,0,0,0,87,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,16,109,0,0,192,2,0,0,104,23,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,4,0,0,0,32,109,0,0,208,2,0,0,104,23,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,32,0,0,0,80,109,0,0,224,2,0,0,104,23,0,0,0,0,0,0,0,128,123,64,0,0,0,0,0,128,103,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,20,0,0,0,104,109,0,0,248,2,0,0,104,23,0,0,0,0,0,0,0,128,110,64,0,0,0,0,0,0,91,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,16,0,0,0,120,109,0,0,16,3,0,0,104,23,0,0,0,0,0,0,0,128,103,64,0,0,0,0,0,0,85,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,8,0,0,0,136,109,0,0,40,3,0,0,104,23,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,6,0,0,0,144,109,0,0,48,3,0,0,104,23,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,160,109,0,0,56,3,0,0,104,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,200,109,0,0,64,3,0,0,104,23,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,20,0,0,0,216,109,0,0,72,3,0,0,104,23,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,248,109,0,0,80,3,0,0,104,23,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,0,110,0,0,88,3,0,0,104,23,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,12,0,0,0,64,110,0,0,96,3,0,0,104,23,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,80,110,0,0,104,3,0,0,104,23,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,120,110,0,0,112,3,0,0,104,23,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,4,0,0,0,136,110,0,0,128,3,0,0,104,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,32,0,0,0,152,110,0,0,144,3,0,0,104,23,0,0,0,0,0,0,0,128,119,64,0,0,0,0,0,0,101,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,20,0,0,0,168,110,0,0,168,3,0,0,104,23,0,0,0,0,0,0,0,128,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,16,0,0,0,184,110,0,0,192,3,0,0,104,23,0,0,0,0,0,0,0,128,99,64,0,0,0,0,0,0,81,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,9,0,0,0,200,110,0,0,0,0,0,0,0,0,54,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,8,0,0,0,208,110,0,0,0,0,0,0,0,0,52,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,7,0,0,0,216,110,0,0,0,0,0,0,0,0,38,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,42,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,64,0,0,0,224,110,0,0,0,0,0,0,0,96,117,64,0,0,0,0,0,128,84,64,0,0,0,0,0,0,74,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,6,0,0,0,8,111,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,5,0,0,0,16,111,0,0,0,0,0,0,0,0,32,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,4,0,0,0,24,111,0,0,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,32,0,0,0,32,111,0,0,0,0,0,0,0,128,97,64,0,0,0,0,0,0,65,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,3,0,0,0,40,111,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,25,0,0,0,48,111,0,0,0,0,0,0,0,0,89,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,74,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,20,0,0,0,56,111,0,0,0,0,0,0,0,128,81,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,2,0,0,0,64,111,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,16,0,0,0,72,111,0,0,0,0,0,0,0,0,75,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,15,0,0,0,104,111,0,0,0,0,0,0,0,128,71,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,49,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,14,0,0,0,112,111,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,13,0,0,0,120,111,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,46,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,128,0,0,0,176,111,0,0,0,0,0,0,0,96,137,64,0,0,0,0,0,192,104,64,0,0,0,0,0,0,98,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,12,0,0,0,200,111,0,0,0,0,0,0,0,0,65,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,11,0,0,0,208,111,0,0,0,0,0,0,0,0,51,64,0,0,0,0,0,0,36,64,0,0,0,0,0,128,68,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,10,0,0,0,240,111,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,192,22,0,0,0,0,0,0,9,0,0,0,248,111,0,0,0,0,0,0,0,0,54,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,8,0,0,0,8,112,0,0,0,0,0,0,0,0,50,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,7,0,0,0,24,112,0,0,0,0,0,0,0,0,34,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,46,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,64,0,0,0,72,112,0,0,0,0,0,0,0,96,117,64,0,0,0,0,0,0,93,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,6,0,0,0,88,112,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,5,0,0,0,104,112,0,0,0,0,0,0,0,0,32,64,0,0,0,0,0,0,8,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,4,0,0,0,160,112,0,0,0,0,0,0,0,0,24,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,32,0,0,0,176,112,0,0,0,0,0,0,0,64,97,64,0,0,0,0,0,0,72,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,3,0,0,0,192,112,0,0,0,0,0,0,0,0,8,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,25,0,0,0,240,112,0,0,0,0,0,0,0,0,89,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,74,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,20,0,0,0,8,113,0,0,0,0,0,0,0,128,84,64,0,0,0,0,0,0,64,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,2,0,0,0,40,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,16,0,0,0,56,113,0,0,0,0,0,0,0,0,75,64,0,0,0,0,0,0,52,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,15,0,0,0,104,113,0,0,0,0,0,0,0,128,72,64,0,0,0,0,0,0,38,64,0,0,0,0,0,0,46,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,12,0,0,0,120,113,0,0,0,0,0,0,0,0,67,64,0,0,0,0,0,0,48,64,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,10,0,0,0,136,113,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,36,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,200,22,0,0,0,0,0,0,8,0,0,0,152,113,0,0,216,3,0,0,120,23,0,0,0,0,0,0,0,0,81,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,6,0,0,0,168,113,0,0,224,3,0,0,120,23,0,0,0,0,0,0,0,0,70,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,184,113,0,0,232,3,0,0,120,23,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,200,113,0,0,240,3,0,0,120,23,0,0,0,0,0,0,0,64,121,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,20,0,0,0,8,114,0,0,248,3,0,0,120,23,0,0,0,0,0,0,0,0,108,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,24,114,0,0,0,4,0,0,120,23,0,0,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,64,114,0,0,8,4,0,0,120,23,0,0,0,0,0,0,0,0,101,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,12,0,0,0,80,114,0,0,16,4,0,0,120,23,0,0,0,0,0,0,0,0,92,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,96,114,0,0,24,4,0,0,120,23,0,0,0,0,0,0,0,0,87,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,112,114,0,0,32,4,0,0,120,23,0,0,0,0,0,0,0,0,81,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,128,114,0,0,40,4,0,0,120,23,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,144,114,0,0,48,4,0,0,120,23,0,0,0,0,0,0,0,64,121,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,20,0,0,0,176,114,0,0,56,4,0,0,120,23,0,0,0,0,0,0,0,0,108,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,16,0,0,0,192,114,0,0,64,4,0,0,120,23,0,0,0,0,0,0,0,0,101,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,8,0,0,0,240,114,0,0,72,4,0,0,120,23,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,6,0,0,0,248,114,0,0,80,4,0,0,120,23,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,0,115,0,0,88,4,0,0,120,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,8,115,0,0,96,4,0,0,120,23,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,20,0,0,0,24,115,0,0,104,4,0,0,120,23,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,40,115,0,0,112,4,0,0,120,23,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,48,115,0,0,120,4,0,0,120,23,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,12,0,0,0,64,115,0,0,128,4,0,0,120,23,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,80,115,0,0,136,4,0,0,120,23,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,96,115,0,0,144,4,0,0,120,23,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,4,0,0,0,160,115,0,0,160,4,0,0,120,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,32,0,0,0,176,115,0,0,176,4,0,0,120,23,0,0,0,0,0,0,0,128,119,64,0,0,0,0,0,0,101,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,20,0,0,0,216,115,0,0,200,4,0,0,120,23,0,0,0,0,0,0,0,128,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,16,0,0,0,232,115,0,0,224,4,0,0,120,23,0,0,0,0,0,0,0,128,99,64,0,0,0,0,0,0,81,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,9,0,0,0,8,116,0,0,248,4,0,0,136,23,0,0,0,0,0,0,0,0,78,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,8,0,0,0,16,116,0,0,0,5,0,0,136,23,0,0,0,0,0,0,0,0,74,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,7,0,0,0,24,116,0,0,8,5,0,0,136,23,0,0,0,0,0,0,0,0,66,64,0,0,0,0,0,0,56,64,0,0,0,0,0,0,66,64,0,0,0,0,0,0,0,0,64,0,0,0,32,116,0,0,16,5,0,0,136,23,0,0,0,0,0,0,0,64,137,64,0,0,0,0,0,224,112,64,0,0,0,0,0,192,108,64,0,0,0,0,0,0,0,0,6,0,0,0,40,116,0,0,24,5,0,0,136,23,0,0,0,0,0,0,0,0,64,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,5,0,0,0,48,116,0,0,32,5,0,0,136,23,0,0,0,0,0,0,0,0,58,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,80,116,0,0,40,5,0,0,136,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,32,0,0,0,88,116,0,0,48,5,0,0,136,23,0,0,0,0,0,0,0,64,117,64,0,0,0,0,0,128,92,64,0,0,0,0,0,128,87,64,0,0,0,0,0,0,0,0,3,0,0,0,96,116,0,0,56,5,0,0,136,23,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,24,64,0,0,0,0,0,0,0,0,25,0,0,0,104,116,0,0,64,5,0,0,136,23,0,0,0,0,0,0,0,64,112,64,0,0,0,0,0,128,97,64,0,0,0,0,0,128,97,64,0,0,0,0,0,0,0,0,20,0,0,0,112,116,0,0,72,5,0,0,136,23,0,0,0,0,0,0,0,0,103,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,79,64,0,0,0,0,0,0,0,0,2,0,0,0,120,116,0,0,80,5,0,0,136,23,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,16,0,0,0,152,116,0,0,88,5,0,0,136,23,0,0,0,0,0,0,0,0,97,64,0,0,0,0,0,0,71,64,0,0,0,0,0,0,67,64,0,0,0,0,0,0,0,0,15,0,0,0,160,116,0,0,96,5,0,0,136,23,0,0,0,0,0,0,0,0,96,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,76,64,0,0,0,0,0,0,0,0,12,0,0,0,168,116,0,0,104,5,0,0,136,23,0,0,0,0,0,0,0,0,86,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,10,0,0,0,176,116,0,0,112,5,0,0,136,23,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,62,64,0,0,0,0,0,0,0,0,8,0,0,0,232,116,0,0,120,5,0,0,136,23,0,0,0,0,0,0,0,0,76,64,0,0,0,0,0,0,58,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,0,0,5,0,0,0,240,116,0,0,136,5,0,0,136,23,0,0,0,0,0,0,0,0,62,64,0,0,0,0,0,0,50,64,0,0,0,0,0,0,44,64,0,0,0,0,0,0,0,0,4,0,0,0,16,117,0,0,152,5,0,0,136,23,0,0,0,0,0,0,0,0,48,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,32,64,0,0,0,0,0,0,0,0,32,0,0,0,24,117,0,0,168,5,0,0,136,23,0,0,0,0,0,0,0,128,119,64,0,0,0,0,0,0,101,64,0,0,0,0,0,0,92,64,0,0,0,0,0,0,0,0,25,0,0,0,32,117,0,0,192,5,0,0,136,23,0,0,0,0,0,0,0,128,113,64,0,0,0,0,0,128,102,64,0,0,0,0,0,0,100,64,0,0,0,0,0,0,0,0,20,0,0,0,40,117,0,0,216,5,0,0,136,23,0,0,0,0,0,0,0,128,105,64,0,0,0,0,0,0,87,64,0,0,0,0,0,0,82,64,0,0,0,0,0,0,0,0,16,0,0,0,48,117,0,0,240,5,0,0,136,23,0,0,0,0,0,0,0,128,99,64,0,0,0,0,0,0,81,64,0,0,0,0,0,0,68,64,0,0,0,0,0,0,0,0,10,0,0,0,112,104,0,0,0,0,0,0,0,0,82,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,224,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,3,2,0,0,0,0,0,0,0,0,1,0,1,0,1,0,3,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,3,1,0,0,0,0,0,0,0,1,1,0,1,1,1,0,3,1,0,0,0,0,0,0,5,1,0,0,3,1,0,0,5,1,0,0,3,1,0,0,166,3,0,0,202,4,0,0,204,3,0,0,24,94,0,0,106,0,0,0,168,3,0,0,6,1,0,0,56,86,0,0,22,0,0,0,228,5,0,0,214,2,0,0,240,89,0,0,12,1,0,0,192,3,0,0,184,99,0,0,0,0,0,0,186,3,0,0,46,3,0,0,16,103,0,0,0,0,0,0,198,5,0,0,212,2,0,0,80,111,0,0,0,0,0,0,30,1,0,0,100,3,0,0,64,119,0,0,0,0,0,0,40,114,100,102,116,32,37,100,32,37,68,32,37,84,32,37,84,0,0,0,0,0,0,0,102,102,116,119,95,99,116,95,103,101,110,101,114,105,99,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,0,40,114,100,102,116,45,110,111,112,41,0,0,0,0,0,0,40,37,115,47,37,68,0,0,40,114,111,100,102,116,48,48,101,45,114,50,104,99,45,112,97,100,45,37,68,37,118,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,102,102,116,119,95,114,100,102,116,95,100,104,116,95,114,101,103,105,115,116,101,114,0,0,40,37,115,101,45,114,97,100,105,120,50,45,114,50,104,99,45,37,68,37,118,37,40,37,112,37,41,41,0,0,0,0,40,37,115,101,45,114,50,104,99,45,111,100,100,45,37,68,37,118,37,40,37,112,37,41,41,0,0,0,0,0,0,0,40,37,115,101,45,114,50,104,99,45,37,68,37,118,37,40,37,112,37,41,41,0,0,0,40,100,102,116,119,45,103,101,110,101,114,105,99,45,37,115,45,37,68,45,37,68,37,118,37,40,37,112,37,41,41,0,40,114,101,100,102,116,48,48,101,45,115,112,108,105,116,114,97,100,105,120,45,37,68,37,118,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,49,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,49,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,49,0,0,0,0,40,114,101,100,102,116,48,48,101,45,114,50,104,99,45,112,97,100,45,37,68,37,118,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,41,10,0,0,0,0,0,0,40,37,115,45,37,68,120,37,68,37,118,0,0,0,0,0,102,102,116,119,95,100,102,116,95,110,111,112,95,114,101,103,105,115,116,101,114,0,0,0,114,100,102,116,45,114,97,110,107,48,45,105,112,45,115,113,45,116,105,108,101,100,98,117,102,0,0,0,0,0,0,0,40,114,100,102,116,50,45,118,114,97,110,107,62,61,49,45,120,37,68,47,37,100,37,40,37,112,37,41,41,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,50,95,50,48,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,50,95,50,48,0,0,0,0,0,0,0,102,102,116,119,95,100,102,116,95,114,50,104,99,95,114,101,103,105,115,116,101,114,0,0,40,114,100,102,116,50,45,114,100,102,116,45,37,115,45,37,68,37,118,47,37,68,45,37,68,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,50,95,51,50,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,50,95,51,50,0,0,0,0,0,0,0,32,32,40,37,115,32,37,100,32,35,120,37,120,32,35,120,37,120,32,35,120,37,120,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,41,10,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,50,95,49,54,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,50,95,49,54,0,0,0,0,0,0,0,40,37,115,45,100,104,116,45,37,68,37,40,37,112,37,41,41,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,50,95,56,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,50,95,56,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,50,95,52,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,50,95,52,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,48,0,0,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,109,101,109,99,112,121,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,50,48,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,48,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,50,48,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,48,0,0,0,0,102,102,116,119,95,100,102,116,95,105,110,100,105,114,101,99,116,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,40,114,100,102,116,50,45,104,99,50,114,45,114,97,110,107,48,37,40,37,112,37,41,41,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,51,50,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,51,50,0,0,0,0,0,0,0,0,10,32,32,32,32,87,104,101,114,101,32,116,104,101,32,111,117,116,112,117,116,32,102,105,108,101,32,119,105,108,108,32,99,111,110,116,97,105,110,32,97,32,108,105,110,101,32,102,111,114,32,101,97,99,104,32,102,114,97,109,101,10,32,32,32,32,97,110,100,32,97,32,99,111,108,117,109,110,32,102,111,114,32,101,97,99,104,32,99,104,97,110,110,101,108,46,10,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,49,54,0,0,0,0,0,0,0,0,40,114,100,102,116,50,45,114,97,110,107,62,61,50,47,37,100,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,49,54,0,0,0,0,0,0,0,0,102,102,116,119,95,100,102,116,95,98,108,117,101,115,116,101,105,110,95,114,101,103,105,115,116,101,114,0,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,105,112,45,115,113,45,116,105,108,101,100,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,49,50,0,0,0,0,0,0,0,0,40,114,100,102,116,50,32,37,100,32,37,100,32,37,84,32,37,84,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,49,50,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,49,48,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,49,48,0,0,0,0,0,0,0,0])
.concat([40,114,100,102,116,50,45,110,111,112,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,56,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,56,0,102,102,116,119,95,114,100,102,116,95,114,97,110,107,95,103,101,113,50,95,114,101,103,105,115,116,101,114,0,0,0,0,40,114,100,102,116,45,99,116,45,37,115,47,37,68,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,54,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,54,0,102,108,97,103,115,46,116,105,109,101,108,105,109,105,116,95,105,109,112,97,116,105,101,110,99,101,32,61,61,32,116,105,109,101,108,105,109,105,116,95,105,109,112,97,116,105,101,110,99,101,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,52,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,52,0,40,104,99,50,104,99,45,103,101,110,101,114,105,99,45,37,115,45,37,68,45,37,68,37,118,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,100,102,116,95,50,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,100,102,116,95,50,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,50,95,50,48,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,50,95,50,48,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,57,0,0,0,0,0,0,0,40,100,104,116,45,114,97,100,101,114,45,37,68,47,37,68,37,111,105,115,61,37,111,111,115,61,37,40,37,112,37,41,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,50,95,51,50,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,50,95,51,50,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,57,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,57,0,0,0,0,0,40,100,102,116,32,37,100,32,37,100,32,37,100,32,37,68,32,37,68,32,37,84,32,37,84,41,0,0,0,0,0,0,40,100,104,116,45,114,50,104,99,45,37,68,37,40,37,112,37,41,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,50,95,49,54,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,50,95,49,54,0,0,10,85,115,97,103,101,32,58,32,37,115,32,60,105,110,112,117,116,32,102,105,108,101,62,32,60,111,117,116,112,117,116,32,102,105,108,101,62,10,0,40,100,102,116,45,114,50,104,99,45,37,68,37,40,37,112,37,41,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,50,95,56,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,50,95,56,0,0,0,102,102,116,119,95,100,102,116,95,114,97,100,101,114,95,114,101,103,105,115,116,101,114,0,114,100,102,116,45,114,97,110,107,48,45,105,112,45,115,113,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,50,95,52,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,50,95,52,0,0,0,40,114,100,102,116,50,45,98,117,102,102,101,114,101,100,45,37,68,37,118,47,37,68,45,37,68,37,40,37,112,37,41,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,50,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,50,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,51,50,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,51,50,0,0,0,102,102,116,119,95,114,100,102,116,95,103,101,110,101,114,105,99,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,49,54,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,49,54,0,0,0,102,108,97,103,115,46,117,32,61,61,32,117,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,49,50,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,49,50,0,0,0,40,100,102,116,45,98,108,117,101,115,116,101,105,110,45,37,68,47,37,68,37,40,37,112,37,41,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,49,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,49,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,56,0,0,0,0,40,37,115,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,56,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,56,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,54,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,56,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,56,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,54,0,0,0,0,40,114,100,102,116,45,103,101,110,101,114,105,99,45,37,115,45,37,68,41,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,52,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,52,0,0,0,0,82,101,97,100,105,110,103,32,101,114,114,111,114,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,98,95,50,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,99,50,99,102,95,50,0,0,0,0,114,100,102,116,45,116,114,97,110,115,112,111,115,101,45,103,99,100,0,0,0,0,0,0,102,102,116,119,95,100,102,116,95,103,101,110,101,114,105,99,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,95,105,110,100,105,114,101,99,116,95,114,101,103,105,115,116,101,114,0,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,116,105,108,101,100,98,117,102,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,50,53,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,50,53,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,50,48,0,40,100,102,116,45,114,97,100,101,114,45,37,68,37,111,105,115,61,37,111,111,115,61,37,40,37,112,37,41,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,50,48,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,54,52,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,54,52,0,0,102,102,116,119,95,114,100,102,116,95,98,117,102,102,101,114,101,100,95,114,101,103,105,115,116,101,114,0,0,0,0,0,102,102,116,119,95,114,101,111,100,102,116,49,49,101,95,114,50,104,99,95,111,100,100,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,0,40,100,102,116,45,99,116,45,37,115,47,37,68,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,51,50,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,51,50,0,0,102,108,97,103,115,46,108,32,61,61,32,108,0,0,0,0,102,102,116,119,95,114,101,100,102,116,48,48,101,95,114,50,104,99,95,112,97,100,95,114,101,103,105,115,116,101,114,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,49,54,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,49,54,0,0,40,117,110,115,111,108,118,97,98,108,101,41,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,49,53,0,40,100,102,116,45,98,117,102,102,101,114,101,100,45,37,68,37,118,47,37,68,45,37,68,37,40,37,112,37,41,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,49,53,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,49,50,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,49,50,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,55,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,49,48,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,55,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,55,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,49,48,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,57,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,57,0,0,0,77,101,109,111,114,121,32,101,114,114,111,114,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,56,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,56,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,54,0,0,0,0,0,0,0,114,100,102,116,45,116,114,97,110,115,112,111,115,101,45,99,117,116,0,0,0,0,0,0,102,102,116,119,95,100,102,116,95,98,117,102,102,101,114,101,100,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,116,105,108,101,100,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,55,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,55,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,53,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,54,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,54,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,51,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,53,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,53,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,56,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,95,110,111,112,95,114,101,103,105,115,116,101,114,0,0,102,102,116,119,95,114,101,111,100,102,116,49,49,101,95,114,97,100,105,120,50,95,114,50,104,99,95,114,101,103,105,115,116,101,114,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,52,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,52,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,52,0,0,0,0,0,0,0,40,37,42,115,32,37,100,32,35,120,37,120,32,35,120,37,120,32,35,120,37,120,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,41,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,51,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,51,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,113,49,95,50,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,73,73,73,95,50,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,73,73,95,50,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,50,53,0,0,0,0,0,0,116,50,95,56,0,0,0,0,116,50,95,54,52,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,50,53,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,50,53,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,50,48,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,54,0,0,0,0,0,0,0,116,50,95,53,0,0,0,0,116,50,95,52,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,50,48,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,50,48,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,54,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,54,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,49,48,0,0,0,0,0,0,116,50,95,51,50,0,0,0,116,50,95,50,53,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,53,0,0,0,0,0,0,0,70,105,108,101,32,101,114,114,111,114,0,0,0,0,0,0,116,50,95,50,48,0,0,0,116,50,95,49,54,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,51,50,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,51,50,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,54,52,0,0,0,0,0,0,114,100,102,116,45,116,114,97,110,115,112,111,115,101,45,116,111,109,115,53,49,51,0,0,116,50,95,49,48,0,0,0,102,102,116,119,95,100,102,116,95,118,114,97,110,107,95,103,101,113,49,95,114,101,103,105,115,116,101,114,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,105,116,101,114,45,99,111,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,51,50,0,0,0,0,0,0,116,49,95,57,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,49,54,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,49,54,0,0,0,0,0,83,76,86,78,68,88,40,115,108,111,116,41,32,61,61,32,115,108,118,110,100,120,0,0,116,49,95,56,0,0,0,0,116,49,95,55,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,56,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,56,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,49,54,0,0,0,0,0,0,116,49,95,54,52,0,0,0,116,49,95,54,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,50,95,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,50,95,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,56,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,95,118,114,97,110,107,95,103,101,113,49,95,114,101,103,105,115,116,101,114,0,0,0,116,49,95,53,0,0,0,0,102,102,116,119,95,114,101,111,100,102,116,48,49,48,101,95,114,50,104,99,95,114,101,103,105,115,116,101,114,0,0,0,116,49,95,52,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,50,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,50,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,50,95,52,0,0,0,0,0,0,0,116,49,95,51,50,0,0,0,116,49,95,51,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,50,48,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,50,48,0,0,0,0,0,0,41,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,50,53,0,0,0,0,0,0,116,49,95,50,53,0,0,0,116,49,95,50,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,54,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,54,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,50,48,0,0,0,0,0,0,116,49,95,50,0,0,0,0,116,49,95,49,54,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,51,50,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,51,50,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,54,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,53,0,0,0,0,0,0,0,116,49,95,49,53,0,0,0,116,49,95,49,50,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,49,54,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,49,54,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,53,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,53,0,0,0,0,0,114,100,102,116,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,51,50,0,0,0,0,0,0,116,49,95,49,48,0,0,0,113,49,95,56,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,49,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,49,53,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,49,54,0,0,0,0,0,0,114,0,0,0,0,0,0,0,113,49,95,54,0,0,0,0,100,105,102,0,0,0,0,0,113,49,95,53,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,49,50,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,49,50,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,49,53,0,0,0,0,0,0,41,0,0,0,0,0,0,0,113,49,95,52,0,0,0,0,104,99,50,114,0,0,0,0,104,99,50,114,0,0,0,0,102,102,116,119,95,100,102,116,95,114,97,110,107,95,103,101,113,50,95,114,101,103,105,115,116,101,114,0,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,105,116,101,114,45,99,105,0,0,0,0,0,0,113,49,95,51,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,49,48,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,49,48,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,49,50,0,0,0,0,0,0,113,49,95,50,0,0,0,0,100,105,102,0,0,0,0,0,110,49,95,57,0,0,0,0,100,105,102,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,57,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,57,0,0,0,0,0,0,0,110,49,95,56,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,49,48,0,0,0,0,0,0,110,49,95,55,0,0,0,0,114,100,102,116,45,105,110,100,105,114,101,99,116,45,98,101,102,111,114,101,0,0,0,0,110,49,95,54,52,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,56,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,56,0,0,0,0,0,0,0,104,99,50,114,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,57,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,95,118,114,97,110,107,51,95,116,114,97,110,115,112,111,115,101,95,114,101,103,105,115,116,101,114,0,0,0,0,0,110,49,95,54,0,0,0,0,100,105,102,0,0,0,0,0,102,102,116,119,95,114,101,111,100,102,116,48,48,101,95,115,112,108,105,116,114,97,100,105,120,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,110,49,95,53,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,56,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,55,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,55,0,0,0,0,0,0,0,110,49,95,52,0,0,0,0,102,102,116,119,58,32,37,115,58,37,100,58,32,97,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,58,32,37,115,10,0,0,0,0,0,0,110,49,95,51,50,0,0,0,110,49,95,51,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,54,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,54,0,0,0,0,0,0,0,40,102,102,116,119,45,51,46,51,46,51,32,102,102,116,119,95,119,105,115,100,111,109,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,32,35,120,37,77,10,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,55,0,0,0,0,0,0,0,110,49,95,50,53,0,0,0,110,49,95,50,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,53,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,53,0,0,0,0,0,0,0,110,49,95,50,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,54,0,0,0,0,0,0,0,110,49,95,49,54,0,0,0,110,49,95,49,53,0,0,0,100,105,102,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,52,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,52,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,53,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,52,0,0,0,0,0,0,0,40,104,99,50,104,99,45,100,105,114,101,99,116,98,117,102,47,37,68,45,37,68,47,37,68,37,118,32,34,37,115,34,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,110,49,95,49,52,0,0,0,40,114,100,102,116,50,45,37,115,45,100,105,114,101,99,116,45,37,68,37,118,32,34,37,115,34,41,0,0,0,0,0,40,114,100,102,116,45,37,115,45,100,105,114,101,99,116,45,114,50,114,45,37,68,37,118,32,34,37,115,34,41,0,0,40,114,100,102,116,45,37,115,45,100,105,114,101,99,116,98,117,102,47,37,68,45,114,50,99,45,37,68,37,118,32,34,37,115,34,41,0,0,0,0,110,49,95,49,51,0,0,0,100,102,116,45,105,110,100,105,114,101,99,116,45,98,101,102,111,114,101,0,0,0,0,0,40,114,100,102,116,50,45,99,116,45,37,115,47,37,68,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,40,104,99,50,99,45,100,105,114,101,99,116,98,117,102,47,37,68,45,37,68,47,37,68,47,37,68,37,118,32,34,37,115,34,37,40,37,112,37,41,37,40,37,112,37,41,41,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,51,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,51,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,52,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,52,0,0,0,0,0,41,0,0,0,0,0,0,0,110,49,95,49,50,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,52,0,0,0,0,0,0,0,101,49,48,95,56,0,0,0,101,48,49,95,56,0,0,0,114,50,99,102,95,57,0,0,114,50,99,102,95,56,0,0,114,50,99,102,95,55,0,0,114,50,99,102,95,54,52,0,110,49,95,49,49,0,0,0,114,50,99,102,95,54,0,0,114,50,99,102,95,53,0,0,114,50,99,102,95,52,0,0,114,50,99,102,95,51,50,0,114,50,99,102,95,51,0,0,114,50,99,102,95,50,53,0,114,50,99,102,95,50,48,0,110,49,95,49,48,0,0,0,114,50,99,102,95,50,0,0,114,50,99,102,95,49,54,0,114,50,99,102,95,49,53,0,114,50,99,102,95,49,52,0,114,50,99,102,95,49,51,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,98,95,50,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,104,102,95,50,0,0,0,0,0,0,0,114,50,99,102,95,49,50,56,0,0,0,0,0,0,0,0,114,50,99,102,95,49,50,0,114,50,99,102,95,49,49,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,51,0,0,0,0,0,0,0,69,114,114,111,114,32,58,32,73,110,112,117,116,32,102,105,108,101,110,97,109,101,32,40,37,115,41,32,108,111,111,107,115,32,108,105,107,101,32,97,110,32,111,112,116,105,111,110,46,10,10,0,0,0,0,0,32,37,100,0,0,0,0,0,114,50,99,102,95,49,48,0,114,50,99,102,73,73,95,57,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,56,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,55,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,54,52,0,0,0,0,0,0,0,114,50,99,102,73,73,95,54,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,53,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,52,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,51,50,0,0,0,0,0,0,0,114,50,99,102,73,73,95,51,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,50,53,0,0,0,0,0,0,0,114,50,99,102,73,73,95,50,48,0,0,0,0,0,0,0,114,50,99,102,73,73,95,50,0,0,0,0,0,0,0,0,114,50,99,102,73,73,95,49,54,0,0,0,0,0,0,0,114,50,99,102,73,73,95,49,53,0,0,0,0,0,0,0,100,105,116,0,0,0,0,0,114,50,99,102,73,73,95,49,50,0,0,0,0,0,0,0,114,50,99,102,73,73,95,49,48,0,0,0,0,0,0,0,104,102,95,57,0,0,0,0,104,102,95,56,0,0,0,0,40,114,111,100,102,116,48,48,101,45,115,112,108,105,116,114,97,100,105,120,45,37,68,37,118,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,116,49,95,50,0,0,0,0,0,0,0,104,102,95,55,0,0,0,0,104,102,95,54,52,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,50,53,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,50,53,0,0,0,0,104,102,95,54,0,0,0,0,104,102,95,53,0,0,0,0,112,0,0,0,0,0,0,0,104,102,95,52,0,0,0,0,104,102,95,51,50,0,0,0,37,40,37,112,37,41,0,0,104,102,95,51,0,0,0,0,104,102,95,50,53,0,0,0,104,102,95,50,48,0,0,0,104,102,95,50,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,50,0,0,0,0,0,0,0,104,102,95,49,54,0,0,0,104,102,95,49,53,0,0,0,102,102,116,119,95,104,99,50,104,99,95,103,101,110,101,114,105,99,95,114,101,103,105,115,116,101,114,0,0,0,0,0,104,102,95,49,50,0,0,0,114,50,104,99,0,0,0,0,104,102,95,49,48,0,0,0,104,102,50,95,56,0,0,0,104,102,50,95,53,0,0,0,114,50,104,99,0,0,0,0,104,102,50,95,52,0,0,0,104,102,50,95,51,50,0,0,104,102,50,95,50,53,0,0,104,102,50,95,50,48,0,0,102,102,116,119,95,100,102,116,95,105,110,100,105,114,101,99,116,95,116,114,97,110,115,112,111,115,101,95,114,101,103,105,115,116,101,114,0,0,0,0,114,100,102,116,45,114,97,110,107,48,45,109,101,109,99,112,121,45,108,111,111,112,0,0,104,102,50,95,49,54,0,0,104,99,50,99,102,100,102,116,95,56,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,50,48,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,50,48,0,0,0,0,104,99,50,99,102,100,102,116,95,54,0,0,0,0,0,0,40,114,100,102,116,50,45,114,50,104,99,45,114,97,110,107,48,37,118,41,0,0,0,0,104,99,50,99,102,100,102,116,95,52,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,50,53,0,0,0,0,0,0,104,99,50,99,102,100,102,116,95,51,50,0,0,0,0,0,104,99,50,99,102,100,102,116,95,50,48,0,0,0,0,0,104,99,50,99,102,100,102,116,95,50,0,0,0,0,0,0,104,99,50,99,102,100,102,116,95,49,54,0,0,0,0,0,114,100,102,116,50,0,0,0,104,99,50,99,102,100,102,116,95,49,50,0,0,0,0,0,104,99,50,99,102,100,102,116,95,49,48,0,0,0,0,0,104,99,50,99,102,100,102,116,50,95,56,0,0,0,0,0,104,99,50,99,102,100,102,116,50,95,52,0,0,0,0,0,102,102,116,119,95,114,100,102,116,50,95,114,100,102,116,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,0,104,99,50,99,102,100,102,116,50,95,51,50,0,0,0,0,100,105,116,0,0,0,0,0,104,99,50,99,102,100,102,116,50,95,50,48,0,0,0,0,104,99,50,99,102,100,102,116,50,95,49,54,0,0,0,0,104,99,50,99,102,95,56,0,104,99,50,99,102,95,54,0,100,105,116,0,0,0,0,0,104,99,50,99,102,95,52,0,40,100,102,116,45,118,114,97,110,107,62,61,49,45,120,37,68,47,37,100,37,40,37,112,37,41,41,0,0,0,0,0,104,99,50,99,102,95,51,50,0,0,0,0,0,0,0,0,104,99,50,99,102,95,50,48,0,0,0,0,0,0,0,0,100,102,116,0,0,0,0,0,37,40,37,112,37,41,0,0,104,99,50,99,102,95,50,0,104,99,50,99,102,95,49,54,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,50,56,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,50,56,0,0,0,104,99,50,99,102,95,49,50,0,0,0,0,0,0,0,0,104,99,50,99,102,95,49,48,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,50,48,0,0,0,0,0,0,104,99,50,99,102,50,95,56,0,0,0,0,0,0,0,0,104,99,50,99,102,50,95,52,0,0,0,0,0,0,0,0,104,99,50,99,102,50,95,51,50,0,0,0,0,0,0,0,104,99,50,99,102,50,95,50,48,0,0,0,0,0,0,0,104,99,50,99,102,50,95,49,54,0,0,0,0,0,0,0,114,50,99,98,95,57,0,0,114,50,99,98,95,56,0,0,114,50,99,98,95,55,0,0,114,50,99,98,95,54,52,0,102,102,116,119,95,114,100,102,116,50,95,114,97,110,107,95,103,101,113,50,95,114,101,103,105,115,116,101,114,0,0,0,114,50,99,98,95,54,0,0,114,50,99,98,95,53,0,0,114,50,99,98,95,52,0,0,114,50,99,98,95,51,50,0,114,50,99,98,95,51,0,0,114,50,99,98,95,50,53,0,114,50,99,98,95,50,48,0,114,50,99,98,95,50,0,0,114,50,99,98,95,49,54,0,114,100,102,116,45,105,110,100,105,114,101,99,116,45,97,102,116,101,114,0,0,0,0,0,114,50,99,98,95,49,53,0,114,50,99,98,95,49,52,0,114,50,99,98,95,49,51,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,54,52,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,54,52,0,0,0,0,114,50,99,98,95,49,50,56,0,0,0,0,0,0,0,0,114,50,104,99,0,0,0,0,114,50,99,98,95,49,50,0,114,50,99,98,95,49,49,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,54,52,0,0,0,0,0,0,114,50,99,98,95,49,48,0,114,50,99,98,73,73,73,95,57,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,56,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,55,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,95,114,97,110,107,48,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,54,52,0,0,0,0,0,0,114,50,99,98,73,73,73,95,54,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,53,0,0,0,0,0,0,0,37,40,37,112,37,41,0,0,40,100,102,116,45,114,97,110,107,62,61,50,47,37,100,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,114,50,99,98,73,73,73,95,52,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,51,50,0,0,0,0,0,0,114,50,99,98,73,73,73,95,51,0,0,0,0,0,0,0,102,102,116,119,95,114,100,102,116,50,95,98,117,102,102,101,114,101,100,95,114,101,103,105,115,116,101,114,0,0,0,0,114,50,99,98,73,73,73,95,50,53,0,0,0,0,0,0,100,105,116,0,0,0,0,0,114,50,99,98,73,73,73,95,50,48,0,0,0,0,0,0,117,110,115,111,108,118,97,98,108,101,0,0,0,0,0,0,114,50,99,98,73,73,73,95,50,0,0,0,0,0,0,0,114,50,99,98,73,73,73,95,49,54,0,0,0,0,0,0,102,102,116,119,95,114,111,100,102,116,48,48,101,95,114,50,104,99,95,112,97,100,95,114,101,103,105,115,116,101,114,0,114,50,99,98,73,73,73,95,49,53,0,0,0,0,0,0,114,50,99,98,73,73,73,95,49,50,0,0,0,0,0,0,114,50,99,98,73,73,73,95,49,48,0,0,0,0,0,0,104,99,50,99,98,100,102,116,95,56,0,0,0,0,0,0,104,99,50,99,98,100,102,116,95,54,0,0,0,0,0,0,104,99,50,99,98,100,102,116,95,52,0,0,0,0,0,0,104,99,50,99,98,100,102,116,95,51,50,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,51,50,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,51,50,0,0,0,0,104,99,50,99,98,100,102,116,95,50,48,0,0,0,0,0,104,99,50,99,98,100,102,116,95,50,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,51,50,0,0,0,0,0,0,104,99,50,99,98,100,102,116,95,49,54,0,0,0,0,0,104,99,50,99,98,100,102,116,95,49,50,0,0,0,0,0,104,99,50,99,98,100,102,116,95,49,48,0,0,0,0,0,104,99,50,99,98,100,102,116,50,95,56,0,0,0,0,0,104,99,50,99,98,100,102,116,50,95,52,0,0,0,0,0,104,99,50,99,98,100,102,116,50,95,51,50,0,0,0,0,40,100,102,116,45,110,111,112,41,0,0,0,0,0,0,0,104,99,50,99,98,100,102,116,50,95,50,48,0,0,0,0,104,99,50,99,98,100,102,116,50,95,49,54,0,0,0,0,102,102,116,119,95,114,100,102,116,50,95,114,97,110,107,48,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,104,99,50,99,98,95,56,0,104,99,50,99,98,95,54,0,104,99,50,99,98,95,52,0,104,99,50,99,98,95,51,50,0,0,0,0,0,0,0,0,104,99,50,99,98,95,50,48,0,0,0,0,0,0,0,0,104,99,50,99,98,95,50,0,104,99,50,99,98,95,49,54,0,0,0,0,0,0,0,0,104,99,50,99,98,95,49,50,0,0,0,0,0,0,0,0,104,99,50,99,98,95,49,48,0,0,0,0,0,0,0,0,104,99,50,99,98,50,95,56,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,54,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,54,0,0,0,0,104,99,50,99,98,50,95,52,0,0,0,0,0,0,0,0,104,99,50,99,98,50,95,51,50,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,54,0,0,0,0,0,0,104,99,50,99,98,50,95,50,48,0,0,0,0,0,0,0,104,99,50,99,98,50,95,49,54,0,0,0,0,0,0,0,112,108,97,110,110,101,114,46,99,0,0,0,0,0,0,0,104,98,95,57,0,0,0,0,104,98,95,56,0,0,0,0,104,98,95,55,0,0,0,0,104,98,95,54,52,0,0,0,104,98,95,54,0,0,0,0,104,98,95,53,0,0,0,0,102,102,116,119,95,114,100,102,116,50,95,110,111,112,95,114,101,103,105,115,116,101,114,0,104,98,95,52,0,0,0,0,104,98,95,51,50,0,0,0,104,98,95,51,0,0,0,0,104,98,95,50,53,0,0,0,104,98,95,50,48,0,0,0,104,98,95,50,0,0,0,0,40,37,115,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,0,0,0,104,98,95,49,54,0,0,0,104,98,95,49,53,0,0,0,104,98,95,49,50,0,0,0,104,98,95,49,48,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,53,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,53,0,0,0,0,104,98,50,95,56,0,0,0,104,98,50,95,53,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,53,0,0,0,0,0,0,104,98,50,95,52,0,0,0,104,98,50,95,51,50,0,0,104,98,50,95,50,53,0,0,104,98,50,95,50,48,0,0,104,98,50,95,49,54,0,0,102,102,116,119,95,114,100,102,116,50,95,118,114,97,110,107,95,103,101,113,49,95,114,101,103,105,115,116,101,114,0,0,40,100,102,116,45,100,105,114,101,99,116,98,117,102,47,37,68,45,37,68,37,118,32,34,37,115,34,41,0,0,0,0,40,100,102,116,119,45,100,105,114,101,99,116,115,113,45,37,68,47,37,68,37,118,32,34,37,115,34,41,0,0,0,0,40,104,99,50,104,99,45,100,105,114,101,99,116,45,37,68,47,37,68,37,118,32,34,37,115,34,37,40,37,112,37,41,37,40,37,112,37,41,41,0,40,114,100,102,116,45,37,115,45,100,105,114,101,99,116,45,114,50,99,45,37,68,37,118,32,34,37,115,34,41,0,0,100,105,116,0,0,0,0,0,40,104,99,50,99,45,100,105,114,101,99,116,45,37,68,47,37,68,47,37,68,37,118,32,34,37,115,34,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,52,0,0,0,0,40,100,102,116,119,45,100,105,114,101,99,116,98,117,102,47,37,68,45,37,68,47,37,68,37,118,32,34,37,115,34,41,0,0,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,52,0,0,0,0,40,105,110,100,105,114,101,99,116,45,116,114,97,110,115,112,111,115,101,37,118,37,40,37,112,37,41,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,0,0,0,0,97,108,108,111,99,46,99,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,52,0,0,0,0,0,0,40,114,100,102,116,45,98,117,102,102,101,114,101,100,45,37,68,37,118,47,37,68,45,37,68,37,40,37,112,37,41,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,101,48,49,95,56,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,51,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,102,102,116,119,95,100,104,116,95,114,97,100,101,114,95,114,101,103,105,115,116,101,114,0,100,102,116,45,105,110,100,105,114,101,99,116,45,97,102,116,101,114,0,0,0,0,0,0,40,100,102,116,45,100,105,114,101,99,116,45,37,68,37,118,32,34,37,115,34,41,0,0,40,100,102,116,119,45,100,105,114,101,99,116,45,37,68,47,37,68,37,118,32,34,37,115,34,41,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,101,49,48,95,56,0,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,51,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,51,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,51,0,0,0,0,0,40,100,102,116,45,103,101,110,101,114,105,99,45,37,68,41,0,0,0,0,0,0,0,0])
.concat([102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,51,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,50,0,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,51,0,0,0,0,0,0,37,118,0,0,0,0,0,0,102,102,116,119,95,100,104,116,95,114,50,104,99,95,114,101,103,105,115,116,101,114,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,50,0,0,0,0,0,40,114,100,102,116,45,118,114,97,110,107,62,61,49,45,120,37,68,47,37,100,37,40,37,112,37,41,41,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,110,49,95,49,50,0,0,0,0,0,0,40,114,100,102,116,45,114,97,110,107,62,61,50,47,37,100,37,40,37,112,37,41,37,40,37,112,37,41,41,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,98,95,49,50,0,0,0,0,102,102,116,119,95,99,111,100,101,108,101,116,95,114,50,99,102,95,49,50,0,0,0,0,40,100,102,116,119,45,103,101,110,101,114,105,99,98,117,102,47,37,68,45,37,68,45,37,68,37,40,37,112,37,41,41,0,0,0,0,0,0,0,0,102,102,116,119,95,99,116,95,103,101,110,101,114,105,99,98,117,102,95,114,101,103,105,115,116,101,114,0,0,0,0,0,10,0,0,0,0,0,0,0,32,32,37,49,50,46,49,48,102,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS={mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode &= 4095;
        mode |= 0100000;
        return VFS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode &= 511 | 0001000;
        mode |= 0040000;
        return VFS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        mode |= 0020000;
        return VFS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path alreay exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to changews
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_node.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return VFS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        VFS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        VFS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        VFS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        VFS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        VFS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = VFS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          VFS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },readdir:function (stream) {
        if (!stream.stream_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return stream.stream_ops.readdir(stream);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          VFS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write acccess
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      }};
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          // this wouldn't be required if the library wasn't eval'd at first...
          if (!TTY.utf8) {
            TTY.utf8 = new Runtime.UTF8Processor();
          }
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              if (process.stdin.destroyed) {
                return undefined;
              }
              result = process.stdin.read();
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        node.node_ops = MEMFS.node_ops;
        if (FS.isDir(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
          node.contents = [];
        } else if (FS.isLink(node.mode)) {
          node.stream_ops = MEMFS.stream_ops;
        } else if (FS.isChrdev(node.mode)) {
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{open:function (stream) {
          if (FS.isDir(stream.node.mode)) {
            // cache off the directory entries when open'd
            var entries = ['.', '..']
            for (var key in stream.node.contents) {
              if (!stream.node.contents.hasOwnProperty(key)) {
                continue;
              }
              entries.push(key);
            }
            stream.entries = entries;
          }
        },read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.subarray) { // typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          stream.node.timestamp = Date.now();
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },readdir:function (stream) {
          return stream.entries;
        },allocate:function (stream, offset, length) {
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 0x02)) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            assert(contents.buffer === buffer || contents.buffer === buffer.buffer);
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,nodes:[null],devices:[null],streams:[null],nextInode:1,name_table:[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function (errno) {
        this.errno = errno;
        for (var key in ERRNO_CODES) {
          if (ERRNO_CODES[key] === errno) {
            this.code = key;
            break;
          }
        }
        this.message = ERRNO_MESSAGES[errno];
      },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return (parentid + hash) % FS.name_table.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.name_table[hash];
        FS.name_table[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.name_table[hash] === node) {
          FS.name_table[hash] = node.name_next;
        } else {
          var current = FS.name_table[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.name_table[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return VFS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        Object.defineProperty(node, 'read', {
          get: function() { return (node.mode & readMode) === readMode; },
          set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
        });
        Object.defineProperty(node, 'write', {
          get: function() { return (node.mode & writeMode) === writeMode; },
          set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
        });
        // TODO add:
        // isFolder
        // isDevice
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = VFS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayMknod:function (mode) {
        switch (mode & 0170000) {
          case 0100000:
          case 0020000:
          case 0060000:
          case 0010000:
          case 0140000:
            return 0;
          default:
            return ERRNO_CODES.EINVAL;
        }
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperty(stream, 'object', {
          get: function() { return stream.node; },
          set: function(val) { stream.node = val; }
        });
        Object.defineProperty(stream, 'isRead', {
          get: function() { return (stream.flags & 3) !== 1; }
        });
        Object.defineProperty(stream, 'isWrite', {
          get: function() { return (stream.flags & 3) !== 0; }
        });
        Object.defineProperty(stream, 'isAppend', {
          get: function() { return (stream.flags & 8); }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },createDefaultDirectories:function () {
        VFS.mkdir('/tmp', 0777);
      },createDefaultDevices:function () {
        // create /dev
        VFS.mkdir('/dev', 0777);
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        VFS.mkdev('/dev/null', 0666, FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        VFS.mkdev('/dev/tty', 0666, FS.makedev(5, 0));
        VFS.mkdev('/dev/tty1', 0666, FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        VFS.mkdir('/dev/shm', 0777);
        VFS.mkdir('/dev/shm/tmp', 0777);
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          VFS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          VFS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          VFS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = VFS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = VFS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = VFS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        VFS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          VFS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return VFS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            VFS.mkdir(current, 0777);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return VFS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        var node = VFS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          VFS.chmod(path, mode | 146);
          var stream = VFS.open(path, 'w');
          VFS.write(stream, data, 0, data.length, 0);
          VFS.close(stream);
          VFS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = input && output ? 0777 : (input ? 0333 : 0555);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return VFS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return VFS.symlink(target, path);
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
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
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
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.getStream(fd);
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return VFS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (stream && ('socket' in stream)) {
        return _send(fildes, buf, nbyte, 0);
      }
      try {
        var slab = HEAP8;
        return VFS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
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
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  var _sqrtf=Math.sqrt;
  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = VFS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
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
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return VFS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }
  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStream(stream);
      if (streamObj) streamObj.error = false;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.getStream(fd);
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
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return VFS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      }
      try {
        var slab = HEAP8;
        return VFS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
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
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        VFS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);;
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
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
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var _log=Math.log;
  function _abort() {
      Module['abort']();
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return Module['dynCall_iii'](cmp, base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
  var _cos=Math.cos;
  var _sin=Math.sin;
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
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
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  Module["_memset"] = _memset;
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
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
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
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fifi(index,a1,a2,a3) {
  try {
    return Module["dynCall_fifi"](index,a1,a2,a3);
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
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    return Module["dynCall_iiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    return Module["dynCall_iiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
  try {
    return Module["dynCall_iiiiiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiffi(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiffi"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
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
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    return Module["dynCall_iiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
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
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
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
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var _stderr=env._stderr|0;
  var _stdout=env._stdout|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_fifi=env.invoke_fifi;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_iiiiiiiiiii=env.invoke_iiiiiiiiiii;
  var invoke_ii=env.invoke_ii;
  var invoke_iiiiiiiiiiii=env.invoke_iiiiiiiiiiii;
  var invoke_iiiiiiiiiiiiiii=env.invoke_iiiiiiiiiiiiiii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viiiiiiii=env.invoke_viiiiiiii;
  var invoke_viiffi=env.invoke_viiffi;
  var invoke_iiiiiii=env.invoke_iiiiiii;
  var invoke_viiiiiii=env.invoke_viiiiiii;
  var invoke_viiiiiiiii=env.invoke_viiiiiiiii;
  var invoke_viiiiiiiiii=env.invoke_viiiiiiiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_iiiiii=env.invoke_iiiiii;
  var invoke_iiiiiiiiii=env.invoke_iiiiiiiiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_viiii=env.invoke_viiii;
  var _strncmp=env._strncmp;
  var _lseek=env._lseek;
  var _sysconf=env._sysconf;
  var _fread=env._fread;
  var _fclose=env._fclose;
  var _strtok_r=env._strtok_r;
  var _abort=env._abort;
  var _fprintf=env._fprintf;
  var _printf=env._printf;
  var _close=env._close;
  var _pread=env._pread;
  var _fflush=env._fflush;
  var _fopen=env._fopen;
  var _open=env._open;
  var _sqrtf=env._sqrtf;
  var _fputc=env._fputc;
  var _log=env._log;
  var _puts=env._puts;
  var _strtok=env._strtok;
  var ___setErrNo=env.___setErrNo;
  var _fwrite=env._fwrite;
  var _fseek=env._fseek;
  var _qsort=env._qsort;
  var _send=env._send;
  var _write=env._write;
  var _fputs=env._fputs;
  var _ftell=env._ftell;
  var _exit=env._exit;
  var _rewind=env._rewind;
  var _strrchr=env._strrchr;
  var _sin=env._sin;
  var _read=env._read;
  var __reallyNegative=env.__reallyNegative;
  var __formatString=env.__formatString;
  var _gettimeofday=env._gettimeofday;
  var _recv=env._recv;
  var _cos=env._cos;
  var _pwrite=env._pwrite;
  var _putchar=env._putchar;
  var _sbrk=env._sbrk;
  var _fsync=env._fsync;
  var ___errno_location=env.___errno_location;
  var _isspace=env._isspace;
  var _time=env._time;
  var __exit=env.__exit;
  var _strcmp=env._strcmp;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7>>3<<3;return ret|0}function stackSave(){return STACKTOP|0}function stackRestore(top){top=top|0;STACKTOP=top}function setThrew(threw,value){threw=threw|0;value=value|0;if((__THREW__|0)==0){__THREW__=threw;threwValue=value}}function copyTempFloat(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0]}function copyTempDouble(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0];HEAP8[tempDoublePtr+4|0]=HEAP8[ptr+4|0];HEAP8[tempDoublePtr+5|0]=HEAP8[ptr+5|0];HEAP8[tempDoublePtr+6|0]=HEAP8[ptr+6|0];HEAP8[tempDoublePtr+7|0]=HEAP8[ptr+7|0]}function setTempRet0(value){value=value|0;tempRet0=value}function setTempRet1(value){value=value|0;tempRet1=value}function setTempRet2(value){value=value|0;tempRet2=value}function setTempRet3(value){value=value|0;tempRet3=value}function setTempRet4(value){value=value|0;tempRet4=value}function setTempRet5(value){value=value|0;tempRet5=value}function setTempRet6(value){value=value|0;tempRet6=value}function setTempRet7(value){value=value|0;tempRet7=value}function setTempRet8(value){value=value|0;tempRet8=value}function setTempRet9(value){value=value|0;tempRet9=value}function runPostSets(){}function _force_estimator($flags){$flags=$flags|0;var $1=0;$1=$flags;$1=$1&-41;return $1|64|0}function _map_flags($iflags,$oflags,$flagmap,$nmap){$iflags=$iflags|0;$oflags=$oflags|0;$flagmap=$flagmap|0;$nmap=$nmap|0;var $2=0,$3=0,$i=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$oflags;$3=$flagmap;$i=0;label=2;break;case 2:if(($i|0)<($nmap|0)){label=3;break}else{label=7;break};case 3:if((HEAP32[$iflags>>2]&HEAP32[$3+($i<<4)>>2]^HEAP32[$3+($i<<4)+4>>2]|0)!=0){label=4;break}else{label=5;break};case 4:HEAP32[$2>>2]=(HEAP32[$2>>2]|HEAP32[$3+($i<<4)+8>>2])^HEAP32[$3+($i<<4)+12>>2];label=5;break;case 5:label=6;break;case 6:$i=$i+1|0;label=2;break;case 7:return}}function _printArray($Array,$channels,$frames,$filename){$Array=$Array|0;$channels=$channels|0;$frames=$frames|0;$filename=$filename|0;var $k_09=0,$m_08=0,$8=0.0,$10=0,$12=0,label=0,sp=0;sp=STACKTOP;label=1;while(1)switch(label|0){case 1:if(($frames|0)>0){label=2;break}else{label=7;break};case 2:$k_09=0;label=3;break;case 3:if(($channels|0)>0){label=4;break}else{label=6;break};case 4:$m_08=0;label=5;break;case 5:$8=+HEAPF32[$Array+($m_08+(Math_imul($k_09,$channels)|0)<<2)>>2];_printf(31072,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=$8,tempInt)|0)|0;$10=$m_08+1|0;if(($10|0)<($channels|0)){$m_08=$10;label=5;break}else{label=6;break};case 6:_putchar(10)|0;$12=$k_09+1|0;if(($12|0)<($frames|0)){$k_09=$12;label=3;break}else{label=7;break};case 7:STACKTOP=sp;return}}function _createDFT($N,$audioArray,$dftArray){$N=$N|0;$audioArray=$audioArray|0;$dftArray=$dftArray|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$nFrames_028=0,$12=0,$14=0,$nFrames_127=0,$17=0.0,$20=0.0,$26=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$N<<4;$2=_fftw_malloc($1)|0;$3=$2;$4=_fftw_malloc($1)|0;$5=$4;if(($N|0)>0){$nFrames_028=0;label=2;break}else{label=3;break};case 2:HEAPF64[$3+($nFrames_028<<4)>>3]=+HEAPF32[$audioArray+($nFrames_028<<2)>>2];HEAPF64[$3+($nFrames_028<<4)+8>>3]=0.0;$12=$nFrames_028+1|0;if(($12|0)<($N|0)){$nFrames_028=$12;label=2;break}else{label=3;break};case 3:$14=_fftw_plan_dft_1d($N,$3,$5,-1,64)|0;_fftw_execute($14);if(($N|0)>0){$nFrames_127=0;label=4;break}else{label=5;break};case 4:$17=+HEAPF64[$5+($nFrames_127<<4)>>3];$20=+HEAPF64[$5+($nFrames_127<<4)+8>>3];HEAPF32[$dftArray+($nFrames_127<<2)>>2]=+Math_sqrt(+($17*$17+$20*$20));$26=$nFrames_127+1|0;if(($26|0)<($N|0)){$nFrames_127=$26;label=4;break}else{label=5;break};case 5:_fftw_destroy_plan($14);_fftw_free($2);_fftw_free($4);return}}function _print_usage($progname){$progname=$progname|0;var sp=0;sp=STACKTOP;_printf(21168|0,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$progname,tempInt)|0)|0;_puts(20080|0)|0;STACKTOP=sp;return}function _fftw_mkapiplan($sign,$flags,$prb){$sign=$sign|0;$flags=$flags|0;$prb=$prb|0;var $2=0,$3=0,$p=0,$pln=0,$flags_used_for_planning=0,$plnr=0,$pats=0,$pat=0,$pat_max=0,$pcost=0.0,$4=0,$pln1=0,$tmpflags=0,$6=0,$32=0,$34=0,$43=0,$48=0,$49=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$pats=sp|0;$4=sp+16|0;$2=$flags;$3=$prb;$p=0;$plnr=_fftw_the_planner()|0;$6=$pats;HEAP32[$6>>2]=HEAP32[1540];HEAP32[$6+4>>2]=HEAP32[1541];HEAP32[$6+8>>2]=HEAP32[1542];HEAP32[$6+12>>2]=HEAP32[1543];$pcost=0.0;if(($2&2097152|0)!=0){label=2;break}else{label=3;break};case 2:$flags_used_for_planning=$2;$pln=_mkplan0($plnr,$2,$3,0,1)|0;label=19;break;case 3:if(($2&64|0)!=0){label=4;break}else{label=5;break};case 4:$34=0;label=9;break;case 5:if(($2&8|0)!=0){label=6;break}else{label=7;break};case 6:$32=3;label=8;break;case 7:$32=($2&32|0)!=0?2:1;label=8;break;case 8:$34=$32;label=9;break;case 9:$pat_max=$34;if(+HEAPF64[$plnr+184>>3]>=0.0){label=10;break}else{label=11;break};case 10:$43=0;label=12;break;case 11:$43=$pat_max;label=12;break;case 12:$pat=$43;$2=$2&-105;_fftw_get_crude_time($4);$48=$plnr+172|0;$49=$4;HEAP32[$48>>2]=HEAP32[$49>>2];HEAP32[$48+4>>2]=HEAP32[$49+4>>2];$pln=0;$flags_used_for_planning=0;label=13;break;case 13:if(($pat|0)<=($pat_max|0)){label=14;break}else{label=18;break};case 14:$tmpflags=$2|HEAP32[$pats+($pat<<2)>>2];$pln1=_mkplan($plnr,$tmpflags,$3,0)|0;if(($pln1|0)!=0){label=16;break}else{label=15;break};case 15:label=18;break;case 16:_fftw_plan_destroy_internal($pln);$pln=$pln1;$flags_used_for_planning=$tmpflags;$pcost=+HEAPF64[$pln+40>>3];label=17;break;case 17:$pat=$pat+1|0;label=13;break;case 18:label=19;break;case 19:if(($pln|0)!=0){label=20;break}else{label=21;break};case 20:$p=_fftw_malloc_plain(12)|0;HEAP32[$p+4>>2]=$3;HEAP32[$p+8>>2]=$sign;HEAP32[$p>>2]=_mkplan($plnr,$flags_used_for_planning,$3,1)|0;HEAPF64[(HEAP32[$p>>2]|0)+40>>3]=$pcost;_fftw_plan_awake(HEAP32[$p>>2]|0,3);_fftw_plan_destroy_internal($pln);label=22;break;case 21:_fftw_problem_destroy($3);label=22;break;case 22:FUNCTION_TABLE_vii[HEAP32[(HEAP32[$plnr>>2]|0)+8>>2]&2047]($plnr,0);STACKTOP=sp;return $p|0}return 0}function _mkplan0($plnr,$flags,$prb,$hash_info,$wisdom_state){$plnr=$plnr|0;$flags=$flags|0;$prb=$prb|0;$hash_info=$hash_info|0;$wisdom_state=$wisdom_state|0;var $1=0,$12=0;$1=$plnr;_fftw_mapflags($1,$flags);$12=$1+164|0;HEAP32[$12>>2]=HEAP32[$12>>2]&-7340033|($hash_info&7)<<20;HEAP32[$1+76>>2]=$wisdom_state;return FUNCTION_TABLE_iii[HEAP32[(HEAP32[$1>>2]|0)+4>>2]&2047]($1,$prb)|0}function _mkplan($plnr,$flags,$prb,$hash_info){$plnr=$plnr|0;$flags=$flags|0;$prb=$prb|0;$hash_info=$hash_info|0;var $1=0,$2=0,$3=0,$4=0,$pln=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$plnr;$2=$flags;$3=$prb;$4=$hash_info;$pln=_mkplan0($1,$2,$3,$4,0)|0;if((HEAP32[$1+76>>2]|0)==0){label=2;break}else{label=4;break};case 2:if(($pln|0)!=0){label=4;break}else{label=3;break};case 3:$pln=_mkplan0($1,_force_estimator($2)|0,$3,$4,3)|0;label=4;break;case 4:if((HEAP32[$1+76>>2]|0)==2){label=5;break}else{label=8;break};case 5:FUNCTION_TABLE_vii[HEAP32[(HEAP32[$1>>2]|0)+8>>2]&2047]($1,1);$pln=_mkplan0($1,$2,$3,$4,0)|0;if((HEAP32[$1+76>>2]|0)==2){label=6;break}else{label=7;break};case 6:FUNCTION_TABLE_vii[HEAP32[(HEAP32[$1>>2]|0)+8>>2]&2047]($1,1);$pln=_mkplan0($1,_force_estimator($2)|0,$3,$4,4)|0;label=7;break;case 7:label=8;break;case 8:return $pln|0}return 0}function _fftw_destroy_plan($p){$p=$p|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;if(($1|0)!=0){label=2;break}else{label=3;break};case 2:_fftw_plan_awake(HEAP32[$1>>2]|0,0);_fftw_plan_destroy_internal(HEAP32[$1>>2]|0);_fftw_problem_destroy(HEAP32[$1+4>>2]|0);_fftw_ifree($1);label=3;break;case 3:return}}function _fftw_execute($p){$p=$p|0;var $1=0,$pln=0;$1=$p;$pln=HEAP32[$1>>2]|0;FUNCTION_TABLE_vii[HEAP32[HEAP32[$pln>>2]>>2]&2047]($pln,HEAP32[$1+4>>2]|0);return}function _fftw_malloc($n){$n=$n|0;return _fftw_kernel_malloc($n)|0}function _fftw_free($p){$p=$p|0;_fftw_kernel_free($p);return}function _fftw_mapflags($plnr,$flags){$plnr=$plnr|0;$flags=$flags|0;var $1=0,$2=0,$l=0,$u=0,$7=0,$20=0,$33=0,$35=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;$2=sp|0;$l=sp+8|0;$u=sp+16|0;$1=$plnr;HEAP32[$2>>2]=$flags;_map_flags($2,$2,6560,7);HEAP32[$u>>2]=0;HEAP32[$l>>2]=0;_map_flags($2,$l,6672,10);_map_flags($2,$u,6176,24);$7=$1+164|0;HEAP32[$7>>2]=HEAP32[$7>>2]&-1048576|HEAP32[$l>>2]&1048575;$20=$1+168|0;HEAP32[$20>>2]=HEAP32[$20>>2]&-1048576|(HEAP32[$u>>2]|HEAP32[$l>>2])&1048575;$33=$1+164|0;$35=((_timelimit_to_flags(+HEAPF64[$1+184>>3])|0)&511)<<23;HEAP32[$33>>2]=HEAP32[$33>>2]&8388607|$35;STACKTOP=sp;return}function _timelimit_to_flags($timelimit){$timelimit=+$timelimit;var $1=0,$2=0.0,$x=0,$16=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=$timelimit;if($2<0.0){label=3;break}else{label=2;break};case 2:if($2>=31536.0e3){label=3;break}else{label=4;break};case 3:$1=0;label=11;break;case 4:if($2<=1.0e-10){label=5;break}else{label=6;break};case 5:$1=511;label=11;break;case 6:$16=+Math_log(+(31536.0e3/$2));$x=~~($16/+Math_log(1.05)+.5);if(($x|0)<0){label=7;break}else{label=8;break};case 7:$x=0;label=8;break;case 8:if(($x|0)>=512){label=9;break}else{label=10;break};case 9:$x=511;label=10;break;case 10:$1=$x;label=11;break;case 11:return $1|0}return 0}function _fftw_plan_dft_1d($n,$in,$out,$sign,$flags){$n=$n|0;$in=$in|0;$out=$out|0;$sign=$sign|0;$flags=$flags|0;var $1=0,$10=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;$1=sp|0;HEAP32[$1>>2]=$n;$10=_fftw_plan_dft(1,$1,$in,$out,$sign,$flags)|0;STACKTOP=sp;return $10|0}function _fftw_plan_dft($rank,$n,$in,$out,$sign,$flags){$rank=$rank|0;$n=$n|0;$in=$in|0;$out=$out|0;$sign=$sign|0;$flags=$flags|0;return _fftw_plan_many_dft($rank,$n,1,$in,0,1,1,$out,0,1,1,$sign,$flags)|0}function _fftw_plan_many_dft($rank,$n,$howmany,$in,$inembed,$istride,$idist,$out,$onembed,$ostride,$odist,$sign,$flags){$rank=$rank|0;$n=$n|0;$howmany=$howmany|0;$in=$in|0;$inembed=$inembed|0;$istride=$istride|0;$idist=$idist|0;$out=$out|0;$onembed=$onembed|0;$ostride=$ostride|0;$odist=$odist|0;$sign=$sign|0;$flags=$flags|0;var $1=0,$2=0,$3=0,$4=0,$6=0,$10=0,$13=0,$ri=0,$ii=0,$ro=0,$io=0,$41=0,$49=0,$54=0,$60=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+32|0;label=1;while(1)switch(label|0){case 1:$ri=sp|0;$ii=sp+8|0;$ro=sp+16|0;$io=sp+24|0;$2=$rank;$3=$n;$4=$howmany;$6=$inembed;$10=$onembed;$13=$sign;if((_fftw_many_kosherp($2,$3,$4)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=10;break;case 3:_fftw_extract_reim($13,$in|0,$ri,$ii);_fftw_extract_reim($13,$out|0,$ro,$io);if(($6|0)!=0){label=4;break}else{label=5;break};case 4:$41=$6;label=6;break;case 5:$41=$3;label=6;break;case 6:if(($10|0)!=0){label=7;break}else{label=8;break};case 7:$49=$10;label=9;break;case 8:$49=$3;label=9;break;case 9:$54=_fftw_mktensor_rowmajor($2,$3,$41,$49,$istride<<1,$ostride<<1)|0;$60=_fftw_mktensor_1d($4,$idist<<1,$odist<<1)|0;$1=_fftw_mkapiplan($13,$flags,_fftw_mkproblem_dft_d($54,$60,HEAP32[$ri>>2]|0,HEAP32[$ii>>2]|0,HEAP32[$ro>>2]|0,HEAP32[$io>>2]|0)|0)|0;label=10;break;case 10:STACKTOP=sp;return $1|0}return 0}function _fftw_the_planner(){var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[7882]|0)!=0){label=3;break}else{label=2;break};case 2:HEAP32[7882]=_fftw_mkplanner()|0;_fftw_configure_planner(HEAP32[7882]|0);label=3;break;case 3:return HEAP32[7882]|0}return 0}function _fftw_malloc_plain($n){$n=$n|0;var $1=0,$p=0,$12=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;if(($1|0)==0){label=2;break}else{label=3;break};case 2:$1=1;label=3;break;case 3:$p=_fftw_kernel_malloc($1)|0;if(($p|0)!=0){$12=1;label=5;break}else{label=4;break};case 4:_fftw_assertion_failed(27384,269,30368);$12=0;label=5;break;case 5:return $p|0}return 0}function _fftw_ifree($p){$p=$p|0;_fftw_kernel_free($p);return}function _fftw_ifree0($p){$p=$p|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;if(($1|0)!=0){label=2;break}else{label=3;break};case 2:_fftw_ifree($1);label=3;break;case 3:return}}function _main($argc,$argv){$argc=$argc|0;$argv=$argv|0;var $1=0,$2=0,$_=0,$8=0,$9=0,$16=0,$18=0,$20=0,$27=0,$28=0,$40=0,$pch_031=0,$i_030=0,$46=0,$_0=0,label=0,sp=0;sp=STACKTOP;label=1;while(1)switch(label|0){case 1:$1=HEAP32[$argv>>2]|0;$2=_strrchr($1|0,47)|0;$_=($2|0)==0?$1:$2+1|0;if(($argc|0)==2){label=3;break}else{label=2;break};case 2:_print_usage($_);$_0=1;label=14;break;case 3:$8=$argv+4|0;$9=HEAP32[$8>>2]|0;if((HEAP8[$9]|0)==45){label=4;break}else{label=5;break};case 4:_printf(26888,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$9,tempInt)|0)|0;_print_usage($_);$_0=1;label=14;break;case 5:$16=_malloc(245032)|0;$18=_malloc(245032)|0;$20=_fopen(HEAP32[$8>>2]|0,25136)|0;if(($20|0)==0){label=6;break}else{label=7;break};case 6:_fwrite(23984,10,1,HEAP32[_stderr>>2]|0)|0;_exit(1);return 0;case 7:_fseek($20|0,0,2)|0;$27=_ftell($20|0)|0;_rewind($20|0);$28=_malloc($27)|0;if(($28|0)==0){label=8;break}else{label=9;break};case 8:_fwrite(22936,12,1,HEAP32[_stderr>>2]|0)|0;_exit(2);return 0;case 9:if((_fread($28|0,1,$27|0,$20|0)|0)==($27|0)){label=11;break}else{label=10;break};case 10:_fwrite(22008,13,1,HEAP32[_stderr>>2]|0)|0;_exit(3);return 0;case 11:$40=_strtok($28|0,31064)|0;if(($40|0)==0){label=13;break}else{$i_030=0;$pch_031=$40;label=12;break};case 12:HEAPF32[$16+($i_030<<2)>>2]=+_atof($pch_031);$46=_strtok(0,31064)|0;if(($46|0)==0){label=13;break}else{$i_030=$i_030+1|0;$pch_031=$46;label=12;break};case 13:_fclose($20|0)|0;_free($28);_createDFT(61258,$16,$18);_printArray($18,1,61258,0);$_0=0;label=14;break;case 14:STACKTOP=sp;return $_0|0}return 0}function _fftw_plan_null_destroy($ego){$ego=$ego|0;return}function _fftw_extract_reim($sign,$c,$r,$i){$sign=$sign|0;$c=$c|0;$r=$r|0;$i=$i|0;var $2=0,$3=0,$4=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$c;$3=$r;$4=$i;if(($sign|0)==-1){label=2;break}else{label=3;break};case 2:HEAP32[$3>>2]=$2;HEAP32[$4>>2]=$2+8;label=4;break;case 3:HEAP32[$3>>2]=$2+8;HEAP32[$4>>2]=$2;label=4;break;case 4:return}}function _fftw_kernel_malloc($n){$n=$n|0;return _malloc($n)|0}function _fftw_kernel_free($p){$p=$p|0;_free($p);return}function _fftw_mkplan($size,$adt){$size=$size|0;$adt=$adt|0;var $p=0;$p=_fftw_malloc_plain($size)|0;HEAP32[$p>>2]=$adt;_fftw_ops_zero($p+8|0);HEAPF64[$p+40>>3]=0.0;HEAP32[$p+48>>2]=0;HEAP32[$p+52>>2]=0;return $p|0}function _fftw_plan_destroy_internal($ego){$ego=$ego|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;if(($1|0)!=0){label=2;break}else{label=3;break};case 2:FUNCTION_TABLE_vi[HEAP32[(HEAP32[$1>>2]|0)+12>>2]&2047]($1);_fftw_ifree($1);label=3;break;case 3:return}}function _fftw_plan_awake($ego,$wakefulness){$ego=$ego|0;$wakefulness=$wakefulness|0;var $1=0,$2=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$wakefulness;if(($1|0)!=0){label=2;break}else{label=3;break};case 2:FUNCTION_TABLE_vii[HEAP32[(HEAP32[$1>>2]|0)+4>>2]&2047]($1,$2);HEAP32[$1+48>>2]=$2;label=3;break;case 3:return}}function _fftw_iestimate_cost($ego,$pln,$p){$ego=$ego|0;$pln=$pln|0;$p=$p|0;var $1=0,$2=0,$cost=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$pln;$cost=+HEAPF64[$2+8>>3]+ +HEAPF64[$2+16>>3]+ +HEAPF64[$2+24>>3]*2.0+ +HEAPF64[$2+32>>3];if((HEAP32[$1+8>>2]|0)!=0){label=2;break}else{label=3;break};case 2:$cost=+FUNCTION_TABLE_fifi[HEAP32[$1+8>>2]&2047]($p,$cost,1);label=3;break;case 3:return+$cost}return 0.0}function _fftw_mkplanner(){var $i=0,$p=0,$35=0,$42=0,$47=0,$52=0,label=0;label=1;while(1)switch(label|0){case 1:$p=_fftw_malloc_plain(232)|0;HEAP32[$p>>2]=6136;HEAP32[$p+224>>2]=0;HEAP32[$p+200>>2]=0;HEAPF64[$p+216>>3]=0.0;HEAPF64[$p+208>>3]=0.0;HEAP32[$p+4>>2]=0;HEAP32[$p+8>>2]=0;HEAP32[$p+12>>2]=0;HEAP32[$p+16>>2]=0;HEAP32[$p+20>>2]=0;HEAP32[$p+36>>2]=0;HEAP32[$p+76>>2]=0;HEAP32[$p+24>>2]=0;HEAP32[$p+32>>2]=0;HEAP32[$p+28>>2]=0;$35=$p+164|0;HEAP32[$35>>2]=HEAP32[$35>>2]&-1048576;$42=$p+168|0;HEAP32[$42>>2]=HEAP32[$42>>2]&-1048576;$47=$p+164|0;HEAP32[$47>>2]=HEAP32[$47>>2]&8388607;$52=$p+164|0;HEAP32[$52>>2]=HEAP32[$52>>2]&-7340033;HEAP32[$p+160>>2]=1;HEAP32[$p+196>>2]=1;HEAPF64[$p+184>>3]=-1.0;_mkhashtab($p+80|0);_mkhashtab($p+120|0);$i=0;label=2;break;case 2:if(($i|0)<8){label=3;break}else{label=5;break};case 3:HEAP32[$p+44+($i<<2)>>2]=-1;label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:return $p|0}return 0}function _register_solver($ego,$s){$ego=$ego|0;$s=$s|0;var $1=0,$2=0,$n=0,$kind=0,$33=0,$34=0,$64=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$s;if(($2|0)!=0){label=2;break}else{label=5;break};case 2:_fftw_solver_use($2);if((HEAP32[$1+28>>2]|0)>>>0>=(HEAP32[$1+32>>2]|0)>>>0){label=3;break}else{label=4;break};case 3:_sgrow($1);label=4;break;case 4:$n=(HEAP32[$1+24>>2]|0)+((HEAP32[$1+28>>2]|0)*20|0)|0;HEAP32[$n>>2]=$2;HEAP32[$n+4>>2]=HEAP32[$1+36>>2];$33=$1+40|0;$34=HEAP32[$33>>2]|0;HEAP32[$33>>2]=$34+1;HEAP32[$n+12>>2]=$34;HEAP32[$n+8>>2]=_fftw_hash(HEAP32[$n+4>>2]|0)|0;$kind=HEAP32[HEAP32[$2>>2]>>2]|0;HEAP32[$n+16>>2]=HEAP32[$1+44+($kind<<2)>>2];HEAP32[$1+44+($kind<<2)>>2]=HEAP32[$1+28>>2];$64=$1+28|0;HEAP32[$64>>2]=(HEAP32[$64>>2]|0)+1;label=5;break;case 5:return}}function _mkplan49($ego,$p){$ego=$ego|0;$p=$p|0;var $1=0,$2=0,$3=0,$pln=0,$m=0,$slvndx=0,$flags_of_solution=0,$sol=0,$s=0,$owisdom_state=0,$16=0,$32=0,$40=0,$47=0,$54=0,$55=0,$64=0,$105=0,$106=0,$120=0,$164=0,$172=0,$205=0,$206=0,$222=0,$230=0,$253=0,$262=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+104|0;label=1;while(1)switch(label|0){case 1:$m=sp|0;$slvndx=sp+88|0;$flags_of_solution=sp+96|0;$2=$ego;$3=$p;if((HEAP32[$2+168>>2]&2|0)!=0){label=2;break}else{label=3;break};case 2:$16=$2+164|0;HEAP32[$16>>2]=HEAP32[$16>>2]&8388607;label=3;break;case 3:$pln=0;if((HEAP32[$2+20>>2]|0)!=0){label=4;break}else{label=5;break};case 4:$32=FUNCTION_TABLE_iii[HEAP32[$2+20>>2]&2047](HEAP32[$2+76>>2]|0,$3)|0;HEAP32[$2+76>>2]=$32;$40=$32;label=6;break;case 5:$40=HEAP32[$2+76>>2]|0;label=6;break;case 6:if(($40|0)==2){label=7;break}else{label=8;break};case 7:label=53;break;case 8:HEAP32[$2+192>>2]=0;$47=$2+224|0;HEAP32[$47>>2]=(HEAP32[$47>>2]|0)+1;_md5hash($m,$3,$2);$54=$flags_of_solution;$55=$2+164|0;HEAP32[$54>>2]=HEAP32[$55>>2];HEAP32[$54+4>>2]=HEAP32[$55+4>>2];if((HEAP32[$2+76>>2]|0)!=4){label=9;break}else{label=31;break};case 9:$64=_hlookup($2,$m|0,$flags_of_solution)|0;$sol=$64;if(($64|0)!=0){label=10;break}else{label=27;break};case 10:$owisdom_state=HEAP32[$2+76>>2]|0;if((HEAP32[$2+12>>2]|0)!=0){label=11;break}else{label=13;break};case 11:if((FUNCTION_TABLE_iii[HEAP32[$2+12>>2]&2047]($3,$sol+16|0)|0)!=0){label=13;break}else{label=12;break};case 12:label=32;break;case 13:HEAP32[$slvndx>>2]=(HEAP32[$sol+20>>2]|0)>>>20&4095;if((HEAP32[$slvndx>>2]|0)==4095){label=14;break}else{label=17;break};case 14:if((HEAP32[$2+76>>2]|0)==3){label=15;break}else{label=16;break};case 15:label=32;break;case 16:$1=0;label=54;break;case 17:$105=$flags_of_solution;$106=$sol+16|0;HEAP32[$105>>2]=HEAP32[$106>>2];HEAP32[$105+4>>2]=HEAP32[$106+4>>2];$120=$flags_of_solution;HEAP32[$120>>2]=HEAP32[$120>>2]&-7340033|(((HEAP32[$flags_of_solution>>2]|0)>>>20&7|(HEAP32[$2+164>>2]|0)>>>20&1)&7)<<20;HEAP32[$2+76>>2]=1;$s=HEAP32[(HEAP32[$2+24>>2]|0)+((HEAP32[$slvndx>>2]|0)*20|0)>>2]|0;if((HEAP32[HEAP32[$3>>2]>>2]|0)!=(HEAP32[HEAP32[$s>>2]>>2]|0)){label=18;break}else{label=19;break};case 18:label=53;break;case 19:$pln=_invoke_solver($2,$3,$s,$flags_of_solution)|0;if((HEAP32[$2+20>>2]|0)!=0){label=20;break}else{label=21;break};case 20:$164=FUNCTION_TABLE_iii[HEAP32[$2+20>>2]&2047](HEAP32[$2+76>>2]|0,$3)|0;HEAP32[$2+76>>2]=$164;$172=$164;label=22;break;case 21:$172=HEAP32[$2+76>>2]|0;label=22;break;case 22:if(($172|0)==2){label=23;break}else{label=24;break};case 23:label=53;break;case 24:$sol=0;if(($pln|0)!=0){label=26;break}else{label=25;break};case 25:label=53;break;case 26:HEAP32[$2+76>>2]=$owisdom_state;label=46;break;case 27:if((HEAP32[$2+16>>2]|0)!=0){label=28;break}else{label=29;break};case 28:FUNCTION_TABLE_vi[HEAP32[$2+16>>2]&2047]($3);label=29;break;case 29:label=30;break;case 30:label=31;break;case 31:label=32;break;case 32:if((HEAP32[$2+76>>2]|0)==1){label=33;break}else{label=34;break};case 33:label=53;break;case 34:$205=$flags_of_solution;$206=$2+164|0;HEAP32[$205>>2]=HEAP32[$206>>2];HEAP32[$205+4>>2]=HEAP32[$206+4>>2];$pln=_search($2,$3,$slvndx,$flags_of_solution)|0;if((HEAP32[$2+20>>2]|0)!=0){label=35;break}else{label=36;break};case 35:$222=FUNCTION_TABLE_iii[HEAP32[$2+20>>2]&2047](HEAP32[$2+76>>2]|0,$3)|0;HEAP32[$2+76>>2]=$222;$230=$222;label=37;break;case 36:$230=HEAP32[$2+76>>2]|0;label=37;break;case 37:if(($230|0)==2){label=38;break}else{label=39;break};case 38:label=53;break;case 39:if((HEAP32[$2+192>>2]|0)!=0){label=40;break}else{label=44;break};case 40:if(((HEAP32[$2+164>>2]|0)>>>23&511|0)!=0){label=41;break}else{label=42;break};case 41:$253=$flags_of_solution;HEAP32[$253>>2]=HEAP32[$253>>2]&-7340033|(((HEAP32[$flags_of_solution>>2]|0)>>>20&7|1)&7)<<20;label=43;break;case 42:$1=0;label=54;break;case 43:label=45;break;case 44:$262=$flags_of_solution;HEAP32[$262>>2]=HEAP32[$262>>2]&8388607;label=45;break;case 45:label=46;break;case 46:if((HEAP32[$2+76>>2]|0)==0){label=48;break}else{label=47;break};case 47:if((HEAP32[$2+76>>2]|0)==1){label=48;break}else{label=52;break};case 48:if(($pln|0)!=0){label=49;break}else{label=50;break};case 49:_hinsert($2,$m|0,$flags_of_solution,HEAP32[$slvndx>>2]|0);_invoke_hook($2,$pln,$3,1);label=51;break;case 50:_hinsert($2,$m|0,$flags_of_solution,4095);label=51;break;case 51:label=52;break;case 52:$1=$pln;label=54;break;case 53:_fftw_plan_destroy_internal($pln);HEAP32[$2+76>>2]=2;$1=0;label=54;break;case 54:STACKTOP=sp;return $1|0}return 0}function _forget($ego,$a){$ego=$ego|0;$a=$a|0;var $1=0,$3=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$3=$a;if(($3|0)==1){label=2;break}else if(($3|0)==0){label=3;break}else{label=4;break};case 2:_htab_destroy($1+80|0);_mkhashtab($1+80|0);label=3;break;case 3:_htab_destroy($1+120|0);_mkhashtab($1+120|0);label=5;break;case 4:label=5;break;case 5:return}}function _fftw_assertion_failed($s,$line,$file){$s=$s|0;$line=$line|0;$file=$file|0;var sp=0;sp=STACKTOP;_fflush(HEAP32[_stdout>>2]|0)|0;_fprintf(HEAP32[_stderr>>2]|0,25824,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=$file,HEAP32[tempInt+8>>2]=$line,HEAP32[tempInt+16>>2]=$s,tempInt)|0)|0;_abort();STACKTOP=sp;return}function _minsz($nelem){$nelem=$nelem|0;var $1=0;$1=$nelem;return $1+1+(($1>>>0)/8|0)|0}function _addmod($a,$b,$p){$a=$a|0;$b=$b|0;$p=$p|0;var $3=0,$c=0,$17=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$p;$c=$a+$b|0;if($c>>>0>=$3>>>0){label=2;break}else{label=3;break};case 2:$17=$c-$3|0;label=4;break;case 3:$17=$c;label=4;break;case 4:return $17|0}return 0}function _h1($ht,$s){$ht=$ht|0;$s=$s|0;return((HEAP32[$s>>2]|0)>>>0)%((HEAP32[$ht+4>>2]|0)>>>0)|0|0}function _h2($ht,$s){$ht=$ht|0;$s=$s|0;return(((HEAP32[$s+4>>2]|0)>>>0)%(((HEAP32[$ht+4>>2]|0)-1|0)>>>0)|0)+1|0}function _exprt($ego,$p){$ego=$ego|0;$p=$p|0;var $1=0,$2=0,$h=0,$ht=0,$m=0,$l=0,$reg_nam=0,$reg_id=0,$sp=0,$15=0,$18=0,$21=0,$83=0,$90=0,$96=0,$100=0,$104=0,$108=0,$112=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+88|0;label=1;while(1)switch(label|0){case 1:$m=sp|0;$1=$ego;$2=$p;$ht=$1+80|0;_signature_of_configuration($m,$1);$15=HEAP32[$m+4>>2]|0;$18=HEAP32[$m+8>>2]|0;$21=HEAP32[$m+12>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,25928,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=HEAP32[$m>>2],HEAP32[tempInt+8>>2]=$15,HEAP32[tempInt+16>>2]=$18,HEAP32[tempInt+24>>2]=$21,tempInt)|0);$h=0;label=2;break;case 2:if($h>>>0<(HEAP32[$ht+4>>2]|0)>>>0){label=3;break}else{label=10;break};case 3:$l=(HEAP32[$ht>>2]|0)+($h*24|0)|0;if(((HEAP32[$l+16>>2]|0)>>>20&4|0)!=0){label=4;break}else{label=8;break};case 4:if(((HEAP32[$l+20>>2]|0)>>>20&4095|0)==4095){label=5;break}else{label=6;break};case 5:$reg_nam=1560;$reg_id=0;label=7;break;case 6:$sp=(HEAP32[$1+24>>2]|0)+(((HEAP32[$l+20>>2]|0)>>>20&4095)*20|0)|0;$reg_nam=HEAP32[$sp+4>>2]|0;$reg_id=HEAP32[$sp+12>>2]|0;label=7;break;case 7:$83=HEAP32[$l+16>>2]&1048575;$90=HEAP32[$l+20>>2]&1048575;$96=(HEAP32[$l+16>>2]|0)>>>23&511;$100=HEAP32[$l>>2]|0;$104=HEAP32[$l+4>>2]|0;$108=HEAP32[$l+8>>2]|0;$112=HEAP32[$l+12>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,19528,(tempInt=STACKTOP,STACKTOP=STACKTOP+72|0,HEAP32[tempInt>>2]=$reg_nam,HEAP32[tempInt+8>>2]=$reg_id,HEAP32[tempInt+16>>2]=$83,HEAP32[tempInt+24>>2]=$90,HEAP32[tempInt+32>>2]=$96,HEAP32[tempInt+40>>2]=$100,HEAP32[tempInt+48>>2]=$104,HEAP32[tempInt+56>>2]=$108,HEAP32[tempInt+64>>2]=$112,tempInt)|0);label=8;break;case 8:label=9;break;case 9:$h=$h+1|0;label=2;break;case 10:FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,19224,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0);STACKTOP=sp;return}}function _imprt($ego,$sc){$ego=$ego|0;$sc=$sc|0;var $1=0,$2=0,$3=0,$buf=0,$sig=0,$l=0,$u=0,$timelimit_impatience=0,$flags=0,$reg_id=0,$slvndx=0,$ht=0,$old=0,$m=0,$h=0,$hsiz=0,$77=0,$78=0,$132=0,$141=0,$148=0,$154=0,$165=0,$176=0,$186=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+256|0;label=1;while(1)switch(label|0){case 1:$buf=sp|0;$sig=sp+72|0;$l=sp+88|0;$u=sp+96|0;$timelimit_impatience=sp+104|0;$flags=sp+112|0;$reg_id=sp+120|0;$old=sp+128|0;$m=sp+168|0;$2=$ego;$3=$sc;$ht=$2+80|0;if((FUNCTION_TABLE_iiii[HEAP32[$3>>2]&2047]($3,25928,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=$sig,HEAP32[tempInt+8>>2]=$sig+4,HEAP32[tempInt+16>>2]=$sig+8,HEAP32[tempInt+24>>2]=$sig+12,tempInt)|0)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=36;break;case 3:_signature_of_configuration($m,$2);if((HEAP32[$m>>2]|0)!=(HEAP32[$sig>>2]|0)){label=7;break}else{label=4;break};case 4:if((HEAP32[$m+4>>2]|0)!=(HEAP32[$sig+4>>2]|0)){label=7;break}else{label=5;break};case 5:if((HEAP32[$m+8>>2]|0)!=(HEAP32[$sig+8>>2]|0)){label=7;break}else{label=6;break};case 6:if((HEAP32[$m+12>>2]|0)!=(HEAP32[$sig+12>>2]|0)){label=7;break}else{label=8;break};case 7:$1=0;label=36;break;case 8:$hsiz=HEAP32[$ht+4>>2]|0;_memcpy($old|0,$ht|0,40)|0;HEAP32[$old>>2]=_fftw_malloc_plain($hsiz*24|0)|0;$h=0;label=9;break;case 9:if($h>>>0<$hsiz>>>0){label=10;break}else{label=12;break};case 10:$77=(HEAP32[$old>>2]|0)+($h*24|0)|0;$78=(HEAP32[$ht>>2]|0)+($h*24|0)|0;HEAP32[$77>>2]=HEAP32[$78>>2];HEAP32[$77+4>>2]=HEAP32[$78+4>>2];HEAP32[$77+8>>2]=HEAP32[$78+8>>2];HEAP32[$77+12>>2]=HEAP32[$78+12>>2];HEAP32[$77+16>>2]=HEAP32[$78+16>>2];HEAP32[$77+20>>2]=HEAP32[$78+20>>2];label=11;break;case 11:$h=$h+1|0;label=9;break;case 12:label=13;break;case 13:if((FUNCTION_TABLE_iiii[HEAP32[$3>>2]&2047]($3,24672,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0)|0)!=0){label=14;break}else{label=15;break};case 14:label=34;break;case 15:if((FUNCTION_TABLE_iiii[HEAP32[$3>>2]&2047]($3,23456,(tempInt=STACKTOP,STACKTOP=STACKTOP+80|0,HEAP32[tempInt>>2]=64,HEAP32[tempInt+8>>2]=$buf,HEAP32[tempInt+16>>2]=$reg_id,HEAP32[tempInt+24>>2]=$l,HEAP32[tempInt+32>>2]=$u,HEAP32[tempInt+40>>2]=$timelimit_impatience,HEAP32[tempInt+48>>2]=$sig,HEAP32[tempInt+56>>2]=$sig+4,HEAP32[tempInt+64>>2]=$sig+8,HEAP32[tempInt+72>>2]=$sig+12,tempInt)|0)|0)!=0){label=17;break}else{label=16;break};case 16:label=35;break;case 17:if((_strcmp($buf|0,1560)|0)!=0){label=20;break}else{label=18;break};case 18:if((HEAP32[$reg_id>>2]|0)==0){label=19;break}else{label=20;break};case 19:$slvndx=4095;label=25;break;case 20:if((HEAP32[$timelimit_impatience>>2]|0)!=0){label=21;break}else{label=22;break};case 21:label=35;break;case 22:$slvndx=_slookup($2,$buf|0,HEAP32[$reg_id>>2]|0)|0;if(($slvndx|0)==4095){label=23;break}else{label=24;break};case 23:label=35;break;case 24:label=25;break;case 25:$132=$flags;HEAP32[$132>>2]=HEAP32[$132>>2]&-1048576|HEAP32[$l>>2]&1048575;$141=$flags+4|0;HEAP32[$141>>2]=HEAP32[$141>>2]&-1048576|HEAP32[$u>>2]&1048575;$148=$flags;HEAP32[$148>>2]=HEAP32[$148>>2]&8388607|(HEAP32[$timelimit_impatience>>2]&511)<<23;$154=$flags;HEAP32[$154>>2]=HEAP32[$154>>2]&-7340033|1048576;if((HEAP32[$flags>>2]&1048575|0)==(HEAP32[$l>>2]|0)){$165=1;label=27;break}else{label=26;break};case 26:_fftw_assertion_failed(22512,890,29688);$165=0;label=27;break;case 27:if((HEAP32[$flags+4>>2]&1048575|0)==(HEAP32[$u>>2]|0)){$176=1;label=29;break}else{label=28;break};case 28:_fftw_assertion_failed(21600,891,29688);$176=0;label=29;break;case 29:if(((HEAP32[$flags>>2]|0)>>>23&511|0)==(HEAP32[$timelimit_impatience>>2]|0)){$186=1;label=31;break}else{label=30;break};case 30:_fftw_assertion_failed(20664,892,29688);$186=0;label=31;break;case 31:if((_hlookup($2,$sig|0,$flags)|0)!=0){label=33;break}else{label=32;break};case 32:_hinsert($2,$sig|0,$flags,$slvndx);label=33;break;case 33:label=13;break;case 34:_fftw_ifree0(HEAP32[$old>>2]|0);$1=1;label=36;break;case 35:_fftw_ifree0(HEAP32[$ht>>2]|0);_memcpy($ht|0,$old|0,40)|0;$1=0;label=36;break;case 36:STACKTOP=sp;return $1|0}return 0}function _mkhashtab($ht){$ht=$ht|0;var $1=0;$1=$ht;HEAP32[$1+36>>2]=0;HEAP32[$1+20>>2]=0;HEAP32[$1+12>>2]=0;HEAP32[$1+16>>2]=0;HEAP32[$1+32>>2]=0;HEAP32[$1+28>>2]=0;HEAP32[$1+24>>2]=0;HEAP32[$1>>2]=0;HEAP32[$1+8>>2]=0;HEAP32[$1+4>>2]=0;_hgrow($1);return}function _htab_destroy($ht){$ht=$ht|0;var $1=0;$1=$ht;_fftw_ifree(HEAP32[$1>>2]|0);HEAP32[$1>>2]=0;HEAP32[$1+8>>2]=0;return}function _fftw_mkplan_d($ego,$p){$ego=$ego|0;$p=$p|0;var $1=0,$2=0,$pln=0;$1=$ego;$2=$p;$pln=FUNCTION_TABLE_iii[HEAP32[(HEAP32[$1>>2]|0)+4>>2]&2047]($1,$2)|0;_fftw_problem_destroy($2);return $pln|0}function _fftw_mkplan_f_d($ego,$p,$l_set,$u_set,$u_reset){$ego=$ego|0;$p=$p|0;$l_set=$l_set|0;$u_set=$u_set|0;$u_reset=$u_reset|0;var $1=0,$3=0,$5=0,$oflags=0,$pln=0,$8=0,$9=0,$13=0,$23=0,$31=0,$37=0,$44=0,$50=0,$59=0,$69=0,$79=0,$80=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;$oflags=sp|0;$1=$ego;$3=$l_set;$5=$u_reset;$8=$oflags;$9=$1+164|0;HEAP32[$8>>2]=HEAP32[$9>>2];HEAP32[$8+4>>2]=HEAP32[$9+4>>2];$13=$1+164|0;$23=$13+4|0;HEAP32[$23>>2]=HEAP32[$23>>2]&-1048576|HEAP32[$13+4>>2]&1048575&~$5&1048575;$31=$1+164|0;$37=$31;HEAP32[$37>>2]=HEAP32[$37>>2]&-1048576|HEAP32[$31>>2]&1048575&~$5&1048575;$44=$1+164|0;$50=$44;HEAP32[$50>>2]=HEAP32[$50>>2]&-1048576|(HEAP32[$44>>2]&1048575|$3)&1048575;$59=$1+164|0;$69=$59+4|0;HEAP32[$69>>2]=HEAP32[$69>>2]&-1048576|(HEAP32[$59+4>>2]&1048575|($u_set|$3))&1048575;$pln=_fftw_mkplan_d($1,$p)|0;$79=$1+164|0;$80=$oflags;HEAP32[$79>>2]=HEAP32[$80>>2];HEAP32[$79+4>>2]=HEAP32[$80+4>>2];STACKTOP=sp;return $pln|0}function _hgrow($ht){$ht=$ht|0;var $1=0,$nelem=0,$6=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$nelem=HEAP32[$1+8>>2]|0;$6=_minsz($nelem)|0;if($6>>>0>=(HEAP32[$1+4>>2]|0)>>>0){label=2;break}else{label=3;break};case 2:_rehash($1,_nextsz($nelem)|0);label=3;break;case 3:return}}function _rehash($ht,$nsiz){$ht=$ht|0;$nsiz=$nsiz|0;var $1=0,$2=0,$osiz=0,$h=0,$osol=0,$nsol=0,$l=0,$16=0,$28=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$2=$nsiz;$osiz=HEAP32[$1+4>>2]|0;$osol=HEAP32[$1>>2]|0;$2=_fftw_next_prime($2)|0;$nsol=_fftw_malloc_plain($2*24|0)|0;$16=$1+36|0;HEAP32[$16>>2]=(HEAP32[$16>>2]|0)+1;$h=0;label=2;break;case 2:if($h>>>0<$2>>>0){label=3;break}else{label=5;break};case 3:$28=$nsol+($h*24|0)+16|0;HEAP32[$28>>2]=HEAP32[$28>>2]&-7340033;label=4;break;case 4:$h=$h+1|0;label=2;break;case 5:HEAP32[$1+4>>2]=$2;HEAP32[$1>>2]=$nsol;HEAP32[$1+8>>2]=0;$h=0;label=6;break;case 6:if($h>>>0<$osiz>>>0){label=7;break}else{label=11;break};case 7:$l=$osol+($h*24|0)|0;if(((HEAP32[$l+16>>2]|0)>>>20&4|0)!=0){label=8;break}else{label=9;break};case 8:_hinsert0($1,$l|0,$l+16|0,(HEAP32[$l+20>>2]|0)>>>20&4095);label=9;break;case 9:label=10;break;case 10:$h=$h+1|0;label=6;break;case 11:_fftw_ifree0($osol);return}}function _nextsz($nelem){$nelem=$nelem|0;return _minsz(_minsz($nelem)|0)|0}function _hinsert0($ht,$s,$flagsp,$slvndx){$ht=$ht|0;$s=$s|0;$flagsp=$flagsp|0;$slvndx=$slvndx|0;var $1=0,$2=0,$l=0,$g=0,$h=0,$d=0,$12=0,$18=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$2=$s;$h=_h1($1,$2)|0;$d=_h2($1,$2)|0;$12=$1+32|0;HEAP32[$12>>2]=(HEAP32[$12>>2]|0)+1;$g=$h;label=2;break;case 2:$18=$1+28|0;HEAP32[$18>>2]=(HEAP32[$18>>2]|0)+1;$l=(HEAP32[$1>>2]|0)+($g*24|0)|0;if(((HEAP32[$l+16>>2]|0)>>>20&4|0)!=0){label=4;break}else{label=3;break};case 3:label=6;break;case 4:label=5;break;case 5:$g=_addmod($g,$d,HEAP32[$1+4>>2]|0)|0;label=2;break;case 6:_fill_slot($1,$2,$flagsp,$slvndx,$l);return}}function _sigcpy($a,$b){$a=$a|0;$b=$b|0;var $1=0,$2=0;$1=$a;$2=$b;HEAP32[$2>>2]=HEAP32[$1>>2];HEAP32[$2+4>>2]=HEAP32[$1+4>>2];HEAP32[$2+8>>2]=HEAP32[$1+8>>2];HEAP32[$2+12>>2]=HEAP32[$1+12>>2];return}function _md5eq($a,$b){$a=$a|0;$b=$b|0;var $1=0,$2=0,$35=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$a;$2=$b;if((HEAP32[$1>>2]|0)==(HEAP32[$2>>2]|0)){label=2;break}else{$35=0;label=5;break};case 2:if((HEAP32[$1+4>>2]|0)==(HEAP32[$2+4>>2]|0)){label=3;break}else{$35=0;label=5;break};case 3:if((HEAP32[$1+8>>2]|0)==(HEAP32[$2+8>>2]|0)){label=4;break}else{$35=0;label=5;break};case 4:$35=(HEAP32[$1+12>>2]|0)==(HEAP32[$2+12>>2]|0);label=5;break;case 5:return $35&1|0}return 0}function _subsumes($a,$slvndx_a,$b){$a=$a|0;$slvndx_a=$slvndx_a|0;$b=$b|0;var $1=0,$2=0,$4=0,$44=0,$74=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$a;$4=$b;if(($slvndx_a|0)!=4095){label=2;break}else{label=5;break};case 2:if((HEAP32[$2+4>>2]&1048575&(HEAP32[$4+4>>2]&1048575)|0)==(HEAP32[$2+4>>2]&1048575|0)){label=3;break}else{$44=0;label=4;break};case 3:$44=(HEAP32[$4>>2]&1048575&(HEAP32[$2>>2]&1048575)|0)==(HEAP32[$4>>2]&1048575|0);label=4;break;case 4:$1=$44&1;label=8;break;case 5:if((HEAP32[$2>>2]&1048575&(HEAP32[$4>>2]&1048575)|0)==(HEAP32[$2>>2]&1048575|0)){label=6;break}else{$74=0;label=7;break};case 6:$74=((HEAP32[$2>>2]|0)>>>23&511|0)<=((HEAP32[$4>>2]|0)>>>23&511|0);label=7;break;case 7:$1=$74&1;label=8;break;case 8:return $1|0}return 0}function _kill_slot($ht,$slot){$ht=$ht|0;$slot=$slot|0;var $4=0,$9=0;$4=$ht+8|0;HEAP32[$4>>2]=(HEAP32[$4>>2]|0)-1;$9=$slot+16|0;HEAP32[$9>>2]=HEAP32[$9>>2]&-7340033|2097152;return}function _fill_slot($ht,$s,$flagsp,$slvndx,$slot){$ht=$ht|0;$s=$s|0;$flagsp=$flagsp|0;$slvndx=$slvndx|0;$slot=$slot|0;var $1=0,$3=0,$4=0,$5=0,$7=0,$11=0,$25=0,$37=0,$50=0,$57=0,$64=0,$76=0,$94=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$3=$flagsp;$4=$slvndx;$5=$slot;$7=$1+24|0;HEAP32[$7>>2]=(HEAP32[$7>>2]|0)+1;$11=$1+8|0;HEAP32[$11>>2]=(HEAP32[$11>>2]|0)+1;$25=$5+20|0;HEAP32[$25>>2]=HEAP32[$25>>2]&-1048576|HEAP32[$3+4>>2]&1048575&1048575;$37=$5+16|0;HEAP32[$37>>2]=HEAP32[$37>>2]&-1048576|HEAP32[$3>>2]&1048575&1048575;$50=$5+16|0;HEAP32[$50>>2]=HEAP32[$50>>2]&8388607|((HEAP32[$3>>2]|0)>>>23&511&511)<<23;$57=$5+16|0;$64=$57;HEAP32[$64>>2]=HEAP32[$64>>2]&-7340033|(((HEAP32[$57>>2]|0)>>>20&7|6)&7)<<20;$76=$5+20|0;HEAP32[$76>>2]=HEAP32[$76>>2]&1048575|($4&4095)<<20;if(((HEAP32[$5+20>>2]|0)>>>20&4095|0)==($4|0)){$94=1;label=3;break}else{label=2;break};case 2:_fftw_assertion_failed(24256,261,29688);$94=0;label=3;break;case 3:_sigcpy($s,$5|0);return}}function _signature_of_configuration($m,$ego){$m=$m|0;$ego=$ego|0;var $1=0,$2=0,$_cnt=0,$sp=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$m;$2=$ego;_fftw_md5begin($1);_fftw_md5unsigned($1,8);$_cnt=0;label=2;break;case 2:if($_cnt>>>0<(HEAP32[$2+28>>2]|0)>>>0){label=3;break}else{label=5;break};case 3:$sp=(HEAP32[$2+24>>2]|0)+($_cnt*20|0)|0;_fftw_md5int($1,HEAP32[$sp+12>>2]|0);_fftw_md5puts($1,HEAP32[$sp+4>>2]|0);label=4;break;case 4:$_cnt=$_cnt+1|0;label=2;break;case 5:_fftw_md5end($1);return}}function _slookup($ego,$nam,$id){$ego=$ego|0;$nam=$nam|0;$id=$id|0;var $1=0,$2=0,$3=0,$h=0,$_cnt=0,$sp=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego;$3=$nam;$h=_fftw_hash($3)|0;$_cnt=0;label=2;break;case 2:if($_cnt>>>0<(HEAP32[$2+28>>2]|0)>>>0){label=3;break}else{label=9;break};case 3:$sp=(HEAP32[$2+24>>2]|0)+($_cnt*20|0)|0;if((HEAP32[$sp+12>>2]|0)==($id|0)){label=4;break}else{label=7;break};case 4:if((HEAP32[$sp+8>>2]|0)==($h|0)){label=5;break}else{label=7;break};case 5:if((_strcmp(HEAP32[$sp+4>>2]|0,$3|0)|0)!=0){label=7;break}else{label=6;break};case 6:$1=($sp-(HEAP32[$2+24>>2]|0)|0)/20|0;label=10;break;case 7:label=8;break;case 8:$_cnt=$_cnt+1|0;label=2;break;case 9:$1=4095;label=10;break;case 10:return $1|0}return 0}function _hlookup($ego,$s,$flagsp){$ego=$ego|0;$s=$s|0;$flagsp=$flagsp|0;var $1=0,$2=0,$3=0,$sol=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$s;$3=$flagsp;$sol=_htab_lookup($1+80|0,$2,$3)|0;if(($sol|0)!=0){label=3;break}else{label=2;break};case 2:$sol=_htab_lookup($1+120|0,$2,$3)|0;label=3;break;case 3:return $sol|0}return 0}function _hinsert($ego,$s,$flagsp,$slvndx){$ego=$ego|0;$s=$s|0;$flagsp=$flagsp|0;$slvndx=$slvndx|0;var $1=0,$3=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$3=$flagsp;if(((HEAP32[$3>>2]|0)>>>20&1|0)!=0){label=2;break}else{label=3;break};case 2:$19=$1+80|0;label=4;break;case 3:$19=$1+120|0;label=4;break;case 4:_htab_insert($19,$s,$3,$slvndx);return}}function _htab_insert($ht,$s,$flagsp,$slvndx){$ht=$ht|0;$s=$s|0;$flagsp=$flagsp|0;$slvndx=$slvndx|0;var $1=0,$2=0,$3=0,$4=0,$g=0,$h=0,$d=0,$first=0,$l=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$2=$s;$3=$flagsp;$4=$slvndx;$h=_h1($1,$2)|0;$d=_h2($1,$2)|0;$first=0;$g=$h;label=2;break;case 2:$l=(HEAP32[$1>>2]|0)+($g*24|0)|0;$19=$1+28|0;HEAP32[$19>>2]=(HEAP32[$19>>2]|0)+1;if(((HEAP32[$l+16>>2]|0)>>>20&2|0)!=0){label=3;break}else{label=12;break};case 3:if(((HEAP32[$l+16>>2]|0)>>>20&4|0)!=0){label=4;break}else{label=11;break};case 4:if((_md5eq($2,$l|0)|0)!=0){label=5;break}else{label=11;break};case 5:if((_subsumes($3,$4,$l+16|0)|0)!=0){label=6;break}else{label=9;break};case 6:if(($first|0)!=0){label=8;break}else{label=7;break};case 7:$first=$l;label=8;break;case 8:_kill_slot($1,$l);label=10;break;case 9:label=10;break;case 10:label=11;break;case 11:label=13;break;case 12:label=15;break;case 13:$g=_addmod($g,$d,HEAP32[$1+4>>2]|0)|0;label=14;break;case 14:if(($g|0)!=($h|0)){label=2;break}else{label=15;break};case 15:if(($first|0)!=0){label=16;break}else{label=17;break};case 16:_fill_slot($1,$2,$3,$4,$first);label=18;break;case 17:_hgrow($1);_hinsert0($1,$2,$3,$4);label=18;break;case 18:return}}function _htab_lookup($ht,$s,$flagsp){$ht=$ht|0;$s=$s|0;$flagsp=$flagsp|0;var $1=0,$2=0,$g=0,$h=0,$d=0,$best=0,$l=0,$11=0,$22=0,$111=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ht;$2=$s;$h=_h1($1,$2)|0;$d=_h2($1,$2)|0;$best=0;$11=$1+12|0;HEAP32[$11>>2]=(HEAP32[$11>>2]|0)+1;$g=$h;label=2;break;case 2:$l=(HEAP32[$1>>2]|0)+($g*24|0)|0;$22=$1+20|0;HEAP32[$22>>2]=(HEAP32[$22>>2]|0)+1;if(((HEAP32[$l+16>>2]|0)>>>20&2|0)!=0){label=3;break}else{label=11;break};case 3:if(((HEAP32[$l+16>>2]|0)>>>20&4|0)!=0){label=4;break}else{label=10;break};case 4:if((_md5eq($2,$l|0)|0)!=0){label=5;break}else{label=10;break};case 5:if((_subsumes($l+16|0,(HEAP32[$l+20>>2]|0)>>>20&4095,$flagsp)|0)!=0){label=6;break}else{label=10;break};case 6:if(($best|0)!=0){label=7;break}else{label=8;break};case 7:if((HEAP32[$l+20>>2]&1048575&(HEAP32[$best+20>>2]&1048575)|0)==(HEAP32[$l+20>>2]&1048575|0)){label=8;break}else{label=9;break};case 8:$best=$l;label=9;break;case 9:label=10;break;case 10:label=12;break;case 11:label=14;break;case 12:$g=_addmod($g,$d,HEAP32[$1+4>>2]|0)|0;label=13;break;case 13:if(($g|0)!=($h|0)){label=2;break}else{label=14;break};case 14:if(($best|0)!=0){label=15;break}else{label=16;break};case 15:$111=$1+16|0;HEAP32[$111>>2]=(HEAP32[$111>>2]|0)+1;label=16;break;case 16:return $best|0}return 0}function _md5hash($m,$p,$plnr){$m=$m|0;$p=$p|0;$plnr=$plnr|0;var $1=0,$2=0;$1=$m;$2=$p;_fftw_md5begin($1);_fftw_md5unsigned($1,8);_fftw_md5int($1,HEAP32[$plnr+160>>2]|0);FUNCTION_TABLE_vii[HEAP32[(HEAP32[$2>>2]|0)+4>>2]&2047]($2,$1);_fftw_md5end($1);return}function _invoke_solver($ego,$p,$s,$nflags){$ego=$ego|0;$p=$p|0;$s=$s|0;$nflags=$nflags|0;var $1=0,$3=0,$flags=0,$nthr=0,$pln=0,$7=0,$8=0,$15=0,$16=0,$19=0,$36=0,$37=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;$flags=sp|0;$1=$ego;$3=$s;$7=$flags;$8=$1+164|0;HEAP32[$7>>2]=HEAP32[$8>>2];HEAP32[$7+4>>2]=HEAP32[$8+4>>2];$nthr=HEAP32[$1+160>>2]|0;$15=$1+164|0;$16=$nflags;HEAP32[$15>>2]=HEAP32[$16>>2];HEAP32[$15+4>>2]=HEAP32[$16+4>>2];$19=$1+164|0;HEAP32[$19>>2]=HEAP32[$19>>2]&8388607;$pln=FUNCTION_TABLE_iiii[HEAP32[(HEAP32[$3>>2]|0)+4>>2]&2047]($3,$p,$1)|0;HEAP32[$1+160>>2]=$nthr;$36=$1+164|0;$37=$flags;HEAP32[$36>>2]=HEAP32[$37>>2];HEAP32[$36+4>>2]=HEAP32[$37+4>>2];STACKTOP=sp;return $pln|0}function _search($ego,$p,$slvndx,$flagsp){$ego=$ego|0;$p=$p|0;$slvndx=$slvndx|0;$flagsp=$flagsp|0;var $1=0,$2=0,$3=0,$4=0,$pln=0,$i=0,$l_orig=0,$x=0,$last_x=0,$47=0,$77=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$p;$3=$slvndx;$4=$flagsp;$pln=0;$l_orig=HEAP32[$4>>2]&1048575;$x=HEAP32[$4+4>>2]&1048575;$last_x=~$x;$i=0;label=2;break;case 2:if($i>>>0<5){label=3;break}else{label=11;break};case 3:if(($l_orig&($x&~HEAP32[1824+($i<<2)>>2])|0)==($l_orig|0)){label=4;break}else{label=5;break};case 4:$x=$x&~HEAP32[1824+($i<<2)>>2];label=5;break;case 5:if(($x|0)!=($last_x|0)){label=6;break}else{label=9;break};case 6:$last_x=$x;$47=$4;HEAP32[$47>>2]=HEAP32[$47>>2]&-1048576|$x&1048575;$pln=_search0($1,$2,$3,$4)|0;if(($pln|0)!=0){label=7;break}else{label=8;break};case 7:label=11;break;case 8:label=9;break;case 9:label=10;break;case 10:$i=$i+1|0;label=2;break;case 11:if(($pln|0)!=0){label=15;break}else{label=12;break};case 12:if(($l_orig|0)!=($last_x|0)){label=13;break}else{label=14;break};case 13:$last_x=$l_orig;$77=$4;HEAP32[$77>>2]=HEAP32[$77>>2]&-1048576|$l_orig&1048575;$pln=_search0($1,$2,$3,$4)|0;label=14;break;case 14:label=15;break;case 15:return $pln|0}return 0}function _invoke_hook($ego,$pln,$p,$optimalp){$ego=$ego|0;$pln=$pln|0;$p=$p|0;$optimalp=$optimalp|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;if((HEAP32[$1+4>>2]|0)!=0){label=2;break}else{label=3;break};case 2:FUNCTION_TABLE_viiii[HEAP32[$1+4>>2]&2047]($1,$pln,$p,$optimalp);label=3;break;case 3:return}}function _search0($ego,$p,$slvndx,$flagsp){$ego=$ego|0;$p=$p|0;$slvndx=$slvndx|0;$flagsp=$flagsp|0;var $1=0,$2=0,$3=0,$4=0,$best=0,$best_not_yet_timed=0,$_cnt=0,$sp=0,$pln=0,$could_prune_now_p=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego;$3=$p;$4=$slvndx;$best=0;$best_not_yet_timed=1;if((_timeout_p($2,$3)|0)!=0){label=2;break}else{label=3;break};case 2:$1=0;label=24;break;case 3:$_cnt=HEAP32[$2+44+(HEAP32[HEAP32[$3>>2]>>2]<<2)>>2]|0;label=4;break;case 4:if(($_cnt|0)>=0){label=5;break}else{label=23;break};case 5:$sp=(HEAP32[$2+24>>2]|0)+($_cnt*20|0)|0;$pln=_invoke_solver($2,$3,HEAP32[$sp>>2]|0,$flagsp)|0;if((HEAP32[$2+196>>2]|0)!=0){label=6;break}else{label=9;break};case 6:if((_timeout_p($2,$3)|0)!=0){label=7;break}else{label=8;break};case 7:_fftw_plan_destroy_internal($pln);_fftw_plan_destroy_internal($best);$1=0;label=24;break;case 8:label=9;break;case 9:if(($pln|0)!=0){label=10;break}else{label=22;break};case 10:$could_prune_now_p=HEAP32[$pln+52>>2]|0;if(($best|0)!=0){label=11;break}else{label=17;break};case 11:if(($best_not_yet_timed|0)!=0){label=12;break}else{label=13;break};case 12:_evaluate_plan($2,$best,$3);$best_not_yet_timed=0;label=13;break;case 13:_evaluate_plan($2,$pln,$3);if(+HEAPF64[$pln+40>>3]<+HEAPF64[$best+40>>3]){label=14;break}else{label=15;break};case 14:_fftw_plan_destroy_internal($best);$best=$pln;HEAP32[$4>>2]=($sp-(HEAP32[$2+24>>2]|0)|0)/20|0;label=16;break;case 15:_fftw_plan_destroy_internal($pln);label=16;break;case 16:label=18;break;case 17:$best=$pln;HEAP32[$4>>2]=($sp-(HEAP32[$2+24>>2]|0)|0)/20|0;label=18;break;case 18:if((HEAP32[$2+168>>2]&131072|0)!=0){label=19;break}else{label=21;break};case 19:if(($could_prune_now_p|0)!=0){label=20;break}else{label=21;break};case 20:label=23;break;case 21:label=22;break;case 22:$_cnt=HEAP32[$sp+16>>2]|0;label=4;break;case 23:$1=$best;label=24;break;case 24:return $1|0}return 0}function _timeout_p($ego,$p){$ego=$ego|0;$p=$p|0;var $1=0,$2=0,$29=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego;if((HEAP32[$2+168>>2]&2|0)!=0){label=8;break}else{label=2;break};case 2:if((HEAP32[$2+192>>2]|0)!=0){label=3;break}else{label=4;break};case 3:$1=1;label=9;break;case 4:if(+HEAPF64[$2+184>>3]>=0.0){label=5;break}else{label=7;break};case 5:$29=+_fftw_elapsed_since($2,$p,$2+172|0);if($29>=+HEAPF64[$2+184>>3]){label=6;break}else{label=7;break};case 6:HEAP32[$2+192>>2]=1;HEAP32[$2+196>>2]=1;$1=1;label=9;break;case 7:label=8;break;case 8:HEAP32[$2+196>>2]=0;$1=0;label=9;break;case 9:return $1|0}return 0}function _evaluate_plan($ego,$pln,$p){$ego=$ego|0;$pln=$pln|0;$p=$p|0;var $1=0,$2=0,$3=0,$t=0.0,$30=0,$54=0,$71=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$pln;$3=$p;if((HEAP32[$1+168>>2]&2|0)!=0){label=4;break}else{label=2;break};case 2:if((HEAP32[$1+168>>2]&1|0)!=0){label=3;break}else{label=4;break};case 3:if(+HEAPF64[$2+40>>3]==0.0){label=4;break}else{label=11;break};case 4:$30=$1+200|0;HEAP32[$30>>2]=(HEAP32[$30>>2]|0)+1;if((HEAP32[$1+168>>2]&2|0)!=0){label=5;break}else{label=7;break};case 5:label=6;break;case 6:HEAPF64[$2+40>>3]=+_fftw_iestimate_cost($1,$2,$3);$54=$1+216|0;HEAPF64[$54>>3]=+HEAPF64[$54>>3]+ +HEAPF64[$2+40>>3];label=10;break;case 7:$t=+_fftw_measure_execution_time($1,$2,$3);if($t<0.0){label=8;break}else{label=9;break};case 8:label=6;break;case 9:HEAPF64[$2+40>>3]=$t;$71=$1+208|0;HEAPF64[$71>>3]=+HEAPF64[$71>>3]+$t;HEAP32[$1+196>>2]=1;label=10;break;case 10:label=11;break;case 11:_invoke_hook($1,$2,$3,0);return}}function _sgrow($ego){$ego=$ego|0;var $1=0,$osiz=0,$nsiz=0,$ntab=0,$otab=0,$i=0,$34=0,$35=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$osiz=HEAP32[$1+32>>2]|0;$nsiz=$osiz+1+(($osiz>>>0)/4|0)|0;$ntab=_fftw_malloc_plain($nsiz*20|0)|0;$otab=HEAP32[$1+24>>2]|0;HEAP32[$1+24>>2]=$ntab;HEAP32[$1+32>>2]=$nsiz;$i=0;label=2;break;case 2:if($i>>>0<$osiz>>>0){label=3;break}else{label=5;break};case 3:$34=$ntab+($i*20|0)|0;$35=$otab+($i*20|0)|0;HEAP32[$34>>2]=HEAP32[$35>>2];HEAP32[$34+4>>2]=HEAP32[$35+4>>2];HEAP32[$34+8>>2]=HEAP32[$35+8>>2];HEAP32[$34+12>>2]=HEAP32[$35+12>>2];HEAP32[$34+16>>2]=HEAP32[$35+16>>2];label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:_fftw_ifree0($otab);return}}function _fftw_safe_mulmod($x,$y,$p){$x=$x|0;$y=$y|0;$p=$p|0;var $1=0,$2=0,$3=0,$4=0,$r=0,$43=0,$62=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$x;$3=$y;$4=$p;if(($3|0)>($2|0)){label=2;break}else{label=3;break};case 2:$1=_fftw_safe_mulmod($3,$2,$4)|0;label=13;break;case 3:$r=0;label=4;break;case 4:if(($3|0)!=0){label=5;break}else{label=12;break};case 5:if(($r|0)>=($4-(Math_imul($2,$3&1)|0)|0)){label=6;break}else{label=7;break};case 6:$43=$r+((Math_imul($2,$3&1)|0)-$4)|0;label=8;break;case 7:$43=$r+(Math_imul($2,$3&1)|0)|0;label=8;break;case 8:$r=$43;$3=$3>>1;if(($2|0)>=($4-$2|0)){label=9;break}else{label=10;break};case 9:$62=$2+($2-$4)|0;label=11;break;case 10:$62=$2+$2|0;label=11;break;case 11:$2=$62;label=4;break;case 12:$1=$r;label=13;break;case 13:return $1|0}return 0}function _fftw_power_mod($n,$m,$p){$n=$n|0;$m=$m|0;$p=$p|0;var $1=0,$2=0,$3=0,$4=0,$x=0,$34=0,$64=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$n;$3=$m;$4=$p;if(($3|0)==0){label=2;break}else{label=3;break};case 2:$1=1;label=12;break;case 3:if((($3|0)%2|0|0)==0){label=4;break}else{label=8;break};case 4:$x=_fftw_power_mod($2,($3|0)/2|0,$4)|0;if(($x|0)<=(92681-$x|0)){label=5;break}else{label=6;break};case 5:$34=(Math_imul($x,$x)|0)%($4|0)|0;label=7;break;case 6:$34=_fftw_safe_mulmod($x,$x,$4)|0;label=7;break;case 7:$1=$34;label=12;break;case 8:if(($2|0)<=(92681-(_fftw_power_mod($2,$3-1|0,$4)|0)|0)){label=9;break}else{label=10;break};case 9:$64=(Math_imul($2,_fftw_power_mod($2,$3-1|0,$4)|0)|0)%($4|0)|0;label=11;break;case 10:$64=_fftw_safe_mulmod($2,_fftw_power_mod($2,$3-1|0,$4)|0,$4)|0;label=11;break;case 11:$1=$64;label=12;break;case 12:return $1|0}return 0}function _fftw_find_generator($p){$p=$p|0;var $1=0,$2=0,$n=0,$i=0,$primef=0,$pm1=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+64|0;label=1;while(1)switch(label|0){case 1:$primef=sp|0;$2=$p;$pm1=$2-1|0;if(($2|0)==2){label=2;break}else{label=3;break};case 2:$1=1;label=10;break;case 3:$n=2;$i=0;label=4;break;case 4:if(($i|0)<(_get_prime_factors($pm1,$primef|0)|0)){label=5;break}else{label=9;break};case 5:if((_fftw_power_mod($n,($pm1|0)/(HEAP32[$primef+($i<<2)>>2]|0)|0,$2)|0)==1){label=6;break}else{label=7;break};case 6:$i=-1;$n=$n+1|0;label=7;break;case 7:label=8;break;case 8:$i=$i+1|0;label=4;break;case 9:$1=$n;label=10;break;case 10:STACKTOP=sp;return $1|0}return 0}function _fftw_mkproblem_unsolvable(){return 1552}function _unsolvable_zero($ego){$ego=$ego|0;return}function _unsolvable_destroy($ego){$ego=$ego|0;return}function _fftw_first_divisor($n){$n=$n|0;var $1=0,$2=0,$i=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$n;if(($2|0)<=1){label=2;break}else{label=3;break};case 2:$1=$2;label=12;break;case 3:if((($2|0)%2|0|0)==0){label=4;break}else{label=5;break};case 4:$1=2;label=12;break;case 5:$i=3;label=6;break;case 6:if((Math_imul($i,$i)|0)<=($2|0)){label=7;break}else{label=11;break};case 7:if((($2|0)%($i|0)|0|0)==0){label=8;break}else{label=9;break};case 8:$1=$i;label=12;break;case 9:label=10;break;case 10:$i=$i+2|0;label=6;break;case 11:$1=$2;label=12;break;case 12:return $1|0}return 0}function _fftw_isqrt($n){$n=$n|0;var $1=0,$2=0,$guess=0,$iguess=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$n;if(($2|0)==0){label=2;break}else{label=3;break};case 2:$1=0;label=7;break;case 3:$guess=$2;$iguess=1;label=4;break;case 4:$guess=($guess+$iguess|0)/2|0;$iguess=($2|0)/($guess|0)|0;label=5;break;case 5:if(($guess|0)>($iguess|0)){label=4;break}else{label=6;break};case 6:$1=$guess;label=7;break;case 7:return $1|0}return 0}function _fftw_modulo($a,$n){$a=$a|0;$n=$n|0;var $1=0,$2=0,$3=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$a;$3=$n;if(($2|0)>=0){label=2;break}else{label=3;break};case 2:$1=($2|0)%($3|0)|0;label=4;break;case 3:$1=$3-1-((-($2+1|0)|0)%($3|0)|0)|0;label=4;break;case 4:return $1|0}return 0}function _get_prime_factors($n,$primef){$n=$n|0;$primef=$primef|0;var $1=0,$2=0,$3=0,$i=0,$size=0,$4=0,$34=0,$60=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$n;$3=$primef;$size=0;$4=$size;$size=$4+1|0;HEAP32[$3+($4<<2)>>2]=2;label=2;break;case 2:$2=$2>>1;label=3;break;case 3:if(($2&1|0)==0){label=2;break}else{label=4;break};case 4:if(($2|0)==1){label=5;break}else{label=6;break};case 5:$1=$size;label=18;break;case 6:$i=3;label=7;break;case 7:if((Math_imul($i,$i)|0)<=($2|0)){label=8;break}else{label=15;break};case 8:if((($2|0)%($i|0)|0|0)!=0){label=13;break}else{label=9;break};case 9:$34=$size;$size=$34+1|0;HEAP32[$3+($34<<2)>>2]=$i;label=10;break;case 10:$2=($2|0)/($i|0)|0;label=11;break;case 11:if((($2|0)%($i|0)|0|0)!=0^1){label=10;break}else{label=12;break};case 12:label=13;break;case 13:label=14;break;case 14:$i=$i+2|0;label=7;break;case 15:if(($2|0)==1){label=16;break}else{label=17;break};case 16:$1=$size;label=18;break;case 17:$60=$size;$size=$60+1|0;HEAP32[$3+($60<<2)>>2]=$2;$1=$size;label=18;break;case 18:return $1|0}return 0}function _fftw_factors_into($n,$primes){$n=$n|0;$primes=$primes|0;var $1=0,$2=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;$2=$primes;label=2;break;case 2:if((HEAP32[$2>>2]|0)!=0){label=3;break}else{label=8;break};case 3:label=4;break;case 4:if((($1|0)%(HEAP32[$2>>2]|0)|0|0)==0){label=5;break}else{label=6;break};case 5:$1=($1|0)/(HEAP32[$2>>2]|0)|0;label=4;break;case 6:label=7;break;case 7:$2=$2+4|0;label=2;break;case 8:return($1|0)==1|0}return 0}function _fftw_solver_use($ego){$ego=$ego|0;var $3=0;$3=$ego+4|0;HEAP32[$3>>2]=(HEAP32[$3>>2]|0)+1;return}function _fftw_is_prime($n){$n=$n|0;var $1=0,$10=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;if(($1|0)>1){label=2;break}else{$10=0;label=3;break};case 2:$10=(_fftw_first_divisor($1)|0)==($1|0);label=3;break;case 3:return $10&1|0}return 0}function _fftw_next_prime($n){$n=$n|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;label=2;break;case 2:if((_fftw_is_prime($1)|0)!=0^1){label=3;break}else{label=4;break};case 3:$1=$1+1|0;label=2;break;case 4:return $1|0}return 0}function _fftw_choose_radix($r,$n){$r=$r|0;$n=$n|0;var $1=0,$2=0,$3=0,$38=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$r;$3=$n;if(($2|0)>0){label=2;break}else{label=5;break};case 2:if((($3|0)%($2|0)|0|0)==0){label=3;break}else{label=4;break};case 3:$1=$2;label=12;break;case 4:$1=0;label=12;break;case 5:if(($2|0)==0){label=6;break}else{label=7;break};case 6:$1=_fftw_first_divisor($3)|0;label=12;break;case 7:$2=-$2|0;if(($3|0)>($2|0)){label=8;break}else{label=10;break};case 8:if((($3|0)%($2|0)|0|0)==0){label=9;break}else{label=10;break};case 9:$38=_isqrt_maybe(($3|0)/($2|0)|0)|0;label=11;break;case 10:$38=0;label=11;break;case 11:$1=$38;label=12;break;case 12:return $1|0}return 0}function _isqrt_maybe($n){$n=$n|0;var $1=0,$guess=0,$13=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;$guess=_fftw_isqrt($1)|0;if((Math_imul($guess,$guess)|0)==($1|0)){label=2;break}else{label=3;break};case 2:$13=$guess;label=4;break;case 3:$13=0;label=4;break;case 4:return $13|0}return 0}function _fftw_factors_into_small_primes($n){$n=$n|0;return _fftw_factors_into($n,6832)|0}function _fftw_mkproblem($sz,$adt){$sz=$sz|0;$adt=$adt|0;var $p=0;$p=_fftw_malloc_plain($sz)|0;HEAP32[$p>>2]=$adt;return $p|0}function _fftw_problem_destroy($ego){$ego=$ego|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;if(($1|0)!=0){label=2;break}else{label=3;break};case 2:FUNCTION_TABLE_vi[HEAP32[(HEAP32[$1>>2]|0)+16>>2]&2047]($1);label=3;break;case 3:return}}function _unsolvable_hash($p,$m){$p=$p|0;$m=$m|0;_fftw_md5puts($m,28952);return}function _unsolvable_print($ego,$p){$ego=$ego|0;$p=$p|0;var $2=0,sp=0;sp=STACKTOP;$2=$p;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,22608,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0);STACKTOP=sp;return}function _fftw_mksolver($size,$adt){$size=$size|0;$adt=$adt|0;var $s=0;$s=_fftw_malloc_plain($size)|0;HEAP32[$s>>2]=$adt;HEAP32[$s+4>>2]=0;return $s|0}function _fftw_solver_register($plnr,$s){$plnr=$plnr|0;$s=$s|0;var $1=0;$1=$plnr;FUNCTION_TABLE_vii[HEAP32[HEAP32[$1>>2]>>2]&2047]($1,$s);return}function _fftw_mktensor_0d(){return _fftw_mktensor(0)|0}function _fftw_mktensor_1d($n,$is,$os){$n=$n|0;$is=$is|0;$os=$os|0;var $x=0;$x=_fftw_mktensor(1)|0;HEAP32[$x+4>>2]=$n;HEAP32[$x+8>>2]=$is;HEAP32[$x+12>>2]=$os;return $x|0}function _fftw_get_crude_time($agg_result){$agg_result=$agg_result|0;var $tv=0,$2=0,$3=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;$tv=sp|0;_gettimeofday($tv|0,0)|0;$2=$agg_result;$3=$tv;HEAP32[$2>>2]=HEAP32[$3>>2];HEAP32[$2+4>>2]=HEAP32[$3+4>>2];STACKTOP=sp;return}function _fftw_elapsed_since($plnr,$p,$t0){$plnr=$plnr|0;$p=$p|0;$t0=$t0|0;var $1=0,$t=0.0,label=0,tempParam=0,sp=0;sp=STACKTOP;tempParam=$t0;$t0=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$t0>>2]=HEAP32[tempParam>>2];HEAP32[$t0+4>>2]=HEAP32[tempParam+4>>2];label=1;while(1)switch(label|0){case 1:$1=$plnr;$t=+_elapsed_since($t0);if((HEAP32[$1+8>>2]|0)!=0){label=2;break}else{label=3;break};case 2:$t=+FUNCTION_TABLE_fifi[HEAP32[$1+8>>2]&2047]($p,$t,1);label=3;break;case 3:STACKTOP=sp;return+$t}return 0.0}function _elapsed_since($t0){$t0=$t0|0;var $t1=0,tempParam=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;tempParam=$t0;$t0=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[$t0>>2]=HEAP32[tempParam>>2];HEAP32[$t0+4>>2]=HEAP32[tempParam+4>>2];$t1=sp|0;_gettimeofday($t1|0,0)|0;STACKTOP=sp;return+(+((HEAP32[$t1>>2]|0)-(HEAP32[$t0>>2]|0)|0)+ +((HEAP32[$t1+4>>2]|0)-(HEAP32[$t0+4>>2]|0)|0)*1.0e-6)}function _fftw_measure_execution_time($plnr,$pln,$p){$plnr=$plnr|0;$pln=$pln|0;$p=$p|0;var $1=0,$2=0,$3=0,$iter=0,$repeat=0,$tmin=0.0,$first=0,$begin=0,$t=0.0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$begin=sp|0;$1=$plnr;$2=$pln;$3=$p;_fftw_plan_awake($2,1);FUNCTION_TABLE_vi[HEAP32[(HEAP32[$3>>2]|0)+8>>2]&2047]($3);label=2;break;case 2:$iter=1;label=3;break;case 3:if(($iter|0)!=0){label=4;break}else{label=21;break};case 4:$tmin=0.0;$first=1;_fftw_get_crude_time($begin);$repeat=0;label=5;break;case 5:if(($repeat|0)<4){label=6;break}else{label=17;break};case 6:$t=+_measure($2,$3,$iter);if((HEAP32[$1+8>>2]|0)!=0){label=7;break}else{label=8;break};case 7:$t=+FUNCTION_TABLE_fifi[HEAP32[$1+8>>2]&2047]($3,$t,1);label=8;break;case 8:if($t<0.0){label=9;break}else{label=10;break};case 9:label=2;break;case 10:if(($first|0)!=0){label=12;break}else{label=11;break};case 11:if($t<$tmin){label=12;break}else{label=13;break};case 12:$tmin=$t;label=13;break;case 13:$first=0;if(+_fftw_elapsed_since($1,$3,$begin)>2.0){label=14;break}else{label=15;break};case 14:label=17;break;case 15:label=16;break;case 16:$repeat=$repeat+1|0;label=5;break;case 17:if($tmin>=.001){label=18;break}else{label=19;break};case 18:_fftw_plan_awake($2,0);STACKTOP=sp;return+($tmin/+($iter|0));case 19:label=20;break;case 20:$iter=$iter<<1;label=3;break;case 21:label=2;break}return 0.0}function _measure($pln,$p,$iter){$pln=$pln|0;$p=$p|0;$iter=$iter|0;var $1=0,$t0=0,$t1=0,$i=0,$4=0,$5=0,$6=0,$7=0,$24=0,$25=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+32|0;label=1;while(1)switch(label|0){case 1:$t0=sp|0;$t1=sp+8|0;$4=sp+16|0;$5=sp+24|0;$1=$pln;_fftw_get_crude_time($4);$6=$t0;$7=$4;HEAP32[$6>>2]=HEAP32[$7>>2];HEAP32[$6+4>>2]=HEAP32[$7+4>>2];$i=0;label=2;break;case 2:if(($i|0)<($iter|0)){label=3;break}else{label=5;break};case 3:FUNCTION_TABLE_vii[HEAP32[HEAP32[$1>>2]>>2]&2047]($1,$p);label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:_fftw_get_crude_time($5);$24=$t1;$25=$5;HEAP32[$24>>2]=HEAP32[$25>>2];HEAP32[$24+4>>2]=HEAP32[$25+4>>2];STACKTOP=sp;return+(+((HEAP32[$t1>>2]|0)-(HEAP32[$t0>>2]|0)|0)+ +((HEAP32[$t1+4>>2]|0)-(HEAP32[$t0+4>>2]|0)|0)*1.0e-6)}return 0.0}function _fftw_mkproblem_dft($sz,$vecsz,$ri,$ii,$ro,$io){$sz=$sz|0;$vecsz=$vecsz|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$ego=0,$12=0,$18=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$sz;$3=$vecsz;$4=$ri;$5=$ii;$6=$ro;$7=$io;if(($4|0)==($6|0)){label=2;break}else{label=3;break};case 2:$12=$4;$6=$12;$4=$12;label=3;break;case 3:if(($5|0)==($7|0)){label=4;break}else{label=5;break};case 4:$18=$5;$7=$18;$5=$18;label=5;break;case 5:if(($4|0)==($6|0)){label=7;break}else{label=6;break};case 6:if(($5|0)==($7|0)){label=7;break}else{label=12;break};case 7:if(($4|0)!=($6|0)){label=10;break}else{label=8;break};case 8:if(($5|0)!=($7|0)){label=10;break}else{label=9;break};case 9:if((_fftw_tensor_inplace_locations($2,$3)|0)!=0){label=11;break}else{label=10;break};case 10:$1=_fftw_mkproblem_unsolvable()|0;label=13;break;case 11:label=12;break;case 12:$ego=_fftw_mkproblem(28,2408)|0;HEAP32[$ego+4>>2]=_fftw_tensor_compress($2)|0;HEAP32[$ego+8>>2]=_fftw_tensor_compress_contiguous($3)|0;HEAP32[$ego+12>>2]=$4;HEAP32[$ego+16>>2]=$5;HEAP32[$ego+20>>2]=$6;HEAP32[$ego+24>>2]=$7;$1=$ego|0;label=13;break;case 13:return $1|0}return 0}function _rowmajor_kosherp($rnk,$n){$rnk=$rnk|0;$n=$n|0;var $1=0,$2=0,$i=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$rnk;if(($2|0)!=2147483647){label=3;break}else{label=2;break};case 2:$1=0;label=12;break;case 3:if(($2|0)<0){label=4;break}else{label=5;break};case 4:$1=0;label=12;break;case 5:$i=0;label=6;break;case 6:if(($i|0)<($2|0)){label=7;break}else{label=11;break};case 7:if((HEAP32[$n+($i<<2)>>2]|0)<=0){label=8;break}else{label=9;break};case 8:$1=0;label=12;break;case 9:label=10;break;case 10:$i=$i+1|0;label=6;break;case 11:$1=1;label=12;break;case 12:return $1|0}return 0}function _applicable($irs,$ors,$ivs,$ovs,$plnr){$irs=$irs|0;$ors=$ors|0;$ivs=$ivs|0;$ovs=$ovs|0;$plnr=$plnr|0;var $23=0,label=0;label=1;while(1)switch(label|0){case 1:if(($irs|0)==($ors|0)){label=2;break}else{$23=0;label=4;break};case 2:if(($ivs|0)==($ovs|0)){label=3;break}else{$23=0;label=4;break};case 3:$23=(HEAP32[$plnr+164>>2]&8|0)!=0^1;label=4;break;case 4:return $23&1|0}return 0}function _fftw_mkproblem_dft_d($sz,$vecsz,$ri,$ii,$ro,$io){$sz=$sz|0;$vecsz=$vecsz|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $1=0,$2=0,$p=0;$1=$sz;$2=$vecsz;$p=_fftw_mkproblem_dft($1,$2,$ri,$ii,$ro,$io)|0;_fftw_tensor_destroy2($2,$1);return $p|0}function _hash($p_,$m){$p_=$p_|0;$m=$m|0;var $2=0,$p=0;$2=$m;$p=$p_;_fftw_md5puts($2,28136);_fftw_md5int($2,(HEAP32[$p+12>>2]|0)==(HEAP32[$p+20>>2]|0)|0);_fftw_md5INT($2,((HEAP32[$p+16>>2]|0)-(HEAP32[$p+12>>2]|0)|0)/8|0);_fftw_md5INT($2,((HEAP32[$p+24>>2]|0)-(HEAP32[$p+20>>2]|0)|0)/8|0);_fftw_md5int($2,_fftw_alignment_of(HEAP32[$p+12>>2]|0)|0);_fftw_md5int($2,_fftw_alignment_of(HEAP32[$p+16>>2]|0)|0);_fftw_md5int($2,_fftw_alignment_of(HEAP32[$p+20>>2]|0)|0);_fftw_md5int($2,_fftw_alignment_of(HEAP32[$p+24>>2]|0)|0);_fftw_tensor_md5($2,HEAP32[$p+4>>2]|0);_fftw_tensor_md5($2,HEAP32[$p+8>>2]|0);return}function _zero($ego_){$ego_=$ego_|0;var $ego=0,$sz=0;$ego=$ego_;$sz=_fftw_tensor_append(HEAP32[$ego+8>>2]|0,HEAP32[$ego+4>>2]|0)|0;_fftw_dft_zerotens($sz,HEAP32[$ego+12>>2]|0,HEAP32[$ego+16>>2]|0);_fftw_tensor_destroy($sz);return}function _print($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$7=0,$16=0,$20=0,$24=0,$34=0,$44=0,$47=0,$50=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$7=HEAP32[$2>>2]|0;$16=(HEAP32[$ego+12>>2]|0)==(HEAP32[$ego+20>>2]|0)|0;$20=_fftw_alignment_of(HEAP32[$ego+12>>2]|0)|0;$24=_fftw_alignment_of(HEAP32[$ego+20>>2]|0)|0;$34=((HEAP32[$ego+16>>2]|0)-(HEAP32[$ego+12>>2]|0)|0)/8|0;$44=((HEAP32[$ego+24>>2]|0)-(HEAP32[$ego+20>>2]|0)|0)/8|0;$47=HEAP32[$ego+4>>2]|0;$50=HEAP32[$ego+8>>2]|0;FUNCTION_TABLE_viii[$7&2047]($2,21064,(tempInt=STACKTOP,STACKTOP=STACKTOP+56|0,HEAP32[tempInt>>2]=$16,HEAP32[tempInt+8>>2]=$20,HEAP32[tempInt+16>>2]=$24,HEAP32[tempInt+24>>2]=$34,HEAP32[tempInt+32>>2]=$44,HEAP32[tempInt+40>>2]=$47,HEAP32[tempInt+48>>2]=$50,tempInt)|0);STACKTOP=sp;return}function _destroy($ego_){$ego_=$ego_|0;var $1=0,$ego=0;$1=$ego_;$ego=$1;_fftw_tensor_destroy2(HEAP32[$ego+8>>2]|0,HEAP32[$ego+4>>2]|0);_fftw_ifree($1);return}function _fftw_configure_planner($plnr){$plnr=$plnr|0;var $1=0;$1=$plnr;_fftw_dft_conf_standard($1);_fftw_rdft_conf_standard($1);_fftw_reodft_conf_standard($1);return}function _fftw_mktensor_rowmajor($rnk,$n,$niphys,$nophys,$is,$os){$rnk=$rnk|0;$n=$n|0;$niphys=$niphys|0;$nophys=$nophys|0;$is=$is|0;$os=$os|0;var $1=0,$2=0,$x=0,$i=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rnk;$2=$n;$x=_fftw_mktensor($1)|0;if(($1|0)!=2147483647){label=2;break}else{label=8;break};case 2:if(($1|0)>0){label=3;break}else{label=8;break};case 3:HEAP32[$x+4+(($1-1|0)*12|0)+4>>2]=$is;HEAP32[$x+4+(($1-1|0)*12|0)+8>>2]=$os;HEAP32[$x+4+(($1-1|0)*12|0)>>2]=HEAP32[$2+($1-1<<2)>>2];$i=$1-1|0;label=4;break;case 4:if(($i|0)>0){label=5;break}else{label=7;break};case 5:HEAP32[$x+4+(($i-1|0)*12|0)+4>>2]=Math_imul(HEAP32[$x+4+($i*12|0)+4>>2]|0,HEAP32[$niphys+($i<<2)>>2]|0)|0;HEAP32[$x+4+(($i-1|0)*12|0)+8>>2]=Math_imul(HEAP32[$x+4+($i*12|0)+8>>2]|0,HEAP32[$nophys+($i<<2)>>2]|0)|0;HEAP32[$x+4+(($i-1|0)*12|0)>>2]=HEAP32[$2+($i-1<<2)>>2];label=6;break;case 6:$i=$i-1|0;label=4;break;case 7:label=8;break;case 8:return $x|0}return 0}function _fftw_many_kosherp($rnk,$n,$howmany){$rnk=$rnk|0;$n=$n|0;$howmany=$howmany|0;var $12=0,label=0;label=1;while(1)switch(label|0){case 1:if(($howmany|0)>=0){label=2;break}else{$12=0;label=3;break};case 2:$12=(_rowmajor_kosherp($rnk,$n)|0)!=0;label=3;break;case 3:return $12&1|0}return 0}function _fftw_dft_conf_standard($p){$p=$p|0;var $1=0;$1=$p;_fftw_solvtab_exec(2064,$1);_fftw_solvtab_exec(5224,$1);return}function _fftw_ct_generic_register($p){$p=$p|0;var $1=0;$1=$p;_regsolver($1,0,1);_regsolver($1,0,0);return}function _regsolver($plnr,$r,$dec){$plnr=$plnr|0;$r=$r|0;$dec=$dec|0;var $1=0,$2=0,$3=0,$slv=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$plnr;$2=$r;$3=$dec;$slv=_fftw_mksolver_ct(24,$2,$3,1076,0)|0;_fftw_solver_register($1,$slv|0);if((HEAP32[7896]|0)!=0){label=2;break}else{label=3;break};case 2:$slv=FUNCTION_TABLE_iiiiii[HEAP32[7896]&2047](24,$2,$3,1076,0)|0;_fftw_solver_register($1,$slv|0);label=3;break;case 3:return}}function _mkcldw($ego_,$r,$irs,$ors,$m,$ms,$v,$ivs,$ovs,$mstart,$mcount,$rio,$iio,$plnr){$ego_=$ego_|0;$r=$r|0;$irs=$irs|0;$ors=$ors|0;$m=$m|0;$ms=$ms|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;$mstart=$mstart|0;$mcount=$mcount|0;$rio=$rio|0;$iio=$iio|0;$plnr=$plnr|0;var $1=0,$3=0,$4=0,$7=0,$8=0,$9=0,$11=0,$12=0,$13=0,$14=0,$15=0,$ego=0,$pln=0,$cld=0,$dm=0,$n0=0.0,$33=0,$119=0,$120=0,$127=0,$136=0,$145=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$r;$4=$irs;$7=$ms;$8=$v;$9=$ivs;$11=$mstart;$12=$mcount;$13=$rio;$14=$iio;$15=$plnr;$ego=$ego_;$cld=0;$dm=Math_imul($7,$11)|0;if((_applicable($4,$ors,$9,$ovs,$15)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=7;break;case 3:$33=_fftw_mktensor_1d($3,$4,$4)|0;$cld=_fftw_mkplan_d($15,_fftw_mkproblem_dft_d($33,_fftw_mktensor_2d($12,$7,$7,$8,$9,$9)|0,$13+($dm<<3)|0,$14+($dm<<3)|0,$13+($dm<<3)|0,$14+($dm<<3)|0)|0)|0;if(($cld|0)!=0){label=5;break}else{label=4;break};case 4:label=6;break;case 5:$pln=_fftw_mkplan_dftw(112,3752,(HEAP32[$ego+12>>2]|0)==1?1322:1336)|0;HEAP32[$pln+104>>2]=$ego;HEAP32[$pln+96>>2]=$cld;HEAP32[$pln+64>>2]=$3;HEAP32[$pln+68>>2]=$4;HEAP32[$pln+72>>2]=$m;HEAP32[$pln+84>>2]=$7;HEAP32[$pln+88>>2]=$8;HEAP32[$pln+92>>2]=$9;HEAP32[$pln+76>>2]=$11;HEAP32[$pln+80>>2]=$11+$12;HEAP32[$pln+108>>2]=HEAP32[$ego+12>>2];HEAP32[$pln+100>>2]=0;$n0=+(Math_imul(Math_imul($3-1|0,$12-1|0)|0,$8)|0);$119=$pln+8|0;$120=$cld+8|0;HEAP32[$119>>2]=HEAP32[$120>>2];HEAP32[$119+4>>2]=HEAP32[$120+4>>2];HEAP32[$119+8>>2]=HEAP32[$120+8>>2];HEAP32[$119+12>>2]=HEAP32[$120+12>>2];HEAP32[$119+16>>2]=HEAP32[$120+16>>2];HEAP32[$119+20>>2]=HEAP32[$120+20>>2];HEAP32[$119+24>>2]=HEAP32[$120+24>>2];HEAP32[$119+28>>2]=HEAP32[$120+28>>2];$127=$pln+16|0;HEAPF64[$127>>3]=+HEAPF64[$127>>3]+8.0*$n0;$136=$pln+8|0;HEAPF64[$136>>3]=+HEAPF64[$136>>3]+4.0*$n0;$145=$pln+32|0;HEAPF64[$145>>3]=+HEAPF64[$145>>3]+8.0*$n0;$1=$pln|0;label=7;break;case 6:_fftw_plan_destroy_internal($cld);$1=0;label=7;break;case 7:return $1|0}return 0}function _awake($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $2=0,$ego=0;$2=$wakefulness;$ego=$ego_;_fftw_plan_awake(HEAP32[$ego+96>>2]|0,$2);_mktwiddle($ego,$2);return}function _print98($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$16=0,$19=0,$22=0,$25=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$16=HEAP32[$ego+64>>2]|0;$19=HEAP32[$ego+72>>2]|0;$22=HEAP32[$ego+88>>2]|0;$25=HEAP32[$ego+96>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,19040,(tempInt=STACKTOP,STACKTOP=STACKTOP+40|0,HEAP32[tempInt>>2]=(HEAP32[$ego+108>>2]|0)==1?27184:25152,HEAP32[tempInt+8>>2]=$16,HEAP32[tempInt+16>>2]=$19,HEAP32[tempInt+24>>2]=$22,HEAP32[tempInt+32>>2]=$25,tempInt)|0);STACKTOP=sp;return}function _destroy99($ego_){$ego_=$ego_|0;_fftw_plan_destroy_internal(HEAP32[$ego_+96>>2]|0);return}function _apply_dit($ego_,$rio,$iio){$ego_=$ego_|0;$rio=$rio|0;$iio=$iio|0;var $2=0,$3=0,$ego=0,$dm=0;$2=$rio;$3=$iio;$ego=$ego_;$dm=Math_imul(HEAP32[$ego+84>>2]|0,HEAP32[$ego+76>>2]|0)|0;_bytwiddle($ego,$2,$3);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+96>>2]|0)+56>>2]&2047](HEAP32[$ego+96>>2]|0,$2+($dm<<3)|0,$3+($dm<<3)|0,$2+($dm<<3)|0,$3+($dm<<3)|0);return}function _apply_dif($ego_,$rio,$iio){$ego_=$ego_|0;$rio=$rio|0;$iio=$iio|0;var $2=0,$3=0,$ego=0,$dm=0;$2=$rio;$3=$iio;$ego=$ego_;$dm=Math_imul(HEAP32[$ego+84>>2]|0,HEAP32[$ego+76>>2]|0)|0;FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+96>>2]|0)+56>>2]&2047](HEAP32[$ego+96>>2]|0,$2+($dm<<3)|0,$3+($dm<<3)|0,$2+($dm<<3)|0,$3+($dm<<3)|0);_bytwiddle($ego,$2,$3);return}function _bytwiddle($ego,$rio,$iio){$ego=$ego|0;$rio=$rio|0;$iio=$iio|0;var $1=0,$2=0,$3=0,$iv=0,$ir=0,$im=0,$rs=0,$m=0,$mb=0,$ms=0,$vs=0,$W=0,$pr=0,$pi=0,$xr=0.0,$xi=0.0,$wr=0.0,$wi=0.0,$58=0,$67=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$rio;$3=$iio;$rs=HEAP32[$1+68>>2]|0;$m=HEAP32[$1+72>>2]|0;$mb=HEAP32[$1+76>>2]|0;$ms=HEAP32[$1+84>>2]|0;$vs=HEAP32[$1+92>>2]|0;$W=HEAP32[HEAP32[$1+100>>2]>>2]|0;$mb=$mb+(($mb|0)==0)|0;$iv=0;label=2;break;case 2:if(($iv|0)<(HEAP32[$1+88>>2]|0)){label=3;break}else{label=13;break};case 3:$ir=1;label=4;break;case 4:if(($ir|0)<(HEAP32[$1+64>>2]|0)){label=5;break}else{label=11;break};case 5:$im=$mb;label=6;break;case 6:if(($im|0)<(HEAP32[$1+80>>2]|0)){label=7;break}else{label=9;break};case 7:$58=$2+((Math_imul($ms,$im)|0)<<3)|0;$pr=$58+((Math_imul($rs,$ir)|0)<<3)|0;$67=$3+((Math_imul($ms,$im)|0)<<3)|0;$pi=$67+((Math_imul($rs,$ir)|0)<<3)|0;$xr=+HEAPF64[$pr>>3];$xi=+HEAPF64[$pi>>3];$wr=+HEAPF64[$W+(($im<<1)+(Math_imul($m-1<<1,$ir)|0)-2<<3)>>3];$wi=+HEAPF64[$W+(($im<<1)+(Math_imul($m-1<<1,$ir)|0)-1<<3)>>3];HEAPF64[$pr>>3]=$xr*$wr+$xi*$wi;HEAPF64[$pi>>3]=$xi*$wr-$xr*$wi;label=8;break;case 8:$im=$im+1|0;label=6;break;case 9:label=10;break;case 10:$ir=$ir+1|0;label=4;break;case 11:$2=$2+($vs<<3)|0;$3=$3+($vs<<3)|0;label=12;break;case 12:$iv=$iv+1|0;label=2;break;case 13:return}}function _mktwiddle($ego,$wakefulness){$ego=$ego|0;$wakefulness=$wakefulness|0;var $1=0,$12=0;$1=$ego;$12=Math_imul(HEAP32[$1+64>>2]|0,HEAP32[$1+72>>2]|0)|0;_fftw_twiddle_awake($wakefulness,$1+100|0,2464,$12,HEAP32[$1+72>>2]|0,HEAP32[$1+64>>2]|0);return}function _fftw_ct_genericbuf_register($p){$p=$p|0;var $i=0,$j=0,label=0;label=1;while(1)switch(label|0){case 1:$i=0;label=2;break;case 2:if($i>>>0<7){label=3;break}else{label=9;break};case 3:$j=0;label=4;break;case 4:if($j>>>0<5){label=5;break}else{label=7;break};case 5:_regsolver104($p,HEAP32[6896+($i<<2)>>2]|0,HEAP32[6928+($j<<2)>>2]|0);label=6;break;case 6:$j=$j+1|0;label=4;break;case 7:label=8;break;case 8:$i=$i+1|0;label=2;break;case 9:return}}function _regsolver104($plnr,$r,$batchsz){$plnr=$plnr|0;$r=$r|0;$batchsz=$batchsz|0;var $1=0,$2=0,$3=0,$slv=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$plnr;$2=$r;$3=$batchsz;$slv=_fftw_mksolver_ct(28,$2,1,722,0)|0;HEAP32[$slv+24>>2]=$3;_fftw_solver_register($1,$slv|0);if((HEAP32[7896]|0)!=0){label=2;break}else{label=3;break};case 2:$slv=FUNCTION_TABLE_iiiiii[HEAP32[7896]&2047](28,$2,1,722,0)|0;HEAP32[$slv+24>>2]=$3;_fftw_solver_register($1,$slv|0);label=3;break;case 3:return}}function _mkcldw105($ego_,$r,$irs,$ors,$m,$ms,$v,$ivs,$ovs,$mstart,$mcount,$rio,$iio,$plnr){$ego_=$ego_|0;$r=$r|0;$irs=$irs|0;$ors=$ors|0;$m=$m|0;$ms=$ms|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;$mstart=$mstart|0;$mcount=$mcount|0;$rio=$rio|0;$iio=$iio|0;$plnr=$plnr|0;var $1=0,$3=0,$4=0,$6=0,$11=0,$12=0,$15=0,$ego=0,$pln=0,$cld=0,$buf=0,$n0=0.0,$45=0,$115=0,$116=0,$123=0,$132=0,$141=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$r;$4=$irs;$6=$m;$11=$mstart;$12=$mcount;$15=$plnr;$ego=$ego_;$cld=0;if((_applicable109($ego,$3,$4,$ors,$6,$v,$12,$15)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=7;break;case 3:$buf=_fftw_malloc_plain(Math_imul($3+16<<4,HEAP32[$ego+24>>2]|0)|0)|0;$45=_fftw_mktensor_1d($3,2,2)|0;$cld=_fftw_mkplan_d($15,_fftw_mkproblem_dft_d($45,_fftw_mktensor_1d(HEAP32[$ego+24>>2]|0,$3+16<<1,$3+16<<1)|0,$buf,$buf+8|0,$buf,$buf+8|0)|0)|0;_fftw_ifree($buf);if(($cld|0)!=0){label=5;break}else{label=4;break};case 4:label=6;break;case 5:$pln=_fftw_mkplan_dftw(112,3736,1640)|0;HEAP32[$pln+108>>2]=$ego;HEAP32[$pln+100>>2]=$cld;HEAP32[$pln+64>>2]=$3;HEAP32[$pln+72>>2]=$6;HEAP32[$pln+76>>2]=$ms;HEAP32[$pln+68>>2]=$4;HEAP32[$pln+96>>2]=HEAP32[$ego+24>>2];HEAP32[$pln+88>>2]=$11;HEAP32[$pln+92>>2]=$11+$12;$n0=+(Math_imul($3-1|0,$12-1|0)|0);$115=$pln+8|0;$116=$cld+8|0;HEAP32[$115>>2]=HEAP32[$116>>2];HEAP32[$115+4>>2]=HEAP32[$116+4>>2];HEAP32[$115+8>>2]=HEAP32[$116+8>>2];HEAP32[$115+12>>2]=HEAP32[$116+12>>2];HEAP32[$115+16>>2]=HEAP32[$116+16>>2];HEAP32[$115+20>>2]=HEAP32[$116+20>>2];HEAP32[$115+24>>2]=HEAP32[$116+24>>2];HEAP32[$115+28>>2]=HEAP32[$116+28>>2];$123=$pln+16|0;HEAPF64[$123>>3]=+HEAPF64[$123>>3]+8.0*$n0;$132=$pln+8|0;HEAPF64[$132>>3]=+HEAPF64[$132>>3]+4.0*$n0;$141=$pln+32|0;HEAPF64[$141>>3]=+HEAPF64[$141>>3]+8.0*$n0;$1=$pln|0;label=7;break;case 6:_fftw_plan_destroy_internal($cld);$1=0;label=7;break;case 7:return $1|0}return 0}function _awake106($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $2=0,$ego=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$wakefulness;$ego=$ego_;_fftw_plan_awake(HEAP32[$ego+100>>2]|0,$2);if(($2|0)==0){label=2;break}else{label=3;break};case 2:_fftw_triggen_destroy(HEAP32[$ego+104>>2]|0);HEAP32[$ego+104>>2]=0;label=4;break;case 3:HEAP32[$ego+104>>2]=_fftw_mktriggen(2,Math_imul(HEAP32[$ego+64>>2]|0,HEAP32[$ego+72>>2]|0)|0)|0;label=4;break;case 4:return}}function _print107($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$14=0,$17=0,$20=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$14=HEAP32[$ego+64>>2]|0;$17=HEAP32[$ego+72>>2]|0;$20=HEAP32[$ego+100>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,30992,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=HEAP32[$ego+96>>2],HEAP32[tempInt+8>>2]=$14,HEAP32[tempInt+16>>2]=$17,HEAP32[tempInt+24>>2]=$20,tempInt)|0);STACKTOP=sp;return}function _destroy108($ego_){$ego_=$ego_|0;_fftw_plan_destroy_internal(HEAP32[$ego_+100>>2]|0);return}function _applicable109($ego,$r,$irs,$ors,$m,$v,$mcount,$plnr){$ego=$ego|0;$r=$r|0;$irs=$irs|0;$ors=$ors|0;$m=$m|0;$v=$v|0;$mcount=$mcount|0;$plnr=$plnr|0;var $1=0,$3=0,$6=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$r;$6=$m;if((_applicable0($ego,$3,$irs,$ors,$6,$v,$mcount)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=7;break;case 3:if((HEAP32[$plnr+164>>2]&65536|0)!=0){label=4;break}else{label=6;break};case 4:if((Math_imul($6,$3)|0)<65536){label=5;break}else{label=6;break};case 5:$1=0;label=7;break;case 6:$1=1;label=7;break;case 7:return $1|0}return 0}function _apply($ego_,$rio,$iio){$ego_=$ego_|0;$rio=$rio|0;$iio=$iio|0;var $ego=0,$buf=0,$m=0,label=0;label=1;while(1)switch(label|0){case 1:$ego=$ego_;$buf=_fftw_malloc_plain(Math_imul((HEAP32[$ego+64>>2]|0)+16<<4,HEAP32[$ego+96>>2]|0)|0)|0;$m=HEAP32[$ego+88>>2]|0;label=2;break;case 2:if(($m|0)<(HEAP32[$ego+92>>2]|0)){label=3;break}else{label=5;break};case 3:_dobatch($ego,$m,$m+(HEAP32[$ego+96>>2]|0)|0,$buf,$rio,$iio);label=4;break;case 4:$m=$m+(HEAP32[$ego+96>>2]|0)|0;label=2;break;case 5:_fftw_ifree($buf);return}}function _dobatch($ego,$mb,$me,$buf,$rio,$iio){$ego=$ego|0;$mb=$mb|0;$me=$me|0;$buf=$buf|0;$rio=$rio|0;$iio=$iio|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$ms=0,$39=0,$44=0;$1=$ego;$2=$mb;$3=$me;$4=$buf;$5=$rio;$6=$iio;$ms=HEAP32[$1+76>>2]|0;_bytwiddle110($1,$2,$3,$4,$5,$6);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$1+100>>2]|0)+56>>2]&2047](HEAP32[$1+100>>2]|0,$4,$4+8|0,$4,$4+8|0);$39=$5+((Math_imul($ms,$2)|0)<<3)|0;$44=$6+((Math_imul($ms,$2)|0)<<3)|0;_fftw_cpy2d_pair_co($4,$4+8|0,$39,$44,$3-$2|0,(HEAP32[$1+64>>2]|0)+16<<1,$ms,HEAP32[$1+64>>2]|0,2,HEAP32[$1+68>>2]|0);return}function _bytwiddle110($ego,$mb,$me,$buf,$rio,$iio){$ego=$ego|0;$mb=$mb|0;$me=$me|0;$buf=$buf|0;$rio=$rio|0;$iio=$iio|0;var $1=0,$2=0,$j=0,$k=0,$r=0,$rs=0,$ms=0,$t=0,$32=0,$36=0,$39=0,$46=0.0,$49=0,$56=0.0,$69=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$mb;$r=HEAP32[$1+64>>2]|0;$rs=HEAP32[$1+68>>2]|0;$ms=HEAP32[$1+76>>2]|0;$t=HEAP32[$1+104>>2]|0;$j=0;label=2;break;case 2:if(($j|0)<($r|0)){label=3;break}else{label=9;break};case 3:$k=$2;label=4;break;case 4:if(($k|0)<($me|0)){label=5;break}else{label=7;break};case 5:$32=HEAP32[$t+8>>2]|0;$36=Math_imul($j,$k)|0;$39=Math_imul($j,$rs)|0;$46=+HEAPF64[$rio+($39+(Math_imul($k,$ms)|0)<<3)>>3];$49=Math_imul($j,$rs)|0;$56=+HEAPF64[$iio+($49+(Math_imul($k,$ms)|0)<<3)>>3];$69=$buf+(($j<<1)+(Math_imul($r+16<<1,$k-$2|0)|0)<<3)|0;FUNCTION_TABLE_viiffi[$32&2047]($t,$36,$46,$56,$69);label=6;break;case 6:$k=$k+1|0;label=4;break;case 7:label=8;break;case 8:$j=$j+1|0;label=2;break;case 9:return}}function _applicable0($ego,$r,$irs,$ors,$m,$v,$mcount){$ego=$ego|0;$r=$r|0;$irs=$irs|0;$ors=$ors|0;$m=$m|0;$v=$v|0;$mcount=$mcount|0;var $1=0,$2=0,$7=0,$35=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ego;$2=$r;$7=$mcount;if(($v|0)==1){label=2;break}else{$35=0;label=7;break};case 2:if(($irs|0)==($ors|0)){label=3;break}else{$35=0;label=7;break};case 3:if(($7|0)>=(HEAP32[$1+24>>2]|0)){label=4;break}else{$35=0;label=7;break};case 4:if((($7|0)%(HEAP32[$1+24>>2]|0)|0|0)==0){label=5;break}else{$35=0;label=7;break};case 5:if(($2|0)>=64){label=6;break}else{$35=0;label=7;break};case 6:$35=($m|0)>=($2|0);label=7;break;case 7:return $35&1|0}return 0}function _hartley($n,$xr,$xi,$xs,$o,$pr,$pi){$n=$n|0;$xr=$xr|0;$xi=$xi|0;$xs=$xs|0;$o=$o|0;$pr=$pr|0;$pi=$pi|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$i=0,$sr=0.0,$si=0.0,$10=0.0,$15=0.0,$32=0.0,$41=0.0,$51=0.0,$60=0.0,$70=0.0,$87=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$n;$2=$xr;$3=$xi;$4=$xs;$5=$o;$10=+HEAPF64[$2>>3];$sr=$10;HEAPF64[$5>>3]=$10;$15=+HEAPF64[$3>>3];$si=$15;HEAPF64[$5+8>>3]=$15;$5=$5+16|0;$i=1;label=2;break;case 2:if(($i+$i|0)<($1|0)){label=3;break}else{label=5;break};case 3:$32=+HEAPF64[$2+((Math_imul($i,$4)|0)<<3)>>3];$41=$32+ +HEAPF64[$2+((Math_imul($1-$i|0,$4)|0)<<3)>>3];HEAPF64[$5>>3]=$41;$sr=$sr+$41;$51=+HEAPF64[$3+((Math_imul($i,$4)|0)<<3)>>3];$60=$51+ +HEAPF64[$3+((Math_imul($1-$i|0,$4)|0)<<3)>>3];HEAPF64[$5+8>>3]=$60;$si=$si+$60;$70=+HEAPF64[$2+((Math_imul($i,$4)|0)<<3)>>3];HEAPF64[$5+16>>3]=$70- +HEAPF64[$2+((Math_imul($1-$i|0,$4)|0)<<3)>>3];$87=+HEAPF64[$3+((Math_imul($i,$4)|0)<<3)>>3];HEAPF64[$5+24>>3]=$87- +HEAPF64[$3+((Math_imul($1-$i|0,$4)|0)<<3)>>3];$5=$5+32|0;label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:HEAPF64[$pr>>3]=$sr;HEAPF64[$pi>>3]=$si;return}}function _cdot($n,$x,$w,$or0,$oi0,$or1,$oi1){$n=$n|0;$x=$x|0;$w=$w|0;$or0=$or0|0;$oi0=$oi0|0;$or1=$or1|0;$oi1=$oi1|0;var $2=0,$3=0,$i=0,$rr=0.0,$ri=0.0,$ir=0.0,$ii=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=$x;$3=$w;$rr=+HEAPF64[$2>>3];$ri=0.0;$ir=+HEAPF64[$2+8>>3];$ii=0.0;$2=$2+16|0;$i=1;label=2;break;case 2:if(($i+$i|0)<($n|0)){label=3;break}else{label=5;break};case 3:$rr=$rr+ +HEAPF64[$2>>3]*+HEAPF64[$3>>3];$ir=$ir+ +HEAPF64[$2+8>>3]*+HEAPF64[$3>>3];$ri=$ri+ +HEAPF64[$2+16>>3]*+HEAPF64[$3+8>>3];$ii=$ii+ +HEAPF64[$2+24>>3]*+HEAPF64[$3+8>>3];$2=$2+32|0;$3=$3+16|0;label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:HEAPF64[$or0>>3]=$rr+$ii;HEAPF64[$oi0>>3]=$ir-$ri;HEAPF64[$or1>>3]=$rr-$ii;HEAPF64[$oi1>>3]=$ir+$ri;return}}function _fftw_dft_generic_register($p){$p=$p|0;_fftw_solver_register($p,_mksolver()|0);return}function _mksolver(){return _fftw_mksolver(8,3e3)|0}function _mkplan114($ego,$p_,$plnr){$ego=$ego|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$3=0,$p=0,$pln=0,$n=0,$22=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$p_;if((_applicable117($ego,$3,$plnr)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=4;break;case 3:$pln=_fftw_mkplan_dft(80,3640,92)|0;$p=$3;$22=HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0;$n=$22;HEAP32[$pln+68>>2]=$22;HEAP32[$pln+72>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+8>>2];HEAP32[$pln+76>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+12>>2];HEAP32[$pln+64>>2]=0;HEAPF64[$pln+8>>3]=+(($n-1|0)*5|0|0);HEAPF64[$pln+16>>3]=0.0;HEAPF64[$pln+24>>3]=+(Math_imul($n-1|0,$n-1|0)|0);$1=$pln|0;label=4;break;case 4:return $1|0}return 0}function _awake115($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $ego=0;$ego=$ego_;_fftw_twiddle_awake($wakefulness,$ego+64|0,18688,HEAP32[$ego+68>>2]|0,HEAP32[$ego+68>>2]|0,((HEAP32[$ego+68>>2]|0)-1|0)/2|0);return}function _print116($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,sp=0;sp=STACKTOP;$2=$p;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,30704,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[$ego_+68>>2],tempInt)|0);STACKTOP=sp;return}function _applicable117($ego,$p_,$plnr){$ego=$ego|0;$p_=$p_|0;$plnr=$plnr|0;var $3=0,$p=0,$75=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$plnr;$p=$p_;if((HEAP32[HEAP32[$p+4>>2]>>2]|0)==1){label=2;break}else{$75=0;label=9;break};case 2:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)==0){label=3;break}else{$75=0;label=9;break};case 3:if(((HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0)%2|0|0)==1){label=4;break}else{$75=0;label=9;break};case 4:if((HEAP32[$3+164>>2]&64|0)!=0){label=5;break}else{label=6;break};case 5:if((HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0)<173){label=6;break}else{$75=0;label=9;break};case 6:if((HEAP32[$3+164>>2]&8|0)!=0){label=7;break}else{label=8;break};case 7:if((HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0)>16){label=8;break}else{$75=0;label=9;break};case 8:$75=(_fftw_is_prime(HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0)|0)!=0;label=9;break;case 9:return $75&1|0}return 0}function _apply118($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $4=0,$5=0,$ego=0,$i=0,$n=0,$is=0,$os=0,$W=0,$buf=0,$bufsz=0,$29=0,$57=0,$62=0,$69=0,label=0,sp=0;sp=STACKTOP;label=1;while(1)switch(label|0){case 1:$4=$ro;$5=$io;$ego=$ego_;$n=HEAP32[$ego+68>>2]|0;$is=HEAP32[$ego+72>>2]|0;$os=HEAP32[$ego+76>>2]|0;$W=HEAP32[HEAP32[$ego+64>>2]>>2]|0;$bufsz=$n<<1<<3;if($bufsz>>>0<65536){label=2;break}else{label=3;break};case 2:$29=STACKTOP;STACKTOP=STACKTOP+$bufsz|0;STACKTOP=STACKTOP+7>>3<<3;$buf=$29;label=4;break;case 3:$buf=_fftw_malloc_plain($bufsz)|0;label=4;break;case 4:_hartley($n,$ri,$ii,$is,$buf,$4,$5);$i=1;label=5;break;case 5:if(($i+$i|0)<($n|0)){label=6;break}else{label=8;break};case 6:$57=$4+((Math_imul($i,$os)|0)<<3)|0;$62=$5+((Math_imul($i,$os)|0)<<3)|0;$69=$4+((Math_imul($n-$i|0,$os)|0)<<3)|0;_cdot($n,$buf,$W,$57,$62,$69,$5+((Math_imul($n-$i|0,$os)|0)<<3)|0);$W=$W+($n-1<<3)|0;label=7;break;case 7:$i=$i+1|0;label=5;break;case 8:if($bufsz>>>0<65536){label=9;break}else{label=10;break};case 9:label=11;break;case 10:_fftw_ifree($buf);label=11;break;case 11:STACKTOP=sp;return}}function _fftw_dft_indirect_transpose_register($p){$p=$p|0;_fftw_solver_register($p,_mksolver124()|0);return}function _mksolver124(){return _fftw_mksolver(8,2952)|0}function _mkplan125($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$3=0,$4=0,$p=0,$pln=0,$cld=0,$cldtrans=0,$cldrest=0,$pdim0=0,$pdim1=0,$ts=0,$tv=0,$vl=0,$ivs=0,$ovs=0,$rit=0,$iit=0,$rot=0,$iot=0,$125=0,$214=0,$219=0,$226=0,$230=0,$234=0,$237=0,$241=0,$244=0,$248=0,$251=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+16|0;label=1;while(1)switch(label|0){case 1:$pdim0=sp|0;$pdim1=sp+8|0;$3=$p_;$4=$plnr;$p=$3;$cld=0;$cldtrans=0;$cldrest=0;if((_applicable129($ego_,$3,$4,$pdim0,$pdim1)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=11;break;case 3:$vl=(HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$pdim0>>2]|0)*12|0)>>2]|0)/(HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2]|0)|0;$ivs=Math_imul(HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2]|0,HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$pdim0>>2]|0)*12|0)+4>>2]|0)|0;$ovs=Math_imul(HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2]|0,HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$pdim0>>2]|0)*12|0)+8>>2]|0)|0;$rit=HEAP32[$p+12>>2]|0;$iit=HEAP32[$p+16>>2]|0;$rot=HEAP32[$p+20>>2]|0;$iot=HEAP32[$p+24>>2]|0;$ts=_fftw_tensor_copy_inplace(HEAP32[$p+4>>2]|0,0)|0;HEAP32[$ts+4+((HEAP32[$pdim1>>2]|0)*12|0)+8>>2]=HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$pdim0>>2]|0)*12|0)+4>>2];$tv=_fftw_tensor_copy_inplace(HEAP32[$p+8>>2]|0,0)|0;HEAP32[$tv+4+((HEAP32[$pdim0>>2]|0)*12|0)+8>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)+4>>2];HEAP32[$tv+4+((HEAP32[$pdim0>>2]|0)*12|0)>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2];$125=_fftw_mktensor_0d()|0;$cldtrans=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($125,_fftw_tensor_append($tv,$ts)|0,$rit,$iit,$rot,$iot)|0)|0;_fftw_tensor_destroy2($ts,$tv);if(($cldtrans|0)!=0){label=5;break}else{label=4;break};case 4:label=10;break;case 5:$ts=_fftw_tensor_copy(HEAP32[$p+4>>2]|0)|0;HEAP32[$ts+4+((HEAP32[$pdim1>>2]|0)*12|0)+4>>2]=HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$pdim0>>2]|0)*12|0)+4>>2];$tv=_fftw_tensor_copy(HEAP32[$p+8>>2]|0)|0;HEAP32[$tv+4+((HEAP32[$pdim0>>2]|0)*12|0)+4>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)+4>>2];HEAP32[$tv+4+((HEAP32[$pdim0>>2]|0)*12|0)>>2]=HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2];$cld=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($ts,$tv,$rot,$iot,$rot,$iot)|0)|0;if(($cld|0)!=0){label=7;break}else{label=6;break};case 6:label=10;break;case 7:$tv=_fftw_tensor_copy(HEAP32[$p+8>>2]|0)|0;$214=Math_imul($vl,HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$pdim1>>2]|0)*12|0)>>2]|0)|0;$219=$tv+4+((HEAP32[$pdim0>>2]|0)*12|0)|0;HEAP32[$219>>2]=(HEAP32[$219>>2]|0)-$214;$226=_fftw_tensor_copy(HEAP32[$p+4>>2]|0)|0;$230=HEAP32[$p+12>>2]|0;$234=$230+((Math_imul($ivs,$vl)|0)<<3)|0;$237=HEAP32[$p+16>>2]|0;$241=$237+((Math_imul($ivs,$vl)|0)<<3)|0;$244=HEAP32[$p+20>>2]|0;$248=$244+((Math_imul($ovs,$vl)|0)<<3)|0;$251=HEAP32[$p+24>>2]|0;$cldrest=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($226,$tv,$234,$241,$248,$251+((Math_imul($ovs,$vl)|0)<<3)|0)|0)|0;if(($cldrest|0)!=0){label=9;break}else{label=8;break};case 8:label=10;break;case 9:$pln=_fftw_mkplan_dft(88,3576,276)|0;HEAP32[$pln+76>>2]=$cldtrans;HEAP32[$pln+80>>2]=$cld;HEAP32[$pln+84>>2]=$cldrest;HEAP32[$pln+64>>2]=$vl;HEAP32[$pln+68>>2]=$ivs;HEAP32[$pln+72>>2]=$ovs;_fftw_ops_cpy($cldrest+8|0,$pln+8|0);_fftw_ops_madd2($vl,$cld+8|0,$pln+8|0);_fftw_ops_madd2($vl,$cldtrans+8|0,$pln+8|0);$1=$pln|0;label=11;break;case 10:_fftw_plan_destroy_internal($cldrest);_fftw_plan_destroy_internal($cld);_fftw_plan_destroy_internal($cldtrans);$1=0;label=11;break;case 11:STACKTOP=sp;return $1|0}return 0}function _awake126($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $2=0,$ego=0;$2=$wakefulness;$ego=$ego_;_fftw_plan_awake(HEAP32[$ego+76>>2]|0,$2);_fftw_plan_awake(HEAP32[$ego+80>>2]|0,$2);_fftw_plan_awake(HEAP32[$ego+84>>2]|0,$2);return}function _print127($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$14=0,$17=0,$20=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$14=HEAP32[$ego+76>>2]|0;$17=HEAP32[$ego+80>>2]|0;$20=HEAP32[$ego+84>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,30320,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=HEAP32[$ego+64>>2],HEAP32[tempInt+8>>2]=$14,HEAP32[tempInt+16>>2]=$17,HEAP32[tempInt+24>>2]=$20,tempInt)|0);STACKTOP=sp;return}function _destroy128($ego_){$ego_=$ego_|0;var $ego=0;$ego=$ego_;_fftw_plan_destroy_internal(HEAP32[$ego+84>>2]|0);_fftw_plan_destroy_internal(HEAP32[$ego+80>>2]|0);_fftw_plan_destroy_internal(HEAP32[$ego+76>>2]|0);return}function _applicable129($ego_,$p_,$plnr,$pdim0,$pdim1){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;$pdim0=$pdim0|0;$pdim1=$pdim1|0;var $1=0,$3=0,$4=0,$5=0,$p=0,$u=0,$36=0,$86=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$p_;$4=$plnr;$5=$pdim0;if((_applicable0130($ego_,$3,$4,$5,$pdim1)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=15;break;case 3:$p=$3;if((HEAP32[$p+12>>2]|0)==((HEAP32[$p+16>>2]|0)+8|0)){$36=1;label=5;break}else{label=4;break};case 4:$36=(HEAP32[$p+16>>2]|0)==((HEAP32[$p+12>>2]|0)+8|0);label=5;break;case 5:$u=$36?2:1;if((HEAP32[$4+164>>2]&65536|0)!=0){label=6;break}else{label=11;break};case 6:if((HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$5>>2]|0)*12|0)+4>>2]|0)!=($u|0)){label=7;break}else{label=11;break};case 7:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)==2){label=8;break}else{label=10;break};case 8:if((HEAP32[(HEAP32[$p+8>>2]|0)+4+((1-(HEAP32[$5>>2]|0)|0)*12|0)+4>>2]|0)==($u|0)){label=9;break}else{label=10;break};case 9:$86=HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$5>>2]|0)*12|0)+4>>2]|0;if(($86|0)==(Math_imul($u,HEAP32[(HEAP32[$p+8>>2]|0)+4+((1-(HEAP32[$5>>2]|0)|0)*12|0)>>2]|0)|0)){label=11;break}else{label=10;break};case 10:$1=0;label=15;break;case 11:if((HEAP32[$4+164>>2]&32|0)!=0){label=12;break}else{label=14;break};case 12:if((HEAP32[$p+12>>2]|0)!=(HEAP32[$p+20>>2]|0)){label=13;break}else{label=14;break};case 13:$1=0;label=15;break;case 14:$1=1;label=15;break;case 15:return $1|0}return 0}function _apply_op($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $2=0,$3=0,$4=0,$5=0,$ego=0,$ivs=0,$ovs=0,$i=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ri;$3=$ii;$4=$ro;$5=$io;$ego=$ego_;$ivs=HEAP32[$ego+68>>2]|0;$ovs=HEAP32[$ego+72>>2]|0;$i=0;label=2;break;case 2:if(($i|0)<(HEAP32[$ego+64>>2]|0)){label=3;break}else{label=5;break};case 3:FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+76>>2]|0)+56>>2]&2047](HEAP32[$ego+76>>2]|0,$2,$3,$4,$5);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+80>>2]|0)+56>>2]&2047](HEAP32[$ego+80>>2]|0,$4,$5,$4,$5);$2=$2+($ivs<<3)|0;$3=$3+($ivs<<3)|0;$4=$4+($ovs<<3)|0;$5=$5+($ovs<<3)|0;label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+84>>2]|0)+56>>2]&2047](HEAP32[$ego+84>>2]|0,$2,$3,$4,$5);return}}function _applicable0130($ego_,$p_,$plnr,$pdim0,$pdim1){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;$pdim0=$pdim0|0;$pdim1=$pdim1|0;var $4=0,$5=0,$p=0,$64=0,label=0;label=1;while(1)switch(label|0){case 1:$4=$pdim0;$5=$pdim1;$p=$p_;if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=2;break}else{$64=0;label=6;break};case 2:if((HEAP32[HEAP32[$p+4>>2]>>2]|0)!=2147483647){label=3;break}else{$64=0;label=6;break};case 3:if((_fftw_tensor_inplace_strides2(HEAP32[$p+8>>2]|0,HEAP32[$p+4>>2]|0)|0)!=0){label=4;break}else{$64=0;label=6;break};case 4:if((_pickdim(HEAP32[$p+8>>2]|0,HEAP32[$p+4>>2]|0,$4,$5)|0)!=0){label=5;break}else{$64=0;label=6;break};case 5:$64=(HEAP32[(HEAP32[$p+4>>2]|0)+4+((HEAP32[$5>>2]|0)*12|0)+8>>2]|0)!=(HEAP32[(HEAP32[$p+8>>2]|0)+4+((HEAP32[$4>>2]|0)*12|0)+4>>2]|0);label=6;break;case 6:return $64&1|0}return 0}function _apply154($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;return}function _pickdim($vs,$s,$pdim0,$pdim1){$vs=$vs|0;$s=$s|0;$pdim0=$pdim0|0;$pdim1=$pdim1|0;var $1=0,$2=0,$3=0,$4=0,$dim0=0,$dim1=0,$26=0,$34=0,$68=0,$85=0,$117=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$vs;$2=$s;$3=$pdim0;$4=$pdim1;HEAP32[$4>>2]=-1;HEAP32[$3>>2]=-1;$dim0=0;label=2;break;case 2:if(($dim0|0)<(HEAP32[$1>>2]|0)){label=3;break}else{label=15;break};case 3:$dim1=0;label=4;break;case 4:if(($dim1|0)<(HEAP32[$2>>2]|0)){label=5;break}else{label=13;break};case 5:$26=HEAP32[$1+4+($dim0*12|0)>>2]|0;$34=Math_imul($26,_fftw_iabs(HEAP32[$1+4+($dim0*12|0)+4>>2]|0)|0)|0;if(($34|0)<=(_fftw_iabs(HEAP32[$2+4+($dim1*12|0)+4>>2]|0)|0)){label=6;break}else{label=11;break};case 6:if((HEAP32[$1+4+($dim0*12|0)>>2]|0)>=(HEAP32[$2+4+($dim1*12|0)>>2]|0)){label=7;break}else{label=11;break};case 7:if((HEAP32[$3>>2]|0)==-1){label=10;break}else{label=8;break};case 8:$68=_fftw_iabs(HEAP32[$1+4+($dim0*12|0)+4>>2]|0)|0;if(($68|0)<=(_fftw_iabs(HEAP32[$1+4+((HEAP32[$3>>2]|0)*12|0)+4>>2]|0)|0)){label=9;break}else{label=11;break};case 9:$85=_fftw_iabs(HEAP32[$2+4+($dim1*12|0)+4>>2]|0)|0;if(($85|0)>=(_fftw_iabs(HEAP32[$2+4+((HEAP32[$4>>2]|0)*12|0)+4>>2]|0)|0)){label=10;break}else{label=11;break};case 10:HEAP32[$3>>2]=$dim0;HEAP32[$4>>2]=$dim1;label=11;break;case 11:label=12;break;case 12:$dim1=$dim1+1|0;label=4;break;case 13:label=14;break;case 14:$dim0=$dim0+1|0;label=2;break;case 15:if((HEAP32[$3>>2]|0)!=-1){label=16;break}else{$117=0;label=17;break};case 16:$117=(HEAP32[$4>>2]|0)!=-1;label=17;break;case 17:return $117&1|0}return 0}function _fftw_dft_indirect_register($p){$p=$p|0;var $i=0,label=0;label=1;while(1)switch(label|0){case 1:$i=0;label=2;break;case 2:if($i>>>0<2){label=3;break}else{label=5;break};case 3:_fftw_solver_register($p,_mksolver138(HEAP32[6888+($i<<2)>>2]|0)|0);label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:return}}function _mksolver138($adt){$adt=$adt|0;var $slv=0;$slv=_fftw_mksolver(12,2904)|0;HEAP32[$slv+8>>2]=$adt;return $slv|0}function _mkplan139($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$2=0,$3=0,$4=0,$p=0,$ego=0,$pln=0,$cld=0,$cldcpy=0,$17=0,$24=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego_;$3=$p_;$4=$plnr;$p=$3;$ego=$2;$cld=0;$cldcpy=0;if((_applicable143($2,$3,$4)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=9;break;case 3:$17=_fftw_mktensor_0d()|0;$24=_fftw_tensor_append(HEAP32[$p+8>>2]|0,HEAP32[$p+4>>2]|0)|0;$cldcpy=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($17,$24,HEAP32[$p+12>>2]|0,HEAP32[$p+16>>2]|0,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0)|0)|0;if(($cldcpy|0)!=0){label=5;break}else{label=4;break};case 4:label=8;break;case 5:$cld=_fftw_mkplan_f_d($4,FUNCTION_TABLE_ii[HEAP32[(HEAP32[$ego+8>>2]|0)+4>>2]&2047]($p)|0,1024,0,0)|0;if(($cld|0)!=0){label=7;break}else{label=6;break};case 6:label=8;break;case 7:$pln=_fftw_mkplan_dft(80,3544,HEAP32[HEAP32[$ego+8>>2]>>2]|0)|0;HEAP32[$pln+68>>2]=$cld;HEAP32[$pln+64>>2]=$cldcpy;HEAP32[$pln+72>>2]=$ego;_fftw_ops_add($cld+8|0,$cldcpy+8|0,$pln+8|0);$1=$pln|0;label=9;break;case 8:_fftw_plan_destroy_internal($cld);_fftw_plan_destroy_internal($cldcpy);$1=0;label=9;break;case 9:return $1|0}return 0}function _awake140($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $2=0,$ego=0;$2=$wakefulness;$ego=$ego_;_fftw_plan_awake(HEAP32[$ego+64>>2]|0,$2);_fftw_plan_awake(HEAP32[$ego+68>>2]|0,$2);return}function _print141($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$19=0,$22=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$19=HEAP32[$ego+68>>2]|0;$22=HEAP32[$ego+64>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,29824,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=HEAP32[(HEAP32[(HEAP32[$ego+72>>2]|0)+8>>2]|0)+8>>2],HEAP32[tempInt+8>>2]=$19,HEAP32[tempInt+16>>2]=$22,tempInt)|0);STACKTOP=sp;return}function _destroy142($ego_){$ego_=$ego_|0;var $ego=0;$ego=$ego_;_fftw_plan_destroy_internal(HEAP32[$ego+68>>2]|0);_fftw_plan_destroy_internal(HEAP32[$ego+64>>2]|0);return}function _applicable143($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$3=0,$4=0,$p=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$p_;$4=$plnr;if((_applicable0144($ego_,$3,$4)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=7;break;case 3:$p=$3;if((HEAP32[$4+164>>2]&32|0)!=0){label=4;break}else{label=6;break};case 4:if((HEAP32[$p+12>>2]|0)!=(HEAP32[$p+20>>2]|0)){label=5;break}else{label=6;break};case 5:$1=0;label=7;break;case 6:$1=1;label=7;break;case 7:return $1|0}return 0}function _applicable0144($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $ego=0,$p=0,$117=0,$119=0,$121=0,label=0;label=1;while(1)switch(label|0){case 1:$ego=$ego_;$p=$p_;if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=2;break}else{$121=0;label=17;break};case 2:if((HEAP32[HEAP32[$p+4>>2]>>2]|0)>0){label=3;break}else{$121=0;label=17;break};case 3:if((HEAP32[$p+12>>2]|0)==(HEAP32[$p+20>>2]|0)){label=4;break}else{label=6;break};case 4:if((_fftw_tensor_inplace_strides2(HEAP32[$p+4>>2]|0,HEAP32[$p+8>>2]|0)|0)!=0){label=6;break}else{label=5;break};case 5:if((_fftw_tensor_strides_decrease(HEAP32[$p+4>>2]|0,HEAP32[$p+8>>2]|0,(HEAP32[HEAP32[$ego+8>>2]>>2]|0)==286?0:1)|0)!=0){$119=1;label=16;break}else{label=6;break};case 6:if((HEAP32[$p+12>>2]|0)!=(HEAP32[$p+20>>2]|0)){label=7;break}else{label=11;break};case 7:if((HEAP32[HEAP32[$ego+8>>2]>>2]|0)==286){label=8;break}else{label=11;break};case 8:if((HEAP32[$plnr+164>>2]&4096|0)!=0){label=11;break}else{label=9;break};case 9:if((_fftw_tensor_min_istride(HEAP32[$p+4>>2]|0)|0)<=2){label=10;break}else{label=11;break};case 10:if((_fftw_tensor_min_ostride(HEAP32[$p+4>>2]|0)|0)>2){$119=1;label=16;break}else{label=11;break};case 11:if((HEAP32[$p+12>>2]|0)!=(HEAP32[$p+20>>2]|0)){label=12;break}else{$117=0;label=15;break};case 12:if((HEAP32[HEAP32[$ego+8>>2]>>2]|0)==954){label=13;break}else{$117=0;label=15;break};case 13:if((_fftw_tensor_min_ostride(HEAP32[$p+4>>2]|0)|0)<=2){label=14;break}else{$117=0;label=15;break};case 14:$117=(_fftw_tensor_min_istride(HEAP32[$p+4>>2]|0)|0)>2;label=15;break;case 15:$119=$117;label=16;break;case 16:$121=$119;label=17;break;case 17:return $121&1|0}return 0}function _apply_after($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $2=0,$3=0,$ego=0;$2=$ri;$3=$ii;$ego=$ego_;FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+68>>2]|0)+56>>2]&2047](HEAP32[$ego+68>>2]|0,$2,$3,$2,$3);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+64>>2]|0)+56>>2]&2047](HEAP32[$ego+64>>2]|0,$2,$3,$ro,$io);return}function _apply_before($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $4=0,$5=0,$ego=0;$4=$ro;$5=$io;$ego=$ego_;FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+64>>2]|0)+56>>2]&2047](HEAP32[$ego+64>>2]|0,$ri,$ii,$4,$5);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+68>>2]|0)+56>>2]&2047](HEAP32[$ego+68>>2]|0,$4,$5,$4,$5);return}function _mkcld_after($p){$p=$p|0;var $1=0,$5=0,$9=0;$1=$p;$5=_fftw_tensor_copy_inplace(HEAP32[$1+4>>2]|0,0)|0;$9=_fftw_tensor_copy_inplace(HEAP32[$1+8>>2]|0,0)|0;return _fftw_mkproblem_dft_d($5,$9,HEAP32[$1+12>>2]|0,HEAP32[$1+16>>2]|0,HEAP32[$1+12>>2]|0,HEAP32[$1+16>>2]|0)|0}function _mkcld_before($p){$p=$p|0;var $1=0,$5=0,$9=0;$1=$p;$5=_fftw_tensor_copy_inplace(HEAP32[$1+4>>2]|0,1)|0;$9=_fftw_tensor_copy_inplace(HEAP32[$1+8>>2]|0,1)|0;return _fftw_mkproblem_dft_d($5,$9,HEAP32[$1+20>>2]|0,HEAP32[$1+24>>2]|0,HEAP32[$1+20>>2]|0,HEAP32[$1+24>>2]|0)|0}function _fftw_dft_nop_register($p){$p=$p|0;_fftw_solver_register($p,_mksolver150()|0);return}function _mksolver150(){return _fftw_mksolver(8,2888)|0}function _mkplan151($ego,$p,$plnr){$ego=$ego|0;$p=$p|0;$plnr=$plnr|0;var $1=0,$pln=0,label=0;label=1;while(1)switch(label|0){case 1:if((_applicable153($ego,$p)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=4;break;case 3:$pln=_fftw_mkplan_dft(64,3528,1436)|0;_fftw_ops_zero($pln+8|0);$1=$pln|0;label=4;break;case 4:return $1|0}return 0}function _print152($ego,$p){$ego=$ego|0;$p=$p|0;var $2=0,sp=0;sp=STACKTOP;$2=$p;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,29344,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+7>>3<<3,HEAP32[tempInt>>2]=0,tempInt)|0);STACKTOP=sp;return}function _applicable153($ego_,$p_){$ego_=$ego_|0;$p_=$p_|0;var $p=0,$41=0,$43=0,label=0;label=1;while(1)switch(label|0){case 1:$p=$p_;if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=2;break}else{$43=1;label=7;break};case 2:if((HEAP32[HEAP32[$p+4>>2]>>2]|0)==0){label=3;break}else{$41=0;label=6;break};case 3:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=4;break}else{$41=0;label=6;break};case 4:if((HEAP32[$p+20>>2]|0)==(HEAP32[$p+12>>2]|0)){label=5;break}else{$41=0;label=6;break};case 5:$41=(_fftw_tensor_inplace_strides(HEAP32[$p+8>>2]|0)|0)!=0;label=6;break;case 6:$43=$41;label=7;break;case 7:return $43&1|0}return 0}function _fftw_dft_rank_geq2_register($p){$p=$p|0;var $i=0,label=0;label=1;while(1)switch(label|0){case 1:$i=0;label=2;break;case 2:if(($i|0)<3){label=3;break}else{label=5;break};case 3:_fftw_solver_register($p,_mksolver160(HEAP32[6864+($i<<2)>>2]|0,6864,3)|0);label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:return}}function _mksolver160($spltrnk,$buddies,$nbuddies){$spltrnk=$spltrnk|0;$buddies=$buddies|0;$nbuddies=$nbuddies|0;var $slv=0;$slv=_fftw_mksolver(20,2872)|0;HEAP32[$slv+8>>2]=$spltrnk;HEAP32[$slv+12>>2]=$buddies;HEAP32[$slv+16>>2]=$nbuddies;return $slv|0}function _mkplan161($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$2=0,$3=0,$4=0,$p=0,$pln=0,$cld1=0,$cld2=0,$sz1=0,$sz2=0,$vecszi=0,$sz2i=0,$spltrnk=0,$28=0,$33=0,$54=0,$57=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$sz1=sp|0;$sz2=sp+8|0;$spltrnk=sp+16|0;$2=$ego_;$3=$p_;$4=$plnr;$cld1=0;$cld2=0;if((_applicable165($2,$3,$4,$spltrnk)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=9;break;case 3:$p=$3;_fftw_tensor_split(HEAP32[$p+4>>2]|0,$sz1,HEAP32[$spltrnk>>2]|0,$sz2);$vecszi=_fftw_tensor_copy_inplace(HEAP32[$p+8>>2]|0,1)|0;$sz2i=_fftw_tensor_copy_inplace(HEAP32[$sz2>>2]|0,1)|0;$28=_fftw_tensor_copy(HEAP32[$sz2>>2]|0)|0;$33=_fftw_tensor_append(HEAP32[$p+8>>2]|0,HEAP32[$sz1>>2]|0)|0;$cld1=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($28,$33,HEAP32[$p+12>>2]|0,HEAP32[$p+16>>2]|0,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0)|0)|0;if(($cld1|0)!=0){label=5;break}else{label=4;break};case 4:label=8;break;case 5:$54=_fftw_tensor_copy_inplace(HEAP32[$sz1>>2]|0,1)|0;$57=_fftw_tensor_append($vecszi,$sz2i)|0;$cld2=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($54,$57,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0)|0)|0;if(($cld2|0)!=0){label=7;break}else{label=6;break};case 6:label=8;break;case 7:$pln=_fftw_mkplan_dft(80,3512,64)|0;HEAP32[$pln+64>>2]=$cld1;HEAP32[$pln+68>>2]=$cld2;HEAP32[$pln+72>>2]=$2;_fftw_ops_add($cld1+8|0,$cld2+8|0,$pln+8|0);_fftw_tensor_destroy4(HEAP32[$sz1>>2]|0,HEAP32[$sz2>>2]|0,$vecszi,$sz2i);$1=$pln|0;label=9;break;case 8:_fftw_plan_destroy_internal($cld2);_fftw_plan_destroy_internal($cld1);_fftw_tensor_destroy4(HEAP32[$sz1>>2]|0,HEAP32[$sz2>>2]|0,$vecszi,$sz2i);$1=0;label=9;break;case 9:STACKTOP=sp;return $1|0}return 0}function _awake162($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;var $2=0,$ego=0;$2=$wakefulness;$ego=$ego_;_fftw_plan_awake(HEAP32[$ego+64>>2]|0,$2);_fftw_plan_awake(HEAP32[$ego+68>>2]|0,$2);return}function _print163($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$17=0,$20=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$17=HEAP32[$ego+64>>2]|0;$20=HEAP32[$ego+68>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,28800,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=HEAP32[(HEAP32[$ego+72>>2]|0)+8>>2],HEAP32[tempInt+8>>2]=$17,HEAP32[tempInt+16>>2]=$20,tempInt)|0);STACKTOP=sp;return}function _destroy164($ego_){$ego_=$ego_|0;var $ego=0;$ego=$ego_;_fftw_plan_destroy_internal(HEAP32[$ego+68>>2]|0);_fftw_plan_destroy_internal(HEAP32[$ego+64>>2]|0);return}function _applicable165($ego_,$p_,$plnr,$rp){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;$rp=$rp|0;var $1=0,$2=0,$3=0,$4=0,$ego=0,$p=0,$54=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego_;$3=$p_;$4=$plnr;$ego=$2;$p=$3;if((_applicable0167($2,$3,$rp)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=12;break;case 3:if((HEAP32[$4+164>>2]&128|0)!=0){label=4;break}else{label=6;break};case 4:if((HEAP32[$ego+8>>2]|0)!=(HEAP32[HEAP32[$ego+12>>2]>>2]|0)){label=5;break}else{label=6;break};case 5:$1=0;label=12;break;case 6:if((HEAP32[$4+164>>2]&65536|0)!=0){label=7;break}else{label=11;break};case 7:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)>0){label=8;break}else{label=10;break};case 8:$54=_fftw_tensor_min_stride(HEAP32[$p+8>>2]|0)|0;if(($54|0)>(_fftw_tensor_max_index(HEAP32[$p+4>>2]|0)|0)){label=9;break}else{label=10;break};case 9:$1=0;label=12;break;case 10:label=11;break;case 11:$1=1;label=12;break;case 12:return $1|0}return 0}function _apply166($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $4=0,$5=0,$ego=0;$4=$ro;$5=$io;$ego=$ego_;FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+64>>2]|0)+56>>2]&2047](HEAP32[$ego+64>>2]|0,$ri,$ii,$4,$5);FUNCTION_TABLE_viiiii[HEAP32[(HEAP32[$ego+68>>2]|0)+56>>2]&2047](HEAP32[$ego+68>>2]|0,$4,$5,$4,$5);return}function _applicable0167($ego_,$p_,$rp){$ego_=$ego_|0;$p_=$p_|0;$rp=$rp|0;var $p=0,$37=0,label=0;label=1;while(1)switch(label|0){case 1:$p=$p_;if((HEAP32[HEAP32[$p+4>>2]>>2]|0)!=2147483647){label=2;break}else{$37=0;label=5;break};case 2:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=3;break}else{$37=0;label=5;break};case 3:if((HEAP32[HEAP32[$p+4>>2]>>2]|0)>=2){label=4;break}else{$37=0;label=5;break};case 4:$37=(_picksplit($ego_,HEAP32[$p+4>>2]|0,$rp)|0)!=0;label=5;break;case 5:return $37&1|0}return 0}function _picksplit($ego,$sz,$rp){$ego=$ego|0;$sz=$sz|0;$rp=$rp|0;var $1=0,$2=0,$3=0,$4=0,$20=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego;$3=$sz;$4=$rp;if((_fftw_pickdim(HEAP32[$2+8>>2]|0,HEAP32[$2+12>>2]|0,HEAP32[$2+16>>2]|0,$3,1,$4)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=6;break;case 3:$20=$4;HEAP32[$20>>2]=(HEAP32[$20>>2]|0)+1;if((HEAP32[$4>>2]|0)>=(HEAP32[$3>>2]|0)){label=4;break}else{label=5;break};case 4:$1=0;label=6;break;case 5:$1=1;label=6;break;case 6:return $1|0}return 0}function _fftw_dft_solve($ego_,$p_){$ego_=$ego_|0;$p_=$p_|0;var $1=0,$p=0;$1=$ego_;$p=$p_;FUNCTION_TABLE_viiiii[HEAP32[$1+56>>2]&2047]($1,HEAP32[$p+12>>2]|0,HEAP32[$p+16>>2]|0,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0);return}function _fftw_dft_vrank_geq1_register($p){$p=$p|0;var $i=0,label=0;label=1;while(1)switch(label|0){case 1:$i=0;label=2;break;case 2:if(($i|0)<2){label=3;break}else{label=5;break};case 3:_fftw_solver_register($p,_mksolver176(HEAP32[6848+($i<<2)>>2]|0,6848,2)|0);label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:return}}function _mksolver176($vecloop_dim,$buddies,$nbuddies){$vecloop_dim=$vecloop_dim|0;$buddies=$buddies|0;$nbuddies=$nbuddies|0;var $slv=0;$slv=_fftw_mksolver(20,2856)|0;HEAP32[$slv+8>>2]=$vecloop_dim;HEAP32[$slv+12>>2]=$buddies;HEAP32[$slv+16>>2]=$nbuddies;return $slv|0}function _mkplan177($ego_,$p_,$plnr){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;var $1=0,$2=0,$3=0,$4=0,$p=0,$pln=0,$cld=0,$vdim=0,$d=0,$27=0,$32=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+8|0;label=1;while(1)switch(label|0){case 1:$vdim=sp|0;$2=$ego_;$3=$p_;$4=$plnr;if((_applicable181($2,$3,$4,$vdim)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=9;break;case 3:$p=$3;$d=(HEAP32[$p+8>>2]|0)+4+((HEAP32[$vdim>>2]|0)*12|0)|0;$27=_fftw_tensor_copy(HEAP32[$p+4>>2]|0)|0;$32=_fftw_tensor_copy_except(HEAP32[$p+8>>2]|0,HEAP32[$vdim>>2]|0)|0;$cld=_fftw_mkplan_d($4,_fftw_mkproblem_dft_d($27,$32,HEAP32[$p+12>>2]|0,HEAP32[$p+16>>2]|0,HEAP32[$p+20>>2]|0,HEAP32[$p+24>>2]|0)|0)|0;if(($cld|0)!=0){label=5;break}else{label=4;break};case 4:$1=0;label=9;break;case 5:$pln=_fftw_mkplan_dft(88,3496,26)|0;HEAP32[$pln+64>>2]=$cld;HEAP32[$pln+68>>2]=HEAP32[$d>>2];HEAP32[$pln+72>>2]=HEAP32[$d+4>>2];HEAP32[$pln+76>>2]=HEAP32[$d+8>>2];HEAP32[$pln+80>>2]=$2;_fftw_ops_zero($pln+8|0);HEAPF64[$pln+32>>3]=3.14159;_fftw_ops_madd2(HEAP32[$pln+68>>2]|0,$cld+8|0,$pln+8|0);if((HEAP32[HEAP32[$p+4>>2]>>2]|0)!=1){label=7;break}else{label=6;break};case 6:if((HEAP32[(HEAP32[$p+4>>2]|0)+4>>2]|0)>64){label=7;break}else{label=8;break};case 7:HEAPF64[$pln+40>>3]=+(HEAP32[$pln+68>>2]|0)*+HEAPF64[$cld+40>>3];label=8;break;case 8:$1=$pln|0;label=9;break;case 9:STACKTOP=sp;return $1|0}return 0}function _awake178($ego_,$wakefulness){$ego_=$ego_|0;$wakefulness=$wakefulness|0;_fftw_plan_awake(HEAP32[$ego_+64>>2]|0,$wakefulness);return}function _print179($ego_,$p){$ego_=$ego_|0;$p=$p|0;var $2=0,$ego=0,$17=0,$20=0,sp=0;sp=STACKTOP;$2=$p;$ego=$ego_;$17=HEAP32[(HEAP32[$ego+80>>2]|0)+8>>2]|0;$20=HEAP32[$ego+64>>2]|0;FUNCTION_TABLE_viii[HEAP32[$2>>2]&2047]($2,28072,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=HEAP32[$ego+68>>2],HEAP32[tempInt+8>>2]=$17,HEAP32[tempInt+16>>2]=$20,tempInt)|0);STACKTOP=sp;return}function _destroy180($ego_){$ego_=$ego_|0;_fftw_plan_destroy_internal(HEAP32[$ego_+64>>2]|0);return}function _applicable181($ego_,$p_,$plnr,$dp){$ego_=$ego_|0;$p_=$p_|0;$plnr=$plnr|0;$dp=$dp|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$ego=0,$p=0,$d=0,$62=0,$67=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$ego_;$3=$p_;$4=$plnr;$5=$dp;$ego=$2;if((_applicable0183($2,$3,$5)|0)!=0){label=3;break}else{label=2;break};case 2:$1=0;label=15;break;case 3:if((HEAP32[$4+164>>2]&256|0)!=0){label=4;break}else{label=6;break};case 4:if((HEAP32[$ego+8>>2]|0)!=(HEAP32[HEAP32[$ego+12>>2]>>2]|0)){label=5;break}else{label=6;break};case 5:$1=0;label=15;break;case 6:$p=$3;if((HEAP32[$4+164>>2]&65536|0)!=0){label=7;break}else{label=14;break};case 7:$d=(HEAP32[$p+8>>2]|0)+4+((HEAP32[$5>>2]|0)*12|0)|0;if((HEAP32[HEAP32[$p+4>>2]>>2]|0)>1){label=8;break}else{label=10;break};case 8:$62=_fftw_iabs(HEAP32[$d+4>>2]|0)|0;$67=_fftw_imin($62,_fftw_iabs(HEAP32[$d+8>>2]|0)|0)|0;if(($67|0)<(_fftw_tensor_max_index(HEAP32[$p+4>>2]|0)|0)){label=9;break}else{label=10;break};case 9:$1=0;label=15;break;case 10:if((HEAP32[$4+164>>2]&512|0)!=0){label=11;break}else{label=13;break};case 11:if((HEAP32[$4+160>>2]|0)>1){label=12;break}else{label=13;break};case 12:$1=0;label=15;break;case 13:label=14;break;case 14:$1=1;label=15;break;case 15:return $1|0}return 0}function _apply182($ego_,$ri,$ii,$ro,$io){$ego_=$ego_|0;$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;var $ego=0,$i=0,$ivs=0,$ovs=0,$28=0,$31=0,$36=0,$41=0,$46=0,$51=0,label=0;label=1;while(1)switch(label|0){case 1:$ego=$ego_;$ivs=HEAP32[$ego+72>>2]|0;$ovs=HEAP32[$ego+76>>2]|0;$i=0;label=2;break;case 2:if(($i|0)<(HEAP32[$ego+68>>2]|0)){label=3;break}else{label=5;break};case 3:$28=HEAP32[(HEAP32[$ego+64>>2]|0)+56>>2]|0;$31=HEAP32[$ego+64>>2]|0;$36=$ri+((Math_imul($i,$ivs)|0)<<3)|0;$41=$ii+((Math_imul($i,$ivs)|0)<<3)|0;$46=$ro+((Math_imul($i,$ovs)|0)<<3)|0;$51=$io+((Math_imul($i,$ovs)|0)<<3)|0;FUNCTION_TABLE_viiiii[$28&2047]($31,$36,$41,$46,$51);label=4;break;case 4:$i=$i+1|0;label=2;break;case 5:return}}function _applicable0183($ego_,$p_,$dp){$ego_=$ego_|0;$p_=$p_|0;$dp=$dp|0;var $p=0,$45=0,label=0;label=1;while(1)switch(label|0){case 1:$p=$p_;if((HEAP32[HEAP32[$p+8>>2]>>2]|0)!=2147483647){label=2;break}else{$45=0;label=5;break};case 2:if((HEAP32[HEAP32[$p+8>>2]>>2]|0)>0){label=3;break}else{$45=0;label=5;break};case 3:if((HEAP32[HEAP32[$p+4>>2]>>2]|0)>0){label=4;break}else{$45=0;label=5;break};case 4:$45=(_pickdim184($ego_,HEAP32[$p+8>>2]|0,(HEAP32[$p+12>>2]|0)!=(HEAP32[$p+20>>2]|0)|0,$dp)|0)!=0;label=5;break;case 5:return $45&1|0}return 0}function _pickdim184($ego,$vecsz,$oop,$dp){$ego=$ego|0;$vecsz=$vecsz|0;$oop=$oop|0;$dp=$dp|0;var $1=0;$1=$ego;return _fftw_pickdim(HEAP32[$1+8>>2]|0,HEAP32[$1+12>>2]|0,HEAP32[$1+16>>2]|0,$vecsz,$oop,$dp)|0}function _fftw_dft_zerotens($sz,$ri,$ii){$sz=$sz|0;$ri=$ri|0;$ii=$ii|0;var $1=0;$1=$sz;_recur($1+4|0,HEAP32[$1>>2]|0,$ri,$ii);return}function _recur($dims,$rnk,$ri,$ii){$dims=$dims|0;$rnk=$rnk|0;$ri=$ri|0;$ii=$ii|0;var $1=0,$2=0,$3=0,$4=0,$i=0,$n=0,$is=0,$64=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$dims;$2=$rnk;$3=$ri;$4=$ii;if(($2|0)==2147483647){label=2;break}else{label=3;break};case 2:label=20;break;case 3:if(($2|0)==0){label=4;break}else{label=5;break};case 4:HEAPF64[$4>>3]=0.0;HEAPF64[$3>>3]=0.0;label=19;break;case 5:if(($2|0)>0){label=6;break}else{label=18;break};case 6:$n=HEAP32[$1>>2]|0;$is=HEAP32[$1+4>>2]|0;if(($2|0)==1){label=7;break}else{label=12;break};case 7:$i=0;label=8;break;case 8:if(($i|0)<($n|0)){label=9;break}else{label=11;break};case 9:HEAPF64[$4+((Math_imul($i,$is)|0)<<3)>>3]=0.0;HEAPF64[$3+((Math_imul($i,$is)|0)<<3)>>3]=0.0;label=10;break;case 10:$i=$i+1|0;label=8;break;case 11:label=17;break;case 12:$i=0;label=13;break;case 13:if(($i|0)<($n|0)){label=14;break}else{label=16;break};case 14:$64=$3+((Math_imul($i,$is)|0)<<3)|0;_recur($1+12|0,$2-1|0,$64,$4+((Math_imul($i,$is)|0)<<3)|0);label=15;break;case 15:$i=$i+1|0;label=13;break;case 16:label=17;break;case 17:label=18;break;case 18:label=19;break;case 19:label=20;break;case 20:return}}function _fftw_codelet_n1_10($p){$p=$p|0;_fftw_kdft_register($p,342,18536);return}function _n1_10($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T3=0.0,$Tj=0.0,$TQ=0.0,$T1e=0.0,$TU=0.0,$TV=0.0,$T1c=0.0,$T1b=0.0,$Tm=0.0,$Tp=0.0,$Tq=0.0,$Ta=0.0,$Th=0.0,$Ti=0.0,$TA=0.0,$TH=0.0,$T17=0.0,$T14=0.0,$T1f=0.0,$T1g=0.0,$T1h=0.0,$TL=0.0,$TM=0.0,$TR=0.0,$T1=0.0,$T2=0.0,$TO=0.0,$TP=0.0,$T6=0.0,$Tk=0.0,$Tg=0.0,$To=0.0,$T9=0.0,$Tl=0.0,$Td=0.0,$Tn=0.0,$T4=0.0,$T5=0.0,$Te=0.0,$Tf=0.0,$T7=0.0,$T8=0.0,$Tb=0.0,$Tc=0.0,$Tw=0.0,$T15=0.0,$TG=0.0,$T13=0.0,$Tz=0.0,$T16=0.0,$TD=0.0,$T12=0.0,$Tu=0.0,$Tv=0.0,$TE=0.0,$TF=0.0,$Tx=0.0,$Ty=0.0,$TB=0.0,$TC=0.0,$TI=0.0,$TK=0.0,$Tt=0.0,$TJ=0.0,$Tr=0.0,$Ts=0.0,$TW=0.0,$TY=0.0,$TT=0.0,$TX=0.0,$TN=0.0,$TS=0.0,$T18=0.0,$T1a=0.0,$T11=0.0,$T19=0.0,$TZ=0.0,$T10=0.0,$T1d=0.0,$T1l=0.0,$T1k=0.0,$T1m=0.0,$T1i=0.0,$T1j=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T3=$T1-$T2;$Tj=$T1+$T2;$TO=+HEAPF64[$2>>3];$TP=+HEAPF64[$2+(($5*5|0)<<3)>>3];$TQ=$TO-$TP;$T1e=$TO+$TP;$T4=+HEAPF64[$1+($5<<1<<3)>>3];$T5=+HEAPF64[$1+(($5*7|0)<<3)>>3];$T6=$T4-$T5;$Tk=$T4+$T5;$Te=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Tf=+HEAPF64[$1+($5<<3)>>3];$Tg=$Te-$Tf;$To=$Te+$Tf;$T7=+HEAPF64[$1+($5<<3<<3)>>3];$T8=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T9=$T7-$T8;$Tl=$T7+$T8;$Tb=+HEAPF64[$1+($5<<2<<3)>>3];$Tc=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Td=$Tb-$Tc;$Tn=$Tb+$Tc;$TU=$T6-$T9;$TV=$Td-$Tg;$T1c=$Tk-$Tl;$T1b=$Tn-$To;$Tm=$Tk+$Tl;$Tp=$Tn+$To;$Tq=$Tm+$Tp;$Ta=$T6+$T9;$Th=$Td+$Tg;$Ti=$Ta+$Th;$Tu=+HEAPF64[$2+($5<<1<<3)>>3];$Tv=+HEAPF64[$2+(($5*7|0)<<3)>>3];$Tw=$Tu-$Tv;$T15=$Tu+$Tv;$TE=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TF=+HEAPF64[$2+($5<<3)>>3];$TG=$TE-$TF;$T13=$TE+$TF;$Tx=+HEAPF64[$2+($5<<3<<3)>>3];$Ty=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tz=$Tx-$Ty;$T16=$Tx+$Ty;$TB=+HEAPF64[$2+($5<<2<<3)>>3];$TC=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TD=$TB-$TC;$T12=$TB+$TC;$TA=$Tw-$Tz;$TH=$TD-$TG;$T17=$T15-$T16;$T14=$T12-$T13;$T1f=$T15+$T16;$T1g=$T12+$T13;$T1h=$T1f+$T1g;$TL=$Tw+$Tz;$TM=$TD+$TG;$TR=$TL+$TM;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T3+$Ti;HEAPF64[$4+(($6*5|0)<<3)>>3]=$TQ+$TR;HEAPF64[$3>>3]=$Tj+$Tq;HEAPF64[$4>>3]=$T1e+$T1h;$TI=.9510565162951535*$TA+.5877852522924731*$TH;$TK=.9510565162951535*$TH-.5877852522924731*$TA;$Tr=($Ta-$Th)*.5590169943749475;$Ts=$T3-.25*$Ti;$Tt=$Tr+$Ts;$TJ=$Ts-$Tr;HEAPF64[$3+(($6*9|0)<<3)>>3]=$Tt-$TI;HEAPF64[$3+(($6*3|0)<<3)>>3]=$TJ+$TK;HEAPF64[$3+($6<<3)>>3]=$Tt+$TI;HEAPF64[$3+(($6*7|0)<<3)>>3]=$TJ-$TK;$TW=.9510565162951535*$TU+.5877852522924731*$TV;$TY=.9510565162951535*$TV-.5877852522924731*$TU;$TN=($TL-$TM)*.5590169943749475;$TS=$TQ-.25*$TR;$TT=$TN+$TS;$TX=$TS-$TN;HEAPF64[$4+($6<<3)>>3]=$TT-$TW;HEAPF64[$4+(($6*7|0)<<3)>>3]=$TY+$TX;HEAPF64[$4+(($6*9|0)<<3)>>3]=$TW+$TT;HEAPF64[$4+(($6*3|0)<<3)>>3]=$TX-$TY;$T18=.9510565162951535*$T14-.5877852522924731*$T17;$T1a=.9510565162951535*$T17+.5877852522924731*$T14;$TZ=$Tj-.25*$Tq;$T10=($Tm-$Tp)*.5590169943749475;$T11=$TZ-$T10;$T19=$T10+$TZ;HEAPF64[$3+($6<<1<<3)>>3]=$T11-$T18;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T19+$T1a;HEAPF64[$3+($6<<3<<3)>>3]=$T11+$T18;HEAPF64[$3+($6<<2<<3)>>3]=$T19-$T1a;$T1d=.9510565162951535*$T1b-.5877852522924731*$T1c;$T1l=.9510565162951535*$T1c+.5877852522924731*$T1b;$T1i=$T1e-.25*$T1h;$T1j=($T1f-$T1g)*.5590169943749475;$T1k=$T1i-$T1j;$T1m=$T1j+$T1i;HEAPF64[$4+($6<<1<<3)>>3]=$T1d+$T1k;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T1m-$T1l;HEAPF64[$4+($6<<3<<3)>>3]=$T1k-$T1d;HEAPF64[$4+($6<<2<<3)>>3]=$T1l+$T1m;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_11($p){$p=$p|0;_fftw_kdft_register($p,344,10216);return}function _n1_11($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$TM=0.0,$T4=0.0,$TG=0.0,$Tk=0.0,$TR=0.0,$Tw=0.0,$TN=0.0,$T7=0.0,$TK=0.0,$Ta=0.0,$TH=0.0,$Tn=0.0,$TQ=0.0,$Td=0.0,$TJ=0.0,$Tq=0.0,$TO=0.0,$Tt=0.0,$TP=0.0,$Tg=0.0,$TI=0.0,$T2=0.0,$T3=0.0,$Ti=0.0,$Tj=0.0,$Tu=0.0,$Tv=0.0,$T5=0.0,$T6=0.0,$T8=0.0,$T9=0.0,$To=0.0,$Tp=0.0,$Tl=0.0,$Tm=0.0,$Tb=0.0,$Tc=0.0,$Tr=0.0,$Ts=0.0,$Te=0.0,$Tf=0.0,$Tx=0.0,$Th=0.0,$TZ=0.0,$T10=0.0,$TX=0.0,$TY=0.0,$Tz=0.0,$Ty=0.0,$TB=0.0,$TA=0.0,$TT=0.0,$TU=0.0,$TV=0.0,$TW=0.0,$TD=0.0,$TC=0.0,$TL=0.0,$TS=0.0,$TF=0.0,$TE=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$TM=+HEAPF64[$2>>3];$T2=+HEAPF64[$1+($5<<3)>>3];$T3=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T4=$T2+$T3;$TG=$T3-$T2;$Ti=+HEAPF64[$2+($5<<3)>>3];$Tj=+HEAPF64[$2+(($5*10|0)<<3)>>3];$Tk=$Ti-$Tj;$TR=$Ti+$Tj;$Tu=+HEAPF64[$2+($5<<1<<3)>>3];$Tv=+HEAPF64[$2+(($5*9|0)<<3)>>3];$Tw=$Tu-$Tv;$TN=$Tu+$Tv;$T5=+HEAPF64[$1+($5<<1<<3)>>3];$T6=+HEAPF64[$1+(($5*9|0)<<3)>>3];$T7=$T5+$T6;$TK=$T6-$T5;$T8=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T9=+HEAPF64[$1+($5<<3<<3)>>3];$Ta=$T8+$T9;$TH=$T9-$T8;$Tl=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tm=+HEAPF64[$2+($5<<3<<3)>>3];$Tn=$Tl-$Tm;$TQ=$Tl+$Tm;$Tb=+HEAPF64[$1+($5<<2<<3)>>3];$Tc=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Td=$Tb+$Tc;$TJ=$Tc-$Tb;$To=+HEAPF64[$2+($5<<2<<3)>>3];$Tp=+HEAPF64[$2+(($5*7|0)<<3)>>3];$Tq=$To-$Tp;$TO=$To+$Tp;$Tr=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Ts=+HEAPF64[$2+(($5*6|0)<<3)>>3];$Tt=$Tr-$Ts;$TP=$Tr+$Ts;$Te=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Tf=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Tg=$Te+$Tf;$TI=$Tf-$Te;HEAPF64[$3>>3]=$T1+$T4+$T7+$Ta+$Td+$Tg;HEAPF64[$4>>3]=$TM+$TR+$TN+$TQ+$TO+$TP;$Tx=.7557495743542583*$Tk+.5406408174555976*$Tn+(.28173255684142967*$Tq-.9096319953545183*$Tt)-.9898214418809327*$Tw;$Th=.8412535328311812*$Ta+$T1+(.41541501300188644*$Tg-.9594929736144974*$Td)+(-0.0-(.14231483827328514*$T7+.6548607339452851*$T4));HEAPF64[$3+(($6*7|0)<<3)>>3]=$Th-$Tx;HEAPF64[$3+($6<<2<<3)>>3]=$Th+$Tx;$TZ=.7557495743542583*$TG+.5406408174555976*$TH+(.28173255684142967*$TJ-.9096319953545183*$TI)-.9898214418809327*$TK;$T10=.8412535328311812*$TQ+$TM+(.41541501300188644*$TP-.9594929736144974*$TO)+(-0.0-(.14231483827328514*$TN+.6548607339452851*$TR));HEAPF64[$4+($6<<2<<3)>>3]=$TZ+$T10;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T10-$TZ;$TX=.9096319953545183*$TG+.7557495743542583*$TK+(-0.0-(.5406408174555976*$TI+.9898214418809327*$TJ))-.28173255684142967*$TH;$TY=.41541501300188644*$TR+$TM+(.8412535328311812*$TP-.14231483827328514*$TO)+(-0.0-(.9594929736144974*$TQ+.6548607339452851*$TN));HEAPF64[$4+($6<<1<<3)>>3]=$TX+$TY;HEAPF64[$4+(($6*9|0)<<3)>>3]=$TY-$TX;$Tz=.9096319953545183*$Tk+.7557495743542583*$Tw+(-0.0-(.5406408174555976*$Tt+.9898214418809327*$Tq))-.28173255684142967*$Tn;$Ty=.41541501300188644*$T4+$T1+(.8412535328311812*$Tg-.14231483827328514*$Td)+(-0.0-(.9594929736144974*$Ta+.6548607339452851*$T7));HEAPF64[$3+(($6*9|0)<<3)>>3]=$Ty-$Tz;HEAPF64[$3+($6<<1<<3)>>3]=$Ty+$Tz;$TB=.5406408174555976*$Tk+.9096319953545183*$Tw+(.9898214418809327*$Tn+.7557495743542583*$Tq)+.28173255684142967*$Tt;$TA=.8412535328311812*$T4+$T1+(.41541501300188644*$T7-.9594929736144974*$Tg)+(-0.0-(.6548607339452851*$Td+.14231483827328514*$Ta));HEAPF64[$3+(($6*10|0)<<3)>>3]=$TA-$TB;HEAPF64[$3+($6<<3)>>3]=$TA+$TB;$TV=.5406408174555976*$TG+.9096319953545183*$TK+(.9898214418809327*$TH+.7557495743542583*$TJ)+.28173255684142967*$TI;$TW=.8412535328311812*$TR+$TM+(.41541501300188644*$TN-.9594929736144974*$TP)+(-0.0-(.6548607339452851*$TO+.14231483827328514*$TQ));HEAPF64[$4+($6<<3)>>3]=$TV+$TW;HEAPF64[$4+(($6*10|0)<<3)>>3]=$TW-$TV;$TD=.9898214418809327*$Tk+.5406408174555976*$Tq+(.7557495743542583*$Tt-.9096319953545183*$Tn)-.28173255684142967*$Tw;$TC=.41541501300188644*$Ta+$T1+(.8412535328311812*$Td-.6548607339452851*$Tg)+(-0.0-(.9594929736144974*$T7+.14231483827328514*$T4));HEAPF64[$3+($6<<3<<3)>>3]=$TC-$TD;HEAPF64[$3+(($6*3|0)<<3)>>3]=$TC+$TD;$TT=.9898214418809327*$TG+.5406408174555976*$TJ+(.7557495743542583*$TI-.9096319953545183*$TH)-.28173255684142967*$TK;$TU=.41541501300188644*$TQ+$TM+(.8412535328311812*$TO-.6548607339452851*$TP)+(-0.0-(.9594929736144974*$TN+.14231483827328514*$TR));HEAPF64[$4+(($6*3|0)<<3)>>3]=$TT+$TU;HEAPF64[$4+($6<<3<<3)>>3]=$TU-$TT;$TL=.28173255684142967*$TG+.7557495743542583*$TH+(.9898214418809327*$TI-.9096319953545183*$TJ)-.5406408174555976*$TK;$TS=.8412535328311812*$TN+$TM+(.41541501300188644*$TO-.14231483827328514*$TP)+(-0.0-(.6548607339452851*$TQ+.9594929736144974*$TR));HEAPF64[$4+(($6*5|0)<<3)>>3]=$TL+$TS;HEAPF64[$4+(($6*6|0)<<3)>>3]=$TS-$TL;$TF=.28173255684142967*$Tk+.7557495743542583*$Tn+(.9898214418809327*$Tt-.9096319953545183*$Tq)-.5406408174555976*$Tw;$TE=.8412535328311812*$T7+$T1+(.41541501300188644*$Td-.14231483827328514*$Tg)+(-0.0-(.6548607339452851*$Ta+.9594929736144974*$T4));HEAPF64[$3+(($6*6|0)<<3)>>3]=$TE-$TF;HEAPF64[$3+(($6*5|0)<<3)>>3]=$TE+$TF;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_12($p){$p=$p|0;_fftw_kdft_register($p,338,9960);return}function _n1_12($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T5=0.0,$TR=0.0,$TA=0.0,$Ts=0.0,$TS=0.0,$Tz=0.0,$Ta=0.0,$TU=0.0,$TD=0.0,$Tx=0.0,$TV=0.0,$TC=0.0,$Tg=0.0,$T1a=0.0,$TG=0.0,$TJ=0.0,$T1u=0.0,$T1d=0.0,$Tl=0.0,$T1f=0.0,$TL=0.0,$TO=0.0,$T1v=0.0,$T1i=0.0,$T1=0.0,$T2=0.0,$T3=0.0,$T4=0.0,$To=0.0,$Tp=0.0,$Tq=0.0,$Tr=0.0,$T6=0.0,$T7=0.0,$T8=0.0,$T9=0.0,$Tt=0.0,$Tu=0.0,$Tv=0.0,$Tw=0.0,$Tc=0.0,$Td=0.0,$Te=0.0,$Tf=0.0,$T1b=0.0,$TH=0.0,$TI=0.0,$T1c=0.0,$Th=0.0,$Ti=0.0,$Tj=0.0,$Tk=0.0,$T1g=0.0,$TM=0.0,$TN=0.0,$T1h=0.0,$Tb=0.0,$Tm=0.0,$T1t=0.0,$T1w=0.0,$T1x=0.0,$T1y=0.0,$Tn=0.0,$Ty=0.0,$T11=0.0,$T1l=0.0,$T1k=0.0,$T1m=0.0,$T14=0.0,$T18=0.0,$T17=0.0,$T19=0.0,$TZ=0.0,$T10=0.0,$T1e=0.0,$T1j=0.0,$T12=0.0,$T13=0.0,$T15=0.0,$T16=0.0,$TF=0.0,$T1r=0.0,$T1q=0.0,$T1s=0.0,$TQ=0.0,$TY=0.0,$TX=0.0,$T1n=0.0,$TB=0.0,$TE=0.0,$T1o=0.0,$T1p=0.0,$TK=0.0,$TP=0.0,$TT=0.0,$TW=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<2<<3)>>3];$T3=+HEAPF64[$1+($5<<3<<3)>>3];$T4=$T2+$T3;$T5=$T1+$T4;$TR=$T1-.5*$T4;$TA=($T3-$T2)*.8660254037844386;$To=+HEAPF64[$2>>3];$Tp=+HEAPF64[$2+($5<<2<<3)>>3];$Tq=+HEAPF64[$2+($5<<3<<3)>>3];$Tr=$Tp+$Tq;$Ts=$To+$Tr;$TS=($Tp-$Tq)*.8660254037844386;$Tz=$To-.5*$Tr;$T6=+HEAPF64[$1+(($5*6|0)<<3)>>3];$T7=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T8=+HEAPF64[$1+($5<<1<<3)>>3];$T9=$T7+$T8;$Ta=$T6+$T9;$TU=$T6-.5*$T9;$TD=($T8-$T7)*.8660254037844386;$Tt=+HEAPF64[$2+(($5*6|0)<<3)>>3];$Tu=+HEAPF64[$2+(($5*10|0)<<3)>>3];$Tv=+HEAPF64[$2+($5<<1<<3)>>3];$Tw=$Tu+$Tv;$Tx=$Tt+$Tw;$TV=($Tu-$Tv)*.8660254037844386;$TC=$Tt-.5*$Tw;$Tc=+HEAPF64[$1+(($5*3|0)<<3)>>3];$Td=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Te=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Tf=$Td+$Te;$Tg=$Tc+$Tf;$T1a=($Te-$Td)*.8660254037844386;$TG=$Tc-.5*$Tf;$T1b=+HEAPF64[$2+(($5*3|0)<<3)>>3];$TH=+HEAPF64[$2+(($5*7|0)<<3)>>3];$TI=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T1c=$TH+$TI;$TJ=($TH-$TI)*.8660254037844386;$T1u=$T1b+$T1c;$T1d=$T1b-.5*$T1c;$Th=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Ti=+HEAPF64[$1+($5<<3)>>3];$Tj=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Tk=$Ti+$Tj;$Tl=$Th+$Tk;$T1f=($Tj-$Ti)*.8660254037844386;$TL=$Th-.5*$Tk;$T1g=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TM=+HEAPF64[$2+($5<<3)>>3];$TN=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T1h=$TM+$TN;$TO=($TM-$TN)*.8660254037844386;$T1v=$T1g+$T1h;$T1i=$T1g-.5*$T1h;$Tb=$T5+$Ta;$Tm=$Tg+$Tl;HEAPF64[$3+(($6*6|0)<<3)>>3]=$Tb-$Tm;HEAPF64[$3>>3]=$Tb+$Tm;$T1x=$Ts+$Tx;$T1y=$T1u+$T1v;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T1x-$T1y;HEAPF64[$4>>3]=$T1x+$T1y;$Tn=$Tg-$Tl;$Ty=$Ts-$Tx;HEAPF64[$4+(($6*3|0)<<3)>>3]=$Tn+$Ty;HEAPF64[$4+(($6*9|0)<<3)>>3]=$Ty-$Tn;$T1t=$T5-$Ta;$T1w=$T1u-$T1v;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T1t-$T1w;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T1t+$T1w;$TZ=$TA+$Tz;$T10=$TD+$TC;$T11=$TZ-$T10;$T1l=$TZ+$T10;$T1e=$T1a+$T1d;$T1j=$T1f+$T1i;$T1k=$T1e-$T1j;$T1m=$T1e+$T1j;$T12=$TG+$TJ;$T13=$TL+$TO;$T14=$T12-$T13;$T18=$T12+$T13;$T15=$TR+$TS;$T16=$TU+$TV;$T17=$T15+$T16;$T19=$T15-$T16;HEAPF64[$4+($6<<3)>>3]=$T11-$T14;HEAPF64[$3+($6<<3)>>3]=$T19+$T1k;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T11+$T14;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T19-$T1k;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T17-$T18;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T1l-$T1m;HEAPF64[$3+($6<<2<<3)>>3]=$T17+$T18;HEAPF64[$4+($6<<2<<3)>>3]=$T1l+$T1m;$TB=$Tz-$TA;$TE=$TC-$TD;$TF=$TB-$TE;$T1r=$TB+$TE;$T1o=$T1d-$T1a;$T1p=$T1i-$T1f;$T1q=$T1o-$T1p;$T1s=$T1o+$T1p;$TK=$TG-$TJ;$TP=$TL-$TO;$TQ=$TK-$TP;$TY=$TK+$TP;$TT=$TR-$TS;$TW=$TU-$TV;$TX=$TT+$TW;$T1n=$TT-$TW;HEAPF64[$4+(($6*5|0)<<3)>>3]=$TF-$TQ;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T1n+$T1q;HEAPF64[$4+(($6*11|0)<<3)>>3]=$TF+$TQ;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T1n-$T1q;HEAPF64[$3+($6<<1<<3)>>3]=$TX-$TY;HEAPF64[$4+($6<<1<<3)>>3]=$T1r-$T1s;HEAPF64[$3+($6<<3<<3)>>3]=$TX+$TY;HEAPF64[$4+($6<<3<<3)>>3]=$T1r+$T1s;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_13($p){$p=$p|0;_fftw_kdft_register($p,340,9896);return}function _n1_13($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$T1q=0.0,$Tt=0.0,$Tu=0.0,$To=0.0,$T22=0.0,$T20=0.0,$T24=0.0,$TF=0.0,$TH=0.0,$TA=0.0,$TI=0.0,$T1X=0.0,$T25=0.0,$T2a=0.0,$T2d=0.0,$T18=0.0,$T1n=0.0,$T2k=0.0,$T2n=0.0,$T1l=0.0,$T1r=0.0,$T1f=0.0,$T1o=0.0,$T2h=0.0,$T2m=0.0,$Tf=0.0,$Tp=0.0,$Tb=0.0,$TC=0.0,$Tx=0.0,$T6=0.0,$TB=0.0,$Tw=0.0,$Ti=0.0,$Tq=0.0,$Tl=0.0,$Tr=0.0,$Tm=0.0,$Ts=0.0,$Td=0.0,$Te=0.0,$Tc=0.0,$Tn=0.0,$T7=0.0,$T8=0.0,$T9=0.0,$Ta=0.0,$T2=0.0,$T3=0.0,$T4=0.0,$T5=0.0,$Tg=0.0,$Th=0.0,$Tj=0.0,$Tk=0.0,$T1Y=0.0,$T1Z=0.0,$TD=0.0,$TE=0.0,$Ty=0.0,$Tz=0.0,$T1V=0.0,$T1W=0.0,$TZ=0.0,$T2b=0.0,$TV=0.0,$T1i=0.0,$T1a=0.0,$TQ=0.0,$T1h=0.0,$T19=0.0,$T12=0.0,$T1d=0.0,$T15=0.0,$T1c=0.0,$T16=0.0,$T2c=0.0,$TX=0.0,$TY=0.0,$TW=0.0,$T17=0.0,$TR=0.0,$TS=0.0,$TT=0.0,$TU=0.0,$TM=0.0,$TN=0.0,$TO=0.0,$TP=0.0,$T10=0.0,$T11=0.0,$T13=0.0,$T14=0.0,$T2i=0.0,$T2j=0.0,$T1j=0.0,$T1k=0.0,$T1b=0.0,$T1e=0.0,$T2f=0.0,$T2g=0.0,$T1D=0.0,$T1N=0.0,$T1y=0.0,$T1x=0.0,$T1E=0.0,$T1O=0.0,$Tv=0.0,$TK=0.0,$T1J=0.0,$T1Q=0.0,$T1m=0.0,$T1R=0.0,$T1t=0.0,$T1I=0.0,$TG=0.0,$TJ=0.0,$T1B=0.0,$T1C=0.0,$T1v=0.0,$T1w=0.0,$T1g=0.0,$T1H=0.0,$T1p=0.0,$T1s=0.0,$T1G=0.0,$TL=0.0,$T1u=0.0,$T1P=0.0,$T1S=0.0,$T1z=0.0,$T1A=0.0,$T1T=0.0,$T1U=0.0,$T1L=0.0,$T1M=0.0,$T1F=0.0,$T1K=0.0,$T2y=0.0,$T2I=0.0,$T2J=0.0,$T2K=0.0,$T2B=0.0,$T2L=0.0,$T2e=0.0,$T2p=0.0,$T2u=0.0,$T2G=0.0,$T23=0.0,$T2F=0.0,$T28=0.0,$T2t=0.0,$T2l=0.0,$T2o=0.0,$T2w=0.0,$T2x=0.0,$T2z=0.0,$T2A=0.0,$T21=0.0,$T2r=0.0,$T26=0.0,$T27=0.0,$T2s=0.0,$T29=0.0,$T2q=0.0,$T2N=0.0,$T2O=0.0,$T2v=0.0,$T2C=0.0,$T2P=0.0,$T2Q=0.0,$T2H=0.0,$T2M=0.0,$T2D=0.0,$T2E=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T1q=+HEAPF64[$2>>3];$Td=+HEAPF64[$1+($5<<3<<3)>>3];$Te=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Tf=$Td+$Te;$Tp=$Td-$Te;$T7=+HEAPF64[$1+(($5*12|0)<<3)>>3];$T8=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T9=+HEAPF64[$1+($5<<2<<3)>>3];$Ta=$T8+$T9;$Tb=$T7+$Ta;$TC=$T8-$T9;$Tx=$T7-.5*$Ta;$T2=+HEAPF64[$1+($5<<3)>>3];$T3=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T4=+HEAPF64[$1+(($5*9|0)<<3)>>3];$T5=$T3+$T4;$T6=$T2+$T5;$TB=$T3-$T4;$Tw=$T2-.5*$T5;$Tg=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Th=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Ti=$Tg+$Th;$Tq=$Tg-$Th;$Tj=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Tk=+HEAPF64[$1+($5<<1<<3)>>3];$Tl=$Tj+$Tk;$Tr=$Tj-$Tk;$Tm=$Ti+$Tl;$Ts=$Tq+$Tr;$Tt=$Tp+$Ts;$Tu=$T6-$Tb;$Tc=$T6+$Tb;$Tn=$Tf+$Tm;$To=$Tc+$Tn;$T22=($Tc-$Tn)*.3004626062886658;$T1Y=$TB+$TC;$T1Z=$Tq-$Tr;$T20=$T1Y-$T1Z;$T24=$T1Y+$T1Z;$TD=($TB-$TC)*.8660254037844386;$TE=$Tp-.5*$Ts;$TF=$TD-$TE;$TH=$TD+$TE;$Ty=$Tw-$Tx;$Tz=($Ti-$Tl)*.8660254037844386;$TA=$Ty+$Tz;$TI=$Ty-$Tz;$T1V=$Tw+$Tx;$T1W=$Tf-.5*$Tm;$T1X=$T1V-$T1W;$T25=$T1V+$T1W;$TX=+HEAPF64[$2+($5<<3<<3)>>3];$TY=+HEAPF64[$2+(($5*5|0)<<3)>>3];$TZ=$TX+$TY;$T2b=$TX-$TY;$TR=+HEAPF64[$2+(($5*12|0)<<3)>>3];$TS=+HEAPF64[$2+(($5*10|0)<<3)>>3];$TT=+HEAPF64[$2+($5<<2<<3)>>3];$TU=$TS+$TT;$TV=$TR-.5*$TU;$T1i=$TR+$TU;$T1a=$TS-$TT;$TM=+HEAPF64[$2+($5<<3)>>3];$TN=+HEAPF64[$2+(($5*3|0)<<3)>>3];$TO=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TP=$TN+$TO;$TQ=$TM-.5*$TP;$T1h=$TM+$TP;$T19=$TN-$TO;$T10=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T11=+HEAPF64[$2+(($5*6|0)<<3)>>3];$T12=$T10+$T11;$T1d=$T10-$T11;$T13=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T14=+HEAPF64[$2+($5<<1<<3)>>3];$T15=$T13+$T14;$T1c=$T13-$T14;$T16=$T12+$T15;$T2c=$T1d+$T1c;$T2a=$T1h-$T1i;$T2d=$T2b+$T2c;$TW=$TQ+$TV;$T17=$TZ-.5*$T16;$T18=$TW-$T17;$T1n=$TW+$T17;$T2i=$TQ-$TV;$T2j=($T15-$T12)*.8660254037844386;$T2k=$T2i+$T2j;$T2n=$T2i-$T2j;$T1j=$T1h+$T1i;$T1k=$TZ+$T16;$T1l=($T1j-$T1k)*.3004626062886658;$T1r=$T1j+$T1k;$T1b=$T19+$T1a;$T1e=$T1c-$T1d;$T1f=$T1b+$T1e;$T1o=$T1e-$T1b;$T2f=$T2b-.5*$T2c;$T2g=($T1a-$T19)*.8660254037844386;$T2h=$T2f-$T2g;$T2m=$T2g+$T2f;HEAPF64[$3>>3]=$T1+$To;HEAPF64[$4>>3]=$T1q+$T1r;$T1B=.3873905854676173*$T1f+.2659662492148373*$T18;$T1C=.1138544790557908*$T1o+.5035370328637666*$T1n;$T1D=$T1B+$T1C;$T1N=$T1C-$T1B;$T1y=.5751407294740031*$Tu+.1741386011521359*$Tt;$T1v=.2562476715829366*$TI-.15689139105158462*$TH;$T1w=.01159910560576829*$TF+.30023863596633266*$TA;$T1x=$T1v-$T1w;$T1E=$T1y+$T1x;$T1O=($T1v+$T1w)*1.7320508075688772;$Tv=.5751407294740031*$Tt-.1741386011521359*$Tu;$TG=.01159910560576829*$TA-.30023863596633266*$TF;$TJ=.2562476715829366*$TH+.15689139105158462*$TI;$TK=$TG-$TJ;$T1J=($TJ+$TG)*1.7320508075688772;$T1Q=$Tv-$TK;$T1g=.25826039031174486*$T18-.13298312460741865*$T1f;$T1H=$T1l-$T1g;$T1p=.07590298603719386*$T1n-.2517685164318833*$T1o;$T1s=$T1q-.08333333333333333*$T1r;$T1G=$T1s-$T1p;$T1m=2.0*$T1g+$T1l;$T1R=$T1H+$T1G;$T1t=2.0*$T1p+$T1s;$T1I=$T1G-$T1H;$TL=2.0*$TK+$Tv;$T1u=$T1m+$T1t;HEAPF64[$4+($6<<3)>>3]=$TL+$T1u;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T1u-$TL;$T1z=2.0*$T1x-$T1y;$T1A=$T1t-$T1m;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T1z+$T1A;HEAPF64[$4+($6<<3<<3)>>3]=$T1A-$T1z;$T1T=$T1R-$T1Q;$T1U=$T1O+$T1N;HEAPF64[$4+($6<<2<<3)>>3]=$T1T-$T1U;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T1U+$T1T;$T1P=$T1N-$T1O;$T1S=$T1Q+$T1R;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T1P+$T1S;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T1S-$T1P;$T1L=$T1J+$T1I;$T1M=$T1E+$T1D;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T1L-$T1M;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T1M+$T1L;$T1F=$T1D-$T1E;$T1K=$T1I-$T1J;HEAPF64[$4+($6<<1<<3)>>3]=$T1F+$T1K;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T1K-$T1F;$T2w=.3873905854676173*$T20+.2659662492148373*$T1X;$T2x=.1138544790557908*$T24-.5035370328637666*$T25;$T2y=$T2w+$T2x;$T2I=$T2w-$T2x;$T2J=.5751407294740031*$T2a+.1741386011521359*$T2d;$T2z=.01159910560576829*$T2m-.30023863596633266*$T2n;$T2A=.2562476715829366*$T2k-.15689139105158462*$T2h;$T2K=$T2z+$T2A;$T2B=($T2z-$T2A)*1.7320508075688772;$T2L=$T2J+$T2K;$T2e=.1741386011521359*$T2a-.5751407294740031*$T2d;$T2l=.2562476715829366*$T2h+.15689139105158462*$T2k;$T2o=.30023863596633266*$T2m+.01159910560576829*$T2n;$T2p=$T2l-$T2o;$T2u=$T2e-$T2p;$T2G=($T2o+$T2l)*1.7320508075688772;$T21=.25826039031174486*$T1X-.13298312460741865*$T20;$T2r=$T22-$T21;$T26=.2517685164318833*$T24+.07590298603719386*$T25;$T27=$T1-.08333333333333333*$To;$T2s=$T27-$T26;$T23=2.0*$T21+$T22;$T2F=$T2s-$T2r;$T28=2.0*$T26+$T27;$T2t=$T2r+$T2s;$T29=$T23+$T28;$T2q=2.0*$T2p+$T2e;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T29-$T2q;HEAPF64[$3+($6<<3)>>3]=$T29+$T2q;$T2v=$T2t-$T2u;$T2C=$T2y-$T2B;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T2v-$T2C;HEAPF64[$3+($6<<2<<3)>>3]=$T2v+$T2C;$T2P=$T28-$T23;$T2Q=2.0*$T2K-$T2J;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T2P-$T2Q;HEAPF64[$3+($6<<3<<3)>>3]=$T2P+$T2Q;$T2N=$T2F-$T2G;$T2O=$T2L-$T2I;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T2N-$T2O;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T2N+$T2O;$T2H=$T2F+$T2G;$T2M=$T2I+$T2L;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T2H-$T2M;HEAPF64[$3+($6<<1<<3)>>3]=$T2H+$T2M;$T2D=$T2t+$T2u;$T2E=$T2y+$T2B;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T2D-$T2E;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T2D+$T2E;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_14($p){$p=$p|0;_fftw_kdft_register($p,348,9832);return}function _n1_14($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T3=0.0,$Tp=0.0,$T16=0.0,$T1f=0.0,$Ta=0.0,$T1q=0.0,$Ts=0.0,$T10=0.0,$TG=0.0,$T1z=0.0,$T19=0.0,$T1i=0.0,$Th=0.0,$T1s=0.0,$Tv=0.0,$T12=0.0,$TU=0.0,$T1B=0.0,$T17=0.0,$T1o=0.0,$To=0.0,$T1r=0.0,$Ty=0.0,$T11=0.0,$TN=0.0,$T1A=0.0,$T18=0.0,$T1l=0.0,$T1=0.0,$T2=0.0,$T14=0.0,$T15=0.0,$T6=0.0,$Tq=0.0,$T9=0.0,$Tr=0.0,$T4=0.0,$T5=0.0,$T7=0.0,$T8=0.0,$TC=0.0,$T1g=0.0,$TF=0.0,$T1h=0.0,$TA=0.0,$TB=0.0,$TD=0.0,$TE=0.0,$Td=0.0,$Tt=0.0,$Tg=0.0,$Tu=0.0,$Tb=0.0,$Tc=0.0,$Te=0.0,$Tf=0.0,$TQ=0.0,$T1m=0.0,$TT=0.0,$T1n=0.0,$TO=0.0,$TP=0.0,$TR=0.0,$TS=0.0,$Tk=0.0,$Tw=0.0,$Tn=0.0,$Tx=0.0,$Ti=0.0,$Tj=0.0,$Tl=0.0,$Tm=0.0,$TJ=0.0,$T1j=0.0,$TM=0.0,$T1k=0.0,$TH=0.0,$TI=0.0,$TK=0.0,$TL=0.0,$TV=0.0,$Tz=0.0,$T1e=0.0,$T1d=0.0,$TX=0.0,$TW=0.0,$T1b=0.0,$T1c=0.0,$TZ=0.0,$TY=0.0,$T13=0.0,$T1a=0.0,$T1t=0.0,$T1p=0.0,$T1C=0.0,$T1y=0.0,$T1v=0.0,$T1u=0.0,$T1E=0.0,$T1D=0.0,$T1w=0.0,$T1x=0.0,$T1G=0.0,$T1F=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*7|0)<<3)>>3];$T3=$T1-$T2;$Tp=$T1+$T2;$T14=+HEAPF64[$2>>3];$T15=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T16=$T14-$T15;$T1f=$T14+$T15;$T4=+HEAPF64[$1+($5<<1<<3)>>3];$T5=+HEAPF64[$1+(($5*9|0)<<3)>>3];$T6=$T4-$T5;$Tq=$T4+$T5;$T7=+HEAPF64[$1+(($5*12|0)<<3)>>3];$T8=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T9=$T7-$T8;$Tr=$T7+$T8;$Ta=$T6+$T9;$T1q=$Tr-$Tq;$Ts=$Tq+$Tr;$T10=$T9-$T6;$TA=+HEAPF64[$2+($5<<1<<3)>>3];$TB=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TC=$TA-$TB;$T1g=$TA+$TB;$TD=+HEAPF64[$2+(($5*12|0)<<3)>>3];$TE=+HEAPF64[$2+(($5*5|0)<<3)>>3];$TF=$TD-$TE;$T1h=$TD+$TE;$TG=$TC-$TF;$T1z=$T1g-$T1h;$T19=$TC+$TF;$T1i=$T1g+$T1h;$Tb=+HEAPF64[$1+($5<<2<<3)>>3];$Tc=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Td=$Tb-$Tc;$Tt=$Tb+$Tc;$Te=+HEAPF64[$1+(($5*10|0)<<3)>>3];$Tf=+HEAPF64[$1+(($5*3|0)<<3)>>3];$Tg=$Te-$Tf;$Tu=$Te+$Tf;$Th=$Td+$Tg;$T1s=$Tt-$Tu;$Tv=$Tt+$Tu;$T12=$Tg-$Td;$TO=+HEAPF64[$2+($5<<2<<3)>>3];$TP=+HEAPF64[$2+(($5*11|0)<<3)>>3];$TQ=$TO-$TP;$T1m=$TO+$TP;$TR=+HEAPF64[$2+(($5*10|0)<<3)>>3];$TS=+HEAPF64[$2+(($5*3|0)<<3)>>3];$TT=$TR-$TS;$T1n=$TR+$TS;$TU=$TQ-$TT;$T1B=$T1n-$T1m;$T17=$TQ+$TT;$T1o=$T1m+$T1n;$Ti=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Tj=+HEAPF64[$1+(($5*13|0)<<3)>>3];$Tk=$Ti-$Tj;$Tw=$Ti+$Tj;$Tl=+HEAPF64[$1+($5<<3<<3)>>3];$Tm=+HEAPF64[$1+($5<<3)>>3];$Tn=$Tl-$Tm;$Tx=$Tl+$Tm;$To=$Tk+$Tn;$T1r=$Tw-$Tx;$Ty=$Tw+$Tx;$T11=$Tn-$Tk;$TH=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TI=+HEAPF64[$2+(($5*13|0)<<3)>>3];$TJ=$TH-$TI;$T1j=$TH+$TI;$TK=+HEAPF64[$2+($5<<3<<3)>>3];$TL=+HEAPF64[$2+($5<<3)>>3];$TM=$TK-$TL;$T1k=$TK+$TL;$TN=$TJ-$TM;$T1A=$T1k-$T1j;$T18=$TJ+$TM;$T1l=$T1j+$T1k;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T3+$Ta+$Th+$To;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T16+$T19+$T17+$T18;HEAPF64[$3>>3]=$Tp+$Ts+$Tv+$Ty;HEAPF64[$4>>3]=$T1f+$T1i+$T1o+$T1l;$TV=.9749279121818236*$TG-.7818314824680298*$TN-.4338837391175581*$TU;$Tz=.6234898018587335*$To+$T3+(-0.0-(.9009688679024191*$Th+.2225209339563144*$Ta));HEAPF64[$3+(($6*5|0)<<3)>>3]=$Tz-$TV;HEAPF64[$3+(($6*9|0)<<3)>>3]=$Tz+$TV;$T1e=.9749279121818236*$T10-.7818314824680298*$T11-.4338837391175581*$T12;$T1d=.6234898018587335*$T18+$T16+(-0.0-(.9009688679024191*$T17+.2225209339563144*$T19));HEAPF64[$4+(($6*5|0)<<3)>>3]=$T1d-$T1e;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T1e+$T1d;$TX=.7818314824680298*$TG+.9749279121818236*$TU+.4338837391175581*$TN;$TW=.6234898018587335*$Ta+$T3+(-0.0-(.9009688679024191*$To+.2225209339563144*$Th));HEAPF64[$3+(($6*13|0)<<3)>>3]=$TW-$TX;HEAPF64[$3+($6<<3)>>3]=$TW+$TX;$T1b=.7818314824680298*$T10+.9749279121818236*$T12+.4338837391175581*$T11;$T1c=.6234898018587335*$T19+$T16+(-0.0-(.9009688679024191*$T18+.2225209339563144*$T17));HEAPF64[$4+($6<<3)>>3]=$T1b+$T1c;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T1c-$T1b;$TZ=.4338837391175581*$TG+.9749279121818236*$TN-.7818314824680298*$TU;$TY=.6234898018587335*$Th+$T3+(-0.0-(.2225209339563144*$To+.9009688679024191*$Ta));HEAPF64[$3+(($6*11|0)<<3)>>3]=$TY-$TZ;HEAPF64[$3+(($6*3|0)<<3)>>3]=$TY+$TZ;$T13=.4338837391175581*$T10+.9749279121818236*$T11-.7818314824680298*$T12;$T1a=.6234898018587335*$T17+$T16+(-0.0-(.2225209339563144*$T18+.9009688679024191*$T19));HEAPF64[$4+(($6*3|0)<<3)>>3]=$T13+$T1a;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T1a-$T13;$T1t=.7818314824680298*$T1q-.4338837391175581*$T1r-.9749279121818236*$T1s;$T1p=.6234898018587335*$T1i+$T1f+(-0.0-(.9009688679024191*$T1l+.2225209339563144*$T1o));HEAPF64[$4+(($6*6|0)<<3)>>3]=$T1p-$T1t;HEAPF64[$4+($6<<3<<3)>>3]=$T1t+$T1p;$T1C=.7818314824680298*$T1z-.4338837391175581*$T1A-.9749279121818236*$T1B;$T1y=.6234898018587335*$Ts+$Tp+(-0.0-(.9009688679024191*$Ty+.2225209339563144*$Tv));HEAPF64[$3+(($6*6|0)<<3)>>3]=$T1y-$T1C;HEAPF64[$3+($6<<3<<3)>>3]=$T1y+$T1C;$T1v=.4338837391175581*$T1q+.7818314824680298*$T1s-.9749279121818236*$T1r;$T1u=.6234898018587335*$T1o+$T1f+(-0.0-(.2225209339563144*$T1l+.9009688679024191*$T1i));HEAPF64[$4+($6<<2<<3)>>3]=$T1u-$T1v;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T1v+$T1u;$T1E=.4338837391175581*$T1z+.7818314824680298*$T1B-.9749279121818236*$T1A;$T1D=.6234898018587335*$Tv+$Tp+(-0.0-(.2225209339563144*$Ty+.9009688679024191*$Ts));HEAPF64[$3+($6<<2<<3)>>3]=$T1D-$T1E;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T1D+$T1E;$T1w=.9749279121818236*$T1q+.4338837391175581*$T1s+.7818314824680298*$T1r;$T1x=.6234898018587335*$T1l+$T1f+(-0.0-(.9009688679024191*$T1o+.2225209339563144*$T1i));HEAPF64[$4+($6<<1<<3)>>3]=$T1w+$T1x;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T1x-$T1w;$T1G=.9749279121818236*$T1z+.4338837391175581*$T1B+.7818314824680298*$T1A;$T1F=.6234898018587335*$Ty+$Tp+(-0.0-(.9009688679024191*$Tv+.2225209339563144*$Ts));HEAPF64[$3+(($6*12|0)<<3)>>3]=$T1F-$T1G;HEAPF64[$3+($6<<1<<3)>>3]=$T1F+$T1G;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_15($p){$p=$p|0;_fftw_kdft_register($p,350,9768);return}function _n1_15($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T5=0.0,$T2l=0.0,$Tx=0.0,$TV=0.0,$T1C=0.0,$T20=0.0,$Tl=0.0,$Tq=0.0,$Tr=0.0,$TN=0.0,$TS=0.0,$TT=0.0,$T2c=0.0,$T2d=0.0,$T2n=0.0,$T1O=0.0,$T1P=0.0,$T22=0.0,$T1l=0.0,$T1q=0.0,$T1w=0.0,$TZ=0.0,$T10=0.0,$T11=0.0,$Ta=0.0,$Tf=0.0,$Tg=0.0,$TC=0.0,$TH=0.0,$TI=0.0,$T2f=0.0,$T2g=0.0,$T2m=0.0,$T1R=0.0,$T1S=0.0,$T21=0.0,$T1a=0.0,$T1f=0.0,$T1v=0.0,$TW=0.0,$TX=0.0,$TY=0.0,$T1=0.0,$T1z=0.0,$T4=0.0,$T1y=0.0,$Tw=0.0,$T1A=0.0,$Tt=0.0,$T1B=0.0,$T2=0.0,$T3=0.0,$Tu=0.0,$Tv=0.0,$Th=0.0,$Tk=0.0,$TJ=0.0,$T1h=0.0,$T1i=0.0,$T1j=0.0,$TM=0.0,$T1k=0.0,$Tm=0.0,$Tp=0.0,$TO=0.0,$T1m=0.0,$T1n=0.0,$T1o=0.0,$TR=0.0,$T1p=0.0,$Ti=0.0,$Tj=0.0,$TK=0.0,$TL=0.0,$Tn=0.0,$To=0.0,$TP=0.0,$TQ=0.0,$T6=0.0,$T9=0.0,$Ty=0.0,$T16=0.0,$T17=0.0,$T18=0.0,$TB=0.0,$T19=0.0,$Tb=0.0,$Te=0.0,$TD=0.0,$T1b=0.0,$T1c=0.0,$T1d=0.0,$TG=0.0,$T1e=0.0,$T7=0.0,$T8=0.0,$Tz=0.0,$TA=0.0,$Tc=0.0,$Td=0.0,$TE=0.0,$TF=0.0,$T2a=0.0,$Ts=0.0,$T29=0.0,$T2i=0.0,$T2k=0.0,$T2e=0.0,$T2h=0.0,$T2j=0.0,$T2b=0.0,$T2q=0.0,$T2o=0.0,$T2p=0.0,$T2u=0.0,$T2w=0.0,$T2s=0.0,$T2t=0.0,$T2v=0.0,$T2r=0.0,$T1M=0.0,$TU=0.0,$T1L=0.0,$T1U=0.0,$T1W=0.0,$T1Q=0.0,$T1T=0.0,$T1V=0.0,$T1N=0.0,$T25=0.0,$T23=0.0,$T24=0.0,$T1Z=0.0,$T28=0.0,$T1X=0.0,$T1Y=0.0,$T27=0.0,$T26=0.0,$T1x=0.0,$T1D=0.0,$T1E=0.0,$T1I=0.0,$T1J=0.0,$T1G=0.0,$T1H=0.0,$T1K=0.0,$T1F=0.0,$T13=0.0,$T12=0.0,$T14=0.0,$T1s=0.0,$T1u=0.0,$T1g=0.0,$T1r=0.0,$T1t=0.0,$T15=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T1z=+HEAPF64[$2>>3];$T2=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T3=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T4=$T2+$T3;$T1y=($T3-$T2)*.8660254037844386;$Tu=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Tv=+HEAPF64[$2+(($5*10|0)<<3)>>3];$Tw=($Tu-$Tv)*.8660254037844386;$T1A=$Tu+$Tv;$T5=$T1+$T4;$T2l=$T1z+$T1A;$Tt=$T1-.5*$T4;$Tx=$Tt-$Tw;$TV=$Tt+$Tw;$T1B=$T1z-.5*$T1A;$T1C=$T1y+$T1B;$T20=$T1B-$T1y;$Th=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Ti=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Tj=+HEAPF64[$1+($5<<3)>>3];$Tk=$Ti+$Tj;$TJ=$Th-.5*$Tk;$T1h=($Tj-$Ti)*.8660254037844386;$T1i=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TK=+HEAPF64[$2+(($5*11|0)<<3)>>3];$TL=+HEAPF64[$2+($5<<3)>>3];$T1j=$TK+$TL;$TM=($TK-$TL)*.8660254037844386;$T1k=$T1i-.5*$T1j;$Tm=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Tn=+HEAPF64[$1+(($5*14|0)<<3)>>3];$To=+HEAPF64[$1+($5<<2<<3)>>3];$Tp=$Tn+$To;$TO=$Tm-.5*$Tp;$T1m=($To-$Tn)*.8660254037844386;$T1n=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TP=+HEAPF64[$2+(($5*14|0)<<3)>>3];$TQ=+HEAPF64[$2+($5<<2<<3)>>3];$T1o=$TP+$TQ;$TR=($TP-$TQ)*.8660254037844386;$T1p=$T1n-.5*$T1o;$Tl=$Th+$Tk;$Tq=$Tm+$Tp;$Tr=$Tl+$Tq;$TN=$TJ-$TM;$TS=$TO-$TR;$TT=$TN+$TS;$T2c=$T1i+$T1j;$T2d=$T1n+$T1o;$T2n=$T2c+$T2d;$T1O=$T1k-$T1h;$T1P=$T1p-$T1m;$T22=$T1O+$T1P;$T1l=$T1h+$T1k;$T1q=$T1m+$T1p;$T1w=$T1l+$T1q;$TZ=$TJ+$TM;$T10=$TO+$TR;$T11=$TZ+$T10;$T6=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T7=+HEAPF64[$1+($5<<3<<3)>>3];$T8=+HEAPF64[$1+(($5*13|0)<<3)>>3];$T9=$T7+$T8;$Ty=$T6-.5*$T9;$T16=($T8-$T7)*.8660254037844386;$T17=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tz=+HEAPF64[$2+($5<<3<<3)>>3];$TA=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T18=$Tz+$TA;$TB=($Tz-$TA)*.8660254037844386;$T19=$T17-.5*$T18;$Tb=+HEAPF64[$1+(($5*12|0)<<3)>>3];$Tc=+HEAPF64[$1+($5<<1<<3)>>3];$Td=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Te=$Tc+$Td;$TD=$Tb-.5*$Te;$T1b=($Td-$Tc)*.8660254037844386;$T1c=+HEAPF64[$2+(($5*12|0)<<3)>>3];$TE=+HEAPF64[$2+($5<<1<<3)>>3];$TF=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T1d=$TE+$TF;$TG=($TE-$TF)*.8660254037844386;$T1e=$T1c-.5*$T1d;$Ta=$T6+$T9;$Tf=$Tb+$Te;$Tg=$Ta+$Tf;$TC=$Ty-$TB;$TH=$TD-$TG;$TI=$TC+$TH;$T2f=$T17+$T18;$T2g=$T1c+$T1d;$T2m=$T2f+$T2g;$T1R=$T19-$T16;$T1S=$T1e-$T1b;$T21=$T1R+$T1S;$T1a=$T16+$T19;$T1f=$T1b+$T1e;$T1v=$T1a+$T1f;$TW=$Ty+$TB;$TX=$TD+$TG;$TY=$TW+$TX;$T2a=($Tg-$Tr)*.5590169943749475;$Ts=$Tg+$Tr;$T29=$T5-.25*$Ts;$T2e=$T2c-$T2d;$T2h=$T2f-$T2g;$T2i=.9510565162951535*$T2e-.5877852522924731*$T2h;$T2k=.9510565162951535*$T2h+.5877852522924731*$T2e;HEAPF64[$3>>3]=$T5+$Ts;$T2j=$T2a+$T29;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T2j-$T2k;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T2j+$T2k;$T2b=$T29-$T2a;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T2b-$T2i;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T2b+$T2i;$T2q=($T2m-$T2n)*.5590169943749475;$T2o=$T2m+$T2n;$T2p=$T2l-.25*$T2o;$T2s=$Tl-$Tq;$T2t=$Ta-$Tf;$T2u=.9510565162951535*$T2s-.5877852522924731*$T2t;$T2w=.9510565162951535*$T2t+.5877852522924731*$T2s;HEAPF64[$4>>3]=$T2l+$T2o;$T2v=$T2q+$T2p;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T2v-$T2w;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T2w+$T2v;$T2r=$T2p-$T2q;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T2r-$T2u;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T2u+$T2r;$T1M=($TI-$TT)*.5590169943749475;$TU=$TI+$TT;$T1L=$Tx-.25*$TU;$T1Q=$T1O-$T1P;$T1T=$T1R-$T1S;$T1U=.9510565162951535*$T1Q-.5877852522924731*$T1T;$T1W=.9510565162951535*$T1T+.5877852522924731*$T1Q;HEAPF64[$3+(($6*5|0)<<3)>>3]=$Tx+$TU;$T1V=$T1M+$T1L;HEAPF64[$3+(($6*14|0)<<3)>>3]=$T1V-$T1W;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T1V+$T1W;$T1N=$T1L-$T1M;HEAPF64[$3+($6<<1<<3)>>3]=$T1N-$T1U;HEAPF64[$3+($6<<3<<3)>>3]=$T1N+$T1U;$T25=($T21-$T22)*.5590169943749475;$T23=$T21+$T22;$T24=$T20-.25*$T23;$T1X=$TN-$TS;$T1Y=$TC-$TH;$T1Z=.9510565162951535*$T1X-.5877852522924731*$T1Y;$T28=.9510565162951535*$T1Y+.5877852522924731*$T1X;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T20+$T23;$T27=$T25+$T24;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T27-$T28;HEAPF64[$4+(($6*14|0)<<3)>>3]=$T28+$T27;$T26=$T24-$T25;HEAPF64[$4+($6<<1<<3)>>3]=$T1Z+$T26;HEAPF64[$4+($6<<3<<3)>>3]=$T26-$T1Z;$T1x=($T1v-$T1w)*.5590169943749475;$T1D=$T1v+$T1w;$T1E=$T1C-.25*$T1D;$T1G=$TW-$TX;$T1H=$TZ-$T10;$T1I=.9510565162951535*$T1G+.5877852522924731*$T1H;$T1J=.9510565162951535*$T1H-.5877852522924731*$T1G;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T1C+$T1D;$T1K=$T1E-$T1x;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T1J+$T1K;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T1K-$T1J;$T1F=$T1x+$T1E;HEAPF64[$4+($6<<3)>>3]=$T1F-$T1I;HEAPF64[$4+($6<<2<<3)>>3]=$T1I+$T1F;$T13=($TY-$T11)*.5590169943749475;$T12=$TY+$T11;$T14=$TV-.25*$T12;$T1g=$T1a-$T1f;$T1r=$T1l-$T1q;$T1s=.9510565162951535*$T1g+.5877852522924731*$T1r;$T1u=.9510565162951535*$T1r-.5877852522924731*$T1g;HEAPF64[$3+(($6*10|0)<<3)>>3]=$TV+$T12;$T1t=$T14-$T13;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T1t-$T1u;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T1t+$T1u;$T15=$T13+$T14;HEAPF64[$3+($6<<2<<3)>>3]=$T15-$T1s;HEAPF64[$3+($6<<3)>>3]=$T15+$T1s;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_16($p){$p=$p|0;_fftw_kdft_register($p,346,9704);return}function _n1_16($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T7=0.0,$T1R=0.0,$T25=0.0,$TC=0.0,$TN=0.0,$T1x=0.0,$T1H=0.0,$T1l=0.0,$Tt=0.0,$T22=0.0,$T2h=0.0,$T1b=0.0,$T1g=0.0,$T1E=0.0,$T1Z=0.0,$T1D=0.0,$Te=0.0,$T1S=0.0,$T26=0.0,$TJ=0.0,$TQ=0.0,$T1m=0.0,$T1n=0.0,$TT=0.0,$Tm=0.0,$T1X=0.0,$T2g=0.0,$T10=0.0,$T15=0.0,$T1B=0.0,$T1U=0.0,$T1A=0.0,$T3=0.0,$TL=0.0,$Ty=0.0,$T1k=0.0,$T6=0.0,$T1j=0.0,$TB=0.0,$TM=0.0,$T1=0.0,$T2=0.0,$Tw=0.0,$Tx=0.0,$T4=0.0,$T5=0.0,$Tz=0.0,$TA=0.0,$Tp=0.0,$T17=0.0,$T1f=0.0,$T20=0.0,$Ts=0.0,$T1c=0.0,$T1a=0.0,$T21=0.0,$Tn=0.0,$To=0.0,$T1d=0.0,$T1e=0.0,$Tq=0.0,$Tr=0.0,$T18=0.0,$T19=0.0,$Ta=0.0,$TP=0.0,$TF=0.0,$TO=0.0,$Td=0.0,$TR=0.0,$TI=0.0,$TS=0.0,$T8=0.0,$T9=0.0,$TD=0.0,$TE=0.0,$Tb=0.0,$Tc=0.0,$TG=0.0,$TH=0.0,$Ti=0.0,$T11=0.0,$TZ=0.0,$T1V=0.0,$Tl=0.0,$TW=0.0,$T14=0.0,$T1W=0.0,$Tg=0.0,$Th=0.0,$TX=0.0,$TY=0.0,$Tj=0.0,$Tk=0.0,$T12=0.0,$T13=0.0,$Tf=0.0,$Tu=0.0,$T2j=0.0,$T2k=0.0,$Tv=0.0,$TK=0.0,$T2f=0.0,$T2i=0.0,$T1T=0.0,$T27=0.0,$T24=0.0,$T28=0.0,$T1Y=0.0,$T23=0.0,$T29=0.0,$T2d=0.0,$T2c=0.0,$T2e=0.0,$T2a=0.0,$T2b=0.0,$TV=0.0,$T1r=0.0,$T1p=0.0,$T1v=0.0,$T1i=0.0,$T1q=0.0,$T1u=0.0,$T1w=0.0,$TU=0.0,$T1o=0.0,$T16=0.0,$T1h=0.0,$T1s=0.0,$T1t=0.0,$T1z=0.0,$T1L=0.0,$T1J=0.0,$T1P=0.0,$T1G=0.0,$T1K=0.0,$T1O=0.0,$T1Q=0.0,$T1y=0.0,$T1I=0.0,$T1C=0.0,$T1F=0.0,$T1M=0.0,$T1N=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<3<<3)>>3];$T3=$T1+$T2;$TL=$T1-$T2;$Tw=+HEAPF64[$2>>3];$Tx=+HEAPF64[$2+($5<<3<<3)>>3];$Ty=$Tw+$Tx;$T1k=$Tw-$Tx;$T4=+HEAPF64[$1+($5<<2<<3)>>3];$T5=+HEAPF64[$1+(($5*12|0)<<3)>>3];$T6=$T4+$T5;$T1j=$T4-$T5;$Tz=+HEAPF64[$2+($5<<2<<3)>>3];$TA=+HEAPF64[$2+(($5*12|0)<<3)>>3];$TB=$Tz+$TA;$TM=$Tz-$TA;$T7=$T3+$T6;$T1R=$T3-$T6;$T25=$Ty-$TB;$TC=$Ty+$TB;$TN=$TL-$TM;$T1x=$TL+$TM;$T1H=$T1k-$T1j;$T1l=$T1j+$T1k;$Tn=+HEAPF64[$1+(($5*15|0)<<3)>>3];$To=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Tp=$Tn+$To;$T17=$Tn-$To;$T1d=+HEAPF64[$2+(($5*15|0)<<3)>>3];$T1e=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T1f=$T1d-$T1e;$T20=$T1d+$T1e;$Tq=+HEAPF64[$1+(($5*3|0)<<3)>>3];$Tr=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Ts=$Tq+$Tr;$T1c=$Tq-$Tr;$T18=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T19=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T1a=$T18-$T19;$T21=$T18+$T19;$Tt=$Tp+$Ts;$T22=$T20-$T21;$T2h=$T20+$T21;$T1b=$T17-$T1a;$T1g=$T1c+$T1f;$T1E=$T1f-$T1c;$T1Z=$Tp-$Ts;$T1D=$T17+$T1a;$T8=+HEAPF64[$1+($5<<1<<3)>>3];$T9=+HEAPF64[$1+(($5*10|0)<<3)>>3];$Ta=$T8+$T9;$TP=$T8-$T9;$TD=+HEAPF64[$2+($5<<1<<3)>>3];$TE=+HEAPF64[$2+(($5*10|0)<<3)>>3];$TF=$TD+$TE;$TO=$TD-$TE;$Tb=+HEAPF64[$1+(($5*14|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Td=$Tb+$Tc;$TR=$Tb-$Tc;$TG=+HEAPF64[$2+(($5*14|0)<<3)>>3];$TH=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TI=$TG+$TH;$TS=$TG-$TH;$Te=$Ta+$Td;$T1S=$TF-$TI;$T26=$Td-$Ta;$TJ=$TF+$TI;$TQ=$TO-$TP;$T1m=$TR-$TS;$T1n=$TP+$TO;$TT=$TR+$TS;$Tg=+HEAPF64[$1+($5<<3)>>3];$Th=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Ti=$Tg+$Th;$T11=$Tg-$Th;$TX=+HEAPF64[$2+($5<<3)>>3];$TY=+HEAPF64[$2+(($5*9|0)<<3)>>3];$TZ=$TX-$TY;$T1V=$TX+$TY;$Tj=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Tk=+HEAPF64[$1+(($5*13|0)<<3)>>3];$Tl=$Tj+$Tk;$TW=$Tj-$Tk;$T12=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T13=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T14=$T12-$T13;$T1W=$T12+$T13;$Tm=$Ti+$Tl;$T1X=$T1V-$T1W;$T2g=$T1V+$T1W;$T10=$TW+$TZ;$T15=$T11-$T14;$T1B=$T11+$T14;$T1U=$Ti-$Tl;$T1A=$TZ-$TW;$Tf=$T7+$Te;$Tu=$Tm+$Tt;HEAPF64[$3+($6<<3<<3)>>3]=$Tf-$Tu;HEAPF64[$3>>3]=$Tf+$Tu;$T2j=$TC+$TJ;$T2k=$T2g+$T2h;HEAPF64[$4+($6<<3<<3)>>3]=$T2j-$T2k;HEAPF64[$4>>3]=$T2j+$T2k;$Tv=$Tt-$Tm;$TK=$TC-$TJ;HEAPF64[$4+($6<<2<<3)>>3]=$Tv+$TK;HEAPF64[$4+(($6*12|0)<<3)>>3]=$TK-$Tv;$T2f=$T7-$Te;$T2i=$T2g-$T2h;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T2f-$T2i;HEAPF64[$3+($6<<2<<3)>>3]=$T2f+$T2i;$T1T=$T1R+$T1S;$T27=$T25-$T26;$T1Y=$T1U+$T1X;$T23=$T1Z-$T22;$T24=($T1Y+$T23)*.7071067811865476;$T28=($T23-$T1Y)*.7071067811865476;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T1T-$T24;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T27+$T28;HEAPF64[$3+($6<<1<<3)>>3]=$T1T+$T24;HEAPF64[$4+(($6*14|0)<<3)>>3]=$T27-$T28;$T29=$T1R-$T1S;$T2d=$T26+$T25;$T2a=$T1X-$T1U;$T2b=$T1Z+$T22;$T2c=($T2a-$T2b)*.7071067811865476;$T2e=($T2a+$T2b)*.7071067811865476;HEAPF64[$3+(($6*14|0)<<3)>>3]=$T29-$T2c;HEAPF64[$4+($6<<1<<3)>>3]=$T2d+$T2e;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T29+$T2c;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T2d-$T2e;$TU=($TQ-$TT)*.7071067811865476;$TV=$TN+$TU;$T1r=$TN-$TU;$T1o=($T1m-$T1n)*.7071067811865476;$T1p=$T1l-$T1o;$T1v=$T1l+$T1o;$T16=.9238795325112867*$T10+.3826834323650898*$T15;$T1h=.3826834323650898*$T1b-.9238795325112867*$T1g;$T1i=$T16+$T1h;$T1q=$T1h-$T16;$T1s=.3826834323650898*$T10-.9238795325112867*$T15;$T1t=.3826834323650898*$T1g+.9238795325112867*$T1b;$T1u=$T1s-$T1t;$T1w=$T1s+$T1t;HEAPF64[$3+(($6*11|0)<<3)>>3]=$TV-$T1i;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T1v-$T1w;HEAPF64[$3+(($6*3|0)<<3)>>3]=$TV+$T1i;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T1v+$T1w;HEAPF64[$4+(($6*15|0)<<3)>>3]=$T1p-$T1q;HEAPF64[$3+(($6*15|0)<<3)>>3]=$T1r-$T1u;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T1p+$T1q;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T1r+$T1u;$T1y=($T1n+$T1m)*.7071067811865476;$T1z=$T1x+$T1y;$T1L=$T1x-$T1y;$T1I=($TQ+$TT)*.7071067811865476;$T1J=$T1H-$T1I;$T1P=$T1H+$T1I;$T1C=.3826834323650898*$T1A+.9238795325112867*$T1B;$T1F=.9238795325112867*$T1D-.3826834323650898*$T1E;$T1G=$T1C+$T1F;$T1K=$T1F-$T1C;$T1M=.9238795325112867*$T1A-.3826834323650898*$T1B;$T1N=.9238795325112867*$T1E+.3826834323650898*$T1D;$T1O=$T1M-$T1N;$T1Q=$T1M+$T1N;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T1z-$T1G;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T1P-$T1Q;HEAPF64[$3+($6<<3)>>3]=$T1z+$T1G;HEAPF64[$4+($6<<3)>>3]=$T1P+$T1Q;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T1J-$T1K;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T1L-$T1O;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T1J+$T1K;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T1L+$T1O;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_2($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$T2=0.0,$T3=0.0,$T4=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<3)>>3];HEAPF64[$3+($6<<3)>>3]=$T1-$T2;HEAPF64[$3>>3]=$T1+$T2;$T3=+HEAPF64[$2>>3];$T4=+HEAPF64[$2+($5<<3)>>3];HEAPF64[$4+($6<<3)>>3]=$T3-$T4;HEAPF64[$4>>3]=$T3+$T4;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;label=2;break;case 5:return}}function _fftw_codelet_n1_2($p){$p=$p|0;_fftw_kdft_register($p,578,9640);return}function _fftw_codelet_n1_20($p){$p=$p|0;_fftw_kdft_register($p,30,9576);return}function _n1_20($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T7=0.0,$T2Q=0.0,$T3h=0.0,$TD=0.0,$TP=0.0,$T1U=0.0,$T2l=0.0,$T1d=0.0,$Tt=0.0,$TA=0.0,$TB=0.0,$T2w=0.0,$T2z=0.0,$T2S=0.0,$T35=0.0,$T36=0.0,$T3f=0.0,$TH=0.0,$TI=0.0,$TJ=0.0,$T15=0.0,$T1a=0.0,$T1b=0.0,$T1s=0.0,$T1x=0.0,$T1W=0.0,$T29=0.0,$T2a=0.0,$T2j=0.0,$T1h=0.0,$T1i=0.0,$T1j=0.0,$Te=0.0,$Tl=0.0,$Tm=0.0,$T2D=0.0,$T2G=0.0,$T2R=0.0,$T32=0.0,$T33=0.0,$T3e=0.0,$TE=0.0,$TF=0.0,$TG=0.0,$TU=0.0,$TZ=0.0,$T10=0.0,$T1D=0.0,$T1I=0.0,$T1V=0.0,$T26=0.0,$T27=0.0,$T2i=0.0,$T1e=0.0,$T1f=0.0,$T1g=0.0,$T3=0.0,$T1Q=0.0,$TN=0.0,$T2O=0.0,$T6=0.0,$TO=0.0,$T1T=0.0,$T2P=0.0,$T1=0.0,$T2=0.0,$TL=0.0,$TM=0.0,$T4=0.0,$T5=0.0,$T1R=0.0,$T1S=0.0,$Tp=0.0,$T1o=0.0,$T13=0.0,$T2u=0.0,$Ts=0.0,$T14=0.0,$T1r=0.0,$T2v=0.0,$Tw=0.0,$T1t=0.0,$T18=0.0,$T2x=0.0,$Tz=0.0,$T19=0.0,$T1w=0.0,$T2y=0.0,$Tn=0.0,$To=0.0,$T11=0.0,$T12=0.0,$Tq=0.0,$Tr=0.0,$T1p=0.0,$T1q=0.0,$Tu=0.0,$Tv=0.0,$T16=0.0,$T17=0.0,$Tx=0.0,$Ty=0.0,$T1u=0.0,$T1v=0.0,$Ta=0.0,$T1z=0.0,$TS=0.0,$T2B=0.0,$Td=0.0,$TT=0.0,$T1C=0.0,$T2C=0.0,$Th=0.0,$T1E=0.0,$TX=0.0,$T2E=0.0,$Tk=0.0,$TY=0.0,$T1H=0.0,$T2F=0.0,$T8=0.0,$T9=0.0,$TQ=0.0,$TR=0.0,$Tb=0.0,$Tc=0.0,$T1A=0.0,$T1B=0.0,$Tf=0.0,$Tg=0.0,$TV=0.0,$TW=0.0,$Ti=0.0,$Tj=0.0,$T1F=0.0,$T1G=0.0,$T2s=0.0,$TC=0.0,$T2r=0.0,$T2I=0.0,$T2K=0.0,$T2A=0.0,$T2H=0.0,$T2J=0.0,$T2t=0.0,$T2V=0.0,$T2T=0.0,$T2U=0.0,$T2N=0.0,$T2Y=0.0,$T2L=0.0,$T2M=0.0,$T2X=0.0,$T2W=0.0,$T2Z=0.0,$TK=0.0,$T30=0.0,$T38=0.0,$T3a=0.0,$T34=0.0,$T37=0.0,$T39=0.0,$T31=0.0,$T3g=0.0,$T3i=0.0,$T3j=0.0,$T3d=0.0,$T3m=0.0,$T3b=0.0,$T3c=0.0,$T3l=0.0,$T3k=0.0,$T23=0.0,$T1c=0.0,$T24=0.0,$T2c=0.0,$T2e=0.0,$T28=0.0,$T2b=0.0,$T2d=0.0,$T25=0.0,$T2k=0.0,$T2m=0.0,$T2n=0.0,$T2h=0.0,$T2p=0.0,$T2f=0.0,$T2g=0.0,$T2q=0.0,$T2o=0.0,$T1m=0.0,$T1k=0.0,$T1l=0.0,$T1K=0.0,$T1M=0.0,$T1y=0.0,$T1J=0.0,$T1L=0.0,$T1n=0.0,$T1Z=0.0,$T1X=0.0,$T1Y=0.0,$T1P=0.0,$T21=0.0,$T1N=0.0,$T1O=0.0,$T22=0.0,$T20=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T3=$T1+$T2;$T1Q=$T1-$T2;$TL=+HEAPF64[$2>>3];$TM=+HEAPF64[$2+(($5*10|0)<<3)>>3];$TN=$TL-$TM;$T2O=$TL+$TM;$T4=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T5=+HEAPF64[$1+(($5*15|0)<<3)>>3];$T6=$T4+$T5;$TO=$T4-$T5;$T1R=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T1S=+HEAPF64[$2+(($5*15|0)<<3)>>3];$T1T=$T1R-$T1S;$T2P=$T1R+$T1S;$T7=$T3-$T6;$T2Q=$T2O-$T2P;$T3h=$T2O+$T2P;$TD=$T3+$T6;$TP=$TN-$TO;$T1U=$T1Q-$T1T;$T2l=$T1Q+$T1T;$T1d=$TO+$TN;$Tn=+HEAPF64[$1+($5<<3<<3)>>3];$To=+HEAPF64[$1+(($5*18|0)<<3)>>3];$Tp=$Tn+$To;$T1o=$Tn-$To;$T11=+HEAPF64[$2+($5<<3<<3)>>3];$T12=+HEAPF64[$2+(($5*18|0)<<3)>>3];$T13=$T11-$T12;$T2u=$T11+$T12;$Tq=+HEAPF64[$1+(($5*13|0)<<3)>>3];$Tr=+HEAPF64[$1+(($5*3|0)<<3)>>3];$Ts=$Tq+$Tr;$T14=$Tq-$Tr;$T1p=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T1q=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T1r=$T1p-$T1q;$T2v=$T1p+$T1q;$Tu=+HEAPF64[$1+(($5*12|0)<<3)>>3];$Tv=+HEAPF64[$1+($5<<1<<3)>>3];$Tw=$Tu+$Tv;$T1t=$Tu-$Tv;$T16=+HEAPF64[$2+(($5*12|0)<<3)>>3];$T17=+HEAPF64[$2+($5<<1<<3)>>3];$T18=$T16-$T17;$T2x=$T16+$T17;$Tx=+HEAPF64[$1+(($5*17|0)<<3)>>3];$Ty=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Tz=$Tx+$Ty;$T19=$Tx-$Ty;$T1u=+HEAPF64[$2+(($5*17|0)<<3)>>3];$T1v=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T1w=$T1u-$T1v;$T2y=$T1u+$T1v;$Tt=$Tp-$Ts;$TA=$Tw-$Tz;$TB=$Tt+$TA;$T2w=$T2u-$T2v;$T2z=$T2x-$T2y;$T2S=$T2w+$T2z;$T35=$T2u+$T2v;$T36=$T2x+$T2y;$T3f=$T35+$T36;$TH=$Tp+$Ts;$TI=$Tw+$Tz;$TJ=$TH+$TI;$T15=$T13-$T14;$T1a=$T18-$T19;$T1b=$T15+$T1a;$T1s=$T1o-$T1r;$T1x=$T1t-$T1w;$T1W=$T1s+$T1x;$T29=$T1o+$T1r;$T2a=$T1t+$T1w;$T2j=$T29+$T2a;$T1h=$T14+$T13;$T1i=$T19+$T18;$T1j=$T1h+$T1i;$T8=+HEAPF64[$1+($5<<2<<3)>>3];$T9=+HEAPF64[$1+(($5*14|0)<<3)>>3];$Ta=$T8+$T9;$T1z=$T8-$T9;$TQ=+HEAPF64[$2+($5<<2<<3)>>3];$TR=+HEAPF64[$2+(($5*14|0)<<3)>>3];$TS=$TQ-$TR;$T2B=$TQ+$TR;$Tb=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*19|0)<<3)>>3];$Td=$Tb+$Tc;$TT=$Tb-$Tc;$T1A=+HEAPF64[$2+(($5*9|0)<<3)>>3];$T1B=+HEAPF64[$2+(($5*19|0)<<3)>>3];$T1C=$T1A-$T1B;$T2C=$T1A+$T1B;$Tf=+HEAPF64[$1+($5<<4<<3)>>3];$Tg=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Th=$Tf+$Tg;$T1E=$Tf-$Tg;$TV=+HEAPF64[$2+($5<<4<<3)>>3];$TW=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TX=$TV-$TW;$T2E=$TV+$TW;$Ti=+HEAPF64[$1+($5<<3)>>3];$Tj=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Tk=$Ti+$Tj;$TY=$Ti-$Tj;$T1F=+HEAPF64[$2+($5<<3)>>3];$T1G=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T1H=$T1F-$T1G;$T2F=$T1F+$T1G;$Te=$Ta-$Td;$Tl=$Th-$Tk;$Tm=$Te+$Tl;$T2D=$T2B-$T2C;$T2G=$T2E-$T2F;$T2R=$T2D+$T2G;$T32=$T2B+$T2C;$T33=$T2E+$T2F;$T3e=$T32+$T33;$TE=$Ta+$Td;$TF=$Th+$Tk;$TG=$TE+$TF;$TU=$TS-$TT;$TZ=$TX-$TY;$T10=$TU+$TZ;$T1D=$T1z-$T1C;$T1I=$T1E-$T1H;$T1V=$T1D+$T1I;$T26=$T1z+$T1C;$T27=$T1E+$T1H;$T2i=$T26+$T27;$T1e=$TT+$TS;$T1f=$TY+$TX;$T1g=$T1e+$T1f;$T2s=($Tm-$TB)*.5590169943749475;$TC=$Tm+$TB;$T2r=$T7-.25*$TC;$T2A=$T2w-$T2z;$T2H=$T2D-$T2G;$T2I=.9510565162951535*$T2A-.5877852522924731*$T2H;$T2K=.9510565162951535*$T2H+.5877852522924731*$T2A;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T7+$TC;$T2J=$T2s+$T2r;HEAPF64[$3+(($6*14|0)<<3)>>3]=$T2J-$T2K;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T2J+$T2K;$T2t=$T2r-$T2s;HEAPF64[$3+($6<<1<<3)>>3]=$T2t-$T2I;HEAPF64[$3+(($6*18|0)<<3)>>3]=$T2t+$T2I;$T2V=($T2R-$T2S)*.5590169943749475;$T2T=$T2R+$T2S;$T2U=$T2Q-.25*$T2T;$T2L=$Tt-$TA;$T2M=$Te-$Tl;$T2N=.9510565162951535*$T2L-.5877852522924731*$T2M;$T2Y=.9510565162951535*$T2M+.5877852522924731*$T2L;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T2Q+$T2T;$T2X=$T2V+$T2U;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T2X-$T2Y;HEAPF64[$4+(($6*14|0)<<3)>>3]=$T2Y+$T2X;$T2W=$T2U-$T2V;HEAPF64[$4+($6<<1<<3)>>3]=$T2N+$T2W;HEAPF64[$4+(($6*18|0)<<3)>>3]=$T2W-$T2N;$T2Z=($TG-$TJ)*.5590169943749475;$TK=$TG+$TJ;$T30=$TD-.25*$TK;$T34=$T32-$T33;$T37=$T35-$T36;$T38=.9510565162951535*$T34+.5877852522924731*$T37;$T3a=.9510565162951535*$T37-.5877852522924731*$T34;HEAPF64[$3>>3]=$TD+$TK;$T39=$T30-$T2Z;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T39-$T3a;HEAPF64[$3+($6<<3<<3)>>3]=$T39+$T3a;$T31=$T2Z+$T30;HEAPF64[$3+($6<<2<<3)>>3]=$T31-$T38;HEAPF64[$3+($6<<4<<3)>>3]=$T31+$T38;$T3g=($T3e-$T3f)*.5590169943749475;$T3i=$T3e+$T3f;$T3j=$T3h-.25*$T3i;$T3b=$TE-$TF;$T3c=$TH-$TI;$T3d=.9510565162951535*$T3b+.5877852522924731*$T3c;$T3m=.9510565162951535*$T3c-.5877852522924731*$T3b;HEAPF64[$4>>3]=$T3h+$T3i;$T3l=$T3j-$T3g;HEAPF64[$4+($6<<3<<3)>>3]=$T3l-$T3m;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T3m+$T3l;$T3k=$T3g+$T3j;HEAPF64[$4+($6<<2<<3)>>3]=$T3d+$T3k;HEAPF64[$4+($6<<4<<3)>>3]=$T3k-$T3d;$T23=($T10-$T1b)*.5590169943749475;$T1c=$T10+$T1b;$T24=$TP-.25*$T1c;$T28=$T26-$T27;$T2b=$T29-$T2a;$T2c=.9510565162951535*$T28+.5877852522924731*$T2b;$T2e=.9510565162951535*$T2b-.5877852522924731*$T28;HEAPF64[$4+(($6*5|0)<<3)>>3]=$TP+$T1c;$T2d=$T24-$T23;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T2d-$T2e;HEAPF64[$4+(($6*17|0)<<3)>>3]=$T2d+$T2e;$T25=$T23+$T24;HEAPF64[$4+($6<<3)>>3]=$T25-$T2c;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T25+$T2c;$T2k=($T2i-$T2j)*.5590169943749475;$T2m=$T2i+$T2j;$T2n=$T2l-.25*$T2m;$T2f=$TU-$TZ;$T2g=$T15-$T1a;$T2h=.9510565162951535*$T2f+.5877852522924731*$T2g;$T2p=.9510565162951535*$T2g-.5877852522924731*$T2f;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T2l+$T2m;$T2q=$T2n-$T2k;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T2p+$T2q;HEAPF64[$3+(($6*17|0)<<3)>>3]=$T2q-$T2p;$T2o=$T2k+$T2n;HEAPF64[$3+($6<<3)>>3]=$T2h+$T2o;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T2o-$T2h;$T1m=($T1g-$T1j)*.5590169943749475;$T1k=$T1g+$T1j;$T1l=$T1d-.25*$T1k;$T1y=$T1s-$T1x;$T1J=$T1D-$T1I;$T1K=.9510565162951535*$T1y-.5877852522924731*$T1J;$T1M=.9510565162951535*$T1J+.5877852522924731*$T1y;HEAPF64[$4+(($6*15|0)<<3)>>3]=$T1d+$T1k;$T1L=$T1m+$T1l;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T1L-$T1M;HEAPF64[$4+(($6*19|0)<<3)>>3]=$T1L+$T1M;$T1n=$T1l-$T1m;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T1n-$T1K;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T1n+$T1K;$T1Z=($T1V-$T1W)*.5590169943749475;$T1X=$T1V+$T1W;$T1Y=$T1U-.25*$T1X;$T1N=$T1h-$T1i;$T1O=$T1e-$T1f;$T1P=.9510565162951535*$T1N-.5877852522924731*$T1O;$T21=.9510565162951535*$T1O+.5877852522924731*$T1N;HEAPF64[$3+(($6*15|0)<<3)>>3]=$T1U+$T1X;$T22=$T1Z+$T1Y;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T21+$T22;HEAPF64[$3+(($6*19|0)<<3)>>3]=$T22-$T21;$T20=$T1Y-$T1Z;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T1P+$T20;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T20-$T1P;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_25($p){$p=$p|0;_fftw_kdft_register($p,34,9512);return}function _n1_25($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T9=0.0,$T4u=0.0,$T2T=0.0,$TP=0.0,$T3H=0.0,$TW=0.0,$T5y=0.0,$T3I=0.0,$T2Q=0.0,$T4v=0.0,$Ti=0.0,$Tr=0.0,$Ts=0.0,$T5m=0.0,$T5n=0.0,$T5v=0.0,$T18=0.0,$T4G=0.0,$T34=0.0,$T3M=0.0,$T1G=0.0,$T4J=0.0,$T38=0.0,$T3T=0.0,$T1v=0.0,$T4K=0.0,$T37=0.0,$T3W=0.0,$T1j=0.0,$T4H=0.0,$T35=0.0,$T3P=0.0,$TB=0.0,$TK=0.0,$TL=0.0,$T5p=0.0,$T5q=0.0,$T5w=0.0,$T1T=0.0,$T4N=0.0,$T3c=0.0,$T41=0.0,$T2r=0.0,$T4Q=0.0,$T3e=0.0,$T4b=0.0,$T2g=0.0,$T4R=0.0,$T3f=0.0,$T48=0.0,$T24=0.0,$T4O=0.0,$T3b=0.0,$T44=0.0,$T1=0.0,$T4=0.0,$T7=0.0,$T8=0.0,$T2S=0.0,$T2R=0.0,$TN=0.0,$TO=0.0,$T2=0.0,$T3=0.0,$T5=0.0,$T6=0.0,$T2N=0.0,$T2K=0.0,$T2L=0.0,$TS=0.0,$T2O=0.0,$TV=0.0,$T2M=0.0,$T2P=0.0,$TQ=0.0,$TR=0.0,$TT=0.0,$TU=0.0,$Ta=0.0,$T1c=0.0,$Tj=0.0,$T1z=0.0,$Th=0.0,$T1h=0.0,$TY=0.0,$T1g=0.0,$T13=0.0,$T1d=0.0,$T16=0.0,$T1b=0.0,$Tq=0.0,$T1E=0.0,$T1l=0.0,$T1D=0.0,$T1q=0.0,$T1A=0.0,$T1t=0.0,$T1y=0.0,$Tb=0.0,$Tc=0.0,$Td=0.0,$Te=0.0,$Tf=0.0,$Tg=0.0,$T11=0.0,$T12=0.0,$T19=0.0,$T14=0.0,$T15=0.0,$T1a=0.0,$Tk=0.0,$Tl=0.0,$Tm=0.0,$Tn=0.0,$To=0.0,$Tp=0.0,$T1o=0.0,$T1p=0.0,$T1w=0.0,$T1r=0.0,$T1s=0.0,$T1x=0.0,$T17=0.0,$T3L=0.0,$T10=0.0,$T3K=0.0,$TZ=0.0,$T1F=0.0,$T3R=0.0,$T1C=0.0,$T3S=0.0,$T1B=0.0,$T1u=0.0,$T3V=0.0,$T1n=0.0,$T3U=0.0,$T1m=0.0,$T1i=0.0,$T3N=0.0,$T1f=0.0,$T3O=0.0,$T1e=0.0,$Tt=0.0,$T1X=0.0,$TC=0.0,$T2k=0.0,$TA=0.0,$T22=0.0,$T1J=0.0,$T21=0.0,$T1O=0.0,$T1Y=0.0,$T1R=0.0,$T1W=0.0,$TJ=0.0,$T2p=0.0,$T26=0.0,$T2o=0.0,$T2b=0.0,$T2l=0.0,$T2e=0.0,$T2j=0.0,$Tu=0.0,$Tv=0.0,$Tw=0.0,$Tx=0.0,$Ty=0.0,$Tz=0.0,$T1M=0.0,$T1N=0.0,$T1U=0.0,$T1P=0.0,$T1Q=0.0,$T1V=0.0,$TD=0.0,$TE=0.0,$TF=0.0,$TG=0.0,$TH=0.0,$TI=0.0,$T29=0.0,$T2a=0.0,$T2h=0.0,$T2c=0.0,$T2d=0.0,$T2i=0.0,$T1S=0.0,$T40=0.0,$T1L=0.0,$T3Z=0.0,$T1K=0.0,$T2q=0.0,$T49=0.0,$T2n=0.0,$T4a=0.0,$T2m=0.0,$T2f=0.0,$T47=0.0,$T28=0.0,$T46=0.0,$T27=0.0,$T23=0.0,$T42=0.0,$T20=0.0,$T43=0.0,$T1Z=0.0,$T5j=0.0,$TM=0.0,$T5k=0.0,$T5s=0.0,$T5u=0.0,$T5o=0.0,$T5r=0.0,$T5t=0.0,$T5l=0.0,$T5x=0.0,$T5z=0.0,$T5A=0.0,$T5E=0.0,$T5F=0.0,$T5C=0.0,$T5D=0.0,$T5G=0.0,$T5B=0.0,$TX=0.0,$T2U=0.0,$T2u=0.0,$T2Z=0.0,$T2v=0.0,$T2Y=0.0,$T2A=0.0,$T2V=0.0,$T2D=0.0,$T2J=0.0,$T1k=0.0,$T1H=0.0,$T1I=0.0,$T25=0.0,$T2s=0.0,$T2t=0.0,$T2y=0.0,$T2z=0.0,$T2H=0.0,$T2B=0.0,$T2C=0.0,$T2I=0.0,$T2E=0.0,$T2G=0.0,$T2x=0.0,$T2F=0.0,$T2w=0.0,$T30=0.0,$T31=0.0,$T2X=0.0,$T32=0.0,$T2W=0.0,$T4F=0.0,$T52=0.0,$T4U=0.0,$T5b=0.0,$T56=0.0,$T57=0.0,$T51=0.0,$T5f=0.0,$T53=0.0,$T5e=0.0,$T4I=0.0,$T4L=0.0,$T4M=0.0,$T4P=0.0,$T4S=0.0,$T4T=0.0,$T4V=0.0,$T4W=0.0,$T4X=0.0,$T4Y=0.0,$T4Z=0.0,$T50=0.0,$T58=0.0,$T59=0.0,$T55=0.0,$T5a=0.0,$T54=0.0,$T5g=0.0,$T5i=0.0,$T5d=0.0,$T5h=0.0,$T5c=0.0,$T3J=0.0,$T4w=0.0,$T4e=0.0,$T4B=0.0,$T4f=0.0,$T4A=0.0,$T4k=0.0,$T4x=0.0,$T4n=0.0,$T4t=0.0,$T3Q=0.0,$T3X=0.0,$T3Y=0.0,$T45=0.0,$T4c=0.0,$T4d=0.0,$T4i=0.0,$T4j=0.0,$T4r=0.0,$T4l=0.0,$T4m=0.0,$T4s=0.0,$T4o=0.0,$T4q=0.0,$T4h=0.0,$T4p=0.0,$T4g=0.0,$T4C=0.0,$T4D=0.0,$T4z=0.0,$T4E=0.0,$T4y=0.0,$T33=0.0,$T3j=0.0,$T3i=0.0,$T3z=0.0,$T3r=0.0,$T3s=0.0,$T3q=0.0,$T3D=0.0,$T3v=0.0,$T3C=0.0,$T36=0.0,$T39=0.0,$T3a=0.0,$T3d=0.0,$T3g=0.0,$T3h=0.0,$T3k=0.0,$T3l=0.0,$T3m=0.0,$T3n=0.0,$T3o=0.0,$T3p=0.0,$T3t=0.0,$T3y=0.0,$T3w=0.0,$T3x=0.0,$T3u=0.0,$T3E=0.0,$T3G=0.0,$T3B=0.0,$T3F=0.0,$T3A=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T3=+HEAPF64[$1+(($5*20|0)<<3)>>3];$T4=$T2+$T3;$T5=+HEAPF64[$1+(($5*10|0)<<3)>>3];$T6=+HEAPF64[$1+(($5*15|0)<<3)>>3];$T7=$T5+$T6;$T8=$T4+$T7;$T2S=$T5-$T6;$T2R=$T2-$T3;$T9=$T1+$T8;$T4u=.9510565162951535*$T2S-.5877852522924731*$T2R;$T2T=.9510565162951535*$T2R+.5877852522924731*$T2S;$TN=($T4-$T7)*.5590169943749475;$TO=$T1-.25*$T8;$TP=$TN+$TO;$T3H=$TO-$TN;$T2N=+HEAPF64[$2>>3];$TQ=+HEAPF64[$2+(($5*5|0)<<3)>>3];$TR=+HEAPF64[$2+(($5*20|0)<<3)>>3];$T2K=$TQ+$TR;$TT=+HEAPF64[$2+(($5*10|0)<<3)>>3];$TU=+HEAPF64[$2+(($5*15|0)<<3)>>3];$T2L=$TT+$TU;$TS=$TQ-$TR;$T2O=$T2K+$T2L;$TV=$TT-$TU;$TW=.9510565162951535*$TS+.5877852522924731*$TV;$T5y=$T2N+$T2O;$T3I=.9510565162951535*$TV-.5877852522924731*$TS;$T2M=($T2K-$T2L)*.5590169943749475;$T2P=$T2N-.25*$T2O;$T2Q=$T2M+$T2P;$T4v=$T2P-$T2M;$Ta=+HEAPF64[$1+($5<<3)>>3];$T1c=+HEAPF64[$2+($5<<3)>>3];$Tj=+HEAPF64[$1+($5<<2<<3)>>3];$T1z=+HEAPF64[$2+($5<<2<<3)>>3];$Tb=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*21|0)<<3)>>3];$Td=$Tb+$Tc;$Te=+HEAPF64[$1+(($5*11|0)<<3)>>3];$Tf=+HEAPF64[$1+($5<<4<<3)>>3];$Tg=$Te+$Tf;$Th=$Td+$Tg;$T1h=$Te-$Tf;$TY=($Td-$Tg)*.5590169943749475;$T1g=$Tb-$Tc;$T11=+HEAPF64[$2+(($5*6|0)<<3)>>3];$T12=+HEAPF64[$2+(($5*21|0)<<3)>>3];$T19=$T11+$T12;$T14=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T15=+HEAPF64[$2+($5<<4<<3)>>3];$T1a=$T14+$T15;$T13=$T11-$T12;$T1d=$T19+$T1a;$T16=$T14-$T15;$T1b=($T19-$T1a)*.5590169943749475;$Tk=+HEAPF64[$1+(($5*9|0)<<3)>>3];$Tl=+HEAPF64[$1+(($5*24|0)<<3)>>3];$Tm=$Tk+$Tl;$Tn=+HEAPF64[$1+(($5*14|0)<<3)>>3];$To=+HEAPF64[$1+(($5*19|0)<<3)>>3];$Tp=$Tn+$To;$Tq=$Tm+$Tp;$T1E=$Tn-$To;$T1l=($Tm-$Tp)*.5590169943749475;$T1D=$Tk-$Tl;$T1o=+HEAPF64[$2+(($5*9|0)<<3)>>3];$T1p=+HEAPF64[$2+(($5*24|0)<<3)>>3];$T1w=$T1o+$T1p;$T1r=+HEAPF64[$2+(($5*14|0)<<3)>>3];$T1s=+HEAPF64[$2+(($5*19|0)<<3)>>3];$T1x=$T1r+$T1s;$T1q=$T1o-$T1p;$T1A=$T1w+$T1x;$T1t=$T1r-$T1s;$T1y=($T1w-$T1x)*.5590169943749475;$Ti=$Ta+$Th;$Tr=$Tj+$Tq;$Ts=$Ti+$Tr;$T5m=$T1c+$T1d;$T5n=$T1z+$T1A;$T5v=$T5m+$T5n;$T17=.9510565162951535*$T13+.5877852522924731*$T16;$T3L=.9510565162951535*$T16-.5877852522924731*$T13;$TZ=$Ta-.25*$Th;$T10=$TY+$TZ;$T3K=$TZ-$TY;$T18=$T10+$T17;$T4G=$T3K+$T3L;$T34=$T10-$T17;$T3M=$T3K-$T3L;$T1F=.9510565162951535*$T1D+.5877852522924731*$T1E;$T3R=.9510565162951535*$T1E-.5877852522924731*$T1D;$T1B=$T1z-.25*$T1A;$T1C=$T1y+$T1B;$T3S=$T1B-$T1y;$T1G=$T1C-$T1F;$T4J=$T3S-$T3R;$T38=$T1F+$T1C;$T3T=$T3R+$T3S;$T1u=.9510565162951535*$T1q+.5877852522924731*$T1t;$T3V=.9510565162951535*$T1t-.5877852522924731*$T1q;$T1m=$Tj-.25*$Tq;$T1n=$T1l+$T1m;$T3U=$T1m-$T1l;$T1v=$T1n+$T1u;$T4K=$T3U+$T3V;$T37=$T1n-$T1u;$T3W=$T3U-$T3V;$T1i=.9510565162951535*$T1g+.5877852522924731*$T1h;$T3N=.9510565162951535*$T1h-.5877852522924731*$T1g;$T1e=$T1c-.25*$T1d;$T1f=$T1b+$T1e;$T3O=$T1e-$T1b;$T1j=$T1f-$T1i;$T4H=$T3O-$T3N;$T35=$T1i+$T1f;$T3P=$T3N+$T3O;$Tt=+HEAPF64[$1+($5<<1<<3)>>3];$T1X=+HEAPF64[$2+($5<<1<<3)>>3];$TC=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T2k=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tu=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Tv=+HEAPF64[$1+(($5*22|0)<<3)>>3];$Tw=$Tu+$Tv;$Tx=+HEAPF64[$1+(($5*12|0)<<3)>>3];$Ty=+HEAPF64[$1+(($5*17|0)<<3)>>3];$Tz=$Tx+$Ty;$TA=$Tw+$Tz;$T22=$Tx-$Ty;$T1J=($Tw-$Tz)*.5590169943749475;$T21=$Tu-$Tv;$T1M=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T1N=+HEAPF64[$2+(($5*22|0)<<3)>>3];$T1U=$T1M+$T1N;$T1P=+HEAPF64[$2+(($5*12|0)<<3)>>3];$T1Q=+HEAPF64[$2+(($5*17|0)<<3)>>3];$T1V=$T1P+$T1Q;$T1O=$T1M-$T1N;$T1Y=$T1U+$T1V;$T1R=$T1P-$T1Q;$T1W=($T1U-$T1V)*.5590169943749475;$TD=+HEAPF64[$1+($5<<3<<3)>>3];$TE=+HEAPF64[$1+(($5*23|0)<<3)>>3];$TF=$TD+$TE;$TG=+HEAPF64[$1+(($5*13|0)<<3)>>3];$TH=+HEAPF64[$1+(($5*18|0)<<3)>>3];$TI=$TG+$TH;$TJ=$TF+$TI;$T2p=$TG-$TH;$T26=($TF-$TI)*.5590169943749475;$T2o=$TD-$TE;$T29=+HEAPF64[$2+($5<<3<<3)>>3];$T2a=+HEAPF64[$2+(($5*23|0)<<3)>>3];$T2h=$T29+$T2a;$T2c=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T2d=+HEAPF64[$2+(($5*18|0)<<3)>>3];$T2i=$T2c+$T2d;$T2b=$T29-$T2a;$T2l=$T2h+$T2i;$T2e=$T2c-$T2d;$T2j=($T2h-$T2i)*.5590169943749475;$TB=$Tt+$TA;$TK=$TC+$TJ;$TL=$TB+$TK;$T5p=$T1X+$T1Y;$T5q=$T2k+$T2l;$T5w=$T5p+$T5q;$T1S=.9510565162951535*$T1O+.5877852522924731*$T1R;$T40=.9510565162951535*$T1R-.5877852522924731*$T1O;$T1K=$Tt-.25*$TA;$T1L=$T1J+$T1K;$T3Z=$T1K-$T1J;$T1T=$T1L+$T1S;$T4N=$T3Z+$T40;$T3c=$T1L-$T1S;$T41=$T3Z-$T40;$T2q=.9510565162951535*$T2o+.5877852522924731*$T2p;$T49=.9510565162951535*$T2p-.5877852522924731*$T2o;$T2m=$T2k-.25*$T2l;$T2n=$T2j+$T2m;$T4a=$T2m-$T2j;$T2r=$T2n-$T2q;$T4Q=$T4a-$T49;$T3e=$T2q+$T2n;$T4b=$T49+$T4a;$T2f=.9510565162951535*$T2b+.5877852522924731*$T2e;$T47=.9510565162951535*$T2e-.5877852522924731*$T2b;$T27=$TC-.25*$TJ;$T28=$T26+$T27;$T46=$T27-$T26;$T2g=$T28+$T2f;$T4R=$T46+$T47;$T3f=$T28-$T2f;$T48=$T46-$T47;$T23=.9510565162951535*$T21+.5877852522924731*$T22;$T42=.9510565162951535*$T22-.5877852522924731*$T21;$T1Z=$T1X-.25*$T1Y;$T20=$T1W+$T1Z;$T43=$T1Z-$T1W;$T24=$T20-$T23;$T4O=$T43-$T42;$T3b=$T23+$T20;$T44=$T42+$T43;$T5j=($Ts-$TL)*.5590169943749475;$TM=$Ts+$TL;$T5k=$T9-.25*$TM;$T5o=$T5m-$T5n;$T5r=$T5p-$T5q;$T5s=.9510565162951535*$T5o+.5877852522924731*$T5r;$T5u=.9510565162951535*$T5r-.5877852522924731*$T5o;HEAPF64[$3>>3]=$T9+$TM;$T5t=$T5k-$T5j;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T5t-$T5u;HEAPF64[$3+(($6*15|0)<<3)>>3]=$T5t+$T5u;$T5l=$T5j+$T5k;HEAPF64[$3+(($6*20|0)<<3)>>3]=$T5l-$T5s;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T5l+$T5s;$T5x=($T5v-$T5w)*.5590169943749475;$T5z=$T5v+$T5w;$T5A=$T5y-.25*$T5z;$T5C=$Ti-$Tr;$T5D=$TB-$TK;$T5E=.9510565162951535*$T5C+.5877852522924731*$T5D;$T5F=.9510565162951535*$T5D-.5877852522924731*$T5C;HEAPF64[$4>>3]=$T5y+$T5z;$T5G=$T5A-$T5x;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T5F+$T5G;HEAPF64[$4+(($6*15|0)<<3)>>3]=$T5G-$T5F;$T5B=$T5x+$T5A;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T5B-$T5E;HEAPF64[$4+(($6*20|0)<<3)>>3]=$T5E+$T5B;$TX=$TP+$TW;$T2U=$T2Q-$T2T;$T1k=.9685831611286311*$T18+.2486898871648548*$T1j;$T1H=.5358267949789967*$T1v+.8443279255020151*$T1G;$T1I=$T1k+$T1H;$T25=.8763066800438636*$T1T+.48175367410171527*$T24;$T2s=.7289686274214116*$T2g+.6845471059286887*$T2r;$T2t=$T25+$T2s;$T2u=$T1I+$T2t;$T2Z=$T25-$T2s;$T2v=($T1I-$T2t)*.5590169943749475;$T2Y=$T1k-$T1H;$T2y=.9685831611286311*$T1j-.2486898871648548*$T18;$T2z=.5358267949789967*$T1G-.8443279255020151*$T1v;$T2H=$T2y+$T2z;$T2B=.8763066800438636*$T24-.48175367410171527*$T1T;$T2C=.7289686274214116*$T2r-.6845471059286887*$T2g;$T2I=$T2B+$T2C;$T2A=$T2y-$T2z;$T2V=$T2H+$T2I;$T2D=$T2B-$T2C;$T2J=($T2H-$T2I)*.5590169943749475;HEAPF64[$3+($6<<3)>>3]=$TX+$T2u;HEAPF64[$4+($6<<3)>>3]=$T2U+$T2V;$T2E=.9510565162951535*$T2A+.5877852522924731*$T2D;$T2G=.9510565162951535*$T2D-.5877852522924731*$T2A;$T2w=$TX-.25*$T2u;$T2x=$T2v+$T2w;$T2F=$T2w-$T2v;HEAPF64[$3+(($6*21|0)<<3)>>3]=$T2x-$T2E;HEAPF64[$3+($6<<4<<3)>>3]=$T2F+$T2G;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T2x+$T2E;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T2F-$T2G;$T30=.9510565162951535*$T2Y+.5877852522924731*$T2Z;$T31=.9510565162951535*$T2Z-.5877852522924731*$T2Y;$T2W=$T2U-.25*$T2V;$T2X=$T2J+$T2W;$T32=$T2W-$T2J;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T2X-$T30;HEAPF64[$4+($6<<4<<3)>>3]=$T32-$T31;HEAPF64[$4+(($6*21|0)<<3)>>3]=$T30+$T2X;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T31+$T32;$T4F=$T3H+$T3I;$T52=$T4v-$T4u;$T4I=.7289686274214116*$T4G+.6845471059286887*$T4H;$T4L=.12533323356430426*$T4J-.9921147013144779*$T4K;$T4M=$T4I+$T4L;$T4P=.06279051952931337*$T4N+.9980267284282716*$T4O;$T4S=.7705132427757893*$T4Q-.6374239897486897*$T4R;$T4T=$T4P+$T4S;$T4U=$T4M+$T4T;$T5b=($T4M-$T4T)*.5590169943749475;$T56=$T4I-$T4L;$T57=$T4P-$T4S;$T4V=.7289686274214116*$T4H-.6845471059286887*$T4G;$T4W=.12533323356430426*$T4K+.9921147013144779*$T4J;$T4X=$T4V-$T4W;$T4Y=.06279051952931337*$T4O-.9980267284282716*$T4N;$T4Z=.7705132427757893*$T4R+.6374239897486897*$T4Q;$T50=$T4Y-$T4Z;$T51=($T4X-$T50)*.5590169943749475;$T5f=$T4Y+$T4Z;$T53=$T4X+$T50;$T5e=$T4V+$T4W;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T4F+$T4U;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T52+$T53;$T58=.9510565162951535*$T56+.5877852522924731*$T57;$T59=.9510565162951535*$T57-.5877852522924731*$T56;$T54=$T52-.25*$T53;$T55=$T51+$T54;$T5a=$T54-$T51;HEAPF64[$4+($6<<3<<3)>>3]=$T55-$T58;HEAPF64[$4+(($6*18|0)<<3)>>3]=$T5a-$T59;HEAPF64[$4+(($6*23|0)<<3)>>3]=$T58+$T55;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T59+$T5a;$T5g=.9510565162951535*$T5e+.5877852522924731*$T5f;$T5i=.9510565162951535*$T5f-.5877852522924731*$T5e;$T5c=$T4F-.25*$T4U;$T5d=$T5b+$T5c;$T5h=$T5c-$T5b;HEAPF64[$3+(($6*23|0)<<3)>>3]=$T5d-$T5g;HEAPF64[$3+(($6*18|0)<<3)>>3]=$T5h+$T5i;HEAPF64[$3+($6<<3<<3)>>3]=$T5d+$T5g;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T5h-$T5i;$T3J=$T3H-$T3I;$T4w=$T4u+$T4v;$T3Q=.8763066800438636*$T3M+.48175367410171527*$T3P;$T3X=.9048270524660196*$T3T-.42577929156507266*$T3W;$T3Y=$T3Q+$T3X;$T45=.5358267949789967*$T41+.8443279255020151*$T44;$T4c=.06279051952931337*$T48+.9980267284282716*$T4b;$T4d=$T45+$T4c;$T4e=$T3Y+$T4d;$T4B=$T45-$T4c;$T4f=($T3Y-$T4d)*.5590169943749475;$T4A=$T3Q-$T3X;$T4i=.8763066800438636*$T3P-.48175367410171527*$T3M;$T4j=.9048270524660196*$T3W+.42577929156507266*$T3T;$T4r=$T4i-$T4j;$T4l=.5358267949789967*$T44-.8443279255020151*$T41;$T4m=.06279051952931337*$T4b-.9980267284282716*$T48;$T4s=$T4l+$T4m;$T4k=$T4i+$T4j;$T4x=$T4r+$T4s;$T4n=$T4l-$T4m;$T4t=($T4r-$T4s)*.5590169943749475;HEAPF64[$3+($6<<1<<3)>>3]=$T3J+$T4e;HEAPF64[$4+($6<<1<<3)>>3]=$T4w+$T4x;$T4o=.9510565162951535*$T4k+.5877852522924731*$T4n;$T4q=.9510565162951535*$T4n-.5877852522924731*$T4k;$T4g=$T3J-.25*$T4e;$T4h=$T4f+$T4g;$T4p=$T4g-$T4f;HEAPF64[$3+(($6*22|0)<<3)>>3]=$T4h-$T4o;HEAPF64[$3+(($6*17|0)<<3)>>3]=$T4p+$T4q;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T4h+$T4o;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T4p-$T4q;$T4C=.9510565162951535*$T4A+.5877852522924731*$T4B;$T4D=.9510565162951535*$T4B-.5877852522924731*$T4A;$T4y=$T4w-.25*$T4x;$T4z=$T4t+$T4y;$T4E=$T4y-$T4t;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T4z-$T4C;HEAPF64[$4+(($6*17|0)<<3)>>3]=$T4E-$T4D;HEAPF64[$4+(($6*22|0)<<3)>>3]=$T4C+$T4z;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T4D+$T4E;$T33=$TP-$TW;$T3j=$T2T+$T2Q;$T36=.5358267949789967*$T34+.8443279255020151*$T35;$T39=.6374239897486897*$T37+.7705132427757893*$T38;$T3a=$T36-$T39;$T3d=.9048270524660196*$T3b-.42577929156507266*$T3c;$T3g=.12533323356430426*$T3e-.9921147013144779*$T3f;$T3h=$T3d+$T3g;$T3i=$T3a+$T3h;$T3z=($T3a-$T3h)*.5590169943749475;$T3r=$T3d-$T3g;$T3s=$T36+$T39;$T3k=.5358267949789967*$T35-.8443279255020151*$T34;$T3l=.7705132427757893*$T37-.6374239897486897*$T38;$T3m=$T3k+$T3l;$T3n=.9048270524660196*$T3c+.42577929156507266*$T3b;$T3o=.12533323356430426*$T3f+.9921147013144779*$T3e;$T3p=$T3n+$T3o;$T3q=$T3m-$T3p;$T3D=$T3o-$T3n;$T3v=($T3m+$T3p)*.5590169943749475;$T3C=$T3k-$T3l;HEAPF64[$3+($6<<2<<3)>>3]=$T33+$T3i;HEAPF64[$4+($6<<2<<3)>>3]=$T3j+$T3q;$T3t=.9510565162951535*$T3r-.5877852522924731*$T3s;$T3y=.9510565162951535*$T3s+.5877852522924731*$T3r;$T3u=$T3j-.25*$T3q;$T3w=$T3u-$T3v;$T3x=$T3u+$T3v;HEAPF64[$4+(($6*14|0)<<3)>>3]=$T3t+$T3w;HEAPF64[$4+(($6*24|0)<<3)>>3]=$T3y+$T3x;HEAPF64[$4+(($6*19|0)<<3)>>3]=$T3w-$T3t;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T3x-$T3y;$T3E=.9510565162951535*$T3C+.5877852522924731*$T3D;$T3G=.9510565162951535*$T3D-.5877852522924731*$T3C;$T3A=$T33-.25*$T3i;$T3B=$T3z+$T3A;$T3F=$T3A-$T3z;HEAPF64[$3+(($6*24|0)<<3)>>3]=$T3B-$T3E;HEAPF64[$3+(($6*19|0)<<3)>>3]=$T3F+$T3G;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T3B+$T3E;HEAPF64[$3+(($6*14|0)<<3)>>3]=$T3F-$T3G;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_3($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$Ta=0.0,$T4=0.0,$T9=0.0,$T8=0.0,$Tb=0.0,$T5=0.0,$Tc=0.0,$T2=0.0,$T3=0.0,$T6=0.0,$T7=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$Ta=+HEAPF64[$2>>3];$T2=+HEAPF64[$1+($5<<3)>>3];$T3=+HEAPF64[$1+($5<<1<<3)>>3];$T4=$T2+$T3;$T9=($T3-$T2)*.8660254037844386;$T6=+HEAPF64[$2+($5<<3)>>3];$T7=+HEAPF64[$2+($5<<1<<3)>>3];$T8=($T6-$T7)*.8660254037844386;$Tb=$T6+$T7;HEAPF64[$3>>3]=$T1+$T4;HEAPF64[$4>>3]=$Ta+$Tb;$T5=$T1-.5*$T4;HEAPF64[$3+($6<<1<<3)>>3]=$T5-$T8;HEAPF64[$3+($6<<3)>>3]=$T5+$T8;$Tc=$Ta-.5*$Tb;HEAPF64[$4+($6<<3)>>3]=$T9+$Tc;HEAPF64[$4+($6<<1<<3)>>3]=$Tc-$T9;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;label=2;break;case 5:return}}function _fftw_codelet_n1_3($p){$p=$p|0;_fftw_kdft_register($p,580,9448);return}function _fftw_codelet_n1_32($p){$p=$p|0;_fftw_kdft_register($p,1206,9384);return}function _n1_32($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T7=0.0,$T4r=0.0,$T4Z=0.0,$T18=0.0,$T1z=0.0,$T3t=0.0,$T3T=0.0,$T2T=0.0,$Te=0.0,$T1f=0.0,$T50=0.0,$T4s=0.0,$T2W=0.0,$T3u=0.0,$T1G=0.0,$T3U=0.0,$Tm=0.0,$T1n=0.0,$T1O=0.0,$T2Z=0.0,$T3y=0.0,$T3X=0.0,$T4w=0.0,$T53=0.0,$Tt=0.0,$T1u=0.0,$T1V=0.0,$T2Y=0.0,$T3B=0.0,$T3W=0.0,$T4z=0.0,$T52=0.0,$T2t=0.0,$T3L=0.0,$T3O=0.0,$T2K=0.0,$TR=0.0,$TY=0.0,$T5F=0.0,$T5G=0.0,$T5H=0.0,$T5I=0.0,$T4R=0.0,$T5j=0.0,$T2E=0.0,$T3P=0.0,$T4W=0.0,$T5k=0.0,$T2N=0.0,$T3M=0.0,$T22=0.0,$T3E=0.0,$T3H=0.0,$T2j=0.0,$TC=0.0,$TJ=0.0,$T5A=0.0,$T5B=0.0,$T5C=0.0,$T5D=0.0,$T4G=0.0,$T5g=0.0,$T2d=0.0,$T3F=0.0,$T4L=0.0,$T5h=0.0,$T2m=0.0,$T3I=0.0,$T3=0.0,$T1x=0.0,$T14=0.0,$T2S=0.0,$T6=0.0,$T2R=0.0,$T17=0.0,$T1y=0.0,$T1=0.0,$T2=0.0,$T12=0.0,$T13=0.0,$T4=0.0,$T5=0.0,$T15=0.0,$T16=0.0,$Ta=0.0,$T1B=0.0,$T1b=0.0,$T1A=0.0,$Td=0.0,$T1D=0.0,$T1e=0.0,$T1E=0.0,$T8=0.0,$T9=0.0,$T19=0.0,$T1a=0.0,$Tb=0.0,$Tc=0.0,$T1c=0.0,$T1d=0.0,$T2U=0.0,$T2V=0.0,$T1C=0.0,$T1F=0.0,$Ti=0.0,$T1L=0.0,$T1j=0.0,$T1J=0.0,$Tl=0.0,$T1I=0.0,$T1m=0.0,$T1M=0.0,$T1K=0.0,$T1N=0.0,$Tg=0.0,$Th=0.0,$T1h=0.0,$T1i=0.0,$Tj=0.0,$Tk=0.0,$T1k=0.0,$T1l=0.0,$T3w=0.0,$T3x=0.0,$T4u=0.0,$T4v=0.0,$Tp=0.0,$T1S=0.0,$T1q=0.0,$T1Q=0.0,$Ts=0.0,$T1P=0.0,$T1t=0.0,$T1T=0.0,$T1R=0.0,$T1U=0.0,$Tn=0.0,$To=0.0,$T1o=0.0,$T1p=0.0,$Tq=0.0,$Tr=0.0,$T1r=0.0,$T1s=0.0,$T3z=0.0,$T3A=0.0,$T4x=0.0,$T4y=0.0,$TN=0.0,$T2p=0.0,$T2J=0.0,$T4S=0.0,$TQ=0.0,$T2G=0.0,$T2s=0.0,$T4T=0.0,$TU=0.0,$T2x=0.0,$T2w=0.0,$T4O=0.0,$TX=0.0,$T2z=0.0,$T2C=0.0,$T4P=0.0,$TL=0.0,$TM=0.0,$T2H=0.0,$T2I=0.0,$TO=0.0,$TP=0.0,$T2q=0.0,$T2r=0.0,$TS=0.0,$TT=0.0,$T2u=0.0,$T2v=0.0,$TV=0.0,$TW=0.0,$T2A=0.0,$T2B=0.0,$T4N=0.0,$T4Q=0.0,$T2y=0.0,$T2D=0.0,$T4U=0.0,$T4V=0.0,$T2L=0.0,$T2M=0.0,$Ty=0.0,$T2f=0.0,$T21=0.0,$T4C=0.0,$TB=0.0,$T1Y=0.0,$T2i=0.0,$T4D=0.0,$TF=0.0,$T28=0.0,$T2b=0.0,$T4I=0.0,$TI=0.0,$T23=0.0,$T26=0.0,$T4J=0.0,$Tw=0.0,$Tx=0.0,$T1Z=0.0,$T20=0.0,$Tz=0.0,$TA=0.0,$T2g=0.0,$T2h=0.0,$TD=0.0,$TE=0.0,$T29=0.0,$T2a=0.0,$TG=0.0,$TH=0.0,$T24=0.0,$T25=0.0,$T4E=0.0,$T4F=0.0,$T27=0.0,$T2c=0.0,$T4H=0.0,$T4K=0.0,$T2k=0.0,$T2l=0.0,$T4B=0.0,$T57=0.0,$T5a=0.0,$T5c=0.0,$T4Y=0.0,$T56=0.0,$T55=0.0,$T5b=0.0,$T4t=0.0,$T4A=0.0,$T58=0.0,$T59=0.0,$T4M=0.0,$T4X=0.0,$T51=0.0,$T54=0.0,$T5f=0.0,$T5r=0.0,$T5u=0.0,$T5w=0.0,$T5m=0.0,$T5q=0.0,$T5p=0.0,$T5v=0.0,$T5d=0.0,$T5e=0.0,$T5s=0.0,$T5t=0.0,$T5i=0.0,$T5l=0.0,$T5n=0.0,$T5o=0.0,$T5z=0.0,$T5P=0.0,$T5S=0.0,$T5U=0.0,$T5K=0.0,$T5O=0.0,$T5N=0.0,$T5T=0.0,$T5x=0.0,$T5y=0.0,$T5Q=0.0,$T5R=0.0,$T5E=0.0,$T5J=0.0,$T5L=0.0,$T5M=0.0,$Tv=0.0,$T5V=0.0,$T5Y=0.0,$T60=0.0,$T10=0.0,$T11=0.0,$T1w=0.0,$T5Z=0.0,$Tf=0.0,$Tu=0.0,$T5W=0.0,$T5X=0.0,$TK=0.0,$TZ=0.0,$T1g=0.0,$T1v=0.0,$T1X=0.0,$T33=0.0,$T31=0.0,$T37=0.0,$T2o=0.0,$T34=0.0,$T2P=0.0,$T35=0.0,$T1H=0.0,$T1W=0.0,$T2X=0.0,$T30=0.0,$T2e=0.0,$T2n=0.0,$T2F=0.0,$T2O=0.0,$T2Q=0.0,$T38=0.0,$T32=0.0,$T36=0.0,$T3D=0.0,$T41=0.0,$T3Z=0.0,$T45=0.0,$T3K=0.0,$T42=0.0,$T3R=0.0,$T43=0.0,$T3v=0.0,$T3C=0.0,$T3V=0.0,$T3Y=0.0,$T3G=0.0,$T3J=0.0,$T3N=0.0,$T3Q=0.0,$T3S=0.0,$T46=0.0,$T40=0.0,$T44=0.0,$T49=0.0,$T4l=0.0,$T4j=0.0,$T4p=0.0,$T4c=0.0,$T4m=0.0,$T4f=0.0,$T4n=0.0,$T47=0.0,$T48=0.0,$T4h=0.0,$T4i=0.0,$T4a=0.0,$T4b=0.0,$T4d=0.0,$T4e=0.0,$T4g=0.0,$T4q=0.0,$T4k=0.0,$T4o=0.0,$T3b=0.0,$T3n=0.0,$T3l=0.0,$T3r=0.0,$T3e=0.0,$T3o=0.0,$T3h=0.0,$T3p=0.0,$T39=0.0,$T3a=0.0,$T3j=0.0,$T3k=0.0,$T3c=0.0,$T3d=0.0,$T3f=0.0,$T3g=0.0,$T3i=0.0,$T3s=0.0,$T3m=0.0,$T3q=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<4<<3)>>3];$T3=$T1+$T2;$T1x=$T1-$T2;$T12=+HEAPF64[$2>>3];$T13=+HEAPF64[$2+($5<<4<<3)>>3];$T14=$T12+$T13;$T2S=$T12-$T13;$T4=+HEAPF64[$1+($5<<3<<3)>>3];$T5=+HEAPF64[$1+(($5*24|0)<<3)>>3];$T6=$T4+$T5;$T2R=$T4-$T5;$T15=+HEAPF64[$2+($5<<3<<3)>>3];$T16=+HEAPF64[$2+(($5*24|0)<<3)>>3];$T17=$T15+$T16;$T1y=$T15-$T16;$T7=$T3+$T6;$T4r=$T3-$T6;$T4Z=$T14-$T17;$T18=$T14+$T17;$T1z=$T1x-$T1y;$T3t=$T1x+$T1y;$T3T=$T2S-$T2R;$T2T=$T2R+$T2S;$T8=+HEAPF64[$1+($5<<2<<3)>>3];$T9=+HEAPF64[$1+(($5*20|0)<<3)>>3];$Ta=$T8+$T9;$T1B=$T8-$T9;$T19=+HEAPF64[$2+($5<<2<<3)>>3];$T1a=+HEAPF64[$2+(($5*20|0)<<3)>>3];$T1b=$T19+$T1a;$T1A=$T19-$T1a;$Tb=+HEAPF64[$1+(($5*28|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*12|0)<<3)>>3];$Td=$Tb+$Tc;$T1D=$Tb-$Tc;$T1c=+HEAPF64[$2+(($5*28|0)<<3)>>3];$T1d=+HEAPF64[$2+(($5*12|0)<<3)>>3];$T1e=$T1c+$T1d;$T1E=$T1c-$T1d;$Te=$Ta+$Td;$T1f=$T1b+$T1e;$T50=$Td-$Ta;$T4s=$T1b-$T1e;$T2U=$T1D-$T1E;$T2V=$T1B+$T1A;$T2W=($T2U-$T2V)*.7071067811865476;$T3u=($T2V+$T2U)*.7071067811865476;$T1C=$T1A-$T1B;$T1F=$T1D+$T1E;$T1G=($T1C-$T1F)*.7071067811865476;$T3U=($T1C+$T1F)*.7071067811865476;$Tg=+HEAPF64[$1+($5<<1<<3)>>3];$Th=+HEAPF64[$1+(($5*18|0)<<3)>>3];$Ti=$Tg+$Th;$T1L=$Tg-$Th;$T1h=+HEAPF64[$2+($5<<1<<3)>>3];$T1i=+HEAPF64[$2+(($5*18|0)<<3)>>3];$T1j=$T1h+$T1i;$T1J=$T1h-$T1i;$Tj=+HEAPF64[$1+(($5*10|0)<<3)>>3];$Tk=+HEAPF64[$1+(($5*26|0)<<3)>>3];$Tl=$Tj+$Tk;$T1I=$Tj-$Tk;$T1k=+HEAPF64[$2+(($5*10|0)<<3)>>3];$T1l=+HEAPF64[$2+(($5*26|0)<<3)>>3];$T1m=$T1k+$T1l;$T1M=$T1k-$T1l;$Tm=$Ti+$Tl;$T1n=$T1j+$T1m;$T1K=$T1I+$T1J;$T1N=$T1L-$T1M;$T1O=.3826834323650898*$T1K-.9238795325112867*$T1N;$T2Z=.9238795325112867*$T1K+.3826834323650898*$T1N;$T3w=$T1J-$T1I;$T3x=$T1L+$T1M;$T3y=.9238795325112867*$T3w-.3826834323650898*$T3x;$T3X=.3826834323650898*$T3w+.9238795325112867*$T3x;$T4u=$T1j-$T1m;$T4v=$Ti-$Tl;$T4w=$T4u-$T4v;$T53=$T4v+$T4u;$Tn=+HEAPF64[$1+(($5*30|0)<<3)>>3];$To=+HEAPF64[$1+(($5*14|0)<<3)>>3];$Tp=$Tn+$To;$T1S=$Tn-$To;$T1o=+HEAPF64[$2+(($5*30|0)<<3)>>3];$T1p=+HEAPF64[$2+(($5*14|0)<<3)>>3];$T1q=$T1o+$T1p;$T1Q=$T1o-$T1p;$Tq=+HEAPF64[$1+(($5*6|0)<<3)>>3];$Tr=+HEAPF64[$1+(($5*22|0)<<3)>>3];$Ts=$Tq+$Tr;$T1P=$Tq-$Tr;$T1r=+HEAPF64[$2+(($5*6|0)<<3)>>3];$T1s=+HEAPF64[$2+(($5*22|0)<<3)>>3];$T1t=$T1r+$T1s;$T1T=$T1r-$T1s;$Tt=$Tp+$Ts;$T1u=$T1q+$T1t;$T1R=$T1P+$T1Q;$T1U=$T1S-$T1T;$T1V=.3826834323650898*$T1R+.9238795325112867*$T1U;$T2Y=.3826834323650898*$T1U-.9238795325112867*$T1R;$T3z=$T1Q-$T1P;$T3A=$T1S+$T1T;$T3B=.9238795325112867*$T3z+.3826834323650898*$T3A;$T3W=.9238795325112867*$T3A-.3826834323650898*$T3z;$T4x=$Tp-$Ts;$T4y=$T1q-$T1t;$T4z=$T4x+$T4y;$T52=$T4x-$T4y;$TL=+HEAPF64[$1+(($5*31|0)<<3)>>3];$TM=+HEAPF64[$1+(($5*15|0)<<3)>>3];$TN=$TL+$TM;$T2p=$TL-$TM;$T2H=+HEAPF64[$2+(($5*31|0)<<3)>>3];$T2I=+HEAPF64[$2+(($5*15|0)<<3)>>3];$T2J=$T2H-$T2I;$T4S=$T2H+$T2I;$TO=+HEAPF64[$1+(($5*7|0)<<3)>>3];$TP=+HEAPF64[$1+(($5*23|0)<<3)>>3];$TQ=$TO+$TP;$T2G=$TO-$TP;$T2q=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T2r=+HEAPF64[$2+(($5*23|0)<<3)>>3];$T2s=$T2q-$T2r;$T4T=$T2q+$T2r;$TS=+HEAPF64[$1+(($5*3|0)<<3)>>3];$TT=+HEAPF64[$1+(($5*19|0)<<3)>>3];$TU=$TS+$TT;$T2x=$TS-$TT;$T2u=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T2v=+HEAPF64[$2+(($5*19|0)<<3)>>3];$T2w=$T2u-$T2v;$T4O=$T2u+$T2v;$TV=+HEAPF64[$1+(($5*27|0)<<3)>>3];$TW=+HEAPF64[$1+(($5*11|0)<<3)>>3];$TX=$TV+$TW;$T2z=$TV-$TW;$T2A=+HEAPF64[$2+(($5*27|0)<<3)>>3];$T2B=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T2C=$T2A-$T2B;$T4P=$T2A+$T2B;$T2t=$T2p-$T2s;$T3L=$T2p+$T2s;$T3O=$T2J-$T2G;$T2K=$T2G+$T2J;$TR=$TN+$TQ;$TY=$TU+$TX;$T5F=$TR-$TY;$T5G=$T4S+$T4T;$T5H=$T4O+$T4P;$T5I=$T5G-$T5H;$T4N=$TN-$TQ;$T4Q=$T4O-$T4P;$T4R=$T4N-$T4Q;$T5j=$T4N+$T4Q;$T2y=$T2w-$T2x;$T2D=$T2z+$T2C;$T2E=($T2y-$T2D)*.7071067811865476;$T3P=($T2y+$T2D)*.7071067811865476;$T4U=$T4S-$T4T;$T4V=$TX-$TU;$T4W=$T4U-$T4V;$T5k=$T4V+$T4U;$T2L=$T2z-$T2C;$T2M=$T2x+$T2w;$T2N=($T2L-$T2M)*.7071067811865476;$T3M=($T2M+$T2L)*.7071067811865476;$Tw=+HEAPF64[$1+($5<<3)>>3];$Tx=+HEAPF64[$1+(($5*17|0)<<3)>>3];$Ty=$Tw+$Tx;$T2f=$Tw-$Tx;$T1Z=+HEAPF64[$2+($5<<3)>>3];$T20=+HEAPF64[$2+(($5*17|0)<<3)>>3];$T21=$T1Z-$T20;$T4C=$T1Z+$T20;$Tz=+HEAPF64[$1+(($5*9|0)<<3)>>3];$TA=+HEAPF64[$1+(($5*25|0)<<3)>>3];$TB=$Tz+$TA;$T1Y=$Tz-$TA;$T2g=+HEAPF64[$2+(($5*9|0)<<3)>>3];$T2h=+HEAPF64[$2+(($5*25|0)<<3)>>3];$T2i=$T2g-$T2h;$T4D=$T2g+$T2h;$TD=+HEAPF64[$1+(($5*5|0)<<3)>>3];$TE=+HEAPF64[$1+(($5*21|0)<<3)>>3];$TF=$TD+$TE;$T28=$TD-$TE;$T29=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T2a=+HEAPF64[$2+(($5*21|0)<<3)>>3];$T2b=$T29-$T2a;$T4I=$T29+$T2a;$TG=+HEAPF64[$1+(($5*29|0)<<3)>>3];$TH=+HEAPF64[$1+(($5*13|0)<<3)>>3];$TI=$TG+$TH;$T23=$TG-$TH;$T24=+HEAPF64[$2+(($5*29|0)<<3)>>3];$T25=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T26=$T24-$T25;$T4J=$T24+$T25;$T22=$T1Y+$T21;$T3E=$T2f+$T2i;$T3H=$T21-$T1Y;$T2j=$T2f-$T2i;$TC=$Ty+$TB;$TJ=$TF+$TI;$T5A=$TC-$TJ;$T5B=$T4C+$T4D;$T5C=$T4I+$T4J;$T5D=$T5B-$T5C;$T4E=$T4C-$T4D;$T4F=$TI-$TF;$T4G=$T4E-$T4F;$T5g=$T4F+$T4E;$T27=$T23-$T26;$T2c=$T28+$T2b;$T2d=($T27-$T2c)*.7071067811865476;$T3F=($T2c+$T27)*.7071067811865476;$T4H=$Ty-$TB;$T4K=$T4I-$T4J;$T4L=$T4H-$T4K;$T5h=$T4H+$T4K;$T2k=$T2b-$T28;$T2l=$T23+$T26;$T2m=($T2k-$T2l)*.7071067811865476;$T3I=($T2k+$T2l)*.7071067811865476;$T4t=$T4r-$T4s;$T4A=($T4w-$T4z)*.7071067811865476;$T4B=$T4t+$T4A;$T57=$T4t-$T4A;$T58=.3826834323650898*$T4G-.9238795325112867*$T4L;$T59=.3826834323650898*$T4W+.9238795325112867*$T4R;$T5a=$T58-$T59;$T5c=$T58+$T59;$T4M=.9238795325112867*$T4G+.3826834323650898*$T4L;$T4X=.3826834323650898*$T4R-.9238795325112867*$T4W;$T4Y=$T4M+$T4X;$T56=$T4X-$T4M;$T51=$T4Z-$T50;$T54=($T52-$T53)*.7071067811865476;$T55=$T51-$T54;$T5b=$T51+$T54;HEAPF64[$3+(($6*22|0)<<3)>>3]=$T4B-$T4Y;HEAPF64[$4+(($6*22|0)<<3)>>3]=$T5b-$T5c;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T4B+$T4Y;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T5b+$T5c;HEAPF64[$4+(($6*30|0)<<3)>>3]=$T55-$T56;HEAPF64[$3+(($6*30|0)<<3)>>3]=$T57-$T5a;HEAPF64[$4+(($6*14|0)<<3)>>3]=$T55+$T56;HEAPF64[$3+(($6*14|0)<<3)>>3]=$T57+$T5a;$T5d=$T4r+$T4s;$T5e=($T53+$T52)*.7071067811865476;$T5f=$T5d+$T5e;$T5r=$T5d-$T5e;$T5s=.9238795325112867*$T5g-.3826834323650898*$T5h;$T5t=.9238795325112867*$T5k+.3826834323650898*$T5j;$T5u=$T5s-$T5t;$T5w=$T5s+$T5t;$T5i=.3826834323650898*$T5g+.9238795325112867*$T5h;$T5l=.9238795325112867*$T5j-.3826834323650898*$T5k;$T5m=$T5i+$T5l;$T5q=$T5l-$T5i;$T5n=$T50+$T4Z;$T5o=($T4w+$T4z)*.7071067811865476;$T5p=$T5n-$T5o;$T5v=$T5n+$T5o;HEAPF64[$3+(($6*18|0)<<3)>>3]=$T5f-$T5m;HEAPF64[$4+(($6*18|0)<<3)>>3]=$T5v-$T5w;HEAPF64[$3+($6<<1<<3)>>3]=$T5f+$T5m;HEAPF64[$4+($6<<1<<3)>>3]=$T5v+$T5w;HEAPF64[$4+(($6*26|0)<<3)>>3]=$T5p-$T5q;HEAPF64[$3+(($6*26|0)<<3)>>3]=$T5r-$T5u;HEAPF64[$4+(($6*10|0)<<3)>>3]=$T5p+$T5q;HEAPF64[$3+(($6*10|0)<<3)>>3]=$T5r+$T5u;$T5x=$T7-$Te;$T5y=$T1n-$T1u;$T5z=$T5x+$T5y;$T5P=$T5x-$T5y;$T5Q=$T5D-$T5A;$T5R=$T5F+$T5I;$T5S=($T5Q-$T5R)*.7071067811865476;$T5U=($T5Q+$T5R)*.7071067811865476;$T5E=$T5A+$T5D;$T5J=$T5F-$T5I;$T5K=($T5E+$T5J)*.7071067811865476;$T5O=($T5J-$T5E)*.7071067811865476;$T5L=$T18-$T1f;$T5M=$Tt-$Tm;$T5N=$T5L-$T5M;$T5T=$T5M+$T5L;HEAPF64[$3+(($6*20|0)<<3)>>3]=$T5z-$T5K;HEAPF64[$4+(($6*20|0)<<3)>>3]=$T5T-$T5U;HEAPF64[$3+($6<<2<<3)>>3]=$T5z+$T5K;HEAPF64[$4+($6<<2<<3)>>3]=$T5T+$T5U;HEAPF64[$4+(($6*28|0)<<3)>>3]=$T5N-$T5O;HEAPF64[$3+(($6*28|0)<<3)>>3]=$T5P-$T5S;HEAPF64[$4+(($6*12|0)<<3)>>3]=$T5N+$T5O;HEAPF64[$3+(($6*12|0)<<3)>>3]=$T5P+$T5S;$Tf=$T7+$Te;$Tu=$Tm+$Tt;$Tv=$Tf+$Tu;$T5V=$Tf-$Tu;$T5W=$T5B+$T5C;$T5X=$T5G+$T5H;$T5Y=$T5W-$T5X;$T60=$T5W+$T5X;$TK=$TC+$TJ;$TZ=$TR+$TY;$T10=$TK+$TZ;$T11=$TZ-$TK;$T1g=$T18+$T1f;$T1v=$T1n+$T1u;$T1w=$T1g-$T1v;$T5Z=$T1g+$T1v;HEAPF64[$3+($6<<4<<3)>>3]=$Tv-$T10;HEAPF64[$4+($6<<4<<3)>>3]=$T5Z-$T60;HEAPF64[$3>>3]=$Tv+$T10;HEAPF64[$4>>3]=$T5Z+$T60;HEAPF64[$4+($6<<3<<3)>>3]=$T11+$T1w;HEAPF64[$3+($6<<3<<3)>>3]=$T5V+$T5Y;HEAPF64[$4+(($6*24|0)<<3)>>3]=$T1w-$T11;HEAPF64[$3+(($6*24|0)<<3)>>3]=$T5V-$T5Y;$T1H=$T1z-$T1G;$T1W=$T1O-$T1V;$T1X=$T1H+$T1W;$T33=$T1H-$T1W;$T2X=$T2T-$T2W;$T30=$T2Y-$T2Z;$T31=$T2X-$T30;$T37=$T2X+$T30;$T2e=$T22-$T2d;$T2n=$T2j-$T2m;$T2o=.9807852804032304*$T2e+.19509032201612828*$T2n;$T34=.19509032201612828*$T2e-.9807852804032304*$T2n;$T2F=$T2t-$T2E;$T2O=$T2K-$T2N;$T2P=.19509032201612828*$T2F-.9807852804032304*$T2O;$T35=.19509032201612828*$T2O+.9807852804032304*$T2F;$T2Q=$T2o+$T2P;HEAPF64[$3+(($6*23|0)<<3)>>3]=$T1X-$T2Q;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T1X+$T2Q;$T38=$T34+$T35;HEAPF64[$4+(($6*23|0)<<3)>>3]=$T37-$T38;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T37+$T38;$T32=$T2P-$T2o;HEAPF64[$4+(($6*31|0)<<3)>>3]=$T31-$T32;HEAPF64[$4+(($6*15|0)<<3)>>3]=$T31+$T32;$T36=$T34-$T35;HEAPF64[$3+(($6*31|0)<<3)>>3]=$T33-$T36;HEAPF64[$3+(($6*15|0)<<3)>>3]=$T33+$T36;$T3v=$T3t-$T3u;$T3C=$T3y-$T3B;$T3D=$T3v+$T3C;$T41=$T3v-$T3C;$T3V=$T3T-$T3U;$T3Y=$T3W-$T3X;$T3Z=$T3V-$T3Y;$T45=$T3V+$T3Y;$T3G=$T3E-$T3F;$T3J=$T3H-$T3I;$T3K=.5555702330196022*$T3G+.8314696123025452*$T3J;$T42=.5555702330196022*$T3J-.8314696123025452*$T3G;$T3N=$T3L-$T3M;$T3Q=$T3O-$T3P;$T3R=.5555702330196022*$T3N-.8314696123025452*$T3Q;$T43=.8314696123025452*$T3N+.5555702330196022*$T3Q;$T3S=$T3K+$T3R;HEAPF64[$3+(($6*21|0)<<3)>>3]=$T3D-$T3S;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T3D+$T3S;$T46=$T42+$T43;HEAPF64[$4+(($6*21|0)<<3)>>3]=$T45-$T46;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T45+$T46;$T40=$T3R-$T3K;HEAPF64[$4+(($6*29|0)<<3)>>3]=$T3Z-$T40;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T3Z+$T40;$T44=$T42-$T43;HEAPF64[$3+(($6*29|0)<<3)>>3]=$T41-$T44;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T41+$T44;$T47=$T3t+$T3u;$T48=$T3X+$T3W;$T49=$T47+$T48;$T4l=$T47-$T48;$T4h=$T3T+$T3U;$T4i=$T3y+$T3B;$T4j=$T4h-$T4i;$T4p=$T4h+$T4i;$T4a=$T3E+$T3F;$T4b=$T3H+$T3I;$T4c=.9807852804032304*$T4a+.19509032201612828*$T4b;$T4m=.9807852804032304*$T4b-.19509032201612828*$T4a;$T4d=$T3L+$T3M;$T4e=$T3O+$T3P;$T4f=.9807852804032304*$T4d-.19509032201612828*$T4e;$T4n=.19509032201612828*$T4d+.9807852804032304*$T4e;$T4g=$T4c+$T4f;HEAPF64[$3+(($6*17|0)<<3)>>3]=$T49-$T4g;HEAPF64[$3+($6<<3)>>3]=$T49+$T4g;$T4q=$T4m+$T4n;HEAPF64[$4+(($6*17|0)<<3)>>3]=$T4p-$T4q;HEAPF64[$4+($6<<3)>>3]=$T4p+$T4q;$T4k=$T4f-$T4c;HEAPF64[$4+(($6*25|0)<<3)>>3]=$T4j-$T4k;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T4j+$T4k;$T4o=$T4m-$T4n;HEAPF64[$3+(($6*25|0)<<3)>>3]=$T4l-$T4o;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T4l+$T4o;$T39=$T1z+$T1G;$T3a=$T2Z+$T2Y;$T3b=$T39+$T3a;$T3n=$T39-$T3a;$T3j=$T2T+$T2W;$T3k=$T1O+$T1V;$T3l=$T3j-$T3k;$T3r=$T3j+$T3k;$T3c=$T22+$T2d;$T3d=$T2j+$T2m;$T3e=.5555702330196022*$T3c+.8314696123025452*$T3d;$T3o=.8314696123025452*$T3c-.5555702330196022*$T3d;$T3f=$T2t+$T2E;$T3g=$T2K+$T2N;$T3h=.8314696123025452*$T3f-.5555702330196022*$T3g;$T3p=.8314696123025452*$T3g+.5555702330196022*$T3f;$T3i=$T3e+$T3h;HEAPF64[$3+(($6*19|0)<<3)>>3]=$T3b-$T3i;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T3b+$T3i;$T3s=$T3o+$T3p;HEAPF64[$4+(($6*19|0)<<3)>>3]=$T3r-$T3s;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T3r+$T3s;$T3m=$T3h-$T3e;HEAPF64[$4+(($6*27|0)<<3)>>3]=$T3l-$T3m;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T3l+$T3m;$T3q=$T3o-$T3p;HEAPF64[$3+(($6*27|0)<<3)>>3]=$T3n-$T3q;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T3n+$T3q;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_4($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T3=0.0,$Tb=0.0,$T9=0.0,$Tf=0.0,$T6=0.0,$Ta=0.0,$Te=0.0,$Tg=0.0,$T1=0.0,$T2=0.0,$T7=0.0,$T8=0.0,$T4=0.0,$T5=0.0,$Tc=0.0,$Td=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<1<<3)>>3];$T3=$T1+$T2;$Tb=$T1-$T2;$T7=+HEAPF64[$2>>3];$T8=+HEAPF64[$2+($5<<1<<3)>>3];$T9=$T7-$T8;$Tf=$T7+$T8;$T4=+HEAPF64[$1+($5<<3)>>3];$T5=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T6=$T4+$T5;$Ta=$T4-$T5;$Tc=+HEAPF64[$2+($5<<3)>>3];$Td=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Te=$Tc-$Td;$Tg=$Tc+$Td;HEAPF64[$3+($6<<1<<3)>>3]=$T3-$T6;HEAPF64[$4+($6<<1<<3)>>3]=$Tf-$Tg;HEAPF64[$3>>3]=$T3+$T6;HEAPF64[$4>>3]=$Tf+$Tg;HEAPF64[$4+($6<<3)>>3]=$T9-$Ta;HEAPF64[$3+($6<<3)>>3]=$Tb+$Te;HEAPF64[$4+(($6*3|0)<<3)>>3]=$Ta+$T9;HEAPF64[$3+(($6*3|0)<<3)>>3]=$Tb-$Te;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;label=2;break;case 5:return}}function _n1_5($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$To=0.0,$T8=0.0,$Tt=0.0,$T9=0.0,$Ts=0.0,$Te=0.0,$Tp=0.0,$Th=0.0,$Tn=0.0,$T2=0.0,$T3=0.0,$T4=0.0,$T5=0.0,$T6=0.0,$T7=0.0,$Tc=0.0,$Td=0.0,$Tl=0.0,$Tf=0.0,$Tg=0.0,$Tm=0.0,$Ti=0.0,$Tk=0.0,$Tb=0.0,$Tj=0.0,$Ta=0.0,$Tu=0.0,$Tv=0.0,$Tr=0.0,$Tw=0.0,$Tq=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$To=+HEAPF64[$2>>3];$T2=+HEAPF64[$1+($5<<3)>>3];$T3=+HEAPF64[$1+($5<<2<<3)>>3];$T4=$T2+$T3;$T5=+HEAPF64[$1+($5<<1<<3)>>3];$T6=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T7=$T5+$T6;$T8=$T4+$T7;$Tt=$T5-$T6;$T9=($T4-$T7)*.5590169943749475;$Ts=$T2-$T3;$Tc=+HEAPF64[$2+($5<<3)>>3];$Td=+HEAPF64[$2+($5<<2<<3)>>3];$Tl=$Tc+$Td;$Tf=+HEAPF64[$2+($5<<1<<3)>>3];$Tg=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tm=$Tf+$Tg;$Te=$Tc-$Td;$Tp=$Tl+$Tm;$Th=$Tf-$Tg;$Tn=($Tl-$Tm)*.5590169943749475;HEAPF64[$3>>3]=$T1+$T8;HEAPF64[$4>>3]=$To+$Tp;$Ti=.9510565162951535*$Te+.5877852522924731*$Th;$Tk=.9510565162951535*$Th-.5877852522924731*$Te;$Ta=$T1-.25*$T8;$Tb=$T9+$Ta;$Tj=$Ta-$T9;HEAPF64[$3+($6<<2<<3)>>3]=$Tb-$Ti;HEAPF64[$3+(($6*3|0)<<3)>>3]=$Tj+$Tk;HEAPF64[$3+($6<<3)>>3]=$Tb+$Ti;HEAPF64[$3+($6<<1<<3)>>3]=$Tj-$Tk;$Tu=.9510565162951535*$Ts+.5877852522924731*$Tt;$Tv=.9510565162951535*$Tt-.5877852522924731*$Ts;$Tq=$To-.25*$Tp;$Tr=$Tn+$Tq;$Tw=$Tq-$Tn;HEAPF64[$4+($6<<3)>>3]=$Tr-$Tu;HEAPF64[$4+(($6*3|0)<<3)>>3]=$Tw-$Tv;HEAPF64[$4+($6<<2<<3)>>3]=$Tu+$Tr;HEAPF64[$4+($6<<1<<3)>>3]=$Tv+$Tw;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_6($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T3=0.0,$Tb=0.0,$Tq=0.0,$Tx=0.0,$T6=0.0,$Tc=0.0,$T9=0.0,$Td=0.0,$Ta=0.0,$Te=0.0,$Ti=0.0,$Tu=0.0,$Tl=0.0,$Tv=0.0,$Tr=0.0,$Ty=0.0,$T1=0.0,$T2=0.0,$To=0.0,$Tp=0.0,$T4=0.0,$T5=0.0,$T7=0.0,$T8=0.0,$Tg=0.0,$Th=0.0,$Tj=0.0,$Tk=0.0,$Tf=0.0,$Tm=0.0,$Tn=0.0,$Ts=0.0,$Tt=0.0,$Tw=0.0,$Tz=0.0,$TA=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T3=$T1-$T2;$Tb=$T1+$T2;$To=+HEAPF64[$2>>3];$Tp=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tq=$To-$Tp;$Tx=$To+$Tp;$T4=+HEAPF64[$1+($5<<1<<3)>>3];$T5=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T6=$T4-$T5;$Tc=$T4+$T5;$T7=+HEAPF64[$1+($5<<2<<3)>>3];$T8=+HEAPF64[$1+($5<<3)>>3];$T9=$T7-$T8;$Td=$T7+$T8;$Ta=$T6+$T9;$Te=$Tc+$Td;$Tg=+HEAPF64[$2+($5<<1<<3)>>3];$Th=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Ti=$Tg-$Th;$Tu=$Tg+$Th;$Tj=+HEAPF64[$2+($5<<2<<3)>>3];$Tk=+HEAPF64[$2+($5<<3)>>3];$Tl=$Tj-$Tk;$Tv=$Tj+$Tk;$Tr=$Ti+$Tl;$Ty=$Tu+$Tv;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T3+$Ta;HEAPF64[$4+(($6*3|0)<<3)>>3]=$Tq+$Tr;HEAPF64[$3>>3]=$Tb+$Te;HEAPF64[$4>>3]=$Tx+$Ty;$Tf=$T3-.5*$Ta;$Tm=($Ti-$Tl)*.8660254037844386;HEAPF64[$3+(($6*5|0)<<3)>>3]=$Tf-$Tm;HEAPF64[$3+($6<<3)>>3]=$Tf+$Tm;$Tn=($T9-$T6)*.8660254037844386;$Ts=$Tq-.5*$Tr;HEAPF64[$4+($6<<3)>>3]=$Tn+$Ts;HEAPF64[$4+(($6*5|0)<<3)>>3]=$Ts-$Tn;$Tt=$Tb-.5*$Te;$Tw=($Tu-$Tv)*.8660254037844386;HEAPF64[$3+($6<<1<<3)>>3]=$Tt-$Tw;HEAPF64[$3+($6<<2<<3)>>3]=$Tt+$Tw;$Tz=$Tx-.5*$Ty;$TA=($Td-$Tc)*.8660254037844386;HEAPF64[$4+($6<<1<<3)>>3]=$Tz-$TA;HEAPF64[$4+($6<<2<<3)>>3]=$TA+$Tz;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_4($p){$p=$p|0;_fftw_kdft_register($p,582,9320);return}function _fftw_codelet_n1_5($p){$p=$p|0;_fftw_kdft_register($p,584,9256);return}function _fftw_codelet_n1_6($p){$p=$p|0;_fftw_kdft_register($p,156,9192);return}function _fftw_codelet_n1_64($p){$p=$p|0;_fftw_kdft_register($p,1474,9128);return}function _n1_64($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T37=0.0,$T7B=0.0,$T8F=0.0,$T5Z=0.0,$Tf=0.0,$Td9=0.0,$TbB=0.0,$TcB=0.0,$T62=0.0,$T7C=0.0,$T2i=0.0,$TdH=0.0,$Tah=0.0,$Tcb=0.0,$T3e=0.0,$T8G=0.0,$Tu=0.0,$TdI=0.0,$Tak=0.0,$TbD=0.0,$Tan=0.0,$TbC=0.0,$T2x=0.0,$Tda=0.0,$T3m=0.0,$T65=0.0,$T7G=0.0,$T8J=0.0,$T7J=0.0,$T8I=0.0,$T3t=0.0,$T64=0.0,$TK=0.0,$Tdd=0.0,$Tas=0.0,$Tce=0.0,$Tav=0.0,$Tcf=0.0,$T2N=0.0,$Tdc=0.0,$T3G=0.0,$T6G=0.0,$T7O=0.0,$T9k=0.0,$T7R=0.0,$T9l=0.0,$T3N=0.0,$T6H=0.0,$T1L=0.0,$Tdv=0.0,$Tbs=0.0,$Tcw=0.0,$TdC=0.0,$Teo=0.0,$T5j=0.0,$T6V=0.0,$T5Q=0.0,$T6Y=0.0,$T8y=0.0,$T9C=0.0,$Tbb=0.0,$Tct=0.0,$T8n=0.0,$T9z=0.0,$TZ=0.0,$Tdf=0.0,$Taz=0.0,$Tch=0.0,$TaC=0.0,$Tci=0.0,$T32=0.0,$Tdg=0.0,$T3Z=0.0,$T6J=0.0,$T7V=0.0,$T9n=0.0,$T7Y=0.0,$T9o=0.0,$T46=0.0,$T6K=0.0,$T1g=0.0,$Tdp=0.0,$Tb1=0.0,$Tcm=0.0,$Tdm=0.0,$Tej=0.0,$T4q=0.0,$T6R=0.0,$T4X=0.0,$T6O=0.0,$T8f=0.0,$T9s=0.0,$TaK=0.0,$Tcp=0.0,$T84=0.0,$T9v=0.0,$T1v=0.0,$Tdn=0.0,$Tb4=0.0,$Tcq=0.0,$Tds=0.0,$Tek=0.0,$T4N=0.0,$T6P=0.0,$T50=0.0,$T6S=0.0,$T8i=0.0,$T9w=0.0,$TaV=0.0,$Tcn=0.0,$T8b=0.0,$T9t=0.0,$T20=0.0,$TdD=0.0,$Tbv=0.0,$Tcu=0.0,$Tdy=0.0,$Tep=0.0,$T5G=0.0,$T6Z=0.0,$T5T=0.0,$T6W=0.0,$T8B=0.0,$T9A=0.0,$Tbm=0.0,$Tcx=0.0,$T8u=0.0,$T9D=0.0,$T3=0.0,$T35=0.0,$T26=0.0,$T5Y=0.0,$T6=0.0,$T5X=0.0,$T29=0.0,$T36=0.0,$Ta=0.0,$T39=0.0,$T2d=0.0,$T38=0.0,$Td=0.0,$T3b=0.0,$T2g=0.0,$T3c=0.0,$T1=0.0,$T2=0.0,$T24=0.0,$T25=0.0,$T4=0.0,$T5=0.0,$T27=0.0,$T28=0.0,$T8=0.0,$T9=0.0,$T2b=0.0,$T2c=0.0,$Tb=0.0,$Tc=0.0,$T2e=0.0,$T2f=0.0,$T7=0.0,$Te=0.0,$T2a=0.0,$T2h=0.0,$Tbz=0.0,$TbA=0.0,$T60=0.0,$T61=0.0,$Taf=0.0,$Tag=0.0,$T3a=0.0,$T3d=0.0,$Ti=0.0,$T3j=0.0,$T2l=0.0,$T3h=0.0,$Tl=0.0,$T3g=0.0,$T2o=0.0,$T3k=0.0,$Tp=0.0,$T3q=0.0,$T2s=0.0,$T3o=0.0,$Ts=0.0,$T3n=0.0,$T2v=0.0,$T3r=0.0,$Tg=0.0,$Th=0.0,$T2j=0.0,$T2k=0.0,$Tj=0.0,$Tk=0.0,$T2m=0.0,$T2n=0.0,$Tn=0.0,$To=0.0,$T2q=0.0,$T2r=0.0,$Tq=0.0,$Tr=0.0,$T2t=0.0,$T2u=0.0,$Tm=0.0,$Tt=0.0,$Tai=0.0,$Taj=0.0,$Tal=0.0,$Tam=0.0,$T2p=0.0,$T2w=0.0,$T3i=0.0,$T3l=0.0,$T7E=0.0,$T7F=0.0,$T7H=0.0,$T7I=0.0,$T3p=0.0,$T3s=0.0,$Ty=0.0,$T3H=0.0,$T2B=0.0,$T3x=0.0,$TB=0.0,$T3w=0.0,$T2E=0.0,$T3I=0.0,$TI=0.0,$T3L=0.0,$T2L=0.0,$T3B=0.0,$TF=0.0,$T3K=0.0,$T2I=0.0,$T3E=0.0,$Tw=0.0,$Tx=0.0,$T2C=0.0,$T2D=0.0,$T2z=0.0,$T2A=0.0,$Tz=0.0,$TA=0.0,$TG=0.0,$TH=0.0,$T3z=0.0,$T2J=0.0,$T2K=0.0,$T3A=0.0,$TD=0.0,$TE=0.0,$T3C=0.0,$T2G=0.0,$T2H=0.0,$T3D=0.0,$TC=0.0,$TJ=0.0,$Taq=0.0,$Tar=0.0,$Tat=0.0,$Tau=0.0,$T2F=0.0,$T2M=0.0,$T3y=0.0,$T3F=0.0,$T7M=0.0,$T7N=0.0,$T7P=0.0,$T7Q=0.0,$T3J=0.0,$T3M=0.0,$T1z=0.0,$T53=0.0,$T5L=0.0,$Tbo=0.0,$T1C=0.0,$T5I=0.0,$T56=0.0,$Tbp=0.0,$T1J=0.0,$Tb9=0.0,$T5h=0.0,$T5N=0.0,$T1G=0.0,$Tb8=0.0,$T5c=0.0,$T5O=0.0,$T1x=0.0,$T1y=0.0,$T54=0.0,$T55=0.0,$T5J=0.0,$T5K=0.0,$T1A=0.0,$T1B=0.0,$T1H=0.0,$T1I=0.0,$T5d=0.0,$T5e=0.0,$T5f=0.0,$T5g=0.0,$T1E=0.0,$T1F=0.0,$T5b=0.0,$T58=0.0,$T59=0.0,$T5a=0.0,$T1D=0.0,$T1K=0.0,$Tbq=0.0,$Tbr=0.0,$TdA=0.0,$TdB=0.0,$T57=0.0,$T5i=0.0,$T5M=0.0,$T5P=0.0,$T8w=0.0,$T8x=0.0,$Tb7=0.0,$Tba=0.0,$T8l=0.0,$T8m=0.0,$TN=0.0,$T40=0.0,$T2Q=0.0,$T3Q=0.0,$TQ=0.0,$T3P=0.0,$T2T=0.0,$T41=0.0,$TX=0.0,$T44=0.0,$T30=0.0,$T3U=0.0,$TU=0.0,$T43=0.0,$T2X=0.0,$T3X=0.0,$TL=0.0,$TM=0.0,$T2R=0.0,$T2S=0.0,$T2O=0.0,$T2P=0.0,$TO=0.0,$TP=0.0,$TV=0.0,$TW=0.0,$T3S=0.0,$T2Y=0.0,$T2Z=0.0,$T3T=0.0,$TS=0.0,$TT=0.0,$T3V=0.0,$T2V=0.0,$T2W=0.0,$T3W=0.0,$TR=0.0,$TY=0.0,$Tax=0.0,$Tay=0.0,$TaA=0.0,$TaB=0.0,$T2U=0.0,$T31=0.0,$T3R=0.0,$T3Y=0.0,$T7T=0.0,$T7U=0.0,$T7W=0.0,$T7X=0.0,$T42=0.0,$T45=0.0,$T14=0.0,$T4P=0.0,$T4d=0.0,$TaG=0.0,$T17=0.0,$T4a=0.0,$T4S=0.0,$TaH=0.0,$T1e=0.0,$TaZ=0.0,$T4j=0.0,$T4V=0.0,$T1b=0.0,$TaY=0.0,$T4o=0.0,$T4U=0.0,$T12=0.0,$T13=0.0,$T4Q=0.0,$T4R=0.0,$T4b=0.0,$T4c=0.0,$T15=0.0,$T16=0.0,$T1c=0.0,$T1d=0.0,$T4f=0.0,$T4g=0.0,$T4h=0.0,$T4i=0.0,$T19=0.0,$T1a=0.0,$T4k=0.0,$T4l=0.0,$T4m=0.0,$T4n=0.0,$T18=0.0,$T1f=0.0,$TaX=0.0,$Tb0=0.0,$Tdk=0.0,$Tdl=0.0,$T4e=0.0,$T4p=0.0,$T4T=0.0,$T4W=0.0,$T8d=0.0,$T8e=0.0,$TaI=0.0,$TaJ=0.0,$T82=0.0,$T83=0.0,$T1j=0.0,$TaR=0.0,$T1m=0.0,$TaS=0.0,$T4G=0.0,$T4L=0.0,$TaT=0.0,$TaQ=0.0,$T89=0.0,$T88=0.0,$T1q=0.0,$TaM=0.0,$T1t=0.0,$TaN=0.0,$T4v=0.0,$T4A=0.0,$TaO=0.0,$TaL=0.0,$T86=0.0,$T85=0.0,$T4H=0.0,$T4F=0.0,$T4C=0.0,$T4K=0.0,$T1h=0.0,$T1i=0.0,$T4D=0.0,$T4E=0.0,$T1k=0.0,$T1l=0.0,$T4I=0.0,$T4J=0.0,$T4r=0.0,$T4z=0.0,$T4w=0.0,$T4u=0.0,$T1o=0.0,$T1p=0.0,$T4x=0.0,$T4y=0.0,$T1r=0.0,$T1s=0.0,$T4s=0.0,$T4t=0.0,$T1n=0.0,$T1u=0.0,$Tb2=0.0,$Tb3=0.0,$Tdq=0.0,$Tdr=0.0,$T4B=0.0,$T4M=0.0,$T4Y=0.0,$T4Z=0.0,$T8g=0.0,$T8h=0.0,$TaP=0.0,$TaU=0.0,$T87=0.0,$T8a=0.0,$T1O=0.0,$Tbc=0.0,$T1R=0.0,$Tbd=0.0,$T5o=0.0,$T5t=0.0,$Tbf=0.0,$Tbe=0.0,$T8p=0.0,$T8o=0.0,$T1V=0.0,$Tbi=0.0,$T1Y=0.0,$Tbj=0.0,$T5z=0.0,$T5E=0.0,$Tbk=0.0,$Tbh=0.0,$T8s=0.0,$T8r=0.0,$T5p=0.0,$T5n=0.0,$T5k=0.0,$T5s=0.0,$T1M=0.0,$T1N=0.0,$T5l=0.0,$T5m=0.0,$T1P=0.0,$T1Q=0.0,$T5q=0.0,$T5r=0.0,$T5A=0.0,$T5y=0.0,$T5v=0.0,$T5D=0.0,$T1T=0.0,$T1U=0.0,$T5w=0.0,$T5x=0.0,$T1W=0.0,$T1X=0.0,$T5B=0.0,$T5C=0.0,$T1S=0.0,$T1Z=0.0,$Tbt=0.0,$Tbu=0.0,$Tdw=0.0,$Tdx=0.0,$T5u=0.0,$T5F=0.0,$T5R=0.0,$T5S=0.0,$T8z=0.0,$T8A=0.0,$Tbg=0.0,$Tbl=0.0,$T8q=0.0,$T8t=0.0,$T11=0.0,$TeD=0.0,$TeG=0.0,$TeI=0.0,$T22=0.0,$T23=0.0,$T34=0.0,$TeH=0.0,$Tv=0.0,$T10=0.0,$TeE=0.0,$TeF=0.0,$T1w=0.0,$T21=0.0,$T2y=0.0,$T33=0.0,$Teh=0.0,$Tex=0.0,$Tev=0.0,$TeB=0.0,$Tem=0.0,$Tey=0.0,$Ter=0.0,$Tez=0.0,$Tef=0.0,$Teg=0.0,$Tet=0.0,$Teu=0.0,$Tei=0.0,$Tel=0.0,$Ten=0.0,$Teq=0.0,$Tes=0.0,$TeC=0.0,$Tew=0.0,$TeA=0.0,$Tdb=0.0,$TdV=0.0,$Te5=0.0,$TdJ=0.0,$Tdi=0.0,$Te6=0.0,$Te3=0.0,$Teb=0.0,$TdM=0.0,$TdW=0.0,$Tdu=0.0,$TdQ=0.0,$Te0=0.0,$Tea=0.0,$TdF=0.0,$TdR=0.0,$Tde=0.0,$Tdh=0.0,$Tdo=0.0,$Tdt=0.0,$Te1=0.0,$Te2=0.0,$TdK=0.0,$TdL=0.0,$TdY=0.0,$TdZ=0.0,$Tdz=0.0,$TdE=0.0,$Tdj=0.0,$TdG=0.0,$TdT=0.0,$TdU=0.0,$TdN=0.0,$TdO=0.0,$TdP=0.0,$TdS=0.0,$TdX=0.0,$Te4=0.0,$Ted=0.0,$Tee=0.0,$Te7=0.0,$Te8=0.0,$Te9=0.0,$Tec=0.0,$Tcd=0.0,$TcP=0.0,$TcD=0.0,$TcZ=0.0,$Tck=0.0,$Td0=0.0,$TcX=0.0,$Td5=0.0,$Tcs=0.0,$TcK=0.0,$TcG=0.0,$TcQ=0.0,$TcU=0.0,$Td4=0.0,$Tcz=0.0,$TcL=0.0,$Tcc=0.0,$TcC=0.0,$Tcg=0.0,$Tcj=0.0,$TcV=0.0,$TcW=0.0,$Tco=0.0,$Tcr=0.0,$TcE=0.0,$TcF=0.0,$TcS=0.0,$TcT=0.0,$Tcv=0.0,$Tcy=0.0,$Tcl=0.0,$TcA=0.0,$TcN=0.0,$TcO=0.0,$TcH=0.0,$TcI=0.0,$TcJ=0.0,$TcM=0.0,$TcR=0.0,$TcY=0.0,$Td7=0.0,$Td8=0.0,$Td1=0.0,$Td2=0.0,$Td3=0.0,$Td6=0.0,$Tap=0.0,$TbR=0.0,$TbF=0.0,$Tc1=0.0,$TaE=0.0,$Tc2=0.0,$TbZ=0.0,$Tc7=0.0,$Tb6=0.0,$TbM=0.0,$TbI=0.0,$TbS=0.0,$TbW=0.0,$Tc6=0.0,$Tbx=0.0,$TbN=0.0,$Tao=0.0,$TbE=0.0,$Taw=0.0,$TaD=0.0,$TbX=0.0,$TbY=0.0,$TaW=0.0,$Tb5=0.0,$TbG=0.0,$TbH=0.0,$TbU=0.0,$TbV=0.0,$Tbn=0.0,$Tbw=0.0,$TaF=0.0,$Tby=0.0,$TbP=0.0,$TbQ=0.0,$TbJ=0.0,$TbK=0.0,$TbL=0.0,$TbO=0.0,$TbT=0.0,$Tc0=0.0,$Tc9=0.0,$Tca=0.0,$Tc3=0.0,$Tc4=0.0,$Tc5=0.0,$Tc8=0.0,$T6F=0.0,$T7h=0.0,$T7m=0.0,$T7w=0.0,$T7p=0.0,$T7x=0.0,$T6M=0.0,$T7s=0.0,$T6U=0.0,$T7c=0.0,$T75=0.0,$T7r=0.0,$T78=0.0,$T7i=0.0,$T71=0.0,$T7d=0.0,$T6D=0.0,$T6E=0.0,$T7k=0.0,$T7l=0.0,$T7n=0.0,$T7o=0.0,$T6I=0.0,$T6L=0.0,$T6Q=0.0,$T6T=0.0,$T73=0.0,$T74=0.0,$T76=0.0,$T77=0.0,$T6X=0.0,$T70=0.0,$T6N=0.0,$T72=0.0,$T7f=0.0,$T7g=0.0,$T79=0.0,$T7a=0.0,$T7b=0.0,$T7e=0.0,$T7j=0.0,$T7q=0.0,$T7z=0.0,$T7A=0.0,$T7t=0.0,$T7u=0.0,$T7v=0.0,$T7y=0.0,$T9j=0.0,$T9V=0.0,$Ta0=0.0,$Taa=0.0,$Ta3=0.0,$Tab=0.0,$T9q=0.0,$Ta6=0.0,$T9y=0.0,$T9Q=0.0,$T9J=0.0,$Ta5=0.0,$T9M=0.0,$T9W=0.0,$T9F=0.0,$T9R=0.0,$T9h=0.0,$T9i=0.0,$T9Y=0.0,$T9Z=0.0,$Ta1=0.0,$Ta2=0.0,$T9m=0.0,$T9p=0.0,$T9u=0.0,$T9x=0.0,$T9H=0.0,$T9I=0.0,$T9K=0.0,$T9L=0.0,$T9B=0.0,$T9E=0.0,$T9r=0.0,$T9G=0.0,$T9T=0.0,$T9U=0.0,$T9N=0.0,$T9O=0.0,$T9P=0.0,$T9S=0.0,$T9X=0.0,$Ta4=0.0,$Tad=0.0,$Tae=0.0,$Ta7=0.0,$Ta8=0.0,$Ta9=0.0,$Tac=0.0,$T3v=0.0,$T6j=0.0,$T6o=0.0,$T6y=0.0,$T6r=0.0,$T6z=0.0,$T48=0.0,$T6u=0.0,$T52=0.0,$T6e=0.0,$T67=0.0,$T6t=0.0,$T6a=0.0,$T6k=0.0,$T5V=0.0,$T6f=0.0,$T3f=0.0,$T3u=0.0,$T6m=0.0,$T6n=0.0,$T6p=0.0,$T6q=0.0,$T3O=0.0,$T47=0.0,$T4O=0.0,$T51=0.0,$T63=0.0,$T66=0.0,$T68=0.0,$T69=0.0,$T5H=0.0,$T5U=0.0,$T49=0.0,$T5W=0.0,$T6h=0.0,$T6i=0.0,$T6b=0.0,$T6c=0.0,$T6d=0.0,$T6g=0.0,$T6l=0.0,$T6s=0.0,$T6B=0.0,$T6C=0.0,$T6v=0.0,$T6w=0.0,$T6x=0.0,$T6A=0.0,$T7L=0.0,$T8X=0.0,$T92=0.0,$T9c=0.0,$T95=0.0,$T9d=0.0,$T80=0.0,$T98=0.0,$T8k=0.0,$T8S=0.0,$T8L=0.0,$T97=0.0,$T8O=0.0,$T8Y=0.0,$T8D=0.0,$T8T=0.0,$T7D=0.0,$T7K=0.0,$T90=0.0,$T91=0.0,$T93=0.0,$T94=0.0,$T7S=0.0,$T7Z=0.0,$T8c=0.0,$T8j=0.0,$T8H=0.0,$T8K=0.0,$T8M=0.0,$T8N=0.0,$T8v=0.0,$T8C=0.0,$T81=0.0,$T8E=0.0,$T8V=0.0,$T8W=0.0,$T8P=0.0,$T8Q=0.0,$T8R=0.0,$T8U=0.0,$T8Z=0.0,$T96=0.0,$T9f=0.0,$T9g=0.0,$T99=0.0,$T9a=0.0,$T9b=0.0,$T9e=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<5<<3)>>3];$T3=$T1+$T2;$T35=$T1-$T2;$T24=+HEAPF64[$2>>3];$T25=+HEAPF64[$2+($5<<5<<3)>>3];$T26=$T24+$T25;$T5Y=$T24-$T25;$T4=+HEAPF64[$1+($5<<4<<3)>>3];$T5=+HEAPF64[$1+(($5*48|0)<<3)>>3];$T6=$T4+$T5;$T5X=$T4-$T5;$T27=+HEAPF64[$2+($5<<4<<3)>>3];$T28=+HEAPF64[$2+(($5*48|0)<<3)>>3];$T29=$T27+$T28;$T36=$T27-$T28;$T8=+HEAPF64[$1+($5<<3<<3)>>3];$T9=+HEAPF64[$1+(($5*40|0)<<3)>>3];$Ta=$T8+$T9;$T39=$T8-$T9;$T2b=+HEAPF64[$2+($5<<3<<3)>>3];$T2c=+HEAPF64[$2+(($5*40|0)<<3)>>3];$T2d=$T2b+$T2c;$T38=$T2b-$T2c;$Tb=+HEAPF64[$1+(($5*56|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*24|0)<<3)>>3];$Td=$Tb+$Tc;$T3b=$Tb-$Tc;$T2e=+HEAPF64[$2+(($5*56|0)<<3)>>3];$T2f=+HEAPF64[$2+(($5*24|0)<<3)>>3];$T2g=$T2e+$T2f;$T3c=$T2e-$T2f;$T37=$T35-$T36;$T7B=$T35+$T36;$T8F=$T5Y-$T5X;$T5Z=$T5X+$T5Y;$T7=$T3+$T6;$Te=$Ta+$Td;$Tf=$T7+$Te;$Td9=$T7-$Te;$Tbz=$T26-$T29;$TbA=$Td-$Ta;$TbB=$Tbz-$TbA;$TcB=$TbA+$Tbz;$T60=$T3b-$T3c;$T61=$T39+$T38;$T62=($T60-$T61)*.7071067811865476;$T7C=($T61+$T60)*.7071067811865476;$T2a=$T26+$T29;$T2h=$T2d+$T2g;$T2i=$T2a+$T2h;$TdH=$T2a-$T2h;$Taf=$T3-$T6;$Tag=$T2d-$T2g;$Tah=$Taf-$Tag;$Tcb=$Taf+$Tag;$T3a=$T38-$T39;$T3d=$T3b+$T3c;$T3e=($T3a-$T3d)*.7071067811865476;$T8G=($T3a+$T3d)*.7071067811865476;$Tg=+HEAPF64[$1+($5<<2<<3)>>3];$Th=+HEAPF64[$1+(($5*36|0)<<3)>>3];$Ti=$Tg+$Th;$T3j=$Tg-$Th;$T2j=+HEAPF64[$2+($5<<2<<3)>>3];$T2k=+HEAPF64[$2+(($5*36|0)<<3)>>3];$T2l=$T2j+$T2k;$T3h=$T2j-$T2k;$Tj=+HEAPF64[$1+(($5*20|0)<<3)>>3];$Tk=+HEAPF64[$1+(($5*52|0)<<3)>>3];$Tl=$Tj+$Tk;$T3g=$Tj-$Tk;$T2m=+HEAPF64[$2+(($5*20|0)<<3)>>3];$T2n=+HEAPF64[$2+(($5*52|0)<<3)>>3];$T2o=$T2m+$T2n;$T3k=$T2m-$T2n;$Tn=+HEAPF64[$1+(($5*60|0)<<3)>>3];$To=+HEAPF64[$1+(($5*28|0)<<3)>>3];$Tp=$Tn+$To;$T3q=$Tn-$To;$T2q=+HEAPF64[$2+(($5*60|0)<<3)>>3];$T2r=+HEAPF64[$2+(($5*28|0)<<3)>>3];$T2s=$T2q+$T2r;$T3o=$T2q-$T2r;$Tq=+HEAPF64[$1+(($5*12|0)<<3)>>3];$Tr=+HEAPF64[$1+(($5*44|0)<<3)>>3];$Ts=$Tq+$Tr;$T3n=$Tq-$Tr;$T2t=+HEAPF64[$2+(($5*12|0)<<3)>>3];$T2u=+HEAPF64[$2+(($5*44|0)<<3)>>3];$T2v=$T2t+$T2u;$T3r=$T2t-$T2u;$Tm=$Ti+$Tl;$Tt=$Tp+$Ts;$Tu=$Tm+$Tt;$TdI=$Tt-$Tm;$Tai=$T2l-$T2o;$Taj=$Ti-$Tl;$Tak=$Tai-$Taj;$TbD=$Taj+$Tai;$Tal=$Tp-$Ts;$Tam=$T2s-$T2v;$Tan=$Tal+$Tam;$TbC=$Tal-$Tam;$T2p=$T2l+$T2o;$T2w=$T2s+$T2v;$T2x=$T2p+$T2w;$Tda=$T2p-$T2w;$T3i=$T3g+$T3h;$T3l=$T3j-$T3k;$T3m=.3826834323650898*$T3i-.9238795325112867*$T3l;$T65=.9238795325112867*$T3i+.3826834323650898*$T3l;$T7E=$T3h-$T3g;$T7F=$T3j+$T3k;$T7G=.9238795325112867*$T7E-.3826834323650898*$T7F;$T8J=.3826834323650898*$T7E+.9238795325112867*$T7F;$T7H=$T3o-$T3n;$T7I=$T3q+$T3r;$T7J=.9238795325112867*$T7H+.3826834323650898*$T7I;$T8I=.9238795325112867*$T7I-.3826834323650898*$T7H;$T3p=$T3n+$T3o;$T3s=$T3q-$T3r;$T3t=.3826834323650898*$T3p+.9238795325112867*$T3s;$T64=.3826834323650898*$T3s-.9238795325112867*$T3p;$Tw=+HEAPF64[$1+($5<<1<<3)>>3];$Tx=+HEAPF64[$1+(($5*34|0)<<3)>>3];$Ty=$Tw+$Tx;$T3H=$Tw-$Tx;$T2z=+HEAPF64[$2+($5<<1<<3)>>3];$T2A=+HEAPF64[$2+(($5*34|0)<<3)>>3];$T2B=$T2z+$T2A;$T3x=$T2z-$T2A;$Tz=+HEAPF64[$1+(($5*18|0)<<3)>>3];$TA=+HEAPF64[$1+(($5*50|0)<<3)>>3];$TB=$Tz+$TA;$T3w=$Tz-$TA;$T2C=+HEAPF64[$2+(($5*18|0)<<3)>>3];$T2D=+HEAPF64[$2+(($5*50|0)<<3)>>3];$T2E=$T2C+$T2D;$T3I=$T2C-$T2D;$TG=+HEAPF64[$1+(($5*58|0)<<3)>>3];$TH=+HEAPF64[$1+(($5*26|0)<<3)>>3];$T3z=$TG-$TH;$T2J=+HEAPF64[$2+(($5*58|0)<<3)>>3];$T2K=+HEAPF64[$2+(($5*26|0)<<3)>>3];$T3A=$T2J-$T2K;$TI=$TG+$TH;$T3L=$T3z+$T3A;$T2L=$T2J+$T2K;$T3B=$T3z-$T3A;$TD=+HEAPF64[$1+(($5*10|0)<<3)>>3];$TE=+HEAPF64[$1+(($5*42|0)<<3)>>3];$T3C=$TD-$TE;$T2G=+HEAPF64[$2+(($5*10|0)<<3)>>3];$T2H=+HEAPF64[$2+(($5*42|0)<<3)>>3];$T3D=$T2G-$T2H;$TF=$TD+$TE;$T3K=$T3D-$T3C;$T2I=$T2G+$T2H;$T3E=$T3C+$T3D;$TC=$Ty+$TB;$TJ=$TF+$TI;$TK=$TC+$TJ;$Tdd=$TC-$TJ;$Taq=$T2B-$T2E;$Tar=$TI-$TF;$Tas=$Taq-$Tar;$Tce=$Tar+$Taq;$Tat=$Ty-$TB;$Tau=$T2I-$T2L;$Tav=$Tat-$Tau;$Tcf=$Tat+$Tau;$T2F=$T2B+$T2E;$T2M=$T2I+$T2L;$T2N=$T2F+$T2M;$Tdc=$T2F-$T2M;$T3y=$T3w+$T3x;$T3F=($T3B-$T3E)*.7071067811865476;$T3G=$T3y-$T3F;$T6G=$T3y+$T3F;$T7M=$T3x-$T3w;$T7N=($T3K+$T3L)*.7071067811865476;$T7O=$T7M-$T7N;$T9k=$T7M+$T7N;$T7P=$T3H+$T3I;$T7Q=($T3E+$T3B)*.7071067811865476;$T7R=$T7P-$T7Q;$T9l=$T7P+$T7Q;$T3J=$T3H-$T3I;$T3M=($T3K-$T3L)*.7071067811865476;$T3N=$T3J-$T3M;$T6H=$T3J+$T3M;$T1x=+HEAPF64[$1+(($5*63|0)<<3)>>3];$T1y=+HEAPF64[$1+(($5*31|0)<<3)>>3];$T1z=$T1x+$T1y;$T53=$T1x-$T1y;$T5J=+HEAPF64[$2+(($5*63|0)<<3)>>3];$T5K=+HEAPF64[$2+(($5*31|0)<<3)>>3];$T5L=$T5J-$T5K;$Tbo=$T5J+$T5K;$T1A=+HEAPF64[$1+(($5*15|0)<<3)>>3];$T1B=+HEAPF64[$1+(($5*47|0)<<3)>>3];$T1C=$T1A+$T1B;$T5I=$T1A-$T1B;$T54=+HEAPF64[$2+(($5*15|0)<<3)>>3];$T55=+HEAPF64[$2+(($5*47|0)<<3)>>3];$T56=$T54-$T55;$Tbp=$T54+$T55;$T1H=+HEAPF64[$1+(($5*55|0)<<3)>>3];$T1I=+HEAPF64[$1+(($5*23|0)<<3)>>3];$T5d=$T1H-$T1I;$T5e=+HEAPF64[$2+(($5*55|0)<<3)>>3];$T5f=+HEAPF64[$2+(($5*23|0)<<3)>>3];$T5g=$T5e-$T5f;$T1J=$T1H+$T1I;$Tb9=$T5e+$T5f;$T5h=$T5d+$T5g;$T5N=$T5d-$T5g;$T1E=+HEAPF64[$1+(($5*7|0)<<3)>>3];$T1F=+HEAPF64[$1+(($5*39|0)<<3)>>3];$T5b=$T1E-$T1F;$T58=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T59=+HEAPF64[$2+(($5*39|0)<<3)>>3];$T5a=$T58-$T59;$T1G=$T1E+$T1F;$Tb8=$T58+$T59;$T5c=$T5a-$T5b;$T5O=$T5b+$T5a;$T1D=$T1z+$T1C;$T1K=$T1G+$T1J;$T1L=$T1D+$T1K;$Tdv=$T1D-$T1K;$Tbq=$Tbo-$Tbp;$Tbr=$T1J-$T1G;$Tbs=$Tbq-$Tbr;$Tcw=$Tbr+$Tbq;$TdA=$Tbo+$Tbp;$TdB=$Tb8+$Tb9;$TdC=$TdA-$TdB;$Teo=$TdA+$TdB;$T57=$T53-$T56;$T5i=($T5c-$T5h)*.7071067811865476;$T5j=$T57-$T5i;$T6V=$T57+$T5i;$T5M=$T5I+$T5L;$T5P=($T5N-$T5O)*.7071067811865476;$T5Q=$T5M-$T5P;$T6Y=$T5M+$T5P;$T8w=$T5L-$T5I;$T8x=($T5c+$T5h)*.7071067811865476;$T8y=$T8w-$T8x;$T9C=$T8w+$T8x;$Tb7=$T1z-$T1C;$Tba=$Tb8-$Tb9;$Tbb=$Tb7-$Tba;$Tct=$Tb7+$Tba;$T8l=$T53+$T56;$T8m=($T5O+$T5N)*.7071067811865476;$T8n=$T8l-$T8m;$T9z=$T8l+$T8m;$TL=+HEAPF64[$1+(($5*62|0)<<3)>>3];$TM=+HEAPF64[$1+(($5*30|0)<<3)>>3];$TN=$TL+$TM;$T40=$TL-$TM;$T2O=+HEAPF64[$2+(($5*62|0)<<3)>>3];$T2P=+HEAPF64[$2+(($5*30|0)<<3)>>3];$T2Q=$T2O+$T2P;$T3Q=$T2O-$T2P;$TO=+HEAPF64[$1+(($5*14|0)<<3)>>3];$TP=+HEAPF64[$1+(($5*46|0)<<3)>>3];$TQ=$TO+$TP;$T3P=$TO-$TP;$T2R=+HEAPF64[$2+(($5*14|0)<<3)>>3];$T2S=+HEAPF64[$2+(($5*46|0)<<3)>>3];$T2T=$T2R+$T2S;$T41=$T2R-$T2S;$TV=+HEAPF64[$1+(($5*54|0)<<3)>>3];$TW=+HEAPF64[$1+(($5*22|0)<<3)>>3];$T3S=$TV-$TW;$T2Y=+HEAPF64[$2+(($5*54|0)<<3)>>3];$T2Z=+HEAPF64[$2+(($5*22|0)<<3)>>3];$T3T=$T2Y-$T2Z;$TX=$TV+$TW;$T44=$T3S+$T3T;$T30=$T2Y+$T2Z;$T3U=$T3S-$T3T;$TS=+HEAPF64[$1+(($5*6|0)<<3)>>3];$TT=+HEAPF64[$1+(($5*38|0)<<3)>>3];$T3V=$TS-$TT;$T2V=+HEAPF64[$2+(($5*6|0)<<3)>>3];$T2W=+HEAPF64[$2+(($5*38|0)<<3)>>3];$T3W=$T2V-$T2W;$TU=$TS+$TT;$T43=$T3W-$T3V;$T2X=$T2V+$T2W;$T3X=$T3V+$T3W;$TR=$TN+$TQ;$TY=$TU+$TX;$TZ=$TR+$TY;$Tdf=$TR-$TY;$Tax=$T2Q-$T2T;$Tay=$TX-$TU;$Taz=$Tax-$Tay;$Tch=$Tay+$Tax;$TaA=$TN-$TQ;$TaB=$T2X-$T30;$TaC=$TaA-$TaB;$Tci=$TaA+$TaB;$T2U=$T2Q+$T2T;$T31=$T2X+$T30;$T32=$T2U+$T31;$Tdg=$T2U-$T31;$T3R=$T3P+$T3Q;$T3Y=($T3U-$T3X)*.7071067811865476;$T3Z=$T3R-$T3Y;$T6J=$T3R+$T3Y;$T7T=$T40+$T41;$T7U=($T3X+$T3U)*.7071067811865476;$T7V=$T7T-$T7U;$T9n=$T7T+$T7U;$T7W=$T3Q-$T3P;$T7X=($T43+$T44)*.7071067811865476;$T7Y=$T7W-$T7X;$T9o=$T7W+$T7X;$T42=$T40-$T41;$T45=($T43-$T44)*.7071067811865476;$T46=$T42-$T45;$T6K=$T42+$T45;$T12=+HEAPF64[$1+($5<<3)>>3];$T13=+HEAPF64[$1+(($5*33|0)<<3)>>3];$T14=$T12+$T13;$T4P=$T12-$T13;$T4b=+HEAPF64[$2+($5<<3)>>3];$T4c=+HEAPF64[$2+(($5*33|0)<<3)>>3];$T4d=$T4b-$T4c;$TaG=$T4b+$T4c;$T15=+HEAPF64[$1+(($5*17|0)<<3)>>3];$T16=+HEAPF64[$1+(($5*49|0)<<3)>>3];$T17=$T15+$T16;$T4a=$T15-$T16;$T4Q=+HEAPF64[$2+(($5*17|0)<<3)>>3];$T4R=+HEAPF64[$2+(($5*49|0)<<3)>>3];$T4S=$T4Q-$T4R;$TaH=$T4Q+$T4R;$T1c=+HEAPF64[$1+(($5*57|0)<<3)>>3];$T1d=+HEAPF64[$1+(($5*25|0)<<3)>>3];$T4f=$T1c-$T1d;$T4g=+HEAPF64[$2+(($5*57|0)<<3)>>3];$T4h=+HEAPF64[$2+(($5*25|0)<<3)>>3];$T4i=$T4g-$T4h;$T1e=$T1c+$T1d;$TaZ=$T4g+$T4h;$T4j=$T4f-$T4i;$T4V=$T4f+$T4i;$T19=+HEAPF64[$1+(($5*9|0)<<3)>>3];$T1a=+HEAPF64[$1+(($5*41|0)<<3)>>3];$T4k=$T19-$T1a;$T4l=+HEAPF64[$2+(($5*9|0)<<3)>>3];$T4m=+HEAPF64[$2+(($5*41|0)<<3)>>3];$T4n=$T4l-$T4m;$T1b=$T19+$T1a;$TaY=$T4l+$T4m;$T4o=$T4k+$T4n;$T4U=$T4n-$T4k;$T18=$T14+$T17;$T1f=$T1b+$T1e;$T1g=$T18+$T1f;$Tdp=$T18-$T1f;$TaX=$T14-$T17;$Tb0=$TaY-$TaZ;$Tb1=$TaX-$Tb0;$Tcm=$TaX+$Tb0;$Tdk=$TaG+$TaH;$Tdl=$TaY+$TaZ;$Tdm=$Tdk-$Tdl;$Tej=$Tdk+$Tdl;$T4e=$T4a+$T4d;$T4p=($T4j-$T4o)*.7071067811865476;$T4q=$T4e-$T4p;$T6R=$T4e+$T4p;$T4T=$T4P-$T4S;$T4W=($T4U-$T4V)*.7071067811865476;$T4X=$T4T-$T4W;$T6O=$T4T+$T4W;$T8d=$T4P+$T4S;$T8e=($T4o+$T4j)*.7071067811865476;$T8f=$T8d-$T8e;$T9s=$T8d+$T8e;$TaI=$TaG-$TaH;$TaJ=$T1e-$T1b;$TaK=$TaI-$TaJ;$Tcp=$TaJ+$TaI;$T82=$T4d-$T4a;$T83=($T4U+$T4V)*.7071067811865476;$T84=$T82-$T83;$T9v=$T82+$T83;$T1h=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T1i=+HEAPF64[$1+(($5*37|0)<<3)>>3];$T1j=$T1h+$T1i;$T4H=$T1h-$T1i;$T4D=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T4E=+HEAPF64[$2+(($5*37|0)<<3)>>3];$T4F=$T4D-$T4E;$TaR=$T4D+$T4E;$T1k=+HEAPF64[$1+(($5*21|0)<<3)>>3];$T1l=+HEAPF64[$1+(($5*53|0)<<3)>>3];$T1m=$T1k+$T1l;$T4C=$T1k-$T1l;$T4I=+HEAPF64[$2+(($5*21|0)<<3)>>3];$T4J=+HEAPF64[$2+(($5*53|0)<<3)>>3];$T4K=$T4I-$T4J;$TaS=$T4I+$T4J;$T4G=$T4C+$T4F;$T4L=$T4H-$T4K;$TaT=$TaR-$TaS;$TaQ=$T1j-$T1m;$T89=$T4H+$T4K;$T88=$T4F-$T4C;$T1o=+HEAPF64[$1+(($5*61|0)<<3)>>3];$T1p=+HEAPF64[$1+(($5*29|0)<<3)>>3];$T1q=$T1o+$T1p;$T4r=$T1o-$T1p;$T4x=+HEAPF64[$2+(($5*61|0)<<3)>>3];$T4y=+HEAPF64[$2+(($5*29|0)<<3)>>3];$T4z=$T4x-$T4y;$TaM=$T4x+$T4y;$T1r=+HEAPF64[$1+(($5*13|0)<<3)>>3];$T1s=+HEAPF64[$1+(($5*45|0)<<3)>>3];$T1t=$T1r+$T1s;$T4w=$T1r-$T1s;$T4s=+HEAPF64[$2+(($5*13|0)<<3)>>3];$T4t=+HEAPF64[$2+(($5*45|0)<<3)>>3];$T4u=$T4s-$T4t;$TaN=$T4s+$T4t;$T4v=$T4r-$T4u;$T4A=$T4w+$T4z;$TaO=$TaM-$TaN;$TaL=$T1q-$T1t;$T86=$T4z-$T4w;$T85=$T4r+$T4u;$T1n=$T1j+$T1m;$T1u=$T1q+$T1t;$T1v=$T1n+$T1u;$Tdn=$T1u-$T1n;$Tb2=$TaT-$TaQ;$Tb3=$TaL+$TaO;$Tb4=($Tb2-$Tb3)*.7071067811865476;$Tcq=($Tb2+$Tb3)*.7071067811865476;$Tdq=$TaR+$TaS;$Tdr=$TaM+$TaN;$Tds=$Tdq-$Tdr;$Tek=$Tdq+$Tdr;$T4B=.3826834323650898*$T4v-.9238795325112867*$T4A;$T4M=.9238795325112867*$T4G+.3826834323650898*$T4L;$T4N=$T4B-$T4M;$T6P=$T4M+$T4B;$T4Y=.3826834323650898*$T4G-.9238795325112867*$T4L;$T4Z=.3826834323650898*$T4A+.9238795325112867*$T4v;$T50=$T4Y-$T4Z;$T6S=$T4Y+$T4Z;$T8g=.9238795325112867*$T88-.3826834323650898*$T89;$T8h=.9238795325112867*$T86+.3826834323650898*$T85;$T8i=$T8g-$T8h;$T9w=$T8g+$T8h;$TaP=$TaL-$TaO;$TaU=$TaQ+$TaT;$TaV=($TaP-$TaU)*.7071067811865476;$Tcn=($TaU+$TaP)*.7071067811865476;$T87=.9238795325112867*$T85-.3826834323650898*$T86;$T8a=.3826834323650898*$T88+.9238795325112867*$T89;$T8b=$T87-$T8a;$T9t=$T8a+$T87;$T1M=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T1N=+HEAPF64[$1+(($5*35|0)<<3)>>3];$T1O=$T1M+$T1N;$T5p=$T1M-$T1N;$T5l=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T5m=+HEAPF64[$2+(($5*35|0)<<3)>>3];$T5n=$T5l-$T5m;$Tbc=$T5l+$T5m;$T1P=+HEAPF64[$1+(($5*19|0)<<3)>>3];$T1Q=+HEAPF64[$1+(($5*51|0)<<3)>>3];$T1R=$T1P+$T1Q;$T5k=$T1P-$T1Q;$T5q=+HEAPF64[$2+(($5*19|0)<<3)>>3];$T5r=+HEAPF64[$2+(($5*51|0)<<3)>>3];$T5s=$T5q-$T5r;$Tbd=$T5q+$T5r;$T5o=$T5k+$T5n;$T5t=$T5p-$T5s;$Tbf=$T1O-$T1R;$Tbe=$Tbc-$Tbd;$T8p=$T5p+$T5s;$T8o=$T5n-$T5k;$T1T=+HEAPF64[$1+(($5*59|0)<<3)>>3];$T1U=+HEAPF64[$1+(($5*27|0)<<3)>>3];$T1V=$T1T+$T1U;$T5A=$T1T-$T1U;$T5w=+HEAPF64[$2+(($5*59|0)<<3)>>3];$T5x=+HEAPF64[$2+(($5*27|0)<<3)>>3];$T5y=$T5w-$T5x;$Tbi=$T5w+$T5x;$T1W=+HEAPF64[$1+(($5*11|0)<<3)>>3];$T1X=+HEAPF64[$1+(($5*43|0)<<3)>>3];$T1Y=$T1W+$T1X;$T5v=$T1W-$T1X;$T5B=+HEAPF64[$2+(($5*11|0)<<3)>>3];$T5C=+HEAPF64[$2+(($5*43|0)<<3)>>3];$T5D=$T5B-$T5C;$Tbj=$T5B+$T5C;$T5z=$T5v+$T5y;$T5E=$T5A-$T5D;$Tbk=$Tbi-$Tbj;$Tbh=$T1V-$T1Y;$T8s=$T5A+$T5D;$T8r=$T5y-$T5v;$T1S=$T1O+$T1R;$T1Z=$T1V+$T1Y;$T20=$T1S+$T1Z;$TdD=$T1Z-$T1S;$Tbt=$Tbh-$Tbk;$Tbu=$Tbf+$Tbe;$Tbv=($Tbt-$Tbu)*.7071067811865476;$Tcu=($Tbu+$Tbt)*.7071067811865476;$Tdw=$Tbc+$Tbd;$Tdx=$Tbi+$Tbj;$Tdy=$Tdw-$Tdx;$Tep=$Tdw+$Tdx;$T5u=.3826834323650898*$T5o-.9238795325112867*$T5t;$T5F=.3826834323650898*$T5z+.9238795325112867*$T5E;$T5G=$T5u-$T5F;$T6Z=$T5u+$T5F;$T5R=.3826834323650898*$T5E-.9238795325112867*$T5z;$T5S=.9238795325112867*$T5o+.3826834323650898*$T5t;$T5T=$T5R-$T5S;$T6W=$T5S+$T5R;$T8z=.9238795325112867*$T8s-.3826834323650898*$T8r;$T8A=.3826834323650898*$T8o+.9238795325112867*$T8p;$T8B=$T8z-$T8A;$T9A=$T8A+$T8z;$Tbg=$Tbe-$Tbf;$Tbl=$Tbh+$Tbk;$Tbm=($Tbg-$Tbl)*.7071067811865476;$Tcx=($Tbg+$Tbl)*.7071067811865476;$T8q=.9238795325112867*$T8o-.3826834323650898*$T8p;$T8t=.9238795325112867*$T8r+.3826834323650898*$T8s;$T8u=$T8q-$T8t;$T9D=$T8q+$T8t;$Tv=$Tf+$Tu;$T10=$TK+$TZ;$T11=$Tv+$T10;$TeD=$Tv-$T10;$TeE=$Tej+$Tek;$TeF=$Teo+$Tep;$TeG=$TeE-$TeF;$TeI=$TeE+$TeF;$T1w=$T1g+$T1v;$T21=$T1L+$T20;$T22=$T1w+$T21;$T23=$T21-$T1w;$T2y=$T2i+$T2x;$T33=$T2N+$T32;$T34=$T2y-$T33;$TeH=$T2y+$T33;HEAPF64[$3+($6<<5<<3)>>3]=$T11-$T22;HEAPF64[$4+($6<<5<<3)>>3]=$TeH-$TeI;HEAPF64[$3>>3]=$T11+$T22;HEAPF64[$4>>3]=$TeH+$TeI;HEAPF64[$4+($6<<4<<3)>>3]=$T23+$T34;HEAPF64[$3+($6<<4<<3)>>3]=$TeD+$TeG;HEAPF64[$4+(($6*48|0)<<3)>>3]=$T34-$T23;HEAPF64[$3+(($6*48|0)<<3)>>3]=$TeD-$TeG;$Tef=$Tf-$Tu;$Teg=$T2N-$T32;$Teh=$Tef+$Teg;$Tex=$Tef-$Teg;$Tet=$T2i-$T2x;$Teu=$TZ-$TK;$Tev=$Tet-$Teu;$TeB=$Teu+$Tet;$Tei=$T1g-$T1v;$Tel=$Tej-$Tek;$Tem=$Tei+$Tel;$Tey=$Tel-$Tei;$Ten=$T1L-$T20;$Teq=$Teo-$Tep;$Ter=$Ten-$Teq;$Tez=$Ten+$Teq;$Tes=($Tem+$Ter)*.7071067811865476;HEAPF64[$3+(($6*40|0)<<3)>>3]=$Teh-$Tes;HEAPF64[$3+($6<<3<<3)>>3]=$Teh+$Tes;$TeC=($Tey+$Tez)*.7071067811865476;HEAPF64[$4+(($6*40|0)<<3)>>3]=$TeB-$TeC;HEAPF64[$4+($6<<3<<3)>>3]=$TeB+$TeC;$Tew=($Ter-$Tem)*.7071067811865476;HEAPF64[$4+(($6*56|0)<<3)>>3]=$Tev-$Tew;HEAPF64[$4+(($6*24|0)<<3)>>3]=$Tev+$Tew;$TeA=($Tey-$Tez)*.7071067811865476;HEAPF64[$3+(($6*56|0)<<3)>>3]=$Tex-$TeA;HEAPF64[$3+(($6*24|0)<<3)>>3]=$Tex+$TeA;$Tdb=$Td9-$Tda;$TdV=$Td9+$Tda;$Te5=$TdI+$TdH;$TdJ=$TdH-$TdI;$Tde=$Tdc-$Tdd;$Tdh=$Tdf+$Tdg;$Tdi=($Tde-$Tdh)*.7071067811865476;$Te6=($Tde+$Tdh)*.7071067811865476;$Te1=$Tdv+$Tdy;$Te2=$TdD+$TdC;$Te3=.9238795325112867*$Te1-.3826834323650898*$Te2;$Teb=.9238795325112867*$Te2+.3826834323650898*$Te1;$TdK=$Tdf-$Tdg;$TdL=$Tdd+$Tdc;$TdM=($TdK-$TdL)*.7071067811865476;$TdW=($TdL+$TdK)*.7071067811865476;$Tdo=$Tdm-$Tdn;$Tdt=$Tdp-$Tds;$Tdu=.9238795325112867*$Tdo+.3826834323650898*$Tdt;$TdQ=.3826834323650898*$Tdo-.9238795325112867*$Tdt;$TdY=$Tdn+$Tdm;$TdZ=$Tdp+$Tds;$Te0=.3826834323650898*$TdY+.9238795325112867*$TdZ;$Tea=.9238795325112867*$TdY-.3826834323650898*$TdZ;$Tdz=$Tdv-$Tdy;$TdE=$TdC-$TdD;$TdF=.3826834323650898*$Tdz-.9238795325112867*$TdE;$TdR=.3826834323650898*$TdE+.9238795325112867*$Tdz;$Tdj=$Tdb+$Tdi;$TdG=$Tdu+$TdF;HEAPF64[$3+(($6*44|0)<<3)>>3]=$Tdj-$TdG;HEAPF64[$3+(($6*12|0)<<3)>>3]=$Tdj+$TdG;$TdT=$TdJ+$TdM;$TdU=$TdQ+$TdR;HEAPF64[$4+(($6*44|0)<<3)>>3]=$TdT-$TdU;HEAPF64[$4+(($6*12|0)<<3)>>3]=$TdT+$TdU;$TdN=$TdJ-$TdM;$TdO=$TdF-$Tdu;HEAPF64[$4+(($6*60|0)<<3)>>3]=$TdN-$TdO;HEAPF64[$4+(($6*28|0)<<3)>>3]=$TdN+$TdO;$TdP=$Tdb-$Tdi;$TdS=$TdQ-$TdR;HEAPF64[$3+(($6*60|0)<<3)>>3]=$TdP-$TdS;HEAPF64[$3+(($6*28|0)<<3)>>3]=$TdP+$TdS;$TdX=$TdV+$TdW;$Te4=$Te0+$Te3;HEAPF64[$3+(($6*36|0)<<3)>>3]=$TdX-$Te4;HEAPF64[$3+($6<<2<<3)>>3]=$TdX+$Te4;$Ted=$Te5+$Te6;$Tee=$Tea+$Teb;HEAPF64[$4+(($6*36|0)<<3)>>3]=$Ted-$Tee;HEAPF64[$4+($6<<2<<3)>>3]=$Ted+$Tee;$Te7=$Te5-$Te6;$Te8=$Te3-$Te0;HEAPF64[$4+(($6*52|0)<<3)>>3]=$Te7-$Te8;HEAPF64[$4+(($6*20|0)<<3)>>3]=$Te7+$Te8;$Te9=$TdV-$TdW;$Tec=$Tea-$Teb;HEAPF64[$3+(($6*52|0)<<3)>>3]=$Te9-$Tec;HEAPF64[$3+(($6*20|0)<<3)>>3]=$Te9+$Tec;$Tcc=($TbD+$TbC)*.7071067811865476;$Tcd=$Tcb-$Tcc;$TcP=$Tcb+$Tcc;$TcC=($Tak+$Tan)*.7071067811865476;$TcD=$TcB-$TcC;$TcZ=$TcB+$TcC;$Tcg=.9238795325112867*$Tce-.3826834323650898*$Tcf;$Tcj=.9238795325112867*$Tch+.3826834323650898*$Tci;$Tck=$Tcg-$Tcj;$Td0=$Tcg+$Tcj;$TcV=$Tct+$Tcu;$TcW=$Tcw+$Tcx;$TcX=.9807852804032304*$TcV-.19509032201612828*$TcW;$Td5=.19509032201612828*$TcV+.9807852804032304*$TcW;$Tco=$Tcm-$Tcn;$Tcr=$Tcp-$Tcq;$Tcs=.5555702330196022*$Tco+.8314696123025452*$Tcr;$TcK=.5555702330196022*$Tcr-.8314696123025452*$Tco;$TcE=.9238795325112867*$Tci-.3826834323650898*$Tch;$TcF=.3826834323650898*$Tce+.9238795325112867*$Tcf;$TcG=$TcE-$TcF;$TcQ=$TcF+$TcE;$TcS=$Tcm+$Tcn;$TcT=$Tcp+$Tcq;$TcU=.9807852804032304*$TcS+.19509032201612828*$TcT;$Td4=.9807852804032304*$TcT-.19509032201612828*$TcS;$Tcv=$Tct-$Tcu;$Tcy=$Tcw-$Tcx;$Tcz=.5555702330196022*$Tcv-.8314696123025452*$Tcy;$TcL=.8314696123025452*$Tcv+.5555702330196022*$Tcy;$Tcl=$Tcd+$Tck;$TcA=$Tcs+$Tcz;HEAPF64[$3+(($6*42|0)<<3)>>3]=$Tcl-$TcA;HEAPF64[$3+(($6*10|0)<<3)>>3]=$Tcl+$TcA;$TcN=$TcD+$TcG;$TcO=$TcK+$TcL;HEAPF64[$4+(($6*42|0)<<3)>>3]=$TcN-$TcO;HEAPF64[$4+(($6*10|0)<<3)>>3]=$TcN+$TcO;$TcH=$TcD-$TcG;$TcI=$Tcz-$Tcs;HEAPF64[$4+(($6*58|0)<<3)>>3]=$TcH-$TcI;HEAPF64[$4+(($6*26|0)<<3)>>3]=$TcH+$TcI;$TcJ=$Tcd-$Tck;$TcM=$TcK-$TcL;HEAPF64[$3+(($6*58|0)<<3)>>3]=$TcJ-$TcM;HEAPF64[$3+(($6*26|0)<<3)>>3]=$TcJ+$TcM;$TcR=$TcP+$TcQ;$TcY=$TcU+$TcX;HEAPF64[$3+(($6*34|0)<<3)>>3]=$TcR-$TcY;HEAPF64[$3+($6<<1<<3)>>3]=$TcR+$TcY;$Td7=$TcZ+$Td0;$Td8=$Td4+$Td5;HEAPF64[$4+(($6*34|0)<<3)>>3]=$Td7-$Td8;HEAPF64[$4+($6<<1<<3)>>3]=$Td7+$Td8;$Td1=$TcZ-$Td0;$Td2=$TcX-$TcU;HEAPF64[$4+(($6*50|0)<<3)>>3]=$Td1-$Td2;HEAPF64[$4+(($6*18|0)<<3)>>3]=$Td1+$Td2;$Td3=$TcP-$TcQ;$Td6=$Td4-$Td5;HEAPF64[$3+(($6*50|0)<<3)>>3]=$Td3-$Td6;HEAPF64[$3+(($6*18|0)<<3)>>3]=$Td3+$Td6;$Tao=($Tak-$Tan)*.7071067811865476;$Tap=$Tah-$Tao;$TbR=$Tah+$Tao;$TbE=($TbC-$TbD)*.7071067811865476;$TbF=$TbB-$TbE;$Tc1=$TbB+$TbE;$Taw=.3826834323650898*$Tas-.9238795325112867*$Tav;$TaD=.3826834323650898*$Taz+.9238795325112867*$TaC;$TaE=$Taw-$TaD;$Tc2=$Taw+$TaD;$TbX=$Tbb+$Tbm;$TbY=$Tbs+$Tbv;$TbZ=.8314696123025452*$TbX-.5555702330196022*$TbY;$Tc7=.8314696123025452*$TbY+.5555702330196022*$TbX;$TaW=$TaK-$TaV;$Tb5=$Tb1-$Tb4;$Tb6=.9807852804032304*$TaW+.19509032201612828*$Tb5;$TbM=.19509032201612828*$TaW-.9807852804032304*$Tb5;$TbG=.3826834323650898*$TaC-.9238795325112867*$Taz;$TbH=.9238795325112867*$Tas+.3826834323650898*$Tav;$TbI=$TbG-$TbH;$TbS=$TbH+$TbG;$TbU=$TaK+$TaV;$TbV=$Tb1+$Tb4;$TbW=.5555702330196022*$TbU+.8314696123025452*$TbV;$Tc6=.8314696123025452*$TbU-.5555702330196022*$TbV;$Tbn=$Tbb-$Tbm;$Tbw=$Tbs-$Tbv;$Tbx=.19509032201612828*$Tbn-.9807852804032304*$Tbw;$TbN=.19509032201612828*$Tbw+.9807852804032304*$Tbn;$TaF=$Tap+$TaE;$Tby=$Tb6+$Tbx;HEAPF64[$3+(($6*46|0)<<3)>>3]=$TaF-$Tby;HEAPF64[$3+(($6*14|0)<<3)>>3]=$TaF+$Tby;$TbP=$TbF+$TbI;$TbQ=$TbM+$TbN;HEAPF64[$4+(($6*46|0)<<3)>>3]=$TbP-$TbQ;HEAPF64[$4+(($6*14|0)<<3)>>3]=$TbP+$TbQ;$TbJ=$TbF-$TbI;$TbK=$Tbx-$Tb6;HEAPF64[$4+(($6*62|0)<<3)>>3]=$TbJ-$TbK;HEAPF64[$4+(($6*30|0)<<3)>>3]=$TbJ+$TbK;$TbL=$Tap-$TaE;$TbO=$TbM-$TbN;HEAPF64[$3+(($6*62|0)<<3)>>3]=$TbL-$TbO;HEAPF64[$3+(($6*30|0)<<3)>>3]=$TbL+$TbO;$TbT=$TbR+$TbS;$Tc0=$TbW+$TbZ;HEAPF64[$3+(($6*38|0)<<3)>>3]=$TbT-$Tc0;HEAPF64[$3+(($6*6|0)<<3)>>3]=$TbT+$Tc0;$Tc9=$Tc1+$Tc2;$Tca=$Tc6+$Tc7;HEAPF64[$4+(($6*38|0)<<3)>>3]=$Tc9-$Tca;HEAPF64[$4+(($6*6|0)<<3)>>3]=$Tc9+$Tca;$Tc3=$Tc1-$Tc2;$Tc4=$TbZ-$TbW;HEAPF64[$4+(($6*54|0)<<3)>>3]=$Tc3-$Tc4;HEAPF64[$4+(($6*22|0)<<3)>>3]=$Tc3+$Tc4;$Tc5=$TbR-$TbS;$Tc8=$Tc6-$Tc7;HEAPF64[$3+(($6*54|0)<<3)>>3]=$Tc5-$Tc8;HEAPF64[$3+(($6*22|0)<<3)>>3]=$Tc5+$Tc8;$T6D=$T37+$T3e;$T6E=$T65+$T64;$T6F=$T6D-$T6E;$T7h=$T6D+$T6E;$T7k=$T6O+$T6P;$T7l=$T6R+$T6S;$T7m=.9569403357322088*$T7k+.2902846772544624*$T7l;$T7w=.9569403357322088*$T7l-.2902846772544624*$T7k;$T7n=$T6V+$T6W;$T7o=$T6Y+$T6Z;$T7p=.9569403357322088*$T7n-.2902846772544624*$T7o;$T7x=.2902846772544624*$T7n+.9569403357322088*$T7o;$T6I=.8314696123025452*$T6G-.5555702330196022*$T6H;$T6L=.8314696123025452*$T6J+.5555702330196022*$T6K;$T6M=$T6I-$T6L;$T7s=$T6I+$T6L;$T6Q=$T6O-$T6P;$T6T=$T6R-$T6S;$T6U=.47139673682599764*$T6Q+.881921264348355*$T6T;$T7c=.47139673682599764*$T6T-.881921264348355*$T6Q;$T73=$T5Z+$T62;$T74=$T3m+$T3t;$T75=$T73-$T74;$T7r=$T73+$T74;$T76=.8314696123025452*$T6K-.5555702330196022*$T6J;$T77=.5555702330196022*$T6G+.8314696123025452*$T6H;$T78=$T76-$T77;$T7i=$T77+$T76;$T6X=$T6V-$T6W;$T70=$T6Y-$T6Z;$T71=.47139673682599764*$T6X-.881921264348355*$T70;$T7d=.881921264348355*$T6X+.47139673682599764*$T70;$T6N=$T6F+$T6M;$T72=$T6U+$T71;HEAPF64[$3+(($6*43|0)<<3)>>3]=$T6N-$T72;HEAPF64[$3+(($6*11|0)<<3)>>3]=$T6N+$T72;$T7f=$T75+$T78;$T7g=$T7c+$T7d;HEAPF64[$4+(($6*43|0)<<3)>>3]=$T7f-$T7g;HEAPF64[$4+(($6*11|0)<<3)>>3]=$T7f+$T7g;$T79=$T75-$T78;$T7a=$T71-$T6U;HEAPF64[$4+(($6*59|0)<<3)>>3]=$T79-$T7a;HEAPF64[$4+(($6*27|0)<<3)>>3]=$T79+$T7a;$T7b=$T6F-$T6M;$T7e=$T7c-$T7d;HEAPF64[$3+(($6*59|0)<<3)>>3]=$T7b-$T7e;HEAPF64[$3+(($6*27|0)<<3)>>3]=$T7b+$T7e;$T7j=$T7h+$T7i;$T7q=$T7m+$T7p;HEAPF64[$3+(($6*35|0)<<3)>>3]=$T7j-$T7q;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T7j+$T7q;$T7z=$T7r+$T7s;$T7A=$T7w+$T7x;HEAPF64[$4+(($6*35|0)<<3)>>3]=$T7z-$T7A;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T7z+$T7A;$T7t=$T7r-$T7s;$T7u=$T7p-$T7m;HEAPF64[$4+(($6*51|0)<<3)>>3]=$T7t-$T7u;HEAPF64[$4+(($6*19|0)<<3)>>3]=$T7t+$T7u;$T7v=$T7h-$T7i;$T7y=$T7w-$T7x;HEAPF64[$3+(($6*51|0)<<3)>>3]=$T7v-$T7y;HEAPF64[$3+(($6*19|0)<<3)>>3]=$T7v+$T7y;$T9h=$T7B+$T7C;$T9i=$T8J+$T8I;$T9j=$T9h-$T9i;$T9V=$T9h+$T9i;$T9Y=$T9s+$T9t;$T9Z=$T9v+$T9w;$Ta0=.9951847266721969*$T9Y+.0980171403295606*$T9Z;$Taa=.9951847266721969*$T9Z-.0980171403295606*$T9Y;$Ta1=$T9z+$T9A;$Ta2=$T9C+$T9D;$Ta3=.9951847266721969*$Ta1-.0980171403295606*$Ta2;$Tab=.0980171403295606*$Ta1+.9951847266721969*$Ta2;$T9m=.9807852804032304*$T9k-.19509032201612828*$T9l;$T9p=.19509032201612828*$T9n+.9807852804032304*$T9o;$T9q=$T9m-$T9p;$Ta6=$T9m+$T9p;$T9u=$T9s-$T9t;$T9x=$T9v-$T9w;$T9y=.6343932841636455*$T9u+.773010453362737*$T9x;$T9Q=.6343932841636455*$T9x-.773010453362737*$T9u;$T9H=$T8F+$T8G;$T9I=$T7G+$T7J;$T9J=$T9H-$T9I;$Ta5=$T9H+$T9I;$T9K=.9807852804032304*$T9n-.19509032201612828*$T9o;$T9L=.9807852804032304*$T9l+.19509032201612828*$T9k;$T9M=$T9K-$T9L;$T9W=$T9L+$T9K;$T9B=$T9z-$T9A;$T9E=$T9C-$T9D;$T9F=.6343932841636455*$T9B-.773010453362737*$T9E;$T9R=.773010453362737*$T9B+.6343932841636455*$T9E;$T9r=$T9j+$T9q;$T9G=$T9y+$T9F;HEAPF64[$3+(($6*41|0)<<3)>>3]=$T9r-$T9G;HEAPF64[$3+(($6*9|0)<<3)>>3]=$T9r+$T9G;$T9T=$T9J+$T9M;$T9U=$T9Q+$T9R;HEAPF64[$4+(($6*41|0)<<3)>>3]=$T9T-$T9U;HEAPF64[$4+(($6*9|0)<<3)>>3]=$T9T+$T9U;$T9N=$T9J-$T9M;$T9O=$T9F-$T9y;HEAPF64[$4+(($6*57|0)<<3)>>3]=$T9N-$T9O;HEAPF64[$4+(($6*25|0)<<3)>>3]=$T9N+$T9O;$T9P=$T9j-$T9q;$T9S=$T9Q-$T9R;HEAPF64[$3+(($6*57|0)<<3)>>3]=$T9P-$T9S;HEAPF64[$3+(($6*25|0)<<3)>>3]=$T9P+$T9S;$T9X=$T9V+$T9W;$Ta4=$Ta0+$Ta3;HEAPF64[$3+(($6*33|0)<<3)>>3]=$T9X-$Ta4;HEAPF64[$3+($6<<3)>>3]=$T9X+$Ta4;$Tad=$Ta5+$Ta6;$Tae=$Taa+$Tab;HEAPF64[$4+(($6*33|0)<<3)>>3]=$Tad-$Tae;HEAPF64[$4+($6<<3)>>3]=$Tad+$Tae;$Ta7=$Ta5-$Ta6;$Ta8=$Ta3-$Ta0;HEAPF64[$4+(($6*49|0)<<3)>>3]=$Ta7-$Ta8;HEAPF64[$4+(($6*17|0)<<3)>>3]=$Ta7+$Ta8;$Ta9=$T9V-$T9W;$Tac=$Taa-$Tab;HEAPF64[$3+(($6*49|0)<<3)>>3]=$Ta9-$Tac;HEAPF64[$3+(($6*17|0)<<3)>>3]=$Ta9+$Tac;$T3f=$T37-$T3e;$T3u=$T3m-$T3t;$T3v=$T3f-$T3u;$T6j=$T3f+$T3u;$T6m=$T4q+$T4N;$T6n=$T4X+$T50;$T6o=.6343932841636455*$T6m+.773010453362737*$T6n;$T6y=.773010453362737*$T6m-.6343932841636455*$T6n;$T6p=$T5j+$T5G;$T6q=$T5Q+$T5T;$T6r=.773010453362737*$T6p-.6343932841636455*$T6q;$T6z=.773010453362737*$T6q+.6343932841636455*$T6p;$T3O=.19509032201612828*$T3G-.9807852804032304*$T3N;$T47=.19509032201612828*$T3Z+.9807852804032304*$T46;$T48=$T3O-$T47;$T6u=$T3O+$T47;$T4O=$T4q-$T4N;$T51=$T4X-$T50;$T52=.9951847266721969*$T4O+.0980171403295606*$T51;$T6e=.0980171403295606*$T4O-.9951847266721969*$T51;$T63=$T5Z-$T62;$T66=$T64-$T65;$T67=$T63-$T66;$T6t=$T63+$T66;$T68=.19509032201612828*$T46-.9807852804032304*$T3Z;$T69=.9807852804032304*$T3G+.19509032201612828*$T3N;$T6a=$T68-$T69;$T6k=$T69+$T68;$T5H=$T5j-$T5G;$T5U=$T5Q-$T5T;$T5V=.0980171403295606*$T5H-.9951847266721969*$T5U;$T6f=.0980171403295606*$T5U+.9951847266721969*$T5H;$T49=$T3v+$T48;$T5W=$T52+$T5V;HEAPF64[$3+(($6*47|0)<<3)>>3]=$T49-$T5W;HEAPF64[$3+(($6*15|0)<<3)>>3]=$T49+$T5W;$T6h=$T67+$T6a;$T6i=$T6e+$T6f;HEAPF64[$4+(($6*47|0)<<3)>>3]=$T6h-$T6i;HEAPF64[$4+(($6*15|0)<<3)>>3]=$T6h+$T6i;$T6b=$T67-$T6a;$T6c=$T5V-$T52;HEAPF64[$4+(($6*63|0)<<3)>>3]=$T6b-$T6c;HEAPF64[$4+(($6*31|0)<<3)>>3]=$T6b+$T6c;$T6d=$T3v-$T48;$T6g=$T6e-$T6f;HEAPF64[$3+(($6*63|0)<<3)>>3]=$T6d-$T6g;HEAPF64[$3+(($6*31|0)<<3)>>3]=$T6d+$T6g;$T6l=$T6j+$T6k;$T6s=$T6o+$T6r;HEAPF64[$3+(($6*39|0)<<3)>>3]=$T6l-$T6s;HEAPF64[$3+(($6*7|0)<<3)>>3]=$T6l+$T6s;$T6B=$T6t+$T6u;$T6C=$T6y+$T6z;HEAPF64[$4+(($6*39|0)<<3)>>3]=$T6B-$T6C;HEAPF64[$4+(($6*7|0)<<3)>>3]=$T6B+$T6C;$T6v=$T6t-$T6u;$T6w=$T6r-$T6o;HEAPF64[$4+(($6*55|0)<<3)>>3]=$T6v-$T6w;HEAPF64[$4+(($6*23|0)<<3)>>3]=$T6v+$T6w;$T6x=$T6j-$T6k;$T6A=$T6y-$T6z;HEAPF64[$3+(($6*55|0)<<3)>>3]=$T6x-$T6A;HEAPF64[$3+(($6*23|0)<<3)>>3]=$T6x+$T6A;$T7D=$T7B-$T7C;$T7K=$T7G-$T7J;$T7L=$T7D-$T7K;$T8X=$T7D+$T7K;$T90=$T84+$T8b;$T91=$T8f+$T8i;$T92=.47139673682599764*$T90+.881921264348355*$T91;$T9c=.881921264348355*$T90-.47139673682599764*$T91;$T93=$T8n+$T8u;$T94=$T8y+$T8B;$T95=.881921264348355*$T93-.47139673682599764*$T94;$T9d=.881921264348355*$T94+.47139673682599764*$T93;$T7S=.5555702330196022*$T7O-.8314696123025452*$T7R;$T7Z=.8314696123025452*$T7V+.5555702330196022*$T7Y;$T80=$T7S-$T7Z;$T98=$T7S+$T7Z;$T8c=$T84-$T8b;$T8j=$T8f-$T8i;$T8k=.9569403357322088*$T8c+.2902846772544624*$T8j;$T8S=.2902846772544624*$T8c-.9569403357322088*$T8j;$T8H=$T8F-$T8G;$T8K=$T8I-$T8J;$T8L=$T8H-$T8K;$T97=$T8H+$T8K;$T8M=.5555702330196022*$T7V-.8314696123025452*$T7Y;$T8N=.5555702330196022*$T7R+.8314696123025452*$T7O;$T8O=$T8M-$T8N;$T8Y=$T8N+$T8M;$T8v=$T8n-$T8u;$T8C=$T8y-$T8B;$T8D=.2902846772544624*$T8v-.9569403357322088*$T8C;$T8T=.2902846772544624*$T8C+.9569403357322088*$T8v;$T81=$T7L+$T80;$T8E=$T8k+$T8D;HEAPF64[$3+(($6*45|0)<<3)>>3]=$T81-$T8E;HEAPF64[$3+(($6*13|0)<<3)>>3]=$T81+$T8E;$T8V=$T8L+$T8O;$T8W=$T8S+$T8T;HEAPF64[$4+(($6*45|0)<<3)>>3]=$T8V-$T8W;HEAPF64[$4+(($6*13|0)<<3)>>3]=$T8V+$T8W;$T8P=$T8L-$T8O;$T8Q=$T8D-$T8k;HEAPF64[$4+(($6*61|0)<<3)>>3]=$T8P-$T8Q;HEAPF64[$4+(($6*29|0)<<3)>>3]=$T8P+$T8Q;$T8R=$T7L-$T80;$T8U=$T8S-$T8T;HEAPF64[$3+(($6*61|0)<<3)>>3]=$T8R-$T8U;HEAPF64[$3+(($6*29|0)<<3)>>3]=$T8R+$T8U;$T8Z=$T8X+$T8Y;$T96=$T92+$T95;HEAPF64[$3+(($6*37|0)<<3)>>3]=$T8Z-$T96;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T8Z+$T96;$T9f=$T97+$T98;$T9g=$T9c+$T9d;HEAPF64[$4+(($6*37|0)<<3)>>3]=$T9f-$T9g;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T9f+$T9g;$T99=$T97-$T98;$T9a=$T95-$T92;HEAPF64[$4+(($6*53|0)<<3)>>3]=$T99-$T9a;HEAPF64[$4+(($6*21|0)<<3)>>3]=$T99+$T9a;$T9b=$T8X-$T8Y;$T9e=$T9c-$T9d;HEAPF64[$3+(($6*53|0)<<3)>>3]=$T9b-$T9e;HEAPF64[$3+(($6*21|0)<<3)>>3]=$T9b+$T9e;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_7($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T1=0.0,$Tu=0.0,$T4=0.0,$Tq=0.0,$Te=0.0,$Tx=0.0,$T7=0.0,$Ts=0.0,$Tk=0.0,$Tv=0.0,$Ta=0.0,$Tr=0.0,$Th=0.0,$Tw=0.0,$T2=0.0,$T3=0.0,$Tc=0.0,$Td=0.0,$T5=0.0,$T6=0.0,$Ti=0.0,$Tj=0.0,$T8=0.0,$T9=0.0,$Tf=0.0,$Tg=0.0,$Tl=0.0,$Tb=0.0,$TB=0.0,$TC=0.0,$Tn=0.0,$Tm=0.0,$Tz=0.0,$TA=0.0,$Tp=0.0,$To=0.0,$Tt=0.0,$Ty=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$Tu=+HEAPF64[$2>>3];$T2=+HEAPF64[$1+($5<<3)>>3];$T3=+HEAPF64[$1+(($5*6|0)<<3)>>3];$T4=$T2+$T3;$Tq=$T3-$T2;$Tc=+HEAPF64[$2+($5<<3)>>3];$Td=+HEAPF64[$2+(($5*6|0)<<3)>>3];$Te=$Tc-$Td;$Tx=$Tc+$Td;$T5=+HEAPF64[$1+($5<<1<<3)>>3];$T6=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T7=$T5+$T6;$Ts=$T6-$T5;$Ti=+HEAPF64[$2+($5<<1<<3)>>3];$Tj=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Tk=$Ti-$Tj;$Tv=$Ti+$Tj;$T8=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T9=+HEAPF64[$1+($5<<2<<3)>>3];$Ta=$T8+$T9;$Tr=$T9-$T8;$Tf=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tg=+HEAPF64[$2+($5<<2<<3)>>3];$Th=$Tf-$Tg;$Tw=$Tf+$Tg;HEAPF64[$3>>3]=$T1+$T4+$T7+$Ta;HEAPF64[$4>>3]=$Tu+$Tx+$Tv+$Tw;$Tl=.9749279121818236*$Te-.7818314824680298*$Th-.4338837391175581*$Tk;$Tb=.6234898018587335*$Ta+$T1+(-0.0-(.9009688679024191*$T7+.2225209339563144*$T4));HEAPF64[$3+(($6*5|0)<<3)>>3]=$Tb-$Tl;HEAPF64[$3+($6<<1<<3)>>3]=$Tb+$Tl;$TB=.9749279121818236*$Tq-.7818314824680298*$Tr-.4338837391175581*$Ts;$TC=.6234898018587335*$Tw+$Tu+(-0.0-(.9009688679024191*$Tv+.2225209339563144*$Tx));HEAPF64[$4+($6<<1<<3)>>3]=$TB+$TC;HEAPF64[$4+(($6*5|0)<<3)>>3]=$TC-$TB;$Tn=.7818314824680298*$Te+.9749279121818236*$Tk+.4338837391175581*$Th;$Tm=.6234898018587335*$T4+$T1+(-0.0-(.9009688679024191*$Ta+.2225209339563144*$T7));HEAPF64[$3+(($6*6|0)<<3)>>3]=$Tm-$Tn;HEAPF64[$3+($6<<3)>>3]=$Tm+$Tn;$Tz=.7818314824680298*$Tq+.9749279121818236*$Ts+.4338837391175581*$Tr;$TA=.6234898018587335*$Tx+$Tu+(-0.0-(.9009688679024191*$Tw+.2225209339563144*$Tv));HEAPF64[$4+($6<<3)>>3]=$Tz+$TA;HEAPF64[$4+(($6*6|0)<<3)>>3]=$TA-$Tz;$Tp=.4338837391175581*$Te+.9749279121818236*$Th-.7818314824680298*$Tk;$To=.6234898018587335*$T7+$T1+(-0.0-(.2225209339563144*$Ta+.9009688679024191*$T4));HEAPF64[$3+($6<<2<<3)>>3]=$To-$Tp;HEAPF64[$3+(($6*3|0)<<3)>>3]=$To+$Tp;$Tt=.4338837391175581*$Tq+.9749279121818236*$Tr-.7818314824680298*$Ts;$Ty=.6234898018587335*$Tv+$Tu+(-0.0-(.2225209339563144*$Tw+.9009688679024191*$Tx));HEAPF64[$4+(($6*3|0)<<3)>>3]=$Tt+$Ty;HEAPF64[$4+($6<<2<<3)>>3]=$Ty-$Tt;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _n1_8($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T3=0.0,$Tn=0.0,$Ti=0.0,$TC=0.0,$T6=0.0,$TB=0.0,$Tl=0.0,$To=0.0,$Td=0.0,$TN=0.0,$Tz=0.0,$TH=0.0,$Ta=0.0,$TM=0.0,$Tu=0.0,$TG=0.0,$T1=0.0,$T2=0.0,$Tj=0.0,$Tk=0.0,$Tg=0.0,$Th=0.0,$T4=0.0,$T5=0.0,$Tb=0.0,$Tc=0.0,$Tv=0.0,$Tw=0.0,$Tx=0.0,$Ty=0.0,$T8=0.0,$T9=0.0,$Tq=0.0,$Tr=0.0,$Ts=0.0,$Tt=0.0,$T7=0.0,$Te=0.0,$TP=0.0,$TQ=0.0,$Tf=0.0,$Tm=0.0,$TL=0.0,$TO=0.0,$Tp=0.0,$TA=0.0,$TJ=0.0,$TK=0.0,$TD=0.0,$TE=0.0,$TF=0.0,$TI=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($5<<2<<3)>>3];$T3=$T1+$T2;$Tn=$T1-$T2;$Tg=+HEAPF64[$2>>3];$Th=+HEAPF64[$2+($5<<2<<3)>>3];$Ti=$Tg+$Th;$TC=$Tg-$Th;$T4=+HEAPF64[$1+($5<<1<<3)>>3];$T5=+HEAPF64[$1+(($5*6|0)<<3)>>3];$T6=$T4+$T5;$TB=$T4-$T5;$Tj=+HEAPF64[$2+($5<<1<<3)>>3];$Tk=+HEAPF64[$2+(($5*6|0)<<3)>>3];$Tl=$Tj+$Tk;$To=$Tj-$Tk;$Tb=+HEAPF64[$1+(($5*7|0)<<3)>>3];$Tc=+HEAPF64[$1+(($5*3|0)<<3)>>3];$Tv=$Tb-$Tc;$Tw=+HEAPF64[$2+(($5*7|0)<<3)>>3];$Tx=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Ty=$Tw-$Tx;$Td=$Tb+$Tc;$TN=$Tw+$Tx;$Tz=$Tv-$Ty;$TH=$Tv+$Ty;$T8=+HEAPF64[$1+($5<<3)>>3];$T9=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Tq=$T8-$T9;$Tr=+HEAPF64[$2+($5<<3)>>3];$Ts=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Tt=$Tr-$Ts;$Ta=$T8+$T9;$TM=$Tr+$Ts;$Tu=$Tq+$Tt;$TG=$Tt-$Tq;$T7=$T3+$T6;$Te=$Ta+$Td;HEAPF64[$3+($6<<2<<3)>>3]=$T7-$Te;HEAPF64[$3>>3]=$T7+$Te;$TP=$Ti+$Tl;$TQ=$TM+$TN;HEAPF64[$4+($6<<2<<3)>>3]=$TP-$TQ;HEAPF64[$4>>3]=$TP+$TQ;$Tf=$Td-$Ta;$Tm=$Ti-$Tl;HEAPF64[$4+($6<<1<<3)>>3]=$Tf+$Tm;HEAPF64[$4+(($6*6|0)<<3)>>3]=$Tm-$Tf;$TL=$T3-$T6;$TO=$TM-$TN;HEAPF64[$3+(($6*6|0)<<3)>>3]=$TL-$TO;HEAPF64[$3+($6<<1<<3)>>3]=$TL+$TO;$Tp=$Tn+$To;$TA=($Tu+$Tz)*.7071067811865476;HEAPF64[$3+(($6*5|0)<<3)>>3]=$Tp-$TA;HEAPF64[$3+($6<<3)>>3]=$Tp+$TA;$TJ=$TC-$TB;$TK=($TG+$TH)*.7071067811865476;HEAPF64[$4+(($6*5|0)<<3)>>3]=$TJ-$TK;HEAPF64[$4+($6<<3)>>3]=$TJ+$TK;$TD=$TB+$TC;$TE=($Tz-$Tu)*.7071067811865476;HEAPF64[$4+(($6*7|0)<<3)>>3]=$TD-$TE;HEAPF64[$4+(($6*3|0)<<3)>>3]=$TD+$TE;$TF=$Tn-$To;$TI=($TG-$TH)*.7071067811865476;HEAPF64[$3+(($6*7|0)<<3)>>3]=$TF-$TI;HEAPF64[$3+(($6*3|0)<<3)>>3]=$TF+$TI;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_n1_7($p){$p=$p|0;_fftw_kdft_register($p,588,9064);return}function _fftw_codelet_n1_8($p){$p=$p|0;_fftw_kdft_register($p,590,9e3);return}function _fftw_codelet_n1_9($p){$p=$p|0;_fftw_kdft_register($p,592,8936);return}function _n1_9($ri,$ii,$ro,$io,$is,$os,$v,$ivs,$ovs){$ri=$ri|0;$ii=$ii|0;$ro=$ro|0;$io=$io|0;$is=$is|0;$os=$os|0;$v=$v|0;$ivs=$ivs|0;$ovs=$ovs|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$9=0,$i=0,$T5=0.0,$TO=0.0,$Th=0.0,$Tk=0.0,$T1g=0.0,$TR=0.0,$Ta=0.0,$T1c=0.0,$Tq=0.0,$TW=0.0,$Tv=0.0,$TX=0.0,$Tf=0.0,$T1d=0.0,$TB=0.0,$T10=0.0,$TG=0.0,$TZ=0.0,$T1=0.0,$T2=0.0,$T3=0.0,$T4=0.0,$TP=0.0,$Ti=0.0,$Tj=0.0,$TQ=0.0,$T6=0.0,$Ts=0.0,$T9=0.0,$Tr=0.0,$Tp=0.0,$Tt=0.0,$Tm=0.0,$Tu=0.0,$T7=0.0,$T8=0.0,$Tn=0.0,$To=0.0,$Tb=0.0,$TD=0.0,$Te=0.0,$TC=0.0,$TA=0.0,$TE=0.0,$Tx=0.0,$TF=0.0,$Tc=0.0,$Td=0.0,$Ty=0.0,$Tz=0.0,$T1e=0.0,$Tg=0.0,$T1b=0.0,$T1f=0.0,$T1h=0.0,$T1i=0.0,$Tl=0.0,$TS=0.0,$TI=0.0,$TN=0.0,$TM=0.0,$TT=0.0,$TJ=0.0,$TU=0.0,$Tw=0.0,$TH=0.0,$TK=0.0,$TL=0.0,$TV=0.0,$T14=0.0,$T12=0.0,$T13=0.0,$T17=0.0,$T1a=0.0,$T18=0.0,$T19=0.0,$TY=0.0,$T11=0.0,$T15=0.0,$T16=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$ro;$4=$io;$5=$is;$6=$os;$8=$ivs;$9=$ovs;$i=$v;label=2;break;case 2:if(($i|0)>0){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T3=+HEAPF64[$1+(($5*6|0)<<3)>>3];$T4=$T2+$T3;$T5=$T1+$T4;$TO=($T3-$T2)*.8660254037844386;$Th=$T1-.5*$T4;$TP=+HEAPF64[$2>>3];$Ti=+HEAPF64[$2+(($5*3|0)<<3)>>3];$Tj=+HEAPF64[$2+(($5*6|0)<<3)>>3];$TQ=$Ti+$Tj;$Tk=($Ti-$Tj)*.8660254037844386;$T1g=$TP+$TQ;$TR=$TP-.5*$TQ;$T6=+HEAPF64[$1+($5<<3)>>3];$Ts=+HEAPF64[$2+($5<<3)>>3];$T7=+HEAPF64[$1+($5<<2<<3)>>3];$T8=+HEAPF64[$1+(($5*7|0)<<3)>>3];$T9=$T7+$T8;$Tr=($T8-$T7)*.8660254037844386;$Tn=+HEAPF64[$2+($5<<2<<3)>>3];$To=+HEAPF64[$2+(($5*7|0)<<3)>>3];$Tp=($Tn-$To)*.8660254037844386;$Tt=$Tn+$To;$Ta=$T6+$T9;$T1c=$Ts+$Tt;$Tm=$T6-.5*$T9;$Tq=$Tm+$Tp;$TW=$Tm-$Tp;$Tu=$Ts-.5*$Tt;$Tv=$Tr+$Tu;$TX=$Tu-$Tr;$Tb=+HEAPF64[$1+($5<<1<<3)>>3];$TD=+HEAPF64[$2+($5<<1<<3)>>3];$Tc=+HEAPF64[$1+(($5*5|0)<<3)>>3];$Td=+HEAPF64[$1+($5<<3<<3)>>3];$Te=$Tc+$Td;$TC=($Td-$Tc)*.8660254037844386;$Ty=+HEAPF64[$2+(($5*5|0)<<3)>>3];$Tz=+HEAPF64[$2+($5<<3<<3)>>3];$TA=($Ty-$Tz)*.8660254037844386;$TE=$Ty+$Tz;$Tf=$Tb+$Te;$T1d=$TD+$TE;$Tx=$Tb-.5*$Te;$TB=$Tx+$TA;$T10=$Tx-$TA;$TF=$TD-.5*$TE;$TG=$TC+$TF;$TZ=$TF-$TC;$T1e=($T1c-$T1d)*.8660254037844386;$Tg=$Ta+$Tf;$T1b=$T5-.5*$Tg;HEAPF64[$3>>3]=$T5+$Tg;HEAPF64[$3+(($6*3|0)<<3)>>3]=$T1b+$T1e;HEAPF64[$3+(($6*6|0)<<3)>>3]=$T1b-$T1e;$T1f=($Tf-$Ta)*.8660254037844386;$T1h=$T1c+$T1d;$T1i=$T1g-.5*$T1h;HEAPF64[$4+(($6*3|0)<<3)>>3]=$T1f+$T1i;HEAPF64[$4>>3]=$T1g+$T1h;HEAPF64[$4+(($6*6|0)<<3)>>3]=$T1i-$T1f;$Tl=$Th+$Tk;$TS=$TO+$TR;$Tw=.766044443118978*$Tq+.6427876096865394*$Tv;$TH=.17364817766693036*$TB+.984807753012208*$TG;$TI=$Tw+$TH;$TN=($TH-$Tw)*.8660254037844386;$TK=.766044443118978*$Tv-.6427876096865394*$Tq;$TL=.17364817766693036*$TG-.984807753012208*$TB;$TM=($TK-$TL)*.8660254037844386;$TT=$TK+$TL;HEAPF64[$3+($6<<3)>>3]=$Tl+$TI;HEAPF64[$4+($6<<3)>>3]=$TS+$TT;$TJ=$Tl-.5*$TI;HEAPF64[$3+(($6*7|0)<<3)>>3]=$TJ-$TM;HEAPF64[$3+($6<<2<<3)>>3]=$TJ+$TM;$TU=$TS-.5*$TT;HEAPF64[$4+($6<<2<<3)>>3]=$TN+$TU;HEAPF64[$4+(($6*7|0)<<3)>>3]=$TU-$TN;$TV=$Th-$Tk;$T14=$TR-$TO;$TY=.17364817766693036*$TW+.984807753012208*$TX;$T11=.3420201433256687*$TZ-.9396926207859084*$T10;$T12=$TY+$T11;$T13=($T11-$TY)*.8660254037844386;$T15=.17364817766693036*$TX-.984807753012208*$TW;$T16=.3420201433256687*$T10+.9396926207859084*$TZ;$T17=$T15-$T16;$T1a=($T15+$T16)*.8660254037844386;HEAPF64[$3+($6<<1<<3)>>3]=$TV+$T12;HEAPF64[$4+($6<<1<<3)>>3]=$T14+$T17;$T18=$T14-.5*$T17;HEAPF64[$4+(($6*5|0)<<3)>>3]=$T13+$T18;HEAPF64[$4+($6<<3<<3)>>3]=$T18-$T13;$T19=$TV-.5*$T12;HEAPF64[$3+($6<<3<<3)>>3]=$T19-$T1a;HEAPF64[$3+(($6*5|0)<<3)>>3]=$T19+$T1a;label=4;break;case 4:$i=$i-1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+($9<<3)|0;$4=$4+($9<<3)|0;$5=$5^HEAP32[7898];$6=$6^HEAP32[7898];label=2;break;case 5:return}}function _q1_2($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T1=0.0,$T2=0.0,$T4=0.0,$T6=0.0,$T7=0.0,$T8=0.0,$T9=0.0,$Ta=0.0,$Tc=0.0,$Te=0.0,$Tf=0.0,$Tg=0.0,$Tb=0.0,$Td=0.0,$T3=0.0,$T5=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+($6<<1<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($4<<3)>>3];$T4=$T1-$T2;$T6=+HEAPF64[$2>>3];$T7=+HEAPF64[$2+($4<<3)>>3];$T8=$T6-$T7;$T9=+HEAPF64[$1+($5<<3)>>3];$Ta=+HEAPF64[$1+($5+$4<<3)>>3];$Tc=$T9-$Ta;$Te=+HEAPF64[$2+($5<<3)>>3];$Tf=+HEAPF64[$2+($5+$4<<3)>>3];$Tg=$Te-$Tf;HEAPF64[$1>>3]=$T1+$T2;HEAPF64[$2>>3]=$T6+$T7;HEAPF64[$1+($4<<3)>>3]=$T9+$Ta;HEAPF64[$2+($4<<3)>>3]=$Te+$Tf;$Tb=+HEAPF64[$3>>3];$Td=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+$4<<3)>>3]=$Tb*$Tc+$Td*$Tg;HEAPF64[$2+($5+$4<<3)>>3]=$Tb*$Tg-$Td*$Tc;$T3=+HEAPF64[$3>>3];$T5=+HEAPF64[$3+8>>3];HEAPF64[$1+($5<<3)>>3]=$T3*$T4+$T5*$T8;HEAPF64[$2+($5<<3)>>3]=$T3*$T8-$T5*$T4;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+16|0;label=2;break;case 5:return}}function _fftw_codelet_q1_2($p){$p=$p|0;_fftw_kdft_difsq_register($p,872,8872);return}function _fftw_codelet_q1_3($p){$p=$p|0;_fftw_kdft_difsq_register($p,870,8808);return}function _q1_3($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T1=0.0,$T4=0.0,$T6=0.0,$Tc=0.0,$Td=0.0,$Te=0.0,$T9=0.0,$Tf=0.0,$Tl=0.0,$To=0.0,$Tq=0.0,$Tw=0.0,$Tx=0.0,$Ty=0.0,$Tt=0.0,$Tz=0.0,$TR=0.0,$TS=0.0,$TN=0.0,$TT=0.0,$TF=0.0,$TI=0.0,$TK=0.0,$TQ=0.0,$T2=0.0,$T3=0.0,$Tr=0.0,$Ts=0.0,$T7=0.0,$T8=0.0,$Tm=0.0,$Tn=0.0,$TL=0.0,$TM=0.0,$TG=0.0,$TH=0.0,$Ta=0.0,$Tg=0.0,$T5=0.0,$Tb=0.0,$TW=0.0,$TY=0.0,$TV=0.0,$TX=0.0,$TC=0.0,$TE=0.0,$TB=0.0,$TD=0.0,$Tu=0.0,$TA=0.0,$Tp=0.0,$Tv=0.0,$TO=0.0,$TU=0.0,$TJ=0.0,$TP=0.0,$Ti=0.0,$Tk=0.0,$Th=0.0,$Tj=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+($6<<2<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($4<<3)>>3];$T3=+HEAPF64[$1+($4<<1<<3)>>3];$T4=$T2+$T3;$T6=$T1-.5*$T4;$Tc=($T3-$T2)*.8660254037844386;$Td=+HEAPF64[$2>>3];$T7=+HEAPF64[$2+($4<<3)>>3];$T8=+HEAPF64[$2+($4<<1<<3)>>3];$Te=$T7+$T8;$T9=($T7-$T8)*.8660254037844386;$Tf=$Td-.5*$Te;$Tl=+HEAPF64[$1+($5<<3)>>3];$Tm=+HEAPF64[$1+($5+$4<<3)>>3];$Tn=+HEAPF64[$1+($5+($4<<1)<<3)>>3];$To=$Tm+$Tn;$Tq=$Tl-.5*$To;$Tw=($Tn-$Tm)*.8660254037844386;$Tx=+HEAPF64[$2+($5<<3)>>3];$Tr=+HEAPF64[$2+($5+$4<<3)>>3];$Ts=+HEAPF64[$2+($5+($4<<1)<<3)>>3];$Ty=$Tr+$Ts;$Tt=($Tr-$Ts)*.8660254037844386;$Tz=$Tx-.5*$Ty;$TR=+HEAPF64[$2+($5<<1<<3)>>3];$TL=+HEAPF64[$2+(($5<<1)+$4<<3)>>3];$TM=+HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3];$TS=$TL+$TM;$TN=($TL-$TM)*.8660254037844386;$TT=$TR-.5*$TS;$TF=+HEAPF64[$1+($5<<1<<3)>>3];$TG=+HEAPF64[$1+(($5<<1)+$4<<3)>>3];$TH=+HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3];$TI=$TG+$TH;$TK=$TF-.5*$TI;$TQ=($TH-$TG)*.8660254037844386;HEAPF64[$1>>3]=$T1+$T4;HEAPF64[$2>>3]=$Td+$Te;HEAPF64[$1+($4<<3)>>3]=$Tl+$To;HEAPF64[$2+($4<<3)>>3]=$Tx+$Ty;HEAPF64[$2+($4<<1<<3)>>3]=$TR+$TS;HEAPF64[$1+($4<<1<<3)>>3]=$TF+$TI;$Ta=$T6+$T9;$Tg=$Tc+$Tf;$T5=+HEAPF64[$3>>3];$Tb=+HEAPF64[$3+8>>3];HEAPF64[$1+($5<<3)>>3]=$T5*$Ta+$Tb*$Tg;HEAPF64[$2+($5<<3)>>3]=$T5*$Tg-$Tb*$Ta;$TW=$TK-$TN;$TY=$TT-$TQ;$TV=+HEAPF64[$3+16>>3];$TX=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3]=$TV*$TW+$TX*$TY;HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3]=$TV*$TY-$TX*$TW;$TC=$Tq-$Tt;$TE=$Tz-$Tw;$TB=+HEAPF64[$3+16>>3];$TD=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+$4<<3)>>3]=$TB*$TC+$TD*$TE;HEAPF64[$2+(($5<<1)+$4<<3)>>3]=$TB*$TE-$TD*$TC;$Tu=$Tq+$Tt;$TA=$Tw+$Tz;$Tp=+HEAPF64[$3>>3];$Tv=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+$4<<3)>>3]=$Tp*$Tu+$Tv*$TA;HEAPF64[$2+($5+$4<<3)>>3]=$Tp*$TA-$Tv*$Tu;$TO=$TK+$TN;$TU=$TQ+$TT;$TJ=+HEAPF64[$3>>3];$TP=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<1)<<3)>>3]=$TJ*$TO+$TP*$TU;HEAPF64[$2+($5+($4<<1)<<3)>>3]=$TJ*$TU-$TP*$TO;$Ti=$T6-$T9;$Tk=$Tf-$Tc;$Th=+HEAPF64[$3+16>>3];$Tj=+HEAPF64[$3+24>>3];HEAPF64[$1+($5<<1<<3)>>3]=$Th*$Ti+$Tj*$Tk;HEAPF64[$2+($5<<1<<3)>>3]=$Th*$Tk-$Tj*$Ti;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+32|0;label=2;break;case 5:return}}function _fftw_codelet_q1_4($p){$p=$p|0;_fftw_kdft_difsq_register($p,862,8744);return}function _q1_4($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T3=0.0,$Te=0.0,$Tb=0.0,$Tq=0.0,$T6=0.0,$T8=0.0,$Th=0.0,$Tr=0.0,$Tv=0.0,$TG=0.0,$TD=0.0,$TS=0.0,$Ty=0.0,$TA=0.0,$TJ=0.0,$TT=0.0,$TX=0.0,$T18=0.0,$T15=0.0,$T1k=0.0,$T10=0.0,$T12=0.0,$T1b=0.0,$T1l=0.0,$T1p=0.0,$T1A=0.0,$T1x=0.0,$T1M=0.0,$T1s=0.0,$T1u=0.0,$T1D=0.0,$T1N=0.0,$T1=0.0,$T2=0.0,$T9=0.0,$Ta=0.0,$T4=0.0,$T5=0.0,$Tf=0.0,$Tg=0.0,$Tt=0.0,$Tu=0.0,$TB=0.0,$TC=0.0,$Tw=0.0,$Tx=0.0,$TH=0.0,$TI=0.0,$TV=0.0,$TW=0.0,$T13=0.0,$T14=0.0,$TY=0.0,$TZ=0.0,$T19=0.0,$T1a=0.0,$T1n=0.0,$T1o=0.0,$T1v=0.0,$T1w=0.0,$T1q=0.0,$T1r=0.0,$T1B=0.0,$T1C=0.0,$Tc=0.0,$Ti=0.0,$T7=0.0,$Td=0.0,$T1K=0.0,$T1O=0.0,$T1J=0.0,$T1L=0.0,$Tk=0.0,$Tm=0.0,$Tj=0.0,$Tl=0.0,$To=0.0,$Ts=0.0,$Tn=0.0,$Tp=0.0,$T16=0.0,$T1c=0.0,$T11=0.0,$T17=0.0,$T1G=0.0,$T1I=0.0,$T1F=0.0,$T1H=0.0,$TQ=0.0,$TU=0.0,$TP=0.0,$TR=0.0,$T1e=0.0,$T1g=0.0,$T1d=0.0,$T1f=0.0,$T1i=0.0,$T1m=0.0,$T1h=0.0,$T1j=0.0,$T1y=0.0,$T1E=0.0,$T1t=0.0,$T1z=0.0,$TM=0.0,$TO=0.0,$TL=0.0,$TN=0.0,$TE=0.0,$TK=0.0,$Tz=0.0,$TF=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+(($6*6|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($4<<1<<3)>>3];$T3=$T1+$T2;$Te=$T1-$T2;$T9=+HEAPF64[$2>>3];$Ta=+HEAPF64[$2+($4<<1<<3)>>3];$Tb=$T9-$Ta;$Tq=$T9+$Ta;$T4=+HEAPF64[$1+($4<<3)>>3];$T5=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T6=$T4+$T5;$T8=$T4-$T5;$Tf=+HEAPF64[$2+($4<<3)>>3];$Tg=+HEAPF64[$2+(($4*3|0)<<3)>>3];$Th=$Tf-$Tg;$Tr=$Tf+$Tg;$Tt=+HEAPF64[$1+($5<<3)>>3];$Tu=+HEAPF64[$1+($5+($4<<1)<<3)>>3];$Tv=$Tt+$Tu;$TG=$Tt-$Tu;$TB=+HEAPF64[$2+($5<<3)>>3];$TC=+HEAPF64[$2+($5+($4<<1)<<3)>>3];$TD=$TB-$TC;$TS=$TB+$TC;$Tw=+HEAPF64[$1+($5+$4<<3)>>3];$Tx=+HEAPF64[$1+($5+($4*3|0)<<3)>>3];$Ty=$Tw+$Tx;$TA=$Tw-$Tx;$TH=+HEAPF64[$2+($5+$4<<3)>>3];$TI=+HEAPF64[$2+($5+($4*3|0)<<3)>>3];$TJ=$TH-$TI;$TT=$TH+$TI;$TV=+HEAPF64[$1+($5<<1<<3)>>3];$TW=+HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3];$TX=$TV+$TW;$T18=$TV-$TW;$T13=+HEAPF64[$2+($5<<1<<3)>>3];$T14=+HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3];$T15=$T13-$T14;$T1k=$T13+$T14;$TY=+HEAPF64[$1+(($5<<1)+$4<<3)>>3];$TZ=+HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3];$T10=$TY+$TZ;$T12=$TY-$TZ;$T19=+HEAPF64[$2+(($5<<1)+$4<<3)>>3];$T1a=+HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3];$T1b=$T19-$T1a;$T1l=$T19+$T1a;$T1n=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T1o=+HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3];$T1p=$T1n+$T1o;$T1A=$T1n-$T1o;$T1v=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T1w=+HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3];$T1x=$T1v-$T1w;$T1M=$T1v+$T1w;$T1q=+HEAPF64[$1+(($5*3|0)+$4<<3)>>3];$T1r=+HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3];$T1s=$T1q+$T1r;$T1u=$T1q-$T1r;$T1B=+HEAPF64[$2+(($5*3|0)+$4<<3)>>3];$T1C=+HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3];$T1D=$T1B-$T1C;$T1N=$T1B+$T1C;HEAPF64[$1>>3]=$T3+$T6;HEAPF64[$2>>3]=$Tq+$Tr;HEAPF64[$1+($4<<3)>>3]=$Tv+$Ty;HEAPF64[$2+($4<<3)>>3]=$TS+$TT;HEAPF64[$1+($4<<1<<3)>>3]=$TX+$T10;HEAPF64[$2+($4<<1<<3)>>3]=$T1k+$T1l;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T1M+$T1N;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T1p+$T1s;$Tc=$T8+$Tb;$Ti=$Te-$Th;$T7=+HEAPF64[$3+32>>3];$Td=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)<<3)>>3]=$T7*$Tc-$Td*$Ti;HEAPF64[$1+(($5*3|0)<<3)>>3]=$Td*$Tc+$T7*$Ti;$T1K=$T1p-$T1s;$T1O=$T1M-$T1N;$T1J=+HEAPF64[$3+16>>3];$T1L=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3]=$T1J*$T1K+$T1L*$T1O;HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3]=$T1J*$T1O-$T1L*$T1K;$Tk=$Tb-$T8;$Tm=$Te+$Th;$Tj=+HEAPF64[$3>>3];$Tl=+HEAPF64[$3+8>>3];HEAPF64[$2+($5<<3)>>3]=$Tj*$Tk-$Tl*$Tm;HEAPF64[$1+($5<<3)>>3]=$Tl*$Tk+$Tj*$Tm;$To=$T3-$T6;$Ts=$Tq-$Tr;$Tn=+HEAPF64[$3+16>>3];$Tp=+HEAPF64[$3+24>>3];HEAPF64[$1+($5<<1<<3)>>3]=$Tn*$To+$Tp*$Ts;HEAPF64[$2+($5<<1<<3)>>3]=$Tn*$Ts-$Tp*$To;$T16=$T12+$T15;$T1c=$T18-$T1b;$T11=+HEAPF64[$3+32>>3];$T17=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3]=$T11*$T16-$T17*$T1c;HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3]=$T17*$T16+$T11*$T1c;$T1G=$T1x-$T1u;$T1I=$T1A+$T1D;$T1F=+HEAPF64[$3>>3];$T1H=+HEAPF64[$3+8>>3];HEAPF64[$2+($5+($4*3|0)<<3)>>3]=$T1F*$T1G-$T1H*$T1I;HEAPF64[$1+($5+($4*3|0)<<3)>>3]=$T1H*$T1G+$T1F*$T1I;$TQ=$Tv-$Ty;$TU=$TS-$TT;$TP=+HEAPF64[$3+16>>3];$TR=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+$4<<3)>>3]=$TP*$TQ+$TR*$TU;HEAPF64[$2+(($5<<1)+$4<<3)>>3]=$TP*$TU-$TR*$TQ;$T1e=$T15-$T12;$T1g=$T18+$T1b;$T1d=+HEAPF64[$3>>3];$T1f=+HEAPF64[$3+8>>3];HEAPF64[$2+($5+($4<<1)<<3)>>3]=$T1d*$T1e-$T1f*$T1g;HEAPF64[$1+($5+($4<<1)<<3)>>3]=$T1f*$T1e+$T1d*$T1g;$T1i=$TX-$T10;$T1m=$T1k-$T1l;$T1h=+HEAPF64[$3+16>>3];$T1j=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3]=$T1h*$T1i+$T1j*$T1m;HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3]=$T1h*$T1m-$T1j*$T1i;$T1y=$T1u+$T1x;$T1E=$T1A-$T1D;$T1t=+HEAPF64[$3+32>>3];$T1z=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3]=$T1t*$T1y-$T1z*$T1E;HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3]=$T1z*$T1y+$T1t*$T1E;$TM=$TD-$TA;$TO=$TG+$TJ;$TL=+HEAPF64[$3>>3];$TN=+HEAPF64[$3+8>>3];HEAPF64[$2+($5+$4<<3)>>3]=$TL*$TM-$TN*$TO;HEAPF64[$1+($5+$4<<3)>>3]=$TN*$TM+$TL*$TO;$TE=$TA+$TD;$TK=$TG-$TJ;$Tz=+HEAPF64[$3+32>>3];$TF=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+$4<<3)>>3]=$Tz*$TE-$TF*$TK;HEAPF64[$1+(($5*3|0)+$4<<3)>>3]=$TF*$TE+$Tz*$TK;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+48|0;label=2;break;case 5:return}}function _fftw_codelet_q1_5($p){$p=$p|0;_fftw_kdft_difsq_register($p,280,8680);return}function _q1_5($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T1=0.0,$Ta=0.0,$TG=0.0,$Tv=0.0,$T8=0.0,$Tb=0.0,$Tp=0.0,$Tj=0.0,$TD=0.0,$To=0.0,$Tq=0.0,$Tr=0.0,$TN=0.0,$TW=0.0,$T1s=0.0,$T1h=0.0,$TU=0.0,$TX=0.0,$T1b=0.0,$T15=0.0,$T1p=0.0,$T1a=0.0,$T1c=0.0,$T1d=0.0,$T1z=0.0,$T1I=0.0,$T2e=0.0,$T23=0.0,$T1G=0.0,$T1J=0.0,$T1X=0.0,$T1R=0.0,$T2b=0.0,$T1W=0.0,$T1Y=0.0,$T1Z=0.0,$T3v=0.0,$T3p=0.0,$T3J=0.0,$T3u=0.0,$T3w=0.0,$T3x=0.0,$T37=0.0,$T3g=0.0,$T3M=0.0,$T3B=0.0,$T3e=0.0,$T3h=0.0,$T2l=0.0,$T2u=0.0,$T30=0.0,$T2P=0.0,$T2s=0.0,$T2v=0.0,$T2J=0.0,$T2D=0.0,$T2X=0.0,$T2I=0.0,$T2K=0.0,$T2L=0.0,$T7=0.0,$Tu=0.0,$T4=0.0,$Tt=0.0,$T5=0.0,$T6=0.0,$T2=0.0,$T3=0.0,$Ti=0.0,$Tn=0.0,$Tf=0.0,$Tm=0.0,$Tg=0.0,$Th=0.0,$Td=0.0,$Te=0.0,$TT=0.0,$T1g=0.0,$TQ=0.0,$T1f=0.0,$TR=0.0,$TS=0.0,$TO=0.0,$TP=0.0,$T14=0.0,$T19=0.0,$T11=0.0,$T18=0.0,$T12=0.0,$T13=0.0,$TZ=0.0,$T10=0.0,$T1F=0.0,$T22=0.0,$T1C=0.0,$T21=0.0,$T1D=0.0,$T1E=0.0,$T1A=0.0,$T1B=0.0,$T1Q=0.0,$T1V=0.0,$T1N=0.0,$T1U=0.0,$T1O=0.0,$T1P=0.0,$T1L=0.0,$T1M=0.0,$T3o=0.0,$T3t=0.0,$T3l=0.0,$T3s=0.0,$T3m=0.0,$T3n=0.0,$T3j=0.0,$T3k=0.0,$T3d=0.0,$T3A=0.0,$T3a=0.0,$T3z=0.0,$T3b=0.0,$T3c=0.0,$T38=0.0,$T39=0.0,$T2r=0.0,$T2O=0.0,$T2o=0.0,$T2N=0.0,$T2p=0.0,$T2q=0.0,$T2m=0.0,$T2n=0.0,$T2C=0.0,$T2H=0.0,$T2z=0.0,$T2G=0.0,$T2A=0.0,$T2B=0.0,$T2x=0.0,$T2y=0.0,$Tk=0.0,$Ty=0.0,$Tw=0.0,$TA=0.0,$Tc=0.0,$Ts=0.0,$T9=0.0,$Tl=0.0,$Tx=0.0,$Tz=0.0,$TE=0.0,$TK=0.0,$TI=0.0,$TM=0.0,$TC=0.0,$TH=0.0,$TB=0.0,$TF=0.0,$TJ=0.0,$TL=0.0,$T2c=0.0,$T2i=0.0,$T2g=0.0,$T2k=0.0,$T2a=0.0,$T2f=0.0,$T29=0.0,$T2d=0.0,$T2h=0.0,$T2j=0.0,$T3K=0.0,$T3Q=0.0,$T3O=0.0,$T3S=0.0,$T3I=0.0,$T3N=0.0,$T3H=0.0,$T3L=0.0,$T3P=0.0,$T3R=0.0,$T1S=0.0,$T26=0.0,$T24=0.0,$T28=0.0,$T1K=0.0,$T20=0.0,$T1H=0.0,$T1T=0.0,$T25=0.0,$T27=0.0,$T2E=0.0,$T2S=0.0,$T2Q=0.0,$T2U=0.0,$T2w=0.0,$T2M=0.0,$T2t=0.0,$T2F=0.0,$T2R=0.0,$T2T=0.0,$T2Y=0.0,$T34=0.0,$T32=0.0,$T36=0.0,$T2W=0.0,$T31=0.0,$T2V=0.0,$T2Z=0.0,$T33=0.0,$T35=0.0,$T3q=0.0,$T3E=0.0,$T3C=0.0,$T3G=0.0,$T3i=0.0,$T3y=0.0,$T3f=0.0,$T3r=0.0,$T3D=0.0,$T3F=0.0,$T1q=0.0,$T1w=0.0,$T1u=0.0,$T1y=0.0,$T1o=0.0,$T1t=0.0,$T1n=0.0,$T1r=0.0,$T1v=0.0,$T1x=0.0,$T16=0.0,$T1k=0.0,$T1i=0.0,$T1m=0.0,$TY=0.0,$T1e=0.0,$TV=0.0,$T17=0.0,$T1j=0.0,$T1l=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+($6<<3<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T5=+HEAPF64[$1+($4<<1<<3)>>3];$T6=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T7=$T5+$T6;$Tu=$T5-$T6;$T2=+HEAPF64[$1+($4<<3)>>3];$T3=+HEAPF64[$1+($4<<2<<3)>>3];$T4=$T2+$T3;$Tt=$T2-$T3;$Ta=($T4-$T7)*.5590169943749475;$TG=.9510565162951535*$Tu-.5877852522924731*$Tt;$Tv=.9510565162951535*$Tt+.5877852522924731*$Tu;$T8=$T4+$T7;$Tb=$T1-.25*$T8;$Tp=+HEAPF64[$2>>3];$Tg=+HEAPF64[$2+($4<<1<<3)>>3];$Th=+HEAPF64[$2+(($4*3|0)<<3)>>3];$Ti=$Tg-$Th;$Tn=$Tg+$Th;$Td=+HEAPF64[$2+($4<<3)>>3];$Te=+HEAPF64[$2+($4<<2<<3)>>3];$Tf=$Td-$Te;$Tm=$Td+$Te;$Tj=.9510565162951535*$Tf+.5877852522924731*$Ti;$TD=.9510565162951535*$Ti-.5877852522924731*$Tf;$To=($Tm-$Tn)*.5590169943749475;$Tq=$Tm+$Tn;$Tr=$Tp-.25*$Tq;$TN=+HEAPF64[$1+($5<<3)>>3];$TR=+HEAPF64[$1+($5+($4<<1)<<3)>>3];$TS=+HEAPF64[$1+($5+($4*3|0)<<3)>>3];$TT=$TR+$TS;$T1g=$TR-$TS;$TO=+HEAPF64[$1+($5+$4<<3)>>3];$TP=+HEAPF64[$1+($5+($4<<2)<<3)>>3];$TQ=$TO+$TP;$T1f=$TO-$TP;$TW=($TQ-$TT)*.5590169943749475;$T1s=.9510565162951535*$T1g-.5877852522924731*$T1f;$T1h=.9510565162951535*$T1f+.5877852522924731*$T1g;$TU=$TQ+$TT;$TX=$TN-.25*$TU;$T1b=+HEAPF64[$2+($5<<3)>>3];$T12=+HEAPF64[$2+($5+($4<<1)<<3)>>3];$T13=+HEAPF64[$2+($5+($4*3|0)<<3)>>3];$T14=$T12-$T13;$T19=$T12+$T13;$TZ=+HEAPF64[$2+($5+$4<<3)>>3];$T10=+HEAPF64[$2+($5+($4<<2)<<3)>>3];$T11=$TZ-$T10;$T18=$TZ+$T10;$T15=.9510565162951535*$T11+.5877852522924731*$T14;$T1p=.9510565162951535*$T14-.5877852522924731*$T11;$T1a=($T18-$T19)*.5590169943749475;$T1c=$T18+$T19;$T1d=$T1b-.25*$T1c;$T1z=+HEAPF64[$1+($5<<1<<3)>>3];$T1D=+HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3];$T1E=+HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3];$T1F=$T1D+$T1E;$T22=$T1D-$T1E;$T1A=+HEAPF64[$1+(($5<<1)+$4<<3)>>3];$T1B=+HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3];$T1C=$T1A+$T1B;$T21=$T1A-$T1B;$T1I=($T1C-$T1F)*.5590169943749475;$T2e=.9510565162951535*$T22-.5877852522924731*$T21;$T23=.9510565162951535*$T21+.5877852522924731*$T22;$T1G=$T1C+$T1F;$T1J=$T1z-.25*$T1G;$T1X=+HEAPF64[$2+($5<<1<<3)>>3];$T1O=+HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3];$T1P=+HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3];$T1Q=$T1O-$T1P;$T1V=$T1O+$T1P;$T1L=+HEAPF64[$2+(($5<<1)+$4<<3)>>3];$T1M=+HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3];$T1N=$T1L-$T1M;$T1U=$T1L+$T1M;$T1R=.9510565162951535*$T1N+.5877852522924731*$T1Q;$T2b=.9510565162951535*$T1Q-.5877852522924731*$T1N;$T1W=($T1U-$T1V)*.5590169943749475;$T1Y=$T1U+$T1V;$T1Z=$T1X-.25*$T1Y;$T3v=+HEAPF64[$2+($5<<2<<3)>>3];$T3m=+HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3];$T3n=+HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3];$T3o=$T3m-$T3n;$T3t=$T3m+$T3n;$T3j=+HEAPF64[$2+(($5<<2)+$4<<3)>>3];$T3k=+HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3];$T3l=$T3j-$T3k;$T3s=$T3j+$T3k;$T3p=.9510565162951535*$T3l+.5877852522924731*$T3o;$T3J=.9510565162951535*$T3o-.5877852522924731*$T3l;$T3u=($T3s-$T3t)*.5590169943749475;$T3w=$T3s+$T3t;$T3x=$T3v-.25*$T3w;$T37=+HEAPF64[$1+($5<<2<<3)>>3];$T3b=+HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3];$T3c=+HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3];$T3d=$T3b+$T3c;$T3A=$T3b-$T3c;$T38=+HEAPF64[$1+(($5<<2)+$4<<3)>>3];$T39=+HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3];$T3a=$T38+$T39;$T3z=$T38-$T39;$T3g=($T3a-$T3d)*.5590169943749475;$T3M=.9510565162951535*$T3A-.5877852522924731*$T3z;$T3B=.9510565162951535*$T3z+.5877852522924731*$T3A;$T3e=$T3a+$T3d;$T3h=$T37-.25*$T3e;$T2l=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T2p=+HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3];$T2q=+HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3];$T2r=$T2p+$T2q;$T2O=$T2p-$T2q;$T2m=+HEAPF64[$1+(($5*3|0)+$4<<3)>>3];$T2n=+HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3];$T2o=$T2m+$T2n;$T2N=$T2m-$T2n;$T2u=($T2o-$T2r)*.5590169943749475;$T30=.9510565162951535*$T2O-.5877852522924731*$T2N;$T2P=.9510565162951535*$T2N+.5877852522924731*$T2O;$T2s=$T2o+$T2r;$T2v=$T2l-.25*$T2s;$T2J=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T2A=+HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3];$T2B=+HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3];$T2C=$T2A-$T2B;$T2H=$T2A+$T2B;$T2x=+HEAPF64[$2+(($5*3|0)+$4<<3)>>3];$T2y=+HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3];$T2z=$T2x-$T2y;$T2G=$T2x+$T2y;$T2D=.9510565162951535*$T2z+.5877852522924731*$T2C;$T2X=.9510565162951535*$T2C-.5877852522924731*$T2z;$T2I=($T2G-$T2H)*.5590169943749475;$T2K=$T2G+$T2H;$T2L=$T2J-.25*$T2K;HEAPF64[$1>>3]=$T1+$T8;HEAPF64[$2>>3]=$Tp+$Tq;HEAPF64[$1+($4<<3)>>3]=$TN+$TU;HEAPF64[$2+($4<<3)>>3]=$T1b+$T1c;HEAPF64[$1+($4<<1<<3)>>3]=$T1z+$T1G;HEAPF64[$2+($4<<1<<3)>>3]=$T1X+$T1Y;HEAPF64[$2+($4<<2<<3)>>3]=$T3v+$T3w;HEAPF64[$1+($4<<2<<3)>>3]=$T37+$T3e;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T2l+$T2s;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T2J+$T2K;$Tc=$Ta+$Tb;$Tk=$Tc+$Tj;$Ty=$Tc-$Tj;$Ts=$To+$Tr;$Tw=$Ts-$Tv;$TA=$Tv+$Ts;$T9=+HEAPF64[$3>>3];$Tl=+HEAPF64[$3+8>>3];HEAPF64[$1+($5<<3)>>3]=$T9*$Tk+$Tl*$Tw;HEAPF64[$2+($5<<3)>>3]=$T9*$Tw-$Tl*$Tk;$Tx=+HEAPF64[$3+48>>3];$Tz=+HEAPF64[$3+56>>3];HEAPF64[$1+($5<<2<<3)>>3]=$Tx*$Ty+$Tz*$TA;HEAPF64[$2+($5<<2<<3)>>3]=$Tx*$TA-$Tz*$Ty;$TC=$Tb-$Ta;$TE=$TC-$TD;$TK=$TC+$TD;$TH=$Tr-$To;$TI=$TG+$TH;$TM=$TH-$TG;$TB=+HEAPF64[$3+16>>3];$TF=+HEAPF64[$3+24>>3];HEAPF64[$1+($5<<1<<3)>>3]=$TB*$TE+$TF*$TI;HEAPF64[$2+($5<<1<<3)>>3]=$TB*$TI-$TF*$TE;$TJ=+HEAPF64[$3+32>>3];$TL=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)<<3)>>3]=$TJ*$TK+$TL*$TM;HEAPF64[$2+(($5*3|0)<<3)>>3]=$TJ*$TM-$TL*$TK;$T2a=$T1J-$T1I;$T2c=$T2a-$T2b;$T2i=$T2a+$T2b;$T2f=$T1Z-$T1W;$T2g=$T2e+$T2f;$T2k=$T2f-$T2e;$T29=+HEAPF64[$3+16>>3];$T2d=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3]=$T29*$T2c+$T2d*$T2g;HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3]=$T29*$T2g-$T2d*$T2c;$T2h=+HEAPF64[$3+32>>3];$T2j=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3]=$T2h*$T2i+$T2j*$T2k;HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3]=$T2h*$T2k-$T2j*$T2i;$T3I=$T3h-$T3g;$T3K=$T3I-$T3J;$T3Q=$T3I+$T3J;$T3N=$T3x-$T3u;$T3O=$T3M+$T3N;$T3S=$T3N-$T3M;$T3H=+HEAPF64[$3+16>>3];$T3L=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3]=$T3H*$T3K+$T3L*$T3O;HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3]=$T3H*$T3O-$T3L*$T3K;$T3P=+HEAPF64[$3+32>>3];$T3R=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3]=$T3P*$T3Q+$T3R*$T3S;HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3]=$T3P*$T3S-$T3R*$T3Q;$T1K=$T1I+$T1J;$T1S=$T1K+$T1R;$T26=$T1K-$T1R;$T20=$T1W+$T1Z;$T24=$T20-$T23;$T28=$T23+$T20;$T1H=+HEAPF64[$3>>3];$T1T=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<1)<<3)>>3]=$T1H*$T1S+$T1T*$T24;HEAPF64[$2+($5+($4<<1)<<3)>>3]=$T1H*$T24-$T1T*$T1S;$T25=+HEAPF64[$3+48>>3];$T27=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3]=$T25*$T26+$T27*$T28;HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3]=$T25*$T28-$T27*$T26;$T2w=$T2u+$T2v;$T2E=$T2w+$T2D;$T2S=$T2w-$T2D;$T2M=$T2I+$T2L;$T2Q=$T2M-$T2P;$T2U=$T2P+$T2M;$T2t=+HEAPF64[$3>>3];$T2F=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*3|0)<<3)>>3]=$T2t*$T2E+$T2F*$T2Q;HEAPF64[$2+($5+($4*3|0)<<3)>>3]=$T2t*$T2Q-$T2F*$T2E;$T2R=+HEAPF64[$3+48>>3];$T2T=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3]=$T2R*$T2S+$T2T*$T2U;HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3]=$T2R*$T2U-$T2T*$T2S;$T2W=$T2v-$T2u;$T2Y=$T2W-$T2X;$T34=$T2W+$T2X;$T31=$T2L-$T2I;$T32=$T30+$T31;$T36=$T31-$T30;$T2V=+HEAPF64[$3+16>>3];$T2Z=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3]=$T2V*$T2Y+$T2Z*$T32;HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3]=$T2V*$T32-$T2Z*$T2Y;$T33=+HEAPF64[$3+32>>3];$T35=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3]=$T33*$T34+$T35*$T36;HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3]=$T33*$T36-$T35*$T34;$T3i=$T3g+$T3h;$T3q=$T3i+$T3p;$T3E=$T3i-$T3p;$T3y=$T3u+$T3x;$T3C=$T3y-$T3B;$T3G=$T3B+$T3y;$T3f=+HEAPF64[$3>>3];$T3r=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<2)<<3)>>3]=$T3f*$T3q+$T3r*$T3C;HEAPF64[$2+($5+($4<<2)<<3)>>3]=$T3f*$T3C-$T3r*$T3q;$T3D=+HEAPF64[$3+48>>3];$T3F=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3]=$T3D*$T3E+$T3F*$T3G;HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3]=$T3D*$T3G-$T3F*$T3E;$T1o=$TX-$TW;$T1q=$T1o-$T1p;$T1w=$T1o+$T1p;$T1t=$T1d-$T1a;$T1u=$T1s+$T1t;$T1y=$T1t-$T1s;$T1n=+HEAPF64[$3+16>>3];$T1r=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+$4<<3)>>3]=$T1n*$T1q+$T1r*$T1u;HEAPF64[$2+(($5<<1)+$4<<3)>>3]=$T1n*$T1u-$T1r*$T1q;$T1v=+HEAPF64[$3+32>>3];$T1x=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+$4<<3)>>3]=$T1v*$T1w+$T1x*$T1y;HEAPF64[$2+(($5*3|0)+$4<<3)>>3]=$T1v*$T1y-$T1x*$T1w;$TY=$TW+$TX;$T16=$TY+$T15;$T1k=$TY-$T15;$T1e=$T1a+$T1d;$T1i=$T1e-$T1h;$T1m=$T1h+$T1e;$TV=+HEAPF64[$3>>3];$T17=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+$4<<3)>>3]=$TV*$T16+$T17*$T1i;HEAPF64[$2+($5+$4<<3)>>3]=$TV*$T1i-$T17*$T16;$T1j=+HEAPF64[$3+48>>3];$T1l=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+$4<<3)>>3]=$T1j*$T1k+$T1l*$T1m;HEAPF64[$2+(($5<<2)+$4<<3)>>3]=$T1j*$T1m-$T1l*$T1k;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+64|0;label=2;break;case 5:return}}function _fftw_codelet_q1_6($p){$p=$p|0;_fftw_kdft_difsq_register($p,864,8616);return}function _q1_6($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T3=0.0,$Tc=0.0,$Tt=0.0,$TM=0.0,$TX=0.0,$T16=0.0,$T1n=0.0,$T1G=0.0,$T2h=0.0,$T2A=0.0,$T1R=0.0,$T20=0.0,$T2L=0.0,$T2U=0.0,$T3b=0.0,$T3u=0.0,$T3F=0.0,$T3O=0.0,$T45=0.0,$T4o=0.0,$T4Z=0.0,$T5i=0.0,$T4z=0.0,$T4I=0.0,$Ta=0.0,$TP=0.0,$Tf=0.0,$Tq=0.0,$Tn=0.0,$TN=0.0,$Tu=0.0,$TJ=0.0,$T14=0.0,$T1J=0.0,$T19=0.0,$T1k=0.0,$T1h=0.0,$T1H=0.0,$T1o=0.0,$T1D=0.0,$T2b=0.0,$T2B=0.0,$T2i=0.0,$T2x=0.0,$T1Y=0.0,$T2D=0.0,$T23=0.0,$T2e=0.0,$T2S=0.0,$T3x=0.0,$T2X=0.0,$T38=0.0,$T35=0.0,$T3v=0.0,$T3c=0.0,$T3r=0.0,$T3M=0.0,$T4r=0.0,$T3R=0.0,$T42=0.0,$T3Z=0.0,$T4p=0.0,$T46=0.0,$T4l=0.0,$T4T=0.0,$T5j=0.0,$T50=0.0,$T5f=0.0,$T4G=0.0,$T5l=0.0,$T4L=0.0,$T4W=0.0,$T1=0.0,$T2=0.0,$T1l=0.0,$T1m=0.0,$Tr=0.0,$Ts=0.0,$TV=0.0,$TW=0.0,$T2f=0.0,$T2g=0.0,$T1P=0.0,$T1Q=0.0,$T2J=0.0,$T2K=0.0,$T43=0.0,$T44=0.0,$T39=0.0,$T3a=0.0,$T3D=0.0,$T3E=0.0,$T4X=0.0,$T4Y=0.0,$T4x=0.0,$T4y=0.0,$T6=0.0,$Td=0.0,$T9=0.0,$Te=0.0,$T4=0.0,$T5=0.0,$T7=0.0,$T8=0.0,$Tj=0.0,$TH=0.0,$Tm=0.0,$TI=0.0,$Th=0.0,$Ti=0.0,$Tk=0.0,$Tl=0.0,$T10=0.0,$T17=0.0,$T13=0.0,$T18=0.0,$TY=0.0,$TZ=0.0,$T11=0.0,$T12=0.0,$T1d=0.0,$T1B=0.0,$T1g=0.0,$T1C=0.0,$T1b=0.0,$T1c=0.0,$T1e=0.0,$T1f=0.0,$T27=0.0,$T2v=0.0,$T2a=0.0,$T2w=0.0,$T25=0.0,$T26=0.0,$T28=0.0,$T29=0.0,$T1U=0.0,$T21=0.0,$T1X=0.0,$T22=0.0,$T1S=0.0,$T1T=0.0,$T1V=0.0,$T1W=0.0,$T2O=0.0,$T2V=0.0,$T2R=0.0,$T2W=0.0,$T2M=0.0,$T2N=0.0,$T2P=0.0,$T2Q=0.0,$T31=0.0,$T3p=0.0,$T34=0.0,$T3q=0.0,$T2Z=0.0,$T30=0.0,$T32=0.0,$T33=0.0,$T3I=0.0,$T3P=0.0,$T3L=0.0,$T3Q=0.0,$T3G=0.0,$T3H=0.0,$T3J=0.0,$T3K=0.0,$T3V=0.0,$T4j=0.0,$T3Y=0.0,$T4k=0.0,$T3T=0.0,$T3U=0.0,$T3W=0.0,$T3X=0.0,$T4P=0.0,$T5d=0.0,$T4S=0.0,$T5e=0.0,$T4N=0.0,$T4O=0.0,$T4Q=0.0,$T4R=0.0,$T4C=0.0,$T4J=0.0,$T4F=0.0,$T4K=0.0,$T4A=0.0,$T4B=0.0,$T4D=0.0,$T4E=0.0,$T1w=0.0,$T1y=0.0,$T1v=0.0,$T1x=0.0,$T58=0.0,$T5a=0.0,$T57=0.0,$T59=0.0,$TC=0.0,$TE=0.0,$TB=0.0,$TD=0.0,$T4e=0.0,$T4g=0.0,$T4d=0.0,$T4f=0.0,$T3k=0.0,$T3m=0.0,$T3j=0.0,$T3l=0.0,$T2q=0.0,$T2s=0.0,$T2p=0.0,$T2r=0.0,$T5g=0.0,$T5o=0.0,$T5m=0.0,$T5q=0.0,$T5c=0.0,$T5k=0.0,$T5b=0.0,$T5h=0.0,$T5n=0.0,$T5p=0.0,$To=0.0,$Ty=0.0,$Tw=0.0,$TA=0.0,$Tg=0.0,$Tv=0.0,$Tb=0.0,$Tp=0.0,$Tx=0.0,$Tz=0.0,$T36=0.0,$T3g=0.0,$T3e=0.0,$T3i=0.0,$T2Y=0.0,$T3d=0.0,$T2T=0.0,$T37=0.0,$T3f=0.0,$T3h=0.0,$T2y=0.0,$T2G=0.0,$T2E=0.0,$T2I=0.0,$T2u=0.0,$T2C=0.0,$T2t=0.0,$T2z=0.0,$T2F=0.0,$T2H=0.0,$T3s=0.0,$T3A=0.0,$T3y=0.0,$T3C=0.0,$T3o=0.0,$T3w=0.0,$T3n=0.0,$T3t=0.0,$T3z=0.0,$T3B=0.0,$T1E=0.0,$T1M=0.0,$T1K=0.0,$T1O=0.0,$T1A=0.0,$T1I=0.0,$T1z=0.0,$T1F=0.0,$T1L=0.0,$T1N=0.0,$T4m=0.0,$T4u=0.0,$T4s=0.0,$T4w=0.0,$T4i=0.0,$T4q=0.0,$T4h=0.0,$T4n=0.0,$T4t=0.0,$T4v=0.0,$TK=0.0,$TS=0.0,$TQ=0.0,$TU=0.0,$TG=0.0,$TO=0.0,$TF=0.0,$TL=0.0,$TR=0.0,$TT=0.0,$T2c=0.0,$T2m=0.0,$T2k=0.0,$T2o=0.0,$T24=0.0,$T2j=0.0,$T1Z=0.0,$T2d=0.0,$T2l=0.0,$T2n=0.0,$T40=0.0,$T4a=0.0,$T48=0.0,$T4c=0.0,$T3S=0.0,$T47=0.0,$T3N=0.0,$T41=0.0,$T49=0.0,$T4b=0.0,$T1i=0.0,$T1s=0.0,$T1q=0.0,$T1u=0.0,$T1a=0.0,$T1p=0.0,$T15=0.0,$T1j=0.0,$T1r=0.0,$T1t=0.0,$T4U=0.0,$T54=0.0,$T52=0.0,$T56=0.0,$T4M=0.0,$T51=0.0,$T4H=0.0,$T4V=0.0,$T53=0.0,$T55=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+(($6*10|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T3=$T1+$T2;$Tc=$T1-$T2;$Tr=+HEAPF64[$2>>3];$Ts=+HEAPF64[$2+(($4*3|0)<<3)>>3];$Tt=$Tr-$Ts;$TM=$Tr+$Ts;$TV=+HEAPF64[$1+($5<<3)>>3];$TW=+HEAPF64[$1+($5+($4*3|0)<<3)>>3];$TX=$TV+$TW;$T16=$TV-$TW;$T1l=+HEAPF64[$2+($5<<3)>>3];$T1m=+HEAPF64[$2+($5+($4*3|0)<<3)>>3];$T1n=$T1l-$T1m;$T1G=$T1l+$T1m;$T2f=+HEAPF64[$2+($5<<1<<3)>>3];$T2g=+HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3];$T2h=$T2f-$T2g;$T2A=$T2f+$T2g;$T1P=+HEAPF64[$1+($5<<1<<3)>>3];$T1Q=+HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3];$T1R=$T1P+$T1Q;$T20=$T1P-$T1Q;$T2J=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T2K=+HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3];$T2L=$T2J+$T2K;$T2U=$T2J-$T2K;$T39=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T3a=+HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3];$T3b=$T39-$T3a;$T3u=$T39+$T3a;$T3D=+HEAPF64[$1+($5<<2<<3)>>3];$T3E=+HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3];$T3F=$T3D+$T3E;$T3O=$T3D-$T3E;$T43=+HEAPF64[$2+($5<<2<<3)>>3];$T44=+HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3];$T45=$T43-$T44;$T4o=$T43+$T44;$T4X=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T4Y=+HEAPF64[$2+(($5*5|0)+($4*3|0)<<3)>>3];$T4Z=$T4X-$T4Y;$T5i=$T4X+$T4Y;$T4x=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T4y=+HEAPF64[$1+(($5*5|0)+($4*3|0)<<3)>>3];$T4z=$T4x+$T4y;$T4I=$T4x-$T4y;$T4=+HEAPF64[$1+($4<<1<<3)>>3];$T5=+HEAPF64[$1+(($4*5|0)<<3)>>3];$T6=$T4+$T5;$Td=$T4-$T5;$T7=+HEAPF64[$1+($4<<2<<3)>>3];$T8=+HEAPF64[$1+($4<<3)>>3];$T9=$T7+$T8;$Te=$T7-$T8;$Ta=$T6+$T9;$TP=($T9-$T6)*.8660254037844386;$Tf=$Td+$Te;$Tq=($Te-$Td)*.8660254037844386;$Th=+HEAPF64[$2+($4<<1<<3)>>3];$Ti=+HEAPF64[$2+(($4*5|0)<<3)>>3];$Tj=$Th-$Ti;$TH=$Th+$Ti;$Tk=+HEAPF64[$2+($4<<2<<3)>>3];$Tl=+HEAPF64[$2+($4<<3)>>3];$Tm=$Tk-$Tl;$TI=$Tk+$Tl;$Tn=($Tj-$Tm)*.8660254037844386;$TN=$TH+$TI;$Tu=$Tj+$Tm;$TJ=($TH-$TI)*.8660254037844386;$TY=+HEAPF64[$1+($5+($4<<1)<<3)>>3];$TZ=+HEAPF64[$1+($5+($4*5|0)<<3)>>3];$T10=$TY+$TZ;$T17=$TY-$TZ;$T11=+HEAPF64[$1+($5+($4<<2)<<3)>>3];$T12=+HEAPF64[$1+($5+$4<<3)>>3];$T13=$T11+$T12;$T18=$T11-$T12;$T14=$T10+$T13;$T1J=($T13-$T10)*.8660254037844386;$T19=$T17+$T18;$T1k=($T18-$T17)*.8660254037844386;$T1b=+HEAPF64[$2+($5+($4<<1)<<3)>>3];$T1c=+HEAPF64[$2+($5+($4*5|0)<<3)>>3];$T1d=$T1b-$T1c;$T1B=$T1b+$T1c;$T1e=+HEAPF64[$2+($5+($4<<2)<<3)>>3];$T1f=+HEAPF64[$2+($5+$4<<3)>>3];$T1g=$T1e-$T1f;$T1C=$T1e+$T1f;$T1h=($T1d-$T1g)*.8660254037844386;$T1H=$T1B+$T1C;$T1o=$T1d+$T1g;$T1D=($T1B-$T1C)*.8660254037844386;$T25=+HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3];$T26=+HEAPF64[$2+(($5<<1)+($4*5|0)<<3)>>3];$T27=$T25-$T26;$T2v=$T25+$T26;$T28=+HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3];$T29=+HEAPF64[$2+(($5<<1)+$4<<3)>>3];$T2a=$T28-$T29;$T2w=$T28+$T29;$T2b=($T27-$T2a)*.8660254037844386;$T2B=$T2v+$T2w;$T2i=$T27+$T2a;$T2x=($T2v-$T2w)*.8660254037844386;$T1S=+HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3];$T1T=+HEAPF64[$1+(($5<<1)+($4*5|0)<<3)>>3];$T1U=$T1S+$T1T;$T21=$T1S-$T1T;$T1V=+HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3];$T1W=+HEAPF64[$1+(($5<<1)+$4<<3)>>3];$T1X=$T1V+$T1W;$T22=$T1V-$T1W;$T1Y=$T1U+$T1X;$T2D=($T1X-$T1U)*.8660254037844386;$T23=$T21+$T22;$T2e=($T22-$T21)*.8660254037844386;$T2M=+HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3];$T2N=+HEAPF64[$1+(($5*3|0)+($4*5|0)<<3)>>3];$T2O=$T2M+$T2N;$T2V=$T2M-$T2N;$T2P=+HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3];$T2Q=+HEAPF64[$1+(($5*3|0)+$4<<3)>>3];$T2R=$T2P+$T2Q;$T2W=$T2P-$T2Q;$T2S=$T2O+$T2R;$T3x=($T2R-$T2O)*.8660254037844386;$T2X=$T2V+$T2W;$T38=($T2W-$T2V)*.8660254037844386;$T2Z=+HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3];$T30=+HEAPF64[$2+(($5*3|0)+($4*5|0)<<3)>>3];$T31=$T2Z-$T30;$T3p=$T2Z+$T30;$T32=+HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3];$T33=+HEAPF64[$2+(($5*3|0)+$4<<3)>>3];$T34=$T32-$T33;$T3q=$T32+$T33;$T35=($T31-$T34)*.8660254037844386;$T3v=$T3p+$T3q;$T3c=$T31+$T34;$T3r=($T3p-$T3q)*.8660254037844386;$T3G=+HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3];$T3H=+HEAPF64[$1+(($5<<2)+($4*5|0)<<3)>>3];$T3I=$T3G+$T3H;$T3P=$T3G-$T3H;$T3J=+HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3];$T3K=+HEAPF64[$1+(($5<<2)+$4<<3)>>3];$T3L=$T3J+$T3K;$T3Q=$T3J-$T3K;$T3M=$T3I+$T3L;$T4r=($T3L-$T3I)*.8660254037844386;$T3R=$T3P+$T3Q;$T42=($T3Q-$T3P)*.8660254037844386;$T3T=+HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3];$T3U=+HEAPF64[$2+(($5<<2)+($4*5|0)<<3)>>3];$T3V=$T3T-$T3U;$T4j=$T3T+$T3U;$T3W=+HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3];$T3X=+HEAPF64[$2+(($5<<2)+$4<<3)>>3];$T3Y=$T3W-$T3X;$T4k=$T3W+$T3X;$T3Z=($T3V-$T3Y)*.8660254037844386;$T4p=$T4j+$T4k;$T46=$T3V+$T3Y;$T4l=($T4j-$T4k)*.8660254037844386;$T4N=+HEAPF64[$2+(($5*5|0)+($4<<1)<<3)>>3];$T4O=+HEAPF64[$2+(($5*5|0)+($4*5|0)<<3)>>3];$T4P=$T4N-$T4O;$T5d=$T4N+$T4O;$T4Q=+HEAPF64[$2+(($5*5|0)+($4<<2)<<3)>>3];$T4R=+HEAPF64[$2+(($5*5|0)+$4<<3)>>3];$T4S=$T4Q-$T4R;$T5e=$T4Q+$T4R;$T4T=($T4P-$T4S)*.8660254037844386;$T5j=$T5d+$T5e;$T50=$T4P+$T4S;$T5f=($T5d-$T5e)*.8660254037844386;$T4A=+HEAPF64[$1+(($5*5|0)+($4<<1)<<3)>>3];$T4B=+HEAPF64[$1+(($5*5|0)+($4*5|0)<<3)>>3];$T4C=$T4A+$T4B;$T4J=$T4A-$T4B;$T4D=+HEAPF64[$1+(($5*5|0)+($4<<2)<<3)>>3];$T4E=+HEAPF64[$1+(($5*5|0)+$4<<3)>>3];$T4F=$T4D+$T4E;$T4K=$T4D-$T4E;$T4G=$T4C+$T4F;$T5l=($T4F-$T4C)*.8660254037844386;$T4L=$T4J+$T4K;$T4W=($T4K-$T4J)*.8660254037844386;HEAPF64[$1>>3]=$T3+$Ta;HEAPF64[$2>>3]=$TM+$TN;HEAPF64[$1+($4<<3)>>3]=$TX+$T14;HEAPF64[$2+($4<<3)>>3]=$T1G+$T1H;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T2L+$T2S;HEAPF64[$1+($4<<1<<3)>>3]=$T1R+$T1Y;HEAPF64[$2+($4<<1<<3)>>3]=$T2A+$T2B;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T3u+$T3v;HEAPF64[$2+($4<<2<<3)>>3]=$T4o+$T4p;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T5i+$T5j;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T4z+$T4G;HEAPF64[$1+($4<<2<<3)>>3]=$T3F+$T3M;$T1w=$T16+$T19;$T1y=$T1n+$T1o;$T1v=+HEAPF64[$3+32>>3];$T1x=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+$4<<3)>>3]=$T1v*$T1w+$T1x*$T1y;HEAPF64[$2+(($5*3|0)+$4<<3)>>3]=$T1v*$T1y-$T1x*$T1w;$T58=$T4I+$T4L;$T5a=$T4Z+$T50;$T57=+HEAPF64[$3+32>>3];$T59=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4*5|0)<<3)>>3]=$T57*$T58+$T59*$T5a;HEAPF64[$2+(($5*3|0)+($4*5|0)<<3)>>3]=$T57*$T5a-$T59*$T58;$TC=$Tc+$Tf;$TE=$Tt+$Tu;$TB=+HEAPF64[$3+32>>3];$TD=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)<<3)>>3]=$TB*$TC+$TD*$TE;HEAPF64[$2+(($5*3|0)<<3)>>3]=$TB*$TE-$TD*$TC;$T4e=$T3O+$T3R;$T4g=$T45+$T46;$T4d=+HEAPF64[$3+32>>3];$T4f=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3]=$T4d*$T4e+$T4f*$T4g;HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3]=$T4d*$T4g-$T4f*$T4e;$T3k=$T2U+$T2X;$T3m=$T3b+$T3c;$T3j=+HEAPF64[$3+32>>3];$T3l=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3]=$T3j*$T3k+$T3l*$T3m;HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3]=$T3j*$T3m-$T3l*$T3k;$T2q=$T20+$T23;$T2s=$T2h+$T2i;$T2p=+HEAPF64[$3+32>>3];$T2r=+HEAPF64[$3+40>>3];HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3]=$T2p*$T2q+$T2r*$T2s;HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3]=$T2p*$T2s-$T2r*$T2q;$T5c=$T4z-.5*$T4G;$T5g=$T5c-$T5f;$T5o=$T5c+$T5f;$T5k=$T5i-.5*$T5j;$T5m=$T5k-$T5l;$T5q=$T5l+$T5k;$T5b=+HEAPF64[$3+16>>3];$T5h=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4*5|0)<<3)>>3]=$T5b*$T5g+$T5h*$T5m;HEAPF64[$2+(($5<<1)+($4*5|0)<<3)>>3]=$T5b*$T5m-$T5h*$T5g;$T5n=+HEAPF64[$3+48>>3];$T5p=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*5|0)<<3)>>3]=$T5n*$T5o+$T5p*$T5q;HEAPF64[$2+(($5<<2)+($4*5|0)<<3)>>3]=$T5n*$T5q-$T5p*$T5o;$Tg=$Tc-.5*$Tf;$To=$Tg+$Tn;$Ty=$Tg-$Tn;$Tv=$Tt-.5*$Tu;$Tw=$Tq+$Tv;$TA=$Tv-$Tq;$Tb=+HEAPF64[$3>>3];$Tp=+HEAPF64[$3+8>>3];HEAPF64[$1+($5<<3)>>3]=$Tb*$To+$Tp*$Tw;HEAPF64[$2+($5<<3)>>3]=$Tb*$Tw-$Tp*$To;$Tx=+HEAPF64[$3+64>>3];$Tz=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)<<3)>>3]=$Tx*$Ty+$Tz*$TA;HEAPF64[$2+(($5*5|0)<<3)>>3]=$Tx*$TA-$Tz*$Ty;$T2Y=$T2U-.5*$T2X;$T36=$T2Y+$T35;$T3g=$T2Y-$T35;$T3d=$T3b-.5*$T3c;$T3e=$T38+$T3d;$T3i=$T3d-$T38;$T2T=+HEAPF64[$3>>3];$T37=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*3|0)<<3)>>3]=$T2T*$T36+$T37*$T3e;HEAPF64[$2+($5+($4*3|0)<<3)>>3]=$T2T*$T3e-$T37*$T36;$T3f=+HEAPF64[$3+64>>3];$T3h=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*3|0)<<3)>>3]=$T3f*$T3g+$T3h*$T3i;HEAPF64[$2+(($5*5|0)+($4*3|0)<<3)>>3]=$T3f*$T3i-$T3h*$T3g;$T2u=$T1R-.5*$T1Y;$T2y=$T2u-$T2x;$T2G=$T2u+$T2x;$T2C=$T2A-.5*$T2B;$T2E=$T2C-$T2D;$T2I=$T2D+$T2C;$T2t=+HEAPF64[$3+16>>3];$T2z=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3]=$T2t*$T2y+$T2z*$T2E;HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3]=$T2t*$T2E-$T2z*$T2y;$T2F=+HEAPF64[$3+48>>3];$T2H=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3]=$T2F*$T2G+$T2H*$T2I;HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3]=$T2F*$T2I-$T2H*$T2G;$T3o=$T2L-.5*$T2S;$T3s=$T3o-$T3r;$T3A=$T3o+$T3r;$T3w=$T3u-.5*$T3v;$T3y=$T3w-$T3x;$T3C=$T3x+$T3w;$T3n=+HEAPF64[$3+16>>3];$T3t=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3]=$T3n*$T3s+$T3t*$T3y;HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3]=$T3n*$T3y-$T3t*$T3s;$T3z=+HEAPF64[$3+48>>3];$T3B=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3]=$T3z*$T3A+$T3B*$T3C;HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3]=$T3z*$T3C-$T3B*$T3A;$T1A=$TX-.5*$T14;$T1E=$T1A-$T1D;$T1M=$T1A+$T1D;$T1I=$T1G-.5*$T1H;$T1K=$T1I-$T1J;$T1O=$T1J+$T1I;$T1z=+HEAPF64[$3+16>>3];$T1F=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+$4<<3)>>3]=$T1z*$T1E+$T1F*$T1K;HEAPF64[$2+(($5<<1)+$4<<3)>>3]=$T1z*$T1K-$T1F*$T1E;$T1L=+HEAPF64[$3+48>>3];$T1N=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+$4<<3)>>3]=$T1L*$T1M+$T1N*$T1O;HEAPF64[$2+(($5<<2)+$4<<3)>>3]=$T1L*$T1O-$T1N*$T1M;$T4i=$T3F-.5*$T3M;$T4m=$T4i-$T4l;$T4u=$T4i+$T4l;$T4q=$T4o-.5*$T4p;$T4s=$T4q-$T4r;$T4w=$T4r+$T4q;$T4h=+HEAPF64[$3+16>>3];$T4n=+HEAPF64[$3+24>>3];HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3]=$T4h*$T4m+$T4n*$T4s;HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3]=$T4h*$T4s-$T4n*$T4m;$T4t=+HEAPF64[$3+48>>3];$T4v=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3]=$T4t*$T4u+$T4v*$T4w;HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3]=$T4t*$T4w-$T4v*$T4u;$TG=$T3-.5*$Ta;$TK=$TG-$TJ;$TS=$TG+$TJ;$TO=$TM-.5*$TN;$TQ=$TO-$TP;$TU=$TP+$TO;$TF=+HEAPF64[$3+16>>3];$TL=+HEAPF64[$3+24>>3];HEAPF64[$1+($5<<1<<3)>>3]=$TF*$TK+$TL*$TQ;HEAPF64[$2+($5<<1<<3)>>3]=$TF*$TQ-$TL*$TK;$TR=+HEAPF64[$3+48>>3];$TT=+HEAPF64[$3+56>>3];HEAPF64[$1+($5<<2<<3)>>3]=$TR*$TS+$TT*$TU;HEAPF64[$2+($5<<2<<3)>>3]=$TR*$TU-$TT*$TS;$T24=$T20-.5*$T23;$T2c=$T24+$T2b;$T2m=$T24-$T2b;$T2j=$T2h-.5*$T2i;$T2k=$T2e+$T2j;$T2o=$T2j-$T2e;$T1Z=+HEAPF64[$3>>3];$T2d=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<1)<<3)>>3]=$T1Z*$T2c+$T2d*$T2k;HEAPF64[$2+($5+($4<<1)<<3)>>3]=$T1Z*$T2k-$T2d*$T2c;$T2l=+HEAPF64[$3+64>>3];$T2n=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4<<1)<<3)>>3]=$T2l*$T2m+$T2n*$T2o;HEAPF64[$2+(($5*5|0)+($4<<1)<<3)>>3]=$T2l*$T2o-$T2n*$T2m;$T3S=$T3O-.5*$T3R;$T40=$T3S+$T3Z;$T4a=$T3S-$T3Z;$T47=$T45-.5*$T46;$T48=$T42+$T47;$T4c=$T47-$T42;$T3N=+HEAPF64[$3>>3];$T41=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<2)<<3)>>3]=$T3N*$T40+$T41*$T48;HEAPF64[$2+($5+($4<<2)<<3)>>3]=$T3N*$T48-$T41*$T40;$T49=+HEAPF64[$3+64>>3];$T4b=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4<<2)<<3)>>3]=$T49*$T4a+$T4b*$T4c;HEAPF64[$2+(($5*5|0)+($4<<2)<<3)>>3]=$T49*$T4c-$T4b*$T4a;$T1a=$T16-.5*$T19;$T1i=$T1a+$T1h;$T1s=$T1a-$T1h;$T1p=$T1n-.5*$T1o;$T1q=$T1k+$T1p;$T1u=$T1p-$T1k;$T15=+HEAPF64[$3>>3];$T1j=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+$4<<3)>>3]=$T15*$T1i+$T1j*$T1q;HEAPF64[$2+($5+$4<<3)>>3]=$T15*$T1q-$T1j*$T1i;$T1r=+HEAPF64[$3+64>>3];$T1t=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+$4<<3)>>3]=$T1r*$T1s+$T1t*$T1u;HEAPF64[$2+(($5*5|0)+$4<<3)>>3]=$T1r*$T1u-$T1t*$T1s;$T4M=$T4I-.5*$T4L;$T4U=$T4M+$T4T;$T54=$T4M-$T4T;$T51=$T4Z-.5*$T50;$T52=$T4W+$T51;$T56=$T51-$T4W;$T4H=+HEAPF64[$3>>3];$T4V=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*5|0)<<3)>>3]=$T4H*$T4U+$T4V*$T52;HEAPF64[$2+($5+($4*5|0)<<3)>>3]=$T4H*$T52-$T4V*$T4U;$T53=+HEAPF64[$3+64>>3];$T55=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*5|0)<<3)>>3]=$T53*$T54+$T55*$T56;HEAPF64[$2+(($5*5|0)+($4*5|0)<<3)>>3]=$T53*$T56-$T55*$T54;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+80|0;label=2;break;case 5:return}}function _fftw_codelet_q1_8($p){$p=$p|0;_fftw_kdft_difsq_register($p,876,8552);return}function _q1_8($rio,$iio,$W,$rs,$vs,$mb,$me,$ms){$rio=$rio|0;$iio=$iio|0;$W=$W|0;$rs=$rs|0;$vs=$vs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$m=0,$T7=0.0,$T14=0.0,$T1g=0.0,$Tk=0.0,$TC=0.0,$TQ=0.0,$T10=0.0,$TM=0.0,$T1w=0.0,$T2p=0.0,$T2z=0.0,$T1H=0.0,$T1M=0.0,$T1W=0.0,$T2j=0.0,$T1V=0.0,$T7R=0.0,$T8O=0.0,$T90=0.0,$T84=0.0,$T8m=0.0,$T8A=0.0,$T8K=0.0,$T8w=0.0,$T9g=0.0,$Ta9=0.0,$Taj=0.0,$T9r=0.0,$T9w=0.0,$T9G=0.0,$Ta3=0.0,$T9F=0.0,$Te=0.0,$T17=0.0,$T1h=0.0,$Tp=0.0,$Tu=0.0,$TE=0.0,$T11=0.0,$TD=0.0,$T1p=0.0,$T2m=0.0,$T2y=0.0,$T1C=0.0,$T1U=0.0,$T28=0.0,$T2i=0.0,$T24=0.0,$T7Y=0.0,$T8R=0.0,$T91=0.0,$T89=0.0,$T8e=0.0,$T8o=0.0,$T8L=0.0,$T8n=0.0,$T99=0.0,$Ta6=0.0,$Tai=0.0,$T9m=0.0,$T9E=0.0,$T9S=0.0,$Ta2=0.0,$T9O=0.0,$T2H=0.0,$T3E=0.0,$T3Q=0.0,$T2U=0.0,$T3c=0.0,$T3q=0.0,$T3A=0.0,$T3m=0.0,$T46=0.0,$T4Z=0.0,$T59=0.0,$T4h=0.0,$T4m=0.0,$T4w=0.0,$T4T=0.0,$T4v=0.0,$T5h=0.0,$T6e=0.0,$T6q=0.0,$T5u=0.0,$T5M=0.0,$T60=0.0,$T6a=0.0,$T5W=0.0,$T6G=0.0,$T7z=0.0,$T7J=0.0,$T6R=0.0,$T6W=0.0,$T76=0.0,$T7t=0.0,$T75=0.0,$T2O=0.0,$T3H=0.0,$T3R=0.0,$T2Z=0.0,$T34=0.0,$T3e=0.0,$T3B=0.0,$T3d=0.0,$T3Z=0.0,$T4W=0.0,$T58=0.0,$T4c=0.0,$T4u=0.0,$T4I=0.0,$T4S=0.0,$T4E=0.0,$T5o=0.0,$T6h=0.0,$T6r=0.0,$T5z=0.0,$T5E=0.0,$T5O=0.0,$T6b=0.0,$T5N=0.0,$T6z=0.0,$T7w=0.0,$T7I=0.0,$T6M=0.0,$T74=0.0,$T7i=0.0,$T7s=0.0,$T7e=0.0,$T3=0.0,$Ty=0.0,$Tj=0.0,$TY=0.0,$T6=0.0,$Tg=0.0,$TB=0.0,$TZ=0.0,$T1=0.0,$T2=0.0,$Th=0.0,$Ti=0.0,$T4=0.0,$T5=0.0,$Tz=0.0,$TA=0.0,$T1s=0.0,$T1I=0.0,$T1L=0.0,$T2n=0.0,$T1v=0.0,$T1D=0.0,$T1G=0.0,$T2o=0.0,$T1q=0.0,$T1r=0.0,$T1J=0.0,$T1K=0.0,$T1t=0.0,$T1u=0.0,$T1E=0.0,$T1F=0.0,$T7N=0.0,$T8i=0.0,$T83=0.0,$T8I=0.0,$T7Q=0.0,$T80=0.0,$T8l=0.0,$T8J=0.0,$T7L=0.0,$T7M=0.0,$T81=0.0,$T82=0.0,$T7O=0.0,$T7P=0.0,$T8j=0.0,$T8k=0.0,$T9c=0.0,$T9s=0.0,$T9v=0.0,$Ta7=0.0,$T9f=0.0,$T9n=0.0,$T9q=0.0,$Ta8=0.0,$T9a=0.0,$T9b=0.0,$T9t=0.0,$T9u=0.0,$T9d=0.0,$T9e=0.0,$T9o=0.0,$T9p=0.0,$Ta=0.0,$Tq=0.0,$Tt=0.0,$T15=0.0,$Td=0.0,$Tl=0.0,$To=0.0,$T16=0.0,$T8=0.0,$T9=0.0,$Tr=0.0,$Ts=0.0,$Tb=0.0,$Tc=0.0,$Tm=0.0,$Tn=0.0,$T1l=0.0,$T1Q=0.0,$T1B=0.0,$T2g=0.0,$T1o=0.0,$T1y=0.0,$T1T=0.0,$T2h=0.0,$T1j=0.0,$T1k=0.0,$T1z=0.0,$T1A=0.0,$T1m=0.0,$T1n=0.0,$T1R=0.0,$T1S=0.0,$T7U=0.0,$T8a=0.0,$T8d=0.0,$T8P=0.0,$T7X=0.0,$T85=0.0,$T88=0.0,$T8Q=0.0,$T7S=0.0,$T7T=0.0,$T8b=0.0,$T8c=0.0,$T7V=0.0,$T7W=0.0,$T86=0.0,$T87=0.0,$T95=0.0,$T9A=0.0,$T9l=0.0,$Ta0=0.0,$T98=0.0,$T9i=0.0,$T9D=0.0,$Ta1=0.0,$T93=0.0,$T94=0.0,$T9j=0.0,$T9k=0.0,$T96=0.0,$T97=0.0,$T9B=0.0,$T9C=0.0,$T2D=0.0,$T38=0.0,$T2T=0.0,$T3y=0.0,$T2G=0.0,$T2Q=0.0,$T3b=0.0,$T3z=0.0,$T2B=0.0,$T2C=0.0,$T2R=0.0,$T2S=0.0,$T2E=0.0,$T2F=0.0,$T39=0.0,$T3a=0.0,$T42=0.0,$T4i=0.0,$T4l=0.0,$T4X=0.0,$T45=0.0,$T4d=0.0,$T4g=0.0,$T4Y=0.0,$T40=0.0,$T41=0.0,$T4j=0.0,$T4k=0.0,$T43=0.0,$T44=0.0,$T4e=0.0,$T4f=0.0,$T5d=0.0,$T5I=0.0,$T5t=0.0,$T68=0.0,$T5g=0.0,$T5q=0.0,$T5L=0.0,$T69=0.0,$T5b=0.0,$T5c=0.0,$T5r=0.0,$T5s=0.0,$T5e=0.0,$T5f=0.0,$T5J=0.0,$T5K=0.0,$T6C=0.0,$T6S=0.0,$T6V=0.0,$T7x=0.0,$T6F=0.0,$T6N=0.0,$T6Q=0.0,$T7y=0.0,$T6A=0.0,$T6B=0.0,$T6T=0.0,$T6U=0.0,$T6D=0.0,$T6E=0.0,$T6O=0.0,$T6P=0.0,$T2K=0.0,$T30=0.0,$T33=0.0,$T3F=0.0,$T2N=0.0,$T2V=0.0,$T2Y=0.0,$T3G=0.0,$T2I=0.0,$T2J=0.0,$T31=0.0,$T32=0.0,$T2L=0.0,$T2M=0.0,$T2W=0.0,$T2X=0.0,$T3V=0.0,$T4q=0.0,$T4b=0.0,$T4Q=0.0,$T3Y=0.0,$T48=0.0,$T4t=0.0,$T4R=0.0,$T3T=0.0,$T3U=0.0,$T49=0.0,$T4a=0.0,$T3W=0.0,$T3X=0.0,$T4r=0.0,$T4s=0.0,$T5k=0.0,$T5A=0.0,$T5D=0.0,$T6f=0.0,$T5n=0.0,$T5v=0.0,$T5y=0.0,$T6g=0.0,$T5i=0.0,$T5j=0.0,$T5B=0.0,$T5C=0.0,$T5l=0.0,$T5m=0.0,$T5w=0.0,$T5x=0.0,$T6v=0.0,$T70=0.0,$T6L=0.0,$T7q=0.0,$T6y=0.0,$T6I=0.0,$T73=0.0,$T7r=0.0,$T6t=0.0,$T6u=0.0,$T6J=0.0,$T6K=0.0,$T6w=0.0,$T6x=0.0,$T71=0.0,$T72=0.0,$T12=0.0,$T18=0.0,$TX=0.0,$T13=0.0,$Tag=0.0,$Tak=0.0,$Taf=0.0,$Tah=0.0,$T8M=0.0,$T8S=0.0,$T8H=0.0,$T8N=0.0,$T2k=0.0,$T2q=0.0,$T2f=0.0,$T2l=0.0,$Ta4=0.0,$Taa=0.0,$T9Z=0.0,$Ta5=0.0,$T8Y=0.0,$T92=0.0,$T8X=0.0,$T8Z=0.0,$T2w=0.0,$T2A=0.0,$T2v=0.0,$T2x=0.0,$Tac=0.0,$Tae=0.0,$Tab=0.0,$Tad=0.0,$T8U=0.0,$T8W=0.0,$T8T=0.0,$T8V=0.0,$T1a=0.0,$T1c=0.0,$T19=0.0,$T1b=0.0,$T1e=0.0,$T1i=0.0,$T1d=0.0,$T1f=0.0,$T2s=0.0,$T2u=0.0,$T2r=0.0,$T2t=0.0,$T3C=0.0,$T3I=0.0,$T3x=0.0,$T3D=0.0,$T4U=0.0,$T50=0.0,$T4P=0.0,$T4V=0.0,$T56=0.0,$T5a=0.0,$T55=0.0,$T57=0.0,$T6o=0.0,$T6s=0.0,$T6n=0.0,$T6p=0.0,$T7u=0.0,$T7A=0.0,$T7p=0.0,$T7v=0.0,$T6c=0.0,$T6i=0.0,$T67=0.0,$T6d=0.0,$T7G=0.0,$T7K=0.0,$T7F=0.0,$T7H=0.0,$T3O=0.0,$T3S=0.0,$T3N=0.0,$T3P=0.0,$T3K=0.0,$T3M=0.0,$T3J=0.0,$T3L=0.0,$T7C=0.0,$T7E=0.0,$T7B=0.0,$T7D=0.0,$T6k=0.0,$T6m=0.0,$T6j=0.0,$T6l=0.0,$T52=0.0,$T54=0.0,$T51=0.0,$T53=0.0,$T5G=0.0,$T5S=0.0,$T5Q=0.0,$T5U=0.0,$T5F=0.0,$T5P=0.0,$T5p=0.0,$T5H=0.0,$T5R=0.0,$T5T=0.0,$Tw=0.0,$TI=0.0,$TG=0.0,$TK=0.0,$Tv=0.0,$TF=0.0,$Tf=0.0,$Tx=0.0,$TH=0.0,$TJ=0.0,$T9Q=0.0,$T9W=0.0,$T9U=0.0,$T9Y=0.0,$T9P=0.0,$T9T=0.0,$T9N=0.0,$T9R=0.0,$T9V=0.0,$T9X=0.0,$T36=0.0,$T3i=0.0,$T3g=0.0,$T3k=0.0,$T35=0.0,$T3f=0.0,$T2P=0.0,$T37=0.0,$T3h=0.0,$T3j=0.0,$T5Y=0.0,$T64=0.0,$T62=0.0,$T66=0.0,$T5X=0.0,$T61=0.0,$T5V=0.0,$T5Z=0.0,$T63=0.0,$T65=0.0,$T7g=0.0,$T7m=0.0,$T7k=0.0,$T7o=0.0,$T7f=0.0,$T7j=0.0,$T7d=0.0,$T7h=0.0,$T7l=0.0,$T7n=0.0,$T8g=0.0,$T8s=0.0,$T8q=0.0,$T8u=0.0,$T8f=0.0,$T8p=0.0,$T7Z=0.0,$T8h=0.0,$T8r=0.0,$T8t=0.0,$T4G=0.0,$T4M=0.0,$T4K=0.0,$T4O=0.0,$T4F=0.0,$T4J=0.0,$T4D=0.0,$T4H=0.0,$T4L=0.0,$T4N=0.0,$TO=0.0,$TU=0.0,$TS=0.0,$TW=0.0,$TN=0.0,$TR=0.0,$TL=0.0,$TP=0.0,$TT=0.0,$TV=0.0,$T26=0.0,$T2c=0.0,$T2a=0.0,$T2e=0.0,$T25=0.0,$T29=0.0,$T23=0.0,$T27=0.0,$T2b=0.0,$T2d=0.0,$T9y=0.0,$T9K=0.0,$T9I=0.0,$T9M=0.0,$T9x=0.0,$T9H=0.0,$T9h=0.0,$T9z=0.0,$T9J=0.0,$T9L=0.0,$T6Y=0.0,$T7a=0.0,$T78=0.0,$T7c=0.0,$T6X=0.0,$T77=0.0,$T6H=0.0,$T6Z=0.0,$T79=0.0,$T7b=0.0,$T1O=0.0,$T20=0.0,$T1Y=0.0,$T22=0.0,$T1N=0.0,$T1X=0.0,$T1x=0.0,$T1P=0.0,$T1Z=0.0,$T21=0.0,$T4o=0.0,$T4A=0.0,$T4y=0.0,$T4C=0.0,$T4n=0.0,$T4x=0.0,$T47=0.0,$T4p=0.0,$T4z=0.0,$T4B=0.0,$T3o=0.0,$T3u=0.0,$T3s=0.0,$T3w=0.0,$T3n=0.0,$T3r=0.0,$T3l=0.0,$T3p=0.0,$T3t=0.0,$T3v=0.0,$T8y=0.0,$T8E=0.0,$T8C=0.0,$T8G=0.0,$T8x=0.0,$T8B=0.0,$T8v=0.0,$T8z=0.0,$T8D=0.0,$T8F=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$rio;$2=$iio;$3=$W;$4=$rs;$5=$vs;$6=$mb;$8=$ms;$m=$6;$3=$3+(($6*14|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2=+HEAPF64[$1+($4<<2<<3)>>3];$T3=$T1+$T2;$Ty=$T1-$T2;$Th=+HEAPF64[$2>>3];$Ti=+HEAPF64[$2+($4<<2<<3)>>3];$Tj=$Th-$Ti;$TY=$Th+$Ti;$T4=+HEAPF64[$1+($4<<1<<3)>>3];$T5=+HEAPF64[$1+(($4*6|0)<<3)>>3];$T6=$T4+$T5;$Tg=$T4-$T5;$Tz=+HEAPF64[$2+($4<<1<<3)>>3];$TA=+HEAPF64[$2+(($4*6|0)<<3)>>3];$TB=$Tz-$TA;$TZ=$Tz+$TA;$T7=$T3+$T6;$T14=$T3-$T6;$T1g=$TY+$TZ;$Tk=$Tg+$Tj;$TC=$Ty-$TB;$TQ=$Tj-$Tg;$T10=$TY-$TZ;$TM=$Ty+$TB;$T1q=+HEAPF64[$1+($5+$4<<3)>>3];$T1r=+HEAPF64[$1+($5+($4*5|0)<<3)>>3];$T1s=$T1q+$T1r;$T1I=$T1q-$T1r;$T1J=+HEAPF64[$2+($5+$4<<3)>>3];$T1K=+HEAPF64[$2+($5+($4*5|0)<<3)>>3];$T1L=$T1J-$T1K;$T2n=$T1J+$T1K;$T1t=+HEAPF64[$1+($5+($4*7|0)<<3)>>3];$T1u=+HEAPF64[$1+($5+($4*3|0)<<3)>>3];$T1v=$T1t+$T1u;$T1D=$T1t-$T1u;$T1E=+HEAPF64[$2+($5+($4*7|0)<<3)>>3];$T1F=+HEAPF64[$2+($5+($4*3|0)<<3)>>3];$T1G=$T1E-$T1F;$T2o=$T1E+$T1F;$T1w=$T1s+$T1v;$T2p=$T2n-$T2o;$T2z=$T2n+$T2o;$T1H=$T1D-$T1G;$T1M=$T1I+$T1L;$T1W=$T1D+$T1G;$T2j=$T1v-$T1s;$T1V=$T1L-$T1I;$T7L=+HEAPF64[$1+(($5*6|0)<<3)>>3];$T7M=+HEAPF64[$1+(($5*6|0)+($4<<2)<<3)>>3];$T7N=$T7L+$T7M;$T8i=$T7L-$T7M;$T81=+HEAPF64[$2+(($5*6|0)<<3)>>3];$T82=+HEAPF64[$2+(($5*6|0)+($4<<2)<<3)>>3];$T83=$T81-$T82;$T8I=$T81+$T82;$T7O=+HEAPF64[$1+(($5*6|0)+($4<<1)<<3)>>3];$T7P=+HEAPF64[$1+(($5*6|0)+($4*6|0)<<3)>>3];$T7Q=$T7O+$T7P;$T80=$T7O-$T7P;$T8j=+HEAPF64[$2+(($5*6|0)+($4<<1)<<3)>>3];$T8k=+HEAPF64[$2+(($5*6|0)+($4*6|0)<<3)>>3];$T8l=$T8j-$T8k;$T8J=$T8j+$T8k;$T7R=$T7N+$T7Q;$T8O=$T7N-$T7Q;$T90=$T8I+$T8J;$T84=$T80+$T83;$T8m=$T8i-$T8l;$T8A=$T83-$T80;$T8K=$T8I-$T8J;$T8w=$T8i+$T8l;$T9a=+HEAPF64[$1+(($5*7|0)+$4<<3)>>3];$T9b=+HEAPF64[$1+(($5*7|0)+($4*5|0)<<3)>>3];$T9c=$T9a+$T9b;$T9s=$T9a-$T9b;$T9t=+HEAPF64[$2+(($5*7|0)+$4<<3)>>3];$T9u=+HEAPF64[$2+(($5*7|0)+($4*5|0)<<3)>>3];$T9v=$T9t-$T9u;$Ta7=$T9t+$T9u;$T9d=+HEAPF64[$1+(($5*7|0)+($4*7|0)<<3)>>3];$T9e=+HEAPF64[$1+(($5*7|0)+($4*3|0)<<3)>>3];$T9f=$T9d+$T9e;$T9n=$T9d-$T9e;$T9o=+HEAPF64[$2+(($5*7|0)+($4*7|0)<<3)>>3];$T9p=+HEAPF64[$2+(($5*7|0)+($4*3|0)<<3)>>3];$T9q=$T9o-$T9p;$Ta8=$T9o+$T9p;$T9g=$T9c+$T9f;$Ta9=$Ta7-$Ta8;$Taj=$Ta7+$Ta8;$T9r=$T9n-$T9q;$T9w=$T9s+$T9v;$T9G=$T9n+$T9q;$Ta3=$T9f-$T9c;$T9F=$T9v-$T9s;$T8=+HEAPF64[$1+($4<<3)>>3];$T9=+HEAPF64[$1+(($4*5|0)<<3)>>3];$Ta=$T8+$T9;$Tq=$T8-$T9;$Tr=+HEAPF64[$2+($4<<3)>>3];$Ts=+HEAPF64[$2+(($4*5|0)<<3)>>3];$Tt=$Tr-$Ts;$T15=$Tr+$Ts;$Tb=+HEAPF64[$1+(($4*7|0)<<3)>>3];$Tc=+HEAPF64[$1+(($4*3|0)<<3)>>3];$Td=$Tb+$Tc;$Tl=$Tb-$Tc;$Tm=+HEAPF64[$2+(($4*7|0)<<3)>>3];$Tn=+HEAPF64[$2+(($4*3|0)<<3)>>3];$To=$Tm-$Tn;$T16=$Tm+$Tn;$Te=$Ta+$Td;$T17=$T15-$T16;$T1h=$T15+$T16;$Tp=$Tl-$To;$Tu=$Tq+$Tt;$TE=$Tl+$To;$T11=$Td-$Ta;$TD=$Tt-$Tq;$T1j=+HEAPF64[$1+($5<<3)>>3];$T1k=+HEAPF64[$1+($5+($4<<2)<<3)>>3];$T1l=$T1j+$T1k;$T1Q=$T1j-$T1k;$T1z=+HEAPF64[$2+($5<<3)>>3];$T1A=+HEAPF64[$2+($5+($4<<2)<<3)>>3];$T1B=$T1z-$T1A;$T2g=$T1z+$T1A;$T1m=+HEAPF64[$1+($5+($4<<1)<<3)>>3];$T1n=+HEAPF64[$1+($5+($4*6|0)<<3)>>3];$T1o=$T1m+$T1n;$T1y=$T1m-$T1n;$T1R=+HEAPF64[$2+($5+($4<<1)<<3)>>3];$T1S=+HEAPF64[$2+($5+($4*6|0)<<3)>>3];$T1T=$T1R-$T1S;$T2h=$T1R+$T1S;$T1p=$T1l+$T1o;$T2m=$T1l-$T1o;$T2y=$T2g+$T2h;$T1C=$T1y+$T1B;$T1U=$T1Q-$T1T;$T28=$T1B-$T1y;$T2i=$T2g-$T2h;$T24=$T1Q+$T1T;$T7S=+HEAPF64[$1+(($5*6|0)+$4<<3)>>3];$T7T=+HEAPF64[$1+(($5*6|0)+($4*5|0)<<3)>>3];$T7U=$T7S+$T7T;$T8a=$T7S-$T7T;$T8b=+HEAPF64[$2+(($5*6|0)+$4<<3)>>3];$T8c=+HEAPF64[$2+(($5*6|0)+($4*5|0)<<3)>>3];$T8d=$T8b-$T8c;$T8P=$T8b+$T8c;$T7V=+HEAPF64[$1+(($5*6|0)+($4*7|0)<<3)>>3];$T7W=+HEAPF64[$1+(($5*6|0)+($4*3|0)<<3)>>3];$T7X=$T7V+$T7W;$T85=$T7V-$T7W;$T86=+HEAPF64[$2+(($5*6|0)+($4*7|0)<<3)>>3];$T87=+HEAPF64[$2+(($5*6|0)+($4*3|0)<<3)>>3];$T88=$T86-$T87;$T8Q=$T86+$T87;$T7Y=$T7U+$T7X;$T8R=$T8P-$T8Q;$T91=$T8P+$T8Q;$T89=$T85-$T88;$T8e=$T8a+$T8d;$T8o=$T85+$T88;$T8L=$T7X-$T7U;$T8n=$T8d-$T8a;$T93=+HEAPF64[$1+(($5*7|0)<<3)>>3];$T94=+HEAPF64[$1+(($5*7|0)+($4<<2)<<3)>>3];$T95=$T93+$T94;$T9A=$T93-$T94;$T9j=+HEAPF64[$2+(($5*7|0)<<3)>>3];$T9k=+HEAPF64[$2+(($5*7|0)+($4<<2)<<3)>>3];$T9l=$T9j-$T9k;$Ta0=$T9j+$T9k;$T96=+HEAPF64[$1+(($5*7|0)+($4<<1)<<3)>>3];$T97=+HEAPF64[$1+(($5*7|0)+($4*6|0)<<3)>>3];$T98=$T96+$T97;$T9i=$T96-$T97;$T9B=+HEAPF64[$2+(($5*7|0)+($4<<1)<<3)>>3];$T9C=+HEAPF64[$2+(($5*7|0)+($4*6|0)<<3)>>3];$T9D=$T9B-$T9C;$Ta1=$T9B+$T9C;$T99=$T95+$T98;$Ta6=$T95-$T98;$Tai=$Ta0+$Ta1;$T9m=$T9i+$T9l;$T9E=$T9A-$T9D;$T9S=$T9l-$T9i;$Ta2=$Ta0-$Ta1;$T9O=$T9A+$T9D;$T2B=+HEAPF64[$1+($5<<1<<3)>>3];$T2C=+HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3];$T2D=$T2B+$T2C;$T38=$T2B-$T2C;$T2R=+HEAPF64[$2+($5<<1<<3)>>3];$T2S=+HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3];$T2T=$T2R-$T2S;$T3y=$T2R+$T2S;$T2E=+HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3];$T2F=+HEAPF64[$1+(($5<<1)+($4*6|0)<<3)>>3];$T2G=$T2E+$T2F;$T2Q=$T2E-$T2F;$T39=+HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3];$T3a=+HEAPF64[$2+(($5<<1)+($4*6|0)<<3)>>3];$T3b=$T39-$T3a;$T3z=$T39+$T3a;$T2H=$T2D+$T2G;$T3E=$T2D-$T2G;$T3Q=$T3y+$T3z;$T2U=$T2Q+$T2T;$T3c=$T38-$T3b;$T3q=$T2T-$T2Q;$T3A=$T3y-$T3z;$T3m=$T38+$T3b;$T40=+HEAPF64[$1+(($5*3|0)+$4<<3)>>3];$T41=+HEAPF64[$1+(($5*3|0)+($4*5|0)<<3)>>3];$T42=$T40+$T41;$T4i=$T40-$T41;$T4j=+HEAPF64[$2+(($5*3|0)+$4<<3)>>3];$T4k=+HEAPF64[$2+(($5*3|0)+($4*5|0)<<3)>>3];$T4l=$T4j-$T4k;$T4X=$T4j+$T4k;$T43=+HEAPF64[$1+(($5*3|0)+($4*7|0)<<3)>>3];$T44=+HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3];$T45=$T43+$T44;$T4d=$T43-$T44;$T4e=+HEAPF64[$2+(($5*3|0)+($4*7|0)<<3)>>3];$T4f=+HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3];$T4g=$T4e-$T4f;$T4Y=$T4e+$T4f;$T46=$T42+$T45;$T4Z=$T4X-$T4Y;$T59=$T4X+$T4Y;$T4h=$T4d-$T4g;$T4m=$T4i+$T4l;$T4w=$T4d+$T4g;$T4T=$T45-$T42;$T4v=$T4l-$T4i;$T5b=+HEAPF64[$1+($5<<2<<3)>>3];$T5c=+HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3];$T5d=$T5b+$T5c;$T5I=$T5b-$T5c;$T5r=+HEAPF64[$2+($5<<2<<3)>>3];$T5s=+HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3];$T5t=$T5r-$T5s;$T68=$T5r+$T5s;$T5e=+HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3];$T5f=+HEAPF64[$1+(($5<<2)+($4*6|0)<<3)>>3];$T5g=$T5e+$T5f;$T5q=$T5e-$T5f;$T5J=+HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3];$T5K=+HEAPF64[$2+(($5<<2)+($4*6|0)<<3)>>3];$T5L=$T5J-$T5K;$T69=$T5J+$T5K;$T5h=$T5d+$T5g;$T6e=$T5d-$T5g;$T6q=$T68+$T69;$T5u=$T5q+$T5t;$T5M=$T5I-$T5L;$T60=$T5t-$T5q;$T6a=$T68-$T69;$T5W=$T5I+$T5L;$T6A=+HEAPF64[$1+(($5*5|0)+$4<<3)>>3];$T6B=+HEAPF64[$1+(($5*5|0)+($4*5|0)<<3)>>3];$T6C=$T6A+$T6B;$T6S=$T6A-$T6B;$T6T=+HEAPF64[$2+(($5*5|0)+$4<<3)>>3];$T6U=+HEAPF64[$2+(($5*5|0)+($4*5|0)<<3)>>3];$T6V=$T6T-$T6U;$T7x=$T6T+$T6U;$T6D=+HEAPF64[$1+(($5*5|0)+($4*7|0)<<3)>>3];$T6E=+HEAPF64[$1+(($5*5|0)+($4*3|0)<<3)>>3];$T6F=$T6D+$T6E;$T6N=$T6D-$T6E;$T6O=+HEAPF64[$2+(($5*5|0)+($4*7|0)<<3)>>3];$T6P=+HEAPF64[$2+(($5*5|0)+($4*3|0)<<3)>>3];$T6Q=$T6O-$T6P;$T7y=$T6O+$T6P;$T6G=$T6C+$T6F;$T7z=$T7x-$T7y;$T7J=$T7x+$T7y;$T6R=$T6N-$T6Q;$T6W=$T6S+$T6V;$T76=$T6N+$T6Q;$T7t=$T6F-$T6C;$T75=$T6V-$T6S;$T2I=+HEAPF64[$1+(($5<<1)+$4<<3)>>3];$T2J=+HEAPF64[$1+(($5<<1)+($4*5|0)<<3)>>3];$T2K=$T2I+$T2J;$T30=$T2I-$T2J;$T31=+HEAPF64[$2+(($5<<1)+$4<<3)>>3];$T32=+HEAPF64[$2+(($5<<1)+($4*5|0)<<3)>>3];$T33=$T31-$T32;$T3F=$T31+$T32;$T2L=+HEAPF64[$1+(($5<<1)+($4*7|0)<<3)>>3];$T2M=+HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3];$T2N=$T2L+$T2M;$T2V=$T2L-$T2M;$T2W=+HEAPF64[$2+(($5<<1)+($4*7|0)<<3)>>3];$T2X=+HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3];$T2Y=$T2W-$T2X;$T3G=$T2W+$T2X;$T2O=$T2K+$T2N;$T3H=$T3F-$T3G;$T3R=$T3F+$T3G;$T2Z=$T2V-$T2Y;$T34=$T30+$T33;$T3e=$T2V+$T2Y;$T3B=$T2N-$T2K;$T3d=$T33-$T30;$T3T=+HEAPF64[$1+(($5*3|0)<<3)>>3];$T3U=+HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3];$T3V=$T3T+$T3U;$T4q=$T3T-$T3U;$T49=+HEAPF64[$2+(($5*3|0)<<3)>>3];$T4a=+HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3];$T4b=$T49-$T4a;$T4Q=$T49+$T4a;$T3W=+HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3];$T3X=+HEAPF64[$1+(($5*3|0)+($4*6|0)<<3)>>3];$T3Y=$T3W+$T3X;$T48=$T3W-$T3X;$T4r=+HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3];$T4s=+HEAPF64[$2+(($5*3|0)+($4*6|0)<<3)>>3];$T4t=$T4r-$T4s;$T4R=$T4r+$T4s;$T3Z=$T3V+$T3Y;$T4W=$T3V-$T3Y;$T58=$T4Q+$T4R;$T4c=$T48+$T4b;$T4u=$T4q-$T4t;$T4I=$T4b-$T48;$T4S=$T4Q-$T4R;$T4E=$T4q+$T4t;$T5i=+HEAPF64[$1+(($5<<2)+$4<<3)>>3];$T5j=+HEAPF64[$1+(($5<<2)+($4*5|0)<<3)>>3];$T5k=$T5i+$T5j;$T5A=$T5i-$T5j;$T5B=+HEAPF64[$2+(($5<<2)+$4<<3)>>3];$T5C=+HEAPF64[$2+(($5<<2)+($4*5|0)<<3)>>3];$T5D=$T5B-$T5C;$T6f=$T5B+$T5C;$T5l=+HEAPF64[$1+(($5<<2)+($4*7|0)<<3)>>3];$T5m=+HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3];$T5n=$T5l+$T5m;$T5v=$T5l-$T5m;$T5w=+HEAPF64[$2+(($5<<2)+($4*7|0)<<3)>>3];$T5x=+HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3];$T5y=$T5w-$T5x;$T6g=$T5w+$T5x;$T5o=$T5k+$T5n;$T6h=$T6f-$T6g;$T6r=$T6f+$T6g;$T5z=$T5v-$T5y;$T5E=$T5A+$T5D;$T5O=$T5v+$T5y;$T6b=$T5n-$T5k;$T5N=$T5D-$T5A;$T6t=+HEAPF64[$1+(($5*5|0)<<3)>>3];$T6u=+HEAPF64[$1+(($5*5|0)+($4<<2)<<3)>>3];$T6v=$T6t+$T6u;$T70=$T6t-$T6u;$T6J=+HEAPF64[$2+(($5*5|0)<<3)>>3];$T6K=+HEAPF64[$2+(($5*5|0)+($4<<2)<<3)>>3];$T6L=$T6J-$T6K;$T7q=$T6J+$T6K;$T6w=+HEAPF64[$1+(($5*5|0)+($4<<1)<<3)>>3];$T6x=+HEAPF64[$1+(($5*5|0)+($4*6|0)<<3)>>3];$T6y=$T6w+$T6x;$T6I=$T6w-$T6x;$T71=+HEAPF64[$2+(($5*5|0)+($4<<1)<<3)>>3];$T72=+HEAPF64[$2+(($5*5|0)+($4*6|0)<<3)>>3];$T73=$T71-$T72;$T7r=$T71+$T72;$T6z=$T6v+$T6y;$T7w=$T6v-$T6y;$T7I=$T7q+$T7r;$T6M=$T6I+$T6L;$T74=$T70-$T73;$T7i=$T6L-$T6I;$T7s=$T7q-$T7r;$T7e=$T70+$T73;HEAPF64[$1>>3]=$T7+$Te;HEAPF64[$2>>3]=$T1g+$T1h;HEAPF64[$1+($4<<3)>>3]=$T1p+$T1w;HEAPF64[$2+($4<<3)>>3]=$T2y+$T2z;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T3Z+$T46;HEAPF64[$1+($4<<1<<3)>>3]=$T2H+$T2O;HEAPF64[$2+($4<<1<<3)>>3]=$T3Q+$T3R;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T58+$T59;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T7R+$T7Y;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T90+$T91;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T7I+$T7J;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T6z+$T6G;HEAPF64[$2+($4<<2<<3)>>3]=$T6q+$T6r;HEAPF64[$1+($4<<2<<3)>>3]=$T5h+$T5o;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T99+$T9g;HEAPF64[$2+(($4*7|0)<<3)>>3]=$Tai+$Taj;$T12=$T10-$T11;$T18=$T14-$T17;$TX=+HEAPF64[$3+80>>3];$T13=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)<<3)>>3]=$TX*$T12-$T13*$T18;HEAPF64[$1+(($5*6|0)<<3)>>3]=$T13*$T12+$TX*$T18;$Tag=$T99-$T9g;$Tak=$Tai-$Taj;$Taf=+HEAPF64[$3+48>>3];$Tah=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*7|0)<<3)>>3]=$Taf*$Tag+$Tah*$Tak;HEAPF64[$2+(($5<<2)+($4*7|0)<<3)>>3]=$Taf*$Tak-$Tah*$Tag;$T8M=$T8K-$T8L;$T8S=$T8O-$T8R;$T8H=+HEAPF64[$3+80>>3];$T8N=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4*6|0)<<3)>>3]=$T8H*$T8M-$T8N*$T8S;HEAPF64[$1+(($5*6|0)+($4*6|0)<<3)>>3]=$T8N*$T8M+$T8H*$T8S;$T2k=$T2i-$T2j;$T2q=$T2m-$T2p;$T2f=+HEAPF64[$3+80>>3];$T2l=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+$4<<3)>>3]=$T2f*$T2k-$T2l*$T2q;HEAPF64[$1+(($5*6|0)+$4<<3)>>3]=$T2l*$T2k+$T2f*$T2q;$Ta4=$Ta2-$Ta3;$Taa=$Ta6-$Ta9;$T9Z=+HEAPF64[$3+80>>3];$Ta5=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4*7|0)<<3)>>3]=$T9Z*$Ta4-$Ta5*$Taa;HEAPF64[$1+(($5*6|0)+($4*7|0)<<3)>>3]=$Ta5*$Ta4+$T9Z*$Taa;$T8Y=$T7R-$T7Y;$T92=$T90-$T91;$T8X=+HEAPF64[$3+48>>3];$T8Z=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*6|0)<<3)>>3]=$T8X*$T8Y+$T8Z*$T92;HEAPF64[$2+(($5<<2)+($4*6|0)<<3)>>3]=$T8X*$T92-$T8Z*$T8Y;$T2w=$T1p-$T1w;$T2A=$T2y-$T2z;$T2v=+HEAPF64[$3+48>>3];$T2x=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+$4<<3)>>3]=$T2v*$T2w+$T2x*$T2A;HEAPF64[$2+(($5<<2)+$4<<3)>>3]=$T2v*$T2A-$T2x*$T2w;$Tac=$Ta3+$Ta2;$Tae=$Ta6+$Ta9;$Tab=+HEAPF64[$3+16>>3];$Tad=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4*7|0)<<3)>>3]=$Tab*$Tac-$Tad*$Tae;HEAPF64[$1+(($5<<1)+($4*7|0)<<3)>>3]=$Tad*$Tac+$Tab*$Tae;$T8U=$T8L+$T8K;$T8W=$T8O+$T8R;$T8T=+HEAPF64[$3+16>>3];$T8V=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4*6|0)<<3)>>3]=$T8T*$T8U-$T8V*$T8W;HEAPF64[$1+(($5<<1)+($4*6|0)<<3)>>3]=$T8V*$T8U+$T8T*$T8W;$T1a=$T11+$T10;$T1c=$T14+$T17;$T19=+HEAPF64[$3+16>>3];$T1b=+HEAPF64[$3+24>>3];HEAPF64[$2+($5<<1<<3)>>3]=$T19*$T1a-$T1b*$T1c;HEAPF64[$1+($5<<1<<3)>>3]=$T1b*$T1a+$T19*$T1c;$T1e=$T7-$Te;$T1i=$T1g-$T1h;$T1d=+HEAPF64[$3+48>>3];$T1f=+HEAPF64[$3+56>>3];HEAPF64[$1+($5<<2<<3)>>3]=$T1d*$T1e+$T1f*$T1i;HEAPF64[$2+($5<<2<<3)>>3]=$T1d*$T1i-$T1f*$T1e;$T2s=$T2j+$T2i;$T2u=$T2m+$T2p;$T2r=+HEAPF64[$3+16>>3];$T2t=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+$4<<3)>>3]=$T2r*$T2s-$T2t*$T2u;HEAPF64[$1+(($5<<1)+$4<<3)>>3]=$T2t*$T2s+$T2r*$T2u;$T3C=$T3A-$T3B;$T3I=$T3E-$T3H;$T3x=+HEAPF64[$3+80>>3];$T3D=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4<<1)<<3)>>3]=$T3x*$T3C-$T3D*$T3I;HEAPF64[$1+(($5*6|0)+($4<<1)<<3)>>3]=$T3D*$T3C+$T3x*$T3I;$T4U=$T4S-$T4T;$T50=$T4W-$T4Z;$T4P=+HEAPF64[$3+80>>3];$T4V=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4*3|0)<<3)>>3]=$T4P*$T4U-$T4V*$T50;HEAPF64[$1+(($5*6|0)+($4*3|0)<<3)>>3]=$T4V*$T4U+$T4P*$T50;$T56=$T3Z-$T46;$T5a=$T58-$T59;$T55=+HEAPF64[$3+48>>3];$T57=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*3|0)<<3)>>3]=$T55*$T56+$T57*$T5a;HEAPF64[$2+(($5<<2)+($4*3|0)<<3)>>3]=$T55*$T5a-$T57*$T56;$T6o=$T5h-$T5o;$T6s=$T6q-$T6r;$T6n=+HEAPF64[$3+48>>3];$T6p=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<2)<<3)>>3]=$T6n*$T6o+$T6p*$T6s;HEAPF64[$2+(($5<<2)+($4<<2)<<3)>>3]=$T6n*$T6s-$T6p*$T6o;$T7u=$T7s-$T7t;$T7A=$T7w-$T7z;$T7p=+HEAPF64[$3+80>>3];$T7v=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4*5|0)<<3)>>3]=$T7p*$T7u-$T7v*$T7A;HEAPF64[$1+(($5*6|0)+($4*5|0)<<3)>>3]=$T7v*$T7u+$T7p*$T7A;$T6c=$T6a-$T6b;$T6i=$T6e-$T6h;$T67=+HEAPF64[$3+80>>3];$T6d=+HEAPF64[$3+88>>3];HEAPF64[$2+(($5*6|0)+($4<<2)<<3)>>3]=$T67*$T6c-$T6d*$T6i;HEAPF64[$1+(($5*6|0)+($4<<2)<<3)>>3]=$T6d*$T6c+$T67*$T6i;$T7G=$T6z-$T6G;$T7K=$T7I-$T7J;$T7F=+HEAPF64[$3+48>>3];$T7H=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4*5|0)<<3)>>3]=$T7F*$T7G+$T7H*$T7K;HEAPF64[$2+(($5<<2)+($4*5|0)<<3)>>3]=$T7F*$T7K-$T7H*$T7G;$T3O=$T2H-$T2O;$T3S=$T3Q-$T3R;$T3N=+HEAPF64[$3+48>>3];$T3P=+HEAPF64[$3+56>>3];HEAPF64[$1+(($5<<2)+($4<<1)<<3)>>3]=$T3N*$T3O+$T3P*$T3S;HEAPF64[$2+(($5<<2)+($4<<1)<<3)>>3]=$T3N*$T3S-$T3P*$T3O;$T3K=$T3B+$T3A;$T3M=$T3E+$T3H;$T3J=+HEAPF64[$3+16>>3];$T3L=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4<<1)<<3)>>3]=$T3J*$T3K-$T3L*$T3M;HEAPF64[$1+(($5<<1)+($4<<1)<<3)>>3]=$T3L*$T3K+$T3J*$T3M;$T7C=$T7t+$T7s;$T7E=$T7w+$T7z;$T7B=+HEAPF64[$3+16>>3];$T7D=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4*5|0)<<3)>>3]=$T7B*$T7C-$T7D*$T7E;HEAPF64[$1+(($5<<1)+($4*5|0)<<3)>>3]=$T7D*$T7C+$T7B*$T7E;$T6k=$T6b+$T6a;$T6m=$T6e+$T6h;$T6j=+HEAPF64[$3+16>>3];$T6l=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4<<2)<<3)>>3]=$T6j*$T6k-$T6l*$T6m;HEAPF64[$1+(($5<<1)+($4<<2)<<3)>>3]=$T6l*$T6k+$T6j*$T6m;$T52=$T4T+$T4S;$T54=$T4W+$T4Z;$T51=+HEAPF64[$3+16>>3];$T53=+HEAPF64[$3+24>>3];HEAPF64[$2+(($5<<1)+($4*3|0)<<3)>>3]=$T51*$T52-$T53*$T54;HEAPF64[$1+(($5<<1)+($4*3|0)<<3)>>3]=$T53*$T52+$T51*$T54;$T5F=($T5z-$T5E)*.7071067811865476;$T5G=$T5u-$T5F;$T5S=$T5u+$T5F;$T5P=($T5N-$T5O)*.7071067811865476;$T5Q=$T5M-$T5P;$T5U=$T5M+$T5P;$T5p=+HEAPF64[$3+96>>3];$T5H=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4<<2)<<3)>>3]=$T5p*$T5G-$T5H*$T5Q;HEAPF64[$1+(($5*7|0)+($4<<2)<<3)>>3]=$T5H*$T5G+$T5p*$T5Q;$T5R=+HEAPF64[$3+32>>3];$T5T=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4<<2)<<3)>>3]=$T5R*$T5S-$T5T*$T5U;HEAPF64[$1+(($5*3|0)+($4<<2)<<3)>>3]=$T5T*$T5S+$T5R*$T5U;$Tv=($Tp-$Tu)*.7071067811865476;$Tw=$Tk-$Tv;$TI=$Tk+$Tv;$TF=($TD-$TE)*.7071067811865476;$TG=$TC-$TF;$TK=$TC+$TF;$Tf=+HEAPF64[$3+96>>3];$Tx=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)<<3)>>3]=$Tf*$Tw-$Tx*$TG;HEAPF64[$1+(($5*7|0)<<3)>>3]=$Tx*$Tw+$Tf*$TG;$TH=+HEAPF64[$3+32>>3];$TJ=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)<<3)>>3]=$TH*$TI-$TJ*$TK;HEAPF64[$1+(($5*3|0)<<3)>>3]=$TJ*$TI+$TH*$TK;$T9P=($T9w+$T9r)*.7071067811865476;$T9Q=$T9O-$T9P;$T9W=$T9O+$T9P;$T9T=($T9F+$T9G)*.7071067811865476;$T9U=$T9S-$T9T;$T9Y=$T9S+$T9T;$T9N=+HEAPF64[$3+64>>3];$T9R=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*7|0)<<3)>>3]=$T9N*$T9Q+$T9R*$T9U;HEAPF64[$2+(($5*5|0)+($4*7|0)<<3)>>3]=$T9N*$T9U-$T9R*$T9Q;$T9V=+HEAPF64[$3>>3];$T9X=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*7|0)<<3)>>3]=$T9V*$T9W+$T9X*$T9Y;HEAPF64[$2+($5+($4*7|0)<<3)>>3]=$T9V*$T9Y-$T9X*$T9W;$T35=($T2Z-$T34)*.7071067811865476;$T36=$T2U-$T35;$T3i=$T2U+$T35;$T3f=($T3d-$T3e)*.7071067811865476;$T3g=$T3c-$T3f;$T3k=$T3c+$T3f;$T2P=+HEAPF64[$3+96>>3];$T37=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4<<1)<<3)>>3]=$T2P*$T36-$T37*$T3g;HEAPF64[$1+(($5*7|0)+($4<<1)<<3)>>3]=$T37*$T36+$T2P*$T3g;$T3h=+HEAPF64[$3+32>>3];$T3j=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4<<1)<<3)>>3]=$T3h*$T3i-$T3j*$T3k;HEAPF64[$1+(($5*3|0)+($4<<1)<<3)>>3]=$T3j*$T3i+$T3h*$T3k;$T5X=($T5E+$T5z)*.7071067811865476;$T5Y=$T5W-$T5X;$T64=$T5W+$T5X;$T61=($T5N+$T5O)*.7071067811865476;$T62=$T60-$T61;$T66=$T60+$T61;$T5V=+HEAPF64[$3+64>>3];$T5Z=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4<<2)<<3)>>3]=$T5V*$T5Y+$T5Z*$T62;HEAPF64[$2+(($5*5|0)+($4<<2)<<3)>>3]=$T5V*$T62-$T5Z*$T5Y;$T63=+HEAPF64[$3>>3];$T65=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<2)<<3)>>3]=$T63*$T64+$T65*$T66;HEAPF64[$2+($5+($4<<2)<<3)>>3]=$T63*$T66-$T65*$T64;$T7f=($T6W+$T6R)*.7071067811865476;$T7g=$T7e-$T7f;$T7m=$T7e+$T7f;$T7j=($T75+$T76)*.7071067811865476;$T7k=$T7i-$T7j;$T7o=$T7i+$T7j;$T7d=+HEAPF64[$3+64>>3];$T7h=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*5|0)<<3)>>3]=$T7d*$T7g+$T7h*$T7k;HEAPF64[$2+(($5*5|0)+($4*5|0)<<3)>>3]=$T7d*$T7k-$T7h*$T7g;$T7l=+HEAPF64[$3>>3];$T7n=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*5|0)<<3)>>3]=$T7l*$T7m+$T7n*$T7o;HEAPF64[$2+($5+($4*5|0)<<3)>>3]=$T7l*$T7o-$T7n*$T7m;$T8f=($T89-$T8e)*.7071067811865476;$T8g=$T84-$T8f;$T8s=$T84+$T8f;$T8p=($T8n-$T8o)*.7071067811865476;$T8q=$T8m-$T8p;$T8u=$T8m+$T8p;$T7Z=+HEAPF64[$3+96>>3];$T8h=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4*6|0)<<3)>>3]=$T7Z*$T8g-$T8h*$T8q;HEAPF64[$1+(($5*7|0)+($4*6|0)<<3)>>3]=$T8h*$T8g+$T7Z*$T8q;$T8r=+HEAPF64[$3+32>>3];$T8t=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4*6|0)<<3)>>3]=$T8r*$T8s-$T8t*$T8u;HEAPF64[$1+(($5*3|0)+($4*6|0)<<3)>>3]=$T8t*$T8s+$T8r*$T8u;$T4F=($T4m+$T4h)*.7071067811865476;$T4G=$T4E-$T4F;$T4M=$T4E+$T4F;$T4J=($T4v+$T4w)*.7071067811865476;$T4K=$T4I-$T4J;$T4O=$T4I+$T4J;$T4D=+HEAPF64[$3+64>>3];$T4H=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*3|0)<<3)>>3]=$T4D*$T4G+$T4H*$T4K;HEAPF64[$2+(($5*5|0)+($4*3|0)<<3)>>3]=$T4D*$T4K-$T4H*$T4G;$T4L=+HEAPF64[$3>>3];$T4N=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*3|0)<<3)>>3]=$T4L*$T4M+$T4N*$T4O;HEAPF64[$2+($5+($4*3|0)<<3)>>3]=$T4L*$T4O-$T4N*$T4M;$TN=($Tu+$Tp)*.7071067811865476;$TO=$TM-$TN;$TU=$TM+$TN;$TR=($TD+$TE)*.7071067811865476;$TS=$TQ-$TR;$TW=$TQ+$TR;$TL=+HEAPF64[$3+64>>3];$TP=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)<<3)>>3]=$TL*$TO+$TP*$TS;HEAPF64[$2+(($5*5|0)<<3)>>3]=$TL*$TS-$TP*$TO;$TT=+HEAPF64[$3>>3];$TV=+HEAPF64[$3+8>>3];HEAPF64[$1+($5<<3)>>3]=$TT*$TU+$TV*$TW;HEAPF64[$2+($5<<3)>>3]=$TT*$TW-$TV*$TU;$T25=($T1M+$T1H)*.7071067811865476;$T26=$T24-$T25;$T2c=$T24+$T25;$T29=($T1V+$T1W)*.7071067811865476;$T2a=$T28-$T29;$T2e=$T28+$T29;$T23=+HEAPF64[$3+64>>3];$T27=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+$4<<3)>>3]=$T23*$T26+$T27*$T2a;HEAPF64[$2+(($5*5|0)+$4<<3)>>3]=$T23*$T2a-$T27*$T26;$T2b=+HEAPF64[$3>>3];$T2d=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+$4<<3)>>3]=$T2b*$T2c+$T2d*$T2e;HEAPF64[$2+($5+$4<<3)>>3]=$T2b*$T2e-$T2d*$T2c;$T9x=($T9r-$T9w)*.7071067811865476;$T9y=$T9m-$T9x;$T9K=$T9m+$T9x;$T9H=($T9F-$T9G)*.7071067811865476;$T9I=$T9E-$T9H;$T9M=$T9E+$T9H;$T9h=+HEAPF64[$3+96>>3];$T9z=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4*7|0)<<3)>>3]=$T9h*$T9y-$T9z*$T9I;HEAPF64[$1+(($5*7|0)+($4*7|0)<<3)>>3]=$T9z*$T9y+$T9h*$T9I;$T9J=+HEAPF64[$3+32>>3];$T9L=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4*7|0)<<3)>>3]=$T9J*$T9K-$T9L*$T9M;HEAPF64[$1+(($5*3|0)+($4*7|0)<<3)>>3]=$T9L*$T9K+$T9J*$T9M;$T6X=($T6R-$T6W)*.7071067811865476;$T6Y=$T6M-$T6X;$T7a=$T6M+$T6X;$T77=($T75-$T76)*.7071067811865476;$T78=$T74-$T77;$T7c=$T74+$T77;$T6H=+HEAPF64[$3+96>>3];$T6Z=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4*5|0)<<3)>>3]=$T6H*$T6Y-$T6Z*$T78;HEAPF64[$1+(($5*7|0)+($4*5|0)<<3)>>3]=$T6Z*$T6Y+$T6H*$T78;$T79=+HEAPF64[$3+32>>3];$T7b=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4*5|0)<<3)>>3]=$T79*$T7a-$T7b*$T7c;HEAPF64[$1+(($5*3|0)+($4*5|0)<<3)>>3]=$T7b*$T7a+$T79*$T7c;$T1N=($T1H-$T1M)*.7071067811865476;$T1O=$T1C-$T1N;$T20=$T1C+$T1N;$T1X=($T1V-$T1W)*.7071067811865476;$T1Y=$T1U-$T1X;$T22=$T1U+$T1X;$T1x=+HEAPF64[$3+96>>3];$T1P=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+$4<<3)>>3]=$T1x*$T1O-$T1P*$T1Y;HEAPF64[$1+(($5*7|0)+$4<<3)>>3]=$T1P*$T1O+$T1x*$T1Y;$T1Z=+HEAPF64[$3+32>>3];$T21=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+$4<<3)>>3]=$T1Z*$T20-$T21*$T22;HEAPF64[$1+(($5*3|0)+$4<<3)>>3]=$T21*$T20+$T1Z*$T22;$T4n=($T4h-$T4m)*.7071067811865476;$T4o=$T4c-$T4n;$T4A=$T4c+$T4n;$T4x=($T4v-$T4w)*.7071067811865476;$T4y=$T4u-$T4x;$T4C=$T4u+$T4x;$T47=+HEAPF64[$3+96>>3];$T4p=+HEAPF64[$3+104>>3];HEAPF64[$2+(($5*7|0)+($4*3|0)<<3)>>3]=$T47*$T4o-$T4p*$T4y;HEAPF64[$1+(($5*7|0)+($4*3|0)<<3)>>3]=$T4p*$T4o+$T47*$T4y;$T4z=+HEAPF64[$3+32>>3];$T4B=+HEAPF64[$3+40>>3];HEAPF64[$2+(($5*3|0)+($4*3|0)<<3)>>3]=$T4z*$T4A-$T4B*$T4C;HEAPF64[$1+(($5*3|0)+($4*3|0)<<3)>>3]=$T4B*$T4A+$T4z*$T4C;$T3n=($T34+$T2Z)*.7071067811865476;$T3o=$T3m-$T3n;$T3u=$T3m+$T3n;$T3r=($T3d+$T3e)*.7071067811865476;$T3s=$T3q-$T3r;$T3w=$T3q+$T3r;$T3l=+HEAPF64[$3+64>>3];$T3p=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4<<1)<<3)>>3]=$T3l*$T3o+$T3p*$T3s;HEAPF64[$2+(($5*5|0)+($4<<1)<<3)>>3]=$T3l*$T3s-$T3p*$T3o;$T3t=+HEAPF64[$3>>3];$T3v=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4<<1)<<3)>>3]=$T3t*$T3u+$T3v*$T3w;HEAPF64[$2+($5+($4<<1)<<3)>>3]=$T3t*$T3w-$T3v*$T3u;$T8x=($T8e+$T89)*.7071067811865476;$T8y=$T8w-$T8x;$T8E=$T8w+$T8x;$T8B=($T8n+$T8o)*.7071067811865476;$T8C=$T8A-$T8B;$T8G=$T8A+$T8B;$T8v=+HEAPF64[$3+64>>3];$T8z=+HEAPF64[$3+72>>3];HEAPF64[$1+(($5*5|0)+($4*6|0)<<3)>>3]=$T8v*$T8y+$T8z*$T8C;HEAPF64[$2+(($5*5|0)+($4*6|0)<<3)>>3]=$T8v*$T8C-$T8z*$T8y;$T8D=+HEAPF64[$3>>3];$T8F=+HEAPF64[$3+8>>3];HEAPF64[$1+($5+($4*6|0)<<3)>>3]=$T8D*$T8E+$T8F*$T8G;HEAPF64[$2+($5+($4*6|0)<<3)>>3]=$T8D*$T8G-$T8F*$T8E;label=4;break;case 4:$m=$m+1|0;$1=$1+($8<<3)|0;$2=$2+($8<<3)|0;$3=$3+112|0;label=2;break;case 5:return}}function _t1_10($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T7=0.0,$T1O=0.0,$TT=0.0,$T1C=0.0,$TF=0.0,$TQ=0.0,$TR=0.0,$T1o=0.0,$T1p=0.0,$T1y=0.0,$TX=0.0,$TY=0.0,$TZ=0.0,$T1d=0.0,$T1g=0.0,$T1M=0.0,$Ti=0.0,$Tt=0.0,$Tu=0.0,$T1r=0.0,$T1s=0.0,$T1x=0.0,$TU=0.0,$TV=0.0,$TW=0.0,$T16=0.0,$T19=0.0,$T1L=0.0,$T1=0.0,$T1B=0.0,$T6=0.0,$T1A=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$Tz=0.0,$T1b=0.0,$TP=0.0,$T1f=0.0,$TE=0.0,$T1c=0.0,$TK=0.0,$T1e=0.0,$Tw=0.0,$Ty=0.0,$Tv=0.0,$Tx=0.0,$TM=0.0,$TO=0.0,$TL=0.0,$TN=0.0,$TB=0.0,$TD=0.0,$TA=0.0,$TC=0.0,$TH=0.0,$TJ=0.0,$TG=0.0,$TI=0.0,$Tc=0.0,$T14=0.0,$Ts=0.0,$T18=0.0,$Th=0.0,$T15=0.0,$Tn=0.0,$T17=0.0,$T9=0.0,$Tb=0.0,$T8=0.0,$Ta=0.0,$Tp=0.0,$Tr=0.0,$To=0.0,$Tq=0.0,$Te=0.0,$Tg=0.0,$Td=0.0,$Tf=0.0,$Tk=0.0,$Tm=0.0,$Tj=0.0,$Tl=0.0,$T11=0.0,$TS=0.0,$T12=0.0,$T1i=0.0,$T1k=0.0,$T1a=0.0,$T1h=0.0,$T1j=0.0,$T13=0.0,$T1N=0.0,$T1P=0.0,$T1Q=0.0,$T1U=0.0,$T1W=0.0,$T1S=0.0,$T1T=0.0,$T1V=0.0,$T1R=0.0,$T1m=0.0,$T10=0.0,$T1l=0.0,$T1u=0.0,$T1w=0.0,$T1q=0.0,$T1t=0.0,$T1v=0.0,$T1n=0.0,$T1H=0.0,$T1z=0.0,$T1G=0.0,$T1F=0.0,$T1J=0.0,$T1D=0.0,$T1E=0.0,$T1K=0.0,$T1I=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*18|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T1B=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+(($4*5|0)<<3)>>3];$T5=+HEAPF64[$2+(($4*5|0)<<3)>>3];$T2=+HEAPF64[$3+64>>3];$T4=+HEAPF64[$3+72>>3];$T6=$T2*$T3+$T4*$T5;$T1A=$T2*$T5-$T4*$T3;$T7=$T1-$T6;$T1O=$T1B-$T1A;$TT=$T1+$T6;$T1C=$T1A+$T1B;$Tw=+HEAPF64[$1+($4<<2<<3)>>3];$Ty=+HEAPF64[$2+($4<<2<<3)>>3];$Tv=+HEAPF64[$3+48>>3];$Tx=+HEAPF64[$3+56>>3];$Tz=$Tv*$Tw+$Tx*$Ty;$T1b=$Tv*$Ty-$Tx*$Tw;$TM=+HEAPF64[$1+($4<<3)>>3];$TO=+HEAPF64[$2+($4<<3)>>3];$TL=+HEAPF64[$3>>3];$TN=+HEAPF64[$3+8>>3];$TP=$TL*$TM+$TN*$TO;$T1f=$TL*$TO-$TN*$TM;$TB=+HEAPF64[$1+(($4*9|0)<<3)>>3];$TD=+HEAPF64[$2+(($4*9|0)<<3)>>3];$TA=+HEAPF64[$3+128>>3];$TC=+HEAPF64[$3+136>>3];$TE=$TA*$TB+$TC*$TD;$T1c=$TA*$TD-$TC*$TB;$TH=+HEAPF64[$1+(($4*6|0)<<3)>>3];$TJ=+HEAPF64[$2+(($4*6|0)<<3)>>3];$TG=+HEAPF64[$3+80>>3];$TI=+HEAPF64[$3+88>>3];$TK=$TG*$TH+$TI*$TJ;$T1e=$TG*$TJ-$TI*$TH;$TF=$Tz-$TE;$TQ=$TK-$TP;$TR=$TF+$TQ;$T1o=$T1b+$T1c;$T1p=$T1e+$T1f;$T1y=$T1o+$T1p;$TX=$Tz+$TE;$TY=$TK+$TP;$TZ=$TX+$TY;$T1d=$T1b-$T1c;$T1g=$T1e-$T1f;$T1M=$T1d+$T1g;$T9=+HEAPF64[$1+($4<<1<<3)>>3];$Tb=+HEAPF64[$2+($4<<1<<3)>>3];$T8=+HEAPF64[$3+16>>3];$Ta=+HEAPF64[$3+24>>3];$Tc=$T8*$T9+$Ta*$Tb;$T14=$T8*$Tb-$Ta*$T9;$Tp=+HEAPF64[$1+(($4*3|0)<<3)>>3];$Tr=+HEAPF64[$2+(($4*3|0)<<3)>>3];$To=+HEAPF64[$3+32>>3];$Tq=+HEAPF64[$3+40>>3];$Ts=$To*$Tp+$Tq*$Tr;$T18=$To*$Tr-$Tq*$Tp;$Te=+HEAPF64[$1+(($4*7|0)<<3)>>3];$Tg=+HEAPF64[$2+(($4*7|0)<<3)>>3];$Td=+HEAPF64[$3+96>>3];$Tf=+HEAPF64[$3+104>>3];$Th=$Td*$Te+$Tf*$Tg;$T15=$Td*$Tg-$Tf*$Te;$Tk=+HEAPF64[$1+($4<<3<<3)>>3];$Tm=+HEAPF64[$2+($4<<3<<3)>>3];$Tj=+HEAPF64[$3+112>>3];$Tl=+HEAPF64[$3+120>>3];$Tn=$Tj*$Tk+$Tl*$Tm;$T17=$Tj*$Tm-$Tl*$Tk;$Ti=$Tc-$Th;$Tt=$Tn-$Ts;$Tu=$Ti+$Tt;$T1r=$T14+$T15;$T1s=$T17+$T18;$T1x=$T1r+$T1s;$TU=$Tc+$Th;$TV=$Tn+$Ts;$TW=$TU+$TV;$T16=$T14-$T15;$T19=$T17-$T18;$T1L=$T16+$T19;$T11=($Tu-$TR)*.5590169943749475;$TS=$Tu+$TR;$T12=$T7-.25*$TS;$T1a=$T16-$T19;$T1h=$T1d-$T1g;$T1i=.9510565162951535*$T1a+.5877852522924731*$T1h;$T1k=.9510565162951535*$T1h-.5877852522924731*$T1a;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T7+$TS;$T1j=$T12-$T11;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T1j-$T1k;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T1j+$T1k;$T13=$T11+$T12;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T13-$T1i;HEAPF64[$1+($4<<3)>>3]=$T13+$T1i;$T1N=($T1L-$T1M)*.5590169943749475;$T1P=$T1L+$T1M;$T1Q=$T1O-.25*$T1P;$T1S=$Ti-$Tt;$T1T=$TF-$TQ;$T1U=.9510565162951535*$T1S+.5877852522924731*$T1T;$T1W=.9510565162951535*$T1T-.5877852522924731*$T1S;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T1P+$T1O;$T1V=$T1Q-$T1N;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T1V-$T1W;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T1W+$T1V;$T1R=$T1N+$T1Q;HEAPF64[$2+($4<<3)>>3]=$T1R-$T1U;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T1U+$T1R;$T1m=($TW-$TZ)*.5590169943749475;$T10=$TW+$TZ;$T1l=$TT-.25*$T10;$T1q=$T1o-$T1p;$T1t=$T1r-$T1s;$T1u=.9510565162951535*$T1q-.5877852522924731*$T1t;$T1w=.9510565162951535*$T1t+.5877852522924731*$T1q;HEAPF64[$1>>3]=$TT+$T10;$T1v=$T1m+$T1l;HEAPF64[$1+($4<<2<<3)>>3]=$T1v-$T1w;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T1v+$T1w;$T1n=$T1l-$T1m;HEAPF64[$1+($4<<1<<3)>>3]=$T1n-$T1u;HEAPF64[$1+($4<<3<<3)>>3]=$T1n+$T1u;$T1H=($T1x-$T1y)*.5590169943749475;$T1z=$T1x+$T1y;$T1G=$T1C-.25*$T1z;$T1D=$TX-$TY;$T1E=$TU-$TV;$T1F=.9510565162951535*$T1D-.5877852522924731*$T1E;$T1J=.9510565162951535*$T1E+.5877852522924731*$T1D;HEAPF64[$2>>3]=$T1z+$T1C;$T1K=$T1H+$T1G;HEAPF64[$2+($4<<2<<3)>>3]=$T1J+$T1K;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T1K-$T1J;$T1I=$T1G-$T1H;HEAPF64[$2+($4<<1<<3)>>3]=$T1F+$T1I;HEAPF64[$2+($4<<3<<3)>>3]=$T1I-$T1F;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+144|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_t1_10($p){$p=$p|0;_fftw_kdft_dit_register($p,24,8488);return}function _fftw_codelet_t1_12($p){$p=$p|0;_fftw_kdft_dit_register($p,28,8424);return}function _t1_12($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T1=0.0,$T1W=0.0,$T18=0.0,$T21=0.0,$Tc=0.0,$T15=0.0,$T1V=0.0,$T22=0.0,$TR=0.0,$T1E=0.0,$T1o=0.0,$T1D=0.0,$T12=0.0,$T1l=0.0,$T1F=0.0,$T1G=0.0,$Ti=0.0,$T1S=0.0,$T1d=0.0,$T24=0.0,$Tt=0.0,$T1a=0.0,$T1T=0.0,$T25=0.0,$TA=0.0,$T1z=0.0,$T1j=0.0,$T1y=0.0,$TL=0.0,$T1g=0.0,$T1A=0.0,$T1B=0.0,$T6=0.0,$T16=0.0,$Tb=0.0,$T17=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$T8=0.0,$Ta=0.0,$T7=0.0,$T9=0.0,$T11=0.0,$T1n=0.0,$TW=0.0,$T1m=0.0,$TO=0.0,$TQ=0.0,$TN=0.0,$TP=0.0,$TY=0.0,$T10=0.0,$TX=0.0,$TZ=0.0,$TT=0.0,$TV=0.0,$TS=0.0,$TU=0.0,$Ts=0.0,$T1c=0.0,$Tn=0.0,$T1b=0.0,$Tf=0.0,$Th=0.0,$Te=0.0,$Tg=0.0,$Tp=0.0,$Tr=0.0,$To=0.0,$Tq=0.0,$Tk=0.0,$Tm=0.0,$Tj=0.0,$Tl=0.0,$TK=0.0,$T1i=0.0,$TF=0.0,$T1h=0.0,$Tx=0.0,$Tz=0.0,$Tw=0.0,$Ty=0.0,$TH=0.0,$TJ=0.0,$TG=0.0,$TI=0.0,$TC=0.0,$TE=0.0,$TB=0.0,$TD=0.0,$Tv=0.0,$T1N=0.0,$T1Y=0.0,$T20=0.0,$T14=0.0,$T1Z=0.0,$T1Q=0.0,$T1R=0.0,$Td=0.0,$Tu=0.0,$T1U=0.0,$T1X=0.0,$TM=0.0,$T13=0.0,$T1O=0.0,$T1P=0.0,$T1t=0.0,$T1x=0.0,$T27=0.0,$T2a=0.0,$T1w=0.0,$T28=0.0,$T1I=0.0,$T29=0.0,$T1r=0.0,$T1s=0.0,$T23=0.0,$T26=0.0,$T1u=0.0,$T1v=0.0,$T1C=0.0,$T1H=0.0,$T1f=0.0,$T1J=0.0,$T2d=0.0,$T2f=0.0,$T1q=0.0,$T2g=0.0,$T1M=0.0,$T2e=0.0,$T19=0.0,$T1e=0.0,$T2b=0.0,$T2c=0.0,$T1k=0.0,$T1p=0.0,$T1K=0.0,$T1L=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*22|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T1W=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+($4<<2<<3)>>3];$T5=+HEAPF64[$2+($4<<2<<3)>>3];$T2=+HEAPF64[$3+48>>3];$T4=+HEAPF64[$3+56>>3];$T6=$T2*$T3+$T4*$T5;$T16=$T2*$T5-$T4*$T3;$T8=+HEAPF64[$1+($4<<3<<3)>>3];$Ta=+HEAPF64[$2+($4<<3<<3)>>3];$T7=+HEAPF64[$3+112>>3];$T9=+HEAPF64[$3+120>>3];$Tb=$T7*$T8+$T9*$Ta;$T17=$T7*$Ta-$T9*$T8;$T18=($T16-$T17)*.8660254037844386;$T21=($Tb-$T6)*.8660254037844386;$Tc=$T6+$Tb;$T15=$T1-.5*$Tc;$T1V=$T16+$T17;$T22=$T1W-.5*$T1V;$TO=+HEAPF64[$1+(($4*9|0)<<3)>>3];$TQ=+HEAPF64[$2+(($4*9|0)<<3)>>3];$TN=+HEAPF64[$3+128>>3];$TP=+HEAPF64[$3+136>>3];$TR=$TN*$TO+$TP*$TQ;$T1E=$TN*$TQ-$TP*$TO;$TY=+HEAPF64[$1+(($4*5|0)<<3)>>3];$T10=+HEAPF64[$2+(($4*5|0)<<3)>>3];$TX=+HEAPF64[$3+64>>3];$TZ=+HEAPF64[$3+72>>3];$T11=$TX*$TY+$TZ*$T10;$T1n=$TX*$T10-$TZ*$TY;$TT=+HEAPF64[$1+($4<<3)>>3];$TV=+HEAPF64[$2+($4<<3)>>3];$TS=+HEAPF64[$3>>3];$TU=+HEAPF64[$3+8>>3];$TW=$TS*$TT+$TU*$TV;$T1m=$TS*$TV-$TU*$TT;$T1o=($T1m-$T1n)*.8660254037844386;$T1D=($T11-$TW)*.8660254037844386;$T12=$TW+$T11;$T1l=$TR-.5*$T12;$T1F=$T1m+$T1n;$T1G=$T1E-.5*$T1F;$Tf=+HEAPF64[$1+(($4*6|0)<<3)>>3];$Th=+HEAPF64[$2+(($4*6|0)<<3)>>3];$Te=+HEAPF64[$3+80>>3];$Tg=+HEAPF64[$3+88>>3];$Ti=$Te*$Tf+$Tg*$Th;$T1S=$Te*$Th-$Tg*$Tf;$Tp=+HEAPF64[$1+($4<<1<<3)>>3];$Tr=+HEAPF64[$2+($4<<1<<3)>>3];$To=+HEAPF64[$3+16>>3];$Tq=+HEAPF64[$3+24>>3];$Ts=$To*$Tp+$Tq*$Tr;$T1c=$To*$Tr-$Tq*$Tp;$Tk=+HEAPF64[$1+(($4*10|0)<<3)>>3];$Tm=+HEAPF64[$2+(($4*10|0)<<3)>>3];$Tj=+HEAPF64[$3+144>>3];$Tl=+HEAPF64[$3+152>>3];$Tn=$Tj*$Tk+$Tl*$Tm;$T1b=$Tj*$Tm-$Tl*$Tk;$T1d=($T1b-$T1c)*.8660254037844386;$T24=($Ts-$Tn)*.8660254037844386;$Tt=$Tn+$Ts;$T1a=$Ti-.5*$Tt;$T1T=$T1b+$T1c;$T25=$T1S-.5*$T1T;$Tx=+HEAPF64[$1+(($4*3|0)<<3)>>3];$Tz=+HEAPF64[$2+(($4*3|0)<<3)>>3];$Tw=+HEAPF64[$3+32>>3];$Ty=+HEAPF64[$3+40>>3];$TA=$Tw*$Tx+$Ty*$Tz;$T1z=$Tw*$Tz-$Ty*$Tx;$TH=+HEAPF64[$1+(($4*11|0)<<3)>>3];$TJ=+HEAPF64[$2+(($4*11|0)<<3)>>3];$TG=+HEAPF64[$3+160>>3];$TI=+HEAPF64[$3+168>>3];$TK=$TG*$TH+$TI*$TJ;$T1i=$TG*$TJ-$TI*$TH;$TC=+HEAPF64[$1+(($4*7|0)<<3)>>3];$TE=+HEAPF64[$2+(($4*7|0)<<3)>>3];$TB=+HEAPF64[$3+96>>3];$TD=+HEAPF64[$3+104>>3];$TF=$TB*$TC+$TD*$TE;$T1h=$TB*$TE-$TD*$TC;$T1j=($T1h-$T1i)*.8660254037844386;$T1y=($TK-$TF)*.8660254037844386;$TL=$TF+$TK;$T1g=$TA-.5*$TL;$T1A=$T1h+$T1i;$T1B=$T1z-.5*$T1A;$Td=$T1+$Tc;$Tu=$Ti+$Tt;$Tv=$Td+$Tu;$T1N=$Td-$Tu;$T1U=$T1S+$T1T;$T1X=$T1V+$T1W;$T1Y=$T1U+$T1X;$T20=$T1X-$T1U;$TM=$TA+$TL;$T13=$TR+$T12;$T14=$TM+$T13;$T1Z=$TM-$T13;$T1O=$T1z+$T1A;$T1P=$T1E+$T1F;$T1Q=$T1O-$T1P;$T1R=$T1O+$T1P;HEAPF64[$1+(($4*6|0)<<3)>>3]=$Tv-$T14;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T1Y-$T1R;HEAPF64[$1>>3]=$Tv+$T14;HEAPF64[$2>>3]=$T1R+$T1Y;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T1N-$T1Q;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T1Z+$T20;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T1N+$T1Q;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T20-$T1Z;$T1r=$T15+$T18;$T1s=$T1a+$T1d;$T1t=$T1r+$T1s;$T1x=$T1r-$T1s;$T23=$T21+$T22;$T26=$T24+$T25;$T27=$T23-$T26;$T2a=$T26+$T23;$T1u=$T1g+$T1j;$T1v=$T1l+$T1o;$T1w=$T1u+$T1v;$T28=$T1u-$T1v;$T1C=$T1y+$T1B;$T1H=$T1D+$T1G;$T1I=$T1C-$T1H;$T29=$T1C+$T1H;HEAPF64[$1+(($4*10|0)<<3)>>3]=$T1t-$T1w;HEAPF64[$2+(($4*10|0)<<3)>>3]=$T2a-$T29;HEAPF64[$1+($4<<2<<3)>>3]=$T1t+$T1w;HEAPF64[$2+($4<<2<<3)>>3]=$T29+$T2a;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T1x-$T1I;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T28+$T27;HEAPF64[$1+($4<<3)>>3]=$T1x+$T1I;HEAPF64[$2+($4<<3)>>3]=$T27-$T28;$T19=$T15-$T18;$T1e=$T1a-$T1d;$T1f=$T19+$T1e;$T1J=$T19-$T1e;$T2b=$T25-$T24;$T2c=$T22-$T21;$T2d=$T2b+$T2c;$T2f=$T2c-$T2b;$T1k=$T1g-$T1j;$T1p=$T1l-$T1o;$T1q=$T1k+$T1p;$T2g=$T1k-$T1p;$T1K=$T1B-$T1y;$T1L=$T1G-$T1D;$T1M=$T1K-$T1L;$T2e=$T1K+$T1L;HEAPF64[$1+($4<<1<<3)>>3]=$T1f-$T1q;HEAPF64[$2+($4<<1<<3)>>3]=$T2d-$T2e;HEAPF64[$1+($4<<3<<3)>>3]=$T1f+$T1q;HEAPF64[$2+($4<<3<<3)>>3]=$T2e+$T2d;HEAPF64[$1+(($4*11|0)<<3)>>3]=$T1J-$T1M;HEAPF64[$2+(($4*11|0)<<3)>>3]=$T2g+$T2f;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T1J+$T1M;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T2f-$T2g;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+176|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_t1_15($p){$p=$p|0;_fftw_kdft_dit_register($p,32,8360);return}function _t1_15($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T1q=0.0,$T34=0.0,$Td=0.0,$T1n=0.0,$T2S=0.0,$T35=0.0,$T13=0.0,$T1k=0.0,$T1l=0.0,$T2E=0.0,$T2F=0.0,$T2O=0.0,$T1H=0.0,$T1T=0.0,$T2k=0.0,$T2t=0.0,$T2f=0.0,$T2s=0.0,$T1M=0.0,$T1U=0.0,$Tu=0.0,$TL=0.0,$TM=0.0,$T2H=0.0,$T2I=0.0,$T2N=0.0,$T1w=0.0,$T1Q=0.0,$T29=0.0,$T2w=0.0,$T24=0.0,$T2v=0.0,$T1B=0.0,$T1R=0.0,$T1=0.0,$T2R=0.0,$T6=0.0,$T1o=0.0,$Tb=0.0,$T1p=0.0,$Tc=0.0,$T2Q=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$T8=0.0,$Ta=0.0,$T7=0.0,$T9=0.0,$TR=0.0,$T2c=0.0,$T18=0.0,$T2h=0.0,$TW=0.0,$T1E=0.0,$T11=0.0,$T1F=0.0,$T12=0.0,$T2d=0.0,$T1d=0.0,$T1J=0.0,$T1i=0.0,$T1K=0.0,$T1j=0.0,$T2i=0.0,$TO=0.0,$TQ=0.0,$TN=0.0,$TP=0.0,$T15=0.0,$T17=0.0,$T14=0.0,$T16=0.0,$TT=0.0,$TV=0.0,$TS=0.0,$TU=0.0,$TY=0.0,$T10=0.0,$TX=0.0,$TZ=0.0,$T1a=0.0,$T1c=0.0,$T19=0.0,$T1b=0.0,$T1f=0.0,$T1h=0.0,$T1e=0.0,$T1g=0.0,$T1D=0.0,$T1G=0.0,$T2g=0.0,$T2j=0.0,$T2b=0.0,$T2e=0.0,$T1I=0.0,$T1L=0.0,$Ti=0.0,$T21=0.0,$Tz=0.0,$T26=0.0,$Tn=0.0,$T1t=0.0,$Ts=0.0,$T1u=0.0,$Tt=0.0,$T22=0.0,$TE=0.0,$T1y=0.0,$TJ=0.0,$T1z=0.0,$TK=0.0,$T27=0.0,$Tf=0.0,$Th=0.0,$Te=0.0,$Tg=0.0,$Tw=0.0,$Ty=0.0,$Tv=0.0,$Tx=0.0,$Tk=0.0,$Tm=0.0,$Tj=0.0,$Tl=0.0,$Tp=0.0,$Tr=0.0,$To=0.0,$Tq=0.0,$TB=0.0,$TD=0.0,$TA=0.0,$TC=0.0,$TG=0.0,$TI=0.0,$TF=0.0,$TH=0.0,$T1s=0.0,$T1v=0.0,$T25=0.0,$T28=0.0,$T20=0.0,$T23=0.0,$T1x=0.0,$T1A=0.0,$T2C=0.0,$T1m=0.0,$T2B=0.0,$T2K=0.0,$T2M=0.0,$T2G=0.0,$T2J=0.0,$T2L=0.0,$T2D=0.0,$T2U=0.0,$T2P=0.0,$T2T=0.0,$T2Y=0.0,$T30=0.0,$T2W=0.0,$T2X=0.0,$T2Z=0.0,$T2V=0.0,$T2y=0.0,$T2A=0.0,$T1r=0.0,$T1O=0.0,$T2p=0.0,$T2q=0.0,$T2z=0.0,$T2r=0.0,$T2u=0.0,$T2x=0.0,$T1C=0.0,$T1N=0.0,$T3h=0.0,$T3q=0.0,$T3i=0.0,$T3l=0.0,$T3m=0.0,$T3n=0.0,$T3p=0.0,$T3o=0.0,$T3f=0.0,$T3g=0.0,$T3j=0.0,$T3k=0.0,$T3c=0.0,$T3d=0.0,$T36=0.0,$T37=0.0,$T33=0.0,$T38=0.0,$T3e=0.0,$T39=0.0,$T3a=0.0,$T3b=0.0,$T31=0.0,$T32=0.0,$T2m=0.0,$T2o=0.0,$T1P=0.0,$T1W=0.0,$T1X=0.0,$T1Y=0.0,$T2n=0.0,$T1Z=0.0,$T2a=0.0,$T2l=0.0,$T1S=0.0,$T1V=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*28|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2R=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+(($4*5|0)<<3)>>3];$T5=+HEAPF64[$2+(($4*5|0)<<3)>>3];$T2=+HEAPF64[$3+64>>3];$T4=+HEAPF64[$3+72>>3];$T6=$T2*$T3+$T4*$T5;$T1o=$T2*$T5-$T4*$T3;$T8=+HEAPF64[$1+(($4*10|0)<<3)>>3];$Ta=+HEAPF64[$2+(($4*10|0)<<3)>>3];$T7=+HEAPF64[$3+144>>3];$T9=+HEAPF64[$3+152>>3];$Tb=$T7*$T8+$T9*$Ta;$T1p=$T7*$Ta-$T9*$T8;$T1q=($T1o-$T1p)*.8660254037844386;$T34=($Tb-$T6)*.8660254037844386;$Tc=$T6+$Tb;$Td=$T1+$Tc;$T1n=$T1-.5*$Tc;$T2Q=$T1o+$T1p;$T2S=$T2Q+$T2R;$T35=$T2R-.5*$T2Q;$TO=+HEAPF64[$1+(($4*6|0)<<3)>>3];$TQ=+HEAPF64[$2+(($4*6|0)<<3)>>3];$TN=+HEAPF64[$3+80>>3];$TP=+HEAPF64[$3+88>>3];$TR=$TN*$TO+$TP*$TQ;$T2c=$TN*$TQ-$TP*$TO;$T15=+HEAPF64[$1+(($4*9|0)<<3)>>3];$T17=+HEAPF64[$2+(($4*9|0)<<3)>>3];$T14=+HEAPF64[$3+128>>3];$T16=+HEAPF64[$3+136>>3];$T18=$T14*$T15+$T16*$T17;$T2h=$T14*$T17-$T16*$T15;$TT=+HEAPF64[$1+(($4*11|0)<<3)>>3];$TV=+HEAPF64[$2+(($4*11|0)<<3)>>3];$TS=+HEAPF64[$3+160>>3];$TU=+HEAPF64[$3+168>>3];$TW=$TS*$TT+$TU*$TV;$T1E=$TS*$TV-$TU*$TT;$TY=+HEAPF64[$1+($4<<3)>>3];$T10=+HEAPF64[$2+($4<<3)>>3];$TX=+HEAPF64[$3>>3];$TZ=+HEAPF64[$3+8>>3];$T11=$TX*$TY+$TZ*$T10;$T1F=$TX*$T10-$TZ*$TY;$T12=$TW+$T11;$T2d=$T1E+$T1F;$T1a=+HEAPF64[$1+(($4*14|0)<<3)>>3];$T1c=+HEAPF64[$2+(($4*14|0)<<3)>>3];$T19=+HEAPF64[$3+208>>3];$T1b=+HEAPF64[$3+216>>3];$T1d=$T19*$T1a+$T1b*$T1c;$T1J=$T19*$T1c-$T1b*$T1a;$T1f=+HEAPF64[$1+($4<<2<<3)>>3];$T1h=+HEAPF64[$2+($4<<2<<3)>>3];$T1e=+HEAPF64[$3+48>>3];$T1g=+HEAPF64[$3+56>>3];$T1i=$T1e*$T1f+$T1g*$T1h;$T1K=$T1e*$T1h-$T1g*$T1f;$T1j=$T1d+$T1i;$T2i=$T1J+$T1K;$T13=$TR+$T12;$T1k=$T18+$T1j;$T1l=$T13+$T1k;$T2E=$T2c+$T2d;$T2F=$T2h+$T2i;$T2O=$T2E+$T2F;$T1D=$TR-.5*$T12;$T1G=($T1E-$T1F)*.8660254037844386;$T1H=$T1D-$T1G;$T1T=$T1D+$T1G;$T2g=($T1i-$T1d)*.8660254037844386;$T2j=$T2h-.5*$T2i;$T2k=$T2g+$T2j;$T2t=$T2j-$T2g;$T2b=($T11-$TW)*.8660254037844386;$T2e=$T2c-.5*$T2d;$T2f=$T2b+$T2e;$T2s=$T2e-$T2b;$T1I=$T18-.5*$T1j;$T1L=($T1J-$T1K)*.8660254037844386;$T1M=$T1I-$T1L;$T1U=$T1I+$T1L;$Tf=+HEAPF64[$1+(($4*3|0)<<3)>>3];$Th=+HEAPF64[$2+(($4*3|0)<<3)>>3];$Te=+HEAPF64[$3+32>>3];$Tg=+HEAPF64[$3+40>>3];$Ti=$Te*$Tf+$Tg*$Th;$T21=$Te*$Th-$Tg*$Tf;$Tw=+HEAPF64[$1+(($4*12|0)<<3)>>3];$Ty=+HEAPF64[$2+(($4*12|0)<<3)>>3];$Tv=+HEAPF64[$3+176>>3];$Tx=+HEAPF64[$3+184>>3];$Tz=$Tv*$Tw+$Tx*$Ty;$T26=$Tv*$Ty-$Tx*$Tw;$Tk=+HEAPF64[$1+($4<<3<<3)>>3];$Tm=+HEAPF64[$2+($4<<3<<3)>>3];$Tj=+HEAPF64[$3+112>>3];$Tl=+HEAPF64[$3+120>>3];$Tn=$Tj*$Tk+$Tl*$Tm;$T1t=$Tj*$Tm-$Tl*$Tk;$Tp=+HEAPF64[$1+(($4*13|0)<<3)>>3];$Tr=+HEAPF64[$2+(($4*13|0)<<3)>>3];$To=+HEAPF64[$3+192>>3];$Tq=+HEAPF64[$3+200>>3];$Ts=$To*$Tp+$Tq*$Tr;$T1u=$To*$Tr-$Tq*$Tp;$Tt=$Tn+$Ts;$T22=$T1t+$T1u;$TB=+HEAPF64[$1+($4<<1<<3)>>3];$TD=+HEAPF64[$2+($4<<1<<3)>>3];$TA=+HEAPF64[$3+16>>3];$TC=+HEAPF64[$3+24>>3];$TE=$TA*$TB+$TC*$TD;$T1y=$TA*$TD-$TC*$TB;$TG=+HEAPF64[$1+(($4*7|0)<<3)>>3];$TI=+HEAPF64[$2+(($4*7|0)<<3)>>3];$TF=+HEAPF64[$3+96>>3];$TH=+HEAPF64[$3+104>>3];$TJ=$TF*$TG+$TH*$TI;$T1z=$TF*$TI-$TH*$TG;$TK=$TE+$TJ;$T27=$T1y+$T1z;$Tu=$Ti+$Tt;$TL=$Tz+$TK;$TM=$Tu+$TL;$T2H=$T21+$T22;$T2I=$T26+$T27;$T2N=$T2H+$T2I;$T1s=$Ti-.5*$Tt;$T1v=($T1t-$T1u)*.8660254037844386;$T1w=$T1s-$T1v;$T1Q=$T1s+$T1v;$T25=($TJ-$TE)*.8660254037844386;$T28=$T26-.5*$T27;$T29=$T25+$T28;$T2w=$T28-$T25;$T20=($Ts-$Tn)*.8660254037844386;$T23=$T21-.5*$T22;$T24=$T20+$T23;$T2v=$T23-$T20;$T1x=$Tz-.5*$TK;$T1A=($T1y-$T1z)*.8660254037844386;$T1B=$T1x-$T1A;$T1R=$T1x+$T1A;$T2C=($TM-$T1l)*.5590169943749475;$T1m=$TM+$T1l;$T2B=$Td-.25*$T1m;$T2G=$T2E-$T2F;$T2J=$T2H-$T2I;$T2K=.9510565162951535*$T2G-.5877852522924731*$T2J;$T2M=.9510565162951535*$T2J+.5877852522924731*$T2G;HEAPF64[$1>>3]=$Td+$T1m;$T2L=$T2C+$T2B;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T2L-$T2M;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T2L+$T2M;$T2D=$T2B-$T2C;HEAPF64[$1+(($4*12|0)<<3)>>3]=$T2D-$T2K;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T2D+$T2K;$T2U=($T2N-$T2O)*.5590169943749475;$T2P=$T2N+$T2O;$T2T=$T2S-.25*$T2P;$T2W=$T13-$T1k;$T2X=$Tu-$TL;$T2Y=.9510565162951535*$T2W-.5877852522924731*$T2X;$T30=.9510565162951535*$T2X+.5877852522924731*$T2W;HEAPF64[$2>>3]=$T2P+$T2S;$T2Z=$T2U+$T2T;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T2Z-$T30;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T30+$T2Z;$T2V=$T2T-$T2U;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T2V-$T2Y;HEAPF64[$2+(($4*12|0)<<3)>>3]=$T2Y+$T2V;$T2u=$T2s-$T2t;$T2x=$T2v-$T2w;$T2y=.9510565162951535*$T2u-.5877852522924731*$T2x;$T2A=.9510565162951535*$T2x+.5877852522924731*$T2u;$T1r=$T1n-$T1q;$T1C=$T1w+$T1B;$T1N=$T1H+$T1M;$T1O=$T1C+$T1N;$T2p=$T1r-.25*$T1O;$T2q=($T1C-$T1N)*.5590169943749475;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T1r+$T1O;$T2z=$T2q+$T2p;HEAPF64[$1+(($4*14|0)<<3)>>3]=$T2z-$T2A;HEAPF64[$1+(($4*11|0)<<3)>>3]=$T2z+$T2A;$T2r=$T2p-$T2q;HEAPF64[$1+($4<<1<<3)>>3]=$T2r-$T2y;HEAPF64[$1+($4<<3<<3)>>3]=$T2r+$T2y;$T3f=$T1H-$T1M;$T3g=$T1w-$T1B;$T3h=.9510565162951535*$T3f-.5877852522924731*$T3g;$T3q=.9510565162951535*$T3g+.5877852522924731*$T3f;$T3i=$T35-$T34;$T3j=$T2v+$T2w;$T3k=$T2s+$T2t;$T3l=$T3j+$T3k;$T3m=$T3i-.25*$T3l;$T3n=($T3j-$T3k)*.5590169943749475;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T3l+$T3i;$T3p=$T3n+$T3m;HEAPF64[$2+(($4*11|0)<<3)>>3]=$T3p-$T3q;HEAPF64[$2+(($4*14|0)<<3)>>3]=$T3q+$T3p;$T3o=$T3m-$T3n;HEAPF64[$2+($4<<1<<3)>>3]=$T3h+$T3o;HEAPF64[$2+($4<<3<<3)>>3]=$T3o-$T3h;$T3a=$T1Q-$T1R;$T3b=$T1T-$T1U;$T3c=.9510565162951535*$T3a+.5877852522924731*$T3b;$T3d=.9510565162951535*$T3b-.5877852522924731*$T3a;$T36=$T34+$T35;$T31=$T24+$T29;$T32=$T2f+$T2k;$T37=$T31+$T32;$T33=($T31-$T32)*.5590169943749475;$T38=$T36-.25*$T37;HEAPF64[$2+(($4*10|0)<<3)>>3]=$T37+$T36;$T3e=$T38-$T33;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T3d+$T3e;HEAPF64[$2+(($4*13|0)<<3)>>3]=$T3e-$T3d;$T39=$T33+$T38;HEAPF64[$2+($4<<3)>>3]=$T39-$T3c;HEAPF64[$2+($4<<2<<3)>>3]=$T3c+$T39;$T2a=$T24-$T29;$T2l=$T2f-$T2k;$T2m=.9510565162951535*$T2a+.5877852522924731*$T2l;$T2o=.9510565162951535*$T2l-.5877852522924731*$T2a;$T1P=$T1n+$T1q;$T1S=$T1Q+$T1R;$T1V=$T1T+$T1U;$T1W=$T1S+$T1V;$T1X=($T1S-$T1V)*.5590169943749475;$T1Y=$T1P-.25*$T1W;HEAPF64[$1+(($4*10|0)<<3)>>3]=$T1P+$T1W;$T2n=$T1Y-$T1X;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T2n-$T2o;HEAPF64[$1+(($4*13|0)<<3)>>3]=$T2n+$T2o;$T1Z=$T1X+$T1Y;HEAPF64[$1+($4<<2<<3)>>3]=$T1Z-$T2m;HEAPF64[$1+($4<<3)>>3]=$T1Z+$T2m;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+224|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_t1_16($p){$p=$p|0;_fftw_kdft_dit_register($p,1264,8296);return}function _t1_16($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T7=0.0,$T37=0.0,$T1t=0.0,$T2U=0.0,$Ti=0.0,$T38=0.0,$T1w=0.0,$T2R=0.0,$Tu=0.0,$T2s=0.0,$T1C=0.0,$T2c=0.0,$TF=0.0,$T2t=0.0,$T1H=0.0,$T2d=0.0,$T1f=0.0,$T1q=0.0,$T2B=0.0,$T2C=0.0,$T2D=0.0,$T2E=0.0,$T1Z=0.0,$T2j=0.0,$T24=0.0,$T2k=0.0,$TS=0.0,$T13=0.0,$T2w=0.0,$T2x=0.0,$T2y=0.0,$T2z=0.0,$T1O=0.0,$T2g=0.0,$T1T=0.0,$T2h=0.0,$T1=0.0,$T2T=0.0,$T6=0.0,$T2S=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$Tc=0.0,$T1u=0.0,$Th=0.0,$T1v=0.0,$T9=0.0,$Tb=0.0,$T8=0.0,$Ta=0.0,$Te=0.0,$Tg=0.0,$Td=0.0,$Tf=0.0,$To=0.0,$T1y=0.0,$Tt=0.0,$T1z=0.0,$T1A=0.0,$T1B=0.0,$Tl=0.0,$Tn=0.0,$Tk=0.0,$Tm=0.0,$Tq=0.0,$Ts=0.0,$Tp=0.0,$Tr=0.0,$Tz=0.0,$T1E=0.0,$TE=0.0,$T1F=0.0,$T1D=0.0,$T1G=0.0,$Tw=0.0,$Ty=0.0,$Tv=0.0,$Tx=0.0,$TB=0.0,$TD=0.0,$TA=0.0,$TC=0.0,$T19=0.0,$T20=0.0,$T1p=0.0,$T1X=0.0,$T1e=0.0,$T21=0.0,$T1k=0.0,$T1W=0.0,$T16=0.0,$T18=0.0,$T15=0.0,$T17=0.0,$T1m=0.0,$T1o=0.0,$T1l=0.0,$T1n=0.0,$T1b=0.0,$T1d=0.0,$T1a=0.0,$T1c=0.0,$T1h=0.0,$T1j=0.0,$T1g=0.0,$T1i=0.0,$T1V=0.0,$T1Y=0.0,$T22=0.0,$T23=0.0,$TM=0.0,$T1K=0.0,$T12=0.0,$T1R=0.0,$TR=0.0,$T1L=0.0,$TX=0.0,$T1Q=0.0,$TJ=0.0,$TL=0.0,$TI=0.0,$TK=0.0,$TZ=0.0,$T11=0.0,$TY=0.0,$T10=0.0,$TO=0.0,$TQ=0.0,$TN=0.0,$TP=0.0,$TU=0.0,$TW=0.0,$TT=0.0,$TV=0.0,$T1M=0.0,$T1N=0.0,$T1P=0.0,$T1S=0.0,$T1J=0.0,$T27=0.0,$T3g=0.0,$T3i=0.0,$T26=0.0,$T3h=0.0,$T2a=0.0,$T3d=0.0,$T1x=0.0,$T1I=0.0,$T3e=0.0,$T3f=0.0,$T1U=0.0,$T25=0.0,$T28=0.0,$T29=0.0,$T2v=0.0,$T2H=0.0,$T32=0.0,$T34=0.0,$T2G=0.0,$T33=0.0,$T2K=0.0,$T2Z=0.0,$T2r=0.0,$T2u=0.0,$T30=0.0,$T31=0.0,$T2A=0.0,$T2F=0.0,$T2I=0.0,$T2J=0.0,$T2f=0.0,$T2n=0.0,$T3a=0.0,$T3c=0.0,$T2m=0.0,$T3b=0.0,$T2q=0.0,$T35=0.0,$T2b=0.0,$T2e=0.0,$T36=0.0,$T39=0.0,$T2i=0.0,$T2l=0.0,$T2o=0.0,$T2p=0.0,$TH=0.0,$T2L=0.0,$T2W=0.0,$T2Y=0.0,$T1s=0.0,$T2X=0.0,$T2O=0.0,$T2P=0.0,$Tj=0.0,$TG=0.0,$T2Q=0.0,$T2V=0.0,$T14=0.0,$T1r=0.0,$T2M=0.0,$T2N=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*30|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T2T=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+($4<<3<<3)>>3];$T5=+HEAPF64[$2+($4<<3<<3)>>3];$T2=+HEAPF64[$3+112>>3];$T4=+HEAPF64[$3+120>>3];$T6=$T2*$T3+$T4*$T5;$T2S=$T2*$T5-$T4*$T3;$T7=$T1+$T6;$T37=$T2T-$T2S;$T1t=$T1-$T6;$T2U=$T2S+$T2T;$T9=+HEAPF64[$1+($4<<2<<3)>>3];$Tb=+HEAPF64[$2+($4<<2<<3)>>3];$T8=+HEAPF64[$3+48>>3];$Ta=+HEAPF64[$3+56>>3];$Tc=$T8*$T9+$Ta*$Tb;$T1u=$T8*$Tb-$Ta*$T9;$Te=+HEAPF64[$1+(($4*12|0)<<3)>>3];$Tg=+HEAPF64[$2+(($4*12|0)<<3)>>3];$Td=+HEAPF64[$3+176>>3];$Tf=+HEAPF64[$3+184>>3];$Th=$Td*$Te+$Tf*$Tg;$T1v=$Td*$Tg-$Tf*$Te;$Ti=$Tc+$Th;$T38=$Tc-$Th;$T1w=$T1u-$T1v;$T2R=$T1u+$T1v;$Tl=+HEAPF64[$1+($4<<1<<3)>>3];$Tn=+HEAPF64[$2+($4<<1<<3)>>3];$Tk=+HEAPF64[$3+16>>3];$Tm=+HEAPF64[$3+24>>3];$To=$Tk*$Tl+$Tm*$Tn;$T1y=$Tk*$Tn-$Tm*$Tl;$Tq=+HEAPF64[$1+(($4*10|0)<<3)>>3];$Ts=+HEAPF64[$2+(($4*10|0)<<3)>>3];$Tp=+HEAPF64[$3+144>>3];$Tr=+HEAPF64[$3+152>>3];$Tt=$Tp*$Tq+$Tr*$Ts;$T1z=$Tp*$Ts-$Tr*$Tq;$Tu=$To+$Tt;$T2s=$T1y+$T1z;$T1A=$T1y-$T1z;$T1B=$To-$Tt;$T1C=$T1A-$T1B;$T2c=$T1B+$T1A;$Tw=+HEAPF64[$1+(($4*14|0)<<3)>>3];$Ty=+HEAPF64[$2+(($4*14|0)<<3)>>3];$Tv=+HEAPF64[$3+208>>3];$Tx=+HEAPF64[$3+216>>3];$Tz=$Tv*$Tw+$Tx*$Ty;$T1E=$Tv*$Ty-$Tx*$Tw;$TB=+HEAPF64[$1+(($4*6|0)<<3)>>3];$TD=+HEAPF64[$2+(($4*6|0)<<3)>>3];$TA=+HEAPF64[$3+80>>3];$TC=+HEAPF64[$3+88>>3];$TE=$TA*$TB+$TC*$TD;$T1F=$TA*$TD-$TC*$TB;$TF=$Tz+$TE;$T2t=$T1E+$T1F;$T1D=$Tz-$TE;$T1G=$T1E-$T1F;$T1H=$T1D+$T1G;$T2d=$T1D-$T1G;$T16=+HEAPF64[$1+(($4*15|0)<<3)>>3];$T18=+HEAPF64[$2+(($4*15|0)<<3)>>3];$T15=+HEAPF64[$3+224>>3];$T17=+HEAPF64[$3+232>>3];$T19=$T15*$T16+$T17*$T18;$T20=$T15*$T18-$T17*$T16;$T1m=+HEAPF64[$1+(($4*11|0)<<3)>>3];$T1o=+HEAPF64[$2+(($4*11|0)<<3)>>3];$T1l=+HEAPF64[$3+160>>3];$T1n=+HEAPF64[$3+168>>3];$T1p=$T1l*$T1m+$T1n*$T1o;$T1X=$T1l*$T1o-$T1n*$T1m;$T1b=+HEAPF64[$1+(($4*7|0)<<3)>>3];$T1d=+HEAPF64[$2+(($4*7|0)<<3)>>3];$T1a=+HEAPF64[$3+96>>3];$T1c=+HEAPF64[$3+104>>3];$T1e=$T1a*$T1b+$T1c*$T1d;$T21=$T1a*$T1d-$T1c*$T1b;$T1h=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T1j=+HEAPF64[$2+(($4*3|0)<<3)>>3];$T1g=+HEAPF64[$3+32>>3];$T1i=+HEAPF64[$3+40>>3];$T1k=$T1g*$T1h+$T1i*$T1j;$T1W=$T1g*$T1j-$T1i*$T1h;$T1f=$T19+$T1e;$T1q=$T1k+$T1p;$T2B=$T1f-$T1q;$T2C=$T20+$T21;$T2D=$T1W+$T1X;$T2E=$T2C-$T2D;$T1V=$T19-$T1e;$T1Y=$T1W-$T1X;$T1Z=$T1V-$T1Y;$T2j=$T1V+$T1Y;$T22=$T20-$T21;$T23=$T1k-$T1p;$T24=$T22+$T23;$T2k=$T22-$T23;$TJ=+HEAPF64[$1+($4<<3)>>3];$TL=+HEAPF64[$2+($4<<3)>>3];$TI=+HEAPF64[$3>>3];$TK=+HEAPF64[$3+8>>3];$TM=$TI*$TJ+$TK*$TL;$T1K=$TI*$TL-$TK*$TJ;$TZ=+HEAPF64[$1+(($4*13|0)<<3)>>3];$T11=+HEAPF64[$2+(($4*13|0)<<3)>>3];$TY=+HEAPF64[$3+192>>3];$T10=+HEAPF64[$3+200>>3];$T12=$TY*$TZ+$T10*$T11;$T1R=$TY*$T11-$T10*$TZ;$TO=+HEAPF64[$1+(($4*9|0)<<3)>>3];$TQ=+HEAPF64[$2+(($4*9|0)<<3)>>3];$TN=+HEAPF64[$3+128>>3];$TP=+HEAPF64[$3+136>>3];$TR=$TN*$TO+$TP*$TQ;$T1L=$TN*$TQ-$TP*$TO;$TU=+HEAPF64[$1+(($4*5|0)<<3)>>3];$TW=+HEAPF64[$2+(($4*5|0)<<3)>>3];$TT=+HEAPF64[$3+64>>3];$TV=+HEAPF64[$3+72>>3];$TX=$TT*$TU+$TV*$TW;$T1Q=$TT*$TW-$TV*$TU;$TS=$TM+$TR;$T13=$TX+$T12;$T2w=$TS-$T13;$T2x=$T1K+$T1L;$T2y=$T1Q+$T1R;$T2z=$T2x-$T2y;$T1M=$T1K-$T1L;$T1N=$TX-$T12;$T1O=$T1M+$T1N;$T2g=$T1M-$T1N;$T1P=$TM-$TR;$T1S=$T1Q-$T1R;$T1T=$T1P-$T1S;$T2h=$T1P+$T1S;$T1x=$T1t-$T1w;$T1I=($T1C-$T1H)*.7071067811865476;$T1J=$T1x+$T1I;$T27=$T1x-$T1I;$T3e=($T2d-$T2c)*.7071067811865476;$T3f=$T38+$T37;$T3g=$T3e+$T3f;$T3i=$T3f-$T3e;$T1U=.9238795325112867*$T1O+.3826834323650898*$T1T;$T25=.3826834323650898*$T1Z-.9238795325112867*$T24;$T26=$T1U+$T25;$T3h=$T25-$T1U;$T28=.3826834323650898*$T1O-.9238795325112867*$T1T;$T29=.3826834323650898*$T24+.9238795325112867*$T1Z;$T2a=$T28-$T29;$T3d=$T28+$T29;HEAPF64[$1+(($4*11|0)<<3)>>3]=$T1J-$T26;HEAPF64[$2+(($4*11|0)<<3)>>3]=$T3g-$T3d;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T1J+$T26;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T3d+$T3g;HEAPF64[$1+(($4*15|0)<<3)>>3]=$T27-$T2a;HEAPF64[$2+(($4*15|0)<<3)>>3]=$T3i-$T3h;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T27+$T2a;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T3h+$T3i;$T2r=$T7-$Ti;$T2u=$T2s-$T2t;$T2v=$T2r+$T2u;$T2H=$T2r-$T2u;$T30=$TF-$Tu;$T31=$T2U-$T2R;$T32=$T30+$T31;$T34=$T31-$T30;$T2A=$T2w+$T2z;$T2F=$T2B-$T2E;$T2G=($T2A+$T2F)*.7071067811865476;$T33=($T2F-$T2A)*.7071067811865476;$T2I=$T2z-$T2w;$T2J=$T2B+$T2E;$T2K=($T2I-$T2J)*.7071067811865476;$T2Z=($T2I+$T2J)*.7071067811865476;HEAPF64[$1+(($4*10|0)<<3)>>3]=$T2v-$T2G;HEAPF64[$2+(($4*10|0)<<3)>>3]=$T32-$T2Z;HEAPF64[$1+($4<<1<<3)>>3]=$T2v+$T2G;HEAPF64[$2+($4<<1<<3)>>3]=$T2Z+$T32;HEAPF64[$1+(($4*14|0)<<3)>>3]=$T2H-$T2K;HEAPF64[$2+(($4*14|0)<<3)>>3]=$T34-$T33;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T2H+$T2K;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T33+$T34;$T2b=$T1t+$T1w;$T2e=($T2c+$T2d)*.7071067811865476;$T2f=$T2b+$T2e;$T2n=$T2b-$T2e;$T36=($T1C+$T1H)*.7071067811865476;$T39=$T37-$T38;$T3a=$T36+$T39;$T3c=$T39-$T36;$T2i=.3826834323650898*$T2g+.9238795325112867*$T2h;$T2l=.9238795325112867*$T2j-.3826834323650898*$T2k;$T2m=$T2i+$T2l;$T3b=$T2l-$T2i;$T2o=.9238795325112867*$T2g-.3826834323650898*$T2h;$T2p=.9238795325112867*$T2k+.3826834323650898*$T2j;$T2q=$T2o-$T2p;$T35=$T2o+$T2p;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T2f-$T2m;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T3a-$T35;HEAPF64[$1+($4<<3)>>3]=$T2f+$T2m;HEAPF64[$2+($4<<3)>>3]=$T35+$T3a;HEAPF64[$1+(($4*13|0)<<3)>>3]=$T2n-$T2q;HEAPF64[$2+(($4*13|0)<<3)>>3]=$T3c-$T3b;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T2n+$T2q;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T3b+$T3c;$Tj=$T7+$Ti;$TG=$Tu+$TF;$TH=$Tj+$TG;$T2L=$Tj-$TG;$T2Q=$T2s+$T2t;$T2V=$T2R+$T2U;$T2W=$T2Q+$T2V;$T2Y=$T2V-$T2Q;$T14=$TS+$T13;$T1r=$T1f+$T1q;$T1s=$T14+$T1r;$T2X=$T1r-$T14;$T2M=$T2x+$T2y;$T2N=$T2C+$T2D;$T2O=$T2M-$T2N;$T2P=$T2M+$T2N;HEAPF64[$1+($4<<3<<3)>>3]=$TH-$T1s;HEAPF64[$2+($4<<3<<3)>>3]=$T2W-$T2P;HEAPF64[$1>>3]=$TH+$T1s;HEAPF64[$2>>3]=$T2P+$T2W;HEAPF64[$1+(($4*12|0)<<3)>>3]=$T2L-$T2O;HEAPF64[$2+(($4*12|0)<<3)>>3]=$T2Y-$T2X;HEAPF64[$1+($4<<2<<3)>>3]=$T2L+$T2O;HEAPF64[$2+($4<<2<<3)>>3]=$T2X+$T2Y;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+240|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _t1_2($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T1=0.0,$T8=0.0,$T6=0.0,$T7=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+($5<<1<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T8=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+($4<<3)>>3];$T5=+HEAPF64[$2+($4<<3)>>3];$T2=+HEAPF64[$3>>3];$T4=+HEAPF64[$3+8>>3];$T6=$T2*$T3+$T4*$T5;$T7=$T2*$T5-$T4*$T3;HEAPF64[$1+($4<<3)>>3]=$T1-$T6;HEAPF64[$2+($4<<3)>>3]=$T8-$T7;HEAPF64[$1>>3]=$T1+$T6;HEAPF64[$2>>3]=$T7+$T8;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+16|0;label=2;break;case 5:return}}function _fftw_codelet_t1_2($p){$p=$p|0;_fftw_kdft_dit_register($p,1042,8232);return}function _fftw_codelet_t1_20($p){$p=$p|0;_fftw_kdft_dit_register($p,1204,8168);return}function _t1_20($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$Tj=0.0,$T1R=0.0,$T4g=0.0,$T4p=0.0,$T2q=0.0,$T37=0.0,$T3Q=0.0,$T42=0.0,$T1r=0.0,$T1O=0.0,$T1P=0.0,$T3i=0.0,$T3l=0.0,$T44=0.0,$T3D=0.0,$T3E=0.0,$T3K=0.0,$T1V=0.0,$T1W=0.0,$T1X=0.0,$T23=0.0,$T28=0.0,$T4r=0.0,$T2W=0.0,$T2X=0.0,$T4c=0.0,$T33=0.0,$T34=0.0,$T35=0.0,$T2G=0.0,$T2L=0.0,$T2M=0.0,$TG=0.0,$T13=0.0,$T14=0.0,$T3p=0.0,$T3s=0.0,$T43=0.0,$T3A=0.0,$T3B=0.0,$T3J=0.0,$T1S=0.0,$T1T=0.0,$T1U=0.0,$T2e=0.0,$T2j=0.0,$T4q=0.0,$T2T=0.0,$T2U=0.0,$T4b=0.0,$T30=0.0,$T31=0.0,$T32=0.0,$T2v=0.0,$T2A=0.0,$T2B=0.0,$T1=0.0,$T3O=0.0,$T6=0.0,$T3N=0.0,$Tc=0.0,$T2n=0.0,$Th=0.0,$T2o=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$T9=0.0,$Tb=0.0,$T8=0.0,$Ta=0.0,$Te=0.0,$Tg=0.0,$Td=0.0,$Tf=0.0,$T7=0.0,$Ti=0.0,$T4e=0.0,$T4f=0.0,$T2m=0.0,$T2p=0.0,$T3M=0.0,$T3P=0.0,$T1f=0.0,$T3g=0.0,$T21=0.0,$T2C=0.0,$T1N=0.0,$T3k=0.0,$T27=0.0,$T2K=0.0,$T1q=0.0,$T3h=0.0,$T22=0.0,$T2F=0.0,$T1C=0.0,$T3j=0.0,$T26=0.0,$T2H=0.0,$T19=0.0,$T1Z=0.0,$T1e=0.0,$T20=0.0,$T16=0.0,$T18=0.0,$T15=0.0,$T17=0.0,$T1b=0.0,$T1d=0.0,$T1a=0.0,$T1c=0.0,$T1H=0.0,$T2I=0.0,$T1M=0.0,$T2J=0.0,$T1E=0.0,$T1G=0.0,$T1D=0.0,$T1F=0.0,$T1J=0.0,$T1L=0.0,$T1I=0.0,$T1K=0.0,$T1k=0.0,$T2D=0.0,$T1p=0.0,$T2E=0.0,$T1h=0.0,$T1j=0.0,$T1g=0.0,$T1i=0.0,$T1m=0.0,$T1o=0.0,$T1l=0.0,$T1n=0.0,$T1w=0.0,$T24=0.0,$T1B=0.0,$T25=0.0,$T1t=0.0,$T1v=0.0,$T1s=0.0,$T1u=0.0,$T1y=0.0,$T1A=0.0,$T1x=0.0,$T1z=0.0,$Tu=0.0,$T3n=0.0,$T2c=0.0,$T2r=0.0,$T12=0.0,$T3r=0.0,$T2i=0.0,$T2z=0.0,$TF=0.0,$T3o=0.0,$T2d=0.0,$T2u=0.0,$TR=0.0,$T3q=0.0,$T2h=0.0,$T2w=0.0,$To=0.0,$T2a=0.0,$Tt=0.0,$T2b=0.0,$Tl=0.0,$Tn=0.0,$Tk=0.0,$Tm=0.0,$Tq=0.0,$Ts=0.0,$Tp=0.0,$Tr=0.0,$TW=0.0,$T2x=0.0,$T11=0.0,$T2y=0.0,$TT=0.0,$TV=0.0,$TS=0.0,$TU=0.0,$TY=0.0,$T10=0.0,$TX=0.0,$TZ=0.0,$Tz=0.0,$T2s=0.0,$TE=0.0,$T2t=0.0,$Tw=0.0,$Ty=0.0,$Tv=0.0,$Tx=0.0,$TB=0.0,$TD=0.0,$TA=0.0,$TC=0.0,$TL=0.0,$T2f=0.0,$TQ=0.0,$T2g=0.0,$TI=0.0,$TK=0.0,$TH=0.0,$TJ=0.0,$TN=0.0,$TP=0.0,$TM=0.0,$TO=0.0,$T3e=0.0,$T1Q=0.0,$T3d=0.0,$T3u=0.0,$T3w=0.0,$T3m=0.0,$T3t=0.0,$T3v=0.0,$T3f=0.0,$T47=0.0,$T45=0.0,$T46=0.0,$T41=0.0,$T4a=0.0,$T3Z=0.0,$T40=0.0,$T49=0.0,$T48=0.0,$T3x=0.0,$T1Y=0.0,$T3y=0.0,$T3G=0.0,$T3I=0.0,$T3C=0.0,$T3F=0.0,$T3H=0.0,$T3z=0.0,$T3U=0.0,$T3L=0.0,$T3V=0.0,$T3T=0.0,$T3Y=0.0,$T3R=0.0,$T3S=0.0,$T3X=0.0,$T3W=0.0,$T2P=0.0,$T2N=0.0,$T2O=0.0,$T2l=0.0,$T2R=0.0,$T29=0.0,$T2k=0.0,$T2S=0.0,$T2Q=0.0,$T4u=0.0,$T4s=0.0,$T4t=0.0,$T4y=0.0,$T4A=0.0,$T4w=0.0,$T4x=0.0,$T4z=0.0,$T4v=0.0,$T36=0.0,$T38=0.0,$T39=0.0,$T2Z=0.0,$T3b=0.0,$T2V=0.0,$T2Y=0.0,$T3c=0.0,$T3a=0.0,$T4d=0.0,$T4h=0.0,$T4i=0.0,$T4m=0.0,$T4o=0.0,$T4k=0.0,$T4l=0.0,$T4n=0.0,$T4j=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*38|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T3O=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+(($4*10|0)<<3)>>3];$T5=+HEAPF64[$2+(($4*10|0)<<3)>>3];$T2=+HEAPF64[$3+144>>3];$T4=+HEAPF64[$3+152>>3];$T6=$T2*$T3+$T4*$T5;$T3N=$T2*$T5-$T4*$T3;$T9=+HEAPF64[$1+(($4*5|0)<<3)>>3];$Tb=+HEAPF64[$2+(($4*5|0)<<3)>>3];$T8=+HEAPF64[$3+64>>3];$Ta=+HEAPF64[$3+72>>3];$Tc=$T8*$T9+$Ta*$Tb;$T2n=$T8*$Tb-$Ta*$T9;$Te=+HEAPF64[$1+(($4*15|0)<<3)>>3];$Tg=+HEAPF64[$2+(($4*15|0)<<3)>>3];$Td=+HEAPF64[$3+224>>3];$Tf=+HEAPF64[$3+232>>3];$Th=$Td*$Te+$Tf*$Tg;$T2o=$Td*$Tg-$Tf*$Te;$T7=$T1+$T6;$Ti=$Tc+$Th;$Tj=$T7-$Ti;$T1R=$T7+$Ti;$T4e=$T3O-$T3N;$T4f=$Tc-$Th;$T4g=$T4e-$T4f;$T4p=$T4f+$T4e;$T2m=$T1-$T6;$T2p=$T2n-$T2o;$T2q=$T2m-$T2p;$T37=$T2m+$T2p;$T3M=$T2n+$T2o;$T3P=$T3N+$T3O;$T3Q=$T3M+$T3P;$T42=$T3P-$T3M;$T16=+HEAPF64[$1+($4<<3<<3)>>3];$T18=+HEAPF64[$2+($4<<3<<3)>>3];$T15=+HEAPF64[$3+112>>3];$T17=+HEAPF64[$3+120>>3];$T19=$T15*$T16+$T17*$T18;$T1Z=$T15*$T18-$T17*$T16;$T1b=+HEAPF64[$1+(($4*18|0)<<3)>>3];$T1d=+HEAPF64[$2+(($4*18|0)<<3)>>3];$T1a=+HEAPF64[$3+272>>3];$T1c=+HEAPF64[$3+280>>3];$T1e=$T1a*$T1b+$T1c*$T1d;$T20=$T1a*$T1d-$T1c*$T1b;$T1f=$T19+$T1e;$T3g=$T1Z+$T20;$T21=$T1Z-$T20;$T2C=$T19-$T1e;$T1E=+HEAPF64[$1+(($4*17|0)<<3)>>3];$T1G=+HEAPF64[$2+(($4*17|0)<<3)>>3];$T1D=+HEAPF64[$3+256>>3];$T1F=+HEAPF64[$3+264>>3];$T1H=$T1D*$T1E+$T1F*$T1G;$T2I=$T1D*$T1G-$T1F*$T1E;$T1J=+HEAPF64[$1+(($4*7|0)<<3)>>3];$T1L=+HEAPF64[$2+(($4*7|0)<<3)>>3];$T1I=+HEAPF64[$3+96>>3];$T1K=+HEAPF64[$3+104>>3];$T1M=$T1I*$T1J+$T1K*$T1L;$T2J=$T1I*$T1L-$T1K*$T1J;$T1N=$T1H+$T1M;$T3k=$T2I+$T2J;$T27=$T1H-$T1M;$T2K=$T2I-$T2J;$T1h=+HEAPF64[$1+(($4*13|0)<<3)>>3];$T1j=+HEAPF64[$2+(($4*13|0)<<3)>>3];$T1g=+HEAPF64[$3+192>>3];$T1i=+HEAPF64[$3+200>>3];$T1k=$T1g*$T1h+$T1i*$T1j;$T2D=$T1g*$T1j-$T1i*$T1h;$T1m=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T1o=+HEAPF64[$2+(($4*3|0)<<3)>>3];$T1l=+HEAPF64[$3+32>>3];$T1n=+HEAPF64[$3+40>>3];$T1p=$T1l*$T1m+$T1n*$T1o;$T2E=$T1l*$T1o-$T1n*$T1m;$T1q=$T1k+$T1p;$T3h=$T2D+$T2E;$T22=$T1k-$T1p;$T2F=$T2D-$T2E;$T1t=+HEAPF64[$1+(($4*12|0)<<3)>>3];$T1v=+HEAPF64[$2+(($4*12|0)<<3)>>3];$T1s=+HEAPF64[$3+176>>3];$T1u=+HEAPF64[$3+184>>3];$T1w=$T1s*$T1t+$T1u*$T1v;$T24=$T1s*$T1v-$T1u*$T1t;$T1y=+HEAPF64[$1+($4<<1<<3)>>3];$T1A=+HEAPF64[$2+($4<<1<<3)>>3];$T1x=+HEAPF64[$3+16>>3];$T1z=+HEAPF64[$3+24>>3];$T1B=$T1x*$T1y+$T1z*$T1A;$T25=$T1x*$T1A-$T1z*$T1y;$T1C=$T1w+$T1B;$T3j=$T24+$T25;$T26=$T24-$T25;$T2H=$T1w-$T1B;$T1r=$T1f-$T1q;$T1O=$T1C-$T1N;$T1P=$T1r+$T1O;$T3i=$T3g-$T3h;$T3l=$T3j-$T3k;$T44=$T3i+$T3l;$T3D=$T3g+$T3h;$T3E=$T3j+$T3k;$T3K=$T3D+$T3E;$T1V=$T1f+$T1q;$T1W=$T1C+$T1N;$T1X=$T1V+$T1W;$T23=$T21+$T22;$T28=$T26+$T27;$T4r=$T23+$T28;$T2W=$T21-$T22;$T2X=$T26-$T27;$T4c=$T2W+$T2X;$T33=$T2C+$T2F;$T34=$T2H+$T2K;$T35=$T33+$T34;$T2G=$T2C-$T2F;$T2L=$T2H-$T2K;$T2M=$T2G+$T2L;$Tl=+HEAPF64[$1+($4<<2<<3)>>3];$Tn=+HEAPF64[$2+($4<<2<<3)>>3];$Tk=+HEAPF64[$3+48>>3];$Tm=+HEAPF64[$3+56>>3];$To=$Tk*$Tl+$Tm*$Tn;$T2a=$Tk*$Tn-$Tm*$Tl;$Tq=+HEAPF64[$1+(($4*14|0)<<3)>>3];$Ts=+HEAPF64[$2+(($4*14|0)<<3)>>3];$Tp=+HEAPF64[$3+208>>3];$Tr=+HEAPF64[$3+216>>3];$Tt=$Tp*$Tq+$Tr*$Ts;$T2b=$Tp*$Ts-$Tr*$Tq;$Tu=$To+$Tt;$T3n=$T2a+$T2b;$T2c=$T2a-$T2b;$T2r=$To-$Tt;$TT=+HEAPF64[$1+($4<<3)>>3];$TV=+HEAPF64[$2+($4<<3)>>3];$TS=+HEAPF64[$3>>3];$TU=+HEAPF64[$3+8>>3];$TW=$TS*$TT+$TU*$TV;$T2x=$TS*$TV-$TU*$TT;$TY=+HEAPF64[$1+(($4*11|0)<<3)>>3];$T10=+HEAPF64[$2+(($4*11|0)<<3)>>3];$TX=+HEAPF64[$3+160>>3];$TZ=+HEAPF64[$3+168>>3];$T11=$TX*$TY+$TZ*$T10;$T2y=$TX*$T10-$TZ*$TY;$T12=$TW+$T11;$T3r=$T2x+$T2y;$T2i=$TW-$T11;$T2z=$T2x-$T2y;$Tw=+HEAPF64[$1+(($4*9|0)<<3)>>3];$Ty=+HEAPF64[$2+(($4*9|0)<<3)>>3];$Tv=+HEAPF64[$3+128>>3];$Tx=+HEAPF64[$3+136>>3];$Tz=$Tv*$Tw+$Tx*$Ty;$T2s=$Tv*$Ty-$Tx*$Tw;$TB=+HEAPF64[$1+(($4*19|0)<<3)>>3];$TD=+HEAPF64[$2+(($4*19|0)<<3)>>3];$TA=+HEAPF64[$3+288>>3];$TC=+HEAPF64[$3+296>>3];$TE=$TA*$TB+$TC*$TD;$T2t=$TA*$TD-$TC*$TB;$TF=$Tz+$TE;$T3o=$T2s+$T2t;$T2d=$Tz-$TE;$T2u=$T2s-$T2t;$TI=+HEAPF64[$1+($4<<4<<3)>>3];$TK=+HEAPF64[$2+($4<<4<<3)>>3];$TH=+HEAPF64[$3+240>>3];$TJ=+HEAPF64[$3+248>>3];$TL=$TH*$TI+$TJ*$TK;$T2f=$TH*$TK-$TJ*$TI;$TN=+HEAPF64[$1+(($4*6|0)<<3)>>3];$TP=+HEAPF64[$2+(($4*6|0)<<3)>>3];$TM=+HEAPF64[$3+80>>3];$TO=+HEAPF64[$3+88>>3];$TQ=$TM*$TN+$TO*$TP;$T2g=$TM*$TP-$TO*$TN;$TR=$TL+$TQ;$T3q=$T2f+$T2g;$T2h=$T2f-$T2g;$T2w=$TL-$TQ;$TG=$Tu-$TF;$T13=$TR-$T12;$T14=$TG+$T13;$T3p=$T3n-$T3o;$T3s=$T3q-$T3r;$T43=$T3p+$T3s;$T3A=$T3n+$T3o;$T3B=$T3q+$T3r;$T3J=$T3A+$T3B;$T1S=$Tu+$TF;$T1T=$TR+$T12;$T1U=$T1S+$T1T;$T2e=$T2c+$T2d;$T2j=$T2h+$T2i;$T4q=$T2e+$T2j;$T2T=$T2c-$T2d;$T2U=$T2h-$T2i;$T4b=$T2T+$T2U;$T30=$T2r+$T2u;$T31=$T2w+$T2z;$T32=$T30+$T31;$T2v=$T2r-$T2u;$T2A=$T2w-$T2z;$T2B=$T2v+$T2A;$T3e=($T14-$T1P)*.5590169943749475;$T1Q=$T14+$T1P;$T3d=$Tj-.25*$T1Q;$T3m=$T3i-$T3l;$T3t=$T3p-$T3s;$T3u=.9510565162951535*$T3m-.5877852522924731*$T3t;$T3w=.9510565162951535*$T3t+.5877852522924731*$T3m;HEAPF64[$1+(($4*10|0)<<3)>>3]=$Tj+$T1Q;$T3v=$T3e+$T3d;HEAPF64[$1+(($4*14|0)<<3)>>3]=$T3v-$T3w;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T3v+$T3w;$T3f=$T3d-$T3e;HEAPF64[$1+($4<<1<<3)>>3]=$T3f-$T3u;HEAPF64[$1+(($4*18|0)<<3)>>3]=$T3f+$T3u;$T47=($T43-$T44)*.5590169943749475;$T45=$T43+$T44;$T46=$T42-.25*$T45;$T3Z=$T1r-$T1O;$T40=$TG-$T13;$T41=.9510565162951535*$T3Z-.5877852522924731*$T40;$T4a=.9510565162951535*$T40+.5877852522924731*$T3Z;HEAPF64[$2+(($4*10|0)<<3)>>3]=$T45+$T42;$T49=$T47+$T46;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T49-$T4a;HEAPF64[$2+(($4*14|0)<<3)>>3]=$T4a+$T49;$T48=$T46-$T47;HEAPF64[$2+($4<<1<<3)>>3]=$T41+$T48;HEAPF64[$2+(($4*18|0)<<3)>>3]=$T48-$T41;$T3x=($T1U-$T1X)*.5590169943749475;$T1Y=$T1U+$T1X;$T3y=$T1R-.25*$T1Y;$T3C=$T3A-$T3B;$T3F=$T3D-$T3E;$T3G=.9510565162951535*$T3C+.5877852522924731*$T3F;$T3I=.9510565162951535*$T3F-.5877852522924731*$T3C;HEAPF64[$1>>3]=$T1R+$T1Y;$T3H=$T3y-$T3x;HEAPF64[$1+(($4*12|0)<<3)>>3]=$T3H-$T3I;HEAPF64[$1+($4<<3<<3)>>3]=$T3H+$T3I;$T3z=$T3x+$T3y;HEAPF64[$1+($4<<2<<3)>>3]=$T3z-$T3G;HEAPF64[$1+($4<<4<<3)>>3]=$T3z+$T3G;$T3U=($T3J-$T3K)*.5590169943749475;$T3L=$T3J+$T3K;$T3V=$T3Q-.25*$T3L;$T3R=$T1S-$T1T;$T3S=$T1V-$T1W;$T3T=.9510565162951535*$T3R+.5877852522924731*$T3S;$T3Y=.9510565162951535*$T3S-.5877852522924731*$T3R;HEAPF64[$2>>3]=$T3L+$T3Q;$T3X=$T3V-$T3U;HEAPF64[$2+($4<<3<<3)>>3]=$T3X-$T3Y;HEAPF64[$2+(($4*12|0)<<3)>>3]=$T3Y+$T3X;$T3W=$T3U+$T3V;HEAPF64[$2+($4<<2<<3)>>3]=$T3T+$T3W;HEAPF64[$2+($4<<4<<3)>>3]=$T3W-$T3T;$T2P=($T2B-$T2M)*.5590169943749475;$T2N=$T2B+$T2M;$T2O=$T2q-.25*$T2N;$T29=$T23-$T28;$T2k=$T2e-$T2j;$T2l=.9510565162951535*$T29-.5877852522924731*$T2k;$T2R=.9510565162951535*$T2k+.5877852522924731*$T29;HEAPF64[$1+(($4*15|0)<<3)>>3]=$T2q+$T2N;$T2S=$T2P+$T2O;HEAPF64[$1+(($4*11|0)<<3)>>3]=$T2R+$T2S;HEAPF64[$1+(($4*19|0)<<3)>>3]=$T2S-$T2R;$T2Q=$T2O-$T2P;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T2l+$T2Q;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T2Q-$T2l;$T4u=($T4q-$T4r)*.5590169943749475;$T4s=$T4q+$T4r;$T4t=$T4p-.25*$T4s;$T4w=$T2G-$T2L;$T4x=$T2v-$T2A;$T4y=.9510565162951535*$T4w-.5877852522924731*$T4x;$T4A=.9510565162951535*$T4x+.5877852522924731*$T4w;HEAPF64[$2+(($4*15|0)<<3)>>3]=$T4s+$T4p;$T4z=$T4u+$T4t;HEAPF64[$2+(($4*11|0)<<3)>>3]=$T4z-$T4A;HEAPF64[$2+(($4*19|0)<<3)>>3]=$T4A+$T4z;$T4v=$T4t-$T4u;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T4v-$T4y;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T4y+$T4v;$T36=($T32-$T35)*.5590169943749475;$T38=$T32+$T35;$T39=$T37-.25*$T38;$T2V=$T2T-$T2U;$T2Y=$T2W-$T2X;$T2Z=.9510565162951535*$T2V+.5877852522924731*$T2Y;$T3b=.9510565162951535*$T2Y-.5877852522924731*$T2V;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T37+$T38;$T3c=$T39-$T36;HEAPF64[$1+(($4*13|0)<<3)>>3]=$T3b+$T3c;HEAPF64[$1+(($4*17|0)<<3)>>3]=$T3c-$T3b;$T3a=$T36+$T39;HEAPF64[$1+($4<<3)>>3]=$T2Z+$T3a;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T3a-$T2Z;$T4d=($T4b-$T4c)*.5590169943749475;$T4h=$T4b+$T4c;$T4i=$T4g-.25*$T4h;$T4k=$T30-$T31;$T4l=$T33-$T34;$T4m=.9510565162951535*$T4k+.5877852522924731*$T4l;$T4o=.9510565162951535*$T4l-.5877852522924731*$T4k;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T4h+$T4g;$T4n=$T4i-$T4d;HEAPF64[$2+(($4*13|0)<<3)>>3]=$T4n-$T4o;HEAPF64[$2+(($4*17|0)<<3)>>3]=$T4o+$T4n;$T4j=$T4d+$T4i;HEAPF64[$2+($4<<3)>>3]=$T4j-$T4m;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T4m+$T4j;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+304|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _fftw_codelet_t1_25($p){$p=$p|0;_fftw_kdft_dit_register($p,1196,8104);return}function _t1_25($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T1=0.0,$T6b=0.0,$T2l=0.0,$T6o=0.0,$To=0.0,$T2m=0.0,$T6a=0.0,$T6p=0.0,$T6t=0.0,$T6S=0.0,$T2u=0.0,$T4I=0.0,$T2i=0.0,$T60=0.0,$T3O=0.0,$T5D=0.0,$T4r=0.0,$T58=0.0,$T3Z=0.0,$T5C=0.0,$T4q=0.0,$T5b=0.0,$TS=0.0,$T5W=0.0,$T2G=0.0,$T5s=0.0,$T4g=0.0,$T4M=0.0,$T2R=0.0,$T5t=0.0,$T4h=0.0,$T4P=0.0,$T1l=0.0,$T5X=0.0,$T33=0.0,$T5w=0.0,$T4j=0.0,$T4W=0.0,$T3e=0.0,$T5v=0.0,$T4k=0.0,$T4T=0.0,$T1P=0.0,$T5Z=0.0,$T3r=0.0,$T5z=0.0,$T4o=0.0,$T51=0.0,$T3C=0.0,$T5A=0.0,$T4n=0.0,$T54=0.0,$T6=0.0,$T2o=0.0,$Tb=0.0,$T2p=0.0,$Tc=0.0,$T68=0.0,$Th=0.0,$T2r=0.0,$Tm=0.0,$T2s=0.0,$Tn=0.0,$T69=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$T8=0.0,$Ta=0.0,$T7=0.0,$T9=0.0,$Te=0.0,$Tg=0.0,$Td=0.0,$Tf=0.0,$Tj=0.0,$Tl=0.0,$Ti=0.0,$Tk=0.0,$T6r=0.0,$T6s=0.0,$T2q=0.0,$T2t=0.0,$T1U=0.0,$T3S=0.0,$T3J=0.0,$T3M=0.0,$T3X=0.0,$T3W=0.0,$T3P=0.0,$T3Q=0.0,$T3T=0.0,$T25=0.0,$T2g=0.0,$T2h=0.0,$T1R=0.0,$T1T=0.0,$T1Q=0.0,$T1S=0.0,$T1Z=0.0,$T3H=0.0,$T2f=0.0,$T3L=0.0,$T24=0.0,$T3I=0.0,$T2a=0.0,$T3K=0.0,$T1W=0.0,$T1Y=0.0,$T1V=0.0,$T1X=0.0,$T2c=0.0,$T2e=0.0,$T2b=0.0,$T2d=0.0,$T21=0.0,$T23=0.0,$T20=0.0,$T22=0.0,$T27=0.0,$T29=0.0,$T26=0.0,$T28=0.0,$T3N=0.0,$T57=0.0,$T3G=0.0,$T56=0.0,$T3E=0.0,$T3F=0.0,$T3Y=0.0,$T59=0.0,$T3V=0.0,$T5a=0.0,$T3R=0.0,$T3U=0.0,$Tu=0.0,$T2K=0.0,$T2B=0.0,$T2E=0.0,$T2P=0.0,$T2O=0.0,$T2H=0.0,$T2I=0.0,$T2L=0.0,$TF=0.0,$TQ=0.0,$TR=0.0,$Tr=0.0,$Tt=0.0,$Tq=0.0,$Ts=0.0,$Tz=0.0,$T2z=0.0,$TP=0.0,$T2D=0.0,$TE=0.0,$T2A=0.0,$TK=0.0,$T2C=0.0,$Tw=0.0,$Ty=0.0,$Tv=0.0,$Tx=0.0,$TM=0.0,$TO=0.0,$TL=0.0,$TN=0.0,$TB=0.0,$TD=0.0,$TA=0.0,$TC=0.0,$TH=0.0,$TJ=0.0,$TG=0.0,$TI=0.0,$T2F=0.0,$T4L=0.0,$T2y=0.0,$T4K=0.0,$T2w=0.0,$T2x=0.0,$T2Q=0.0,$T4N=0.0,$T2N=0.0,$T4O=0.0,$T2J=0.0,$T2M=0.0,$TX=0.0,$T37=0.0,$T2Y=0.0,$T31=0.0,$T3c=0.0,$T3b=0.0,$T34=0.0,$T35=0.0,$T38=0.0,$T18=0.0,$T1j=0.0,$T1k=0.0,$TU=0.0,$TW=0.0,$TT=0.0,$TV=0.0,$T12=0.0,$T2W=0.0,$T1i=0.0,$T30=0.0,$T17=0.0,$T2X=0.0,$T1d=0.0,$T2Z=0.0,$TZ=0.0,$T11=0.0,$TY=0.0,$T10=0.0,$T1f=0.0,$T1h=0.0,$T1e=0.0,$T1g=0.0,$T14=0.0,$T16=0.0,$T13=0.0,$T15=0.0,$T1a=0.0,$T1c=0.0,$T19=0.0,$T1b=0.0,$T32=0.0,$T4V=0.0,$T2V=0.0,$T4U=0.0,$T2T=0.0,$T2U=0.0,$T3d=0.0,$T4R=0.0,$T3a=0.0,$T4S=0.0,$T36=0.0,$T39=0.0,$T1r=0.0,$T3v=0.0,$T3m=0.0,$T3p=0.0,$T3A=0.0,$T3z=0.0,$T3s=0.0,$T3t=0.0,$T3w=0.0,$T1C=0.0,$T1N=0.0,$T1O=0.0,$T1o=0.0,$T1q=0.0,$T1n=0.0,$T1p=0.0,$T1w=0.0,$T3k=0.0,$T1M=0.0,$T3o=0.0,$T1B=0.0,$T3l=0.0,$T1H=0.0,$T3n=0.0,$T1t=0.0,$T1v=0.0,$T1s=0.0,$T1u=0.0,$T1J=0.0,$T1L=0.0,$T1I=0.0,$T1K=0.0,$T1y=0.0,$T1A=0.0,$T1x=0.0,$T1z=0.0,$T1E=0.0,$T1G=0.0,$T1D=0.0,$T1F=0.0,$T3q=0.0,$T50=0.0,$T3j=0.0,$T4Z=0.0,$T3h=0.0,$T3i=0.0,$T3B=0.0,$T52=0.0,$T3y=0.0,$T53=0.0,$T3u=0.0,$T3x=0.0,$T62=0.0,$T64=0.0,$Tp=0.0,$T2k=0.0,$T5T=0.0,$T5U=0.0,$T63=0.0,$T5V=0.0,$T5Y=0.0,$T61=0.0,$T1m=0.0,$T2j=0.0,$T6i=0.0,$T6j=0.0,$T6c=0.0,$T67=0.0,$T6d=0.0,$T6e=0.0,$T6k=0.0,$T6f=0.0,$T6g=0.0,$T6h=0.0,$T65=0.0,$T66=0.0,$T2v=0.0,$T4f=0.0,$T6u=0.0,$T6G=0.0,$T42=0.0,$T6z=0.0,$T43=0.0,$T6y=0.0,$T4A=0.0,$T6H=0.0,$T4D=0.0,$T6F=0.0,$T4u=0.0,$T6L=0.0,$T4v=0.0,$T6K=0.0,$T48=0.0,$T6v=0.0,$T4b=0.0,$T6n=0.0,$T2n=0.0,$T6q=0.0,$T2S=0.0,$T3f=0.0,$T3g=0.0,$T3D=0.0,$T40=0.0,$T41=0.0,$T4y=0.0,$T4z=0.0,$T6D=0.0,$T4B=0.0,$T4C=0.0,$T6E=0.0,$T4i=0.0,$T4l=0.0,$T4m=0.0,$T4p=0.0,$T4s=0.0,$T4t=0.0,$T46=0.0,$T47=0.0,$T6l=0.0,$T49=0.0,$T4a=0.0,$T6m=0.0,$T4c=0.0,$T4e=0.0,$T45=0.0,$T4d=0.0,$T44=0.0,$T6A=0.0,$T6B=0.0,$T6x=0.0,$T6C=0.0,$T6w=0.0,$T4E=0.0,$T4G=0.0,$T4x=0.0,$T4F=0.0,$T4w=0.0,$T6M=0.0,$T6N=0.0,$T6J=0.0,$T6O=0.0,$T6I=0.0,$T4J=0.0,$T5r=0.0,$T6U=0.0,$T76=0.0,$T5e=0.0,$T6Z=0.0,$T5f=0.0,$T6Y=0.0,$T5M=0.0,$T77=0.0,$T5P=0.0,$T75=0.0,$T5G=0.0,$T7b=0.0,$T5H=0.0,$T7a=0.0,$T5k=0.0,$T6V=0.0,$T5n=0.0,$T6R=0.0,$T4H=0.0,$T6T=0.0,$T4Q=0.0,$T4X=0.0,$T4Y=0.0,$T55=0.0,$T5c=0.0,$T5d=0.0,$T5K=0.0,$T5L=0.0,$T73=0.0,$T5N=0.0,$T5O=0.0,$T74=0.0,$T5u=0.0,$T5x=0.0,$T5y=0.0,$T5B=0.0,$T5E=0.0,$T5F=0.0,$T5i=0.0,$T5j=0.0,$T6P=0.0,$T5l=0.0,$T5m=0.0,$T6Q=0.0,$T5o=0.0,$T5q=0.0,$T5h=0.0,$T5p=0.0,$T5g=0.0,$T70=0.0,$T71=0.0,$T6X=0.0,$T72=0.0,$T6W=0.0,$T5Q=0.0,$T5S=0.0,$T5J=0.0,$T5R=0.0,$T5I=0.0,$T7c=0.0,$T7d=0.0,$T79=0.0,$T7e=0.0,$T78=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+(($5*48|0)<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$T6b=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+(($4*5|0)<<3)>>3];$T5=+HEAPF64[$2+(($4*5|0)<<3)>>3];$T2=+HEAPF64[$3+64>>3];$T4=+HEAPF64[$3+72>>3];$T6=$T2*$T3+$T4*$T5;$T2o=$T2*$T5-$T4*$T3;$T8=+HEAPF64[$1+(($4*20|0)<<3)>>3];$Ta=+HEAPF64[$2+(($4*20|0)<<3)>>3];$T7=+HEAPF64[$3+304>>3];$T9=+HEAPF64[$3+312>>3];$Tb=$T7*$T8+$T9*$Ta;$T2p=$T7*$Ta-$T9*$T8;$Tc=$T6+$Tb;$T68=$T2o+$T2p;$Te=+HEAPF64[$1+(($4*10|0)<<3)>>3];$Tg=+HEAPF64[$2+(($4*10|0)<<3)>>3];$Td=+HEAPF64[$3+144>>3];$Tf=+HEAPF64[$3+152>>3];$Th=$Td*$Te+$Tf*$Tg;$T2r=$Td*$Tg-$Tf*$Te;$Tj=+HEAPF64[$1+(($4*15|0)<<3)>>3];$Tl=+HEAPF64[$2+(($4*15|0)<<3)>>3];$Ti=+HEAPF64[$3+224>>3];$Tk=+HEAPF64[$3+232>>3];$Tm=$Ti*$Tj+$Tk*$Tl;$T2s=$Ti*$Tl-$Tk*$Tj;$Tn=$Th+$Tm;$T69=$T2r+$T2s;$T2l=($Tc-$Tn)*.5590169943749475;$T6o=($T68-$T69)*.5590169943749475;$To=$Tc+$Tn;$T2m=$T1-.25*$To;$T6a=$T68+$T69;$T6p=$T6b-.25*$T6a;$T6r=$T6-$Tb;$T6s=$Th-$Tm;$T6t=.9510565162951535*$T6r+.5877852522924731*$T6s;$T6S=.9510565162951535*$T6s-.5877852522924731*$T6r;$T2q=$T2o-$T2p;$T2t=$T2r-$T2s;$T2u=.9510565162951535*$T2q+.5877852522924731*$T2t;$T4I=.9510565162951535*$T2t-.5877852522924731*$T2q;$T1R=+HEAPF64[$1+(($4*3|0)<<3)>>3];$T1T=+HEAPF64[$2+(($4*3|0)<<3)>>3];$T1Q=+HEAPF64[$3+32>>3];$T1S=+HEAPF64[$3+40>>3];$T1U=$T1Q*$T1R+$T1S*$T1T;$T3S=$T1Q*$T1T-$T1S*$T1R;$T1W=+HEAPF64[$1+($4<<3<<3)>>3];$T1Y=+HEAPF64[$2+($4<<3<<3)>>3];$T1V=+HEAPF64[$3+112>>3];$T1X=+HEAPF64[$3+120>>3];$T1Z=$T1V*$T1W+$T1X*$T1Y;$T3H=$T1V*$T1Y-$T1X*$T1W;$T2c=+HEAPF64[$1+(($4*18|0)<<3)>>3];$T2e=+HEAPF64[$2+(($4*18|0)<<3)>>3];$T2b=+HEAPF64[$3+272>>3];$T2d=+HEAPF64[$3+280>>3];$T2f=$T2b*$T2c+$T2d*$T2e;$T3L=$T2b*$T2e-$T2d*$T2c;$T21=+HEAPF64[$1+(($4*23|0)<<3)>>3];$T23=+HEAPF64[$2+(($4*23|0)<<3)>>3];$T20=+HEAPF64[$3+352>>3];$T22=+HEAPF64[$3+360>>3];$T24=$T20*$T21+$T22*$T23;$T3I=$T20*$T23-$T22*$T21;$T27=+HEAPF64[$1+(($4*13|0)<<3)>>3];$T29=+HEAPF64[$2+(($4*13|0)<<3)>>3];$T26=+HEAPF64[$3+192>>3];$T28=+HEAPF64[$3+200>>3];$T2a=$T26*$T27+$T28*$T29;$T3K=$T26*$T29-$T28*$T27;$T3J=$T3H-$T3I;$T3M=$T3K-$T3L;$T3X=$T2a-$T2f;$T3W=$T1Z-$T24;$T3P=$T3H+$T3I;$T3Q=$T3K+$T3L;$T3T=$T3P+$T3Q;$T25=$T1Z+$T24;$T2g=$T2a+$T2f;$T2h=$T25+$T2g;$T2i=$T1U+$T2h;$T60=$T3S+$T3T;$T3N=.9510565162951535*$T3J+.5877852522924731*$T3M;$T57=.9510565162951535*$T3M-.5877852522924731*$T3J;$T3E=($T25-$T2g)*.5590169943749475;$T3F=$T1U-.25*$T2h;$T3G=$T3E+$T3F;$T56=$T3F-$T3E;$T3O=$T3G+$T3N;$T5D=$T56+$T57;$T4r=$T3G-$T3N;$T58=$T56-$T57;$T3Y=.9510565162951535*$T3W+.5877852522924731*$T3X;$T59=.9510565162951535*$T3X-.5877852522924731*$T3W;$T3R=($T3P-$T3Q)*.5590169943749475;$T3U=$T3S-.25*$T3T;$T3V=$T3R+$T3U;$T5a=$T3U-$T3R;$T3Z=$T3V-$T3Y;$T5C=$T5a-$T59;$T4q=$T3Y+$T3V;$T5b=$T59+$T5a;$Tr=+HEAPF64[$1+($4<<3)>>3];$Tt=+HEAPF64[$2+($4<<3)>>3];$Tq=+HEAPF64[$3>>3];$Ts=+HEAPF64[$3+8>>3];$Tu=$Tq*$Tr+$Ts*$Tt;$T2K=$Tq*$Tt-$Ts*$Tr;$Tw=+HEAPF64[$1+(($4*6|0)<<3)>>3];$Ty=+HEAPF64[$2+(($4*6|0)<<3)>>3];$Tv=+HEAPF64[$3+80>>3];$Tx=+HEAPF64[$3+88>>3];$Tz=$Tv*$Tw+$Tx*$Ty;$T2z=$Tv*$Ty-$Tx*$Tw;$TM=+HEAPF64[$1+($4<<4<<3)>>3];$TO=+HEAPF64[$2+($4<<4<<3)>>3];$TL=+HEAPF64[$3+240>>3];$TN=+HEAPF64[$3+248>>3];$TP=$TL*$TM+$TN*$TO;$T2D=$TL*$TO-$TN*$TM;$TB=+HEAPF64[$1+(($4*21|0)<<3)>>3];$TD=+HEAPF64[$2+(($4*21|0)<<3)>>3];$TA=+HEAPF64[$3+320>>3];$TC=+HEAPF64[$3+328>>3];$TE=$TA*$TB+$TC*$TD;$T2A=$TA*$TD-$TC*$TB;$TH=+HEAPF64[$1+(($4*11|0)<<3)>>3];$TJ=+HEAPF64[$2+(($4*11|0)<<3)>>3];$TG=+HEAPF64[$3+160>>3];$TI=+HEAPF64[$3+168>>3];$TK=$TG*$TH+$TI*$TJ;$T2C=$TG*$TJ-$TI*$TH;$T2B=$T2z-$T2A;$T2E=$T2C-$T2D;$T2P=$TK-$TP;$T2O=$Tz-$TE;$T2H=$T2z+$T2A;$T2I=$T2C+$T2D;$T2L=$T2H+$T2I;$TF=$Tz+$TE;$TQ=$TK+$TP;$TR=$TF+$TQ;$TS=$Tu+$TR;$T5W=$T2K+$T2L;$T2F=.9510565162951535*$T2B+.5877852522924731*$T2E;$T4L=.9510565162951535*$T2E-.5877852522924731*$T2B;$T2w=($TF-$TQ)*.5590169943749475;$T2x=$Tu-.25*$TR;$T2y=$T2w+$T2x;$T4K=$T2x-$T2w;$T2G=$T2y+$T2F;$T5s=$T4K+$T4L;$T4g=$T2y-$T2F;$T4M=$T4K-$T4L;$T2Q=.9510565162951535*$T2O+.5877852522924731*$T2P;$T4N=.9510565162951535*$T2P-.5877852522924731*$T2O;$T2J=($T2H-$T2I)*.5590169943749475;$T2M=$T2K-.25*$T2L;$T2N=$T2J+$T2M;$T4O=$T2M-$T2J;$T2R=$T2N-$T2Q;$T5t=$T4O-$T4N;$T4h=$T2Q+$T2N;$T4P=$T4N+$T4O;$TU=+HEAPF64[$1+($4<<2<<3)>>3];$TW=+HEAPF64[$2+($4<<2<<3)>>3];$TT=+HEAPF64[$3+48>>3];$TV=+HEAPF64[$3+56>>3];$TX=$TT*$TU+$TV*$TW;$T37=$TT*$TW-$TV*$TU;$TZ=+HEAPF64[$1+(($4*9|0)<<3)>>3];$T11=+HEAPF64[$2+(($4*9|0)<<3)>>3];$TY=+HEAPF64[$3+128>>3];$T10=+HEAPF64[$3+136>>3];$T12=$TY*$TZ+$T10*$T11;$T2W=$TY*$T11-$T10*$TZ;$T1f=+HEAPF64[$1+(($4*19|0)<<3)>>3];$T1h=+HEAPF64[$2+(($4*19|0)<<3)>>3];$T1e=+HEAPF64[$3+288>>3];$T1g=+HEAPF64[$3+296>>3];$T1i=$T1e*$T1f+$T1g*$T1h;$T30=$T1e*$T1h-$T1g*$T1f;$T14=+HEAPF64[$1+(($4*24|0)<<3)>>3];$T16=+HEAPF64[$2+(($4*24|0)<<3)>>3];$T13=+HEAPF64[$3+368>>3];$T15=+HEAPF64[$3+376>>3];$T17=$T13*$T14+$T15*$T16;$T2X=$T13*$T16-$T15*$T14;$T1a=+HEAPF64[$1+(($4*14|0)<<3)>>3];$T1c=+HEAPF64[$2+(($4*14|0)<<3)>>3];$T19=+HEAPF64[$3+208>>3];$T1b=+HEAPF64[$3+216>>3];$T1d=$T19*$T1a+$T1b*$T1c;$T2Z=$T19*$T1c-$T1b*$T1a;$T2Y=$T2W-$T2X;$T31=$T2Z-$T30;$T3c=$T1d-$T1i;$T3b=$T12-$T17;$T34=$T2W+$T2X;$T35=$T2Z+$T30;$T38=$T34+$T35;$T18=$T12+$T17;$T1j=$T1d+$T1i;$T1k=$T18+$T1j;$T1l=$TX+$T1k;$T5X=$T37+$T38;$T32=.9510565162951535*$T2Y+.5877852522924731*$T31;$T4V=.9510565162951535*$T31-.5877852522924731*$T2Y;$T2T=($T18-$T1j)*.5590169943749475;$T2U=$TX-.25*$T1k;$T2V=$T2T+$T2U;$T4U=$T2U-$T2T;$T33=$T2V+$T32;$T5w=$T4U+$T4V;$T4j=$T2V-$T32;$T4W=$T4U-$T4V;$T3d=.9510565162951535*$T3b+.5877852522924731*$T3c;$T4R=.9510565162951535*$T3c-.5877852522924731*$T3b;$T36=($T34-$T35)*.5590169943749475;$T39=$T37-.25*$T38;$T3a=$T36+$T39;$T4S=$T39-$T36;$T3e=$T3a-$T3d;$T5v=$T4S-$T4R;$T4k=$T3d+$T3a;$T4T=$T4R+$T4S;$T1o=+HEAPF64[$1+($4<<1<<3)>>3];$T1q=+HEAPF64[$2+($4<<1<<3)>>3];$T1n=+HEAPF64[$3+16>>3];$T1p=+HEAPF64[$3+24>>3];$T1r=$T1n*$T1o+$T1p*$T1q;$T3v=$T1n*$T1q-$T1p*$T1o;$T1t=+HEAPF64[$1+(($4*7|0)<<3)>>3];$T1v=+HEAPF64[$2+(($4*7|0)<<3)>>3];$T1s=+HEAPF64[$3+96>>3];$T1u=+HEAPF64[$3+104>>3];$T1w=$T1s*$T1t+$T1u*$T1v;$T3k=$T1s*$T1v-$T1u*$T1t;$T1J=+HEAPF64[$1+(($4*17|0)<<3)>>3];$T1L=+HEAPF64[$2+(($4*17|0)<<3)>>3];$T1I=+HEAPF64[$3+256>>3];$T1K=+HEAPF64[$3+264>>3];$T1M=$T1I*$T1J+$T1K*$T1L;$T3o=$T1I*$T1L-$T1K*$T1J;$T1y=+HEAPF64[$1+(($4*22|0)<<3)>>3];$T1A=+HEAPF64[$2+(($4*22|0)<<3)>>3];$T1x=+HEAPF64[$3+336>>3];$T1z=+HEAPF64[$3+344>>3];$T1B=$T1x*$T1y+$T1z*$T1A;$T3l=$T1x*$T1A-$T1z*$T1y;$T1E=+HEAPF64[$1+(($4*12|0)<<3)>>3];$T1G=+HEAPF64[$2+(($4*12|0)<<3)>>3];$T1D=+HEAPF64[$3+176>>3];$T1F=+HEAPF64[$3+184>>3];$T1H=$T1D*$T1E+$T1F*$T1G;$T3n=$T1D*$T1G-$T1F*$T1E;$T3m=$T3k-$T3l;$T3p=$T3n-$T3o;$T3A=$T1H-$T1M;$T3z=$T1w-$T1B;$T3s=$T3k+$T3l;$T3t=$T3n+$T3o;$T3w=$T3s+$T3t;$T1C=$T1w+$T1B;$T1N=$T1H+$T1M;$T1O=$T1C+$T1N;$T1P=$T1r+$T1O;$T5Z=$T3v+$T3w;$T3q=.9510565162951535*$T3m+.5877852522924731*$T3p;$T50=.9510565162951535*$T3p-.5877852522924731*$T3m;$T3h=($T1C-$T1N)*.5590169943749475;$T3i=$T1r-.25*$T1O;$T3j=$T3h+$T3i;$T4Z=$T3i-$T3h;$T3r=$T3j+$T3q;$T5z=$T4Z+$T50;$T4o=$T3j-$T3q;$T51=$T4Z-$T50;$T3B=.9510565162951535*$T3z+.5877852522924731*$T3A;$T52=.9510565162951535*$T3A-.5877852522924731*$T3z;$T3u=($T3s-$T3t)*.5590169943749475;$T3x=$T3v-.25*$T3w;$T3y=$T3u+$T3x;$T53=$T3x-$T3u;$T3C=$T3y-$T3B;$T5A=$T53-$T52;$T4n=$T3B+$T3y;$T54=$T52+$T53;$T5Y=$T5W-$T5X;$T61=$T5Z-$T60;$T62=.9510565162951535*$T5Y+.5877852522924731*$T61;$T64=.9510565162951535*$T61-.5877852522924731*$T5Y;$Tp=$T1+$To;$T1m=$TS+$T1l;$T2j=$T1P+$T2i;$T2k=$T1m+$T2j;$T5T=($T1m-$T2j)*.5590169943749475;$T5U=$Tp-.25*$T2k;HEAPF64[$1>>3]=$Tp+$T2k;$T63=$T5U-$T5T;HEAPF64[$1+(($4*10|0)<<3)>>3]=$T63-$T64;HEAPF64[$1+(($4*15|0)<<3)>>3]=$T63+$T64;$T5V=$T5T+$T5U;HEAPF64[$1+(($4*20|0)<<3)>>3]=$T5V-$T62;HEAPF64[$1+(($4*5|0)<<3)>>3]=$T5V+$T62;$T6g=$TS-$T1l;$T6h=$T1P-$T2i;$T6i=.9510565162951535*$T6g+.5877852522924731*$T6h;$T6j=.9510565162951535*$T6h-.5877852522924731*$T6g;$T6c=$T6a+$T6b;$T65=$T5W+$T5X;$T66=$T5Z+$T60;$T67=$T65+$T66;$T6d=($T65-$T66)*.5590169943749475;$T6e=$T6c-.25*$T67;HEAPF64[$2>>3]=$T67+$T6c;$T6k=$T6e-$T6d;HEAPF64[$2+(($4*10|0)<<3)>>3]=$T6j+$T6k;HEAPF64[$2+(($4*15|0)<<3)>>3]=$T6k-$T6j;$T6f=$T6d+$T6e;HEAPF64[$2+(($4*5|0)<<3)>>3]=$T6f-$T6i;HEAPF64[$2+(($4*20|0)<<3)>>3]=$T6i+$T6f;$T2n=$T2l+$T2m;$T2v=$T2n+$T2u;$T4f=$T2n-$T2u;$T6q=$T6o+$T6p;$T6u=$T6q-$T6t;$T6G=$T6t+$T6q;$T2S=.9685831611286311*$T2G+.2486898871648548*$T2R;$T3f=.5358267949789967*$T33+.8443279255020151*$T3e;$T3g=$T2S+$T3f;$T3D=.8763066800438636*$T3r+.48175367410171527*$T3C;$T40=.7289686274214116*$T3O+.6845471059286887*$T3Z;$T41=$T3D+$T40;$T42=$T3g+$T41;$T6z=$T3D-$T40;$T43=($T3g-$T41)*.5590169943749475;$T6y=$T2S-$T3f;$T4y=.5358267949789967*$T4h-.8443279255020151*$T4g;$T4z=.7705132427757893*$T4j-.6374239897486897*$T4k;$T6D=$T4y+$T4z;$T4B=.12533323356430426*$T4r+.9921147013144779*$T4q;$T4C=.9048270524660196*$T4o+.42577929156507266*$T4n;$T6E=$T4C+$T4B;$T4A=$T4y-$T4z;$T6H=($T6D+$T6E)*.5590169943749475;$T4D=$T4B-$T4C;$T6F=$T6D-$T6E;$T4i=.5358267949789967*$T4g+.8443279255020151*$T4h;$T4l=.6374239897486897*$T4j+.7705132427757893*$T4k;$T4m=$T4i-$T4l;$T4p=.9048270524660196*$T4n-.42577929156507266*$T4o;$T4s=.12533323356430426*$T4q-.9921147013144779*$T4r;$T4t=$T4p+$T4s;$T4u=$T4m+$T4t;$T6L=$T4p-$T4s;$T4v=($T4m-$T4t)*.5590169943749475;$T6K=$T4i+$T4l;$T46=.9685831611286311*$T2R-.2486898871648548*$T2G;$T47=.5358267949789967*$T3e-.8443279255020151*$T33;$T6l=$T46+$T47;$T49=.8763066800438636*$T3C-.48175367410171527*$T3r;$T4a=.7289686274214116*$T3Z-.6845471059286887*$T3O;$T6m=$T49+$T4a;$T48=$T46-$T47;$T6v=($T6l-$T6m)*.5590169943749475;$T4b=$T49-$T4a;$T6n=$T6l+$T6m;HEAPF64[$1+($4<<3)>>3]=$T2v+$T42;HEAPF64[$2+($4<<3)>>3]=$T6n+$T6u;HEAPF64[$1+($4<<2<<3)>>3]=$T4f+$T4u;HEAPF64[$2+($4<<2<<3)>>3]=$T6F+$T6G;$T4c=.9510565162951535*$T48+.5877852522924731*$T4b;$T4e=.9510565162951535*$T4b-.5877852522924731*$T48;$T44=$T2v-.25*$T42;$T45=$T43+$T44;$T4d=$T44-$T43;HEAPF64[$1+(($4*21|0)<<3)>>3]=$T45-$T4c;HEAPF64[$1+($4<<4<<3)>>3]=$T4d+$T4e;HEAPF64[$1+(($4*6|0)<<3)>>3]=$T45+$T4c;HEAPF64[$1+(($4*11|0)<<3)>>3]=$T4d-$T4e;$T6A=.9510565162951535*$T6y+.5877852522924731*$T6z;$T6B=.9510565162951535*$T6z-.5877852522924731*$T6y;$T6w=$T6u-.25*$T6n;$T6x=$T6v+$T6w;$T6C=$T6w-$T6v;HEAPF64[$2+(($4*6|0)<<3)>>3]=$T6x-$T6A;HEAPF64[$2+($4<<4<<3)>>3]=$T6C-$T6B;HEAPF64[$2+(($4*21|0)<<3)>>3]=$T6A+$T6x;HEAPF64[$2+(($4*11|0)<<3)>>3]=$T6B+$T6C;$T4E=.9510565162951535*$T4A+.5877852522924731*$T4D;$T4G=.9510565162951535*$T4D-.5877852522924731*$T4A;$T4w=$T4f-.25*$T4u;$T4x=$T4v+$T4w;$T4F=$T4w-$T4v;HEAPF64[$1+(($4*24|0)<<3)>>3]=$T4x-$T4E;HEAPF64[$1+(($4*19|0)<<3)>>3]=$T4F+$T4G;HEAPF64[$1+(($4*9|0)<<3)>>3]=$T4x+$T4E;HEAPF64[$1+(($4*14|0)<<3)>>3]=$T4F-$T4G;$T6M=.9510565162951535*$T6K+.5877852522924731*$T6L;$T6N=.9510565162951535*$T6L-.5877852522924731*$T6K;$T6I=$T6G-.25*$T6F;$T6J=$T6H+$T6I;$T6O=$T6I-$T6H;HEAPF64[$2+(($4*9|0)<<3)>>3]=$T6J-$T6M;HEAPF64[$2+(($4*19|0)<<3)>>3]=$T6O-$T6N;HEAPF64[$2+(($4*24|0)<<3)>>3]=$T6M+$T6J;HEAPF64[$2+(($4*14|0)<<3)>>3]=$T6N+$T6O;$T4H=$T2m-$T2l;$T4J=$T4H-$T4I;$T5r=$T4H+$T4I;$T6T=$T6p-$T6o;$T6U=$T6S+$T6T;$T76=$T6T-$T6S;$T4Q=.8763066800438636*$T4M+.48175367410171527*$T4P;$T4X=.9048270524660196*$T4T-.42577929156507266*$T4W;$T4Y=$T4Q+$T4X;$T55=.5358267949789967*$T51+.8443279255020151*$T54;$T5c=.06279051952931337*$T58+.9980267284282716*$T5b;$T5d=$T55+$T5c;$T5e=$T4Y+$T5d;$T6Z=$T55-$T5c;$T5f=($T4Y-$T5d)*.5590169943749475;$T6Y=$T4Q-$T4X;$T5K=.7289686274214116*$T5t-.6845471059286887*$T5s;$T5L=.12533323356430426*$T5w+.9921147013144779*$T5v;$T73=$T5K-$T5L;$T5N=.06279051952931337*$T5A-.9980267284282716*$T5z;$T5O=.7705132427757893*$T5D+.6374239897486897*$T5C;$T74=$T5N-$T5O;$T5M=$T5K+$T5L;$T77=($T73-$T74)*.5590169943749475;$T5P=$T5N+$T5O;$T75=$T73+$T74;$T5u=.7289686274214116*$T5s+.6845471059286887*$T5t;$T5x=.12533323356430426*$T5v-.9921147013144779*$T5w;$T5y=$T5u+$T5x;$T5B=.06279051952931337*$T5z+.9980267284282716*$T5A;$T5E=.7705132427757893*$T5C-.6374239897486897*$T5D;$T5F=$T5B+$T5E;$T5G=$T5y+$T5F;$T7b=$T5B-$T5E;$T5H=($T5y-$T5F)*.5590169943749475;$T7a=$T5u-$T5x;$T5i=.8763066800438636*$T4P-.48175367410171527*$T4M;$T5j=.9048270524660196*$T4W+.42577929156507266*$T4T;$T6P=$T5i-$T5j;$T5l=.5358267949789967*$T54-.8443279255020151*$T51;$T5m=.06279051952931337*$T5b-.9980267284282716*$T58;$T6Q=$T5l+$T5m;$T5k=$T5i+$T5j;$T6V=($T6P-$T6Q)*.5590169943749475;$T5n=$T5l-$T5m;$T6R=$T6P+$T6Q;HEAPF64[$1+($4<<1<<3)>>3]=$T4J+$T5e;HEAPF64[$2+($4<<1<<3)>>3]=$T6R+$T6U;HEAPF64[$1+(($4*3|0)<<3)>>3]=$T5r+$T5G;HEAPF64[$2+(($4*3|0)<<3)>>3]=$T75+$T76;$T5o=.9510565162951535*$T5k+.5877852522924731*$T5n;$T5q=.9510565162951535*$T5n-.5877852522924731*$T5k;$T5g=$T4J-.25*$T5e;$T5h=$T5f+$T5g;$T5p=$T5g-$T5f;HEAPF64[$1+(($4*22|0)<<3)>>3]=$T5h-$T5o;HEAPF64[$1+(($4*17|0)<<3)>>3]=$T5p+$T5q;HEAPF64[$1+(($4*7|0)<<3)>>3]=$T5h+$T5o;HEAPF64[$1+(($4*12|0)<<3)>>3]=$T5p-$T5q;$T70=.9510565162951535*$T6Y+.5877852522924731*$T6Z;$T71=.9510565162951535*$T6Z-.5877852522924731*$T6Y;$T6W=$T6U-.25*$T6R;$T6X=$T6V+$T6W;$T72=$T6W-$T6V;HEAPF64[$2+(($4*7|0)<<3)>>3]=$T6X-$T70;HEAPF64[$2+(($4*17|0)<<3)>>3]=$T72-$T71;HEAPF64[$2+(($4*22|0)<<3)>>3]=$T70+$T6X;HEAPF64[$2+(($4*12|0)<<3)>>3]=$T71+$T72;$T5Q=.9510565162951535*$T5M+.5877852522924731*$T5P;$T5S=.9510565162951535*$T5P-.5877852522924731*$T5M;$T5I=$T5r-.25*$T5G;$T5J=$T5H+$T5I;$T5R=$T5I-$T5H;HEAPF64[$1+(($4*23|0)<<3)>>3]=$T5J-$T5Q;HEAPF64[$1+(($4*18|0)<<3)>>3]=$T5R+$T5S;HEAPF64[$1+($4<<3<<3)>>3]=$T5J+$T5Q;HEAPF64[$1+(($4*13|0)<<3)>>3]=$T5R-$T5S;$T7c=.9510565162951535*$T7a+.5877852522924731*$T7b;$T7d=.9510565162951535*$T7b-.5877852522924731*$T7a;$T78=$T76-.25*$T75;$T79=$T77+$T78;$T7e=$T78-$T77;HEAPF64[$2+($4<<3<<3)>>3]=$T79-$T7c;HEAPF64[$2+(($4*18|0)<<3)>>3]=$T7e-$T7d;HEAPF64[$2+(($4*23|0)<<3)>>3]=$T7c+$T79;HEAPF64[$2+(($4*13|0)<<3)>>3]=$T7d+$T7e;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+384|0;$4=$4^HEAP32[7898];label=2;break;case 5:return}}function _t1_3($ri,$ii,$W,$rs,$mb,$me,$ms){$ri=$ri|0;$ii=$ii|0;$W=$W|0;$rs=$rs|0;$mb=$mb|0;$me=$me|0;$ms=$ms|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$7=0,$m=0,$T1=0.0,$Ti=0.0,$T6=0.0,$Te=0.0,$Tb=0.0,$Tf=0.0,$Tc=0.0,$Th=0.0,$T3=0.0,$T5=0.0,$T2=0.0,$T4=0.0,$T8=0.0,$Ta=0.0,$T7=0.0,$T9=0.0,$Td=0.0,$Tg=0.0,$Tj=0.0,$Tk=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ri;$2=$ii;$3=$W;$4=$rs;$5=$mb;$7=$ms;$m=$5;$3=$3+($5<<2<<3)|0;label=2;break;case 2:if(($m|0)<($me|0)){label=3;break}else{label=5;break};case 3:$T1=+HEAPF64[$1>>3];$Ti=+HEAPF64[$2>>3];$T3=+HEAPF64[$1+($4<<3)>>3];$T5=+HEAPF64[$2+($4<<3)>>3];$T2=+HEAPF64[$3>>3];$T4=+HEAPF64[$3+8>>3];$T6=$T2*$T3+$T4*$T5;$Te=$T2*$T5-$T4*$T3;$T8=+HEAPF64[$1+($4<<1<<3)>>3];$Ta=+HEAPF64[$2+($4<<1<<3)>>3];$T7=+HEAPF64[$3+16>>3];$T9=+HEAPF64[$3+24>>3];$Tb=$T7*$T8+$T9*$Ta;$Tf=$T7*$Ta-$T9*$T8;$Tc=$T6+$Tb;$Th=$Te+$Tf;HEAPF64[$1>>3]=$T1+$Tc;HEAPF64[$2>>3]=$Th+$Ti;$Td=$T1-.5*$Tc;$Tg=($Te-$Tf)*.8660254037844386;HEAPF64[$1+($4<<1<<3)>>3]=$Td-$Tg;HEAPF64[$1+($4<<3)>>3]=$Td+$Tg;$Tj=($Tb-$T6)*.8660254037844386;$Tk=$Ti-.5*$Th;HEAPF64[$2+($4<<3)>>3]=$Tj+$Tk;HEAPF64[$2+($4<<1<<3)>>3]=$Tk-$Tj;label=4;break;case 4:$m=$m+1|0;$1=$1+($7<<3)|0;$2=$2+($7<<3)|0;$3=$3+32|0;label=2;break;case 5:return}}function _fftw_codelet_t1_3($p){$p=$p|0;_fftw_kdft_dit_register($p,1044,8040);return}function _fftw_codelet_t1_32($p){$p=$p|0;_fftw_kdft_dit_register($p,1190,7976);return}
function _malloc($bytes){$bytes=$bytes|0;var $8=0,$9=0,$10=0,$11=0,$17=0,$18=0,$20=0,$21=0,$22=0,$23=0,$24=0,$35=0,$40=0,$45=0,$56=0,$59=0,$62=0,$64=0,$65=0,$67=0,$69=0,$71=0,$73=0,$75=0,$77=0,$79=0,$82=0,$83=0,$85=0,$86=0,$87=0,$88=0,$89=0,$100=0,$105=0,$106=0,$109=0,$117=0,$120=0,$121=0,$122=0,$124=0,$125=0,$126=0,$132=0,$133=0,$_pre_phi=0,$F4_0=0,$145=0,$150=0,$152=0,$153=0,$155=0,$157=0,$159=0,$161=0,$163=0,$165=0,$167=0,$172=0,$rsize_0_i=0,$v_0_i=0,$t_0_i=0,$179=0,$183=0,$185=0,$189=0,$190=0,$192=0,$193=0,$196=0,$201=0,$203=0,$207=0,$211=0,$215=0,$220=0,$221=0,$224=0,$225=0,$RP_0_i=0,$R_0_i=0,$227=0,$228=0,$231=0,$232=0,$R_1_i=0,$242=0,$244=0,$258=0,$274=0,$286=0,$300=0,$304=0,$315=0,$318=0,$319=0,$320=0,$322=0,$323=0,$324=0,$330=0,$331=0,$_pre_phi_i=0,$F1_0_i=0,$342=0,$348=0,$349=0,$350=0,$353=0,$354=0,$361=0,$362=0,$365=0,$367=0,$370=0,$375=0,$idx_0_i=0,$383=0,$391=0,$rst_0_i=0,$sizebits_0_i=0,$t_0_i116=0,$rsize_0_i117=0,$v_0_i118=0,$396=0,$397=0,$rsize_1_i=0,$v_1_i=0,$403=0,$406=0,$rst_1_i=0,$t_1_i=0,$rsize_2_i=0,$v_2_i=0,$414=0,$417=0,$422=0,$424=0,$425=0,$427=0,$429=0,$431=0,$433=0,$435=0,$437=0,$439=0,$t_2_ph_i=0,$v_330_i=0,$rsize_329_i=0,$t_228_i=0,$449=0,$450=0,$_rsize_3_i=0,$t_2_v_3_i=0,$452=0,$455=0,$v_3_lcssa_i=0,$rsize_3_lcssa_i=0,$463=0,$464=0,$467=0,$468=0,$472=0,$474=0,$478=0,$482=0,$486=0,$491=0,$492=0,$495=0,$496=0,$RP_0_i119=0,$R_0_i120=0,$498=0,$499=0,$502=0,$503=0,$R_1_i122=0,$513=0,$515=0,$529=0,$545=0,$557=0,$571=0,$575=0,$586=0,$589=0,$591=0,$592=0,$593=0,$599=0,$600=0,$_pre_phi_i128=0,$F5_0_i=0,$612=0,$613=0,$620=0,$621=0,$624=0,$626=0,$629=0,$634=0,$I7_0_i=0,$641=0,$648=0,$649=0,$668=0,$T_0_i=0,$K12_0_i=0,$677=0,$678=0,$694=0,$695=0,$697=0,$711=0,$nb_0=0,$714=0,$717=0,$718=0,$721=0,$736=0,$743=0,$746=0,$747=0,$748=0,$762=0,$772=0,$773=0,$774=0,$775=0,$776=0,$779=0,$782=0,$783=0,$791=0,$794=0,$sp_0_i_i=0,$796=0,$797=0,$800=0,$806=0,$809=0,$812=0,$813=0,$814=0,$ssize_0_i=0,$824=0,$825=0,$829=0,$835=0,$836=0,$840=0,$843=0,$847=0,$ssize_1_i=0,$br_0_i=0,$tsize_0_i=0,$tbase_0_i=0,$856=0,$860=0,$ssize_2_i=0,$tsize_0303639_i=0,$tsize_1_i=0,$876=0,$877=0,$881=0,$883=0,$_tbase_1_i=0,$tbase_245_i=0,$tsize_244_i=0,$886=0,$890=0,$893=0,$i_02_i_i=0,$899=0,$901=0,$904=0,$908=0,$914=0,$917=0,$sp_067_i=0,$925=0,$926=0,$927=0,$932=0,$939=0,$944=0,$946=0,$947=0,$949=0,$955=0,$958=0,$sp_160_i=0,$970=0,$975=0,$982=0,$986=0,$993=0,$996=0,$1003=0,$1004=0,$1005=0,$_sum_i21_i=0,$1009=0,$1010=0,$1011=0,$1019=0,$1028=0,$_sum2_i23_i=0,$1037=0,$1041=0,$1042=0,$1047=0,$1050=0,$1053=0,$1076=0,$_pre_phi57_i_i=0,$1081=0,$1084=0,$1087=0,$1092=0,$1097=0,$1101=0,$_sum67_i_i=0,$1107=0,$1108=0,$1112=0,$1113=0,$RP_0_i_i=0,$R_0_i_i=0,$1115=0,$1116=0,$1119=0,$1120=0,$R_1_i_i=0,$1132=0,$1134=0,$1148=0,$_sum3233_i_i=0,$1165=0,$1178=0,$qsize_0_i_i=0,$oldfirst_0_i_i=0,$1194=0,$1202=0,$1205=0,$1207=0,$1208=0,$1209=0,$1215=0,$1216=0,$_pre_phi_i25_i=0,$F4_0_i_i=0,$1228=0,$1229=0,$1236=0,$1237=0,$1240=0,$1242=0,$1245=0,$1250=0,$I7_0_i_i=0,$1257=0,$1264=0,$1265=0,$1284=0,$T_0_i27_i=0,$K8_0_i_i=0,$1293=0,$1294=0,$1310=0,$1311=0,$1313=0,$1327=0,$sp_0_i_i_i=0,$1330=0,$1334=0,$1335=0,$1341=0,$1348=0,$1349=0,$1353=0,$1354=0,$1358=0,$1364=0,$1367=0,$1377=0,$1380=0,$1381=0,$1389=0,$1392=0,$1398=0,$1401=0,$1403=0,$1404=0,$1405=0,$1411=0,$1412=0,$_pre_phi_i_i=0,$F_0_i_i=0,$1422=0,$1423=0,$1430=0,$1431=0,$1434=0,$1436=0,$1439=0,$1444=0,$I1_0_i_i=0,$1451=0,$1455=0,$1456=0,$1471=0,$T_0_i_i=0,$K2_0_i_i=0,$1480=0,$1481=0,$1494=0,$1495=0,$1497=0,$1507=0,$1510=0,$1511=0,$1512=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($bytes>>>0<245){label=2;break}else{label=78;break};case 2:if($bytes>>>0<11){$8=16;label=4;break}else{label=3;break};case 3:$8=$bytes+11&-8;label=4;break;case 4:$9=$8>>>3;$10=HEAP32[7900]|0;$11=$10>>>($9>>>0);if(($11&3|0)==0){label=12;break}else{label=5;break};case 5:$17=($11&1^1)+$9|0;$18=$17<<1;$20=31640+($18<<2)|0;$21=31640+($18+2<<2)|0;$22=HEAP32[$21>>2]|0;$23=$22+8|0;$24=HEAP32[$23>>2]|0;if(($20|0)==($24|0)){label=6;break}else{label=7;break};case 6:HEAP32[7900]=$10&~(1<<$17);label=11;break;case 7:if($24>>>0<(HEAP32[7904]|0)>>>0){label=10;break}else{label=8;break};case 8:$35=$24+12|0;if((HEAP32[$35>>2]|0)==($22|0)){label=9;break}else{label=10;break};case 9:HEAP32[$35>>2]=$20;HEAP32[$21>>2]=$24;label=11;break;case 10:_abort();return 0;return 0;case 11:$40=$17<<3;HEAP32[$22+4>>2]=$40|3;$45=$22+($40|4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]|1;$mem_0=$23;label=341;break;case 12:if($8>>>0>(HEAP32[7902]|0)>>>0){label=13;break}else{$nb_0=$8;label=160;break};case 13:if(($11|0)==0){label=27;break}else{label=14;break};case 14:$56=2<<$9;$59=$11<<$9&($56|-$56);$62=($59&-$59)-1|0;$64=$62>>>12&16;$65=$62>>>($64>>>0);$67=$65>>>5&8;$69=$65>>>($67>>>0);$71=$69>>>2&4;$73=$69>>>($71>>>0);$75=$73>>>1&2;$77=$73>>>($75>>>0);$79=$77>>>1&1;$82=($67|$64|$71|$75|$79)+($77>>>($79>>>0))|0;$83=$82<<1;$85=31640+($83<<2)|0;$86=31640+($83+2<<2)|0;$87=HEAP32[$86>>2]|0;$88=$87+8|0;$89=HEAP32[$88>>2]|0;if(($85|0)==($89|0)){label=15;break}else{label=16;break};case 15:HEAP32[7900]=$10&~(1<<$82);label=20;break;case 16:if($89>>>0<(HEAP32[7904]|0)>>>0){label=19;break}else{label=17;break};case 17:$100=$89+12|0;if((HEAP32[$100>>2]|0)==($87|0)){label=18;break}else{label=19;break};case 18:HEAP32[$100>>2]=$85;HEAP32[$86>>2]=$89;label=20;break;case 19:_abort();return 0;return 0;case 20:$105=$82<<3;$106=$105-$8|0;HEAP32[$87+4>>2]=$8|3;$109=$87;HEAP32[$109+($8|4)>>2]=$106|1;HEAP32[$109+$105>>2]=$106;$117=HEAP32[7902]|0;if(($117|0)==0){label=26;break}else{label=21;break};case 21:$120=HEAP32[7905]|0;$121=$117>>>3;$122=$121<<1;$124=31640+($122<<2)|0;$125=HEAP32[7900]|0;$126=1<<$121;if(($125&$126|0)==0){label=22;break}else{label=23;break};case 22:HEAP32[7900]=$125|$126;$F4_0=$124;$_pre_phi=31640+($122+2<<2)|0;label=25;break;case 23:$132=31640+($122+2<<2)|0;$133=HEAP32[$132>>2]|0;if($133>>>0<(HEAP32[7904]|0)>>>0){label=24;break}else{$F4_0=$133;$_pre_phi=$132;label=25;break};case 24:_abort();return 0;return 0;case 25:HEAP32[$_pre_phi>>2]=$120;HEAP32[$F4_0+12>>2]=$120;HEAP32[$120+8>>2]=$F4_0;HEAP32[$120+12>>2]=$124;label=26;break;case 26:HEAP32[7902]=$106;HEAP32[7905]=$109+$8;$mem_0=$88;label=341;break;case 27:$145=HEAP32[7901]|0;if(($145|0)==0){$nb_0=$8;label=160;break}else{label=28;break};case 28:$150=($145&-$145)-1|0;$152=$150>>>12&16;$153=$150>>>($152>>>0);$155=$153>>>5&8;$157=$153>>>($155>>>0);$159=$157>>>2&4;$161=$157>>>($159>>>0);$163=$161>>>1&2;$165=$161>>>($163>>>0);$167=$165>>>1&1;$172=HEAP32[31904+(($155|$152|$159|$163|$167)+($165>>>($167>>>0))<<2)>>2]|0;$t_0_i=$172;$v_0_i=$172;$rsize_0_i=(HEAP32[$172+4>>2]&-8)-$8|0;label=29;break;case 29:$179=HEAP32[$t_0_i+16>>2]|0;if(($179|0)==0){label=30;break}else{$185=$179;label=31;break};case 30:$183=HEAP32[$t_0_i+20>>2]|0;if(($183|0)==0){label=32;break}else{$185=$183;label=31;break};case 31:$189=(HEAP32[$185+4>>2]&-8)-$8|0;$190=$189>>>0<$rsize_0_i>>>0;$t_0_i=$185;$v_0_i=$190?$185:$v_0_i;$rsize_0_i=$190?$189:$rsize_0_i;label=29;break;case 32:$192=$v_0_i;$193=HEAP32[7904]|0;if($192>>>0<$193>>>0){label=76;break}else{label=33;break};case 33:$196=$192+$8|0;if($192>>>0<$196>>>0){label=34;break}else{label=76;break};case 34:$201=HEAP32[$v_0_i+24>>2]|0;$203=HEAP32[$v_0_i+12>>2]|0;if(($203|0)==($v_0_i|0)){label=40;break}else{label=35;break};case 35:$207=HEAP32[$v_0_i+8>>2]|0;if($207>>>0<$193>>>0){label=39;break}else{label=36;break};case 36:$211=$207+12|0;if((HEAP32[$211>>2]|0)==($v_0_i|0)){label=37;break}else{label=39;break};case 37:$215=$203+8|0;if((HEAP32[$215>>2]|0)==($v_0_i|0)){label=38;break}else{label=39;break};case 38:HEAP32[$211>>2]=$203;HEAP32[$215>>2]=$207;$R_1_i=$203;label=47;break;case 39:_abort();return 0;return 0;case 40:$220=$v_0_i+20|0;$221=HEAP32[$220>>2]|0;if(($221|0)==0){label=41;break}else{$R_0_i=$221;$RP_0_i=$220;label=42;break};case 41:$224=$v_0_i+16|0;$225=HEAP32[$224>>2]|0;if(($225|0)==0){$R_1_i=0;label=47;break}else{$R_0_i=$225;$RP_0_i=$224;label=42;break};case 42:$227=$R_0_i+20|0;$228=HEAP32[$227>>2]|0;if(($228|0)==0){label=43;break}else{$R_0_i=$228;$RP_0_i=$227;label=42;break};case 43:$231=$R_0_i+16|0;$232=HEAP32[$231>>2]|0;if(($232|0)==0){label=44;break}else{$R_0_i=$232;$RP_0_i=$231;label=42;break};case 44:if($RP_0_i>>>0<$193>>>0){label=46;break}else{label=45;break};case 45:HEAP32[$RP_0_i>>2]=0;$R_1_i=$R_0_i;label=47;break;case 46:_abort();return 0;return 0;case 47:if(($201|0)==0){label=67;break}else{label=48;break};case 48:$242=$v_0_i+28|0;$244=31904+(HEAP32[$242>>2]<<2)|0;if(($v_0_i|0)==(HEAP32[$244>>2]|0)){label=49;break}else{label=51;break};case 49:HEAP32[$244>>2]=$R_1_i;if(($R_1_i|0)==0){label=50;break}else{label=57;break};case 50:HEAP32[7901]=HEAP32[7901]&~(1<<HEAP32[$242>>2]);label=67;break;case 51:if($201>>>0<(HEAP32[7904]|0)>>>0){label=55;break}else{label=52;break};case 52:$258=$201+16|0;if((HEAP32[$258>>2]|0)==($v_0_i|0)){label=53;break}else{label=54;break};case 53:HEAP32[$258>>2]=$R_1_i;label=56;break;case 54:HEAP32[$201+20>>2]=$R_1_i;label=56;break;case 55:_abort();return 0;return 0;case 56:if(($R_1_i|0)==0){label=67;break}else{label=57;break};case 57:if($R_1_i>>>0<(HEAP32[7904]|0)>>>0){label=66;break}else{label=58;break};case 58:HEAP32[$R_1_i+24>>2]=$201;$274=HEAP32[$v_0_i+16>>2]|0;if(($274|0)==0){label=62;break}else{label=59;break};case 59:if($274>>>0<(HEAP32[7904]|0)>>>0){label=61;break}else{label=60;break};case 60:HEAP32[$R_1_i+16>>2]=$274;HEAP32[$274+24>>2]=$R_1_i;label=62;break;case 61:_abort();return 0;return 0;case 62:$286=HEAP32[$v_0_i+20>>2]|0;if(($286|0)==0){label=67;break}else{label=63;break};case 63:if($286>>>0<(HEAP32[7904]|0)>>>0){label=65;break}else{label=64;break};case 64:HEAP32[$R_1_i+20>>2]=$286;HEAP32[$286+24>>2]=$R_1_i;label=67;break;case 65:_abort();return 0;return 0;case 66:_abort();return 0;return 0;case 67:if($rsize_0_i>>>0<16){label=68;break}else{label=69;break};case 68:$300=$rsize_0_i+$8|0;HEAP32[$v_0_i+4>>2]=$300|3;$304=$192+($300+4)|0;HEAP32[$304>>2]=HEAP32[$304>>2]|1;label=77;break;case 69:HEAP32[$v_0_i+4>>2]=$8|3;HEAP32[$192+($8|4)>>2]=$rsize_0_i|1;HEAP32[$192+($rsize_0_i+$8)>>2]=$rsize_0_i;$315=HEAP32[7902]|0;if(($315|0)==0){label=75;break}else{label=70;break};case 70:$318=HEAP32[7905]|0;$319=$315>>>3;$320=$319<<1;$322=31640+($320<<2)|0;$323=HEAP32[7900]|0;$324=1<<$319;if(($323&$324|0)==0){label=71;break}else{label=72;break};case 71:HEAP32[7900]=$323|$324;$F1_0_i=$322;$_pre_phi_i=31640+($320+2<<2)|0;label=74;break;case 72:$330=31640+($320+2<<2)|0;$331=HEAP32[$330>>2]|0;if($331>>>0<(HEAP32[7904]|0)>>>0){label=73;break}else{$F1_0_i=$331;$_pre_phi_i=$330;label=74;break};case 73:_abort();return 0;return 0;case 74:HEAP32[$_pre_phi_i>>2]=$318;HEAP32[$F1_0_i+12>>2]=$318;HEAP32[$318+8>>2]=$F1_0_i;HEAP32[$318+12>>2]=$322;label=75;break;case 75:HEAP32[7902]=$rsize_0_i;HEAP32[7905]=$196;label=77;break;case 76:_abort();return 0;return 0;case 77:$342=$v_0_i+8|0;if(($342|0)==0){$nb_0=$8;label=160;break}else{$mem_0=$342;label=341;break};case 78:if($bytes>>>0>4294967231){$nb_0=-1;label=160;break}else{label=79;break};case 79:$348=$bytes+11|0;$349=$348&-8;$350=HEAP32[7901]|0;if(($350|0)==0){$nb_0=$349;label=160;break}else{label=80;break};case 80:$353=-$349|0;$354=$348>>>8;if(($354|0)==0){$idx_0_i=0;label=83;break}else{label=81;break};case 81:if($349>>>0>16777215){$idx_0_i=31;label=83;break}else{label=82;break};case 82:$361=($354+1048320|0)>>>16&8;$362=$354<<$361;$365=($362+520192|0)>>>16&4;$367=$362<<$365;$370=($367+245760|0)>>>16&2;$375=14-($365|$361|$370)+($367<<$370>>>15)|0;$idx_0_i=$349>>>(($375+7|0)>>>0)&1|$375<<1;label=83;break;case 83:$383=HEAP32[31904+($idx_0_i<<2)>>2]|0;if(($383|0)==0){$v_2_i=0;$rsize_2_i=$353;$t_1_i=0;label=90;break}else{label=84;break};case 84:if(($idx_0_i|0)==31){$391=0;label=86;break}else{label=85;break};case 85:$391=25-($idx_0_i>>>1)|0;label=86;break;case 86:$v_0_i118=0;$rsize_0_i117=$353;$t_0_i116=$383;$sizebits_0_i=$349<<$391;$rst_0_i=0;label=87;break;case 87:$396=HEAP32[$t_0_i116+4>>2]&-8;$397=$396-$349|0;if($397>>>0<$rsize_0_i117>>>0){label=88;break}else{$v_1_i=$v_0_i118;$rsize_1_i=$rsize_0_i117;label=89;break};case 88:if(($396|0)==($349|0)){$v_2_i=$t_0_i116;$rsize_2_i=$397;$t_1_i=$t_0_i116;label=90;break}else{$v_1_i=$t_0_i116;$rsize_1_i=$397;label=89;break};case 89:$403=HEAP32[$t_0_i116+20>>2]|0;$406=HEAP32[$t_0_i116+16+($sizebits_0_i>>>31<<2)>>2]|0;$rst_1_i=($403|0)==0|($403|0)==($406|0)?$rst_0_i:$403;if(($406|0)==0){$v_2_i=$v_1_i;$rsize_2_i=$rsize_1_i;$t_1_i=$rst_1_i;label=90;break}else{$v_0_i118=$v_1_i;$rsize_0_i117=$rsize_1_i;$t_0_i116=$406;$sizebits_0_i=$sizebits_0_i<<1;$rst_0_i=$rst_1_i;label=87;break};case 90:if(($t_1_i|0)==0&($v_2_i|0)==0){label=91;break}else{$t_2_ph_i=$t_1_i;label=93;break};case 91:$414=2<<$idx_0_i;$417=$350&($414|-$414);if(($417|0)==0){$nb_0=$349;label=160;break}else{label=92;break};case 92:$422=($417&-$417)-1|0;$424=$422>>>12&16;$425=$422>>>($424>>>0);$427=$425>>>5&8;$429=$425>>>($427>>>0);$431=$429>>>2&4;$433=$429>>>($431>>>0);$435=$433>>>1&2;$437=$433>>>($435>>>0);$439=$437>>>1&1;$t_2_ph_i=HEAP32[31904+(($427|$424|$431|$435|$439)+($437>>>($439>>>0))<<2)>>2]|0;label=93;break;case 93:if(($t_2_ph_i|0)==0){$rsize_3_lcssa_i=$rsize_2_i;$v_3_lcssa_i=$v_2_i;label=96;break}else{$t_228_i=$t_2_ph_i;$rsize_329_i=$rsize_2_i;$v_330_i=$v_2_i;label=94;break};case 94:$449=(HEAP32[$t_228_i+4>>2]&-8)-$349|0;$450=$449>>>0<$rsize_329_i>>>0;$_rsize_3_i=$450?$449:$rsize_329_i;$t_2_v_3_i=$450?$t_228_i:$v_330_i;$452=HEAP32[$t_228_i+16>>2]|0;if(($452|0)==0){label=95;break}else{$t_228_i=$452;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 95:$455=HEAP32[$t_228_i+20>>2]|0;if(($455|0)==0){$rsize_3_lcssa_i=$_rsize_3_i;$v_3_lcssa_i=$t_2_v_3_i;label=96;break}else{$t_228_i=$455;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 96:if(($v_3_lcssa_i|0)==0){$nb_0=$349;label=160;break}else{label=97;break};case 97:if($rsize_3_lcssa_i>>>0<((HEAP32[7902]|0)-$349|0)>>>0){label=98;break}else{$nb_0=$349;label=160;break};case 98:$463=$v_3_lcssa_i;$464=HEAP32[7904]|0;if($463>>>0<$464>>>0){label=158;break}else{label=99;break};case 99:$467=$463+$349|0;$468=$467;if($463>>>0<$467>>>0){label=100;break}else{label=158;break};case 100:$472=HEAP32[$v_3_lcssa_i+24>>2]|0;$474=HEAP32[$v_3_lcssa_i+12>>2]|0;if(($474|0)==($v_3_lcssa_i|0)){label=106;break}else{label=101;break};case 101:$478=HEAP32[$v_3_lcssa_i+8>>2]|0;if($478>>>0<$464>>>0){label=105;break}else{label=102;break};case 102:$482=$478+12|0;if((HEAP32[$482>>2]|0)==($v_3_lcssa_i|0)){label=103;break}else{label=105;break};case 103:$486=$474+8|0;if((HEAP32[$486>>2]|0)==($v_3_lcssa_i|0)){label=104;break}else{label=105;break};case 104:HEAP32[$482>>2]=$474;HEAP32[$486>>2]=$478;$R_1_i122=$474;label=113;break;case 105:_abort();return 0;return 0;case 106:$491=$v_3_lcssa_i+20|0;$492=HEAP32[$491>>2]|0;if(($492|0)==0){label=107;break}else{$R_0_i120=$492;$RP_0_i119=$491;label=108;break};case 107:$495=$v_3_lcssa_i+16|0;$496=HEAP32[$495>>2]|0;if(($496|0)==0){$R_1_i122=0;label=113;break}else{$R_0_i120=$496;$RP_0_i119=$495;label=108;break};case 108:$498=$R_0_i120+20|0;$499=HEAP32[$498>>2]|0;if(($499|0)==0){label=109;break}else{$R_0_i120=$499;$RP_0_i119=$498;label=108;break};case 109:$502=$R_0_i120+16|0;$503=HEAP32[$502>>2]|0;if(($503|0)==0){label=110;break}else{$R_0_i120=$503;$RP_0_i119=$502;label=108;break};case 110:if($RP_0_i119>>>0<$464>>>0){label=112;break}else{label=111;break};case 111:HEAP32[$RP_0_i119>>2]=0;$R_1_i122=$R_0_i120;label=113;break;case 112:_abort();return 0;return 0;case 113:if(($472|0)==0){label=133;break}else{label=114;break};case 114:$513=$v_3_lcssa_i+28|0;$515=31904+(HEAP32[$513>>2]<<2)|0;if(($v_3_lcssa_i|0)==(HEAP32[$515>>2]|0)){label=115;break}else{label=117;break};case 115:HEAP32[$515>>2]=$R_1_i122;if(($R_1_i122|0)==0){label=116;break}else{label=123;break};case 116:HEAP32[7901]=HEAP32[7901]&~(1<<HEAP32[$513>>2]);label=133;break;case 117:if($472>>>0<(HEAP32[7904]|0)>>>0){label=121;break}else{label=118;break};case 118:$529=$472+16|0;if((HEAP32[$529>>2]|0)==($v_3_lcssa_i|0)){label=119;break}else{label=120;break};case 119:HEAP32[$529>>2]=$R_1_i122;label=122;break;case 120:HEAP32[$472+20>>2]=$R_1_i122;label=122;break;case 121:_abort();return 0;return 0;case 122:if(($R_1_i122|0)==0){label=133;break}else{label=123;break};case 123:if($R_1_i122>>>0<(HEAP32[7904]|0)>>>0){label=132;break}else{label=124;break};case 124:HEAP32[$R_1_i122+24>>2]=$472;$545=HEAP32[$v_3_lcssa_i+16>>2]|0;if(($545|0)==0){label=128;break}else{label=125;break};case 125:if($545>>>0<(HEAP32[7904]|0)>>>0){label=127;break}else{label=126;break};case 126:HEAP32[$R_1_i122+16>>2]=$545;HEAP32[$545+24>>2]=$R_1_i122;label=128;break;case 127:_abort();return 0;return 0;case 128:$557=HEAP32[$v_3_lcssa_i+20>>2]|0;if(($557|0)==0){label=133;break}else{label=129;break};case 129:if($557>>>0<(HEAP32[7904]|0)>>>0){label=131;break}else{label=130;break};case 130:HEAP32[$R_1_i122+20>>2]=$557;HEAP32[$557+24>>2]=$R_1_i122;label=133;break;case 131:_abort();return 0;return 0;case 132:_abort();return 0;return 0;case 133:if($rsize_3_lcssa_i>>>0<16){label=134;break}else{label=135;break};case 134:$571=$rsize_3_lcssa_i+$349|0;HEAP32[$v_3_lcssa_i+4>>2]=$571|3;$575=$463+($571+4)|0;HEAP32[$575>>2]=HEAP32[$575>>2]|1;label=159;break;case 135:HEAP32[$v_3_lcssa_i+4>>2]=$349|3;HEAP32[$463+($349|4)>>2]=$rsize_3_lcssa_i|1;HEAP32[$463+($rsize_3_lcssa_i+$349)>>2]=$rsize_3_lcssa_i;$586=$rsize_3_lcssa_i>>>3;if($rsize_3_lcssa_i>>>0<256){label=136;break}else{label=141;break};case 136:$589=$586<<1;$591=31640+($589<<2)|0;$592=HEAP32[7900]|0;$593=1<<$586;if(($592&$593|0)==0){label=137;break}else{label=138;break};case 137:HEAP32[7900]=$592|$593;$F5_0_i=$591;$_pre_phi_i128=31640+($589+2<<2)|0;label=140;break;case 138:$599=31640+($589+2<<2)|0;$600=HEAP32[$599>>2]|0;if($600>>>0<(HEAP32[7904]|0)>>>0){label=139;break}else{$F5_0_i=$600;$_pre_phi_i128=$599;label=140;break};case 139:_abort();return 0;return 0;case 140:HEAP32[$_pre_phi_i128>>2]=$468;HEAP32[$F5_0_i+12>>2]=$468;HEAP32[$463+($349+8)>>2]=$F5_0_i;HEAP32[$463+($349+12)>>2]=$591;label=159;break;case 141:$612=$467;$613=$rsize_3_lcssa_i>>>8;if(($613|0)==0){$I7_0_i=0;label=144;break}else{label=142;break};case 142:if($rsize_3_lcssa_i>>>0>16777215){$I7_0_i=31;label=144;break}else{label=143;break};case 143:$620=($613+1048320|0)>>>16&8;$621=$613<<$620;$624=($621+520192|0)>>>16&4;$626=$621<<$624;$629=($626+245760|0)>>>16&2;$634=14-($624|$620|$629)+($626<<$629>>>15)|0;$I7_0_i=$rsize_3_lcssa_i>>>(($634+7|0)>>>0)&1|$634<<1;label=144;break;case 144:$641=31904+($I7_0_i<<2)|0;HEAP32[$463+($349+28)>>2]=$I7_0_i;HEAP32[$463+($349+20)>>2]=0;HEAP32[$463+($349+16)>>2]=0;$648=HEAP32[7901]|0;$649=1<<$I7_0_i;if(($648&$649|0)==0){label=145;break}else{label=146;break};case 145:HEAP32[7901]=$648|$649;HEAP32[$641>>2]=$612;HEAP32[$463+($349+24)>>2]=$641;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 146:if(($I7_0_i|0)==31){$668=0;label=148;break}else{label=147;break};case 147:$668=25-($I7_0_i>>>1)|0;label=148;break;case 148:$K12_0_i=$rsize_3_lcssa_i<<$668;$T_0_i=HEAP32[$641>>2]|0;label=149;break;case 149:if((HEAP32[$T_0_i+4>>2]&-8|0)==($rsize_3_lcssa_i|0)){label=154;break}else{label=150;break};case 150:$677=$T_0_i+16+($K12_0_i>>>31<<2)|0;$678=HEAP32[$677>>2]|0;if(($678|0)==0){label=151;break}else{$K12_0_i=$K12_0_i<<1;$T_0_i=$678;label=149;break};case 151:if($677>>>0<(HEAP32[7904]|0)>>>0){label=153;break}else{label=152;break};case 152:HEAP32[$677>>2]=$612;HEAP32[$463+($349+24)>>2]=$T_0_i;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 153:_abort();return 0;return 0;case 154:$694=$T_0_i+8|0;$695=HEAP32[$694>>2]|0;$697=HEAP32[7904]|0;if($T_0_i>>>0<$697>>>0){label=157;break}else{label=155;break};case 155:if($695>>>0<$697>>>0){label=157;break}else{label=156;break};case 156:HEAP32[$695+12>>2]=$612;HEAP32[$694>>2]=$612;HEAP32[$463+($349+8)>>2]=$695;HEAP32[$463+($349+12)>>2]=$T_0_i;HEAP32[$463+($349+24)>>2]=0;label=159;break;case 157:_abort();return 0;return 0;case 158:_abort();return 0;return 0;case 159:$711=$v_3_lcssa_i+8|0;if(($711|0)==0){$nb_0=$349;label=160;break}else{$mem_0=$711;label=341;break};case 160:$714=HEAP32[7902]|0;if($nb_0>>>0>$714>>>0){label=165;break}else{label=161;break};case 161:$717=$714-$nb_0|0;$718=HEAP32[7905]|0;if($717>>>0>15){label=162;break}else{label=163;break};case 162:$721=$718;HEAP32[7905]=$721+$nb_0;HEAP32[7902]=$717;HEAP32[$721+($nb_0+4)>>2]=$717|1;HEAP32[$721+$714>>2]=$717;HEAP32[$718+4>>2]=$nb_0|3;label=164;break;case 163:HEAP32[7902]=0;HEAP32[7905]=0;HEAP32[$718+4>>2]=$714|3;$736=$718+($714+4)|0;HEAP32[$736>>2]=HEAP32[$736>>2]|1;label=164;break;case 164:$mem_0=$718+8|0;label=341;break;case 165:$743=HEAP32[7903]|0;if($nb_0>>>0<$743>>>0){label=166;break}else{label=167;break};case 166:$746=$743-$nb_0|0;HEAP32[7903]=$746;$747=HEAP32[7906]|0;$748=$747;HEAP32[7906]=$748+$nb_0;HEAP32[$748+($nb_0+4)>>2]=$746|1;HEAP32[$747+4>>2]=$nb_0|3;$mem_0=$747+8|0;label=341;break;case 167:if((HEAP32[7888]|0)==0){label=168;break}else{label=171;break};case 168:$762=_sysconf(8)|0;if(($762-1&$762|0)==0){label=170;break}else{label=169;break};case 169:_abort();return 0;return 0;case 170:HEAP32[7890]=$762;HEAP32[7889]=$762;HEAP32[7891]=-1;HEAP32[7892]=2097152;HEAP32[7893]=0;HEAP32[8011]=0;HEAP32[7888]=(_time(0)|0)&-16^1431655768;label=171;break;case 171:$772=HEAP32[7890]|0;$773=$nb_0+47|0;$774=$772+$773|0;$775=-$772|0;$776=$774&$775;if($776>>>0>$nb_0>>>0){label=172;break}else{$mem_0=0;label=341;break};case 172:$779=HEAP32[8010]|0;if(($779|0)==0){label=174;break}else{label=173;break};case 173:$782=HEAP32[8008]|0;$783=$782+$776|0;if($783>>>0<=$782>>>0|$783>>>0>$779>>>0){$mem_0=0;label=341;break}else{label=174;break};case 174:if((HEAP32[8011]&4|0)==0){label=175;break}else{$tsize_1_i=0;label=198;break};case 175:$791=HEAP32[7906]|0;if(($791|0)==0){label=181;break}else{label=176;break};case 176:$794=$791;$sp_0_i_i=32048;label=177;break;case 177:$796=$sp_0_i_i|0;$797=HEAP32[$796>>2]|0;if($797>>>0>$794>>>0){label=179;break}else{label=178;break};case 178:$800=$sp_0_i_i+4|0;if(($797+(HEAP32[$800>>2]|0)|0)>>>0>$794>>>0){label=180;break}else{label=179;break};case 179:$806=HEAP32[$sp_0_i_i+8>>2]|0;if(($806|0)==0){label=181;break}else{$sp_0_i_i=$806;label=177;break};case 180:if(($sp_0_i_i|0)==0){label=181;break}else{label=188;break};case 181:$809=_sbrk(0)|0;if(($809|0)==-1){$tsize_0303639_i=0;label=197;break}else{label=182;break};case 182:$812=$809;$813=HEAP32[7889]|0;$814=$813-1|0;if(($814&$812|0)==0){$ssize_0_i=$776;label=184;break}else{label=183;break};case 183:$ssize_0_i=$776-$812+($814+$812&-$813)|0;label=184;break;case 184:$824=HEAP32[8008]|0;$825=$824+$ssize_0_i|0;if($ssize_0_i>>>0>$nb_0>>>0&$ssize_0_i>>>0<2147483647){label=185;break}else{$tsize_0303639_i=0;label=197;break};case 185:$829=HEAP32[8010]|0;if(($829|0)==0){label=187;break}else{label=186;break};case 186:if($825>>>0<=$824>>>0|$825>>>0>$829>>>0){$tsize_0303639_i=0;label=197;break}else{label=187;break};case 187:$835=_sbrk($ssize_0_i|0)|0;$836=($835|0)==($809|0);$tbase_0_i=$836?$809:-1;$tsize_0_i=$836?$ssize_0_i:0;$br_0_i=$835;$ssize_1_i=$ssize_0_i;label=190;break;case 188:$840=$774-(HEAP32[7903]|0)&$775;if($840>>>0<2147483647){label=189;break}else{$tsize_0303639_i=0;label=197;break};case 189:$843=_sbrk($840|0)|0;$847=($843|0)==((HEAP32[$796>>2]|0)+(HEAP32[$800>>2]|0)|0);$tbase_0_i=$847?$843:-1;$tsize_0_i=$847?$840:0;$br_0_i=$843;$ssize_1_i=$840;label=190;break;case 190:if(($tbase_0_i|0)==-1){label=191;break}else{$tsize_244_i=$tsize_0_i;$tbase_245_i=$tbase_0_i;label=201;break};case 191:if(($br_0_i|0)!=-1&$ssize_1_i>>>0<2147483647&$ssize_1_i>>>0<($nb_0+48|0)>>>0){label=192;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 192:$856=HEAP32[7890]|0;$860=$773-$ssize_1_i+$856&-$856;if($860>>>0<2147483647){label=193;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 193:if((_sbrk($860|0)|0)==-1){label=195;break}else{label=194;break};case 194:$ssize_2_i=$860+$ssize_1_i|0;label=196;break;case 195:_sbrk(-$ssize_1_i|0)|0;$tsize_0303639_i=$tsize_0_i;label=197;break;case 196:if(($br_0_i|0)==-1){$tsize_0303639_i=$tsize_0_i;label=197;break}else{$tsize_244_i=$ssize_2_i;$tbase_245_i=$br_0_i;label=201;break};case 197:HEAP32[8011]=HEAP32[8011]|4;$tsize_1_i=$tsize_0303639_i;label=198;break;case 198:if($776>>>0<2147483647){label=199;break}else{label=340;break};case 199:$876=_sbrk($776|0)|0;$877=_sbrk(0)|0;if(($877|0)!=-1&($876|0)!=-1&$876>>>0<$877>>>0){label=200;break}else{label=340;break};case 200:$881=$877-$876|0;$883=$881>>>0>($nb_0+40|0)>>>0;$_tbase_1_i=$883?$876:-1;if(($_tbase_1_i|0)==-1){label=340;break}else{$tsize_244_i=$883?$881:$tsize_1_i;$tbase_245_i=$_tbase_1_i;label=201;break};case 201:$886=(HEAP32[8008]|0)+$tsize_244_i|0;HEAP32[8008]=$886;if($886>>>0>(HEAP32[8009]|0)>>>0){label=202;break}else{label=203;break};case 202:HEAP32[8009]=$886;label=203;break;case 203:$890=HEAP32[7906]|0;if(($890|0)==0){label=204;break}else{$sp_067_i=32048;label=211;break};case 204:$893=HEAP32[7904]|0;if(($893|0)==0|$tbase_245_i>>>0<$893>>>0){label=205;break}else{label=206;break};case 205:HEAP32[7904]=$tbase_245_i;label=206;break;case 206:HEAP32[8012]=$tbase_245_i;HEAP32[8013]=$tsize_244_i;HEAP32[8015]=0;HEAP32[7909]=HEAP32[7888];HEAP32[7908]=-1;$i_02_i_i=0;label=207;break;case 207:$899=$i_02_i_i<<1;$901=31640+($899<<2)|0;HEAP32[31640+($899+3<<2)>>2]=$901;HEAP32[31640+($899+2<<2)>>2]=$901;$904=$i_02_i_i+1|0;if($904>>>0<32){$i_02_i_i=$904;label=207;break}else{label=208;break};case 208:$908=$tbase_245_i+8|0;if(($908&7|0)==0){$914=0;label=210;break}else{label=209;break};case 209:$914=-$908&7;label=210;break;case 210:$917=$tsize_244_i-40-$914|0;HEAP32[7906]=$tbase_245_i+$914;HEAP32[7903]=$917;HEAP32[$tbase_245_i+($914+4)>>2]=$917|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[7907]=HEAP32[7892];label=338;break;case 211:$925=HEAP32[$sp_067_i>>2]|0;$926=$sp_067_i+4|0;$927=HEAP32[$926>>2]|0;if(($tbase_245_i|0)==($925+$927|0)){label=213;break}else{label=212;break};case 212:$932=HEAP32[$sp_067_i+8>>2]|0;if(($932|0)==0){label=218;break}else{$sp_067_i=$932;label=211;break};case 213:if((HEAP32[$sp_067_i+12>>2]&8|0)==0){label=214;break}else{label=218;break};case 214:$939=$890;if($939>>>0>=$925>>>0&$939>>>0<$tbase_245_i>>>0){label=215;break}else{label=218;break};case 215:HEAP32[$926>>2]=$927+$tsize_244_i;$944=HEAP32[7906]|0;$946=(HEAP32[7903]|0)+$tsize_244_i|0;$947=$944;$949=$944+8|0;if(($949&7|0)==0){$955=0;label=217;break}else{label=216;break};case 216:$955=-$949&7;label=217;break;case 217:$958=$946-$955|0;HEAP32[7906]=$947+$955;HEAP32[7903]=$958;HEAP32[$947+($955+4)>>2]=$958|1;HEAP32[$947+($946+4)>>2]=40;HEAP32[7907]=HEAP32[7892];label=338;break;case 218:if($tbase_245_i>>>0<(HEAP32[7904]|0)>>>0){label=219;break}else{label=220;break};case 219:HEAP32[7904]=$tbase_245_i;label=220;break;case 220:$sp_160_i=32048;label=221;break;case 221:$970=$sp_160_i|0;if((HEAP32[$970>>2]|0)==($tbase_245_i+$tsize_244_i|0)){label=223;break}else{label=222;break};case 222:$975=HEAP32[$sp_160_i+8>>2]|0;if(($975|0)==0){label=304;break}else{$sp_160_i=$975;label=221;break};case 223:if((HEAP32[$sp_160_i+12>>2]&8|0)==0){label=224;break}else{label=304;break};case 224:HEAP32[$970>>2]=$tbase_245_i;$982=$sp_160_i+4|0;HEAP32[$982>>2]=(HEAP32[$982>>2]|0)+$tsize_244_i;$986=$tbase_245_i+8|0;if(($986&7|0)==0){$993=0;label=226;break}else{label=225;break};case 225:$993=-$986&7;label=226;break;case 226:$996=$tbase_245_i+($tsize_244_i+8)|0;if(($996&7|0)==0){$1003=0;label=228;break}else{label=227;break};case 227:$1003=-$996&7;label=228;break;case 228:$1004=$tbase_245_i+($1003+$tsize_244_i)|0;$1005=$1004;$_sum_i21_i=$993+$nb_0|0;$1009=$tbase_245_i+$_sum_i21_i|0;$1010=$1009;$1011=$1004-($tbase_245_i+$993)-$nb_0|0;HEAP32[$tbase_245_i+($993+4)>>2]=$nb_0|3;if(($1005|0)==(HEAP32[7906]|0)){label=229;break}else{label=230;break};case 229:$1019=(HEAP32[7903]|0)+$1011|0;HEAP32[7903]=$1019;HEAP32[7906]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1019|1;label=303;break;case 230:if(($1005|0)==(HEAP32[7905]|0)){label=231;break}else{label=232;break};case 231:$1028=(HEAP32[7902]|0)+$1011|0;HEAP32[7902]=$1028;HEAP32[7905]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1028|1;HEAP32[$tbase_245_i+($1028+$_sum_i21_i)>>2]=$1028;label=303;break;case 232:$_sum2_i23_i=$tsize_244_i+4|0;$1037=HEAP32[$tbase_245_i+($_sum2_i23_i+$1003)>>2]|0;if(($1037&3|0)==1){label=233;break}else{$oldfirst_0_i_i=$1005;$qsize_0_i_i=$1011;label=280;break};case 233:$1041=$1037&-8;$1042=$1037>>>3;if($1037>>>0<256){label=234;break}else{label=246;break};case 234:$1047=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;$1050=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;$1053=31640+($1042<<1<<2)|0;if(($1047|0)==($1053|0)){label=237;break}else{label=235;break};case 235:if($1047>>>0<(HEAP32[7904]|0)>>>0){label=245;break}else{label=236;break};case 236:if((HEAP32[$1047+12>>2]|0)==($1005|0)){label=237;break}else{label=245;break};case 237:if(($1050|0)==($1047|0)){label=238;break}else{label=239;break};case 238:HEAP32[7900]=HEAP32[7900]&~(1<<$1042);label=279;break;case 239:if(($1050|0)==($1053|0)){label=240;break}else{label=241;break};case 240:$_pre_phi57_i_i=$1050+8|0;label=243;break;case 241:if($1050>>>0<(HEAP32[7904]|0)>>>0){label=244;break}else{label=242;break};case 242:$1076=$1050+8|0;if((HEAP32[$1076>>2]|0)==($1005|0)){$_pre_phi57_i_i=$1076;label=243;break}else{label=244;break};case 243:HEAP32[$1047+12>>2]=$1050;HEAP32[$_pre_phi57_i_i>>2]=$1047;label=279;break;case 244:_abort();return 0;return 0;case 245:_abort();return 0;return 0;case 246:$1081=$1004;$1084=HEAP32[$tbase_245_i+(($1003|24)+$tsize_244_i)>>2]|0;$1087=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;if(($1087|0)==($1081|0)){label=252;break}else{label=247;break};case 247:$1092=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;if($1092>>>0<(HEAP32[7904]|0)>>>0){label=251;break}else{label=248;break};case 248:$1097=$1092+12|0;if((HEAP32[$1097>>2]|0)==($1081|0)){label=249;break}else{label=251;break};case 249:$1101=$1087+8|0;if((HEAP32[$1101>>2]|0)==($1081|0)){label=250;break}else{label=251;break};case 250:HEAP32[$1097>>2]=$1087;HEAP32[$1101>>2]=$1092;$R_1_i_i=$1087;label=259;break;case 251:_abort();return 0;return 0;case 252:$_sum67_i_i=$1003|16;$1107=$tbase_245_i+($_sum2_i23_i+$_sum67_i_i)|0;$1108=HEAP32[$1107>>2]|0;if(($1108|0)==0){label=253;break}else{$R_0_i_i=$1108;$RP_0_i_i=$1107;label=254;break};case 253:$1112=$tbase_245_i+($_sum67_i_i+$tsize_244_i)|0;$1113=HEAP32[$1112>>2]|0;if(($1113|0)==0){$R_1_i_i=0;label=259;break}else{$R_0_i_i=$1113;$RP_0_i_i=$1112;label=254;break};case 254:$1115=$R_0_i_i+20|0;$1116=HEAP32[$1115>>2]|0;if(($1116|0)==0){label=255;break}else{$R_0_i_i=$1116;$RP_0_i_i=$1115;label=254;break};case 255:$1119=$R_0_i_i+16|0;$1120=HEAP32[$1119>>2]|0;if(($1120|0)==0){label=256;break}else{$R_0_i_i=$1120;$RP_0_i_i=$1119;label=254;break};case 256:if($RP_0_i_i>>>0<(HEAP32[7904]|0)>>>0){label=258;break}else{label=257;break};case 257:HEAP32[$RP_0_i_i>>2]=0;$R_1_i_i=$R_0_i_i;label=259;break;case 258:_abort();return 0;return 0;case 259:if(($1084|0)==0){label=279;break}else{label=260;break};case 260:$1132=$tbase_245_i+($tsize_244_i+28+$1003)|0;$1134=31904+(HEAP32[$1132>>2]<<2)|0;if(($1081|0)==(HEAP32[$1134>>2]|0)){label=261;break}else{label=263;break};case 261:HEAP32[$1134>>2]=$R_1_i_i;if(($R_1_i_i|0)==0){label=262;break}else{label=269;break};case 262:HEAP32[7901]=HEAP32[7901]&~(1<<HEAP32[$1132>>2]);label=279;break;case 263:if($1084>>>0<(HEAP32[7904]|0)>>>0){label=267;break}else{label=264;break};case 264:$1148=$1084+16|0;if((HEAP32[$1148>>2]|0)==($1081|0)){label=265;break}else{label=266;break};case 265:HEAP32[$1148>>2]=$R_1_i_i;label=268;break;case 266:HEAP32[$1084+20>>2]=$R_1_i_i;label=268;break;case 267:_abort();return 0;return 0;case 268:if(($R_1_i_i|0)==0){label=279;break}else{label=269;break};case 269:if($R_1_i_i>>>0<(HEAP32[7904]|0)>>>0){label=278;break}else{label=270;break};case 270:HEAP32[$R_1_i_i+24>>2]=$1084;$_sum3233_i_i=$1003|16;$1165=HEAP32[$tbase_245_i+($_sum3233_i_i+$tsize_244_i)>>2]|0;if(($1165|0)==0){label=274;break}else{label=271;break};case 271:if($1165>>>0<(HEAP32[7904]|0)>>>0){label=273;break}else{label=272;break};case 272:HEAP32[$R_1_i_i+16>>2]=$1165;HEAP32[$1165+24>>2]=$R_1_i_i;label=274;break;case 273:_abort();return 0;return 0;case 274:$1178=HEAP32[$tbase_245_i+($_sum2_i23_i+$_sum3233_i_i)>>2]|0;if(($1178|0)==0){label=279;break}else{label=275;break};case 275:if($1178>>>0<(HEAP32[7904]|0)>>>0){label=277;break}else{label=276;break};case 276:HEAP32[$R_1_i_i+20>>2]=$1178;HEAP32[$1178+24>>2]=$R_1_i_i;label=279;break;case 277:_abort();return 0;return 0;case 278:_abort();return 0;return 0;case 279:$oldfirst_0_i_i=$tbase_245_i+(($1041|$1003)+$tsize_244_i)|0;$qsize_0_i_i=$1041+$1011|0;label=280;break;case 280:$1194=$oldfirst_0_i_i+4|0;HEAP32[$1194>>2]=HEAP32[$1194>>2]&-2;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$qsize_0_i_i|1;HEAP32[$tbase_245_i+($qsize_0_i_i+$_sum_i21_i)>>2]=$qsize_0_i_i;$1202=$qsize_0_i_i>>>3;if($qsize_0_i_i>>>0<256){label=281;break}else{label=286;break};case 281:$1205=$1202<<1;$1207=31640+($1205<<2)|0;$1208=HEAP32[7900]|0;$1209=1<<$1202;if(($1208&$1209|0)==0){label=282;break}else{label=283;break};case 282:HEAP32[7900]=$1208|$1209;$F4_0_i_i=$1207;$_pre_phi_i25_i=31640+($1205+2<<2)|0;label=285;break;case 283:$1215=31640+($1205+2<<2)|0;$1216=HEAP32[$1215>>2]|0;if($1216>>>0<(HEAP32[7904]|0)>>>0){label=284;break}else{$F4_0_i_i=$1216;$_pre_phi_i25_i=$1215;label=285;break};case 284:_abort();return 0;return 0;case 285:HEAP32[$_pre_phi_i25_i>>2]=$1010;HEAP32[$F4_0_i_i+12>>2]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$F4_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1207;label=303;break;case 286:$1228=$1009;$1229=$qsize_0_i_i>>>8;if(($1229|0)==0){$I7_0_i_i=0;label=289;break}else{label=287;break};case 287:if($qsize_0_i_i>>>0>16777215){$I7_0_i_i=31;label=289;break}else{label=288;break};case 288:$1236=($1229+1048320|0)>>>16&8;$1237=$1229<<$1236;$1240=($1237+520192|0)>>>16&4;$1242=$1237<<$1240;$1245=($1242+245760|0)>>>16&2;$1250=14-($1240|$1236|$1245)+($1242<<$1245>>>15)|0;$I7_0_i_i=$qsize_0_i_i>>>(($1250+7|0)>>>0)&1|$1250<<1;label=289;break;case 289:$1257=31904+($I7_0_i_i<<2)|0;HEAP32[$tbase_245_i+($_sum_i21_i+28)>>2]=$I7_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+20)>>2]=0;HEAP32[$tbase_245_i+($_sum_i21_i+16)>>2]=0;$1264=HEAP32[7901]|0;$1265=1<<$I7_0_i_i;if(($1264&$1265|0)==0){label=290;break}else{label=291;break};case 290:HEAP32[7901]=$1264|$1265;HEAP32[$1257>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$1257;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 291:if(($I7_0_i_i|0)==31){$1284=0;label=293;break}else{label=292;break};case 292:$1284=25-($I7_0_i_i>>>1)|0;label=293;break;case 293:$K8_0_i_i=$qsize_0_i_i<<$1284;$T_0_i27_i=HEAP32[$1257>>2]|0;label=294;break;case 294:if((HEAP32[$T_0_i27_i+4>>2]&-8|0)==($qsize_0_i_i|0)){label=299;break}else{label=295;break};case 295:$1293=$T_0_i27_i+16+($K8_0_i_i>>>31<<2)|0;$1294=HEAP32[$1293>>2]|0;if(($1294|0)==0){label=296;break}else{$K8_0_i_i=$K8_0_i_i<<1;$T_0_i27_i=$1294;label=294;break};case 296:if($1293>>>0<(HEAP32[7904]|0)>>>0){label=298;break}else{label=297;break};case 297:HEAP32[$1293>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 298:_abort();return 0;return 0;case 299:$1310=$T_0_i27_i+8|0;$1311=HEAP32[$1310>>2]|0;$1313=HEAP32[7904]|0;if($T_0_i27_i>>>0<$1313>>>0){label=302;break}else{label=300;break};case 300:if($1311>>>0<$1313>>>0){label=302;break}else{label=301;break};case 301:HEAP32[$1311+12>>2]=$1228;HEAP32[$1310>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1311;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=0;label=303;break;case 302:_abort();return 0;return 0;case 303:$mem_0=$tbase_245_i+($993|8)|0;label=341;break;case 304:$1327=$890;$sp_0_i_i_i=32048;label=305;break;case 305:$1330=HEAP32[$sp_0_i_i_i>>2]|0;if($1330>>>0>$1327>>>0){label=307;break}else{label=306;break};case 306:$1334=HEAP32[$sp_0_i_i_i+4>>2]|0;$1335=$1330+$1334|0;if($1335>>>0>$1327>>>0){label=308;break}else{label=307;break};case 307:$sp_0_i_i_i=HEAP32[$sp_0_i_i_i+8>>2]|0;label=305;break;case 308:$1341=$1330+($1334-39)|0;if(($1341&7|0)==0){$1348=0;label=310;break}else{label=309;break};case 309:$1348=-$1341&7;label=310;break;case 310:$1349=$1330+($1334-47+$1348)|0;$1353=$1349>>>0<($890+16|0)>>>0?$1327:$1349;$1354=$1353+8|0;$1358=$tbase_245_i+8|0;if(($1358&7|0)==0){$1364=0;label=312;break}else{label=311;break};case 311:$1364=-$1358&7;label=312;break;case 312:$1367=$tsize_244_i-40-$1364|0;HEAP32[7906]=$tbase_245_i+$1364;HEAP32[7903]=$1367;HEAP32[$tbase_245_i+($1364+4)>>2]=$1367|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[7907]=HEAP32[7892];HEAP32[$1353+4>>2]=27;HEAP32[$1354>>2]=HEAP32[8012];HEAP32[$1354+4>>2]=HEAP32[32052>>2];HEAP32[$1354+8>>2]=HEAP32[32056>>2];HEAP32[$1354+12>>2]=HEAP32[32060>>2];HEAP32[8012]=$tbase_245_i;HEAP32[8013]=$tsize_244_i;HEAP32[8015]=0;HEAP32[8014]=$1354;$1377=$1353+28|0;HEAP32[$1377>>2]=7;if(($1353+32|0)>>>0<$1335>>>0){$1380=$1377;label=313;break}else{label=314;break};case 313:$1381=$1380+4|0;HEAP32[$1381>>2]=7;if(($1380+8|0)>>>0<$1335>>>0){$1380=$1381;label=313;break}else{label=314;break};case 314:if(($1353|0)==($1327|0)){label=338;break}else{label=315;break};case 315:$1389=$1353-$890|0;$1392=$1327+($1389+4)|0;HEAP32[$1392>>2]=HEAP32[$1392>>2]&-2;HEAP32[$890+4>>2]=$1389|1;HEAP32[$1327+$1389>>2]=$1389;$1398=$1389>>>3;if($1389>>>0<256){label=316;break}else{label=321;break};case 316:$1401=$1398<<1;$1403=31640+($1401<<2)|0;$1404=HEAP32[7900]|0;$1405=1<<$1398;if(($1404&$1405|0)==0){label=317;break}else{label=318;break};case 317:HEAP32[7900]=$1404|$1405;$F_0_i_i=$1403;$_pre_phi_i_i=31640+($1401+2<<2)|0;label=320;break;case 318:$1411=31640+($1401+2<<2)|0;$1412=HEAP32[$1411>>2]|0;if($1412>>>0<(HEAP32[7904]|0)>>>0){label=319;break}else{$F_0_i_i=$1412;$_pre_phi_i_i=$1411;label=320;break};case 319:_abort();return 0;return 0;case 320:HEAP32[$_pre_phi_i_i>>2]=$890;HEAP32[$F_0_i_i+12>>2]=$890;HEAP32[$890+8>>2]=$F_0_i_i;HEAP32[$890+12>>2]=$1403;label=338;break;case 321:$1422=$890;$1423=$1389>>>8;if(($1423|0)==0){$I1_0_i_i=0;label=324;break}else{label=322;break};case 322:if($1389>>>0>16777215){$I1_0_i_i=31;label=324;break}else{label=323;break};case 323:$1430=($1423+1048320|0)>>>16&8;$1431=$1423<<$1430;$1434=($1431+520192|0)>>>16&4;$1436=$1431<<$1434;$1439=($1436+245760|0)>>>16&2;$1444=14-($1434|$1430|$1439)+($1436<<$1439>>>15)|0;$I1_0_i_i=$1389>>>(($1444+7|0)>>>0)&1|$1444<<1;label=324;break;case 324:$1451=31904+($I1_0_i_i<<2)|0;HEAP32[$890+28>>2]=$I1_0_i_i;HEAP32[$890+20>>2]=0;HEAP32[$890+16>>2]=0;$1455=HEAP32[7901]|0;$1456=1<<$I1_0_i_i;if(($1455&$1456|0)==0){label=325;break}else{label=326;break};case 325:HEAP32[7901]=$1455|$1456;HEAP32[$1451>>2]=$1422;HEAP32[$890+24>>2]=$1451;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 326:if(($I1_0_i_i|0)==31){$1471=0;label=328;break}else{label=327;break};case 327:$1471=25-($I1_0_i_i>>>1)|0;label=328;break;case 328:$K2_0_i_i=$1389<<$1471;$T_0_i_i=HEAP32[$1451>>2]|0;label=329;break;case 329:if((HEAP32[$T_0_i_i+4>>2]&-8|0)==($1389|0)){label=334;break}else{label=330;break};case 330:$1480=$T_0_i_i+16+($K2_0_i_i>>>31<<2)|0;$1481=HEAP32[$1480>>2]|0;if(($1481|0)==0){label=331;break}else{$K2_0_i_i=$K2_0_i_i<<1;$T_0_i_i=$1481;label=329;break};case 331:if($1480>>>0<(HEAP32[7904]|0)>>>0){label=333;break}else{label=332;break};case 332:HEAP32[$1480>>2]=$1422;HEAP32[$890+24>>2]=$T_0_i_i;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 333:_abort();return 0;return 0;case 334:$1494=$T_0_i_i+8|0;$1495=HEAP32[$1494>>2]|0;$1497=HEAP32[7904]|0;if($T_0_i_i>>>0<$1497>>>0){label=337;break}else{label=335;break};case 335:if($1495>>>0<$1497>>>0){label=337;break}else{label=336;break};case 336:HEAP32[$1495+12>>2]=$1422;HEAP32[$1494>>2]=$1422;HEAP32[$890+8>>2]=$1495;HEAP32[$890+12>>2]=$T_0_i_i;HEAP32[$890+24>>2]=0;label=338;break;case 337:_abort();return 0;return 0;case 338:$1507=HEAP32[7903]|0;if($1507>>>0>$nb_0>>>0){label=339;break}else{label=340;break};case 339:$1510=$1507-$nb_0|0;HEAP32[7903]=$1510;$1511=HEAP32[7906]|0;$1512=$1511;HEAP32[7906]=$1512+$nb_0;HEAP32[$1512+($nb_0+4)>>2]=$1510|1;HEAP32[$1511+4>>2]=$nb_0|3;$mem_0=$1511+8|0;label=341;break;case 340:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=341;break;case 341:return $mem_0|0}return 0}function _free($mem){$mem=$mem|0;var $3=0,$5=0,$10=0,$11=0,$14=0,$15=0,$16=0,$21=0,$_sum233=0,$24=0,$25=0,$26=0,$32=0,$37=0,$40=0,$43=0,$64=0,$_pre_phi307=0,$69=0,$72=0,$75=0,$80=0,$84=0,$88=0,$94=0,$95=0,$99=0,$100=0,$RP_0=0,$R_0=0,$102=0,$103=0,$106=0,$107=0,$R_1=0,$118=0,$120=0,$134=0,$151=0,$164=0,$177=0,$psize_0=0,$p_0=0,$189=0,$193=0,$194=0,$204=0,$220=0,$227=0,$228=0,$233=0,$236=0,$239=0,$262=0,$_pre_phi305=0,$267=0,$270=0,$273=0,$278=0,$283=0,$287=0,$293=0,$294=0,$298=0,$299=0,$RP9_0=0,$R7_0=0,$301=0,$302=0,$305=0,$306=0,$R7_1=0,$318=0,$320=0,$334=0,$351=0,$364=0,$psize_1=0,$390=0,$393=0,$395=0,$396=0,$397=0,$403=0,$404=0,$_pre_phi=0,$F16_0=0,$414=0,$415=0,$422=0,$423=0,$426=0,$428=0,$431=0,$436=0,$I18_0=0,$443=0,$447=0,$448=0,$463=0,$T_0=0,$K19_0=0,$472=0,$473=0,$486=0,$487=0,$489=0,$501=0,$sp_0_in_i=0,$sp_0_i=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){label=142;break}else{label=2;break};case 2:$3=$mem-8|0;$5=HEAP32[7904]|0;if($3>>>0<$5>>>0){label=141;break}else{label=3;break};case 3:$10=HEAP32[$mem-4>>2]|0;$11=$10&3;if(($11|0)==1){label=141;break}else{label=4;break};case 4:$14=$10&-8;$15=$mem+($14-8)|0;$16=$15;if(($10&1|0)==0){label=5;break}else{$p_0=$3;$psize_0=$14;label=56;break};case 5:$21=HEAP32[$3>>2]|0;if(($11|0)==0){label=142;break}else{label=6;break};case 6:$_sum233=-8-$21|0;$24=$mem+$_sum233|0;$25=$24;$26=$21+$14|0;if($24>>>0<$5>>>0){label=141;break}else{label=7;break};case 7:if(($25|0)==(HEAP32[7905]|0)){label=54;break}else{label=8;break};case 8:$32=$21>>>3;if($21>>>0<256){label=9;break}else{label=21;break};case 9:$37=HEAP32[$mem+($_sum233+8)>>2]|0;$40=HEAP32[$mem+($_sum233+12)>>2]|0;$43=31640+($32<<1<<2)|0;if(($37|0)==($43|0)){label=12;break}else{label=10;break};case 10:if($37>>>0<$5>>>0){label=20;break}else{label=11;break};case 11:if((HEAP32[$37+12>>2]|0)==($25|0)){label=12;break}else{label=20;break};case 12:if(($40|0)==($37|0)){label=13;break}else{label=14;break};case 13:HEAP32[7900]=HEAP32[7900]&~(1<<$32);$p_0=$25;$psize_0=$26;label=56;break;case 14:if(($40|0)==($43|0)){label=15;break}else{label=16;break};case 15:$_pre_phi307=$40+8|0;label=18;break;case 16:if($40>>>0<$5>>>0){label=19;break}else{label=17;break};case 17:$64=$40+8|0;if((HEAP32[$64>>2]|0)==($25|0)){$_pre_phi307=$64;label=18;break}else{label=19;break};case 18:HEAP32[$37+12>>2]=$40;HEAP32[$_pre_phi307>>2]=$37;$p_0=$25;$psize_0=$26;label=56;break;case 19:_abort();case 20:_abort();case 21:$69=$24;$72=HEAP32[$mem+($_sum233+24)>>2]|0;$75=HEAP32[$mem+($_sum233+12)>>2]|0;if(($75|0)==($69|0)){label=27;break}else{label=22;break};case 22:$80=HEAP32[$mem+($_sum233+8)>>2]|0;if($80>>>0<$5>>>0){label=26;break}else{label=23;break};case 23:$84=$80+12|0;if((HEAP32[$84>>2]|0)==($69|0)){label=24;break}else{label=26;break};case 24:$88=$75+8|0;if((HEAP32[$88>>2]|0)==($69|0)){label=25;break}else{label=26;break};case 25:HEAP32[$84>>2]=$75;HEAP32[$88>>2]=$80;$R_1=$75;label=34;break;case 26:_abort();case 27:$94=$mem+($_sum233+20)|0;$95=HEAP32[$94>>2]|0;if(($95|0)==0){label=28;break}else{$R_0=$95;$RP_0=$94;label=29;break};case 28:$99=$mem+($_sum233+16)|0;$100=HEAP32[$99>>2]|0;if(($100|0)==0){$R_1=0;label=34;break}else{$R_0=$100;$RP_0=$99;label=29;break};case 29:$102=$R_0+20|0;$103=HEAP32[$102>>2]|0;if(($103|0)==0){label=30;break}else{$R_0=$103;$RP_0=$102;label=29;break};case 30:$106=$R_0+16|0;$107=HEAP32[$106>>2]|0;if(($107|0)==0){label=31;break}else{$R_0=$107;$RP_0=$106;label=29;break};case 31:if($RP_0>>>0<$5>>>0){label=33;break}else{label=32;break};case 32:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=34;break;case 33:_abort();case 34:if(($72|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=35;break};case 35:$118=$mem+($_sum233+28)|0;$120=31904+(HEAP32[$118>>2]<<2)|0;if(($69|0)==(HEAP32[$120>>2]|0)){label=36;break}else{label=38;break};case 36:HEAP32[$120>>2]=$R_1;if(($R_1|0)==0){label=37;break}else{label=44;break};case 37:HEAP32[7901]=HEAP32[7901]&~(1<<HEAP32[$118>>2]);$p_0=$25;$psize_0=$26;label=56;break;case 38:if($72>>>0<(HEAP32[7904]|0)>>>0){label=42;break}else{label=39;break};case 39:$134=$72+16|0;if((HEAP32[$134>>2]|0)==($69|0)){label=40;break}else{label=41;break};case 40:HEAP32[$134>>2]=$R_1;label=43;break;case 41:HEAP32[$72+20>>2]=$R_1;label=43;break;case 42:_abort();case 43:if(($R_1|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=44;break};case 44:if($R_1>>>0<(HEAP32[7904]|0)>>>0){label=53;break}else{label=45;break};case 45:HEAP32[$R_1+24>>2]=$72;$151=HEAP32[$mem+($_sum233+16)>>2]|0;if(($151|0)==0){label=49;break}else{label=46;break};case 46:if($151>>>0<(HEAP32[7904]|0)>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$R_1+16>>2]=$151;HEAP32[$151+24>>2]=$R_1;label=49;break;case 48:_abort();case 49:$164=HEAP32[$mem+($_sum233+20)>>2]|0;if(($164|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=50;break};case 50:if($164>>>0<(HEAP32[7904]|0)>>>0){label=52;break}else{label=51;break};case 51:HEAP32[$R_1+20>>2]=$164;HEAP32[$164+24>>2]=$R_1;$p_0=$25;$psize_0=$26;label=56;break;case 52:_abort();case 53:_abort();case 54:$177=$mem+($14-4)|0;if((HEAP32[$177>>2]&3|0)==3){label=55;break}else{$p_0=$25;$psize_0=$26;label=56;break};case 55:HEAP32[7902]=$26;HEAP32[$177>>2]=HEAP32[$177>>2]&-2;HEAP32[$mem+($_sum233+4)>>2]=$26|1;HEAP32[$15>>2]=$26;label=142;break;case 56:$189=$p_0;if($189>>>0<$15>>>0){label=57;break}else{label=141;break};case 57:$193=$mem+($14-4)|0;$194=HEAP32[$193>>2]|0;if(($194&1|0)==0){label=141;break}else{label=58;break};case 58:if(($194&2|0)==0){label=59;break}else{label=114;break};case 59:if(($16|0)==(HEAP32[7906]|0)){label=60;break}else{label=64;break};case 60:$204=(HEAP32[7903]|0)+$psize_0|0;HEAP32[7903]=$204;HEAP32[7906]=$p_0;HEAP32[$p_0+4>>2]=$204|1;if(($p_0|0)==(HEAP32[7905]|0)){label=61;break}else{label=62;break};case 61:HEAP32[7905]=0;HEAP32[7902]=0;label=62;break;case 62:if($204>>>0>(HEAP32[7907]|0)>>>0){label=63;break}else{label=142;break};case 63:_sys_trim(0)|0;label=142;break;case 64:if(($16|0)==(HEAP32[7905]|0)){label=65;break}else{label=66;break};case 65:$220=(HEAP32[7902]|0)+$psize_0|0;HEAP32[7902]=$220;HEAP32[7905]=$p_0;HEAP32[$p_0+4>>2]=$220|1;HEAP32[$189+$220>>2]=$220;label=142;break;case 66:$227=($194&-8)+$psize_0|0;$228=$194>>>3;if($194>>>0<256){label=67;break}else{label=79;break};case 67:$233=HEAP32[$mem+$14>>2]|0;$236=HEAP32[$mem+($14|4)>>2]|0;$239=31640+($228<<1<<2)|0;if(($233|0)==($239|0)){label=70;break}else{label=68;break};case 68:if($233>>>0<(HEAP32[7904]|0)>>>0){label=78;break}else{label=69;break};case 69:if((HEAP32[$233+12>>2]|0)==($16|0)){label=70;break}else{label=78;break};case 70:if(($236|0)==($233|0)){label=71;break}else{label=72;break};case 71:HEAP32[7900]=HEAP32[7900]&~(1<<$228);label=112;break;case 72:if(($236|0)==($239|0)){label=73;break}else{label=74;break};case 73:$_pre_phi305=$236+8|0;label=76;break;case 74:if($236>>>0<(HEAP32[7904]|0)>>>0){label=77;break}else{label=75;break};case 75:$262=$236+8|0;if((HEAP32[$262>>2]|0)==($16|0)){$_pre_phi305=$262;label=76;break}else{label=77;break};case 76:HEAP32[$233+12>>2]=$236;HEAP32[$_pre_phi305>>2]=$233;label=112;break;case 77:_abort();case 78:_abort();case 79:$267=$15;$270=HEAP32[$mem+($14+16)>>2]|0;$273=HEAP32[$mem+($14|4)>>2]|0;if(($273|0)==($267|0)){label=85;break}else{label=80;break};case 80:$278=HEAP32[$mem+$14>>2]|0;if($278>>>0<(HEAP32[7904]|0)>>>0){label=84;break}else{label=81;break};case 81:$283=$278+12|0;if((HEAP32[$283>>2]|0)==($267|0)){label=82;break}else{label=84;break};case 82:$287=$273+8|0;if((HEAP32[$287>>2]|0)==($267|0)){label=83;break}else{label=84;break};case 83:HEAP32[$283>>2]=$273;HEAP32[$287>>2]=$278;$R7_1=$273;label=92;break;case 84:_abort();case 85:$293=$mem+($14+12)|0;$294=HEAP32[$293>>2]|0;if(($294|0)==0){label=86;break}else{$R7_0=$294;$RP9_0=$293;label=87;break};case 86:$298=$mem+($14+8)|0;$299=HEAP32[$298>>2]|0;if(($299|0)==0){$R7_1=0;label=92;break}else{$R7_0=$299;$RP9_0=$298;label=87;break};case 87:$301=$R7_0+20|0;$302=HEAP32[$301>>2]|0;if(($302|0)==0){label=88;break}else{$R7_0=$302;$RP9_0=$301;label=87;break};case 88:$305=$R7_0+16|0;$306=HEAP32[$305>>2]|0;if(($306|0)==0){label=89;break}else{$R7_0=$306;$RP9_0=$305;label=87;break};case 89:if($RP9_0>>>0<(HEAP32[7904]|0)>>>0){label=91;break}else{label=90;break};case 90:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=92;break;case 91:_abort();case 92:if(($270|0)==0){label=112;break}else{label=93;break};case 93:$318=$mem+($14+20)|0;$320=31904+(HEAP32[$318>>2]<<2)|0;if(($267|0)==(HEAP32[$320>>2]|0)){label=94;break}else{label=96;break};case 94:HEAP32[$320>>2]=$R7_1;if(($R7_1|0)==0){label=95;break}else{label=102;break};case 95:HEAP32[7901]=HEAP32[7901]&~(1<<HEAP32[$318>>2]);label=112;break;case 96:if($270>>>0<(HEAP32[7904]|0)>>>0){label=100;break}else{label=97;break};case 97:$334=$270+16|0;if((HEAP32[$334>>2]|0)==($267|0)){label=98;break}else{label=99;break};case 98:HEAP32[$334>>2]=$R7_1;label=101;break;case 99:HEAP32[$270+20>>2]=$R7_1;label=101;break;case 100:_abort();case 101:if(($R7_1|0)==0){label=112;break}else{label=102;break};case 102:if($R7_1>>>0<(HEAP32[7904]|0)>>>0){label=111;break}else{label=103;break};case 103:HEAP32[$R7_1+24>>2]=$270;$351=HEAP32[$mem+($14+8)>>2]|0;if(($351|0)==0){label=107;break}else{label=104;break};case 104:if($351>>>0<(HEAP32[7904]|0)>>>0){label=106;break}else{label=105;break};case 105:HEAP32[$R7_1+16>>2]=$351;HEAP32[$351+24>>2]=$R7_1;label=107;break;case 106:_abort();case 107:$364=HEAP32[$mem+($14+12)>>2]|0;if(($364|0)==0){label=112;break}else{label=108;break};case 108:if($364>>>0<(HEAP32[7904]|0)>>>0){label=110;break}else{label=109;break};case 109:HEAP32[$R7_1+20>>2]=$364;HEAP32[$364+24>>2]=$R7_1;label=112;break;case 110:_abort();case 111:_abort();case 112:HEAP32[$p_0+4>>2]=$227|1;HEAP32[$189+$227>>2]=$227;if(($p_0|0)==(HEAP32[7905]|0)){label=113;break}else{$psize_1=$227;label=115;break};case 113:HEAP32[7902]=$227;label=142;break;case 114:HEAP32[$193>>2]=$194&-2;HEAP32[$p_0+4>>2]=$psize_0|1;HEAP32[$189+$psize_0>>2]=$psize_0;$psize_1=$psize_0;label=115;break;case 115:$390=$psize_1>>>3;if($psize_1>>>0<256){label=116;break}else{label=121;break};case 116:$393=$390<<1;$395=31640+($393<<2)|0;$396=HEAP32[7900]|0;$397=1<<$390;if(($396&$397|0)==0){label=117;break}else{label=118;break};case 117:HEAP32[7900]=$396|$397;$F16_0=$395;$_pre_phi=31640+($393+2<<2)|0;label=120;break;case 118:$403=31640+($393+2<<2)|0;$404=HEAP32[$403>>2]|0;if($404>>>0<(HEAP32[7904]|0)>>>0){label=119;break}else{$F16_0=$404;$_pre_phi=$403;label=120;break};case 119:_abort();case 120:HEAP32[$_pre_phi>>2]=$p_0;HEAP32[$F16_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$F16_0;HEAP32[$p_0+12>>2]=$395;label=142;break;case 121:$414=$p_0;$415=$psize_1>>>8;if(($415|0)==0){$I18_0=0;label=124;break}else{label=122;break};case 122:if($psize_1>>>0>16777215){$I18_0=31;label=124;break}else{label=123;break};case 123:$422=($415+1048320|0)>>>16&8;$423=$415<<$422;$426=($423+520192|0)>>>16&4;$428=$423<<$426;$431=($428+245760|0)>>>16&2;$436=14-($426|$422|$431)+($428<<$431>>>15)|0;$I18_0=$psize_1>>>(($436+7|0)>>>0)&1|$436<<1;label=124;break;case 124:$443=31904+($I18_0<<2)|0;HEAP32[$p_0+28>>2]=$I18_0;HEAP32[$p_0+20>>2]=0;HEAP32[$p_0+16>>2]=0;$447=HEAP32[7901]|0;$448=1<<$I18_0;if(($447&$448|0)==0){label=125;break}else{label=126;break};case 125:HEAP32[7901]=$447|$448;HEAP32[$443>>2]=$414;HEAP32[$p_0+24>>2]=$443;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 126:if(($I18_0|0)==31){$463=0;label=128;break}else{label=127;break};case 127:$463=25-($I18_0>>>1)|0;label=128;break;case 128:$K19_0=$psize_1<<$463;$T_0=HEAP32[$443>>2]|0;label=129;break;case 129:if((HEAP32[$T_0+4>>2]&-8|0)==($psize_1|0)){label=134;break}else{label=130;break};case 130:$472=$T_0+16+($K19_0>>>31<<2)|0;$473=HEAP32[$472>>2]|0;if(($473|0)==0){label=131;break}else{$K19_0=$K19_0<<1;$T_0=$473;label=129;break};case 131:if($472>>>0<(HEAP32[7904]|0)>>>0){label=133;break}else{label=132;break};case 132:HEAP32[$472>>2]=$414;HEAP32[$p_0+24>>2]=$T_0;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 133:_abort();case 134:$486=$T_0+8|0;$487=HEAP32[$486>>2]|0;$489=HEAP32[7904]|0;if($T_0>>>0<$489>>>0){label=137;break}else{label=135;break};case 135:if($487>>>0<$489>>>0){label=137;break}else{label=136;break};case 136:HEAP32[$487+12>>2]=$414;HEAP32[$486>>2]=$414;HEAP32[$p_0+8>>2]=$487;HEAP32[$p_0+12>>2]=$T_0;HEAP32[$p_0+24>>2]=0;label=138;break;case 137:_abort();case 138:$501=(HEAP32[7908]|0)-1|0;HEAP32[7908]=$501;if(($501|0)==0){$sp_0_in_i=32056;label=139;break}else{label=142;break};case 139:$sp_0_i=HEAP32[$sp_0_in_i>>2]|0;if(($sp_0_i|0)==0){label=140;break}else{$sp_0_in_i=$sp_0_i+8|0;label=139;break};case 140:HEAP32[7908]=-1;label=142;break;case 141:_abort();case 142:return}}function _strtod($string,$endPtr){$string=$string|0;$endPtr=$endPtr|0;var $p_0=0,$6=0,$8=0,$sign_0=0,$p_2=0,$p_3=0,$mantSize_0=0,$decPt_0=0,$13=0,$decPt_1=0,$23=0,$24=0,$mantSize_1=0,$26=0,$fracExp_0=0,$mantSize_2=0,$p_4_lcssa99=0,$mantSize_3_lcssa98=0,$frac1_0_lcssa97=0.0,$frac1_085=0,$mantSize_384=0,$p_483=0,$31=0,$32=0,$p_5=0,$c_0_in=0,$40=0,$41=0,$frac2_078=0,$mantSize_477=0,$p_676=0,$44=0,$45=0,$p_7=0,$c_1_in=0,$53=0,$54=0,$frac1_0_lcssa96=0.0,$frac2_0_lcssa=0.0,$57=0.0,$59=0,$60=0,$expSign_0_ph=0,$p_9_ph=0,$65=0,$67=0,$exp_071=0,$p_970=0,$71=0,$72=0,$73=0,$expSign_1=0,$p_10=0,$exp_1=0,$exp_2=0,$exp_3=0,$exp_566=0,$d_065=0,$dblExp_064=0.0,$dblExp_1=0.0,$88=0,$dblExp_0_lcssa=0.0,$fraction_0=0.0,$p_11=0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=$string;label=2;break;case 2:$6=$p_0+1|0;if((_isspace(HEAP8[$p_0]|0)|0)==0){label=3;break}else{$p_0=$6;label=2;break};case 3:$8=HEAP8[$p_0]|0;if(($8<<24>>24|0)==45){label=4;break}else if(($8<<24>>24|0)==43){label=5;break}else{$p_2=$p_0;$sign_0=0;label=6;break};case 4:$p_2=$6;$sign_0=1;label=6;break;case 5:$p_2=$6;$sign_0=0;label=6;break;case 6:$decPt_0=-1;$mantSize_0=0;$p_3=$p_2;label=7;break;case 7:$13=HEAP8[$p_3]|0;if((($13<<24>>24)-48|0)>>>0<10){$decPt_1=$decPt_0;label=9;break}else{label=8;break};case 8:if($13<<24>>24!=46|($decPt_0|0)>-1){label=10;break}else{$decPt_1=$mantSize_0;label=9;break};case 9:$decPt_0=$decPt_1;$mantSize_0=$mantSize_0+1|0;$p_3=$p_3+1|0;label=7;break;case 10:$23=$p_3+(-$mantSize_0|0)|0;$24=($decPt_0|0)<0;$mantSize_1=(($24^1)<<31>>31)+$mantSize_0|0;$26=($mantSize_1|0)>18;$fracExp_0=($26?-18:-$mantSize_1|0)+($24?$mantSize_0:$decPt_0)|0;$mantSize_2=$26?18:$mantSize_1;if(($mantSize_2|0)==0){$p_11=$string;$fraction_0=0.0;label=37;break}else{label=11;break};case 11:if(($mantSize_2|0)>9){$p_483=$23;$mantSize_384=$mantSize_2;$frac1_085=0;label=15;break}else{label=13;break};case 12:$frac1_0_lcssa97=+($40|0)*1.0e9;$mantSize_3_lcssa98=9;$p_4_lcssa99=$p_5;label=14;break;case 13:if(($mantSize_2|0)>0){$frac1_0_lcssa97=0.0;$mantSize_3_lcssa98=$mantSize_2;$p_4_lcssa99=$23;label=14;break}else{$frac2_0_lcssa=0.0;$frac1_0_lcssa96=0.0;label=22;break};case 14:$p_676=$p_4_lcssa99;$mantSize_477=$mantSize_3_lcssa98;$frac2_078=0;label=18;break;case 15:$31=HEAP8[$p_483]|0;$32=$p_483+1|0;if($31<<24>>24==46){label=16;break}else{$c_0_in=$31;$p_5=$32;label=17;break};case 16:$c_0_in=HEAP8[$32]|0;$p_5=$p_483+2|0;label=17;break;case 17:$40=($frac1_085*10|0)-48+($c_0_in<<24>>24)|0;$41=$mantSize_384-1|0;if(($41|0)>9){$p_483=$p_5;$mantSize_384=$41;$frac1_085=$40;label=15;break}else{label=12;break};case 18:$44=HEAP8[$p_676]|0;$45=$p_676+1|0;if($44<<24>>24==46){label=19;break}else{$c_1_in=$44;$p_7=$45;label=20;break};case 19:$c_1_in=HEAP8[$45]|0;$p_7=$p_676+2|0;label=20;break;case 20:$53=($frac2_078*10|0)-48+($c_1_in<<24>>24)|0;$54=$mantSize_477-1|0;if(($54|0)>0){$p_676=$p_7;$mantSize_477=$54;$frac2_078=$53;label=18;break}else{label=21;break};case 21:$frac2_0_lcssa=+($53|0);$frac1_0_lcssa96=$frac1_0_lcssa97;label=22;break;case 22:$57=$frac1_0_lcssa96+$frac2_0_lcssa;if(($13<<24>>24|0)==69|($13<<24>>24|0)==101){label=23;break}else{$exp_1=0;$p_10=$p_3;$expSign_1=0;label=28;break};case 23:$59=$p_3+1|0;$60=HEAP8[$59]|0;if(($60<<24>>24|0)==45){label=24;break}else if(($60<<24>>24|0)==43){label=25;break}else{$p_9_ph=$59;$expSign_0_ph=0;label=26;break};case 24:$p_9_ph=$p_3+2|0;$expSign_0_ph=1;label=26;break;case 25:$p_9_ph=$p_3+2|0;$expSign_0_ph=0;label=26;break;case 26:$65=HEAP8[$p_9_ph]|0;if((($65<<24>>24)-48|0)>>>0<10){$p_970=$p_9_ph;$exp_071=0;$67=$65;label=27;break}else{$exp_1=0;$p_10=$p_9_ph;$expSign_1=$expSign_0_ph;label=28;break};case 27:$71=($exp_071*10|0)-48+($67<<24>>24)|0;$72=$p_970+1|0;$73=HEAP8[$72]|0;if((($73<<24>>24)-48|0)>>>0<10){$p_970=$72;$exp_071=$71;$67=$73;label=27;break}else{$exp_1=$71;$p_10=$72;$expSign_1=$expSign_0_ph;label=28;break};case 28:$exp_2=$fracExp_0+(($expSign_1|0)==0?$exp_1:-$exp_1|0)|0;$exp_3=($exp_2|0)<0?-$exp_2|0:$exp_2;if(($exp_3|0)>511){label=29;break}else{label=30;break};case 29:HEAP32[(___errno_location()|0)>>2]=34;$dblExp_064=1.0;$d_065=2288;$exp_566=511;label=31;break;case 30:if(($exp_3|0)==0){$dblExp_0_lcssa=1.0;label=34;break}else{$dblExp_064=1.0;$d_065=2288;$exp_566=$exp_3;label=31;break};case 31:if(($exp_566&1|0)==0){$dblExp_1=$dblExp_064;label=33;break}else{label=32;break};case 32:$dblExp_1=$dblExp_064*+HEAPF64[$d_065>>3];label=33;break;case 33:$88=$exp_566>>1;if(($88|0)==0){$dblExp_0_lcssa=$dblExp_1;label=34;break}else{$dblExp_064=$dblExp_1;$d_065=$d_065+8|0;$exp_566=$88;label=31;break};case 34:if(($exp_2|0)>-1){label=36;break}else{label=35;break};case 35:$p_11=$p_10;$fraction_0=$57/$dblExp_0_lcssa;label=37;break;case 36:$p_11=$p_10;$fraction_0=$57*$dblExp_0_lcssa;label=37;break;case 37:if(($endPtr|0)==0){label=39;break}else{label=38;break};case 38:HEAP32[$endPtr>>2]=$p_11;label=39;break;case 39:if(($sign_0|0)==0){$_0=$fraction_0;label=41;break}else{label=40;break};case 40:$_0=-0.0-$fraction_0;label=41;break;case 41:return+$_0}return 0.0}function _atof($str){$str=$str|0;return+(+_strtod($str,0))}function _sys_trim($pad){$pad=$pad|0;var $4=0,$15=0,$19=0,$22=0,$28=0,$29=0,$sp_0_i=0,$32=0,$41=0,$_0_i=0,$48=0,$51=0,$59=0,$60=0,$66=0,$73=0,$75=0,$76=0,$78=0,$85=0,$88=0,$released_2=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[7888]|0)==0){label=2;break}else{label=5;break};case 2:$4=_sysconf(8)|0;if(($4-1&$4|0)==0){label=4;break}else{label=3;break};case 3:_abort();return 0;return 0;case 4:HEAP32[7890]=$4;HEAP32[7889]=$4;HEAP32[7891]=-1;HEAP32[7892]=2097152;HEAP32[7893]=0;HEAP32[8011]=0;HEAP32[7888]=(_time(0)|0)&-16^1431655768;label=5;break;case 5:if($pad>>>0<4294967232){label=6;break}else{$released_2=0;label=21;break};case 6:$15=HEAP32[7906]|0;if(($15|0)==0){$released_2=0;label=21;break}else{label=7;break};case 7:$19=HEAP32[7903]|0;if($19>>>0>($pad+40|0)>>>0){label=8;break}else{label=19;break};case 8:$22=HEAP32[7890]|0;$28=Math_imul((((-40-$pad-1+$19+$22|0)>>>0)/($22>>>0)|0)-1|0,$22)|0;$29=$15;$sp_0_i=32048;label=9;break;case 9:$32=HEAP32[$sp_0_i>>2]|0;if($32>>>0>$29>>>0){label=11;break}else{label=10;break};case 10:if(($32+(HEAP32[$sp_0_i+4>>2]|0)|0)>>>0>$29>>>0){$_0_i=$sp_0_i;label=12;break}else{label=11;break};case 11:$41=HEAP32[$sp_0_i+8>>2]|0;if(($41|0)==0){$_0_i=0;label=12;break}else{$sp_0_i=$41;label=9;break};case 12:if((HEAP32[$_0_i+12>>2]&8|0)==0){label=13;break}else{label=19;break};case 13:$48=_sbrk(0)|0;$51=$_0_i+4|0;if(($48|0)==((HEAP32[$_0_i>>2]|0)+(HEAP32[$51>>2]|0)|0)){label=14;break}else{label=19;break};case 14:$59=_sbrk(-($28>>>0>2147483646?-2147483648-$22|0:$28)|0)|0;$60=_sbrk(0)|0;if(($59|0)!=-1&$60>>>0<$48>>>0){label=15;break}else{label=19;break};case 15:$66=$48-$60|0;if(($48|0)==($60|0)){label=19;break}else{label=16;break};case 16:HEAP32[$51>>2]=(HEAP32[$51>>2]|0)-$66;HEAP32[8008]=(HEAP32[8008]|0)-$66;$73=HEAP32[7906]|0;$75=(HEAP32[7903]|0)-$66|0;$76=$73;$78=$73+8|0;if(($78&7|0)==0){$85=0;label=18;break}else{label=17;break};case 17:$85=-$78&7;label=18;break;case 18:$88=$75-$85|0;HEAP32[7906]=$76+$85;HEAP32[7903]=$88;HEAP32[$76+($85+4)>>2]=$88|1;HEAP32[$76+($75+4)>>2]=40;HEAP32[7907]=HEAP32[7892];$released_2=($48|0)!=($60|0)|0;label=21;break;case 19:if((HEAP32[7903]|0)>>>0>(HEAP32[7907]|0)>>>0){label=20;break}else{$released_2=0;label=21;break};case 20:HEAP32[7907]=-1;$released_2=0;label=21;break;case 21:return $released_2|0}return 0}function _strlen(ptr){ptr=ptr|0;var curr=0;curr=ptr;while(HEAP8[curr]|0){curr=curr+1|0}return curr-ptr|0}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0;ret=dest|0;if((dest&3)==(src&3)){while(dest&3){if((num|0)==0)return ret|0;HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}while((num|0)>=4){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0;num=num-4|0}}while((num|0)>0){HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}return ret|0}function _memmove(dest,src,num){dest=dest|0;src=src|0;num=num|0;if((src|0)<(dest|0)&(dest|0)<(src+num|0)){src=src+num|0;dest=dest+num|0;while((num|0)>0){dest=dest-1|0;src=src-1|0;num=num-1|0;HEAP8[dest]=HEAP8[src]|0}}else{_memcpy(dest,src,num)|0}}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var stop=0,value4=0,stop4=0,unaligned=0;stop=ptr+num|0;if((num|0)>=20){value=value&255;unaligned=ptr&3;value4=value|value<<8|value<<16|value<<24;stop4=stop&~3;if(unaligned){unaligned=ptr+4-unaligned|0;while((ptr|0)<(unaligned|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}while((ptr|0)<(stop4|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(stop|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}function dynCall_viiiii(index,a1,a2,a3,a4,a5){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;FUNCTION_TABLE_viiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0)}function dynCall_fifi(index,a1,a2,a3){index=index|0;a1=a1|0;a2=+a2;a3=a3|0;return+FUNCTION_TABLE_fifi[index&2047](a1|0,+a2,a3|0)}function dynCall_vi(index,a1){index=index|0;a1=a1|0;FUNCTION_TABLE_vi[index&2047](a1|0)}function dynCall_vii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;FUNCTION_TABLE_vii[index&2047](a1|0,a2|0)}function dynCall_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;a10=a10|0;return FUNCTION_TABLE_iiiiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0)|0}function dynCall_ii(index,a1){index=index|0;a1=a1|0;return FUNCTION_TABLE_ii[index&2047](a1|0)|0}function dynCall_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;a10=a10|0;a11=a11|0;return FUNCTION_TABLE_iiiiiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0,a11|0)|0}function dynCall_iiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;a10=a10|0;a11=a11|0;a12=a12|0;a13=a13|0;a14=a14|0;return FUNCTION_TABLE_iiiiiiiiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0,a11|0,a12|0,a13|0,a14|0)|0}function dynCall_iiii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;return FUNCTION_TABLE_iiii[index&2047](a1|0,a2|0,a3|0)|0}function dynCall_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;FUNCTION_TABLE_viiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0)}function dynCall_viiffi(index,a1,a2,a3,a4,a5){index=index|0;a1=a1|0;a2=a2|0;a3=+a3;a4=+a4;a5=a5|0;FUNCTION_TABLE_viiffi[index&2047](a1|0,a2|0,+a3,+a4,a5|0)}function dynCall_iiiiiii(index,a1,a2,a3,a4,a5,a6){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;return FUNCTION_TABLE_iiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0)|0}function dynCall_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;FUNCTION_TABLE_viiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0)}function dynCall_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;FUNCTION_TABLE_viiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0)}function dynCall_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;a10=a10|0;FUNCTION_TABLE_viiiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0)}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&2047](a1|0,a2|0)|0}function dynCall_iiiiii(index,a1,a2,a3,a4,a5){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;return FUNCTION_TABLE_iiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0)|0}function dynCall_iiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;a6=a6|0;a7=a7|0;a8=a8|0;a9=a9|0;return FUNCTION_TABLE_iiiiiiiiii[index&2047](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0)|0}function dynCall_viii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;FUNCTION_TABLE_viii[index&2047](a1|0,a2|0,a3|0)}function dynCall_v(index){index=index|0;FUNCTION_TABLE_v[index&2047]()}function dynCall_viiii(index,a1,a2,a3,a4){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;FUNCTION_TABLE_viiii[index&2047](a1|0,a2|0,a3|0,a4|0)}function b0(p0,p1,p2,p3,p4){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;abort(0)}function b1(p0,p1,p2){p0=p0|0;p1=+p1;p2=p2|0;abort(1);return 0.0}function b2(p0){p0=p0|0;abort(2)}function b3(p0,p1){p0=p0|0;p1=p1|0;abort(3)}function b4(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;p9=p9|0;abort(4);return 0}function b5(p0){p0=p0|0;abort(5);return 0}function b6(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;p9=p9|0;p10=p10|0;abort(6);return 0}function b7(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;p9=p9|0;p10=p10|0;p11=p11|0;p12=p12|0;p13=p13|0;abort(7);return 0}function b8(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(8);return 0}function b9(p0,p1,p2,p3,p4,p5,p6,p7){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;abort(9)}function b10(p0,p1,p2,p3,p4){p0=p0|0;p1=p1|0;p2=+p2;p3=+p3;p4=p4|0;abort(10)}function b11(p0,p1,p2,p3,p4,p5){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;abort(11);return 0}function b12(p0,p1,p2,p3,p4,p5,p6){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;abort(12)}function b13(p0,p1,p2,p3,p4,p5,p6,p7,p8){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;abort(13)}function b14(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;p9=p9|0;abort(14)}function b15(p0,p1){p0=p0|0;p1=p1|0;abort(15);return 0}function b16(p0,p1,p2,p3,p4){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;abort(16);return 0}function b17(p0,p1,p2,p3,p4,p5,p6,p7,p8){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;p5=p5|0;p6=p6|0;p7=p7|0;p8=p8|0;abort(17);return 0}function b18(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(18)}function b19(){abort(19)}function b20(p0,p1,p2,p3){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;abort(20)}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_viiiii = [b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply182,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,_apply166,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,_apply118,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply_hc2r688,b0,b0
  ,b0,b0,b0,_fftw_transpose_tiled,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_dotile
  ,b0,b0,b0,_dobatch_r2hc,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_dotile_buf
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply_op,b0,b0,b0,b0
  ,b0,_apply_hc2r817,b0,b0,b0,_apply_after,b0,b0,b0,_apply701
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply2180,b0,b0
  ,b0,_apply_dit_dft,b0,b0,b0,_dobatch_hc2r,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply776
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply_buf1246,b0,b0
  ,b0,b0,b0,_apply539,b0,b0,b0,b0,b0,b0
  ,b0,_fftw_transpose,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply_dit565,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,_apply_extra_iter1248,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply_dit2143,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply_r2hc_inplace
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply_r2hc867,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply581,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,_apply_dif2144,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply_r2hc816,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,_apply_before,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply_hc2r801
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,_dotile1272,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply648
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_apply1249,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,_fftw_transpose_tiledbuf,b0,b0
  ,b0,b0,b0,b0,b0,_dotile_buf1275,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply_r2hc800,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,_apply_r2hc687,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply154,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,_apply_dif566,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,_apply_r2hc2179,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply887
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,_apply_dif_dft,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,_apply_hc2r868,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0];
  var FUNCTION_TABLE_fifi = [b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_vi = [b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_r2cb_25,b2,b2,b2,_fftw_codelet_r2cfII_32,b2,_fftw_codelet_r2cb_20,b2,_fftw_dft_nop_register
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hc2cb2_32,b2,_destroy744,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_codelet_hc2cbdft_2,b2,_fftw_codelet_hc2cbdft_4,b2,b2
  ,b2,_fftw_codelet_hc2cbdft_6,b2,b2,b2,_fftw_codelet_hc2cbdft_8,b2,b2,b2,_fftw_dht_rader_register
  ,b2,b2,b2,b2,b2,_zero,b2,_fftw_codelet_r2cf_32,b2,b2
  ,b2,b2,b2,_fftw_codelet_hc2cbdft2_16,b2,_fftw_codelet_hc2cb_10,b2,_fftw_codelet_r2cf_64,b2,_fftw_codelet_hc2cb_12
  ,b2,b2,b2,_fftw_codelet_hc2cb_16,b2,b2,b2,_fftw_codelet_n1_14,b2,_fftw_codelet_n1_15
  ,b2,_fftw_codelet_n1_16,b2,_destroy904,b2,_fftw_codelet_n1_10,b2,_fftw_codelet_n1_11,b2,_fftw_codelet_n1_12
  ,b2,_fftw_codelet_n1_13,b2,_fftw_codelet_r2cf_4,b2,_fftw_codelet_r2cf_5,b2,_fftw_codelet_r2cf_6,b2,_fftw_codelet_r2cf_7
  ,b2,_destroy865,b2,_fftw_codelet_r2cf_2,b2,_fftw_codelet_r2cf_3,b2,b2,b2,b2
  ,b2,_fftw_codelet_hc2cb2_4,b2,_fftw_codelet_r2cf_8,b2,_fftw_codelet_r2cf_9,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_t2_10,b2,_fftw_ct_generic_register,b2,_fftw_codelet_hc2cf_32,b2,b2
  ,b2,_fftw_codelet_r2cfII_64,b2,_destroy630,b2,b2,b2,b2,b2,_fftw_reodft11e_radix2_r2hc_register
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hf_32
  ,b2,b2,b2,_fftw_dft_indirect_transpose_register,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_destroy128,b2,_fftw_codelet_r2cb_2,b2,_fftw_codelet_r2cb_3,b2,_fftw_codelet_r2cb_4,b2,_fftw_codelet_r2cb_5
  ,b2,_fftw_codelet_r2cb_6,b2,_fftw_codelet_r2cb_7,b2,_fftw_codelet_r2cb_8,b2,_fftw_codelet_r2cb_9,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cfdft_32,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_destroy1231,b2,b2,b2,_fftw_codelet_t1_15,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_t1_10,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_rdft_nop_register,b2,b2,b2,_destroy1016,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_hc2cbdft2_4,b2,b2,b2,_destroy798,b2,_fftw_codelet_hc2cbdft_20,b2,_fftw_codelet_hb_32
  ,b2,_fftw_rdft_buffered_register,b2,_fftw_codelet_hc2cbdft2_8,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_q1_3,b2,_fftw_codelet_q1_2
  ,b2,b2,b2,_fftw_codelet_q1_6,b2,_fftw_codelet_q1_5,b2,_fftw_codelet_q1_4,b2,b2
  ,b2,_fftw_codelet_q1_8,b2,b2,b2,b2,b2,_destroy954,b2,_fftw_codelet_hc2cfdft2_16
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_rdft_generic_register,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hb2_16,b2,b2,b2,_fftw_codelet_r2cfII_8,b2,_fftw_codelet_r2cfII_9
  ,b2,_fftw_codelet_r2cfII_4,b2,_fftw_codelet_r2cfII_5,b2,_fftw_codelet_r2cfII_6,b2,_fftw_codelet_r2cfII_7,b2,_fftw_codelet_r2cfII_2
  ,b2,_fftw_codelet_r2cfII_3,b2,b2,b2,b2,b2,_destroy2156,b2,b2
  ,b2,b2,b2,b2,b2,_destroy1245,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cf_20,b2,_fftw_codelet_r2cf_128
  ,b2,b2,b2,_fftw_codelet_hc2cb2_20,b2,_fftw_codelet_r2cb_32,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_dft_generic_register,b2,b2
  ,b2,_fftw_rdft2_buffered_register,b2,_fftw_codelet_r2cfII_25,b2,b2,b2,b2,b2,_fftw_codelet_n1_64
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hc2cf_2,b2,b2,b2,_fftw_codelet_hc2cf_6,b2,_fftw_codelet_hc2cf2_16
  ,b2,_fftw_codelet_hc2cf_4,b2,_fftw_codelet_hc2cf_8,b2,_fftw_codelet_r2cb_10,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_codelet_hb_64,b2,b2,b2,b2
  ,b2,b2,b2,_destroy916,b2,_fftw_dft_rader_register,b2,_fftw_rdft2_rdft_register,b2,_fftw_codelet_n1_20
  ,b2,_fftw_codelet_hf2_32,b2,_fftw_codelet_n1_25,b2,_fftw_codelet_r2cb_14,b2,b2,b2,b2
  ,b2,_fftw_codelet_r2cf_12,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cbdft_10
  ,b2,_fftw_codelet_hc2cbdft_12,b2,b2,b2,_fftw_codelet_hc2cbdft_16,b2,_fftw_codelet_r2cb_128,b2,b2
  ,b2,b2,b2,b2,b2,_destroy142,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_dft_r2hc_register,b2,_fftw_codelet_n1_4
  ,b2,_fftw_codelet_r2cfII_16,b2,_fftw_codelet_r2cfII_15,b2,_fftw_codelet_r2cfII_12,b2,_fftw_codelet_r2cfII_10,b2,b2
  ,b2,b2,b2,_destroy99,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_hc2cb_8,b2,_fftw_codelet_hc2cb_6,b2,b2,b2,_fftw_codelet_hc2cb_4,b2,b2
  ,b2,_fftw_codelet_hc2cb_2,b2,b2,b2,_fftw_codelet_hf_20,b2,b2,b2,_fftw_codelet_hf_25
  ,b2,b2,b2,_fftw_codelet_t2_64,b2,b2,b2,_destroy1205,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_codelet_hc2cf2_32,b2,b2,b2,_fftw_reodft11e_r2hc_odd_register
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cb2_8,b2,b2
  ,b2,_destroy1026,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_dft_indirect_register,b2,b2,b2,_fftw_codelet_hc2cb2_16,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_codelet_hc2cf2_8,b2,_destroy814,b2,b2
  ,b2,_destroy764,b2,b2,b2,_fftw_codelet_hb_20,b2,_fftw_codelet_hc2cf2_4,b2,_fftw_codelet_hb2_8
  ,b2,b2,b2,_fftw_codelet_hb2_4,b2,_fftw_codelet_hb2_5,b2,b2,b2,_fftw_codelet_r2cf_16
  ,b2,b2,b2,_fftw_codelet_r2cf_14,b2,_fftw_codelet_r2cf_15,b2,_fftw_codelet_hf2_8,b2,_fftw_codelet_r2cf_13
  ,b2,_fftw_codelet_r2cf_10,b2,_fftw_codelet_r2cf_11,b2,_fftw_codelet_hf2_4,b2,_fftw_codelet_hf2_5,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_destroy712,b2,_fftw_codelet_hc2cfdft_8
  ,b2,b2,b2,_fftw_codelet_hc2cfdft_4,b2,_fftw_codelet_hc2cfdft_6,b2,_fftw_codelet_hc2cb_32,b2,b2
  ,b2,_fftw_codelet_hc2cfdft_2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_destroy108,b2,_destroy967,b2,_destroy885,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cfdft_20,b2,_fftw_codelet_t1_16
  ,b2,b2,b2,b2,b2,_fftw_codelet_t1_12,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_rdft_dht_register,b2,_destroy2168,b2,_fftw_codelet_hf_12
  ,b2,_fftw_codelet_hf_10,b2,_fftw_codelet_hf_16,b2,_fftw_codelet_hf_15,b2,b2,b2,_fftw_rdft2_rank_geq2_register
  ,b2,_fftw_codelet_t1_64,b2,_fftw_codelet_hf_64,b2,_fftw_codelet_r2cfII_20,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cfdft_16,b2,_fftw_codelet_hc2cfdft_10
  ,b2,_fftw_codelet_hc2cfdft_12,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_t2_16,b2,b2
  ,b2,b2,b2,b2,b2,_fftw_rdft_vrank_geq1_register,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_hc2hc_generic_register,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,_destroy1042,b2,b2,b2,b2
  ,b2,_fftw_rodft00e_r2hc_pad_register,b2,_fftw_reodft00e_splitradix_register,b2,b2,b2,_fftw_codelet_hb_15,b2,_fftw_codelet_hb_12
  ,b2,_fftw_codelet_hb_10,b2,b2,b2,_destroy847,b2,b2,b2,b2
  ,b2,_fftw_codelet_hf2_20,b2,_fftw_codelet_n1_32,b2,_fftw_codelet_hf2_25,b2,b2,b2,b2
  ,b2,_fftw_codelet_e10_8,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_t2_32,b2,b2
  ,b2,b2,b2,_destroy2121,b2,_fftw_dft_vrank_geq1_register,b2,b2,b2,_fftw_codelet_hc2cf_16
  ,b2,b2,b2,_fftw_codelet_hc2cf_10,b2,b2,b2,_fftw_codelet_hc2cf_12,b2,b2
  ,b2,_fftw_codelet_hc2cfdft2_32,b2,b2,b2,b2,b2,_destroy564,b2,_fftw_codelet_r2cbIII_20
  ,b2,_fftw_codelet_r2cbIII_25,b2,_destroy942,b2,_fftw_codelet_t1_25,b2,b2,b2,_fftw_codelet_t1_20
  ,b2,b2,b2,b2,b2,_destroy,b2,b2,b2,_destroy2190
  ,b2,_destroy537,b2,_fftw_codelet_hb2_32,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_zero1014,b2,b2
  ,b2,_fftw_rdft2_rank0_register,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_destroy1218,b2,_fftw_dht_r2hc_register,b2,_fftw_codelet_t2_5,b2,_fftw_codelet_t2_4,b2,_unsolvable_destroy
  ,b2,_fftw_codelet_t2_8,b2,_destroy685,b2,_fftw_codelet_hc2cfdft2_8,b2,b2,b2,_fftw_codelet_r2cb_12
  ,b2,_fftw_codelet_r2cb_13,b2,b2,b2,_fftw_codelet_r2cb_11,b2,_fftw_codelet_r2cb_16,b2,_fftw_codelet_hc2cfdft2_4
  ,b2,_fftw_codelet_r2cb_15,b2,b2,b2,_fftw_dft_bluestein_register,b2,_fftw_plan_null_destroy,b2,b2
  ,b2,b2,b2,_fftw_codelet_hc2cbdft2_20,b2,b2,b2,_fftw_dft_buffered_register,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_hc2cf2_20,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hb_16,b2,b2,b2,b2,b2,_fftw_codelet_hb_9
  ,b2,_fftw_codelet_hb_8,b2,_fftw_codelet_hb_7,b2,_fftw_codelet_hb_6,b2,_fftw_codelet_hb_5,b2,_fftw_codelet_hb_4
  ,b2,_fftw_codelet_hb_3,b2,_fftw_codelet_hb_2,b2,b2,b2,_fftw_codelet_e01_8,b2,_fftw_codelet_r2cf_20
  ,b2,_fftw_codelet_r2cf_25,b2,_fftw_codelet_hf_9,b2,_fftw_codelet_hf_8,b2,b2,b2,_fftw_codelet_hf_3
  ,b2,_fftw_codelet_hf_2,b2,b2,b2,_fftw_codelet_hf_7,b2,_fftw_codelet_hc2cb_20,b2,_fftw_codelet_hf_5
  ,b2,_fftw_codelet_hf_4,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,_fftw_rdft_rank_geq2_register,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_destroy180
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_r2cbIII_64
  ,b2,_fftw_rdft2_vrank_geq1_register,b2,b2,b2,_destroy579,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_rdft_vrank3_transpose_register
  ,b2,_destroy2177,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_redft00e_r2hc_pad_register,b2,b2,b2,b2,b2,b2,b2,_destroy981
  ,b2,_fftw_codelet_r2cbIII_10,b2,_fftw_codelet_r2cbIII_12,b2,_fftw_codelet_r2cbIII_15,b2,_fftw_codelet_r2cbIII_16,b2,_destroy699
  ,b2,b2,b2,_fftw_reodft010e_r2hc_register,b2,b2,b2,_unsolvable_zero,b2,b2
  ,b2,_fftw_rdft_indirect_register,b2,_fftw_dft_rank_geq2_register,b2,b2,b2,_fftw_codelet_t1_4,b2,_fftw_codelet_t1_5
  ,b2,_fftw_codelet_t1_6,b2,_fftw_codelet_t1_7,b2,b2,b2,b2,b2,_fftw_codelet_t1_2
  ,b2,_fftw_codelet_t1_3,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_t1_8
  ,b2,_fftw_codelet_t1_9,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_fftw_codelet_hb_25,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_rdft_rank0_register,b2,b2,b2,b2,b2,_fftw_codelet_r2cb_64
  ,b2,b2,b2,_fftw_ct_genericbuf_register,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_n1_6
  ,b2,_fftw_codelet_n1_7,b2,b2,b2,_fftw_codelet_n1_5,b2,_fftw_codelet_n1_2,b2,_fftw_codelet_n1_3
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_n1_8
  ,b2,_fftw_codelet_n1_9,b2,_destroy930,b2,b2,b2,_destroy787,b2,b2
  ,b2,_destroy727,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hf2_16,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_fftw_codelet_hc2cbdft_32,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,_destroy646,b2,b2,b2,b2,b2,_fftw_codelet_r2cbIII_32
  ,b2,_destroy164,b2,_fftw_codelet_t2_20,b2,b2,b2,_fftw_codelet_t2_25,b2,_fftw_codelet_r2cbIII_6
  ,b2,_fftw_codelet_r2cbIII_7,b2,_fftw_codelet_r2cbIII_4,b2,_fftw_codelet_r2cbIII_5,b2,_fftw_codelet_r2cbIII_2,b2,_fftw_codelet_r2cbIII_3
  ,b2,b2,b2,_fftw_codelet_hc2cfdft2_20,b2,_fftw_rdft2_nop_register,b2,b2,b2,_fftw_codelet_r2cbIII_8
  ,b2,_fftw_codelet_r2cbIII_9,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,_zero785,b2,_fftw_codelet_t1_32,b2,b2,b2,b2,b2,_fftw_codelet_hb2_25
  ,b2,_fftw_codelet_hb2_20,b2,_fftw_codelet_hf_6,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_destroy2142
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,_fftw_codelet_hc2cbdft2_32,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_vii = [b3,b3,b3,b3,b3,b3,_print1244,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_awake742,b3,_print127,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake562,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake644,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print1230,b3,b3
  ,b3,_print834,b3,b3,b3,b3,b3,b3,b3,_awake1024
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_awake845,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print864,b3,_print903
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print645,b3,_print2155,b3,b3
  ,b3,b3,b3,_print763,b3,b3,b3,_print884,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,_print2120,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_print163,b3,b3,b3,_awake140,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_fftw_dft_solve,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_apply_dif747,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,_awake965,b3,b3,b3,_print941,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,_print684,b3,b3,b3,b3,b3,b3,b3,_print726
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_print615,b3,_print743,b3,b3,b3,b3
  ,b3,b3,b3,_awake106,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,_print116,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake1040,b3,b3
  ,b3,b3,b3,b3,b3,_awake796,b3,_apply_dit746,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_fftw_null_awake,b3,b3
  ,b3,_awake928,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print578,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_hash,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_print2141,b3,b3,b3,_print711,b3,b3
  ,b3,_awake2119,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_awake1203,b3,b3,b3,_print629,b3,_awake697
  ,b3,b3,b3,b3,b3,_print152,b3,b3,b3,b3
  ,b3,b3,b3,_awake2188,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print1041,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,_awake883
  ,b3,b3,b3,b3,b3,_print,b3,b3,b3,b3
  ,b3,_awake683,b3,b3,b3,_exprt,b3,_awake725,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_print536,b3,b3,b3,b3,b3,b3
  ,b3,_apply2193,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_awake952,b3,b3,b3,b3
  ,b3,_awake614,b3,b3,b3,b3,b3,b3,b3,_hash784
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,_print915
  ,b3,b3,b3,b3,b3,b3,b3,_awake1229,b3,_print992
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_print846,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_unsolvable_print,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print698,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_forget,b3,b3,b3,b3,b3,_awake762
  ,b3,_print107,b3,b3,b3,b3,b3,_awake162,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake628,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake,b3,_print1217
  ,b3,b3,b3,_awake914,b3,b3,b3,_awake710,b3,b3
  ,b3,b3,b3,b3,b3,_print813,b3,b3,b3,b3
  ,b3,b3,b3,_awake535,b3,b3,b3,_print563,b3,_fftw_rdft2_solve
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake863,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print966,b3,b3,b3,b3
  ,b3,b3,b3,_hash1013,b3,b3,b3,b3,b3,_print2176
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print797,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print141,b3,b3
  ,b3,b3,b3,b3,b3,_awake126,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake577,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_awake940,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_fftw_rdft_solve,b3,b3,b3,b3,b3,_awake2140
  ,b3,_awake1216,b3,_print980,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print2189,b3,b3
  ,b3,_unsolvable_hash,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,_register_solver
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,_print774
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print929,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print179,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_awake178,b3,_print1025
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print1204,b3,b3,b3,b3
  ,b3,_awake902,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_awake812,b3,b3,b3,b3
  ,b3,_awake979,b3,b3,b3,_awake115,b3,b3,b3,b3
  ,b3,_apply_buf2192,b3,b3,b3,_print953,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print2167,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,_print786,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,_print1015,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,_print98,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_iiiiiiiiiii = [b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,_okp660,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_ii = [b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,_mkcld_after635,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,_mkcld_before,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,_mkcld_after,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,_mkcld_before636,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5];
  var FUNCTION_TABLE_iiiiiiiiiiii = [b6,b6,b6,b6,b6,b6,b6,b6,_mkcldw2187,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,_mkcldw741,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,_mkcldw2118,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,_okp,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6];
  var FUNCTION_TABLE_iiiiiiiiiiiiiii = [b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,_mkcldw105,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,_mkcldw,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,_mkcldw1228
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,_mkcldw1215,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7];
  var FUNCTION_TABLE_iiii = [b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan862,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan1039,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan161
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan613,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan1243,b8,b8
  ,b8,_mkcldrn_gcd,b8,_mkplan534,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan901,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan991,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan833,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan125,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan151,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan2154,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan978
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,_mkplan1202,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan1023
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,_mkplan114,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan627,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan759,b8,b8,b8,b8,b8,_mkplan939,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,_mkcldrn_cut,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan709,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan844,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan964
  ,b8,_mkplan682,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkcldrn_toms513,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan882,b8,_mkplan927,b8,b8,b8,b8,b8,_mkplan559
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan2175,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan811,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan951,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,_mkplan177,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan2137,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,_mkplan773,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan913,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan696,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,_mkplan576,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan139
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan724,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan795,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,_mkplan2166,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,_mkplan643,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8];
  var FUNCTION_TABLE_viiiiiiii = [b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,_q1_5
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,_q1_4,b9,_q1_6,b9,b9,b9,b9,b9,_q1_3,b9,_q1_2,b9,b9,b9,_q1_8,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9];
  var FUNCTION_TABLE_viiffi = [b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,_rotate_generic
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10
  ,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,_rotate_sqrtn_table,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10,b10];
  var FUNCTION_TABLE_iiiiiii = [b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,_applicable_gcd,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,_applicable_toms513,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,_applicable_cut,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11];
  var FUNCTION_TABLE_viiiiiii = [b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_t1_10,b12,b12,b12,_t1_12,b12,b12
  ,b12,_t1_15,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hb_8
  ,b12,_hb_5,b12,_hb_4,b12,_hb_7,b12,b12,b12,_hf_64
  ,b12,_hb_3,b12,b12,b12,b12,b12,b12,b12,_hf2_16
  ,b12,b12,b12,_hb_64,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,_hb2_4,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hf_9
  ,b12,_hf_8,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,_hf_2,b12,b12,b12,_hf_4,b12,_hf_7,b12,b12
  ,b12,b12,b12,b12,b12,_hb2_5,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_t2_32
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,_hb_6,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,_hf2_8,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hf2_4
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_hb_9,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hf_25
  ,b12,b12,b12,_hf_20,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,_hb_2,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,_hf_3,b12,b12,b12,_hb2_8,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_e01_8
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_hf_6,b12,b12,b12,b12,b12,b12
  ,b12,_hf2_25,b12,b12,b12,_hf2_20,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,_hb2_16,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_hf_32,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_t2_8
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_t2_5
  ,b12,_t2_4,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,_hf_5,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,_t2_10,b12,_t2_16
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hb_20
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,_hf2_32,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hb2_25
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_hb_15,b12,_hb_16,b12,b12,b12,_hb_10
  ,b12,b12,b12,_t1_6,b12,_t1_7,b12,_t1_4,b12,_t1_5
  ,b12,_t1_2,b12,_t1_3,b12,b12,b12,b12,b12,_t1_8
  ,b12,_t1_9,b12,b12,b12,_hb_32,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,_t2_64,b12,b12,b12,b12
  ,b12,b12,b12,_hb2_20,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_t1_32
  ,b12,b12,b12,b12,b12,_t1_25,b12,b12,b12,b12
  ,b12,b12,b12,_t1_20,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_t1_16,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hf2_5
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_t2_25,b12,b12,b12,_t2_20,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_t1_64
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,_hb_12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,_e10_8,b12,b12,b12,_hb2_32,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,_hb_25,b12,b12,b12,_hf_10,b12,_hf_12,b12,_hf_15,b12,b12,b12,_hf_16,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12];
  var FUNCTION_TABLE_viiiiiiiii = [b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_n1_20
  ,b13,b13,b13,_n1_25,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_n1_6,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_fftw_cpy2d_ci,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cbdft2_4,b13,b13,b13,b13,b13,_hc2cbdft2_20
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cf_32
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_fftw_cpy2d_tiledbuf
  ,b13,b13,b13,b13,b13,b13,b13,_n1_12,b13,_n1_13
  ,b13,_n1_10,b13,_n1_11,b13,_n1_16,b13,_n1_14,b13,_n1_15
  ,b13,b13,b13,_hc2cbdft2_8,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cfdft_8,b13,b13,b13,_hc2cfdft_4,b13,_hc2cfdft_2,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cb2_32
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cbdft_16,b13,_hc2cbdft_12,b13,_hc2cbdft_10,b13,b13
  ,b13,b13,b13,_hc2cf_12,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cfdft2_20
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cb_4,b13,_hc2cb_6,b13,b13,b13,_hc2cb_2,b13,b13
  ,b13,b13,b13,_hc2cf_8,b13,_hc2cfdft_32,b13,b13,b13,_hc2cf_2
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,_n1_2,b13,_n1_3
  ,b13,_n1_4,b13,_n1_5,b13,b13,b13,_n1_7,b13,_n1_8
  ,b13,_n1_9,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cb_32
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cbdft_6,b13,_hc2cbdft_4,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cfdft_6,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cf2_4
  ,b13,_hc2cbdft2_32,b13,_hc2cf2_8,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cb2_8
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cb2_4,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cfdft_12,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cfdft2_32
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cfdft2_8,b13,b13,b13,_hc2cfdft2_4,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cbdft_20,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,_hc2cb_20,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cbdft_2,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cbdft_8,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cf_6,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cfdft2_16,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cf2_20,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,_hc2cfdft_20,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cb2_16
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,_hc2cf_10,b13,_hc2cf_16
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_n1_32,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cb_8,b13,_hc2cb_16,b13,b13,b13,_hc2cb_12
  ,b13,_hc2cb_10,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cbdft_32,b13,_fftw_cpy2d_tiled,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cfdft_10,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_hc2cfdft_16,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,_fftw_cpy2d_co
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cf_4,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cbdft2_16,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,_hc2cf2_32,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,_n1_64,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,_hc2cb2_20,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,_hc2cf2_16,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,_hc2cf_20,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13];
  var FUNCTION_TABLE_viiiiiiiiii = [b14,b14,_r2cbIII_2,b14,_r2cb_4,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cbIII_9
  ,b14,_r2cbIII_16,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cb_20,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cf_64
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cfII_25,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cb_2,b14,b14,b14,_r2cb_3,b14,_r2cf_10,b14,_r2cbIII_10
  ,b14,_r2cf_12,b14,_r2cf_13,b14,_r2cf_14,b14,_r2cf_15,b14,_r2cf_16
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cfII_8
  ,b14,b14,b14,b14,b14,_r2cb_5,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,_r2cb_14,b14,_r2cb_15,b14,_r2cb_16,b14,_r2cb_10
  ,b14,b14,b14,_r2cb_12,b14,_r2cb_13,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,_r2cbIII_32,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cfII_10
  ,b14,b14,b14,b14,b14,_r2cfII_15,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cb_11,b14,b14
  ,b14,b14,b14,b14,b14,_r2cf_3,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,_r2cfII_12,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cf_8
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cf_11,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cf_128,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cfII_16,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cb_128
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cfII_32,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cb_7,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cb_25,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cfII_20
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cbIII_5,b14,b14
  ,b14,_r2cbIII_7,b14,b14,b14,b14,b14,b14,b14,_r2cbIII_3
  ,b14,b14,b14,b14,b14,_r2cbIII_8,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cf_32,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cb_32,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cbIII_12,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cbIII_64,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cfII_64,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cbIII_15,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cb_6,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cb_8,b14,_r2cb_9,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,_r2cf_6,b14,_r2cf_7,b14,_r2cf_4,b14,_r2cf_5
  ,b14,_r2cf_2,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cf_9,b14,b14,b14,b14,b14,_r2cb_64,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,_r2cbIII_25,b14,_r2cbIII_20,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cfII_6
  ,b14,b14,b14,_r2cfII_4,b14,_r2cfII_5,b14,_r2cfII_2,b14,_r2cfII_3
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cfII_9
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,_r2cfII_7,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,_r2cf_20,b14,b14,b14,_r2cf_25,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,_r2cbIII_4,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,_r2cbIII_6,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14];
  var FUNCTION_TABLE_iii = [b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,_applicable_iter,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,_applicable_tiled,b15,_applicable_ip_sq,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,_mkplan49,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,_applicable_memcpy,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,_compare_by_istride,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,_applicable_cpy2dco,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,_imprt
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,_fftw_dimcmp,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,_applicable_memcpy_loop,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,_applicable_ip_sq_tiled,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15];
  var FUNCTION_TABLE_iiiiii = [b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16,b16];
  var FUNCTION_TABLE_iiiiiiiiii = [b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17
  ,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,_okp2097,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17,b17];
  var FUNCTION_TABLE_viii = [b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_ro11
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply_cut,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_gcd,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply918,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_buf_r2hc,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_before634,b18,b18
  ,b18,_apply_iter,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_hc2r,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_ro01,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_buf2123,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_hc2r850
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply994,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply_r2hc,b18,b18,b18,b18,b18,_apply_ip_sq_tiledbuf,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_buf,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_ro11970
  ,b18,b18,b18,_apply_tiledbuf,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_re10
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_re11
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply714,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_hc2r1207
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply1220,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_r2hc2159,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_cexpl_zero,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply2170,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply_hc2r2160,b18,_apply_toms513,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_extra_iter
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_extra_iter2124,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_ro10,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_cexpl_sqrtn_table,b18,_apply_re01,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_o,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_e,b18,b18,b18,b18
  ,b18,b18,b18,_apply1233,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,_apply_ip_sq,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_dit765,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply1208,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_buf_hc2r,b18,b18,b18,b18
  ,b18,b18,b18,_apply_memcpy,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_apply_dit,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply_dif,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,_apply1028,b18,_apply_re11969,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_tiled,b18,b18
  ,b18,b18,b18,_cexp_zero,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_after633,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,_cexpl_sincos,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_cpy2dco,b18,b18
  ,b18,b18,b18,b18,b18,_apply1044,b18,b18,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,_apply_dif766,b18,b18
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply_r2hc849
  ,b18,_apply2125,b18,_apply_memcpy_loop,b18,_apply_hc2r_save,b18,b18,b18,b18
  ,b18,b18,b18,_apply730,b18,_apply_ip_sq_tiled,b18,b18,b18,_apply983
  ,b18,b18,b18,b18,b18,b18,b18,b18,b18,_apply,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18,b18];
  var FUNCTION_TABLE_v = [b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19,b19];
  var FUNCTION_TABLE_viiii = [b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20,b20];
  return { _strlen: _strlen, _free: _free, _main: _main, _memmove: _memmove, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_viiiii: dynCall_viiiii, dynCall_fifi: dynCall_fifi, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_iiiiiiiiiii: dynCall_iiiiiiiiiii, dynCall_ii: dynCall_ii, dynCall_iiiiiiiiiiii: dynCall_iiiiiiiiiiii, dynCall_iiiiiiiiiiiiiii: dynCall_iiiiiiiiiiiiiii, dynCall_iiii: dynCall_iiii, dynCall_viiiiiiii: dynCall_viiiiiiii, dynCall_viiffi: dynCall_viiffi, dynCall_iiiiiii: dynCall_iiiiiii, dynCall_viiiiiii: dynCall_viiiiiii, dynCall_viiiiiiiii: dynCall_viiiiiiiii, dynCall_viiiiiiiiii: dynCall_viiiiiiiiii, dynCall_iii: dynCall_iii, dynCall_iiiiii: dynCall_iiiiii, dynCall_iiiiiiiiii: dynCall_iiiiiiiiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_fifi": invoke_fifi, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiiiiiii": invoke_iiiiiiiiiii, "invoke_ii": invoke_ii, "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii, "invoke_iiiiiiiiiiiiiii": invoke_iiiiiiiiiiiiiii, "invoke_iiii": invoke_iiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiffi": invoke_viiffi, "invoke_iiiiiii": invoke_iiiiiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_iiiiiiiiii": invoke_iiiiiiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_viiii": invoke_viiii, "_strncmp": _strncmp, "_lseek": _lseek, "_sysconf": _sysconf, "_fread": _fread, "_fclose": _fclose, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_printf": _printf, "_close": _close, "_pread": _pread, "_fflush": _fflush, "_fopen": _fopen, "_open": _open, "_sqrtf": _sqrtf, "_fputc": _fputc, "_log": _log, "_puts": _puts, "_strtok": _strtok, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_fseek": _fseek, "_qsort": _qsort, "_send": _send, "_write": _write, "_fputs": _fputs, "_ftell": _ftell, "_exit": _exit, "_rewind": _rewind, "_strrchr": _strrchr, "_sin": _sin, "_read": _read, "__reallyNegative": __reallyNegative, "__formatString": __formatString, "_gettimeofday": _gettimeofday, "_recv": _recv, "_cos": _cos, "_pwrite": _pwrite, "_putchar": _putchar, "_sbrk": _sbrk, "_fsync": _fsync, "___errno_location": ___errno_location, "_isspace": _isspace, "_time": _time, "__exit": __exit, "_strcmp": _strcmp, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_fifi = Module["dynCall_fifi"] = asm["dynCall_fifi"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = asm["dynCall_iiiiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiii"];
var dynCall_iiiiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiiiiii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiffi = Module["dynCall_viiffi"] = asm["dynCall_viiffi"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = asm["dynCall_iiiiiiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
var initialStackTop;
var inMain;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
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
  initialStackTop = STACKTOP;
  inMain = true;
  var ret;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e && typeof e == 'object' && e.type == 'ExitStatus') {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      Module.print('Exit Status: ' + e.value);
      return e.value;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    inMain = false;
  }
  // if we're not running an evented main loop, it's time to exit
  if (!Module['noExitRuntime']) {
    exit(ret);
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  STACKTOP = initialStackTop;
  // TODO call externally added 'exit' callbacks with the status code.
  // It'd be nice to provide the same interface for all Module events (e.g.
  // prerun, premain, postmain). Perhaps an EventEmitter so we can do:
  // Module.on('exit', function (status) {});
  // exit the runtime
  exitRuntime();
  if (inMain) {
    // if we're still inside the callMain's try/catch, we need to throw an
    // exception in order to immediately terminate execution.
    throw { type: 'ExitStatus', value: status };
  }
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
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
var buffer = 0, bufferSize = 0;
var inWorkerCall = false, workerResponded = false, workerCallbackId = -1;
onmessage = function(msg) {
  var func = Module['_' + msg.data['funcName']];
  if (!func) throw 'invalid worker function to call: ' + msg.data['funcName'];
  var data = msg.data['data'];
  if (data) {
    if (!data.byteLength) data = new Uint8Array(data);
    if (!buffer || bufferSize < data.length) {
      if (buffer) _free(buffer);
      bufferSize = data.length;
      buffer = _malloc(data.length);
    }
    HEAPU8.set(data, buffer);
  }
  inWorkerCall = true;
  workerResponded = false;
  workerCallbackId = msg.data['callbackId'];
  if (data) {
    func(buffer, data.length);
  } else {
    func(0, 0);
  }
  inWorkerCall = false;
}
// {{MODULE_ADDITIONS}}


//ARGUMENTS
Module['arguments'] = [];

if((data.input) && (data.input.argv)){	
	var argv = data.input.argv;
	argv.forEach(function(arg){
		Module['arguments'][arg.pos] = arg.arg;
	});
}


	Module['arguments'][0] = 'audioArray.txt'; 
	

Module.callMain(Module['arguments']);



if((data.output) && (data.output.files)){
        var files = data.output.files;
	files.forEach(function(file) {
   
		var dirname = Module['dirname'](file.name);
	
		var basename = Module['basename'](file.name);
		var content = intArrayToString(FS.root.contents[basename].contents);
		content = ((file.compress) || (file.decompress)) ? Module['compress'](content) : content;

		Module['return']['output']['files'][dirname + basename] =  content;
    


	}); 

}



return Module['return'];
}