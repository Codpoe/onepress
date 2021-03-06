import React from 'react';
import { MDXProvider, MDXProviderProps } from '@mdx-js/react';
import { Demo } from '../Demo';
import * as mdxComponents from './mdxComponents';
import './style.less';

const _mdxComponents = Object.keys(mdxComponents).reduce(
  (res, name) => {
    // @ts-ignore
    res[`${name[0].toLowerCase()}${name.slice(1)}`] = mdxComponents[name];
    return res;
  },
  { Demo } as MDXProviderProps['components']
);

export interface MdxProps {
  className?: string;
}

export const Mdx: React.FC<MdxProps> = ({ className = '', children }) => (
  <MDXProvider components={_mdxComponents}>
    <div className={`${className} markdown-body`}>{children}</div>
  </MDXProvider>
);
