import React from 'react';
import { useLocation } from 'onepress/client';
import { useThemeContext } from '../../context';
import { Link } from '../Link';
import { ChevronDown } from '../Icons';

export interface NavProps {
  className?: string;
}

export const Nav: React.FC<NavProps> = props => {
  const { className } = props;
  const { pathname } = useLocation();
  const { nav, currentLocale } = useThemeContext();

  if (!nav?.length) {
    return null;
  }

  return (
    <ul
      className={`${className} items-center text-[0.9rem] font-medium leading-normal space-x-6 hidden md:flex`}
    >
      {nav.map((item, index) => {
        if (item.items) {
          return (
            <li key={index} className="group relative">
              <div className="flex items-center cursor-pointer group">
                {item.text}
                <ChevronDown className="ml-1 text-c-text-lighter group-hover:rotate-180 transition-transform" />
              </div>
              <div className="absolute top-full right-0 pt-2 hidden group-hover:block">
                <ul className="min-w-[100px] p-1 bg-c-bg overflow-y-auto rounded-md border border-c-divider shadow-sm text-sm space-y-0.5">
                  {item.items.map((subItem, index) => (
                    <li key={index}>
                      <Link
                        {...subItem}
                        to={subItem.link}
                        color={false}
                        className={`relative flex items-center h-9 px-2.5 font-normal whitespace-nowrap
                        before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded before:opacity-10 before:pointer-events-none
                        ${
                          pathname.startsWith(subItem.link!) &&
                          (currentLocale
                            ? subItem.locale === currentLocale.locale
                            : true)
                            ? 'text-c-brand before:bg-c-brand'
                            : 'hover:before:bg-gray-400'
                        }`}
                      >
                        <span>{subItem.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        }

        return (
          <li key={index}>
            <Link
              {...item}
              to={item.link}
              color={false}
              className={`block border-b-2 -mb-0.5 transition-colors hover:border-c-brand ${
                pathname.startsWith(item.link!)
                  ? 'border-c-brand'
                  : 'border-transparent'
              }`}
            >
              {item.text}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
