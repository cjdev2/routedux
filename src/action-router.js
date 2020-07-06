import * as R from "ramda";

function pathSplit(path) {
  return path.split("/");
}

function mostSpecificRouteMatch(match1, match2) {
  if (!match1) {
    return match2;
  }

  const paramLength1 = match1.routeParams.length;
  const paramLength2 = match2.routeParams.length;

  const findWildcard = R.compose(R.findIndex(isWildcard), pathSplit);

  let result = paramLength1 > paramLength2 ? match2 : match1;

  if (paramLength1 === paramLength2) {
    const path1WildcardIdx = findWildcard(match1.path);
    const path2WildcardIdx = findWildcard(match2.path);

    result =
      path1WildcardIdx !== -1 && path1WildcardIdx < path2WildcardIdx
        ? match2
        : match1;
  }

  if (result === null) {
    throw new Error("routes should have been disambiguated at compile time");
  }

  return result;
}

// do something with routes.
function matchRoute(loc, matchers) {
  const inputPath = loc.pathname;

  const buildMatch = (extractedParams, route) => ({
    extractedParams,
    ...route,
  });

  return R.reduce(
    (match, [_, { type: matcherType, route }]) => {
      const { pathMatcher } = route;
      const matchedParams = pathMatcher(inputPath);

      if (matchedParams) {
        return matcherType === "exact"
          ? buildMatch(matchedParams, route)
          : mostSpecificRouteMatch(match, buildMatch(matchedParams, route));
      } else {
        return match;
      }
    },
    null,
    R.toPairs(matchers)
  );
}

function mostSpecificActionMatch(match1, match2) {
  if (!match1) {
    return match2;
  }

  const countExtraParams = ({ extraParams: obj }) => R.keys(obj).length;
  return countExtraParams(match1) >= countExtraParams(match2) ? match1 : match2;
}

