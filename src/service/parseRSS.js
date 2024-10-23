export function getMarkupFromRss(rss) {
  const parser = new DOMParser();
  return parser.parseFromString(rss.data.contents, 'application/xml');
}
