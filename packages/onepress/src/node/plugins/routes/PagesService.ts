import path from 'path';
import EventEmitter from 'events';
import chokidar, { FSWatcher } from 'chokidar';
import { readFileSync } from 'fs-extra';
import { normalizePath } from 'vite';
import { extractDocBlock, extractFrontMatter, slash } from '../../utils';
import { Page, ResolvedSrcConfig } from '../../types';

/**
 * - parse doc block for normal page
 * - parse front matter for markdown page
 */
export function resolvePageMeta(
  filePath: string,
  fileContent?: string
): Record<string, any> {
  fileContent ??= readFileSync(filePath, 'utf-8');

  // parse doc block for js file
  if (/\.(js|ts)x?$/.test(filePath)) {
    return extractDocBlock(fileContent);
  }

  // parse front matter for markdown
  if (/\.mdx?$/.test(filePath)) {
    return extractFrontMatter(fileContent);
  }

  return {};
}

function resolveRoutePath(baseRoutePath: string, relativeFilePath: string) {
  const ext = path.extname(relativeFilePath);

  const routePath = slash(relativeFilePath)
    .replace(new RegExp(`(\\.page|_layout)?${ext}$`), '') // remove ext and trail '.page', '_layout'
    .replace(/index$/, '') // remove 'index'
    .replace(/README$/i, '') // remove 'README'
    .replace(/\/$/, '') // remove trail slash
    .replace(/\[(.*?)\]/g, ':$1') // transform 'user/[id]' to 'user/:id'
    .replace(/404$/, '*'); // transform '/404' to '/*' so this route acts like a catch-all for URLs that we don't have explicit routes for

  return path.posix.join(baseRoutePath, routePath);
}

function isLayoutFile(filePath: string) {
  return path.basename(filePath).startsWith('_layout');
}

function is404File(filePath: string) {
  return path.basename(filePath).startsWith('404');
}

export class PagesService extends EventEmitter {
  private startPromise: Promise<void[]> | null = null;
  private watchers: FSWatcher[] = [];
  private pages: Record<string, Page> = {};

  constructor(private src: ResolvedSrcConfig) {
    super();
  }

  start() {
    if (this.startPromise) {
      return;
    }

    return (this.startPromise = Promise.all<void>(
      Object.entries(this.src).map(
        ([baseRoutePath, { dir, glob, ignored }]) =>
          new Promise((resolve, reject) => {
            let isReady = false;

            glob = [
              '**/_layout{.js,.jsx,.ts,.tsx,.md,.mdx}',
              ...(Array.isArray(glob) ? glob : [glob]),
            ];

            const watcher = chokidar
              .watch(glob, {
                cwd: dir,
                ignored,
              })
              .on('add', filePath => {
                this.addPage(baseRoutePath, dir, filePath, !isReady);
              })
              .on('unlink', filePath => {
                this.removePage(path.resolve(dir, filePath), !isReady);
              })
              .on('ready', () => {
                isReady = true;
                resolve();
              })
              .on('error', reject);

            this.watchers.push(watcher);
          })
      )
    ));
  }

  async close() {
    if (!this.startPromise) {
      throw new Error('PagesService is not started yet');
    }

    await Promise.all(this.watchers.map(w => w.close()));
    this.watchers = [];
    this.pages = {};
    this.startPromise = null;
  }

  async getPages() {
    if (!this.startPromise) {
      throw new Error('PagesService is not started yet');
    }

    await this.startPromise;
    return this.pages;
  }

  addPage(
    baseRoutePath: string,
    dir: string,
    filePath: string,
    silent = false
  ) {
    const routePath = resolveRoutePath(baseRoutePath, filePath);
    const absFilePath = path.resolve(dir, filePath);
    const meta = resolvePageMeta(absFilePath);

    const page: Page = {
      basePath: baseRoutePath,
      routePath,
      filePath: absFilePath,
      meta,
      isLayout: isLayoutFile(filePath),
      is404: is404File(filePath),
    };

    this.pages[normalizePath(absFilePath)] = page;

    if (!silent) {
      this.emit('add-page', page);
    }

    return page;
  }

  removePage(key: string, silent = false) {
    key = normalizePath(key);

    const page = this.pages[key];

    if (page) {
      delete this.pages[key];

      if (!silent) {
        this.emit('remove-page', page);
      }

      return page;
    }

    return null;
  }
}
