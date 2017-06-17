'use strict';

const nodesStupidFs = require('fs');
const path = require('path');
import frontMatter from 'front-matter';
import {markdown} from 'markdown';

const ALL_ACCESS = 0o777;

export function createPrepare(fs) {

  function storeJsonData(filePath, data) {
    return writeData(filePath, JSON.stringify(data));
  }

  function writeData(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, function (err) {
        if (err) reject(err);
        else resolve(data)
      })
    });
  }

  function ensureDirectoryExists(directory) {
    return new Promise(function (resolve, reject) {
      const maybeCreate = err => {
        if (err) {
          fs.mkdir(directory, ALL_ACCESS, function (err) {
            if (err) reject(err);
            else resolve()
          })
        } else {
          resolve()
        }
      };
      fs.access(directory, fs.constants.F_OK, maybeCreate);
    });
  }

  function getFiles(directory) {
    return new Promise((resolve, reject) => {
      const cb = (err, data) => {
        if (err) {
          reject(err);
        }
        else {
          const qualified = data.map((p => directory + '/' + p));
          resolve(qualified);
        }
      };
      fs.readdir(directory, cb);
    });
  }

  function readFiles(files) {

    const promises = files.map((file) => new Promise((resolve, reject) => {
      const cb = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      };
      fs.readFile(file, 'UTF-8', cb);
    }));
    return Promise.all(promises);
  }

  function fileOutputName(id, directory) {
    const regularizedDir = directory.endsWith('/') ? directory : directory + '/';

    return regularizedDir + id + '.html';
  }

  async function writeHtmlFromParsed(items, outputHtmlDir) {

    const promises = items.map(async (item) => {
      const id = item.attributes.id;
      const filePath = fileOutputName(id, outputHtmlDir);

      let contents = markdown.toHTML(item.body);
      return await writeData(filePath, contents);
    });

    return Promise.all(promises);
  }

  return async function (dataDir, pagesDir, tableOfContentsFile, outputHtmlDir) {
    await ensureDirectoryExists(dataDir);
    await ensureDirectoryExists(outputHtmlDir);

    const files = await getFiles(pagesDir);
    const filesContents = await readFiles(files);
    const parsed = filesContents.map(frontMatter);

    const data = parsed.map(item => {
      const attr = item.attributes;
      return Object.assign({
        contentsUrl: fileOutputName(attr.id, outputHtmlDir.replace('public', ''))
      }, attr);
    });

    await writeHtmlFromParsed(parsed, outputHtmlDir);

    return await storeJsonData(dataDir + '/' + tableOfContentsFile, data);
  }
}


export default function runnerBuilder() {

  const Filesystem = nodesStupidFs,
        pagesDir = 'src/pages',
        outputHtmlDir = 'public/pages',
        dataDir = 'src/data',
        pagesDataFilename = 'pages.json';

  const runnable = createPrepare(Filesystem);
  return () => runnable(dataDir, pagesDir, pagesDataFilename, outputHtmlDir);
};