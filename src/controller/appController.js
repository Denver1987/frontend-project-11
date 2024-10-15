import { app } from '../model/appModel.js';

export default function onSubmitHandler(event) {
  event.preventDefault();
  const formData = (new FormData(event.target)).get('url');
  if (!app.checkDoubles(formData)) {
    // const enteredUrl = formData.get('url');
    // @ts-ignore
    app.validate(formData)
      .then(
        () => {
          app.form.setValidity(true);
          if (!app.checkDoubles(formData)) app.getRss(formData);
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
