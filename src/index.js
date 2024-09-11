import './styles.scss';
import 'bootstrap';
import './view/formView.js';
import axios from 'axios';

axios.get('https://lorem-rss.hexlet.app/feed').then((r) => console.log(r));
