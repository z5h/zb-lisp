var Compiler = function(){

  var list = Types.list;
  var s = Types.newSymbol;

  var REFER = s('refer');
  var CONSTANT = s('constant');
  var CLOSE = s('close');
  var ASSIGN = s('assign');
  var TEST = s('test');
  var FRAME = s('frame');
  var ARGUMENT = s('argument');
  var CONTI = s('conti');
  var _RETURN_ = list(s('return'));
  var _APPLY_ = list(s('apply'));

  function isTail(x){
    return x.car.type === 'symbol' && x.car.value === 'return';
  }

  function compile(x, next){
    if (x.type === 'symbol') {
      return list(REFER, x, next);
    } else if (x.type === 'cons'){
      return compileCons(x, next);  
    } else {
      return list(CONSTANT, x, next);
    } 
  }

  function compileCons(x, next){
    var op = x.get(0).value;

    if (op === 'quote'){
      return list(CONSTANT, x.cdr.car, next);
    } else if (op === 'lambda') {
      var vars = x.get(1);
      var body = x.get(2);
      return list(CLOSE, vars, compile(body, _RETURN_), next);
    } else if (op === 'if') {
      var tst = x.get(1);
      var thn = x.get(2);
      var els = x.get(3)
      var thnc = compile(thn, next);
      var elsc = compile(els, next);
      return compile(tst, list(TEST, thnc, elsc));
    } else if (op === 'set!') {
      var v = x.get(1);
      var expr = x.get(2);
      return compile(expr, list(ASSIGN, v, next));
    } else if (op === 'call/cc') {
      var e = x.get(1);
      var c = list(CONTI, list(ARGUMENT, compile(e, _APPLY_)));
      if (isTail(next)) {
        return c;
      } else {
        return list(FRAME, next, c);
      }
    } else {
      var args = x.cdr;
      c = compile(x.car, _APPLY_);
      while (true){
        if (args === Types.NULL_CONS){
          if (isTail(next)){
            return c;
          } else {
            return list(FRAME, next, c);
          }
        }
        c = compile(args.car, list(ARGUMENT, c));
        args = args.cdr;
      }
    }
  }

  return {compile : compile}
}();
