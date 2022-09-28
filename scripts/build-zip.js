/* eslint-disable @typescript-eslint/no-var-requires */
const admZip = require('adm-zip');
const path = require('path');
const fse = require('fs-extra');

const { join } = path;

let output = process.argv.slice(2)[0];
if (output === undefined || output.length === 0) {
  output = './';
}

// creating archives
const zip = new admZip();

// 删除 conf/migrations
fse.removeSync(path.join(__dirname, '../conf/migrations'));

zip.addLocalFile(join(__dirname, '../deploy/startup.bat'));

const distFiles = fse.readdirSync(path.join(__dirname, '../dist'));
const files = distFiles.filter((elm) => elm.match(/.*\.(node?)/gi));
files.forEach((file) => {
  zip.addLocalFile(join(__dirname, `../dist/${file}`), './dist/');
});

zip.addLocalFile(join(__dirname, '../dist/hmiserver.exe'), './dist/');

zip.addLocalFolder(join(__dirname, '../public/assets/'), './assets/');
zip.addLocalFolder(join(__dirname, '../conf/'), './conf');

const date = new Date().toISOString().replace('T', ' ').substring(0, 10);
const zipName = `HMIServer_dist_${date}.zip`;

fse.removeSync(zipName);
zip.writeZip(join(output, zipName));
