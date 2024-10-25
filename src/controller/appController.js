import { processNewUrl, processViewButtonClick, processLinkClick } from '../model/appModel.js';

/**
 * Обрабатывает отправку данных формы
 * @param {Event} event
 */
export function onSubmitHandler(event) {
  event.preventDefault();
  const url = new FormData(/** @type HTMLFormElement */(event.target)).get('url');
  processNewUrl(String(url));
}

/**
 * Обрабатывает нажатие на ссылку-заголовок
 * @param {Event} event
 */
export function onLinkClickHandler(event) {
  processLinkClick(/** @type HTMLAnchorElement */(event.target).dataset.id);
}

/**
 * Обрабатывает нажатие на кнопку просмотра поста
 * @param {Event} event
 */
export function onViewButtonClickHandler(event) {
  processViewButtonClick(/** @type HTMLAnchorElement */(event.target).dataset.id);
}
