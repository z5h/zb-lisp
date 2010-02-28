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