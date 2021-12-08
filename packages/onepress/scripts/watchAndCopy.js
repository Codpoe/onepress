const fs = require('fs-extra');
const chokidar = require('chokidar');
const { normalizePath } = require('vite');

function toDist(file) {
  return normalizePath(file).replace(/^src\//, 'dist/');
}

// copy non ts files, such as an html or css, to the dist directory whenever they change.
chokidar
  .watch('src/theme/**/!(*.ts|tsconfig.json)')
  .on('change', file => fs.copy(file, toDist(file)))
  .on('add', file => fs.copy(file, toDist(file)))
  .on('unlink', file => fs.remove(toDist(file)));
