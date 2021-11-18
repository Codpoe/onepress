/**
 * Based on @docusaurus/theme-search-algolia
 */
import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'onepress/client';
import { useDocSearchKeyboardEvents } from '@docsearch/react';
import { IN_BROWSER } from '../../constants';
import { Search as IconSearch } from '../Icons';
import { useThemeContext } from '../../context';
import { removeTailSlash } from '../../utils';

let DocSearchModal: React.ComponentType<any> | null = null;

async function ensureDocSearchModal() {
  if (DocSearchModal) {
    return;
  }

  [{ DocSearchModal }] = await Promise.all([
    // @ts-ignore
    import('@docsearch/react/modal'),
    import('@docsearch/css/dist/style.css'),
  ]);
}

const Hit: React.FC<{ hit: any }> = ({ hit, children }) => {
  return <Link to={hit.url}>{children}</Link>;
};

export const Search: React.FC = () => {
  const routerNavigate = useNavigate();
  const { algolia } = useThemeContext();
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(async () => {
    await ensureDocSearchModal();
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const transformItems = useCallback((items: any[]) => {
    return items.map(item => {
      const { pathname, hash } = new URL(item.url);
      return {
        ...item,
        url: `${removeTailSlash(import.meta.env.BASE_URL)}${pathname}${hash}`,
      };
    });
  }, []);

  const navigator = useRef({
    navigate({ suggestionUrl }: any) {
      routerNavigate(suggestionUrl);
    },
  }).current;

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen,
    onClose,
  });

  if (!algolia?.apiKey || !algolia?.indexName) {
    return null;
  }

  return (
    <>
      <Helmet>
        {/* This hints the browser that the website will load data from Algolia,
        and allows it to preconnect to the DocSearch cluster. It makes the first
        query faster, especially on mobile. */}
        <link
          rel="preconnect"
          href={`https://${algolia?.appId || 'BH4D9OD16A'}-dsn.algolia.net`}
          crossOrigin=""
        />
      </Helmet>

      <button
        ref={searchButtonRef}
        className="<md:btn-text md:btn transition-none w-9 h-9 text-xl text-gray-700 dark:text-gray-200"
        aria-label="Search"
        onMouseOver={ensureDocSearchModal}
        onTouchStart={ensureDocSearchModal}
        onFocus={ensureDocSearchModal}
        onClick={onOpen}
      >
        <IconSearch />
      </button>

      {IN_BROWSER &&
        isOpen &&
        DocSearchModal &&
        createPortal(
          // TODO: filter language
          <DocSearchModal
            initialScrollY={window.scrollY}
            transformItems={transformItems}
            hitComponent={Hit}
            navigator={navigator}
            onClose={onClose}
            {...algolia}
          />,
          document.body
        )}
    </>
  );
};
