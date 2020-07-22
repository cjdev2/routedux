import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { act } from "react-dom/test-utils";
import {createRouteDispatcher} from "../route-dispatcher";
import {
  RouteLink,
  RouteProvider,
  withRoute,
} from "../provider-api";
import { createFakeWindow, createLocation } from "./test-utils";
import Enzyme, { mount } from "enzyme";

const routesConfig = [
  ["/foo", "foo", {}],
  ["/bar/:id", "bar", {}],
];

Enzyme.configure({ adapter: new Adapter() });

describe("RouteProvider and helpers", () => {
  test("RouteProvider gives RouteLink correct info", () => {
    // given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    const wrapper = mount(
      <RouteProvider routeDispatcher={routeDispatcher}>
        <RouteLink routeName="bar" params={{ id: "foo" }} />
      </RouteProvider>
    );
    // when
    const href = wrapper.find("RouteLink").find("a").prop("href");
    // then
    expect(href).toEqual("/bar/foo");
  });

  test("RouteLink calls dispatcher.receiveRoute on click", () => {
    // given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    let received = null;
    routeDispatcher.receiveRoute = route => {
      received = route;
    };
    const wrapper = mount(
      <RouteProvider routeDispatcher={routeDispatcher}>
        <RouteLink routeName="bar" params={{ id: "foo" }} />
      </RouteProvider>
    );
    // when
    wrapper.find("a").simulate("click");
    // then
    expect(received).toEqual({ routeName: "bar", id: "foo" });
  });

  test("withRoute", () => {
    // given
    const DummyWithRoute = withRoute(({ route, children }) => {
      return (
        <div>
          <span className="route">{JSON.stringify(route)}</span>
          <span className="children">{children}</span>
        </div>
      );
    });
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);

    let wrapper;
    act(() => {
      wrapper = mount(
        <RouteProvider routeDispatcher={routeDispatcher}>
          <DummyWithRoute>children text</DummyWithRoute>
        </RouteProvider>
      );
    });
    // when

    let routeText = wrapper.find(".route").text();
    const childrenText = wrapper.find(".children").text();
    // then
    expect(routeText).toEqual(JSON.stringify({ routeName: "foo" }));
    expect(childrenText).toEqual("children text");

    act(() => {
      routeDispatcher.receiveLocation(createLocation("/bar/foo"));
    });
    routeText = wrapper.find(".route").text();
    // then
    expect(routeText).toEqual(JSON.stringify({ id: "foo", routeName: "bar" }));
  });
});
