import isUrl from 'is-url';
import appModel from '../model/appModel.js';

export default function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  if (!appModel.checkDoubles(formData)) {
    appModel.urls.push(formData);
    // const enteredUrl = formData.get('url');
    // @ts-ignore
    const isValidUrl = isUrl(formData);
    console.log(isValidUrl);
    appModel.form.setValidity(isValidUrl);
    if (appModel.form.isValid) {
      appModel.getRss(formData);
    }
  }
}
