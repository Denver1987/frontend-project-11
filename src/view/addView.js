import onSubmitHandler from '../controller/appController.js';

export const urlForm = document.querySelector('.rss-form');
const urlInput = urlForm.querySelector('#url-input');
export default function renderValidity(bool) {
  if (bool) {
    urlInput.classList.remove('is-invalid');
    urlInput.classList.add('is-valid');
  } else {
    urlInput.classList.remove('is-valid');
    urlInput.classList.add('is-invalid');
  }
}

urlForm.addEventListener('submit', onSubmitHandler);
urlForm.addEventListener('validitySetting', (event) => {
  renderValidity(event.detail.isValid);
});
