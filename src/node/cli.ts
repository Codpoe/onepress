import { cac } from 'cac';
import chalk from 'chalk';
import { createServer } from './dev';
import { build } from './build';
import { serve } from './serve';

const cli = cac('onepress')
  .version(require('../../package.json').version)
  .help();

cli
  .command('dev [root]')
  .allowUnknownOptions()
  .action(async (root?: string, args?: any) => {
    try {
      const server = await createServer(root, args);
      await server.listen();
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
