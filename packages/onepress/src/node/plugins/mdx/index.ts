import { Plugin } from 'vite';
import reactMdx, { ReactMdxOptions } from 'vite-plugin-react-mdx';
import {
  DEMO_MODULE_ID_PREFIX,
  TS_INFO_MODULE_ID_PREFIX,
} from '../../constants';
import {
  demoMdxPlugin,
  extractDemoPath,
  getDemoModuleId,
  loadDemo,
} from './demo';
import {
  tsInfoMdxPlugin,
  loadTsInfo,
  extractTsInfoPathAndName,
  getTsInfoModuleId,
} from './tsInfo';

export function createMdxPlugin(options?: ReactMdxOptions): Plugin[] {
  const resolvedOptions: ReactMdxOptions = {
    ...options,
    remarkPlugins: [
      ...(options?.remarkPlugins || []),
      demoMdxPlugin,
      tsInfoMdxPlugin,
    ],
  };

  const demoFiles = new Set<string>();
  const tsInfoFileToModuleIdMap = new Map<string, string>();

  return [
    reactMdx(resolvedOptions),
    {
      name: `onepress:mdx`,
      enforce: 'pre',
      async resolveId(source, importer) {
        // resolve demo. fulfill demo file path
        if (source.startsWith(DEMO_MODULE_ID_PREFIX)) {
          const filePath = extractDemoPath(source);
          const resolved = await this.resolve(filePath, importer);

          if (!resolved || resolved.external) {
            throw new Error(
              `[onepress] Cannot resolve demo: '${filePath}'. importer: '${importer}'`
            );
          }

          demoFiles.add(resolved.id);

          return getDemoModuleId(resolved.id);
        }

        // resolve tsInfo. fulfill tsInfo file path
        if (source.startsWith(TS_INFO_MODULE_ID_PREFIX)) {
          const { filePath, exportName } = extractTsInfoPathAndName(source);
          const resolved = await this.resolve(filePath, importer);

          if (!resolved || resolved.external) {
            throw new Error(
              `[onepress] Cannot resolve ts info: '${filePath}'. importer: '${importer}'`
            );
          }

          const tsInfoModuleId = getTsInfoModuleId(resolved.id, exportName);

          tsInfoFileToModuleIdMap.set(resolved.id, tsInfoModuleId);

          return tsInfoModuleId;
        }
      },
      load(id) {
        if (id.startsWith(DEMO_MODULE_ID_PREFIX)) {
          return loadDemo(id);
        }

        if (id.startsWith(TS_INFO_MODULE_ID_PREFIX)) {
          return loadTsInfo(id);
        }
      },
      handleHotUpdate(ctx) {
        const modules = ctx.modules.slice();

        if (demoFiles.has(ctx.file)) {
          // update virtual demo module
          ctx.modules[0]?.importers.forEach(importer => {
            if (importer.id?.startsWith(DEMO_MODULE_ID_PREFIX)) {
              modules.push(importer);
            }
          });
        }

        if (tsInfoFileToModuleIdMap.has(ctx.file)) {
          const tsInfoModule = ctx.server.moduleGraph.getModuleById(
            tsInfoFileToModuleIdMap.get(ctx.file)!
          );

          if (tsInfoModule) {
            modules.push(tsInfoModule);
          }
        }

        // `handleHotUpdate` is hook first, so we return modules when it is changed
        if (modules.length !== ctx.modules.length) {
          return modules;
        }
      },
    },
  ];
}
