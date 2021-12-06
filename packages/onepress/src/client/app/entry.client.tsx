import React from 'react';
import { render, hydrate } from 'react-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';

const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter;
const basename = import.meta.env.BASE_URL?.replace(/\/$/, '');

const element = (
  <Router basename={basename}>
    <App />
  </Router>
);

const container = document.getElementById('app');

// onepress build will inject global variable: `__OP_SSR_DATA__`
if (window.__OP_SSR_DATA__) {
  import(/* @vite-ignore */ window.__OP_SSR_DATA__.assetPath).then(mod => {
    window.__OP_SSR_DATA__!.pageModule = mod;
    hydrate(element, container);
  });
} else {
  render(element, container);
}
