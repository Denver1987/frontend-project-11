export function validateUrl(newUrl, scheme) {
  return scheme.validate(newUrl);
}

export function checkDoubles(newUrl, existedFeeds) {
  const urls = existedFeeds.map((feed) => feed.url);
  if (urls.includes(newUrl)) {
    document.dispatchEvent(new CustomEvent('enteredDouble'));
    return true;
  }
  return false;
}
