try { // making this optional dependency b/c it's automatically exported but only
     // useful when react is installed
  const React = require('react');
} catch(e) {
}

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
