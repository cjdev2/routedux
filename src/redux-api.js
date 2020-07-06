import { createActionDispatcher } from "./action-router";

function buildMiddleware(actionDispatcher) {
  return (_) => (next) => (action) => {
    actionDispatcher.receiveAction(action);

    return next(action);
  };
}

function enhanceStoreFactory(actionDispatcher) {
  return function enhanceStore(nextStoreCreator) {
    const middleware = buildMiddleware(actionDispatcher);

    return (reducer, finalInitialState, enhancer) => {
      const theStore = nextStoreCreator(reducer, finalInitialState, enhancer);

      actionDispatcher.addActionListener((action) => theStore.dispatch(action));

      theStore.pathForAction = actionDispatcher.pathForAction.bind(
        actionDispatcher
      );

      theStore.dispatch = middleware(theStore)(
        theStore.dispatch.bind(theStore)
      );
      return theStore;
    };
  };
}

export default function installBrowserRouter(routesConfig, _window = window) {
  const actionDispatcher = createActionDispatcher(routesConfig, _window);

  const middleware = (x) => {
    //eslint-disable-next-line no-console
    console.warn(
      "Using the routedux middleware directly is deprecated, the enhancer now" +
        " applies it automatically and the middleware is now a no-op that" +
        " will be removed in later versions."
    );
    return (y) => y;
  };

  return {
    middleware,
    enhancer: enhanceStoreFactory(actionDispatcher),
    init: actionDispatcher.init.bind(actionDispatcher),
    _actionDispatcher: actionDispatcher,
  };
}
