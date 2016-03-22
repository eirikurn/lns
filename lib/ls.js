const store = require('./store');
const printPaths = require('./utils/print-paths');
const linkedTo = require('./utils/linked-to');

module.exports = ls;
ls.usage = [
  'ls',
  'list all synced paths',
];

async function ls() {
  const { paths: storePaths } = store.config;
  const sourcePaths = storePaths.map(store.relToExternal);
  const targetPaths = storePaths.map(store.relToLocal);

  const paths = await Promise.all(sourcePaths.map(async (path, index) => {
    const linked = await linkedTo(path, targetPaths[index]);
    return { path, linked };
  }));

  printPaths(paths);
}
