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
      toString : function(){
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
      }
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
}

var Parser = function(){

  var WHITESPACE = " \t\n\r\f";
  var NEWLINE = "\n\r";
  var SEMICOLON = ";";
  var HASH = "#";
  var DIGITS = "0123456789";
  var NONSYMBOL = " \n\r\f()`\"\\[]'@,.;#";
  var LPAREN = "()"[0];
  var RPAREN = "()"[1];
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


  return { newParser : newParser};
}();


var Evaluator = function(){

  function s(str){
    return Types.newSymbol(str);
  }

  var E_PARENT_KEY = "(PARENT)"; //illegal symbol name

  var _return_ = [s("return")].toCons();
  var _apply_  = [s('apply')].toCons();

/*
* a: the accumulator,
* x: the next expression,
* e: the current environment,
* r: the current value rib, and
* s: the current stack.
*/
  function newVM(a, x, e, r, s){
    return {
      a : a,
      x : x,
      e : e,
      r : r,
      s : s,

      /*
       * halt the VM and return the value in the accumulator
       */
      halt : function(){
        return this.a;
      },
      /*
       * find value of variable v in the environment and places this into
       * accumulator
       * set next expression to x
       */
      refer : function(args){
        var v = args.get(0);
        var x = args.get(1);
        this.a = lookup(v, this.e);
        this.x = x;
        return this;
      },
      /*
       * places obj into the accumulator
       * set next expression to x
       */
      constant : function(args){
        var obj = args.get(0);
        var x = args.get(1);
        this.a = obj;
        this.x = x;
        return this;
      },
      /*
       * creates a closure from body, vars and the current environment,
       * places the closure into the accumulator, and
       * sets the next expression to x.
       */
      close : function(args){
        var vars = args.get(0);
        var body = args.get(1);
        var x = args.get(2);
        this.a = closure(body, this.e, vars);
        this.x = x;
        return this;
      },

      /*
       * tests the accumulator
       * if the accumulator is #t sets the next expression to thn.
       * otherwise test sets the next expression to els
       */
      test : function(args){ 
        var thn = args.get(0);
        var els = args.get(1);
        if (this.a === Types.T){
          this.x = thn;
        } else {
          this.x = els;
        }
        return this;
      },
      /*
       * changes the current environment binding for the variable v
       * to the value in the accumulator.
       * sets the next expression to x
       */
      assign : function(args){ 
        var v = args.get(0);
        var x = args.get(1);
        replace(v, this.a, this.e);
        this.x = x;
        return this;
      },
      /*
       * creates a continuation from the current stack,
       * places this continuation in the accumulator.
       * sets the next expression to x
       */
      conti : function(args){ 
        var x = args.get(0);
        this.a = continuation(this.s);
        this.x = x;
        return this;
      },
      /*
       * restores s to be the current stack
       * sets the accumulator to the value of var in the current environment,
       * sets the next expression to (return)
       */
      nuate : function(args){ 
        var s = args.get(0);
        var v = args.get(1);
        this.a = lookup(v, this.e);
        this.s = s;
        this.x = _return_;
        return this;
      },
      /*
       * creates a new frame from:
       *   ret as the next expression,
       *   the current environment,
       *   the current rib,
       *   and adds this frame to the current stack
       * sets the current rib to the empty list,
       * sets the next expression to x
       */
      frame : function(args){ 
        var ret = args.get(0);
        var x = args.get(1);
        this.s = [ret, this.e, this.r, this.s].toCons();
        this.r = [];
        this.x = x;
        return this;
      },

      /*
       * adds the value in the accumulator to the current rib
       * sets the next expression to x
       */
      argument : function(args){ 
        var x = args.get(0);
        this.x = x;
        this.r.push(this.a);
        return this;
      },
      /*
       * applies the closure in the accumulator to the list of values in the
       * current rib. Precisely, this instruction extends the closure’s environment with the closure’s
       * variable list and the current rib, sets the current environment to
       * this new environ- ment, sets the current rib to the empty list, and sets the next expression to the closure’s body.
       */
      apply : function(){ 
        var body = this.a.get(0);
        var e = this.a.get(1);
        var vars = this.a.get(2);

        this.x = body;
        this.e = extend(e, vars, this.r);
        this.r = [];
        return this;

      },
      /*
       * removes the first frame from the stack and resets the current
       * environment, the current rib, the next expression, and the current stack
       */
      'return' : function(){
        var x = this.s.get(0);
        var e = this.s.get(1);
        var r = this.s.get(2);
        var s = this.s.get(3);

        this.x = x;
        this.e = e;
        this.r = r;
        this.s = s;

        return this;
      },
      cycle : function(){
        var result = this;
        var instruction;
        var args;
        while (result === this){
        if (true){
          Log.log('--------------------------------------');
          Log.log('a'); Log.log(this.a);
          Log.log('x'); Log.log(this.x);
          Log.log('e'); Log.log(this.e);
          Log.log('r'); Log.log(this.r);
          Log.log('s'); Log.log(this.s);
          Log.log('--------------------------------------');
        }
          instruction = this.x.get(0).value;
          args = this.x.cdr;
          Log.log("calling " + instruction + " args = " + args);
          //if (!confirm(""))
          //  return "break";
          result = this[instruction](args);
        }
        Log.log("=============================================");
        return result;
      }
    };
  }

  function extend(e, vars, rib){
    rib = rib.slice().reverse();
    var ne = {E_PARENT_KEY: e};
    for (var i=0; i<rib.length; i++){
      ne[vars.get(i).value] = rib[i];
    }
    return ne;
  }
  function continuation(stack){
    return closure([s('nuate'), stack, s('v')].toCons(), [{}], [s('v')].toCons());
  }

  function closure(body, e, vars){
    return [body, e, vars].toCons();
  }

  function lookup(symbol, e){
    var key = symbol.value;
    while (e !== undefined){
      var result = e[key];
      if (result !== undefined){
        return result;
      }
      e = e[E_PARENT_KEY];
    }
    return undefined;
  }

  function replace(symbol, val, e){
    var key = symbol.value;
    var e1 = e;
    while (e !== undefined){
      var result = e[key];
      if (result !== undefined){
        e[key] = val;
        return;
      }
      e = e[E_PARENT_KEY];
    }
    e1[key] = val;
  }

  function isTail(x){
    return x.car.type === 'symbol' && x.car.value === 'return';
  }

  function compile(x, next){
    if (x.type === 'symbol') {
      return [s('refer'), x, next].toCons();
    } else if (x.type === 'cons'){
      return compileCons(x, next);  
    } else { //if (x.selfEval === true){
      return [s('constant'), x, next].toCons();
    } 
    //else {
    //  throw "Unknown value : " + x;
    //}
  }

  function compileCons(x, next){
      var op = x.car.value;

      if (op === 'quote'){
        return [s('constant'), x.cdr.car, next].toCons();
      } else if (op === 'lambda') {
        return [s('close'), x.cdr.car, compile(x.cdr.cdr.car, _return_), next].toCons();
      } else if (op === 'if') {
        var tst = x.cdr.car;
        var thn = x.cdr.cdr.car;
        var els = x.cdr.cdr.cdr.car
        var thnc = compile(thn, next);
        var elsc = compile(els, next);
        return compile(tst, [s('test'), thnc, elsc].toCons());
      } else if (op === 'set!') {
        var v = x.cdr.car;
        var expr = x.cdr.cdr.car;
        return compile(expr, [s('assign'), v, next].toCons()); 
      } else if (op === 'call/cc') {
        var c = [s('conti'), [s('argument'), compile(x.cdr.car, _apply_)].toCons()].toCons();
        if (isTail(next)) {
          return c;
        } else {
          return ['frame', next, c].toCons();
        }
      } else {
        var args = x.cdr;
        c = compile(x.car, _apply_);
        while (true){
          if (args === Types.NULL_CONS){
            if (isTail(next)){
              return c;
            } else {
              return [s('frame'), next, c].toCons();
            }
          }
          c = compile(args.car, [s('argument'), c].toCons());
          args = args.cdr;
        }
      }
  }

  function evaluate(x, vm){
    var compiled = compile(x, [s('halt')].toCons());
    Log.log(x + " -> " + compiled);
    vm['x'] = compiled;
    return vm.cycle();
  }

  function newEvaluator(){
    return {
      evaluate : function(x){
        var result = Parser.newParser(x).parse();
        for (var i=0; i<result.length; i++){
          var r = evaluate(result[i], this.vm);
          Log.log(r);
          Log.log(r.toString());
        }
      },
      vm : newVM(undefined, undefined, {}, [], [])
    };
  }

  return {
    newEvaluator : newEvaluator
  };
}();

var __e__ = null;
function e(x){
  if (__e__ === null){
    __e__ = Evaluator.newEvaluator();
  }
  return __e__.evaluate(x);
}