export const ActionLink = (React, PropTypes) => {
  function ActionLink({ action, children, ...props }, { store }) {
    const renderedRoute = store.pathForAction(action);

    return (
      <a
        href={renderedRoute}
        onClick={ev => {
          ev.preventDefault();
          store.dispatch(action);
        }}
        {...props}
      >
        {children}
      </a>
    );
  }

  ActionLink.propTypes = {
    action: PropTypes.string,
    children: PropTypes.node
  };
  ActionLink.contextTypes = {
    store: PropTypes.object
  };

  return ActionLink;
};

let OutComponent = ActionLink;
try {
  const React = require("react");
  const PropTypes = require("prop-types");
  OutComponent = ActionLink(React, PropTypes);
} catch (e) {
  /* empty */
}

export const _internal = {
  ActionLink
};

export default OutComponent;
