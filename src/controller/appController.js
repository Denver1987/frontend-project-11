import isUrl from 'is-url';
import urlInputModel from '../model/appModel.js';

export default function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  // const enteredUrl = formData.get('url');
  // @ts-ignore
  const isValidUrl = isUrl(formData);
  console.log(isValidUrl);
  urlInputModel.setValidity(isValidUrl);
}
