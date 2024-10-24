import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18n/ru.js';
import loadRSS from '../service/network.js';
import {
  getMarkupFromRss, parseItems, parseFeed, createPost,
} from '../service/parseRSS.js';
import { validateUrl, checkDoubles } from '../service/validation.js';

export const app = {
  settings: {
    updatingInterval: 5000,
    locale: 'ru',
    getUpdatingInterval() {
      return this.updatingInterval;
    },
    getLocale() {
      return this.locale;
    },
  },

  feeds: [],
  posts: [],
  clickedLinks: [],

  validationScheme: yup.string().url(),

  form: {
    isButtonBlocked: false,
    isValid: true,

    setValidity(isValid, error) {
      this.isValid = isValid;
      document.dispatchEvent(new CustomEvent('validitySets', { detail: { isValid: this.isValid, error } }));
    },

    blockButton(isBlocked) {
      this.isButtonBlocked = isBlocked;
      document.dispatchEvent(new CustomEvent('buttonBlockSets', { detail: { isBlocked: this.isButtonBlocked } }));
    },
  },

  getClickedLinks() {
    return this.clickedLinks;
  },

  getPosts() {
    return this.posts;
  },

  getFeeds() {
    return this.feeds;
  },

  getPost(postId) {
    let result;
    this.getPosts().forEach((post) => {
      if (post.id === postId) {
        result = post;
      }
    });
    return result;
  },

  addClickedLink(linkId) {
    if (!this.clickedLinks.includes(linkId)) {
      this.clickedLinks.unshift(linkId);
      document.dispatchEvent(new CustomEvent('linkClick', { detail: { linkId } }));
    }
  },

  addFeed(rssMarkup, url) {
    const feed = parseFeed(rssMarkup, url);
    this.feeds.unshift(feed);
    return feed.feedId;
  },

  addPosts(rssMarkup, feedId) {
    const items = parseItems(rssMarkup);
    items.forEach((item) => this.posts.unshift(createPost(item, feedId)));
    document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: this.getFeeds(), items: this.getPosts(), clickedLinks: this.getClickedLinks() } }));
  },

  addNewPost(post) {
    app.posts.unshift(post);
    document.dispatchEvent(new CustomEvent('newPostReceived', { detail: { item: post } }));
  },
};

function requestRss(url) {
  return loadRSS(url)
    .then(
      (response) => getMarkupFromRss(response),
    )
    .then(
      (rssMarkup) => {
        if (rssMarkup.querySelector('parsererror')) {
          document.dispatchEvent(new CustomEvent('invalidRSS'));
        } else {
          const feedId = app.addFeed(rssMarkup, url);
          app.addPosts(rssMarkup, feedId);
        }
      },
    )
    .catch((err) => {
      console.log(err);
      if (err.message === 'Network Error') document.dispatchEvent(new CustomEvent('networkError'));
    });
}

export function processViewButtonClick(postId) {
  app.addClickedLink(postId);
  const post = app.getPost(postId);
  // @ts-ignore
  document.dispatchEvent(new CustomEvent('postDataSends', { detail: { title: post.title, text: post.text, link: post.link } }));
}

export function processLinkClick(postId) {
  app.addClickedLink(postId);
}

export function processNewUrl(newUrl) {
  app.form.blockButton(true);
  validateUrl(newUrl, app.validationScheme).then(
    () => {
      app.form.setValidity(true, null);
      if (!checkDoubles(newUrl, app.feeds)) {
        requestRss(newUrl).then(() => app.form.blockButton(false));
      } else {
        app.form.setValidity(false, 'double');
        app.form.blockButton(false);
      }
    },
    (err) => {
      console.log(err);
      app.form.setValidity(false, 'invalidURL');
      app.form.blockButton(false);
    },
  );
}

function checkNewPosts(url, feedId) {
  const existsPosts = app.getPosts().map((post) => ({ title: post.title, text: post.text }));
  return loadRSS(url)
    .then(
      (response) => getMarkupFromRss(response),
    )
    .then(
      (rss) => {
        const newItems = parseItems(rss);
        newItems.forEach((item) => {
          const newPost = createPost(item, feedId);
          if (existsPosts.some((existsPost) => existsPost.text === newPost.text
          && existsPost.title === newPost.title)) return;
          app.addNewPost(newPost);
        });
      },
    )
    .catch((err) => {
      console.log(err);
    });
}

function updateFeeds(feeds) {
  // eslint-disable-next-line array-callback-return
  feeds.map((feed) => {
    checkNewPosts(feed.url, feed.feedId);
  });
}

export default function initApp() {
  i18next.init({
    lng: app.settings.getLocale(),
    resources: {
      ru,
    },
  })
    .then(
      () => {
        setTimeout(function update() {
          updateFeeds(app.getFeeds());
          setTimeout(update, app.settings.getUpdatingInterval());
        }, app.settings.getUpdatingInterval());
      },
    )
    .then(
      () => {
        console.log('Initializing success');
      },
    )
    .catch((error) => {
      console.error('Initializing error:', error);
    });
}
