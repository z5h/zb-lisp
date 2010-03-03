/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
var NativeFunctions = function() {

  function bool(value){
    return value ? Types.T : Types.F;
  }

  var FUNCTIONS = [
    { name : '=',
      vars : ['a', 'b'],
      body : function(map){
        var a = map['a'];
        var b = map['b'];
        return bool(((a === b) ||  
							(a.type === 'number'
          			&& b.type === 'number'
          			&& a.value === b.value)));
      }
    },
    { name : '+',
      vars : ['a', 'b'],
      body : function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value + b.value);
      }
    },
    { name : '-',
      vars : ['a', 'b'],
      body : function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value - b.value);
      }
    },
    { name: '*',
      vars : ['a', 'b'],
      body : function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value * b.value);
      }
    },
    { name : '/',
      vars : ['a', 'b'],
      body :   function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value / b.value);
      }
    },
    { name : 'cons',
      vars : ['a', 'b'],
      body : function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newCons(a, b);
      }
    },
    { name : 'car',
      vars : ['a'],
      body : function(map){
        var a = map['a'];

        return a.car;
      }
    },
    { name : 'cdr',
      vars : ['a'],
      body : function(map){
        var a = map['a'];

        return a.cdr;
      }
    },
    { name : 'null?',
      vars : ['a'],
      body : function(map){
        var a = map['a'];

        return bool(a === Types.NULL_CONS);
      }
    },
    { name : 'pair?',
      vars : ['a'],
      body : function(map){
        var a = map['a'];

        return bool(a.type === 'cons');
      }
    },
    { name : 'type',
      vars : ['a'],
      body : function(map){
        var a = map['a'];

        return Types.newSymbol(a.type);
      }
    }];

  function addNativeFunctions(e) {
    for (var i=0; i < FUNCTIONS.length; i++){
      var f = FUNCTIONS[i];
			f.body.name = f.name;
      e.addNative(f.name, f.body, f.vars);
    }
  }

  return {addTo : function(evaluator){
    addNativeFunctions(evaluator);
  }}

}();
