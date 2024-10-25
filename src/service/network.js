import axios from 'axios';

/**
 * Загружает RSS
 * @param {string} url
 * @returns {Promise<import('axios').AxiosResponse<any, any>>}
 */
export default function loadRSS(url) {
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
}
