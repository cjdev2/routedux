# Routedux — Routes the Redux Way [![npm version](https://badge.fury.io/js/routedux.svg)](https://badge.fury.io/js/routedux) [![Build Status](https://travis-ci.org/cjdev/routedux.svg?branch=master)](https://travis-ci.org/cjdev/routedux) 

<img alt="Route Dux" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Ducks_crossing_the_road_sign.png/92px-Ducks_crossing_the_road_sign.png" align="right" />

Routedux (:duck: :duck: :duck:) routes URLs to Redux actions and vice versa. 

Your application doesn't need to know it lives in a browser, but your users want pretty urls and deep links. 

## Wait, my application doesn't need to know it lives in a browser?

URLs are great for finding things on the internet.  But a single page application is not the same as a collection of 
resources that lives on a remote server.

A single page application is a web application only in the sense that it lives on the web.  URLs are are not essential
to it working well.  

URLs give users accessing your application in a browser the ability to bookmark a particular view in your application
so that their expectation of browser-based applications will continue to work.

We think that's a good thing, but we also don't think the idea of url paths should be littered through your application.

When you are developing a redux application, you want your UI to be a pure function of the current state tree.  

By adding routes to that, it makes it harder to test.  And this difficulty can be compounded by other decisions about how
to add routes to your application. 

## An alternative approach

React Router is the currently-accepted way to do URL routing in React applications.  For a standard React application without
Redux, this solution isn't too bad.  But once you add Redux, things get difficult.

We basically discovered the same lessons as Formidable Labs: [React Router is the wrong way to route in Redux apps.](http://formidable.com/blog/2016/07/11/let-the-url-do-the-talking-part-1-the-pain-of-react-router-in-redux/)

However, we don't think their solution ([redux-little-router](https://github.com/FormidableLabs/redux-little-router)) 
goes far enough, as it still embeds the idea of routes throughout your user interface.

Once you separate URLs from your application state, you can easily port it to other environments that don't know what
URLs are, and by simply removing the routing declaration, things will work as before.  

As an added (and we think absolutely essential) benefit, your entire application becomes easier to test, as rendering
is a pure function of Redux state, and model logic and route actions are entirely encapsulated in Redux outside of the app.

## Demo Site

See a simple [demo documentation site.](https://github.com/cjdev/routedux-docs-demo)

## Simple Routing in 25 lines

```javascript
import installBrowserRouter from 'routedux';
import {createStore, compose} from 'redux';

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

const {enhancer, init} = installBrowserRouter(routesConfig);

const store = createStore(reduce, compose(
  enhance
));

//when you are ready to handle the initial page load (redux-saga and similar libraries necessitate this being separte)
init();

```

Any time a handled action fires the url in the address bar will change, and if the url in the address bar changes
the corresponding action will fire (unless the action was initiated by a url change).


## Route matching precedence - which route matches best?

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

## Fragment component

Given that every UI state will be in your state tree as a function of your reducer logic, you can express any restriction
on which parts of the UI display, even those that have nothing to do with the specific transformations caused by 
your URL actions.

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
## ActionLink and pathForAction(action)

Occasionally it is nice to render URLs inside of your application.

As a convenience, we have attached `pathForAction` to the  `store` object, which uses the same matcher that the
action matcher uses.  This allows you to create links in your application by using the actions.

```javascript

const routesConfig = [
  ['/user/:id', LOAD_USER, {}],
  ['/user/me', LOAD_USER, {id: currentUserId()}]
];
// ... do store initialization

store.pathForAction({type:LOAD_USER, id: currentUserId()}); // returns /user/me

//  ActionLink

<ActionLink action={{type:LOAD_USER, id: 123}}>Link Text</ActionLink>
// renders as <a href="/user/123">Link Text</a>

```

Now you have links, but your links always stay up to date with your routing configuration.  
