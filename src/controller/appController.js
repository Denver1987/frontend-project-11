import isUrl from 'is-url';
import { app } from '../model/appModel.js';

export default function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  if (!app.checkDoubles(formData)) {
    app.urls.push(formData);
    // const enteredUrl = formData.get('url');
    // @ts-ignore
    const isValidUrl = isUrl(formData);
    console.log(isValidUrl);
    app.form.setValidity(isValidUrl);
    if (app.form.isValid) {
      app.getRss(formData);
    }
  }
}
