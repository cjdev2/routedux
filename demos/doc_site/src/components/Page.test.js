import React from 'react';
import ezJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {Page, RouteAwarePageBuilder, mapStateToProps} from './Page';
import {actions} from '../model';

it("should render menu and contents", () => {
  //given
  ;
  //when
  const wrapper = shallow(<Page title="Title!" contents="<div>Raw Html</div>" menu="Menu contents" />);

  //then
  expect(ezJson(wrapper)).toMatchSnapshot();

});


it("RouteAwarePage should load content using id from route and fire route transition action", () => {
  //given
  let idUsed;
  const stubGetContents = (id) => {
    idUsed = id;
    return "Some content";
  };
  const stubStore = {
    actions: [],
    dispatch: function(action) {this.actions.push(action) }
  };
  const RouteAwarePage = RouteAwarePageBuilder(stubGetContents, stubStore);
  const match = {params: {id: 'routeId'}};

  //when
  const wrapper = shallow(<RouteAwarePage match={match} menu="Menu" title="Title" />);

  //then
  expect(stubStore.actions[0]).toEqual(actions.changeId('routeId'));
  expect(idUsed).toEqual('routeId');
  expect(ezJson(wrapper)).toMatchSnapshot();

});
it("RouteAwarePage should load content using passed id instead when it is present", () => {
//given
  let idUsed;
  const stubGetContents = (id) => {
    idUsed = id;
    return "Some content";
  };
  const stubStore = {
    actions: [],
    dispatch: function(action) {this.actions.push(action) }
  };
  const RouteAwarePage = RouteAwarePageBuilder(stubGetContents, stubStore);
  const match = {params: {id: 'routeId'}};

  //when
  const wrapper = shallow(<RouteAwarePage id="ownId" match={match} menu="Menu" title="Title" />);

  //then
  expect(stubStore.actions[0]).toEqual(actions.changeId('ownId'));
  expect(idUsed).toEqual('ownId');
  expect(ezJson(wrapper)).toMatchSnapshot();
});

it("RouteAwarePage uses passed contents by default when content cannot be loaded", () => {
  let idUsed;
  const stubGetContents = (id) => {
    idUsed = id;
    return null;
  };
  const stubStore = {
    actions: [],
    dispatch: function(action) {this.actions.push(action) }
  };
  const RouteAwarePage = RouteAwarePageBuilder(stubGetContents, stubStore);
  const match = {params: {id: 'routeId'}};

  //when
  const wrapper = shallow(<RouteAwarePage contents="Hello" match={match} menu="Menu" title="Title" />);

  //then
  expect(ezJson(wrapper)).toMatchSnapshot();
});

it("mapStateToProps uses its own title and contents preferentially", () => {
  // given
  const state = {currentTitle: 'currentTitle', id: 'foo', contentMap: {'foo' : 'Foo Contents'}};
  const ownProps = {title: 'Own Title', contents: 'Own Contents', menu: 'Menu'};
  const expectedProps = {title: 'Own Title', contents: 'Own Contents', menu: 'Menu'};

  // when
  const returnedProps = mapStateToProps(state, ownProps);

  //then
  expect(returnedProps).toEqual(expectedProps);

});