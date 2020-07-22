import React, { useReducer, useEffect } from "react";
import PropTypes from "prop-types";

const RouteContext = React.createContext(null);
const ActionDispatcherContext = React.createContext(null);

function RouteProvider({ children, routeDispatcher }) {
  const [route, updateRoute] = useReducer((state, route) => route, {});

  useEffect(() => {
    return routeDispatcher.addRouteListener(updateRoute);
  });

  useEffect(() => {
    routeDispatcher.init();
  }, []);

  return (
    <ActionDispatcherContext.Provider value={routeDispatcher}>
      <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
    </ActionDispatcherContext.Provider>
  );
}

RouteProvider.propTypes = {
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
        {route => (
          <Component {...{ ...restProps, route }}>{children}</Component>
        )}
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
      {dispatcher => {
        const url = dispatcher.pathForAction(action);
        return (
          <a
            onClick={ev => {
              ev.preventDefault();
              dispatcher.receiveRoute({ routeName, ...params }, true);
            }}
            href={url}
            {...props}>
            {children}
          </a>
        );
      }}
    </ActionDispatcherContext.Consumer>
  );
}

RouteLink.propTypes = {
  routeName: PropTypes.string,
  params: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export { RouteProvider, withRoute, RouteLink };
