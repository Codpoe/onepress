/**
 * https://github.com/vuejs/vitepress/blob/main/scripts/release.js
 */
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const execa = require('execa');
const { Listr } = require('listr2');

const currentVersion = require('../package.json').version;

const releaseTypeChoices = ['patch', 'minor', 'major']
  .map(type => {
    const v = semver.inc(currentVersion, type);
    return `${type} (${v})`;
  })
  .concat(['custom']);

async function main() {
  const tasks = new Listr([
    {
      title: 'Confirm release version',
      task: async (ctx, task) => {
        const releaseType = await task.prompt({
          type: 'Select',
          message: 'Select release type',
          choices: releaseTypeChoices,
        });

        let targetVersion;

        if (releaseType === 'custom') {
          targetVersion = await task.prompt({
            type: 'Input',
            message: 'Input custom version',
            initial: currentVersion,
          });
        } else {
          targetVersion = releaseType.match(/\((.*)\)/)[1];
        }

        if (!semver.valid(targetVersion)) {
          throw new Error(`Invalid target version: ${targetVersion}`);
        }

        const confirm = await task.prompt({
          type: 'Confirm',
          message: `Releasing v${targetVersion}. Confirm?`,
        });

        if (confirm) {
          ctx.targetVersion = targetVersion;
        } else {
          ctx.break = true;
        }
      },
    },
    {
      title: 'Update package version',
      enabled: ctx => !ctx.break,
      task: async ctx => {
        const pkgPath = path.resolve(__dirname, '../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        pkg.version = ctx.targetVersion;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      },
    },
    {
      title: 'Build package',
      enabled: ctx => !ctx.break,
      task: async () => {
        await execa('pnpm', ['build']);
      },
    },
    {
      title: 'Update changelog',
      enabled: ctx => !ctx.break,
      task: async (ctx, task) => {
        await execa('pnpm', ['changelog']);
        await execa('pnpm', ['prettier', '--write', 'CHANGELOG.md']);

        const good = await task.prompt({
          type: 'confirm',
          message: `Changelog updated. Does it look good?`,
        });
        if (!good) {
          ctx.break = true;
        }
      },
    },
    {
      title: 'Commit changes to the Git and create a tag',
      enabled: ctx => !ctx.break,
      task: async ctx => {
        await execa('git', ['add', 'CHANGELOG.md', 'package.json']);
        await execa('git', ['commit', '-m', `release: v${ctx.targetVersion}`]);
        await execa('git', ['tag', `v${ctx.targetVersion}`]);
      },
    },
    {
      title: 'Publish package',
      enabled: ctx => !ctx.break,
      task: async () => {
        await execa('pnpm', ['publish', '--ignore-scripts', '--no-git-checks']);
      },
    },
    {
      title: 'Push to GitHub',
      enabled: ctx => !ctx.break,
      task: async ctx => {
        await execa('git', [
          'push',
          'origin',
          `refs/tags/v${ctx.targetVersion}`,
        ]);
        await execa('git', ['push']);
      },
    },
  ]);

  tasks.run().catch(err => console.error(err));
}

main();

// async function main2() {
//   let targetVersion;

//   const { releaseType } = await prompt({
//     type: 'select',
//     name: 'releaseType',
//     message: 'Select release type',
//     choices: releaseTypeChoices,
//   });

//   if (releaseType === 'custom') {
//     targetVersion = (
//       await prompt({
//         type: 'input',
//         name: 'version',
//         message: 'Input custom version',
//         initial: currentVersion,
//       })
//     ).version;
//   } else {
//     targetVersion = releaseType.match(/\((.*)\)/)[1];
//   }

//   if (!semver.valid(targetVersion)) {
//     throw new Error(`Invalid target version: ${targetVersion}`);
//   }

//   const { confirm } = await prompt({
//     type: 'confirm',
//     name: 'confirm',
//     message: `Releasing v${targetVersion}. Confirm?`,
//   });

//   if (!confirm) {
//     return;
//   }

//   // Update the package version.
//   step('\nUpdating the package version...');
//   updatePackage(targetVersion);

//   // Build the package.
//   step('\nBuilding the package...');
//   await run('pnpm', ['build']);

//   // Generate the changelog.
//   step('\nGenerating the changelog...');
//   await run('pnpm', ['changelog']);
//   await run('pnpm', ['prettier', '--write', 'CHANGELOG.md']);

//   const { yes: changelogOk } = await prompt({
//     type: 'confirm',
//     name: 'yes',
//     message: `Changelog generated. Does it look good?`,
//   });

//   if (!changelogOk) {
//     return;
//   }

//   // Commit changes to the Git and create a tag.
//   step('\nCommitting changes...');
//   await run('git', ['add', 'CHANGELOG.md', 'package.json']);
//   await run('git', ['commit', '-m', `release: v${targetVersion}`]);
//   await run('git', ['tag', `v${targetVersion}`]);

//   // Publish the package.
//   step('\nPublishing the package...');
//   await run('pnpm', ['publish', '--ignore-scripts', '--no-git-checks']);

//   // Push to GitHub.
//   step('\nPushing to GitHub...');
//   await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
//   await run('git', ['push']);
// }

// function updatePackage(version) {
//   const pkgPath = path.resolve(path.resolve(__dirname, '..'), 'package.json');
//   const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

//   pkg.version = version;

//   fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
// }

// main().catch(err => console.error(err));
