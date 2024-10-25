import i18next from 'i18next';
import { onSubmitHandler, onLinkClickHandler, onViewButtonClickHandler } from '../controller/appController.js';

const urlForm = document.querySelector('.rss-form');
/** @type HTMLInputElement */
const urlInput = urlForm.querySelector('#url-input');
const feedbackField = document.querySelector('.feedback');
const postsField = document.querySelector('.posts');
const feedsField = document.querySelector('.feeds');

/**
 * Отрисовывает красную рамку инпута
 */
function renderInvalidInput() {
  urlInput.classList.remove('is-valid');
  urlInput.classList.add('is-invalid');
}

/**
 * Отрисовывает красную рамку инпута
 */
function renderValidInput() {
  urlInput.classList.remove('is-invalid');
  urlInput.classList.add('is-valid');
}

/**
 * Устанавливает красный цвет текста вывода ошибок
 */
function renderTextDanger() {
  feedbackField.classList.remove('text-success', 'text-warning');
  feedbackField.classList.add('text-danger');
}

/**
 * Устанавливает красный цвет текста вывода ошибок
 */
function renderTextSuccess() {
  feedbackField.classList.remove('text-warning', 'text-danger');
  feedbackField.classList.add('text-success');
}

/**
 * Отрисовывает текст ошибки валидации или очищает поле, если URL валиден
 * @param {boolean} isValid
 * @param {string} error
 */
function renderValidity(isValid, error) {
  if (isValid) {
    renderValidInput();
    feedbackField.textContent = '';
  } else {
    if (error === 'double') {
      renderInvalidInput();
      renderTextDanger();
      feedbackField.textContent = i18next.t('errors.rssExists');
    }
    if (error === 'invalidURL') {
      renderInvalidInput();
      renderTextDanger();
      feedbackField.textContent = i18next.t('errors.invalid');
    }
  }
}

/**
 * Отрисовывает текст ошибки, если ссылка не содержит валидный RSS
 */
function renderInvalidRSS() {
  renderTextDanger();
  feedbackField.textContent = i18next.t('errors.noRSS');
}

/**
 * Отрисовывает текст ошибки, если сеть недоступна
 */
function renderNetworkError() {
  renderTextDanger();
  feedbackField.textContent = i18next.t('errors.networkError');
}

/**
 * Отрисовывает текст успешной обработки RSS
 */
function renderSuccess() {
  renderTextSuccess();
  feedbackField.textContent = i18next.t('success');
}

/**
 * Определяет, является ли ссылка посещенной
 * @param {TemplateStringsArray} strings
 * @param {string} link
 * @param {[string]} clickedLinks
 * @param {string} id
 * @returns {string}
 */
function postLink(strings, link, clickedLinks, id) {
  let linkClass;
  if (clickedLinks && clickedLinks.includes(id)) linkClass = 'fw-normal link-secondary';
  else linkClass = 'fw-bold';
  return `${strings[0]}${link}${strings[1]}${linkClass}${strings[2]}${id}${strings[3]}`;
}

/**
 * Формирует разметку поля с постами
 * @returns {string}
 */
function renderPostsField() {
  return `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">Посты</h2></div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
}

/**
 * Формирует разметку поля с RSS-каналами
 * @returns {string}
 */
function renderFeedsField() {
  return `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">Фиды</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
}

/**
 * Формирует разметку поста
 * @returns {string}
 */
function renderPost(item, clickedLinks) {
  return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">${
    postLink`<a href="${item.link}" class="${clickedLinks}" data-id="${item.id}"`} target="_blank"} rel="noopener noreferrer">${item.title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('seeMore')}</button>
      </li>`;
}

/**
 * Формирует разметку RSS-канала
 * @returns {string}
 */
function renderFeed(feed) {
  return `<li class="list-group-item border-0 border-end-0">
        <h3 class="h6 m-0">${feed.title}</h3>
        <p class="m-0 small text-black-50">${feed.description}</p>
      </li>`;
}

/**
 * Отрисовывает ссылку-заголовок поста как посещенную
 * @param {CustomEvent} event
 */
function renderViewedLink(event) {
  const link = document.querySelector(`a[data-id='${event.detail.linkId}']`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
}

/**
 * Отрисовывает все посты и фиды
 * @param {[Feed]} feeds
 * @param {[Post]} posts
 * @param {*} clickedLinks
 */
function renderRSS(feeds, posts, clickedLinks) {
  postsField.innerHTML = '';
  feedsField.innerHTML = '';
  postsField.insertAdjacentHTML('beforeend', renderPostsField());
  feedsField.insertAdjacentHTML('beforeend', renderFeedsField());
  const postList = postsField.querySelector('ul');
  // eslint-disable-next-line array-callback-return
  posts.map((post) => {
    postList.insertAdjacentHTML('beforeend', renderPost(post, clickedLinks));
    const lastListItem = postList.querySelector('li:last-child');
    lastListItem.querySelector('a').addEventListener('click', onLinkClickHandler);
    lastListItem.querySelector('button').addEventListener('click', onViewButtonClickHandler);
  });
  const feedList = feedsField.querySelector('ul');
  // eslint-disable-next-line array-callback-return
  feeds.map((feed) => {
    feedList.insertAdjacentHTML('beforeend', renderFeed(feed));
  });
}

/**
 * Отрисовывает новый пост
 * @param {CustomEvent} event
 */
function renderNewPost(event) {
  const postList = postsField.querySelector('ul');
  postList.insertAdjacentHTML('afterbegin', renderPost(event.detail.post));
  const insertedListItem = postList.querySelector('li:first-child');
  insertedListItem.querySelector('a').addEventListener('click', onLinkClickHandler);
  insertedListItem.querySelector('button').addEventListener('click', onViewButtonClickHandler);
}

/**
 * Отрисовывает модальное окно с содержимым поста
 * @param {CustomEvent} event
 */
function renderModal(event) {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalButton = document.querySelector('.modal-footer .btn');
  modalTitle.textContent = event.detail.title;
  modalBody.innerHTML = event.detail.text;
  modalButton.setAttribute('href', event.detail.link);
}

/**
 * Управляет блокировкой кнопки
 * @param {CustomEvent} event
 */
function renderFormButtonBlocking(event) {
  /** @type { HTMLButtonElement } */
  const formButton = urlForm.querySelector('button[type="submit"]');
  formButton.disabled = event.detail.isBlocked;
}

urlForm.addEventListener('submit', (event) => {
  event.preventDefault();
  urlInput.classList.remove('is-valid');
  urlInput.classList.remove('is-invalid');
  onSubmitHandler(event);
});

document.addEventListener('validitySets', (/** @type CustomEvent */event) => {
  renderValidity(event.detail.isValid, event.detail.error);
});

document.addEventListener('newRSSReceived', (/** @type CustomEvent */event) => {
  urlInput.value = '';
  renderRSS(event.detail.feeds, event.detail.posts, event.detail.clickedLinks);
  renderSuccess();
});

document.addEventListener('newPostReceived', renderNewPost);

document.addEventListener('invalidRSS', renderInvalidRSS);

document.addEventListener('networkError', renderNetworkError);

document.addEventListener('linkClick', renderViewedLink);

document.addEventListener('postDataSends', renderModal);

document.addEventListener('buttonBlockSets', renderFormButtonBlocking);
