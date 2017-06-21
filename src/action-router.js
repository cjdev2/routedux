import R from 'ramda';

function pathSplit(path) {
  return path.split('/');
}

function mostSpecificRouteMatch(match1, match2) {

  if (!match1) {
    return match2;
  }

  const paramLength1 = match1.routeParams.length;
  const paramLength2 = match2.routeParams.length;
  let findWildcard = R.compose(R.findIndex.bind(R, isWildcard), pathSplit);

  let result = (paramLength1 > paramLength2) ? match2 : match1;

  if (paramLength1 === paramLength2) {

    let path1WildcardIdx = findWildcard(match1.path);
    let path2WildcardIdx = findWildcard(match2.path);

    result = (path1WildcardIdx !== -1 && path1WildcardIdx < path2WildcardIdx) ? match2 : match1;
  }

  if (result === null) {
    throw new Error("routes should have been disambiguated at compile time");
  }

  return result;
}

// do something with routes.
function matchRoute(loc, matchers) {

  const inputPath = loc.pathname;

  const buildMatch = (extractedParams, route) => Object.assign({extractedParams}, route);

  return R.toPairs(matchers).reduce((match, [path,{type: matcherType, route}]) => {
    const pathMatcher = route.routeMatcher;
    const matchedParams = pathMatcher(inputPath);

    if (matchedParams) {
      if (matcherType === 'exact') {
        return buildMatch(matchedParams, route);
      } else {
        return mostSpecificRouteMatch(match, buildMatch(matchedParams, route));
      }
    } else {
      return match;
    }

  }, null);
}

function mostSpecificActionMatch(match1, match2) {

  if (!match1) {
    return match2;
  }

  let countExtraParams = ({extraParams: obj}) => Object.keys(obj).length;
  return countExtraParams(match1) >= countExtraParams(match2) ? match1 : match2;
}

// matchers is {action : [routeMatcher]} structure
function matchAction(action, matchers) {
  // match on params in action vs possible actions if more than 1
  let match = null;

  const {type: actionType, ...args} = action;
  const routes = matchers[actionType];

  // Specificity:
  // 1. wildcard(s) / no extra param   /route/:id  || /route/me
  // 2. wildcards /  exact extra params match with remaining wildcard
  // 3. no-wildcard / exact extra params match

  for (const {type: matcherType, route} of routes) {
    if (matcherType === "exact" && R.equals(route.extraParams, args)) {
      match = Object.assign({extractedParams: {}}, route);
      // case 3
      break; // most specific
    } else if (matcherType === "wildcard") {
      // case 1+2

      const unallocatedArgKeys = R.difference(Object.keys(args), Object.keys(route.extraParams));
      // if all keys ^ are equal to all keys in route
      const intersectCount = R.intersection(unallocatedArgKeys, route.routeParams).length;
      const unionCount = R.union(unallocatedArgKeys, route.routeParams).length;

      if (intersectCount === unionCount) {
        const extractedParams = R.pick(unallocatedArgKeys, args);
        match = mostSpecificActionMatch(match, Object.assign({extractedParams}, route));
      }
    }
  }

  return match;
}

function matchesAction(action, matchers) {
  return !!matchers[action.type];
}

function isWildcard(segment) {
  return segment && segment[0] === ":";
}

function extractParams(path) {
  const pathParts = path.split("/");
  let params = [];

  for (const part of pathParts.filter(isWildcard)) {
    const name = part.slice(1);

    if (params.indexOf(name) !== -1) {
      throw new Error("duplicate param");
    }

    params.push(name);
  }
  return params;
}

function normalizePathParts(path) {
  const rawPathParts = R.split('/', path);
  const normalizedPathParts = R.filter(p => p !== "", rawPathParts);
  return normalizedPathParts;
}

function makeRoute(path, action, extraParams) {

  let type = "exact";
  if (path.indexOf(":") !== -1) {
    type = "wildcard";
  }

  const normalizedPathParts = normalizePathParts(path);

  const updateWildcard = (wildcards, match, input) => {
    const wildcardName = match.replace(':', '');
    return Object.assign(wildcards, {[wildcardName]: input});
  };

  const routeMatcher = function (inputPath) {
    let result = null;
    const normMatchPath = normalizedPathParts;
    const normInputPath = normalizePathParts(inputPath);

    // exact match
    if (R.equals(normalizedPathParts, normInputPath)) {
      return {};
    }

    //wildcard match
    const inputLength = normInputPath.length;
    const matchLength = normMatchPath.length;

    if (inputLength === matchLength) {
      const f = (acc, [match, input]) => {
        if (acc === null) {
          return null;
        }

        if(match === input) {
          return acc;
        } else if (match[0] === ":") {
          return updateWildcard(acc, match, input);
        } else {
          return null;
        }
      };
      result = R.zip(normMatchPath, normInputPath).reduce(f, {});
    }

    return result;
  };

  let routeParams = extractParams(path);

  return {
    type,
    route: {
      routeMatcher,
      path,
      action,
      routeParams,
      extraParams
    }
  };
}

