import React from 'react';
import { render, hydrate } from 'react-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';

const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter;
const basename = import.meta.env.BASE_URL?.replace(/\/$/, '');

(import.meta.env.SSR ? hydrate : render)(
  <Router basename={basename}>
    <App />
  </Router>,
  document.getElementById('app')
);
