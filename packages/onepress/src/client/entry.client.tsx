import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';

const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter;
const basename = __HASH_ROUTER__
  ? undefined
  : import.meta.env.BASE_URL?.replace(/\/$/, '');

render(
  <Router basename={basename}>
    <App />
  </Router>,
  document.getElementById('app')
);
