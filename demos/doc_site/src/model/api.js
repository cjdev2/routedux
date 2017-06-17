
export const loadArticle = (function () {
  async function loadContents(url) {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error({response: response.status});
    }
    return response.text();
  }

  const contents = {};

  // this is basically fetch with caching.
  return function(url) {
    if (contents[url]) {
      return contents[url];
    }
    return contents[url] = loadContents(url);
  }
})();