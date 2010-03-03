(set! map
	(lambda (f l) 
		(if (null? l) l 
			(cons (f (car l)) 
						(map f (cdr l))))))

(set! not 
	(lambda (x)
		(if x #f #t)))
