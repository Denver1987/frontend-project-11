import 'bootstrap';
import './styles.scss';

import './view/appView.js';
import getRss from './service/service.js';
import appModel from './model/appModel.js';

getRss('https://lorem-rss.hexlet.app/feed').then((rss) => {
  appModel.addItems(rss);
  appModel.addFeed(rss);
});

getRss('https://www.finam.ru/analysis/conews/rsspoint/').then((rss) => {
  appModel.addItems(rss);
  appModel.addFeed(rss);
});
