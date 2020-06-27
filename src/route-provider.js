import React, {useReducer, useMemo, useEffect} from 'react';
import {createActionDispatcher} from "./action-router";

export function createRouteProvider(routesConfig, _window = window) {

  const RoutingContext = React.createContext(null);
  const actionDispatcher = createActionDispatcher(routesConfig, _window)


  function RouteProvider({children}) {

    const [route, updateRoute] = useReducer((state, action) => action, {});
    const store = useMemo(() => {
      return {dispatch: (action) => {
          updateRoute(action);
        }}
    }, [updateRoute]);

    useEffect(() => {
      actionDispatcher.activateDispatcher(store);
    }, [store]);

    useEffect(() => {
      actionDispatcher.receiveLocation(_window.location);
    });

    return <RoutingContext.Provider value={route}>
      {children}
    </RoutingContext.Provider>

  }

  function withRoute(Component) {
    return function ({children, ...restProps}) {
      return (<RoutingContext.Consumer>
          {route =>
            <Component {...{...restProps, route}}>{children}</Component>
          }
        </RoutingContext.Consumer>
      )
    }
  }

  function routeToUrl(routeName, params) {
     return actionDispatcher.pathForAction({
       type: routeName, ...params
     })
  }

  function RouteLink({route, params, children, ...props}) {
    const url = routeToUrl(route, params);

    return <a href={url} {...props}>{children}</a>;
  }

  const init = actionDispatcher.receiveLocation.bind(
    actionDispatcher,
    _window.location
  );

  return {RouteProvider, withRoute, routeToUrl, RouteLink};
}
