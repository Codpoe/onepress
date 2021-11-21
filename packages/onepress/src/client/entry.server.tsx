import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, ReactLocation, Router } from 'react-location';
import { App } from './App';

const reactLocation = new ReactLocation({ history: createMemoryHistory() });

export function render(url: string) {
  // TODO: initialMatches for ssr
  return renderToString(<App location={reactLocation} initialMatches={[]} />);
}

export { default as pagesData } from '/@onepress/pages-data';
