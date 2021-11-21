import React from 'react';
import { Theme } from 'onepress/client';
import { Layout } from './components/Layout';
import { NotFound } from './components/NotFound';
import { mdxComponents } from './components/Mdx';

export * from './types';

const theme: Theme = {
  layoutElement: <Layout />,
  notFoundElement: <NotFound />,
  mdxComponents,
};

export default theme;
