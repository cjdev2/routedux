import {createActionDispatcher} from "./action-router";

function buildMiddleware(actionDispatcher) {
  return store => next => action => {
    if (actionDispatcher.handlesAction(action)) {
      actionDispatcher.receiveAction(action, store);
    }
    return next(action);
  };
}

function enhanceStoreCreator(actionDispatcher) {
  return function enhanceStore(nextStoreCreator) {
    const middleware = buildMiddleware(actionDispatcher);

    return (reducer, finalInitialState, enhancer) => {
      const theStore = nextStoreCreator(reducer, finalInitialState, enhancer);

      actionDispatcher.activateDispatcher(theStore);

      theStore.dispatch = middleware(theStore)(
        theStore.dispatch.bind(theStore)
      );
      return theStore;
    };
  };
}

export default function installBrowserRouter(routesConfig, window) {
  const actionDispatcher = createActionDispatcher(routesConfig, window);

  const middleware = x => {
    //eslint-disable-next-line no-console
    console.warn(
      "Using the routedux middleware directly is deprecated, the enhancer now" +
      " applies it automatically and the middleware is now a no-op that" +
      " will be removed in later versions."
    );
    return y => y;
  };

  return {
    middleware,
    enhancer: enhanceStoreCreator(actionDispatcher),
    init: actionDispatcher.receiveLocation.bind(
      actionDispatcher,
      window.location
    ),
    _actionDispatcher: actionDispatcher
  };
}
