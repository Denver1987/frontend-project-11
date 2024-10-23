import { v6 as getUUID } from 'uuid';
import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18n/ru.js';
import { loadRSS } from '../service/network.js';
import { getMarkupFromRss } from '../service/parseRSS.js';
import { validateUrl, checkDoubles } from '../service/validation.js';

export const app = {
  settings: {
    updatingInterval: 5000,
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

  addClickedLinks(linkId) {
    if (!this.clickedLinks.includes(linkId)) {
      this.clickedLinks.unshift(linkId);
      document.dispatchEvent(new CustomEvent('linkClick', { detail: { linkId } }));
    }
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

  addFeed(rssMarkup, url) {
    const feed = parseFeed(rssMarkup, url);
    this.feeds.unshift(feed);
    return feed.feedId;
  },

  createPostData(itemMarkup, feedId) {
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
    const items = parseItems(rssMarkup);
    items.forEach((item) => this.posts.unshift(this.createPostData(item, feedId)));
    console.log(this.posts);
  },

  addNewItem(itemData) {
    app.posts.unshift(itemData);
    console.log(app.posts);
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
          app.addItems(rssMarkup, feedId);
          document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: app.feeds, items: app.posts, clickedLinks: app.clickedLinks } }));
        }
      },
    )
    .catch((err) => {
      console.log(err);
      if (err.message === 'Network Error') document.dispatchEvent(new CustomEvent('networkError'));
    });
}

function parseItems(rssMarkup) {
  const items = rssMarkup.querySelectorAll('item');
  return items;
}

function parseFeed(rssMarkup, url) {
  const feedDesctiption = rssMarkup.querySelector('description').textContent;
  const feedTitle = rssMarkup.querySelector('title').textContent;
  return {
    feedId: getUUID(),
    description: feedDesctiption,
    title: feedTitle,
    url,
  };
}

function createPostData(itemMarkup, feedId) {
  const postLink = itemMarkup.querySelector('link').textContent;
  const postTitle = itemMarkup.querySelector('title').textContent;
  const postDescription = itemMarkup.querySelector('description').textContent;
  return {
    id: getUUID(),
    feedId,
    link: postLink,
    title: postTitle,
    text: postDescription,
  };
}

function sendPostData(postId) {
  const post = app.getPostData(postId);
  // @ts-ignore
  document.dispatchEvent(new CustomEvent('postDataSends', { detail: { title: post.title, text: post.text, link: post.link } }));
}

export function processViewButtonClick(postId) {
  app.addClickedLinks(postId);
  sendPostData(postId);
}

export function processLinkClick(postId) {
  app.addClickedLinks(postId);
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
  const existsPosts = app.posts.map((post) => ({ title: post.title, text: post.text }));
  return loadRSS(url)
    .then(
      (response) => getMarkupFromRss(response),
    )
    .then(
      (rss) => {
        const items = parseItems(rss);
        items.forEach((item) => {
          const itemData = createPostData(item, feedId);
          if (existsPosts.some((post) => post.text === itemData.text
          && post.title === itemData.title)) return;
          console.log('new', itemData);
          app.addNewItem(itemData);
          document.dispatchEvent(new CustomEvent('newPostReceived', { detail: { item: itemData } }));
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
    lng: 'ru',
    resources: {
      ru,
    },
  })
    .then(
      () => {
        setTimeout(function update() {
          updateFeeds(app.feeds);
          setTimeout(update, app.settings.updatingInterval);
        }, app.settings.updatingInterval);
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
