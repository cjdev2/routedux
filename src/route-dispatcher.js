import * as R from "ramda";
import {createActionDispatcher} from "./action-router";

function routeToAction(route) {
  return R.omit(["routeName"], R.assoc("type", route.routeName, route));
}
function actionToRoute(action) {
  return R.omit(["type"], R.assoc("routeName", action.type, action));
}

export function createRouteDispatcher(routesConfig, _window = window) {
  const actionDispatcher = createActionDispatcher(routesConfig, _window);

  actionDispatcher.receiveRoute = route =>
    actionDispatcher.receiveAction(routeToAction(route), true);
  actionDispatcher.addRouteListener = cb =>
    actionDispatcher.addActionListener(action => cb(actionToRoute(action)));

  Object.defineProperty(actionDispatcher, "currentRoute", {
    enumerable: true,
    get: function () {
      return actionToRoute(this.currentAction);
    },
  });

  return actionDispatcher;
}
