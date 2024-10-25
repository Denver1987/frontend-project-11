import { v6 as getUUID } from 'uuid';

/**
 * Извлекает разметку из ответа, полученного через Axios
 * @param {import('axios').AxiosResponse} response
 * @returns {XMLDocument}
 */
export function getMarkupFromResponse(response) {
  const parser = new DOMParser();
  return parser.parseFromString(response.data.contents, 'application/xml');
}

/**
 * Извлекает разметку постов из разметки RSS
 * @param {XMLDocument} rssMarkup
 * @returns {NodeListOf<Element>}
 */
export function parseItems(rssMarkup) {
  const items = rssMarkup.querySelectorAll('item');
  return items;
}

/**
 * Формирует объект с информацией об RSS-канале из разметки
 * @param {XMLDocument} rssMarkup
 * @param {string} url
 * @returns {Feed}
 */
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

/**
 * Формирует пост из разметки
 * @param {Element} itemMarkup
 * @param {string} feedId
 * @returns {Post}
 */
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
