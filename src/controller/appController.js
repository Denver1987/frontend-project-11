import { app } from '../model/appModel.js';

export function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  if (!app.checkDoubles(formData)) {
    // @ts-ignore
    app.validate(formData)
      .then(
        () => {
          app.form.setValidity(true);
          if (!app.checkDoubles(formData)) app.requestRss(formData);
          else app.form.setValidity(false);
        },
        (err) => {
          console.log(err);
          app.form.setValidity(false);
        },
      );
    // if (app.form.isValid) {
    //   app.getRss();
    // }
  }
}

export function onLinkClickHandler(event) {
  app.addClickedLinks(event.target.dataset.id);
}

export function onViewButtonClickHandler(event) {
  app.addClickedLinks(event.target.dataset.id);
  console.log(app.sendPostData(event.target.dataset.id));
}
