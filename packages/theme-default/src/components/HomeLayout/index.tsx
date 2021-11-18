import React from 'react';
import { Link } from 'react-router-dom';
import { Mdx } from '../Mdx';
import { Footer } from '../Footer';
import { useThemeContext } from '../../context';
import { Page } from '../Page';

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
        <header className="mt-8 mb-12 text-center <sm:mt-0">
          {heroImage &&
            (heroImage.includes('/') ? (
              <img
                src={heroImage}
                alt="hero"
                className="max-w-full max-h-64 mx-auto mb-6 <sm:(max-h-52 mb-5)"
              />
            ) : (
              <div className="mx-auto mb-6 text-[170px] leading-normal <sm:mb-5">
                {heroImage}
              </div>
            ))}
          {heroText && (
            <h1 className="my-7 text-center text-5xl font-semibold <sm:(text-3xl my-5)">
              {heroText}
            </h1>
          )}
          {tagline && (
            <p className="my-7 text-center text-2xl text-c-text-lighter <sm:(text-xl my-5)">
              {tagline}
            </p>
          )}
          {actions && (
            <div className="flex justify-center my-7 space-x-5 <sm:(my-5 space-x-4)">
              {actions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <button
                    className={`h-14 px-6 text-lg font-medium <sm:(h-12 px-6 text-base) ${
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
          <div className="grid grid-cols-3 gap-10 my-12 pt-10 border-t border-c-divider <sm:grid-cols-1">
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
