import addMissingHistoryEvents from "../history-events";

it("should overwrite pushstate and replacestate with event-emitting functions", () => {
  // given
  const pushState = jest.fn();
  const replaceState = jest.fn();
  const window = {
    dispatchEvent: jest.fn(),
    history: {
      pushState,
      replaceState
    }
  };

  // when
  addMissingHistoryEvents(window, window.history);
  window.history.pushState({ item: "push" }, "pushstate", "/pushstate");
  window.history.replaceState(
    { item: "replace" },
    "replacestate",
    "/replacestate"
  );

  //then
  expect(pushState.mock.calls).toEqual([
    [{ item: "push" }, "pushstate", "/pushstate"]
  ]);
  expect(replaceState.mock.calls).toEqual([
    [{ item: "replace" }, "replacestate", "/replacestate"]
  ]);
  expect(window.dispatchEvent.mock.calls.length).toEqual(2);
  const windowCalls = window.dispatchEvent.mock.calls;

  expect(windowCalls[0][0].detail).toEqual({
    state: { item: "push" },
    title: "pushstate",
    url: "/pushstate"
  });
  expect(windowCalls[1][0].detail).toEqual({
    state: { item: "replace" },
    title: "replacestate",
    url: "/replacestate"
  });
});

it("should only add history-events once if called any number of times on same objects", () => {
  // given
  const pushState = jest.fn();
  const replaceState = jest.fn();
  const window = {
    dispatchEvent: jest.fn(),
    history: {
      pushState,
      replaceState
    }
  };

  // when
  addMissingHistoryEvents(window, window.history);
  addMissingHistoryEvents(window, window.history);
  addMissingHistoryEvents(window, window.history);
  addMissingHistoryEvents(window, window.history);

  window.history.pushState({ item: "push" }, "pushstate", "/pushstate");
  window.history.replaceState(
    { item: "replace" },
    "replacestate",
    "/replacestate"
  );

  //then
  expect(window.dispatchEvent.mock.calls.length).toEqual(2);
});
