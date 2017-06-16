

export default function Fragment({state, filterOn, children}) {

    let parts = filterOn.split('.');
    let cur = parts.reduce((cur, next) => cur ? cur[next] : cur, state);

    if(cur) {
        return children;
    } else {
        return null;
    }
}