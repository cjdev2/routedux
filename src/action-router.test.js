import {applyMiddleware, createStore, compose} from 'redux';

import installBrowserRouter from './action-router';
import addChangeUrlEvent from './change-url-event.js';
import addMissingHistoryEvents from './history-events.js';

const console_log = console.log;
console.log = () => {};
function with_console(cb) {
  console.log = console_log;
  try {
    cb();
  } catch (e) {
    console.log = () => {};
    throw e;
  }
  console.log = () => {};
}

function createLocation(path) {
  return {
    hash: '#hash',
    host: 'example.com',
    hostname: 'example',
    origin: '',
    href: '',
    pathname: path,
    port: 80,
    protocol: 'https:'
  };
}

function createFakeWindow(path='/path/to/thing') {
  let locations = [createLocation('(root)')];
  function pushLocation(window, path) {
    let newLoc = createLocation(path);
    locations.push(newLoc);
    window.location = newLoc;
    return newLoc;
  }
  function popLocation(window) {
    locations.pop();
    let newLoc = locations[locations.length-1];
    window.location = newLoc;
    return newLoc;
  }

  const window = {
    history: {
      pushState: jest.fn((_, __, path) =>
                         {window.location = pushLocation(window, path)}),
      replaceState: jest.fn(),
    }
  };

  pushLocation(window, path);
  const map = {};

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb;
  });

  function prepareEvent(window, evName) {
    if (evName == 'popstate') {
      window.location = popLocation(window);
    }
  }

  window.dispatchEvent = jest.fn(ev => {
    const evName = ev.type;
    if(map[evName]) {
      prepareEvent(window, evName);
      map[evName].handleEvent(ev);
    }
  });

  return window;
}

function setupTest(routesConfig, path='/path/to/thing') {
  const window = createFakeWindow(path);
  const mockPushState = window.history.pushState;
  addMissingHistoryEvents(window, window.history);
  addChangeUrlEvent(window, window.history);

  const {middleware, enhancer, init} = installBrowserRouter(routesConfig, window);
  const reduce = jest.fn();

  const store = createStore(
    reduce,
    compose(
      enhancer,
      applyMiddleware(
        middleware)));

  function urlChanges() {
    return mockPushState.mock.calls.map(item => item[2]);
  }

  function actionsDispatched() {
    return reduce.mock.calls.map(item => item[1]).slice(1);
  }

  function fireUrlChange(path) {
    window.dispatchEvent(new CustomEvent('urlchanged', {detail: createLocation(path)}));
  }

  return {store, reduce, window, urlChanges, actionsDispatched, fireUrlChange, init};
}


it("router handles exact match in preference to wildcard match", () => {
  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, id: 1};
  const routesConfig = [
    ["/somewhere/:id", actionType, {}],
    ["/somewhere", actionType, {id: 1}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere']);

});

it("router doees not dispatch an action from url change that is caused by action dispatch", () => {
  //given
  const actionType = 'THE_ACTION';
  const id = "1";
  const view = "home";
  const action = {type: actionType, id, view};
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, {view: "home"}],
  ];
  const {urlChanges, store, actionsDispatched, init} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(actionsDispatched()).toEqual([action]);
});

it("popstate doesn't cause a pushstate", () => {
  //given
  const actionType = 'THE_ACTION';
  const id = "1";
  const view = "home";
  const action = {type: actionType, id, view};
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, {view: "home"}],
  ];

  const {
    urlChanges,
    store,
    actionsDispatched,
    fireUrlChange,
    init,
    window
  } = setupTest(routesConfig, '/somewhere/foo/default');

  init();
  window.history.pushState({}, '', '/somwhere/bar/default');


  // when
  window.dispatchEvent(new CustomEvent('popstate', {}));

  // then
  expect(urlChanges().length).toEqual(1);
});

it("router handles wildcard with extra args correctly", () => {

  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, id: 1, view: "home"};
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, {view: "home"}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);

});


