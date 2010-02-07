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
    for (k in map){
      if (map.hasOwnProperty(k)){
        e[k] = map[k];
      }
    }
    return e;
  };
}
