var Types = function(){

  var NULL_CONS = {
    type : "cons",
    isNull : true,
    toString : function(){
      return "()";
    },
  };

  var T = {
    type : "boolean",
    value : true,
    toString : function(){
      return "#t";
    }
  };
  
  var F = {
    type : "boolean",
    value : false,
    toString : function(){
      return "#f";
    }
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
      toString : function(){
        var head = this;
        var s = "(";
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
      }
    };
  }

   function newString(value){
    return  {
      type : "string",
      value : value,
      toString : function(){
        return "\"" + this.value + "\"";
      }
    };
  }

  function newSymbol(value){
    return  {
      type : "symbol",
      value : value,
      toString : function(){
        return this.value;
      }
    };
  }

  function newNumber(value){
    return  {
      type : "number",
      value : value,
      toString : function(){
        return this.value;
      }
    };
  }

  function isNull(x){
    return x === NULL_CONS;
  }
  function isList(x){
    return x.type === "cons" && (x === NULL_CONS || isList(cdr(x)));
  }
  return {
    newCons : newCons,
    newString : newString,
    newNumber : newNumber,
    newSymbol : newSymbol,
    NULL_CONS : NULL_CONS,
    T : T,
    F : F
  };
}();

var Parser = function(){

  var WHITESPACE = " \t\n\r\f";
  var NEWLINE = "\n\r";
  var SEMICOLON = ";";
  var HASH = "#";
  var DIGITS = "0123456789";
  var NONSYMBOL = " \n\n\r\f()`\"\\[]'@,.;#";
  var LPAREN = "(";
  var RPAREN = ")";
  var QUOTES = "\"";
  var QUOTE = "'";
  var DOT = ".";
  var EOF = [];

  function newParser(text){
    return {
      text : text,
      last : text.length - 1,
      position : 0,
      parse : function(){
        parse(this); //this calls parse(p) below.
      }
    };
  }

  //all functions below operate on an object p returned from newParser

  function parse(p){
    var parsed = new Array();
    var n = parseNext(p);
    while (n !== null){
      Log.log(n); //.toString());
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

    var data = new Array();
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
    while(chr(p) !== QUOTES){
      fwd(p);
    }
    var end = p.position;

    fwd(p);
    return Types.newString(p.text.substring(start, end));
  }

  function parseNumber(p){
    var value = 0;
    var index = 0;
    while((index = DIGITS.indexOf(chr(p))) > -1){
      value = 10*value + index;
      fwd(p);
    }
    return Types.newNumber(value);
  }

  function parseSymbol(p){
    var start = p.position;
    fwd(p);
    while (NONSYMBOL.indexOf(chr(p)) < 0){
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
  return { newParser : newParser};
}();


var Evaluator = function(){
  return "nothing here yet";
}();
