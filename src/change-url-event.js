import R from 'ramda';

export function wrapEvent(target, name, obj) {
  target.addEventListener(name, obj);
}


function debounce(object, flag, cb) {
  if (!object[flag]) {
    object[flag] = true;
    cb();
  }
}

let MISSING_CHANGE_URL = Symbol("missing_change_url");
export default function addChangeUrlEvent(window) {

  debounce(window, MISSING_CHANGE_URL, () => {
    const changeUrlEventCreator = ({
      lastLocation: null,
      handleEvent(ev) { // interface for EventListener

        let {hash, host, hostname, origin, href, pathname, port, protocol} =
            window.location || {};
        // store in object for comparison
        const pushedLocation = {hash, host, hostname, origin, href, pathname, port, protocol};

        // only dispatch action when url has actually changed so same link can be clicked repeatedly.
        if (!R.equals(pushedLocation, this.lastLocation)) {
          var urlChangeEvent = new CustomEvent('urlchanged', {detail: pushedLocation});
          window.dispatchEvent(urlChangeEvent);
          this.lastLocation = pushedLocation;
        }
      }
    });

    // / make sure we fire urlchanged for these
    wrapEvent(window, 'popstate', changeUrlEventCreator);
    wrapEvent(window, 'pushstate', changeUrlEventCreator);
    wrapEvent(window, 'replacestate', changeUrlEventCreator);
  });
}
