import { defineConfig } from 'onepress';
import { ThemeConfig } from 'onepress/theme';

export default defineConfig<ThemeConfig>({
  vite: {
    server: {
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
  },
  tailwind: {
    content: ['demoComponents/**/*.tsx'],
  },
  themeConfig: {
    locale: 'en',
    localeText: 'English',
    description: 'OnePress App',
    repo: 'codpoe/onepress',
    editLink: true,
    themeConfigByPaths: {
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
            text: '路由规则',
            link: '/zh/guide/routes',
          },
          {
            text: '默认主题',
            link: '/zh/guide/default-theme',
          },
          {
            text: '自定义主题',
            link: '/zh/guide/custom-theme',
          },
          {
            text: '使用 Demo 组件进行演示',
            link: '/zh/guide/demo',
          },
        ],
      },
    },
  },
});
