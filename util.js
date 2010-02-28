if (typeof Object.create !== 'function'){
  Object.create = function(o){
    var F = function(){};
    F.prototype = o;
    return new F();
  };
}

if (typeof Function.prototype.method !== 'function'){
  Function.prototype.method = function(name, func){
    this.prototype[name] = func;
    return this;
  };
}

if (typeof Object.extend !== 'function'){
  Object.extend = function(o, map){
    var e = Object.create(o);
    var k;
    for (k in map){
      if (map.hasOwnProperty(k)){
        e[k] = map[k];
      }
    }
    return e;
  };
}

if (typeof Object.prototype.pairs !== 'function'){
  Object.prototype.pairs = function(){
    var result = [];
    var k;
    for (k in this){
      if (this.hasOwnProperty(k)){
        result.push([k, this[k]]);
      }
    }
    return result;
  };
}

if (typeof Array.prototype.foldr !== 'function'){
  Array.prototype.foldr = function(fnc,start) {
    var a = start;
    for (var i = this.length-1; i > -1; i--) {
      a = fnc(this[i],a);
    }
    return a;
  };
}

if (typeof Array.prototype.foldl !== 'function'){
  Array.prototype.foldl = function(fnc,start) {
    var a = start;
    for (var i = 0; i < this.length; i++) {
      a = fnc(this[i],a);
    }
    return a;
  };

}

if (typeof Array.prototype.map !== 'function'){
  Array.map = function(f){
    var result = [];
    for (var i=0; i<this.length; i++){
      result.push(f(this[i]));
    }
    return result;
  };
}


