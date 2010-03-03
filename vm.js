/*
Copyright © 2010, Mark Bolusmjak
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Evaluator = function(){

  var s = Types.newSymbol;
  var list = Types.list;

  var _HALT_ = list(s('halt'));
  var _RETURN_ = list(s('return'));

  var cons = Types.newCons;

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
       *
       * [halt () a]
       */
      halt : function(){
        return this.a;
      },

      /*
       * find value of variable v in the environment and places this into
       * accumulator
       * set next expression to x
       *
       * [refer (var x)
       *   (VM (car (lookup var e)) x e r s)]
       */
      refer : function(args){
        var v = args.get(0);
        var x = args.get(1);
        this.a = lookup(v, this.e).car;
        this.x = x;
        return this;
      },

      'native' : function(args){
        var f = args.get(0);
        var x = args.get(1);
        var vars = f.vars;

        var map = {};
        while (vars !== list()){
          map[vars.car.value] = lookup(vars.car, this.e).car;
          vars = vars.cdr;
        }


        this.a = f.apply(this, [map]);
				if (this.a.type === undefined){
					throw "unknown type returned by native function " + f.name;
				}
        this.x = x;
        return this;
      },

      /*
       * places obj into the accumulator
       * set next expression to x
       *
       * [constant (obj x)
       *   (VM obj x e r s)]
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
       *
       * [close (vars body x)
       *   (VM (closure body e vars) x e r s)]
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
       *
       * [test (then else)
       *   (VM a (if a then else) e r s)]
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
       *
       * [assign (var x)
       *   (set-car! (lookup var e) a) (VM a x e r s)]
       */
      assign : function(args){ 
        var v = args.get(0);
        var x = args.get(1);
        var r = lookup(v, this.e);
        if (r !== list()){
          r.setCar(this.a);
        } else {
          addToEnv(this.e, v, this.a);
        }
        this.x = x;
        return this;
      },

      /*
       * creates a continuation from the current stack,
       * places this continuation in the accumulator.
       * sets the next expression to x
       *
       * [conti (x)
       *   (VM (continuation s) x e r s)]
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
       *
       * [nuate (s var)
       *   (VM (car (lookup var e)) '(return) e r s)]
       */
      nuate : function(args){ 
        var s = args.get(0);
        var v = args.get(1);
        this.a = lookup(v, this.e).car;
        this.s = s;
        this.x = _RETURN_;
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
       *
       * [frame (ret x)
       *   (VM a x e '() (call-frame ret e r s))]
       */
      frame : function(args){ 
        var ret = args.get(0);
        var x = args.get(1);
        this.s = list(ret, this.e, this.r, this.s);
        this.r = list();
        this.x = x;
        return this;
      },

      /*
       * adds the value in the accumulator to the current rib
       * sets the next expression to x
       *
       * [argument (x)
       *   (VM a x e (cons a r) s)]
       */
      argument : function(args){ 
        var x = args.get(0);
        this.x = x;
        this.r = cons(this.a, this.r);
        return this;
      },

      /*
       * takes the closure in the accumulator and:
       * extends the closure's environment with the closure's
       * variable list and the current rib,
       * sets the current environment to this new environment,
       * sets the current rib to the empty list,
       * sets the next expression to the closure's body.
       *
       * [apply ()
       *   (record a (body e vars)
       *     (VM a body (extend e vars r) '() s))]
       */
      apply : function(){

   
        var body = this.a.get(0);
        var e = this.a.get(1);
        var vars = this.a.get(2);

        this.x = body;
        if (vars.type === 'symbol'){
          this.e = extend(e, list(vars), list(this.r));          
        } else if (vars.type === 'cons'){
          this.e = extend(e, vars, this.r);
        }
        this.r = list();

        return this;

      },

      /*
       * removes the first frame from the stack and resets the current
       * environment, the current rib, the next expression, and the current stack
       *
       *[return ()
       *  (record s (x e r s)
       *    (VM a x e r s))])))
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
          if (Log.isEnabled){
            Log.log('--------------------------------------');
            Log.log('a');
            Log.log(this.a);
            Log.log('x');
            Log.log(this.x);
            Log.log('e');
            Log.log(envToString(this.e));
            Log.log('r');
            Log.log(this.r);
            Log.log('s');
            Log.log(this.s);
            Log.log('--------------------------------------');
          }
          instruction = this.x.get(0).value;
          args = this.x.cdr;
          if (Log.isEnabled){
            Log.log("calling " + instruction + " args = " + args);
          }


          result = (this[instruction]).apply(this, [args]);
        }
        Log.log("=============================================");
        return result;
      }
    };
  }

  function envToString(e){
    var s = "+\n";
    if (e !== undefined && e !== Types.NULL_CONS){
      var vars = e.car.car;
      var vals = e.car.cdr;
      while (vars !== Types.NULL_CONS){
        s += vars.car.toString() + " = " + vals.car.toString() + "\n";
        vars = vars.cdr;
        vals = vals.cdr;
      }
      return s + envToString(e.cdr);
    }
    return "";
  }

  function continuation(stack){
    return closure(list(s('nuate'), stack, s('v')), list(), list(s('v')));
  }

  function closure(body, e, vars){
		var c = list(body, e, vars);
		c.toString = function(){
			return list(s('compiled'), body, vars).toString();
		};
    return c;
  }

  function lookup(symbol, e){
    var nil = list();
    while (e !== nil){
      var vars = e.car.car;
      var vals = e.car.cdr;
      while(vars != nil){
        if (symbol === vars.car){
          return vals;
        }
        vars = vars.cdr;
        vals = vals.cdr;
      }
      e = e.cdr;
    }
    return e;
  }

  function extend(e, vars, vals){
    return cons(cons(vars, vals), e);
  }

  function addToEnv(e, vr, val){
    var vars = e.car.car;
    var vals = e.car.cdr;

    var newVarTail = Types.newCons(vars.car, vars.cdr);
    vars.setCdr(newVarTail);
    vars.setCar(vr);


    var newValTail = Types.newCons(vals.car, vals.cdr);
    vals.setCdr(newValTail);
    vals.setCar(val);
    
  }

  function evaluate(x, vm){
    var compiled = Compiler.compile(x, _HALT_);
    Log.log(x + " -> " + compiled);
    vm['x'] = compiled;
    return vm.cycle();
  }


  function createBuiltIn(name, f, vars, vm){
    f['toString'] = function(){ return '<' + name + '>';};
    f.vars = vars;
    evaluate(list(s('set!'), s(name), list(s('lambda'), vars, f)), vm);
  }

  function newEvaluator(){
    return {
      evaluate : function(x){        
        var parsed = Parser.newParser(x).parse();
        var result = [];
        for (var i=0; i<parsed.length; i++){
          var r = evaluate(parsed[i], this.vm);
          Log.log(r);
          result.push(r);
        }
        return result;
      },
      vm : newVM(list(), list(), cons(cons(list(s('_')), list(s('_'))), list()), list(), list()),
      addNative : function(name, f, vars){
        createBuiltIn(name, f, vars.map(function(x){return s(x);}).toCons(), this.vm);
      }
    };
  }

  return {
    newEvaluator : newEvaluator
  };
}();