// matchers is {action : [pathMatcher]} structure
function matchAction(action, matchers) {
  // match on params in action vs possible actions if more than 1
  let match = null;

  const { type: actionType, ...args } = action;
  const routes = matchers[actionType];

  // Specificity:
  // 1. wildcard(s) / no extra param   /route/:id  || /route/me
  // 2. wildcards /  exact extra params match with remaining wildcard
  // 3. no-wildcard / exact extra params match

  for (const { type: matcherType, route } of routes) {
    if (matcherType === "exact" && R.equals(route.extraParams, args)) {
      // case 3
      match = { extractedParams: {}, ...route };
      break; // most specific
    } else if (matcherType === "wildcard") {
      // case 1+2

      const unallocatedArgKeys = R.difference(
        R.keys(args),
        R.keys(route.extraParams)
      );
      // if all keys ^ are equal to all keys in route
      const intersectCount = R.intersection(
        unallocatedArgKeys,
        route.routeParams
      ).length;
      const unionCount = R.union(unallocatedArgKeys, route.routeParams).length;

      if (intersectCount === unionCount) {
        const extractedParams = R.pick(unallocatedArgKeys, args);
        match = mostSpecificActionMatch(match, { extractedParams, ...route });
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

  const params = R.compose(
    R.map((x) => x.substr(1)),
    R.filter(isWildcard)
  )(pathParts);

  if (R.uniq(params).length !== params.length) {
    throw new Error("duplicate param");
  }

  return params;
}

function normalizePathParts(path) {
  const splitAndFilterEmpty = R.compose(
    R.filter((p) => p !== ""),
    R.split("/")
  );

  return splitAndFilterEmpty(path);
}

function makeRoute(path, action, extraParams) {
  const type = R.includes(":", path) ? "wildcard" : "exact";

  const normalizedPathParts = normalizePathParts(path);

  const pathMatcher = function (inputPath) {
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
      result = R.reduce(
        (extractedValues, [match, input]) => {
          if (extractedValues === null) {
            return null;
          }

          if (match === input) {
            return extractedValues;
          } else if (R.startsWith(":", match)) {
            const wildcardName = R.replace(":", "", match);
            return { ...extractedValues, [wildcardName]: input };
          } else {
            return null;
          }
        },
        {},
        R.zip(normMatchPath, normInputPath)
      );
    }

    return result;
  };

  let routeParams = extractParams(path);

  return {
    type,
    route: {
      pathMatcher,
      path,
      action,
      routeParams,
      extraParams,
    },
  };
}

function normalizeWildcards(path) {
  let curIdx = 0;
  //todo curIdx doesn't increment
  return path.map((el) => {
    if (isWildcard(el)) {
      return `:wildcard${curIdx}`;
    } else {
      return el;
    }
  });
}

function routeAlreadyExists(compiledRouteMatchers, path) {
  let result = Object.prototype.hasOwnProperty.call(
    compiledRouteMatchers,
    path
  );

  if (!result) {
    const normalizingSplit = R.compose(normalizeWildcards, pathSplit);
    const pathParts = normalizingSplit(path);

    for (const otherPath of R.keys(compiledRouteMatchers)) {
      const otherPathParts = normalizingSplit(otherPath);
      if (R.equals(pathParts, otherPathParts)) {
        throw new Error(
          `invalid routing configuration — route ${path} overlaps with route ${otherPath}`
        );
      }
    }
  }

  return result;
}

function compileRoutes(routesConfig) {
  const compiledActionMatchers = {};
  const compiledRouteMatchers = {};

  for (let [path, action, extraParams] of routesConfig) {
    if (typeof path !== "string" || typeof action !== "string") {
      throw new Error(
        "invalid routing configuration - path and action must both be strings"
      );
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
    compiledRouteMatchers, // { PATH: Route }
  };
}

function constructAction(match) {
  return { type: match.action, ...match.extractedParams, ...match.extraParams };
}

function constructPath(match) {
  const parts = match.path.split("/");
  const resultParts = [];

  for (const part of parts) {
    if (part[0] === ":") {
      const name = part.slice(1);
      const val = Object.prototype.hasOwnProperty.call(
        match.extractedParams,
        name
      )
        ? match.extractedParams[name]
        : match.extraParams[name];
      resultParts.push(val);
    } else {
      resultParts.push(part);
    }
  }
  return resultParts.join("/");
}

function createActionDispatcher(routesConfig, _window = window) {
  const { compiledActionMatchers, compiledRouteMatchers } = compileRoutes(
    routesConfig
  );

  function pathForAction(action) {
    const match = matchAction(action, compiledActionMatchers);
    return match ? constructPath(match) : null;
  }

  function actionForLocation(location) {
    const match = matchRoute(location, compiledRouteMatchers);
    return match ? constructAction(match) : null;
  }

  let actionListeners = [];
  let currentPath = null;
  let currentAction = null;

  function ifPathChanged(newPath, cb) {
    if (currentPath !== newPath) {
      currentPath = newPath;
      cb();
    }
  }

  let initFlag = false;

  const actionDispatcher = {
    init() {
      if (!initFlag) {
        initFlag = true;
        this.receiveLocation(_window.location);
      }
    },
    get currentPath() {
      return currentPath;
    },
    get currentAction() {
      return currentAction;
    },
    pathForAction,

    //hook for everything to get action on route change
    addActionListener(cb) {
      actionListeners.push(cb);
      return () => {
        const index = R.findIndex((x) => x === cb, actionListeners);
        actionListeners = R.remove(index, 1, actionListeners);
      };
    },

    //needed for window event listener
    handleEvent(ev) {
      const location = ev.detail;
      this.receiveLocation(location);
    },

    receiveLocation(location) {
      ifPathChanged(location.pathname, () => {
        const action = actionForLocation(location);

        currentAction = action;
        if (action) {
          actionListeners.forEach((cb) => cb(action));
        }
      });
    },

    // can this be simplified to get rid of fundamental action model?
    receiveAction(action, fireCallbacks = false) {
      const newPath = matchesAction(action, compiledActionMatchers)
        ? pathForAction(action)
        : null;

      if (newPath) {
        ifPathChanged(newPath, () => {
          currentAction = action;

          _window.history.pushState({}, "", newPath);

          if (fireCallbacks) {
            actionListeners.forEach((cb) => cb(action));
          }
        });
      }
    },
  };

  _window.addEventListener("urlchanged", actionDispatcher);

  return actionDispatcher;
}

export { createActionDispatcher };
