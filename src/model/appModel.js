import { v6 as getUUID } from 'uuid';
import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18n/ru.js';

export const app = {
  feeds: [],
  items: [],
  viewedLinks: [],
  validationScheme: yup.string().url(),
  form: {
    isValid: true,
    setValidity(bool) {
      this.isValid = bool;
      document.dispatchEvent(new CustomEvent('validitySets', { detail: { isValid: this.isValid } }));
    },
  },

  validate(url) {
    return this.validationScheme.validate(url);
  },

  getRss(url) {
    const parser = new DOMParser();
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then(
        (response) => {
          console.log(response.data.status.content_type);
          return response.data.contents;
        },
        (err) => {
          if (err.message === 'Network Error') document.dispatchEvent(new CustomEvent('networkError'));
        },
      )
      .then((contents) => parser.parseFromString(contents, 'application/xml'))
      .then(
        (rss) => {
          console.log(rss, rss.querySelector('parsererror'));
          if (rss.querySelector('parsererror')) {
            document.dispatchEvent(new CustomEvent('invalidRSS'));
            return;
          }
          const feedId = this.addFeed(rss, url);
          this.addItems(rss, feedId);
          document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: this.feeds, items: this.items } }));
        },
        (err) => {
          console.log(err);
        },
      );
  },
  getFeed(rssMarkup, url) {
    const feedDesctiption = rssMarkup.querySelector('description').textContent;
    const feedTitle = rssMarkup.querySelector('title').textContent;
    return {
      feedId: getUUID(),
      description: feedDesctiption,
      title: feedTitle,
      url,
    };
  },
  addFeed(rssMarkup, url) {
    const feed = this.getFeed(rssMarkup, url);
    this.feeds.unshift(feed);
    console.log(this.feeds);
    return feed.feedId;
  },
  getItems(rssMarkup) {
    const items = rssMarkup.querySelectorAll('item');
    return items;
  },
  createItemData(itemMarkup, feedId) {
    const itemLink = itemMarkup.querySelector('link').textContent;
    const itemTitle = itemMarkup.querySelector('title').textContent;
    const itemDescription = itemMarkup.querySelector('description').textContent;
    return {
      itemId: getUUID(),
      feedId,
      link: itemLink,
      title: itemTitle,
      text: itemDescription,
    };
  },
  addItems(rssMarkup, feedId) {
    const items = this.getItems(rssMarkup);
    items.forEach((item) => this.items.unshift(this.createItemData(item, feedId)));
    console.log(this.items);
  },

  checkDoubles(newUrl) {
    const urls = this.feeds.map((feed) => feed.url);
    if (urls.includes(newUrl)) {
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
