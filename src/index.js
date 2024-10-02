import 'bootstrap';
import './styles.scss';
import './view/addView.js';
import getRss from './service/service.js';
import { appModel } from './model/appModel.js';

getRss('https://lorem-rss.hexlet.app/feed').then((rss) => {
  appModel.addItems(rss);
  appModel.addFeed(rss);
  console.log(appModel);
});
