import React from 'react';
import { SideNav, Link as SideNavLink } from '@cjdev/visual-stack/lib/components/SideNav';
import { connect } from 'react-redux';

function MenuSidebar({items, changePage}) {
  return (
    <SideNav>
      {items.map((item) => {
        return (
          <SideNavLink key={item.id}>
            <a onClick={
                 (ev) => {
                   ev.preventDefault();
                   changePage(item.id);
                 }
              }>{item.title}</a>
          </SideNavLink>
        );
      })}
    </SideNav>
  );
};

let mapDispatchToProps = (dispatch) => ({
  changePage(id) {
    dispatch({type: 'CHANGE_ID', id});
  }
});

export default connect(
  () => ({}),
  mapDispatchToProps
)(MenuSidebar);
