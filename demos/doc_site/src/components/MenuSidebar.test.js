'use strict';

import React from 'react';
import ezJson from 'enzyme-to-json';
import {shallow} from 'enzyme';

import MenuSidebar from './MenuSidebar';


describe("menu does stuff you expect", () => {
  it("renders a list of article info into a link", () => {
    // given
    const data = [
      {id: "woo", title: "The woo", url: "woo"},
      {id: "bar", title: "The bar", url: "bar"}
    ];

    // when
    const rendered = shallow(<MenuSidebar items={data} routeBase="/articleroute/" />)

    // then
    expect(ezJson(rendered)).toMatchSnapshot()
  });
});