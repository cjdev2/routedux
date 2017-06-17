'use strict';

import {createPrepare} from './prepare'


const dataDir = "non-existent";
const pagesSourceDir = "fake-pages";
const pagesOutputDir = "public/output-pages";
const pagesDataFileName = "data.json";

let fileContents = {
  "fake-pages/foo-about.md":  `---
id: foo
title: All about Foo
---
# Some Other content!!
`,
  "fake-pages/bar-story.md":  `---
id: bar
title: A Bar Story
---
# Some Other content
`
};

const expectedParsedContents = [{
  contentsUrl: "/output-pages/bar.html",
  id: 'bar',
  title: "A Bar Story"
},{
  contentsUrl: "/output-pages/foo.html",
  id: 'foo',
  title: "All about Foo"
}];

const createEmptyFileSystem = (fileContents) => {
  const isError = true;
  const isNotError = false;
  const events = [];
  const sourceFiles = ["bar-story.md", "foo-about.md"];
  let pushEvent = event => {
    // console.log('event', event);
    events.push(event);
  };
  return {
    constants: {F_OK: 0},
    access: (path, mode, callback) => {
      pushEvent({name: 'access', path, mode});
      callback(isError);
    },
    writeFile: (file, data, callback) => {
      pushEvent({name: 'writeFile', file, data});
      callback(isNotError);
    },
    mkdir: (path, mode, callback) => {
      pushEvent({name: 'mkdir', path, mode});
      callback(isNotError);
    },
    readdir: (path, callback) => {
      pushEvent({name: 'readdir', path});
      callback(isNotError, sourceFiles);
    },
    readFile: (path, charset, callback) => {
      pushEvent({name: 'readFile', path, charset});
      callback(isNotError, fileContents[path]);
    },
    getEvents: () => {
      return events;
    }
  };
};

const createFileSystemWithFolders = (fileContents) => {
  const isError = true;
  const isNotError = false;
  const events = [];
  const sourceFiles = ["bar-story.md", "foo-about.md"];
  let pushEvent = event => {
    events.push(event);
  };
  return {
    constants: {F_OK: 0},
    access: (path, mode, callback) => {
      pushEvent({name: 'access', path, mode});
      callback(isNotError);
    },
    writeFile: (file, data, callback) => {
      pushEvent({name: 'writeFile', file, data});
      callback(isNotError);
    },
    mkdir: (path, mode, callback) => {
      pushEvent({name: 'mkdir', path, mode});
      callback(isNotError);
    },
    readdir: (path, callback) => {
      pushEvent({name: 'readdir', path});
      callback(isNotError, sourceFiles);
    },
    readFile: (path, charset, callback) => {
      pushEvent({name: 'readFile', path, charset});
      callback(isNotError, fileContents[path]);
    },
    getEvents: () => {
      return events;
    }
  };
}


it("handles no data folder", async () => {
  // given
  const fileSystem = createEmptyFileSystem(fileContents);
  const prepare = createPrepare(fileSystem);

  // when
  const returnVal = await prepare(dataDir, pagesSourceDir, pagesDataFileName, pagesOutputDir);

  // then
  expect(JSON.parse(returnVal)).toEqual(expectedParsedContents);
  const events = fileSystem.getEvents();
  expect(events).toEqual([

    {name: 'access', path: 'non-existent', mode: 0},
    {name: 'mkdir', path: 'non-existent', mode: 511},
    {name: 'access', path: 'public/output-pages', mode: 0},
    {name: 'mkdir', path: 'public/output-pages', mode: 511},
    {name: 'readdir', path: 'fake-pages'},
    {name: 'readFile', charset: "UTF-8", path: "fake-pages/bar-story.md"},
    {name: 'readFile', charset: "UTF-8", path: "fake-pages/foo-about.md"},
    {name: 'writeFile', file: 'public/output-pages/bar.html', data: '<h1>Some Other content</h1>'},
    {name: 'writeFile', file: 'public/output-pages/foo.html', data: '<h1>Some Other content!!</h1>'},
    {name: 'writeFile', file: 'non-existent/data.json', data: JSON.stringify(expectedParsedContents)}
  ]);
});

it("handles existing data folder ", async () => {
  const fileSystem = createFileSystemWithFolders(fileContents);
  const prepare = createPrepare(fileSystem);

  // when
  const returnVal = await prepare(dataDir, pagesSourceDir, pagesDataFileName, pagesOutputDir);

  // then
  expect(JSON.parse(returnVal)).toEqual(expectedParsedContents);
  const events = fileSystem.getEvents();
  expect(events).toEqual([
    {name: 'access', path: 'non-existent', mode: 0},
    {name: 'access', path: 'public/output-pages', mode: 0},
    {name: 'readdir', path: 'fake-pages'},
    {name: 'readFile', charset: "UTF-8", path: "fake-pages/bar-story.md"},
    {name: 'readFile', charset: "UTF-8", path: "fake-pages/foo-about.md"},
    {name: 'writeFile', file: 'public/output-pages/bar.html', data: '<h1>Some Other content</h1>'},
    {name: 'writeFile', file: 'public/output-pages/foo.html', data: '<h1>Some Other content!!</h1>'},
    {name: 'writeFile', file: 'non-existent/data.json', data: JSON.stringify(expectedParsedContents)}
  ]);

});