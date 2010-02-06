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
      while ((head.cdr !== NULL) && (head.cdr.type == "cons")){
        s += head.car.toString() + " ";
        head = head.cdr;
      }
      if (head.cdr == NULL){
        s += ")";
      } else {
        s += " . " + head.cdr.toString() + ")";
      }
      return s;
    }
  };
}

var NULL = {
  type : "cons",
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

function car(x){
  return x.car;
}

function cdr(x){
  return x.cdr;
}

function isNull(x){
  return x == NULL;
}
function isList(x){
  return x.type == "cons" && (x == NULL || isList(cdr(x)));
}

var parser = {
  EOF : [],
  text : "",
  last : 0,
  position : 0,
  whitespace : " \t\n\r\f",
  digits : "0123456789",
  nonsymbol : " \n\n\r\f()`\"\\[]'@,.",

  parse :  function(){
    this.last = this.text.length - 1;
    var p = this.parseNext();
    while (p !== null){
      Log.log(p); //.toString());
      p = this.parseNext();
    }
    Log.log("done");
  },

  parseNext : function (){
    this.skip();
    if (this.eof()){
      return null;
    }

    var n = this.chr();
    if (this.eof()){
      return null;
    } else if ("(" == n){
      return this.parseExpression();
    } else if ("\"" == n) {
      return this.parseString();
    } else if (this.digits.indexOf(n)>-1){
      return this.parseNumber();
    } else if (this.nonsymbol.indexOf(n)<0){
      return this.parseSymbol();
    } else if ("." == n) {
      //...
    }

    return null;
  },

  parseExpression : function(){
    this.fwd(); //skip past first "("
    this.skip();//skip any whitespace after "("
    //empty list special case
    if (this.chr() == ")"){
      this.fwd();
      return NULL;
    }

    var head = newCons(NULL, NULL);
    var tail = head;
    while (this.chr() !== ")"){
      tail.setCar(this.parseNext());
      tail.setCdr(newCons(NULL, NULL));
      tail = tail.cdr;
    }
    this.fwd();
    return head;
  },

  parseString : function(){
    //we start on ", consume it
    this.fwd();
    var start = this.position;
    while(this.chr() !== "\""){
      this.fwd();
    }
    var end = this.position;

    this.fwd();
    return newString(this.text.substring(start, end));
  },

  parseNumber : function(){
    var value = 0;
    var index = 0;
    while((index = this.digits.indexOf(this.chr())) > -1){
      value = 10*value + index;
      this.fwd();
    }
    return newNumber(value);
  },

  parseSymbol : function(){
    var start = this.position;
    this.fwd();
    while (this.nonsymbol.indexOf(this.chr()) < 0){
      this.fwd();
    }
    return newSymbol(this.text.substring(start, this.position));
  },

  eof : function(){
    return (this.position > this.last);
  },

  chr : function(){
    if (!this.eof()){
      return (this.text.charAt(this.position));
    } 
    return this.EOF;
  },

  fwd : function(){
    if (this.position <= this.last){
      this.position++;
    }
  },

  skip : function(){
    while ((!this.eof()) && (this.whitespace.indexOf(this.chr()) > -1)){
      this.fwd();
    }
  }

};

