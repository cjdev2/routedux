// Ugly way to deal with optional dependency so we don't break projects not using react.
let React = null;

const ActionLink = ({action, children}, {store}) => {


  if (!React) {
    throw new Error("You cannot use ActionLink unless react is available");
  }

  if (!store) {
    throw new Error("You cannot use ActionLink without providing store via context (possibly using react-redux Provider?)");
  }

  const renderedRoute = store.pathForAction(action);

  return (
    <a href={renderedRoute}
       onClick={ev => {
         ev.preventDefault();
         store.dispatch(action);
       }}>{children}</a>
  );
};

try {
  React = require('react');
  ActionLink.contextTypes = {
    store: React.PropTypes.object
  };

} catch (e) {

}

export default ActionLink;
