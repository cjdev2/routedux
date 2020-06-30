import * as R from 'ramda';
import React, {useReducer, useEffect} from 'react';
import PropTypes from 'prop-types';

const RouteContext = React.createContext(null);
const ActionDispatcherContext = React.createContext(null);

function RouteProvider({children, actionDispatcher, _window}) {

  const [route, updateRoute] = useReducer((state, action) =>
      R.omit(['type'], R.assoc('routeName', action.type, action))
    , {});

  useEffect(() => {
    return actionDispatcher.addActionListener(action => updateRoute(action));
  });

  useEffect(() => {
    actionDispatcher.receiveLocation(_window.location);
  });

  return (<ActionDispatcherContext.Provider value={actionDispatcher}>
    <RouteContext.Provider value={route}>
      {children}
    </RouteContext.Provider>
  </ActionDispatcherContext.Provider>);
}

RouteProvider.defaultProps = {
  _window: window ? window : null
};

RouteProvider.propTypes = {
  _window: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  actionDispatcher: PropTypes.object
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withRoute(Component) {
  const routeAdded = ({children, ...restProps}) => {
    return (<RouteContext.Consumer>
        {route =>
          <Component {...{...restProps, route}}>{children}</Component>
        }
      </RouteContext.Consumer>
    )
  };
  routeAdded.displayName = `withRoute(${getDisplayName(Component)})`
  routeAdded.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ])
  };
  return routeAdded;
}

function RouteLink({route, params, children, ...props}) {
  const action = {
    type: route, ...params
  };
  return <ActionDispatcherContext.Consumer>{
    dispatcher => {
      const url = dispatcher.pathForAction(action);
      return <a
        onClick={(ev) => {
          ev.preventDefault();
          dispatcher.receiveAction(action, true);
        }}
        href={url} {...props}>{children}</a>
    }
  }
  </ActionDispatcherContext.Consumer>;
}

RouteLink.propTypes = {
  route: PropTypes.string,
  params: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
};

export {RouteProvider, withRoute, RouteLink};
