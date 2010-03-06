(define list (lambda x x))

(define map
	(lambda (f l) 
		(if (null? l) l 
			(cons (f (car l)) 
						(map f (cdr l))))))

(define foldr
	(lambda (func end lst)
		(if (null? lst)  
			end
			(func (car lst) (foldr func end (cdr lst))))))

(define foldl
	(lambda (func accum lst)
	(if (null? lst)
		accum
			(foldl func (func accum (car lst)) (cdr lst)))))

(define fold foldl)
(define reduce fold)

(define filter
	(lambda (pred lst)   
	(foldr 
		(lambda (x y) 
				(if (pred x) 
					(cons x y) y)) 
			'() lst)))

(define not 
	(lambda (x)
		(if x #f #t)))
