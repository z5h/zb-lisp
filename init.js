var __e__ = null;
function e(x){
  if (__e__ === null){
    __e__ = Evaluator.newEvaluator();

    __e__.addNative('=',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return ((a === b) ||  (a.type === 'number'
          && b.type === 'number'
          && a.value === b.value))

        ? Types.T : Types.F;
      },
      ['a','b']);

    __e__.addNative('+',
      function(map){
        Log.log("mape is"); Log.log(map);
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value + b.value);
      },
      ['a','b']);

    __e__.addNative('-',
      function(map){
        var a = map['a'];
        var b = map['b'];

        return Types.newNumber(a.value - b.value);
      },
      ['a','b']);
  }
  return __e__.evaluate(x);
}

function init(){
  e("" +
    "(set! cons                     " +
    "      (lambda (x y)            " +
    "        (lambda (m) (m x y)))) " +
    "(set! car                      " +
    "      (lambda (z)              " +
    "        (z (lambda (p q) p)))) " +
    "(set! cdr                      " +
    "      (lambda (z)              " +
    "        (z (lambda (p q) q)))) " +
    //"(car (cons 11 12)) ");
    "");
}
