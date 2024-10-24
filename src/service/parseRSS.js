import { v6 as getUUID } from 'uuid';

export function getMarkupFromRss(rss) {
  const parser = new DOMParser();
  return parser.parseFromString(rss.data.contents, 'application/xml');
}

export function parseItems(rssMarkup) {
  const items = rssMarkup.querySelectorAll('item');
  return items;
}

export function parseFeed(rssMarkup, url) {
  const feedDesctiption = rssMarkup.querySelector('description').textContent;
  const feedTitle = rssMarkup.querySelector('title').textContent;
  return {
    feedId: getUUID(),
    description: feedDesctiption,
    title: feedTitle,
    url,
  };
}

export function createPost(itemMarkup, feedId) {
  const postLink = itemMarkup.querySelector('link').textContent;
  const postTitle = itemMarkup.querySelector('title').textContent;
  const postDescription = itemMarkup.querySelector('description').textContent;
  return {
    id: getUUID(),
    feedId,
    link: postLink,
    title: postTitle,
    text: postDescription,
  };
}
