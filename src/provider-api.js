import * as R from "ramda";
import React, { useReducer, useEffect } from "react";
import PropTypes from "prop-types";

import { createActionDispatcher } from "./action-router";

const RouteContext = React.createContext(null);
const ActionDispatcherContext = React.createContext(null);

function RouteProvider({ children, routeDispatcher, _window }) {
  const [route, updateRoute] = useReducer((state, action) => action, {});

  useEffect(() => {
    return routeDispatcher.addRouteListener(updateRoute);
  });

  useEffect(() => {
    console.log("location received", _window.location);
    routeDispatcher.receiveLocation(_window.location);
  });

  console.log("route", route);

  return (
    <ActionDispatcherContext.Provider value={routeDispatcher}>
      <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
    </ActionDispatcherContext.Provider>
  );
}

RouteProvider.defaultProps = {
  _window: window ? window : null,
};

RouteProvider.propTypes = {
  _window: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  routeDispatcher: PropTypes.object,
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function withRoute(Component) {
  const routeAdded = ({ children, ...restProps }) => {
    return (
      <RouteContext.Consumer>
        {(route) => {
          console.log(route);
          return <Component {...{ ...restProps, route }}>{children}</Component>;
        }}
      </RouteContext.Consumer>
    );
  };
  routeAdded.displayName = `withRoute(${getDisplayName(Component)})`;
  routeAdded.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };
  return routeAdded;
}

function RouteLink({ routeName, params, children, ...props }) {
  const action = {
    type: routeName,
    ...params,
  };
  return (
    <ActionDispatcherContext.Consumer>
      {(dispatcher) => {
        const url = dispatcher.pathForAction(action);
        return (
          <a
            onClick={(ev) => {
              ev.preventDefault();
              dispatcher.receiveRoute({ routeName, ...params }, true);
            }}
            href={url}
            {...props}
          >
            {children}
          </a>
        );
      }}
    </ActionDispatcherContext.Consumer>
  );
}

RouteLink.propTypes = {
  route: PropTypes.string,
  params: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

function routeToAction(route) {
  return R.omit(["routeName"], R.assoc("type", route.routeName, route));
}
function actionToRoute(action) {
  return R.omit(["type"], R.assoc("routeName", action.type, action));
}

function createRouteDispatcher(routesConfig, _window = window) {
  const actionDispatcher = createActionDispatcher(routesConfig, _window);

  actionDispatcher.receiveRoute = (route) =>
    actionDispatcher.receiveAction(routeToAction(route), true);
  actionDispatcher.addRouteListener = (cb) =>
    actionDispatcher.addActionListener((action) => cb(actionToRoute(action)));

  Object.defineProperty(actionDispatcher, "currentRoute", {
    enumerable: true,
    get: function () {
      return actionToRoute(this.currentAction);
    },
  });

  return actionDispatcher;
}

export { RouteProvider, withRoute, RouteLink, createRouteDispatcher };
