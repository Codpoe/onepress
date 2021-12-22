import React, { useState } from 'react';

export default function Button() {
  const [count, setCount] = useState(0);
  return (
    <button
      className="h-8 px-5 text-rose-500 rounded-sm border border-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
      onClick={() => setCount(s => s + 1)}
    >
      Hello World {count}
    </button>
  );
}
