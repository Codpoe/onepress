import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';

const basename = import.meta.env.BASE_URL?.replace(/\/$/, '');

export function render(url: string) {
  return renderToString(
    <StaticRouter basename={basename} location={url}>
      <App />
    </StaticRouter>
  );
}

export { default as pagesData } from '/@onepress/pages-data';
