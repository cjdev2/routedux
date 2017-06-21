
function polyfillCustomEvent() {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
};

function debounce(object, flag, cb) {
  if (!object[flag]) {
    object[flag] = true;
    cb();
  }
}

let MISSING_HISTORY = Symbol("missing_history");
export default function addMissingHistoryEvents(window, history) {
  debounce(history, MISSING_HISTORY, () => {

    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);

    polyfillCustomEvent();

    history.pushState = function (state, title, url) {
      let result = pushState(...arguments);

      var pushstate = new CustomEvent('pushstate', {detail: {state, title, url}});
      window.dispatchEvent(pushstate);
      return result;
    };

    history.replaceState = function (state, title, url) {
      const result = replaceState(...arguments);

      var replacestate = new CustomEvent('replacestate', {detail: {state, title, url}});
      window.dispatchEvent(replacestate);
      return result;
    };
  });
}
