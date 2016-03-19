const fs = require('./utils/fs');
const linkedTo = require('./utils/linked-to');
const pathUtil = require('path');
const store = require('./store');

module.exports = update;
update.usage = [
  'update',
  'sets up configured links to the store',
];

async function update() {
  const paths = store.config.paths;
  let path;
  while ((path = paths.shift())) {
    await update_(path);
  }
}

async function update_(path) {
  const source = store.relToExternal(path);
  const target = store.externalToLocal(source);

  const sourceExists = await fs.exists(source);
  const parentExists = await fs.exists(pathUtil.dirname(source));
  const alreadyLinked = sourceExists && (await linkedTo(source, target));

  if (alreadyLinked) {
    // Exit early if path is already linked correctly.
    return;
  }

  if (sourceExists) {
    // Don't lose local changes.
    throw new Error('lns: ' + path + ': Path already exists locally');
  }

  if (!parentExists) {
    // Only create links if parent folder exists.
    return;
  }

  // Create new link.
  await fs.symlink(target, source);
}
