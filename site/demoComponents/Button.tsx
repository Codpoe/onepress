import React, { useState } from 'react';

export default function Button() {
  const [count, setCount] = useState(1);
  return (
    <button
      className="h-8 px-4 text-green-500 rounded-md border border-green-500 hover:bg-green-500 hover:text-white transition-colors"
      onClick={() => setCount(s => s + 1)}
    >
      {count}
    </button>
  );
}
