export function createLocation(path) {
  return {
    hash: "#hash",
    host: "example.com",
    hostname: "example",
    origin: "",
    href: "",
    pathname: path,
    port: 80,
    protocol: "https:",
  };
}

export function createFakeWindow(path = "/path/to/thing") {
  let locations = [createLocation("(root)")];
  function pushLocation(window, path) {
    let newLoc = createLocation(path);
    locations.push(newLoc);
    window.location = newLoc;
    return newLoc;
  }
  function popLocation(window) {
    locations.pop();
    let newLoc = locations[locations.length - 1];
    window.location = newLoc;
    return newLoc;
  }

  const window = {
    history: {
      pushState: jest.fn((_, __, path) => {
        window.location = pushLocation(window, path);
      }),
      replaceState: jest.fn(),
    },
  };

  pushLocation(window, path);
  const map = {};

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb;
  });

  function prepareEvent(window, evName) {
    if (evName === "popstate") {
      window.location = popLocation(window);
    }
  }

  window.dispatchEvent = jest.fn((ev) => {
    const evName = ev.type;
    if (map[evName]) {
      prepareEvent(window, evName);
      map[evName].handleEvent(ev);
    }
  });

  return window;
}
