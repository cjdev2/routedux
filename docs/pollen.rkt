#lang racket

(require pollen/tag compatibility/defmacro)
(require pollen/decode txexpr srfi/48)
(provide (all-defined-out))

(defmacro defun (name args . body)
  `(define (,name ,@args)
     ,@body))

(defun 1+ (n)
  (+ 1 n))

(define head-tag-num (make-parameter 0))
(defun current-head-tag ()
  (println (format "at head tag: ~a" (head-tag-num)))
  (string->symbol (format "h~d" (head-tag-num))))

(defun headline (element)
  ((default-tag-function (current-head-tag)) empty element))

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

(define %section-tag (default-tag-function 'section))

;; This is a macro so that the parameterize form evaluates in the right order
(define-syntax section
  (syntax-rules ()
    [(section #:headline %headline . body)
     (parameterize ([head-tag-num (1+ (head-tag-num))])
       (println (format "At head-tag-num ~d" (head-tag-num)))
       (section `,(headline %headline) . body))]
    [(section . body)
     (txexpr 'section empty
             (decode-elements (list . body)
                              #:txexpr-elements-proc
                              (lambda (x)
                                (decode-paragraphs x
                                                   #:linebreak-proc
                                                   (lambda (y) y)))))]))

(define (sidenote label . xs)
  `(splice-me
    (label ((for ,label) (class "margin-toggle sidenote-number")))
    (input ((id ,label) (class "margin-toggle")(type "checkbox")))
    (span ((class "sidenote")) ,@xs)))
