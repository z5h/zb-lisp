var __e__ = null;
function e(x){
  if (__e__ === null){
    __e__ = Evaluator.newEvaluator();

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
