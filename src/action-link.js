import React from 'react';


export default function ActionLink({action, children}, {store}) {

  if(!store) {
    throw new Error("You cannot use ActionLink without providing store via context (possibly using react-redux Provider?)");
  }

  const renderedRoute = store.pathForAction(action);

  return (
    <a href={renderedRoute}
       onClick={ev => {
        ev.preventDefault();
        store.dispatch(action);}}>{children}</a>
  );
};
ActionLink.contextTypes = {
  store: React.PropTypes.object
};
