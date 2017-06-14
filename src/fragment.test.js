import React from 'react';
import Fragment from './fragment';
import ezJson from 'enzyme-to-json';
import {shallow} from 'enzyme';


it("should display when state is truthy", () => {

  // given
  const state = {property : true};
  // when

  const wrapper = shallow(<Fragment state={state} filterOn="property">
      <div>Hello</div>
  </Fragment>);

  // then
  expect(ezJson(wrapper)).toMatchSnapshot();
});

it("should not display when state is falsy", () => {
  // given
  const state = {property : undefined};
  // when

  const wrapper = shallow(<Fragment state={state} filterOn="property">
    <div>Hello</div>
  </Fragment>);

  // then
  expect(ezJson(wrapper)).toEqual(null);
});

it("should handle paths in the state tree", () => {
  // given
  const state = {property : {subproperty: true}};
  // when

  const wrapper = shallow(<Fragment state={state} filterOn="property.subproperty">
    <div>Hello</div>
  </Fragment>);

  // then
  expect(ezJson(wrapper)).toMatchSnapshot();
});

it("should handle arrays in the state tree", () => {
  // given
  const state = {property : [{bar: {}}]};
  // when

  const wrapper = shallow(<Fragment state={state} filterOn="property.0.bar">
    <div>Hello</div>
  </Fragment>);

  // then
  expect(ezJson(wrapper)).toMatchSnapshot();
});

it("should be falsy if missing state tree", () => {
  // given
  const state = {property : {subproperty: true}};

  const wrapper = shallow(<Fragment state={state} filterOn="property.missingproperty.something">
    <div>Hello</div>
  </Fragment>);

  expect(ezJson(wrapper)).toEqual(null);

});
