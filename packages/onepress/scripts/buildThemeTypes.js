const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');

// tsc
execa.commandSync(
  'tsc -p src/theme --outDir dist/theme/dts --declaration --emitDeclarationOnly'
);

// remove css import
const dtsPath = path.resolve(__dirname, '../dist/theme/dts');
const dtsThemePath = path.resolve(dtsPath, 'theme/index.d.ts');
const importStyleRE = /^import\s+('|").*\.(less|css)\1;?$/gm;
const dts = fs.readFileSync(dtsThemePath, 'utf-8');
fs.writeFileSync(dtsThemePath, dts.replace(importStyleRE, ''));

// rollup dts
execa.commandSync(
  'rollup -i dist/theme/dts/theme/index.d.ts -o dist/theme/index.d.ts -f es -p rollup-plugin-dts'
);

// remove dts dir
fs.removeSync(dtsPath);
