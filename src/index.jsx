// import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import 'regenerator-runtime';  // Enables utilisation of async/await
import { BrowserRouter } from 'react-router-dom';

import './main.scss';
import App from './components/App/App';
import Provider from './context/context';

const Index = () => (
  <BrowserRouter>
    <Provider>
      <App />
    </Provider>
  </BrowserRouter>
);

ReactDOM.render(<Index />, document.getElementById('root'));
