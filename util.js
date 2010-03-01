/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

if (typeof Object.create !== 'function'){
  Object.create = function(o){
    var F = function(){};
    F.prototype = o;
    return new F();
  };
}

if (typeof Function.prototype.method !== 'function'){
  Function.prototype.method = function(name, func){
    this.prototype[name] = func;
    return this;
  };
}

if (typeof Object.extend !== 'function'){
  Object.extend = function(o, map){
    var e = Object.create(o);
    var k;
    for (k in map){
      if (map.hasOwnProperty(k)){
        e[k] = map[k];
      }
    }
    return e;
  };
}

if (typeof Object.prototype.pairs !== 'function'){
  Object.prototype.pairs = function(){
    var result = [];
    var k;
    for (k in this){
      if (this.hasOwnProperty(k)){
        result.push([k, this[k]]);
      }
    }
    return result;
  };
}

if (typeof Array.prototype.foldr !== 'function'){
  Array.prototype.foldr = function(fnc,start) {
    var a = start;
    for (var i = this.length-1; i > -1; i--) {
      a = fnc(this[i],a);
    }
    return a;
  };
}

if (typeof Array.prototype.foldl !== 'function'){
  Array.prototype.foldl = function(fnc,start) {
    var a = start;
    for (var i = 0; i < this.length; i++) {
      a = fnc(this[i],a);
    }
    return a;
  };

}

if (typeof Array.prototype.map !== 'function'){
  Array.map = function(f){
    var result = [];
    for (var i=0; i<this.length; i++){
      result.push(f(this[i]));
    }
    return result;
  };
}


