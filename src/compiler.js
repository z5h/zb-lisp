/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Compiler = function(){

  var list = Types.list;
  var NULL = list();
  var s = Types.newSymbol;
  var cons = Types.newCons;

  var macros = {};

  //VM Operations
  var NATIVE = s('native');
  var REFER = s('refer');
  var CONSTANT = s('constant');
  var CLOSE = s('close');
  var ASSIGN = s('assign');
  var DEFINE = s('define');
  var TEST = s('test');
  var FRAME = s('frame');
  var ARGUMENT = s('argument');
  var CONTI = s('conti');
  var _RETURN_ = list(s('return'));
  var _APPLY_ = list(s('apply'));

  //Language operations
  var LAMBDA = s('lambda');
  var QUOTE = s('quote');
  var IF = s('if');
  var SET_BANG = s('set!');
  var CALL_CC = s('call/cc');
  var LET = s('let');
  var LET_STAR = s('let*');

  function rewriteLet(x){
    var vars = [];
    var vals = [];
    var defs;
    //(let name ((var val) ...) body)
    if (x.get(1).type === 'symbol'){
      defs = x.get(2);
      while(defs !== NULL){
        vars.push(defs.car.car);
        vals.push(defs.car.cdr.car);
        defs = defs.cdr;
      }
      vals = vals.toCons();
      vars = vars.toCons();
      //((lambda ()
      //  (define name (lambda (vars) body))
      //  (name vals)))
      return list(list(LAMBDA, list(),
          list(DEFINE, x.get(1), list(LAMBDA, vars, x.get(3))),
          cons(x.get(1), vals)));

    //(let ((var val) ...) body)
    } else {
      defs = x.get(1);
      while(defs !== NULL){
        vars.push(defs.car.car);
        vals.push(defs.car.cdr.car);
        defs = defs.cdr;
      }
      vals = vals.toCons();
      vars = vars.toCons();
      //((lambda (vars) body) vals)
      return cons(list(LAMBDA, vars, x.get(2)), vals);
    }
  }

  function rewriteLetStar(x){
    //(let* ((var val) ...) body)
    var defs = x.get(1);
    if (defs === NULL || defs.cdr === NULL){
      return rewriteLet(x);
    } else {
      var firstDef = x.get(1).car;
      var remaining = x.get(1).cdr;
      return rewriteLet(list(LET, list(firstDef),
          list(LET_STAR, remaining, x.get(2))));
    }
  }

  function isTail(x){
    return x.car.type === 'symbol' && x.car.value === 'return';
  }

  function compile(x, next){
    if ((typeof x) === 'function'){
      return list(NATIVE, x, next);
    }
    else if (x.type === 'symbol') {
      return list(REFER, x, next);
    } else if (x.type === 'cons'){
      return compileCons(x, next);  
    } else {
      return list(CONSTANT, x, next);
    } 
  }

  function compileLambdaBody(body, next){
    if (body.cdr === Types.NULL_CONS){
      return compile(body.car, next);
    } else {
      return compile(body.car, compileLambdaBody(body.cdr, next));
    }
  }

  function compileCons(x, next){
    var op = x.get(0);

    if (op === QUOTE){
      return list(CONSTANT, x.cdr.car, next);
    } else if (op === LET) {
      return compile(rewriteLet(x), next);
    } else if (op === LET_STAR) {
      return compile(rewriteLetStar(x), next);
    } else if (op === LAMBDA) {
      var vars = x.get(1);
      var body = x.cdr.cdr;
      return list(CLOSE, vars, compileLambdaBody(body, _RETURN_), next);
    } else if (op === IF) {
      var tst = x.get(1);
      var thn = x.get(2);
      var els = x.get(3);
      var thnc = compile(thn, next);
      var elsc = compile(els, next);
      return compile(tst, list(TEST, thnc, elsc));
    } else if (op === SET_BANG) {
      var set_v = x.get(1);
      var set_expr = x.get(2);
      return compile(set_expr, list(ASSIGN, set_v, next));
    } else if (op === DEFINE) {
      var def_v = x.get(1);
      var def_expr = x.get(2);
      return compile(def_expr, list(DEFINE, def_v, next));
    } else if (op === CALL_CC) {
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
