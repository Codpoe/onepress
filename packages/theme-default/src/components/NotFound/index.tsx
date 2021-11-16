import React from 'react';

export const NotFound: React.FC = () => {
  return (
    <div className="h-full flex justify-center items-center font-semibold">
      <h1 className="pr-6 border-r border-c-divider text-3xl">404</h1>
      <p className="pl-6 text-base">Page Not Found</p>
    </div>
  );
};
