import { Plugin, ViteDevServer } from 'vite';
import { isEqual } from 'lodash';
import { PagesService, resolvePageMeta } from './PagesService';
import {
  generateRoutes,
  generateRoutesCode,
  generatePagesData,
} from './generate';
import { ROUTES_MODULE_ID, PAGES_DATA_MODULE_ID } from '../../constants';
import { Route, ResolvedSrcConfig } from '../../types';

export function createRoutesPlugin(options: {
  src: ResolvedSrcConfig;
}): Plugin {
  const { src } = options;
  let viteRoot: string;
  let viteServer: ViteDevServer;
  let pagesService: PagesService;
  let generatedRoutes: Route[] | null = null;

  return {
    name: `onepress:routes`,
    configResolved(config) {
      viteRoot = config.root;
    },
    configureServer(server) {
      viteServer = server;
    },
    buildStart() {
      const reloadRoutesModule = (isAdd: boolean) => {
        generatedRoutes = null;

        const routesModule =
          viteServer.moduleGraph.getModuleById(ROUTES_MODULE_ID);
        const pagesDataModule =
          viteServer.moduleGraph.getModuleById(PAGES_DATA_MODULE_ID);

        if (routesModule) {
          viteServer.moduleGraph.invalidateModule(routesModule);
        }

        if (pagesDataModule) {
          viteServer.moduleGraph.invalidateModule(pagesDataModule);
        }

        // if add page, trigger the change event of routes manually
        if (isAdd) {
          viteServer.watcher.emit('change', ROUTES_MODULE_ID);
          viteServer.watcher.emit('change', PAGES_DATA_MODULE_ID);
        }
      };

      pagesService = new PagesService(src);

      pagesService
        .on('add-page', () => reloadRoutesModule(true))
        .on('remove-page', () => reloadRoutesModule(false))
        .start();
    },
    async closeBundle() {
      await pagesService.close();
    },
    resolveId(id) {
      return [ROUTES_MODULE_ID, PAGES_DATA_MODULE_ID].some(x =>
        id.startsWith(x)
      )
        ? id
        : null;
    },
    async load(id, opts) {
      if (id === ROUTES_MODULE_ID) {
        const pages = await pagesService.getPages();

        if (!generatedRoutes) {
          generatedRoutes = generateRoutes(pages);
        }

        return generateRoutesCode(generatedRoutes, opts?.ssr);
      }

      if (id === PAGES_DATA_MODULE_ID) {
        const pages = await pagesService.getPages();
        return generatePagesData(pages, viteRoot);
      }
    },
    async handleHotUpdate(ctx) {
      const pagesDataModule =
        ctx.server.moduleGraph.getModuleById(PAGES_DATA_MODULE_ID);

      if (pagesDataModule) {
        const pages = await pagesService.getPages();
        const page = pages[ctx.file];

        // If meta changed, add pagesDataModule for hot update
        if (page) {
          const newMeta = resolvePageMeta(ctx.file, await ctx.read());

          if (!isEqual(page.meta, newMeta)) {
            page.meta = newMeta;
            return ctx.modules.concat(pagesDataModule);
          }
        }
      }
    },
  };
}
