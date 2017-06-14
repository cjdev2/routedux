import addMissingHistoryEvents from './history-events';
import addChangeUrlEvent from './change-url-event';
import installRouter from './action-router';
import Fragment from './fragment';

addMissingHistoryEvents(window, window.history);
addChangeUrlEvent(window);

const installBrowserRouter = function(routesConfig) { return installRouter(routesConfig, window); };

export {Fragment, installBrowserRouter};