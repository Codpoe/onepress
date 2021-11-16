declare const __HASH_ROUTER__: boolean;

declare module 'virtual:windi.css';
declare module 'virtual:windi-base.css';
declare module 'virtual:windi-components.css';
declare module 'virtual:windi-utilities.css';

declare module 'virtual:icons/*' {
  import React, { SVGProps } from 'react';
  const component: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  export default component;
}

declare module '~icons/*' {
  import React, { SVGProps } from 'react';
  const component: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  export default component;
}
