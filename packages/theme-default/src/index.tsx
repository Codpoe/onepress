import React from 'react';
import { Theme } from 'onepress/client';
import { Layout } from './components/Layout';
import { NotFound } from './components/NotFound';
import { Pending } from './components/Pending';
import { mdxComponents } from './components/Mdx';

export * from './types';

const theme: Theme = {
  layoutElement: <Layout />,
  notFoundElement: <NotFound />,
  pendingElement: <Pending />,
  pendingMs: 5000,
  pendingMinMs: 2000,
  linkPreloadMaxAge: 60000,
  mdxComponents,
};

export default theme;
