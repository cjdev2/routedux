import addChangeUrlEvent from './change-url-event';


it("it should add changeUrlEventCreator to popstate,pushstate,replacestate", () => {
  // given
  const window = {};
  const map = {};

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb;
  });

  // when
  addChangeUrlEvent(window);

  // then
  expect(map['popstate']).toBeDefined();
  expect(map['pushstate']).toBeDefined();
  expect(map['replacestate']).toBeDefined();

});


it("given event handler should generate a urlchange event only when url changes", () => {
  // given
  const window = {
    location: {
      hash: '#hash',
      host: 'example.com',
      hostname: 'example',
      origin: '',
      href: '',
      pathname: '/path/to/thing',
      port: 80,
      protocol: 'https:'
    }
  };
  const map = {};
  const calls = [];

  window.addEventListener = jest.fn((event, cb) => {
    map[event] = cb;
  });

  window.dispatchEvent = jest.fn(ev => {
    const evName = ev.type;
    calls.push(ev);
    if(map[evName]) {
      map[evName].handleEvent(ev);
    }
  });

  // when
  addChangeUrlEvent(window);
  window.dispatchEvent(new Event('popstate'));
  window.dispatchEvent(new Event('popstate'));

  // then
  expect(calls.length).toEqual(3);
  expect(calls[1].type).toEqual('urlchanged');
  expect(calls[1].detail).toEqual(window.location);

  //when
  window.location.pathname = '/new/path';
  window.dispatchEvent(new Event('popstate'));

  //then
  expect(calls.length).toEqual(5);
  expect(calls[4].type).toEqual('urlchanged');
  expect(calls[4].detail).toEqual(window.location);
});

it("should only add url events 1x when addChangeUrlEvent is called on window more than 1x", () => {
  // given
  const window = {};
  const map = {};

  window.addEventListener = jest.fn((event, cb) => {
    if(!map[event]) {
      map[event] = [];
    }
    map[event].push(cb);
  });

  // when
  addChangeUrlEvent(window);
  addChangeUrlEvent(window);
  addChangeUrlEvent(window);


  expect(Object.keys(map).length).toEqual(3);
  //then
  for (let event of Object.keys(map)) {
    expect(map[event].length).toEqual(1);
  }

});
