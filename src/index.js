import './styles.scss';
import 'bootstrap';

console.log('Hello, world');
const x = document.createElement('p');
x.textContent = '123321';
document.body.after(x);
