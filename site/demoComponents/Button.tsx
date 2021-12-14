import React from 'react';

export default function Button() {
  return (
    <button
      className="h-8 px-4 text-blue-500 rounded-md border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
      onClick={() => console.log('clicked')}
    >
      BUTTON
    </button>
  );
}
