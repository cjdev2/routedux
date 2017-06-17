import React from 'react';
import { SideNav, Link as SideNavLink } from '@cjdev/visual-stack/lib/components/SideNav';


export default function({items}) {
  return (
    <SideNav>

      {items.map((item) => {
        return <SideNavLink key={item.id}><a href={item.url}>{item.title}</a></SideNavLink>
      })}
    </SideNav>
  );
};