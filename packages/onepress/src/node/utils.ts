import path from 'path';
import os from 'os';
import execa from 'execa';
import fs from 'fs-extra';
import {
  extractStaticData as reactPagesExtractStaticData,
  File,
} from 'vite-plugin-react-pages';
import { parse, extract } from 'jest-docblock';
import grayMatter from 'gray-matter';
import { parseSlides } from './parseSlides';
import { GitContributor } from '.';

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export function ensureLeadingSlash(p: string) {
  // ensure start slash
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  return p;
}

export function removeLeadingSlash(p: string) {
  return p.replace(/^\//, '');
}

export function removeTrailingSlash(p: string) {
  if (p !== '/') {
    p = p.replace(/\/$/, '');
  }
  return p;
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

export function extractDocBlock(fileContent: string) {
  return parse(extract(fileContent));
}

export async function extractFrontMatter(fileContent: string) {
  const { data: frontMatter, content } = grayMatter(fileContent);

  if (frontMatter.title === undefined) {
    frontMatter.title = extractMarkdownTitle(content);
  }

  if (frontMatter.slide) {
    frontMatter.slideCount = parseSlides(content).length;
  }

  return frontMatter;
}

export function extractMarkdownTitle(content: string) {
  const match = content.match(/^#\s+(.*)$/m);
  return match?.[1];
}

let isGitRepo: boolean;

export function checkGitRepo(cwd = process.cwd()): boolean {
  if (typeof isGitRepo === 'undefined') {
    try {
      execa.commandSync('git log', { cwd });
      isGitRepo = true;
    } catch {
      isGitRepo = false;
    }
  }

  return isGitRepo;
}

let gitRoot: string;

export function getGitRoot(filePath: string) {
  if (!checkGitRepo()) {
    return '';
  }

  if (!gitRoot) {
    const { stdout } = execa.sync('git', ['rev-parse', '--show-toplevel'], {
      cwd: fs.statSync(filePath).isDirectory()
        ? filePath
        : path.dirname(filePath),
    });
    gitRoot = stdout;
  }

  return gitRoot;
}

export async function getGitCreatedTime(filePath: string) {
  if (!checkGitRepo()) {
    return undefined;
  }

  const { stdout } = await execa('git', [
    '--no-pager',
    'log',
    '--diff-filter=A',
    '--format=%at',
    filePath,
  ]);

  return stdout ? Number.parseInt(stdout) * 1000 : undefined;
}

export async function getGitUpdatedTime(filePath: string) {
  if (!checkGitRepo()) {
    return undefined;
  }

  const { stdout } = await execa('git', [
    '--no-pager',
    'log',
    '-1',
    '--format=%at',
    filePath,
  ]);

  return stdout ? Number.parseInt(stdout) * 1000 : undefined;
}

export async function getGitContributors(
  filePath: string
): Promise<GitContributor[]> {
  if (!checkGitRepo()) {
    return [];
  }

  // FIXME: cause error
  try {
    const { stdout } = await execa('git', [
      '--no-pager',
      'shortlog',
      '-nes',
      '--',
      filePath,
    ]);

    return stdout
      .split('\n')
      .map(item => item.trim().match(/^(\d+)\t(.*) <(.*)>$/))
      .filter((item): item is RegExpMatchArray => item !== null)
      .map(([, commits, name, email]) => ({
        name,
        email,
        commits: Number.parseInt(commits),
      }));
  } catch (e) {
    return [];
  }
}
