import { defineConfig } from 'onepress';

export default defineConfig({
  theme: {
    locale: 'en',
    localeText: 'English',
    description: 'OnePress App',
    repo: 'codpoe/onepress',
    themeOptionsByPaths: {
      '/zh': {
        locale: 'zh',
        localeText: '中文',
        nav: [
          {
            text: '指南',
            link: '/zh/guide',
          },
        ],
        sidebar: [
          {
            text: '项目介绍',
            link: '/zh/guide',
          },
          {
            text: '快速上手',
            link: '/zh/guide/getting-started',
          },
          {
            text: '配置',
            link: '/zh/guide/config',
          },
        ],
      },
    },
  },
});
