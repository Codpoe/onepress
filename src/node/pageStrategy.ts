import execa from 'execa';
import {
  extractStaticData,
  PageStrategy,
  FileHandler,
  File,
} from 'vite-plugin-react-pages';
import { FindPages } from 'vite-plugin-react-pages/dist/node/dynamic-modules/PageStrategy';
import { GitContributor } from './types';

export function getPagePublicPath(relativePageFilePath: string) {
  let pagePublicPath = relativePageFilePath.replace(
    /\$?\.(md|mdx|js|jsx|ts|tsx)$/,
    ''
  );

  pagePublicPath = pagePublicPath.replace(/index$/, '');
  pagePublicPath = pagePublicPath.replace(/README$/i, '');
  // ensure starting slash
  pagePublicPath = pagePublicPath.replace(/\/$/, '');
  pagePublicPath = `/${pagePublicPath}`;

  // turn [id] into :id
  // so that react-router can recognize it as url params
  pagePublicPath = pagePublicPath.replace(
    /\[(.*?)\]/g,
    (_, paramName) => `:${paramName}`
  );

  return pagePublicPath;
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

export async function getGitCreatedTime(file: File) {
  const { stdout } = await execa(
    'git',
    ['--no-pager', 'log', '--diff-filter=A', '--format=%at', file.relative],
    {
      cwd: file.base,
    }
  );

  return stdout ? Number.parseInt(stdout) * 1000 : undefined;
}

export async function getGitUpdatedTime(file: File) {
  const { stdout } = await execa(
    'git',
    ['--no-pager', 'log', '-1', '--format=%at', file.relative],
    {
      cwd: file.base,
    }
  );

  return stdout ? Number.parseInt(stdout) * 1000 : undefined;
}

export async function getGitContributors(
  file: File
): Promise<GitContributor[]> {
  // FIXME: cause error
  try {
    const { stdout } = await execa(
      'git',
      ['--no-pager', 'shortlog', '-nes', '--', file.relative],
      {
        cwd: file.path,
      }
    );

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

export const defaultFileHandler: FileHandler = async (file, api) => {
  const pageId = getPagePublicPath(file.relative);
  const staticData = await extractStaticData(file);

  staticData.filePath = staticData.filePath ?? file.relative;

  // inject git info
  if (staticData.sourceType === 'md' && checkGitRepo(file.base)) {
    staticData.createdTime =
      staticData.createdTime || (await getGitCreatedTime(file));
    staticData.updatedTime =
      staticData.updatedTime || (await getGitUpdatedTime(file));
    staticData.contributors =
      staticData.contributors || (await getGitContributors(file));
  }

  // if blog, add additional page
  if (staticData.blog) {
    api.addPageData({
      pageId: (pageId === '/' ? pageId : pageId + '/') + ':page',
      staticData,
      dataPath: file.path,
    });
  }

  return {
    pageId,
    staticData,
    dataPath: file.path,
  };
};

export class PressPageStrategy extends PageStrategy {
  constructor(
    opts: { extraFindPages?: FindPages; fileHandler?: FileHandler } = {}
  ) {
    const { extraFindPages, fileHandler = defaultFileHandler } = opts;

    super(pagesDir => {
      const helpers = this.createHelpers(fileHandler);
      helpers.watchFiles(
        pagesDir,
        '**/*{.md,.mdx,$.md,$.mdx,$.js,$.jsx,$.ts,$.tsx}'
      );
      if (typeof extraFindPages === 'function') {
        extraFindPages(pagesDir, helpers);
      }
    });
  }
}
