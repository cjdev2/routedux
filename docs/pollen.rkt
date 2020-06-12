#lang racket

(require pollen/tag compatibility/defmacro)
(require pollen/decode txexpr srfi/48)
(provide (all-defined-out))

(defmacro defun (name args . body)
  `(define (,name ,@args)
     ,@body))

(defmacro funcall (fun . args)
  `(,fun ,@args))

(defmacro defvar (name def)
  `(define ,name ,def))

;; This is a macro so that the parameterize form evaluates in the right order
(define-syntax section
  (syntax-rules ()
    [(section #:headline %headline . body)
     (parameterize ([head-tag-num (1+ (head-tag-num))])
       (section `,(headline %headline) . body))]
    [(section . body)
     (txexpr 'section empty
             (decode-elements (list . body)
                              #:txexpr-elements-proc
                              (lambda (x)
                                (decode-paragraphs x
                                                   #:linebreak-proc
                                                   (lambda (y) y)))))]))

(defvar head-tag-num
  (make-parameter 0))

(defvar def
  (default-tag-function 'a #:name "foo"))

(defvar items
  (default-tag-function 'ul))

(defvar item
  (default-tag-function 'li 'p))

(defvar %section-tag
  (default-tag-function 'section))

(defun 1+ (n)
  (+ 1 n))

(defun current-head-tag ()
  (string->symbol (format "h~d" (head-tag-num))))

(defun headline (element)
  (funcall (default-tag-function (current-head-tag)) empty element))

(defun term (val)
  (let ([code (default-tag-function 'code)]
        [u (default-tag-function 'u)]
        [a (default-tag-function 'a)])
    (code (u (a #:href (string-append "#" val)
                val)))))

(defun link (url text)
  `(a (funcall (href ,url)) ,text))

(defun sidenote (label . xs)
  `(splice-me
    (label ((for ,label) (class "margin-toggle sidenote-number")))
    (input ((id ,label) (class "margin-toggle")(type "checkbox")))
    (span ((class "sidenote")) ,@xs)))
