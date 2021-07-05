import { defineConfig } from 'onepress';

export default defineConfig({
  theme: {
    description: 'OnePress App',
    repo: 'codpoe/onepress',
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
});
