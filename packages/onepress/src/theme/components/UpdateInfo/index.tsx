import React from 'react';
import { usePageState } from 'onepress/client';
import { useThemeContext } from '../../context';
import { Link } from '../Link';

/**
 * Based on https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/theme-default/components/PageEdit.vue
 */
function createEditLink(
  docsRepo: string,
  docsBranch: string,
  docsDir: string,
  path = ''
) {
  docsRepo = docsRepo.replace(/\/$/, '');
  docsDir = docsDir.replace(/\/$/, '');
  path = `/${path}`;

  if (docsRepo.includes('bitbucket.org')) {
    return (
      docsRepo +
      `/src` +
      `/${docsBranch}` +
      `${docsDir ? '/' + docsDir : ''}` +
      path +
      `?mode=edit&spa=0&at=${docsBranch}&fileviewer=file-view-default`
    );
  }

  if (docsRepo.includes('gitlab.com')) {
    return (
      docsRepo +
      `/-/edit` +
      `/${docsBranch}` +
      (docsDir ? '/' + docsDir : '') +
      path
    );
  }

  docsRepo = /^[a-z]+:/i.test(docsRepo)
    ? docsRepo
    : `https://github.com/${docsRepo}`;

  return (
    docsRepo +
    '/edit' +
    `/${docsBranch}` +
    `${docsDir ? '/' + docsDir : ''}` +
    path
  );
}

export const UpdateInfo: React.FC = () => {
  const { loadedPathname } = usePageState();
  const {
    currentPageData,
    repo,
    docsRepo = repo,
    docsBranch = 'master',
    docsDir = '/',
    editLink = false,
    lastUpdated = false,
  } = useThemeContext();

  const editLinkText =
    typeof editLink === 'string' ? editLink : 'Edit this page';
  const lastUpdatedText =
    typeof lastUpdated === 'string' ? lastUpdated : 'Last updated';

  const finalEditLink =
    editLink && docsRepo
      ? createEditLink(
          docsRepo,
          docsBranch,
          docsDir,
          currentPageData?.filePathFromGitRoot
        )
      : '';

  const finalLastUpdated =
    lastUpdated && currentPageData?.meta.updatedTime
      ? new Date(currentPageData.meta.updatedTime).toLocaleString()
      : '';

  if (!loadedPathname || (!finalEditLink && !finalLastUpdated)) {
    return null;
  }

  return (
    <div className="flex <sm:flex-col <sm:space-y-2 sm:justify-between sm:items-center sm:space-x-8 py-4">
      {finalEditLink && (
        <Link
          className="font-medium text-c-text-light hover:text-c-brand transition-colors"
          to={finalEditLink}
          color={false}
        >
          {editLinkText}
        </Link>
      )}
      {finalLastUpdated && (
        <div>
          <span className="inline-block mr-1 font-medium text-c-text-light">
            {`${lastUpdatedText}:`}
          </span>
          <span className="inline-block text-c-text-lighter">
            {finalLastUpdated}
          </span>
        </div>
      )}
    </div>
  );
};
