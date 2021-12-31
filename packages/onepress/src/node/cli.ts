import { fileURLToPath, URL } from 'url';
import { cac } from 'cac';
import chalk from 'chalk';
import fs from 'fs-extra';
import { createServer } from './dev.js';
import { build } from './build.js';
import { serve } from './serve.js';

const pkgPath = fileURLToPath(new URL('../../package.json', import.meta.url));
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const cli = cac('onepress').version(pkgJson.version).help();

cli
  .command('dev [root]')
  .allowUnknownOptions()
  .action(async (root?: string, args?: any) => {
    try {
      const server = await createServer(root, args);

      if (!server.httpServer) {
        throw new Error('HTTP server not available');
      }

      await server.listen();
      server.printUrls();
    } catch (err) {
      console.error(chalk.red(`failed to start server. error:\n`), err);
      process.exit(1);
    }
  });

cli
  .command('build [root]')
  .allowUnknownOptions()
  .action(async (root?: string, args?: any) => {
    try {
      await build(root, args);
    } catch (err) {
      console.error(chalk.red(`build error:\n`), err);
      process.exit(1);
    }
  });

cli
  .command('serve [root]')
  .option('--port, -p', 'specify port')
  .allowUnknownOptions()
  .action(async (root?: string, args?: any) => {
    try {
      await serve(root, args);
    } catch (err) {
      console.error(chalk.red(`failed to start server. error:\n`), err);
      process.exit(1);
    }
  });

cli.parse();
