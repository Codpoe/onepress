import path from 'path';
import os from 'os';
import {
  extractStaticData as reactPagesExtractStaticData,
  File,
} from 'vite-plugin-react-pages';
import grayMatter from 'gray-matter';
import { parseSlides } from './parseSlides';

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export function removeLeadingSlash(p: string) {
  return p.replace(/^\//, '');
}

export const isWindows = os.platform() === 'win32';

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export function cleanPath(id: string): string {
  return id.replace(/(\?|#).*/, '');
}

export function trapConsole() {
  const consoleLog = global.console.log;
  global.console.log = (() => {
    // ...
  }) as any;

  return () => {
    global.console.log = consoleLog;
  };
}

export async function extractStaticData(file: File) {
  if (/mdx$/.test(file.extname)) {
    const { data: frontMatter, content } = grayMatter(await file.read());
    const staticData: any = {
      ...frontMatter,
      sourceType: 'md',
      filePath: file.relative,
    };

    if (staticData.title === undefined) {
      staticData.title = extractMarkdownTitle(content);
    }

    if (staticData.slide) {
      staticData.slideCount = parseSlides(content).length;
    }

    return staticData;
  }

  return reactPagesExtractStaticData(file);
}

export function extractMarkdownTitle(content: string) {
  const match = content.match(/^#\s+(.*)$/m);
  return match?.[1];
}
