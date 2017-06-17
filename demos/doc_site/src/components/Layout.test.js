"use strict";
import React from 'react';
import ezJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Layout from './Layout';

describe("render", () => {
   it("renders 2 slots", () => {
        //given

       //when
       const rendered = shallow(
           <Layout content={<div>Hello!</div>} nav={<ul><li>List item</li></ul>}></Layout>
       );

       //then
        expect(ezJson(rendered)).toMatchSnapshot();
   });
});
