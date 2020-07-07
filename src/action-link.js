const ActionLink = (React, PropTypes) => {
  class ActionLink extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      const { action, children, ...props } = this.props;

      const renderedRoute = this.store.pathForAction(action);

      return (
        <a
          href={renderedRoute}
          onClick={ev => {
            ev.preventDefault();
            this.store.dispatch(action);
          }}
          {...props}>
          {children}
        </a>
      );
    }
  }

  ActionLink.propTypes = {
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.node,
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
  ActionLink,
};

export default OutComponent;
