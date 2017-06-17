import React from 'react';
import './App.css';
import '@cjdev/visual-stack/lib/global';
import MenuSidebar from './components/MenuSidebar';
import Page from './components/Page';
import tableOfContents from "./data/pages.json";

const tableOfContents1 = tableOfContents.map(article => {
  return Object.assign({url: "/pages/" + article.id}, article);
});

const menu = <MenuSidebar items={tableOfContents1} />;

function App() {
  return (
      <Page menu={menu} />
    );
}

export default App;
