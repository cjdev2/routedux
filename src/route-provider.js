import React, {useReducer, useMemo, useEffect} from 'react';
import {createActionDispatcher} from "./action-router";

window.React2 = React;

export default function createNav(routesConfig, _window = window) {

  const RoutingContext = React.createContext(null);
  const actionDispatcher = createActionDispatcher(routesConfig, _window)


  function Navigation({children}) {

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

  function withNav(Component) {
    return function ({children, ...restProps}) {
      return (<RoutingContext.Consumer>
          {route =>
            <Component {...{...restProps, route}}>{children}</Component>
          }
        </RoutingContext.Consumer>
      )
    }
  }

  return {Navigation, withNav};
}
