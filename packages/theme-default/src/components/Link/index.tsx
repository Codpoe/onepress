import React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'onepress/client';
import { ExternalLink } from '../Icons';

export interface LinkProps extends Omit<RouterLinkProps, 'to' | 'color'> {
  to?: string;
  icon?: boolean;
  color?: boolean;
}

export const Link: React.FC<LinkProps> = props => {
  const {
    to = '',
    children,
    className = '',
    icon = true,
    color = true,
    getActiveProps,
    ...restProps
  } = props;
  const isSameOrigin = to.startsWith('/');
  const isHash = to.startsWith('#');

  const finalClassName = `${className} ${
    color ? 'text-c-brand hover:text-c-brand-light transition-colors' : ''
  } inline-flex items-center`;

  const finalChildren = (
    <>
      {children}
      {icon && !isSameOrigin && !isHash && (
        <ExternalLink className="text-c-text-lightest" />
      )}
    </>
  );

  return isSameOrigin ? (
    <RouterLink
      {...restProps}
      className={finalClassName}
      to={to}
      getActiveProps={getActiveProps}
    >
      {finalChildren}
    </RouterLink>
  ) : (
    <a
      {...restProps}
      className={finalClassName}
      href={to}
      {...(!isHash && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
    >
      {finalChildren}
    </a>
  );
};