it("router handles wildcard with extraArgs correctly with reverse order", () => {

  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, id: 1, view: "home"};
  const routesConfig = [
    ["/somewhere/:id/default", actionType, {view: "home"}],
    ["/somewhere/:id/:view", actionType, {}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);

});

it("router handles wildcard without extraArgs correctly", () => {

  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, id: 1};
  const routesConfig = [
    ["/somewhere/:id/default", actionType, {}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(['/somewhere/1/default']);

});

it("router handles wildcard with no match correctly", () => {

  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, foo: 1};
  const routesConfig = [
    ["/somewhere/:id/default", actionType, {}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);

});

it("router does not match when all args are not accounted for", () => {
  //given
  const actionType = 'THE_ACTION';
  const action = {type: actionType, id: 1, view: "home"};
  const routesConfig = [
    ["/somewhere/:id/default", actionType, {}],
  ];
  const {urlChanges, store} = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);
});

it("router should match non-wildcard route in preference to wildcard route", () => {
  // given
  const routesConfig = [
    ['/somewhere/:id', 'ACTION_NAME', {}],
    ["/somewhere/specific", 'ACTION_NAME', {id: 1}],
  ];
  const {actionsDispatched, fireUrlChange} = setupTest(routesConfig);

  // when
  fireUrlChange('/somewhere/specific');

  // then
  expect(actionsDispatched()).toEqual([{type: 'ACTION_NAME', id: 1}]);
});

it("router should throw on duplicate paths", () => {
  // given
  const routesConfig = [
    ['/somewhere/:id', 'ACTION_NAME', {}],
    ["/somewhere/:id", 'ACTION_NAME', {}],
  ];

  expect( () => {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should throw on equally specific routes", () => {
  // given
  const routesConfig = [
    ['/somewhere/:id', 'ACTION_NAME', {}],
    ["/somewhere/:specific", 'ACTION_NAME', {}],
  ];

  expect( () => {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should match less-wildcarded routes in preference to more wildcarded routes", () => {
  //given
  const routesConfig = [
    ["/somewhere/:id/:view/:bar", "ACTION_NAME", {}],
    ["/somewhere/:foo/:id/:view/:baz", "ACTION_NAME", {}],
  ];
  const {actionsDispatched, fireUrlChange} = setupTest(routesConfig);

  // when
  fireUrlChange('/somewhere/specific/etc/bar');

  // then
  expect(actionsDispatched()).toEqual([{type:'ACTION_NAME', id: "specific", view: "etc", bar: "bar"}]);

});

it("router should propagate matches through non-matching cases", () => {
  //given
  const routesConfig = [
    ["/somewhere/specific/:view", "ACTION_NAME", {id: 1}],
    ["/somewhere/:id/:view", "ACTION_NAME", {}],
    ["/not/a/match", "ACTION_NAME", {}]
  ];
  const {actionsDispatched, fireUrlChange} = setupTest(routesConfig);

  // when
  fireUrlChange('/somewhere/specific/etc');

  // then
  expect(actionsDispatched()).toEqual([{type:'ACTION_NAME', id: 1, view: "etc"}]);

});

it("router should give precedence to exact match first in equally-specific routes (/a/:b vs /:a/b)", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];
  const {actionsDispatched, fireUrlChange} = setupTest(routesConfig);

  // when
  fireUrlChange("/something/something");

  // then
  expect(actionsDispatched()).toEqual([{type: 'ACTION_NAME', dynamic: 'something'}]);

});

it("router handles the current location when initialized", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];

  // when
  /// We break the pattern because we're testing store construction.
  const {actionsDispatched, init} = setupTest(routesConfig, '/something/something');
  init();

  // then
  expect(actionsDispatched()).toEqual([{type: 'ACTION_NAME', dynamic: 'something'}]);

});

it("pathForAction should render a route", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];
  const action = {type:'ACTION_NAME', dynamic: 'hooray'};
  const {store} = setupTest(routesConfig);
  // when
  const actual = store.pathForAction(action);

  // then
  expect(actual).toEqual('/something/hooray');
});

console.log = console_log;
