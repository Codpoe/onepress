import React from 'react';
import { Page, Link } from 'onepress/client';
import { Mdx } from '../Mdx';
import { Footer } from '../Footer';
import { useThemeContext } from '../../context';

interface HomePageMeta {
  heroImage?: string;
  heroText?: React.ReactNode;
  tagline?: React.ReactNode;
  actions?: { text: React.ReactNode; link: string }[];
  features?: { title?: React.ReactNode; details?: React.ReactNode }[];
  footer?: React.ReactNode;
}

export const HomeLayout: React.FC = () => {
  const { currentPageData } = useThemeContext();
  const { heroImage, heroText, tagline, actions, features, footer } =
    (currentPageData?.meta || {}) as HomePageMeta;

  return (
    <div className="max-w-screen-lg mx-auto h-full flex flex-col px-4">
      <div className="flex-1 divide-y divide-c-divider">
        <header className="py-10 text-center">
          {heroImage &&
            (heroImage.includes('/') ? (
              <img
                src={heroImage}
                alt="hero"
                className="max-w-full w-auto max-h-48 mx-auto mb-6 md:mb-8"
              />
            ) : (
              <div className="mx-auto mb-6 text-[150px] leading-tight md:mb-8">
                {heroImage}
              </div>
            ))}
          {heroText && (
            <h1 className="my-2 text-center text-3xl font-semibold md:my-4 md:text-5xl">
              {heroText}
            </h1>
          )}
          {tagline && (
            <p className="my-2 text-center text-base text-c-text-lighter md:my-4 md:text-xl">
              {tagline}
            </p>
          )}
          {actions && (
            <div className="mt-6 flex justify-center space-x-4 md:space-x-6 md:mt-8">
              {actions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <button
                    className={`h-12 px-5 text-lg font-medium ${
                      index === 0 ? 'btn-primary' : 'btn-hollow'
                    }`}
                  >
                    {action.text}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </header>
        {features && (
          <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index}>
                {feature.title && (
                  <h2 className="mb-3 text-xl font-medium text-c-text">
                    {feature.title}
                  </h2>
                )}
                {feature.details && (
                  <p className="text-base text-c-text-light">
                    {feature.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <Mdx className="pt-10">
          <Page />
        </Mdx>
      </div>
      {footer && <Footer>{footer}</Footer>}
    </div>
  );
};
