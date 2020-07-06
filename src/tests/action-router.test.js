import { createStore } from "redux";

import installBrowserRouter from "../redux-api";
import addChangeUrlEvent from "../change-url-event.js";
import addMissingHistoryEvents from "../history-events.js";

import { createFakeWindow, createLocation } from "./test-utils";

//eslint-disable-next-line no-console
const console_log = console.log;
//eslint-disable-next-line no-console
console.log = () => {};
// function with_console(cb) {
//   console.log = console_log;
//   try {
//     cb();
//   } catch (e) {
//     console.log = () => {};
//     throw e;
//   }
//   console.log = () => {};
// }

function setupTest(routesConfig, path = "/path/to/thing") {
  const window = createFakeWindow(path);
  const mockPushState = window.history.pushState;
  addMissingHistoryEvents(window, window.history);
  addChangeUrlEvent(window, window.history);

  const { enhancer, init, _actionDispatcher } = installBrowserRouter(
    routesConfig,
    window
  );
  const reduce = jest.fn();

  const store = createStore(reduce, enhancer);

  function urlChanges() {
    return mockPushState.mock.calls.map((item) => item[2]);
  }

  function actionsDispatched() {
    return reduce.mock.calls.map((item) => item[1]).slice(1);
  }

  function fireUrlChange(path) {
    window.dispatchEvent(
      new CustomEvent("urlchanged", { detail: createLocation(path) })
    );
  }

  return {
    store,
    reduce,
    window,
    urlChanges,
    actionsDispatched,
    fireUrlChange,
    init,
    _actionDispatcher,
  };
}

it("router handles exact match in preference to wildcard match", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, id: 1 };
  const routesConfig = [
    ["/somewhere/:id", actionType, {}],
    ["/somewhere", actionType, { id: 1 }],
  ];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(["/somewhere"]);
});

it("router does not dispatch an action from url change that is caused by action dispatch", () => {
  //given
  const actionType = "THE_ACTION";
  const id = "1";
  const view = "home";
  const action = { type: actionType, id, view };
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, { view: "home" }],
  ];
  const { store, actionsDispatched } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(actionsDispatched()).toEqual([action]);
});

it("popstate doesn't cause a pushstate", () => {
  //given
  const actionType = "THE_ACTION";
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, { view: "home" }],
  ];

  const { urlChanges, init, window } = setupTest(
    routesConfig,
    "/somewhere/foo/default"
  );

  init();
  window.history.pushState({}, "", "/somwhere/bar/default");

  // when
  window.dispatchEvent(new CustomEvent("popstate", {}));

  // then
  expect(urlChanges().length).toEqual(1);
});

it("router handles wildcard with extra args correctly", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, id: 1, view: "home" };
  const routesConfig = [
    ["/somewhere/:id/:view", actionType, {}],
    ["/somewhere/:id/default", actionType, { view: "home" }],
  ];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(["/somewhere/1/default"]);
});

it("router handles wildcard with extraArgs correctly with reverse order", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, id: 1, view: "home" };
  const routesConfig = [
    ["/somewhere/:id/default", actionType, { view: "home" }],
    ["/somewhere/:id/:view", actionType, {}],
  ];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(["/somewhere/1/default"]);
});

it("router handles wildcard without extraArgs correctly", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, id: 1 };
  const routesConfig = [["/somewhere/:id/default", actionType, {}]];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then
  expect(urlChanges()).toEqual(["/somewhere/1/default"]);
});

it("router handles wildcard with no match correctly", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, foo: 1 };
  const routesConfig = [["/somewhere/:id/default", actionType, {}]];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);
});

it("router does not match when all args are not accounted for", () => {
  //given
  const actionType = "THE_ACTION";
  const action = { type: actionType, id: 1, view: "home" };
  const routesConfig = [["/somewhere/:id/default", actionType, {}]];
  const { urlChanges, store } = setupTest(routesConfig);

  // when
  store.dispatch(action);

  // then ( no url changes triggered)
  expect(urlChanges()).toEqual([]);
});

it("router should match non-wildcard route in preference to wildcard route", () => {
  // given
  const routesConfig = [
    ["/somewhere/:id", "ACTION_NAME", {}],
    ["/somewhere/specific", "ACTION_NAME", { id: 1 }],
  ];
  const { actionsDispatched, fireUrlChange } = setupTest(routesConfig);

  // when
  fireUrlChange("/somewhere/specific");

  // then
  expect(actionsDispatched()).toEqual([{ type: "ACTION_NAME", id: 1 }]);
});

