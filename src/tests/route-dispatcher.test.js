import {createFakeWindow, createLocation} from "./test-utils";
import {createRouteDispatcher} from "../route-dispatcher";

const routesConfig = [
  ["/foo", "foo", {}],
  ["/bar/:id", "bar", {}],
];

describe("routeDispatcher", () => {
  test("receiveRoute and addRouteListener work together", () => {
    //given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    let thing = null;
    routeDispatcher.addRouteListener(r => {
      thing = r;
    });
    //when
    routeDispatcher.receiveRoute({ routeName: "foo" });
    //then
    expect(thing).toEqual({ routeName: "foo" });
  });

  test("when receiveLocation is called, routeListener gets route not action", () => {
    //given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    let thing = null;
    routeDispatcher.addRouteListener(r => {
      thing = r;
    });
    //when
    routeDispatcher.receiveLocation(createLocation("/bar/hi"));
    //then
    expect(thing).toEqual({ routeName: "bar", id: "hi" });
  });

  test("currentRoute returns the correct route object", () => {
    //given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    //when
    routeDispatcher.receiveLocation(createLocation("/bar/hi"));
    //then
    expect(routeDispatcher.currentRoute).toEqual({
      routeName: "bar",
      id: "hi",
    });
  });
});
