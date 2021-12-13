import React from 'react';
import { Link } from 'onepress/client';
import { useThemeContext } from '../../context';
import { Nav } from '../Nav';
import { Search } from '../Search';
import { ThemeModeSwitch } from '../ThemeModeSwitch';
import { Menu as IconMenu } from '../Icons';

export const Header: React.FC = () => {
  const {
    logo,
    title,
    setSidebarOpen,
    homePath = '',
    hasSidebar,
  } = useThemeContext();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-c-bg border-b border-b-c-divider shadow-sm">
      <div className="w-full max-w-[1376px] h-full mx-auto px-4 flex items-center">
        {hasSidebar && (
          <div
            className="flex md:hidden items-center text-2xl py-2 pr-4 cursor-pointer"
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <IconMenu />
          </div>
        )}
        <Link className="flex items-center space-x-2" to={homePath}>
          {logo && <img className="h-8 min-w-[2rem]" src={logo} alt="logo" />}
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
        </Link>
        <div className="ml-auto flex items-center">
          <Nav />
          <div className="w-px h-6 mx-4 bg-c-divider hidden md:block"></div>
          <div className="space-x-2 md:space-x-4">
            <ThemeModeSwitch />
            <Search />
          </div>
        </div>
      </div>
    </header>
  );
};
