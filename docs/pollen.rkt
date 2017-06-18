#lang racket/base
(require pollen/tag)
(provide (all-defined-out))
(define head-tag 'h2)
(define headline (default-tag-function head-tag))
(define (term val)
  (let ([code (default-tag-function 'code)]
	[u (default-tag-function 'u)]
	[a (default-tag-function 'a)])
    (code (u (a #:href (string-append "#" val)
		val)))))
(define def (default-tag-function 'a #:name "foo"))
(define items (default-tag-function 'ul))
(define item (default-tag-function 'li 'p))
(define (link url text) `(a ((href ,url)) ,text))
