import addMissingHistoryEvents from "./history-events";
import addChangeUrlEvent from "./change-url-event";
import installBrowserRouter from "./redux-api";
import Fragment from "./fragment";
import ActionLink from "./action-link";
import { createActionDispatcher } from "./action-router";
import { createRouteDispatcher } from "./route-dispatcher";

addMissingHistoryEvents(window, window.history);
addChangeUrlEvent(window);

export {
  installBrowserRouter,
  Fragment,
  ActionLink,
  createActionDispatcher,
  createRouteDispatcher
};
