const ActionLink = (React, PropTypes, ReactRedux) => {
  class ActionLink extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      const { action, children, ...props } = this.props;
      const { store } = this.context;
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
  }

  ActionLink.propTypes = {
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    children: PropTypes.node
  };
  ActionLink.contextType = ReactRedux.ReactReduxContext;

  return ActionLink;
};

let OutComponent = ActionLink;
try {
  const React = require("react");
  const PropTypes = require("prop-types");
  const ReactRedux = require("react-redux");

  OutComponent = ActionLink(React, PropTypes, ReactRedux);
} catch (e) {
  /* empty */
}

export const _internal = {
  ActionLink
};

export default OutComponent;
