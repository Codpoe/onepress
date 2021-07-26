import { defineConfig } from 'onepress';

export default defineConfig({
  vite: {
    server: {
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
  },
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
          {
            text: '页面策略',
            link: '/zh/guide/page-strategy',
          },
          {
            text: '默认主题',
            link: '/zh/guide/default-theme',
          },
          {
            text: '使用主题',
            link: '/zh/guide/use-theme',
          },
        ],
      },
    },
  },
});
