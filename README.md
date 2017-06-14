# Routux — Routes the Redux Way

Routux routes URLs to Redux actions and vice versa. 

Your application doesn't need to know it lives in a browser, but your users want pretty urls and deep links.

## Wait, why would you want to do that?  Aren't URLs pretty essential for web applications?

React Router is the currently-accepted way to do routing in React applications.  We found some issues with that, and 
we basically agree with Formidable Labs that [React Router is the wrong way to route in Redux apps.](http://formidable.com/blog/2016/07/11/let-the-url-do-the-talking-part-1-the-pain-of-react-router-in-redux/)

However, we don't think their solution ([redux-little-router](https://github.com/FormidableLabs/redux-little-router)) 
goes far enough, as it still embeds the idea of routes throughout your React component structure.

We think a cleaner separation would be to think of UI state as another part of the state tree, along with the data model.

This allows your application to determine how to display itself without reference to being on the world-wide web.

It also means that you can express all UI transitions as actions instead of URL changes, making your application portable
to non-web environments without requiring some other routing technology.  

If you'd like to make it a mobile app, just remove the routes, and as long as you're not relying on links and urls, everything
works just as before.

As an added (and we think absolutely essential) benefit, your entire application becomes easier to test, as rendering
is a pure function of Redux state, and model logic is entirely encapsulated in Redux outside of the app.

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

Route precedence is a function of the type of matching done in each segment and the order in which the wildcard segments
match.  Exact matches are always preferred to wildcards moving from left to right.  

```javascript

    const routesInOrderOfPrecedence = [
      
      ['/user/me/update', '/user/me'], // both perfectly specific - will match above any wildcard route
      '/user/me/:view',
      '/user/:id/update', // less specific because 'me' is exact match, while :id is a wildcard
      '/user/:id/:view'
    ];

```

## Usage with fragment

```javascript

const state = {
  menu: ...
}

const view = (
  <PageFrame>
      <Fragment state={state} filterOn="menu">
        <Menu />
      </Fragment>
  </PageFrame>
)

// If menu is truthy, this renders as:

(
  <PageFrame>
    <Menu />
  </PageFrame>
)

// If menu is falsy, this renders as:
(
  <PageFrame>
  </PageFrame>
)

///////

const state = {
  menu: {
    prop: true
  }
}

// If property is missing in path, it's falsy.

const view = (
  <PageFrame>
      <Fragment state={state} filterOn="menu.missingProp.something">
        <Menu />
      </Fragment>
  </PageFrame>
)

// Renders as: 
(
  <PageFrame>
  </PageFrame>
)

```






