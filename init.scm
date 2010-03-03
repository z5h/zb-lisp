(set! map
	(lambda (f l) 
		(if (null? l) l 
			(cons (f (car l)) 
						(map f (cdr l))))))

(set! foldr 
	(lambda (func end lst)
		(if (null? lst)  
			end
			(func (car lst) (foldr func end (cdr lst))))))

(set! foldl 
	(lambda (func accum lst)
	(if (null? lst)
		accum
			(foldl func (func accum (car lst)) (cdr lst)))))

(set! fold foldl)
(set! reduce fold)

(set! filter 
	(lambda (pred lst)   
	(foldr 
		(lambda (x y) 
				(if (pred x) 
					(cons x y) y)) 
			'() lst)))

(set! not 
	(lambda (x)
		(if x #f #t)))
