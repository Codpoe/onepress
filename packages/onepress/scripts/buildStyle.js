const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const glob = require('fast-glob');

const srcPath = path.resolve(__dirname, '../src');
const distPath = path.resolve(__dirname, '../dist');
const themeIndexFilePath = path.resolve(
  distPath,
  'client/theme-default/index.js'
);

// compile windicss, generate `windi.css` file
execa.commandSync(
  'windicss src/client/theme-default/**/*.{ts,tsx} -t -b -f src/client/theme-default/windi.config.js -o dist/client/theme-default/windi.css',
  { cwd: path.resolve(__dirname, '..') }
);

// replace `virtual:windi.css` to `./windi.css`
if (themeIndexFilePath) {
  const content = fs.readFileSync(themeIndexFilePath, 'utf-8');
  fs.outputFileSync(
    themeIndexFilePath,
    content.replace('virtual:windi.css', './windi.css')
  );
}

// copy .css file
glob.sync('client/theme-default/**/*.css', { cwd: srcPath }).forEach(file => {
  fs.copy(path.resolve(srcPath, file), path.resolve(distPath, file));
});
