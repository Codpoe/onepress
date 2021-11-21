import React from 'react';
import { render, hydrate } from 'react-dom';
import {
  createBrowserHistory,
  createHashHistory,
  ReactLocation,
} from 'react-location';
import { App } from './App';

const reactLocation = new ReactLocation({
  history: __HASH_ROUTER__ ? createHashHistory() : createBrowserHistory(),
});

(import.meta.env.SSR ? hydrate : render)(
  <App location={reactLocation} />,
  document.getElementById('app')
);
