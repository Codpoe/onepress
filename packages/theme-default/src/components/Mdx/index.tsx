import React from 'react';
import { Demo } from '../Demo';
import * as _mdxComponents from './mdxComponents';
import './style.less';

export const mdxComponents = Object.entries(_mdxComponents).reduce(
  (res, [name, component]) => {
    res[`${name[0].toLowerCase()}${name.slice(1)}`] = component;
    return res;
  },
  { Demo } as Record<string, React.ComponentType<any>>
);

export interface MdxProps {
  className?: string;
}

export const Mdx: React.FC<MdxProps> = ({ className = '', children }) => (
  <div className={`${className} markdown-body`}>{children}</div>
);
