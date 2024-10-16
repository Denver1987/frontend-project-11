import { v6 as getUUID } from 'uuid';
import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18n/ru.js';

export const app = {
  feeds: [],
  posts: [],
  clickedLinks: [],
  validationScheme: yup.string().url(),
  form: {
    isValid: true,
    setValidity(bool) {
      this.isValid = bool;
      document.dispatchEvent(new CustomEvent('validitySets', { detail: { isValid: this.isValid } }));
    },
  },

  addClickedLinks(linkId) {
    if (!this.clickedLinks.includes(linkId)) {
      this.clickedLinks.unshift(linkId);
      document.dispatchEvent(new CustomEvent('linkClick', { detail: { linkId } }));
    }
  },

  validate(url) {
    return this.validationScheme.validate(url);
  },

  getPostData(postId) {
    let result;
    this.posts.forEach((post) => {
      if (post.id === postId) {
        result = post;
      }
    });
    return result;
  },

  sendPostData(postId) {
    const post = this.getPostData(postId);
    // @ts-ignore
    document.dispatchEvent(new CustomEvent('postDataSends', { detail: { title: post.title, text: post.text, link: post.link } }));
  },

  requestRss(url) {
    const parser = new DOMParser();
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then(
        (response) => response.data.contents,
      )
      .then(
        (contents) => parser.parseFromString(contents, 'application/xml'),
      )
      .then(
        (rss) => {
          if (rss.querySelector('parsererror')) {
            document.dispatchEvent(new CustomEvent('invalidRSS'));
          } else {
            const feedId = this.addFeed(rss, url);
            this.addItems(rss, feedId);
            document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: this.feeds, items: this.posts, clickedLinks: this.clickedLinks } }));
          }
        },
      )
      .catch((err) => {
        console.log(err);
        if (err.message === 'Network Error') document.dispatchEvent(new CustomEvent('networkError'));
      });
  },

  parseFeed(rssMarkup, url) {
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
    const feed = this.parseFeed(rssMarkup, url);
    this.feeds.unshift(feed);
    return feed.feedId;
  },

  parseItems(rssMarkup) {
    const items = rssMarkup.querySelectorAll('item');
    return items;
  },

  createItemData(itemMarkup, feedId) {
    const itemLink = itemMarkup.querySelector('link').textContent;
    const itemTitle = itemMarkup.querySelector('title').textContent;
    const itemDescription = itemMarkup.querySelector('description').textContent;
    return {
      id: getUUID(),
      feedId,
      link: itemLink,
      title: itemTitle,
      text: itemDescription,
    };
  },

  addItems(rssMarkup, feedId) {
    const items = this.parseItems(rssMarkup);
    items.forEach((item) => this.posts.unshift(this.createItemData(item, feedId)));
    console.log(this.posts);
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
