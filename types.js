/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Types = function(){

  var NULL_CONS = {
    type : "cons",
    isNull : true,
    toString : function(){
      return "()";
    }
  };

  var T = {
    type : "boolean",
    selfEval : true,
    value : true,
    toString : function(){
      return "#t";
    }
  };

  var F = {
    type : "boolean",
    selfEval : true,
    value : false,
    toString : function(){
      return "#f";
    }
  };

  var consToString = function(){
        var head = this;
        var s = "()"[0];
        s += head.car.toString() + " ";
        while ((head.cdr !== NULL_CONS) && (head.cdr.type === "cons")){
          head = head.cdr;
          s += head.car.toString() + " ";
        }
        if (head.cdr === NULL_CONS){
          s += ")";
        } else {
          s += " . " + head.cdr.toString() + ")";
        }
        return s;
      };

  function newCons(car, cdr){
    return {
      type : "cons",
      car : car,
      cdr : cdr,
      setCdr : function(x){
        this.cdr = x;
      },
      setCar : function(x){
        this.car = x;
      },
      get : function(i){
        if (i === 0) {
          return this.car;
        } else {
          return this.cdr.get(i-1);
        }
      },
      toString : consToString
    };
  }

  function newString(value){
    return  {
      type : "string",
      selfEval : true,
      value : value,
      toString : function(){
        return "\"" + this.value + "\"";
      }
    };
  }

  var symbols = {};
  function newSymbol(value){
    var symbol = symbols[value];
    if (symbol === undefined){
      symbol = {
        type : "symbol",
        value : value,
        toString : function(){
          return this.value;
        }
      };
      symbols[value] = symbol;
    }
    return symbol;
  }

  function newNumber(value){
    return  {
      type : "number",
      selfEval : true,
      value : value,
      toString : function(){
        return this.value.toString();
      }
    };
  }

  function isNull(x){
    return x === NULL_CONS;
  }

  function isList(x){
    return x.type === "cons" && (x === NULL_CONS || isList(cdr(x)));
  }

  Array.prototype.toCons = function(){
    if (this.length === 0) {
      return Types.NULL_CONS;
    } else {
      var head = Types.newCons(this[this.length - 1], Types.NULL_CONS);
      for (var i = this.length -2; i>-1; i--){
        head = Types.newCons(this[i], head);
      }
      return head;
    }
  };

  function list(){
    if (arguments.length === 0) {
      return Types.NULL_CONS;
    } else {
      var head = Types.newCons(arguments[arguments.length - 1], Types.NULL_CONS);
      for (var i = arguments.length -2; i>-1; i--){
        head = Types.newCons(arguments[i], head);
      }
      return head;
    }
  }

  return {
    newCons : newCons,
    newString : newString,
    newNumber : newNumber,
    newSymbol : newSymbol,
    NULL_CONS : NULL_CONS,
    T : T,
    F : F,
    list : list
  };
}();