function normalizeWildcards(path) {
  let curIdx = 0;
  return path.map((el) => {
    if (isWildcard(el)) {
      return `:wildcard${curIdx}`;
    } else {
      return el;
    }
  });
}

function routeAlreadyExists(compiledRouteMatchers, path) {
  let result = compiledRouteMatchers.hasOwnProperty(path);

  if (!result) {
    const normalizingSplit = R.compose(normalizeWildcards, pathSplit);
    const pathParts = normalizingSplit(path);

    for (const otherPath of Object.keys(compiledRouteMatchers)) {
      const otherPathParts = normalizingSplit(otherPath);
      if (R.equals(pathParts, otherPathParts)) {
        throw new Error(`invalid routing configuration — route ${path} overlaps with route ${otherPath}`);
      }
    }
  }

  return result;
}

function compileRoutes(routesConfig) {
  let compiledActionMatchers = {};
  let compiledRouteMatchers = {};

  for (let [path, action, extraParams] of routesConfig) {

    if(typeof path !== 'string' || typeof action !== 'string') {
      throw new Error("invalid routing configuration - path and action must both be strings");
    }

    if (!compiledActionMatchers[action]) {
      compiledActionMatchers[action] = [];
    }

    const route = makeRoute(path, action, extraParams);
    compiledActionMatchers[action].push(route);

    if (routeAlreadyExists(compiledRouteMatchers, path)) {
      throw new Error("overlapping paths");
    }

    compiledRouteMatchers[path] = route;
  }
  return {
    compiledActionMatchers, // { ACTION: [Route] }
    compiledRouteMatchers  // { PATH: Route }
  };
}

function constructAction(match) {
  return {type: match.action, ...match.extractedParams, ...match.extraParams};
}

function constructPath(match) {
  let parts = match.path.split('/');
  let resultParts = [];

  for (let part of parts) {
    if (part[0] === ":") {
      const name = part.slice(1);
      const val = match.extractedParams.hasOwnProperty(name)
            ? match.extractedParams[name] : match.extraParams[name];
      resultParts.push(val);
    } else {
      resultParts.push(part);
    }
  }
  return resultParts.join('/');
}

function createActionDispatcher(routesConfig, window) {
  let {compiledActionMatchers, compiledRouteMatchers} = compileRoutes(routesConfig);

  function pathForAction(action) {
    const match = matchAction(action, compiledActionMatchers);
    return match ? constructPath(match) : null;
  }

  let actionDispatcher = {
    currentLocation: null,

    store: null,
    activateDispatcher(store) {
      window.addEventListener('urlchanged', this);
      this.store = store;
    },
    enhanceStore(nextStoreCreator) {
      return (reducer, finalInitialState, enhancer) => {
        let theStore = nextStoreCreator(reducer, finalInitialState, enhancer);
        this.activateDispatcher(theStore);
        theStore.pathForAction = pathForAction;
        return theStore;
      };
    },
    handleEvent(ev) {

      if (!this.store) {
        throw new Error("You must call activateDispatcher with redux store as argument");
      }

      const location = ev.detail;
      this.receiveLocation(location);
    },

    onLocationChanged(newLoc, cb) {
      if (this.currentLocation !== newLoc) {
        this.currentLocation = newLoc;
        return cb();
      }
    },

    receiveLocation(location) {
      this.onLocationChanged(location.pathname, () => {
        const match = matchRoute(location, compiledRouteMatchers);
        if(match) {
          const action = constructAction(match);

          this.store.dispatch(action);
        }
      });
    },

    receiveAction(action) {
      let matcher = matchAction(action, compiledActionMatchers);
      if(matcher) {
        let path = constructPath(matcher);
        this.onLocationChanged(path, () => {
          window.history.pushState({}, '', path);
        });
      }
    },

    handlesAction(action) {
      return matchesAction(action, compiledActionMatchers);
    }
  };

  actionDispatcher.enhanceStore = actionDispatcher.enhanceStore.bind(actionDispatcher);

  return actionDispatcher;
}

function buildMiddleware(actionDispatcher) {
  return store => next => action => {
    if (actionDispatcher.handlesAction(action)) {
      actionDispatcher.receiveAction(action, store);
    }
    return next(action);
  };
}

export default function installBrowserRouter(routesConfig, window) {

  const actionDispatcher = createActionDispatcher(routesConfig, window);

  const middleware = buildMiddleware(actionDispatcher);

  return {middleware, enhancer: actionDispatcher.enhanceStore, init: actionDispatcher.receiveLocation.bind(actionDispatcher, window.location)};
}
