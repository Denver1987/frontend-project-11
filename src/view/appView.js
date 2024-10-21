import i18next from 'i18next';
import { onSubmitHandler, onLinkClickHandler, onViewButtonClickHandler } from '../controller/appController.js';

const urlForm = document.querySelector('.rss-form');
/** @type HTMLInputElement */
const urlInput = urlForm.querySelector('#url-input');
const feedbackField = document.querySelector('.feedback');
const postsField = document.querySelector('.posts');
const feedsField = document.querySelector('.feeds');

function renderValidity(bool) {
  if (bool) {
    urlInput.classList.remove('is-invalid');
    urlInput.classList.add('is-valid');
    feedbackField.textContent = '';
  } else {
    feedbackField.classList.remove('text-success', 'text-warning');
    feedbackField.classList.add('text-danger');
    urlInput.classList.remove('is-valid');
    urlInput.classList.add('is-invalid');
    feedbackField.textContent = i18next.t('errors.invalid');
  }
}

function renderDoubles() {
  urlInput.classList.remove('is-valid');
  urlInput.classList.add('is-invalid');
  feedbackField.classList.remove('text-success', 'text-warning');
  feedbackField.classList.add('text-danger');
  feedbackField.textContent = i18next.t('errors.rssExists');
}

function renderInvalidRSS() {
  feedbackField.classList.remove('text-success', 'text-warning');
  feedbackField.classList.add('text-danger');
  feedbackField.textContent = i18next.t('errors.noRSS');
}

function renderNetworkError() {
  feedbackField.classList.remove('text-success', 'text-warning');
  feedbackField.classList.add('text-danger');
  feedbackField.textContent = i18next.t('errors.networkError');
}

function renderSuccess() {
  feedbackField.classList.remove('text-warning', 'text-danger');
  feedbackField.classList.add('text-success');
  feedbackField.textContent = i18next.t('success');
}

function postLink(strings, link, clickedLinks, id) {
  let linkClass;
  if (clickedLinks.includes(id)) linkClass = 'fw-normal link-secondary';
  else linkClass = 'fw-bold';
  return `${strings[0]}${link}${strings[1]}${linkClass}${strings[2]}${id}${strings[3]}`;
}

function createPostsField() {
  return `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">Посты</h2></div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
}

function renderPost(item, clickedLinks) {
  return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">${
    postLink`<a href="${item.link}" class="${clickedLinks}" data-id="${item.id}"`} target="_blank"} rel="noopener noreferrer">${item.title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('seeMore')}</button>
      </li>`;
}

function renderFeed(feed) {
  return `<li class="list-group-item border-0 border-end-0">
        <h3 class="h6 m-0">${feed.title}</h3>
        <p class="m-0 small text-black-50">${feed.description}</p>
      </li>`;
}

function createFeedsField() {
  return `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">Фиды</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
}

function renderViewedLink(event) {
  const link = document.querySelector(`a[data-id='${event.detail.linkId}']`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
}

function renderRSS(feeds, items, clickedLinks) {
  postsField.innerHTML = '';
  feedsField.innerHTML = '';
  postsField.insertAdjacentHTML('beforeend', createPostsField());
  feedsField.insertAdjacentHTML('beforeend', createFeedsField());
  const postList = postsField.querySelector('ul');
  // eslint-disable-next-line array-callback-return
  items.map((item) => {
    postList.insertAdjacentHTML('beforeend', renderPost(item, clickedLinks));
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

function renderModalData(event) {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalButton = document.querySelector('.modal-footer .btn');
  console.log(modalTitle);
  modalTitle.textContent = event.detail.title;
  modalBody.innerHTML = event.detail.text;
  modalButton.setAttribute('href', event.detail.link);
}

urlForm.addEventListener('submit', (event) => {
  event.preventDefault();
  urlInput.classList.remove('is-valid');
  urlInput.classList.remove('is-invalid');
  onSubmitHandler(event);
});

document.addEventListener('validitySets', (/** @type CustomEvent */event) => {
  renderValidity(event.detail.isValid);
});

document.addEventListener('enteredDouble', renderDoubles);

document.addEventListener('newRSSReceived', (/** @type CustomEvent */event) => {
  urlInput.value = '';
  renderRSS(event.detail.feeds, event.detail.items, event.detail.clickedLinks);
  renderSuccess();
});

document.addEventListener('invalidRSS', renderInvalidRSS);

document.addEventListener('networkError', renderNetworkError);

document.addEventListener('linkClick', renderViewedLink);

document.addEventListener('postDataSends', renderModalData);
