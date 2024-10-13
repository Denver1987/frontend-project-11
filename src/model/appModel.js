import { v6 as getUUID } from 'uuid';
import axios from 'axios';
import i18next from 'i18next';
import ru from '../i18n/ru.js';

export const app = {
  urls: [],
  feeds: [],
  items: [],
  form: {
    isValid: true,
    setValidity(bool) {
      this.isValid = bool;
      document.dispatchEvent(new CustomEvent('validitySetting', { detail: { isValid: this.isValid } }));
    },
  },
  getRss(url) {
    const parser = new DOMParser();
    return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
      .then((response) => response.data.contents)
      .then((contents) => parser.parseFromString(contents, 'application/xml'))
      .then((rss) => {
        this.addItems(rss);
        this.addFeed(rss);
        document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: this.feeds, items: this.items } }));
      });
  },
  getFeed(rssMarkup) {
    const feedDesctiption = rssMarkup.querySelector('description').textContent;
    const feedTitle = rssMarkup.querySelector('title').textContent;
    return {
      feedId: getUUID(),
      description: feedDesctiption,
      title: feedTitle,
    };
  },
  addFeed(rssMarkup) {
    this.feeds.push(this.getFeed(rssMarkup));
    console.log(this.feeds);
  },
  getItems(rssMarkup) {
    const items = rssMarkup.querySelectorAll('item');
    return items;
  },
  createItemData(itemMarkup) {
    const itemLink = itemMarkup.querySelector('link').textContent;
    const itemTitle = itemMarkup.querySelector('title').textContent;
    const itemDescription = itemMarkup.querySelector('description').textContent;
    return {
      itemId: getUUID(),
      link: itemLink,
      title: itemTitle,
      text: itemDescription,
    };
  },
  addItems(rssMarkup) {
    const items = this.getItems(rssMarkup);
    items.forEach((item) => this.items.push(this.createItemData(item)));
    console.log(this.items);
  },
  checkDoubles(newUrl) {
    if (this.urls.includes(newUrl)) {
      document.dispatchEvent(new CustomEvent('enteredDouble'));
      return true;
    }
    return false;
  },
};

export default function initApp() {
  i18next.init({
    lng: 'ru',
    resources: {
      ru,
    },
  })
    .then(
      () => {
        console.log('Initializing success');
      },
      (error) => {
        console.error('Initializing error:', error);
      },
    );
}
