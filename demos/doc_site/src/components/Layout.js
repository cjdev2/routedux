import React from 'react';
import { Panel, Body, Header } from '@cjdev/visual-stack/lib/components/Panel';
import ApplicationLayout from '@cjdev/visual-stack/lib/layouts/ApplicationLayout';
import "./Layout.css"

export default function Layout({content, nav, headerContent}) {

    return (
      <ApplicationLayout sideNav={nav}>
        <Panel>
            <Header>{headerContent}</Header>
            <div className="article-body">
                <Body>{content}</Body>
            </div>
        </Panel>
      </ApplicationLayout>
    );
};
