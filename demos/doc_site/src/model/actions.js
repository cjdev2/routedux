
export const CHANGE_ID = "CHANGE_ID";
export const CONTENT_RECEIVED = "CONTENT_RECEIVED";

const createContentReceived = (id, contents) => {
  return {type: CONTENT_RECEIVED, id, contents};
};

const changeId = (id) => {
  return { type: CHANGE_ID, id };
};

export const actions = {
  changeId,
  createContentReceived
};