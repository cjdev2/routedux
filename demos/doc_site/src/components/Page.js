import React from 'react';
import Layout from './Layout';
import {connect} from 'react-redux';
import {actions, getContentsById} from '../model';

function Page({menu, title, contents}) {
  return (
    <Layout nav={menu}
            content={<div dangerouslySetInnerHTML={{__html: contents}}/>}
            headerContent={title}/>
  );
}

const mapStateToProps = ({currentTitle, id, ...state}, own) => {

  let contents;
  const title = own.title ? own.title : currentTitle;

  if(own.contents) {
    contents = own.contents;
  }
  if(!contents) {
    const foundContents = getContentsById(id, state);
    contents = foundContents ? foundContents : 'Loading...';
  }

  return {menu: own.menu, title, contents};
};

const mapActionsToProps = {
  needContent: actions.changeId
};

export default connect(mapStateToProps, mapActionsToProps)(Page);

export {Page, mapStateToProps};
