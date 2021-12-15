import { Plugin } from 'vite';
import { createCompiler } from '@mdx-js/mdx';
import grayMatter from 'gray-matter';
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
import { MdxOptions } from '../../types';

export function createMdxPlugin(options?: MdxOptions): Plugin[] {
  const mdxCompiler = createCompiler({
    ...options,
    remarkPlugins: [
      ...(options?.remarkPlugins || []),
      demoMdxPlugin,
      tsInfoMdxPlugin,
    ],
  });

  const compileMdx = async (code: string, id: string) => {
    const { contents } = await mdxCompiler.process({
      contents: code,
      path: id,
    });

    return `/* @jsxRuntime classic */
/* @jsx mdx */
import * as React from 'react';
import { mdx } from '@mdx-js/react';
${contents}`;
  };

  let viteReactPlugin: Plugin | undefined;

  const demoFiles = new Set<string>();
  const tsInfoFileToModuleIdMap = new Map<string, string>();

  return [
    {
      name: 'onepress:mdx',
      configResolved(config) {
        viteReactPlugin = config.plugins.find(
          item => item.name === 'vite:react-babel'
        );
      },
      async transform(code, id, ssr) {
        if (/\.mdx?/.test(id)) {
          const { data: meta, content } = grayMatter(code);
          // TODO: parse slides
          code = await compileMdx(content, id);

          const result = await viteReactPlugin?.transform?.call(
            this,
            code,
            id + '?.jsx',
            ssr
          );
          let map: any;

          if (typeof result === 'string') {
            code = result;
          } else if (result?.code) {
            ({ code, map } = result);
          }

          // We should append meta export after vite-react's transform
          // so that vite-react can better identify it as a RefreshBoundary
          code = `${code}\nexport const meta = ${JSON.stringify(meta)};`;

          return {
            code,
            map,
          };
        }
      },
    },
    {
      name: `onepress:mdx-extends`,
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
