import React, { useState } from 'react';
import { Code } from '../Mdx/mdxComponents';
import {
  Code as IconCode,
  Copy as IconCopy,
  Check as IconCheck,
} from '../Icons';
import { copyToClipboard } from '../../utils';

export interface DemoProps {
  code: string;
  meta?: Record<string, any>;
}

export const Demo: React.FC<DemoProps> = props => {
  const { children, code, meta } = props;
  const [showCode, setShowCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const finalCode = code.trim();

  const handleActionBarClick = (ev: React.SyntheticEvent) => {
    if (ev.target !== ev.currentTarget) {
      return;
    }
    setShowCode(prev => !prev);
  };

  const handleCopy = async () => {
    if (copySuccess) {
      return;
    }

    await copyToClipboard(finalCode);

    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 1000);
  };

  return (
    <div className="my-4 border border-c-divider rounded-md divide-y divide-c-divider overflow-hidden">
      <div className="px-5 py-5">{children}</div>
      <div
        className="flex items-center px-2 cursor-pointer"
        onClick={handleActionBarClick}
      >
        <button
          className={`btn-text h-8 px-3 ${showCode ? 'text-c-brand' : ''}`}
          onClick={() => setShowCode(prev => !prev)}
        >
          <IconCode />
        </button>
        <button
          className={`btn-text h-8 px-3 ${copySuccess ? 'text-c-brand' : ''}`}
          onClick={handleCopy}
        >
          {copySuccess ? <IconCheck /> : <IconCopy />}
        </button>
      </div>
      {showCode && <Code className="!my-0 !rounded-none">{finalCode}</Code>}
    </div>
  );
};
