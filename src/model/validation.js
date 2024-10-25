/**
 * определяет валидность введенного URL
 * @param {string} newUrl
 * @param {any} scheme
 * @returns {any}
 */
export function validateUrl(newUrl, scheme) {
  return scheme.validate(newUrl);
}

/**
 * Проверяет, вводился ли URL ранее
 * @param {*} newUrl
 * @param {*} existedFeeds
 * @returns {boolean}
 */
export function checkDoubles(newUrl, existedFeeds) {
  const urls = existedFeeds.map((feed) => feed.url);
  if (urls.includes(newUrl)) {
    document.dispatchEvent(new CustomEvent('enteredDouble'));
    return true;
  }
  return false;
}
