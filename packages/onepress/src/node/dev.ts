import { createServer as createViteServer, ServerOptions } from 'vite';
import { resolveConfig } from './config';
import { createOnePressPlugin } from './plugins';

export function createServer(
  root = process.cwd(),
  serverOptions: ServerOptions = {}
) {
  const siteConfig = resolveConfig(root);

  return createViteServer({
    root,
    base: siteConfig.base,
    server: serverOptions,
    plugins: createOnePressPlugin(siteConfig, false),
  });
}
