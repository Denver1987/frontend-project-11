import { urlForm } from '../view/addView.js';

const urlInputModel = {
  isValid: true,
  setValidity(bool) {
    this.isValid = bool;
    urlForm.dispatchEvent(new CustomEvent('validitySetting', { detail: { isValid: this.isValid } }));
  },
};

export const appModel = {
  feeds: [],
  items: [],
  getFeed(rssMarkup) {
    const feedDesctiption = rssMarkup.querySelector('description').textContent;
    const feedTitle = rssMarkup.querySelector('title').textContent;
    return {
      description: feedDesctiption,
      title: feedTitle,
    };
  },
  addFeed(rssMarkup) {
    this.feeds.push(this.getFeed(rssMarkup));
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
      link: itemLink,
      title: itemTitle,
      text: itemDescription,
    };
  },
  addItems(rssMarkup) {
    const items = this.getItems(rssMarkup);
    console.log(items);
    items.forEach((item) => this.items.push(this.createItemData(item)));
  },
};

export default urlInputModel;
