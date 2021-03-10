import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import 'regenerator-runtime';  // Enables utilisation of async/await

const Index = () => <App />

ReactDOM.render(<Index />, document.getElementById('root'));
