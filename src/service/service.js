import axios from 'axios';

export default function getRss(url) {
  const parser = new DOMParser();
  return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
    .then((response) => response.data.contents)
    .then((contents) => parser.parseFromString(contents, 'application/xml'));
}

// 'https://www.finam.ru/analysis/conews/rsspoint/'
