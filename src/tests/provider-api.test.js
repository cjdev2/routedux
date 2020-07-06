import React from "react";
import ReactDOM from "react-dom";
import Adapter from "enzyme-adapter-react-16";
import { act } from "react-dom/test-utils";

import {
  createRouteDispatcher,
  RouteProvider,
  RouteLink,
  withRoute,
} from "../provider-api";
import { createFakeWindow, createLocation } from "./test-utils";
import Enzyme, { mount } from "enzyme";

const routesConfig = [
  ["/foo", "foo", {}],
  ["/bar/:id", "bar", {}],
];

Enzyme.configure({ adapter: new Adapter() });
describe("routeDispatcher", () => {
  test("receiveRoute and addRouteListener work together", () => {
    //given
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);
    let thing = null;
    routeDispatcher.addRouteListener((r) => {
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
    routeDispatcher.addRouteListener((r) => {
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
    routeDispatcher.receiveRoute = (route) => {
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

  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  test("withRoute", async () => {
    // given
    const Dummy = ({ route, children }) => {
      return (
        <div>
          <span className="route">{JSON.stringify(route)}</span>
          <span className="children">{children}</span>
        </div>
      );
    };
    const DummyWithRoute = withRoute(Dummy);
    const _window = createFakeWindow("/foo");
    const routeDispatcher = createRouteDispatcher(routesConfig, _window);

    let wrapper;
    await act(async () => {
      ReactDOM.render(
        <RouteProvider routeDispatcher={routeDispatcher}>
          <DummyWithRoute>children text</DummyWithRoute>
        </RouteProvider>,
        container
      );
    });
    // when

    const routeText = container.querySelector(".route").textContext;
    const childrenText = container.querySelector(".children").textContext;
    // then
    expect(routeText).toEqual(JSON.stringify({ routeName: "foo" }));
    expect(childrenText).toEqual("children text");
  });
});
