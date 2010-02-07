var Types = function(){

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
        while ((head.cdr !== NULL_CONS) && (head.cdr.type == "cons")){
          head = head.cdr;
          s += head.car.toString() + " ";
        }
        if (head.cdr == NULL_CONS){
          s += ")";
        } else {
          s += " . " + head.cdr.toString() + ")";
        }
        return s;
      }
    };
  }

  var NULL_CONS = {
    type : "cons",
    isNull : true,
    toString : function(){
      return "()";
    },
  };

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
    return x == NULL_CONS;
  }
  function isList(x){
    return x.type == "cons" && (x == NULL_CONS || isList(cdr(x)));
  }
  return {
    newCons : newCons,
    newString : newString,
    newNumber : newNumber,
    newSymbol : newSymbol,
    NULL_CONS : NULL_CONS
  };
}();

var Parser = function(){

  var WHITESPACE = " \t\n\r\f";
  var DIGITS = "0123456789";
  var NONSYMBOL = " \n\n\r\f()`\"\\[]'@,.";
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
    var n = parseNext(p);
    while (n !== null){
      Log.log(n); //.toString());
      n = parseNext(p);
    }
    Log.log("done");
  }

  function parseNext(p){
    skip(p);
    if (eof(p)){
      return null;
    }

    var n = chr(p);
    if (eof(p)){
      return null;
    } else if ("(" == n){
      return parseExpression(p);
    } else if ("\"" == n) {
      return parseString(p);
    } else if (DIGITS.indexOf(n)>-1){
      return parseNumber(p);
    } else if (NONSYMBOL.indexOf(n)<0){
      return parseSymbol(p);
    } else if ("." == n) {
      //only allowed within parseExpression
      fwd(p);
      return "."; 
    }

    return null;
  }

  function parseExpression(p){
    fwd(p); //skip past first "("
    skip(p);//skip any WHITESPACE after "("
    //empty list special case
    var n = Types.NULL_CONS;
    if (chr(p) == ")"){
      fwd(p);
      return n;
    }

    var head = Types.newCons(n,n);
    var tail = head;
    var last = tail;

    while (chr(p) !== ")"){
      var v = parseNext(p);
      if (v === "."){
        last.setCdr(parseNext(p));
        skip(p);
        if (chr(p) !== ")"){
          throw "expected ')' at " + p.position;
        }
        break;
      } else {
        last = tail;
        tail.setCar(v);
        tail.setCdr(Types.newCons(n,n));
        tail = tail.cdr;
      }
    }
    fwd(p);
    return head;
  }

  function parseString(p){
    //we start on ", consume it
    fwd(p);
    var start = p.position;
    while(chr(p) !== "\""){
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

  function skip(p){
    while ((!eof(p)) && (WHITESPACE.indexOf(chr(p)) > -1)){
      fwd(p);
    }
  }
  return { newParser : newParser};
}();



