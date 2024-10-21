import { app, processNewUrl, processViewButtonClick } from '../model/appModel.js';

export function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  processNewUrl(formData);
}

export function onLinkClickHandler(event) {
  app.addClickedLinks(event.target.dataset.id);
}

export function onViewButtonClickHandler(event) {
  processViewButtonClick(event.target.dataset.id);
}
