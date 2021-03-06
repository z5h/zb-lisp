/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Parser = function(){

  var WHITESPACE = " \t\n\r\f";
  var NEWLINE = "\n\r";
  var SEMICOLON = ";";
  var HASH = "#";
  var DIGITS = "0123456789";
  var NONSYMBOL = " \n\r\f()`\"\\[]'@,.;#";
  var LPAREN = "(";
  var RPAREN = ")";
  var QUOTES = "\"";
  var QUOTE = "'";
  var DOT = ".";
  var EOF = "EOF";

  function newParser(text){
    return {
      text : text,
      last : text.length - 1,
      position : 0,
      parse : function(){
        return parse(this); //this calls parse(p) below.
      }
    };
  }

  //all functions below operate on an object p returned from newParser

  function parse(p){
    Log.log("parsing... ");
    var parsed = new Array();
    var n = parseNext(p);
    while (n !== null){
      Log.log(n);
      parsed[parsed.length] = n;
      n = parseNext(p);
    }
    Log.log("done");
    return parsed;
  }

  function parseNext(p){
    skip(p);
    if (eof(p)){
      return null;
    }

    var n = chr(p);

    //skip comments
    while (SEMICOLON === n){
      n = fwdTo(p, NEWLINE);
      if (n === EOF){
        return null;
      }
      skip(p);
      n = chr(p);
    }

    if (eof(p)){
      return null;
    } else if (LPAREN === n){
      return parseExpression(p);
    } else if (QUOTES === n) {
      return parseString(p);
    } else if (DIGITS.indexOf(n)>-1){
      return parseNumber(p);
    } else if (QUOTE === n){
      return parseQuote(p);
    } else if (HASH === n){
      return parseBoolean(p);
    } else if (NONSYMBOL.indexOf(n)<0){
      return parseSymbol(p);
    } else if (DOT === n) {
      //only allowed within parseExpression
      fwd(p);
      return DOT; 
    }

    return null;
  }

  function parseExpression(p){
    fwd(p); //skip past first "("
    skip(p);//skip any WHITESPACE after "("

    var data = [];
    var improperList = false;

    while (chr(p) !== RPAREN){
      var v = parseNext(p);
      if (v === DOT){
        improperList = true;
        v = parseNext(p);
        if (v === DOT){
          throw "unexpected '.' at" + p.position;
        }
        data[data.length] = v;
        skip(p);
        if (chr(p) !== RPAREN){
          throw "expected ')' at" + p.position;
        }
      } else {
        data[data.length] = v;
      }
      skip(p);
    }

    if (data.length === 0){
      fwd(p);
      return Types.NULL_CONS;
    }

    var cons = improperList 
    ? Types.newCons(data[data.length-2], data[data.length-1]) 
    : Types.newCons(data[data.length-1], Types.NULL_CONS);

    var i = improperList ? data.length -3 : data.length - 2;

    while (i>-1){
      cons = Types.newCons(data[i--], cons);
    }

    fwd(p);
    return cons;
  }

  function parseQuote(p){
    fwd(p);
    var quote = Types.newSymbol("quote");
    return Types.newCons(quote, Types.newCons(parseNext(p), Types.NULL_CONS));
  }

  function parseBoolean(p){
    fwd(p);
    var c = chr(p);
    if (c === 't'){
      fwd(p);
      return Types.T;
    } else if (c === 'f'){
      fwd(p);
      return Types.F;
    } else {
      throw "expected 't' or 'f' at " + p.position; 
    }
  }

  function parseString(p){
    //we start on ", consume it
    fwd(p);
    var start = p.position;
    while((!eof(p)) && (chr(p) !== QUOTES)){
      fwd(p);
    }
    if (eof(p)){
      throw "EOF reached before end of last string";
    }
    var end = p.position;

    fwd(p);
    return Types.newString(p.text.substring(start, end));
  }

  function parseNumber(p){
    var value = 0;
    var index = 0;
    while((!eof(p)) && ((index = DIGITS.indexOf(chr(p))) > -1)){
      value = 10*value + index;
      fwd(p);
    }
    return Types.newNumber(value);
  }

  function parseSymbol(p){
    var start = p.position;
    fwd(p);
    while ((!eof(p)) && NONSYMBOL.indexOf(chr(p)) < 0){
      fwd(p);
    }
    return Types.newSymbol(p.text.substring(start, p.position));
  }

  function eof(p){
    return (p.position > p.last);
  }

  function chr(p){
    if (!eof(p)){
      return (p.text.charAt(p.position));
    } 
    return EOF;
  }

  function fwd(p){
    if (p.position <= p.last){
      p.position++;
    }
  }

  function fwdTo(p, chars){
    var c = chr(p);
    while ((!eof(p)) && (chars.indexOf(c) < 0)){
      fwd(p);
      c = chr(p);
    }
    return c;
  }

  function skip(p){
    while ((!eof(p)) && (WHITESPACE.indexOf(chr(p)) > -1)){
      fwd(p);
    }
  }


  return {
    newParser : newParser
  };
}();
