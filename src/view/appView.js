import i18next from 'i18next';
import ru from '../i18n/ru.js';
import onSubmitHandler from '../controller/appController.js';

i18next.init({
  lng: 'ru',
  resources: {
    ru,
  },
});

export const urlForm = document.querySelector('.rss-form');
const urlInput = urlForm.querySelector('#url-input');
const feedbackField = document.querySelector('.feedback');

export function renderValidity(bool) {
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
  feedbackField.classList.remove('text-success', 'text-warning');
  feedbackField.classList.add('text-danger');
  feedbackField.textContent = i18next.t('errors.rssExists');
}

urlForm.addEventListener('submit', onSubmitHandler);
document.addEventListener('validitySetting', (/** @type CustomEvent */event) => {
  renderValidity(event.detail.isValid);
});
document.addEventListener('enteredDouble', () => renderDoubles());