it("router should throw on duplicate paths", () => {
  // given
  const routesConfig = [
    ["/somewhere/:id", "ACTION_NAME", {}],
    ["/somewhere/:id", "ACTION_NAME", {}],
  ];

  expect(() => {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should throw on equally specific routes", () => {
  // given
  const routesConfig = [
    ["/somewhere/:id", "ACTION_NAME", {}],
    ["/somewhere/:specific", "ACTION_NAME", {}],
  ];

  expect(() => {
    setupTest(routesConfig);
  }).toThrow();
});

it("router should match less-wildcarded routes in preference to more wildcarded routes", () => {
  //given
  const routesConfig = [
    ["/somewhere/:id/:view/:bar", "ACTION_NAME", {}],
    ["/somewhere/:foo/:id/:view/:baz", "ACTION_NAME", {}],
  ];
  const { actionsDispatched, fireUrlChange } = setupTest(routesConfig);

  // when
  fireUrlChange("/somewhere/specific/etc/bar");

  // then
  expect(actionsDispatched()).toEqual([
    { type: "ACTION_NAME", id: "specific", view: "etc", bar: "bar" },
  ]);
});

it("router should propagate matches through non-matching cases", () => {
  //given
  const routesConfig = [
    ["/somewhere/specific/:view", "ACTION_NAME", { id: 1 }],
    ["/somewhere/:id/:view", "ACTION_NAME", {}],
    ["/not/a/match", "ACTION_NAME", {}],
  ];
  const { actionsDispatched, fireUrlChange } = setupTest(routesConfig);

  // when
  fireUrlChange("/somewhere/specific/etc");

  // then
  expect(actionsDispatched()).toEqual([
    { type: "ACTION_NAME", id: 1, view: "etc" },
  ]);
});

it("router should give precedence to exact match first in equally-specific routes (/a/:b vs /:a/b)", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];
  const { actionsDispatched, fireUrlChange } = setupTest(routesConfig);

  // when
  fireUrlChange("/something/something");

  // then
  expect(actionsDispatched()).toEqual([
    { type: "ACTION_NAME", dynamic: "something" },
  ]);
});

it("actionDispatcher keeps track of current action and current path", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/hi/something", "ACTION_NAME", { dynamic: "foo" }],
  ];
  const { actionsDispatched, fireUrlChange, _actionDispatcher } = setupTest(
    routesConfig
  );

  // when
  fireUrlChange("/something/something");
  //then
  expect(_actionDispatcher.currentAction).toEqual({
    type: "ACTION_NAME",
    dynamic: "something",
  });
  expect(_actionDispatcher.currentPath).toEqual("/something/something");

  //when
  fireUrlChange("/hi/something");
  //then
  expect(_actionDispatcher.currentAction).toEqual({
    type: "ACTION_NAME",
    dynamic: "foo",
  });
  expect(_actionDispatcher.currentPath).toEqual("/hi/something");
});

it("router handles the current location when initialized", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];

  // when
  /// We break the pattern because we're testing store construction.
  const { actionsDispatched, init } = setupTest(
    routesConfig,
    "/something/something"
  );
  init();

  // then
  expect(actionsDispatched()).toEqual([
    { type: "ACTION_NAME", dynamic: "something" },
  ]);
});

it("pathForAction should render a route", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];
  const action = { type: "ACTION_NAME", dynamic: "hooray" };
  const { _actionDispatcher } = setupTest(routesConfig);
  // when
  const actual = _actionDispatcher.pathForAction(action);

  // then
  expect(actual).toEqual("/something/hooray");
});

it("cannot be double init'd", () => {
  // given
  const routesConfig = [
    ["/something/:dynamic", "ACTION_NAME", {}],
    ["/:dyn/something", "ACTION_NAME", {}],
  ];
  const { init, fireUrlChange, _actionDispatcher } = setupTest(
    routesConfig,
    "/something/foo"
  );
  // when
  init();
  expect(_actionDispatcher.currentPath).toEqual("/something/foo");
  fireUrlChange("/foo/something");
  expect(_actionDispatcher.currentPath).toEqual("/foo/something");
  init();
  expect(_actionDispatcher.currentPath).toEqual("/foo/something");
});

//eslint-disable-next-line no-console
console.log = console_log;
