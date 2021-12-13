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
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <header className="mb-12 text-center mt-0 sm:mt-8">
          {heroImage &&
            (heroImage.includes('/') ? (
              <img
                src={heroImage}
                alt="hero"
                className="max-w-full max-h-52 mx-auto mb-5 sm:max-h-64 sm:mb-6"
              />
            ) : (
              <div className="mx-auto mb-5 text-[170px] leading-normal sm:mb-6">
                {heroImage}
              </div>
            ))}
          {heroText && (
            <h1 className="my-5 text-center text-3xl font-semibold sm:my-7 sm:text-5xl">
              {heroText}
            </h1>
          )}
          {tagline && (
            <p className="my-5 text-center text-xl text-c-text-lighter sm:my-7 sm:text-2xl">
              {tagline}
            </p>
          )}
          {actions && (
            <div className="flex justify-center my-5 space-x-4 sm:my-7 sm:space-x-5">
              {actions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <button
                    className={`h-12 px-6 text-base font-medium sm:h-14 sm:text-lg ${
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
          <div className="grid grid-cols-1 gap-10 my-12 pt-10 border-t border-c-divider sm:grid-cols-3">
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
        <Mdx>
          <Page />
        </Mdx>
      </div>
      {footer && <Footer>{footer}</Footer>}
    </div>
  );
};
