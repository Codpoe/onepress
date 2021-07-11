import React, { useState } from 'react';
import { Code } from '../Mdx/mdxComponents';
import {
  Code as IconCode,
  Copy as IconCopy,
  Check as IconCheck,
} from '../Icons';
import { copyToClipboard } from '../../utils';

export interface DemoProps {
  default: React.ComponentType<any>;
  demoMeta: {
    [key: string]: any;
    code: string;
    title?: string;
    desc?: string;
  };
}

export const Demo: React.FC<DemoProps> = props => {
  const { default: DemoComponent, demoMeta } = props;
  const [showCode, setShowCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const code = demoMeta.code.trim();

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

    await copyToClipboard(code);

    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 1000);
  };

  return (
    <div className="border border-c-divider rounded-md divide-y divide-c-divider overflow-hidden">
      <div className="px-5 py-5">
        <DemoComponent />
      </div>
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
      {showCode && <Code className="!my-0 !rounded-none">{code}</Code>}
    </div>
  );
};
