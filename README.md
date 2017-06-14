# Routux — Routes the Redux Way

Routux is a little router that removes the idea of routes from your react application and instead makes them actions
that you can handle in redux, allowing a complete separation of the url state from your application state.

## Wait, why would you want to do that?  Aren't URLs pretty essential for web applications?

TODO - rewrite this so it sucks less.  Main points - maintainability, proper separation of conerns, redux-paradigm purity

TODO - reference redux-little-router and the articles from there and why they don't go far enough.

Yes, URLs are one of the main interfaces for the web.  But they are not the main interface for single-page applications.

They're a tacked-on addition inside your javascript. 

Basically, we want to express that while a user may want to interact with, or copy/paste a url, it is not an intrinsic
restriction of user interface that deserves to be littering your code with path-based restrictions.

Additionally, by removing this, we reduce the amount of UI testing that needs to be done by making the entire user 
interface a pure function of your redux state.  Woot!  That's great.  In MVC terms, React components are "view" level 
while routes are a model or controller concern.  They should express either a resource to load, or a particular state
of the application.

## Routing in 25 lines

```javascript
import installBrowserRouter from 'routux';
import {createStore, compose, applyMiddleware} from 'redux';

const LOAD_USER = 'LOAD_USER';

function currentUserId() {
  return 42;
};

function reduce(state = initialState(), action) {
  ...
}

const routesConfig = [
  ['/user/:id', LOAD_USER, {}],
  ['/user/me', LOAD_USER, {id: currentUserId()}],
  ['/article/:slug', 'LOAD_ARTICLE', {}],
  ['/', 'LOAD_ARTICLE', {slug: "home-content"}]
];

const {enhancer, middleware} = installBrowserRouter(routesConfig);

const store = createStore(reduce, compose(
  enhance,
  applyMiddleware(middleware)
));

```

Any time a handled action fires the url in the address bar will change, and if the url in the address bar changes
the corresponding action will fire (unless the action was initiated by a url change).


## Route precedence examples (how we resolve seeming ambiguity)

## Usage with fragment

see our demo app

## 



