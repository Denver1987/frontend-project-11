import axios from 'axios';

export function loadRSS(url) {
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
}
