import { app, processNewUrl, processViewButtonClick } from '../model/appModel.js';

export function onSubmitHandler(event) {
  event.preventDefault();
  const url = (new FormData(event.target)).get('url');
  processNewUrl(url);
}

export function onLinkClickHandler(event) {
  app.addClickedLink(event.target.dataset.id);
}

export function onViewButtonClickHandler(event) {
  processViewButtonClick(event.target.dataset.id);
}
