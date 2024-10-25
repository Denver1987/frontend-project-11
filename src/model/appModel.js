import i18next from 'i18next';
import * as yup from 'yup';
import ru from '../i18n/ru.js';
import loadRSS from '../service/network.js';
import {
  getMarkupFromResponse, parseItems, parseFeed, createPost,
} from './parseRSS.js';
import { validateUrl, checkDoubles } from './validation.js';

const app = {
  settings: {
    updatingInterval: 5000,
    locale: 'ru',

    /**
     * Возвращиет период обновления
     * @returns {number}
     */
    getUpdatingInterval() {
      return this.updatingInterval;
    },

    /**
     * Возвращает текущий язык приложения
     * @returns {string}
     */
    getLocale() {
      return this.locale;
    },
  },
  /** @type {Array<Feed>} */
  feeds: [],
  /** @type {Array<Post>} */
  posts: [],
  /** @type {Array<string>} */
  clickedLinks: [],

  validationScheme: yup.string().url(),

  form: {
    isButtonBlocked: false,
    isValid: true,

    /**
     * Усианавливает валидность введенного в форму значения
     * @param {boolean} isValid
     * @param {string} error
     */
    setValidity(isValid, error) {
      this.isValid = isValid;
      document.dispatchEvent(new CustomEvent('validitySets', { detail: { isValid: this.isValid, error } }));
    },

    /**
     * Устанавливает блокировку кнопки отправки
     * @param {boolean} isBlocked
     */
    blockButton(isBlocked) {
      this.isButtonBlocked = isBlocked;
      document.dispatchEvent(new CustomEvent('buttonBlockSets', { detail: { isBlocked: this.isButtonBlocked } }));
    },
  },

  /**
   * Возвращает массив нажатых ссылок
   * @returns {Array<string>}
   */
  getClickedLinks() {
    return this.clickedLinks;
  },

  /**
   * Возвращает массив нажатых ссылок
   * @returns {Array<Post>}
   */
  getPosts() {
    return this.posts;
  },

  /**
   * Возвращает массив нажатых ссылок
   * @returns {Array<Feed>}
   */
  getFeeds() {
    return this.feeds;
  },

  /**
   * Возвращает содержимое поста по id.
   * @param {Post["id"]} postId
   * @returns {Post}
   */
  getPost(postId) {
    let result;
    this.getPosts().forEach((post) => {
      if (post.id === postId) {
        result = post;
      }
    });
    return result;
  },

  /**
   * Добавляет код нажатой ссылки в массив
   * @param {string} linkId
   */
  addClickedLink(linkId) {
    if (!this.clickedLinks.includes(linkId)) {
      this.clickedLinks.unshift(linkId);
      document.dispatchEvent(new CustomEvent('linkClick', { detail: { linkId } }));
    }
  },

  /**
   * Сохраняет новый RSS-канал, извлекая данные из разметки
   * @param {XMLDocument} rssMarkup
   * @param {string} url
   */
  addNewRSS(rssMarkup, url) {
    const feed = parseFeed(rssMarkup, url);
    this.feeds.unshift(feed);
    const items = parseItems(rssMarkup);
    items.forEach((item) => this.posts.unshift(createPost(item, feed.feedId)));
    document.dispatchEvent(new CustomEvent('newRSSReceived', { detail: { feeds: this.getFeeds(), posts: this.getPosts(), clickedLinks: this.getClickedLinks() } }));
  },

  /**
   * Сохраняет новый пост
   * @param {Post} post
   */
  addNewPost(post) {
    this.posts.unshift(post);
    document.dispatchEvent(new CustomEvent('newPostReceived', { detail: { post } }));
  },

  /**
   * Обновляет все RSS-каналы
   * @param {Array<Feed>} feeds
   */
  updateFeeds(feeds) {
    // eslint-disable-next-line array-callback-return
    feeds.map((feed) => {
      this.checkNewPosts(feed.url, feed.feedId);
    });
  },

  /**
   * Проверяет наличие новых постов в уже существующем RSS-канале
   * @param {string} url
   * @param {Feed["feedId"]} feedId
   * @returns {Promise}
   */
  checkNewPosts(url, feedId) {
    const existsPosts = app.getPosts().map((post) => ({ title: post.title, text: post.text }));
    return loadRSS(url)
      .then(
        (response) => getMarkupFromResponse(response),
      )
      .then(
        (rssMarkup) => {
          const newItems = parseItems(rssMarkup);
          newItems.forEach((item) => {
            const newPost = createPost(item, feedId);
            if (existsPosts.some((existsPost) => existsPost.text === newPost.text
            && existsPost.title === newPost.title)) return;
            this.addNewPost(newPost);
          });
        },
      )
      .catch((err) => {
        console.log(err);
      });
  },

  /**
   * Загружает RSS и извлекает разметку из ответа
   * @param {string} url
   * @returns {Promise}
   */
  requestRss(url) {
    return loadRSS(url)
      .then(
        (response) => getMarkupFromResponse(response),
      )
      .then(
        (rssMarkup) => {
          if (rssMarkup.querySelector('parsererror')) {
            document.dispatchEvent(new CustomEvent('invalidRSS'));
          } else {
            this.addNewRSS(rssMarkup, url);
          }
        },
      )
      .catch((err) => {
        console.log(err);
        if (err.message === 'Network Error') document.dispatchEvent(new CustomEvent('networkError'));
      });
  },

};

/**
 * Обрабатывает нажатие на кнопку просмотра поста
 * @param {Post["id"]} postId
 */
export function processViewButtonClick(postId) {
  app.addClickedLink(postId);
  const post = app.getPost(postId);
  document.dispatchEvent(new CustomEvent('postDataSends', { detail: { title: post.title, text: post.text, link: post.link } }));
}

/**
 * Обрабатывает нажатие на ссылку
 * @param {Post["id"]} postId
 */
export function processLinkClick(postId) {
  app.addClickedLink(postId);
}

/**
 * Проверяет новый URL и загружает, если он валиден
 * @param {string} newUrl
 */
export function processNewUrl(newUrl) {
  app.form.blockButton(true);
  validateUrl(newUrl, app.validationScheme).then(
    () => {
      app.form.setValidity(true, null);
      if (!checkDoubles(newUrl, app.feeds)) {
        app.requestRss(newUrl).then(() => app.form.blockButton(false));
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

/**
 * Инициализирует приложение
 */
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
          app.updateFeeds(app.getFeeds());
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
