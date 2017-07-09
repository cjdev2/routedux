import ActionLink from './action-link';
import {mount} from 'enzyme';
import ezJson from 'enzyme-to-json';


it("dispatches an action on click", () => {

  // given
  const store = {
    pathForAction: jest.fn(() => '/my/path'),
    dispatch: jest.fn()
  };
  const props = {
    action: {type: 'ACTION', id: '123'},
    children: "Hello World!"
  };
  const context = {store};

  const wrapper = mount(ActionLink(props, context));
  // when
  wrapper.simulate('click');

  //then
  expect(store.pathForAction.mock.calls).toEqual([[ {type:'ACTION', id: '123'} ]]);
  expect(store.dispatch.mock.calls).toEqual([[ {type: 'ACTION', id: '123'} ]]);

});

it("renders the url calculated by our internal function", () => {
  // given
  const store = {
    pathForAction: jest.fn(() => '/my/path'),
    dispatch: jest.fn()
  };
  const props = {
    action: {},
    children: "Hello World!"
  };
  const context = {store};

  const wrapper = mount(ActionLink(props, context));

  expect(ezJson(wrapper)).toMatchSnapshot();

});

it("additional props are passed through", () => {
  // given
  const store = {
    pathForAction: jest.fn(() => '/my/path'),
    dispatch: jest.fn()
  };
  const props = {
    action: {},
    children: "Hello World!",
    className: "foo"
  };
  const context = {store};

  const wrapper = mount(ActionLink(props, context));

  expect(ezJson(wrapper)).toMatchSnapshot();

});
