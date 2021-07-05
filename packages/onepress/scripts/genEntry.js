const fs = require('fs-extra');
const path = require('path');

const distClient = path.resolve(__dirname, '../dist/client');
const root = path.resolve(__dirname, '..');

function genThemeEntry() {
  fs.copySync(distClient, root, {
    filter: src =>
      src === distClient || path.basename(src).startsWith('theme.'),
  });
}

module.exports.genThemeEntry = genThemeEntry;

if (require.main === module) {
  genThemeEntry();
}
