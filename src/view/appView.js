import i18next from 'i18next';
import onSubmitHandler from '../controller/appController.js';

const urlForm = document.querySelector('.rss-form');
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

function createPostsField() {
  return `<div class="card border-0">
    <div class="card-body"><h2 class="card-title h4">Посты</h2></div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;
}

function renderPost(item) {
  return `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${item.link}" class="fw-bold" data-id="54" target="_blank" rel="noopener noreferrer">${item.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="54" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('seeMore')}</button>
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

function renderRSS(feeds, items) {
  postsField.innerHTML = '';
  feedsField.innerHTML = '';
  postsField.insertAdjacentHTML('beforeend', createPostsField());
  feedsField.insertAdjacentHTML('beforeend', createFeedsField());
  const postList = postsField.querySelector('ul');
  // eslint-disable-next-line array-callback-return
  items.map((item) => {
    postList.insertAdjacentHTML('beforeend', renderPost(item));
  });
  const feedList = feedsField.querySelector('ul');
  // eslint-disable-next-line array-callback-return
  feeds.map((feed) => {
    feedList.insertAdjacentHTML('beforeend', renderFeed(feed));
  });
}

urlForm.addEventListener('submit', onSubmitHandler);
document.addEventListener('validitySetting', (/** @type CustomEvent */event) => {
  renderValidity(event.detail.isValid);
});
document.addEventListener('enteredDouble', renderDoubles);

document.addEventListener('newRSSReceived', (/** @type CustomEvent */event) => {
  renderRSS(event.detail.feeds, event.detail.items);
});
