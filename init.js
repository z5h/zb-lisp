/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var __e__ = null;
function e(x){
  if (__e__ === null){
    __e__ = Evaluator.newEvaluator();

    if (true){
      __e__.addNative('=',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return ((a === b) ||  (a.type === 'number'
          && b.type === 'number'
          && a.value === b.value))

        ? Types.T : Types.F;
      },
      ['a','b']);

    __e__.addNative('+',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value + b.value);
      },
      ['a','b']);

    __e__.addNative('-',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value - b.value);
      },
      ['a','b']);

      __e__.addNative('*',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value * b.value);
      },
      ['a','b']);

    __e__.addNative('/',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value / b.value);
      },
      ['a','b']);

    __e__.addNative('cons',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newCons(a, b);
      },
      ['a','b']);

    __e__.addNative('car',
      function(map){
        var a = map['a'];

        return a.car;
      },
      ['a']);

    __e__.addNative('cdr',
      function(map){
        var a = map['a'];

        return a.cdr;
      },
      ['a']);

    __e__.addNative('null?',
      function(map){
        var a = map['a'];

        return a === Types.NULL_CONS;
      },
      ['a']);

    __e__.addNative('pair?',
      function(map){
        var a = map['a'];

        return a.type === 'cons';
      },
      ['a']);

    __e__.addNative('type',
      function(map){
        var a = map['a'];

        return Types.newSymbol(a.type);
      },
      ['a']);
    }
    
  }
  return __e__.evaluate(x);
}
