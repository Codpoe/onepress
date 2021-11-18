/**
 * modify from vite-plugin-react-pages
 */
import type { Root } from 'mdast';
import { readFile } from 'fs-extra';
import { extract, parse, strip } from 'jest-docblock';
import { DEMO_MODULE_ID_PREFIX, MDX_DEMO_RE } from '../../constants';

export function getDemoModuleId(filePath: string) {
  return `${DEMO_MODULE_ID_PREFIX}${filePath}`;
}

export function extractDemoPath(id: string) {
  return id.slice(DEMO_MODULE_ID_PREFIX.length);
}

export function demoMdxPlugin() {
  return function demoTransformer(tree: Root) {
    const addImports: string[] = [];

    tree.children.forEach((child: any) => {
      if ((child.type as string) === 'jsx') {
        const [, src] = (child.value as string).match(MDX_DEMO_RE) || [];

        if (src) {
          const imported = `__demo_${addImports.length}`;
          addImports.push(
            `import * as ${imported} from '${getDemoModuleId(src)}';`
          );
          child.value = `<Demo src="${src}" {...${imported}}><${imported}.default /></Demo>`;
        }
      }
    });

    tree.children.unshift(
      ...addImports.map(importStr => {
        return {
          type: 'import',
          value: importStr,
        } as any;
      })
    );
  };
}

export async function loadDemo(id: string): Promise<string> {
  const filePath = extractDemoPath(id);

  const code = await readFile(filePath, 'utf-8');

  return `
export * from '${filePath}';
export { default } from '${filePath}';

export const code = ${JSON.stringify(strip(code))};
export const meta = ${JSON.stringify(parse(extract(code)))};
`;
}
