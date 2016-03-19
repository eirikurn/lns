let fs = require('./utils/fs');
let linkedTo = require('./utils/linked-to');
let lns = require('./lns');
let pathUtil = require('path');
let store = require('./store');

module.exports = update;
update.usage = 'lns update';

async function update(args) {
  let path, paths = store.config.paths;
  while (path = paths.shift()) {
    await update_(path);
  }
}

async function update_(path) {
  let source = store.relToExternal(path);
  let target = store.externalToLocal(source);

  let sourceExists = await fs.exists(source);
  let parentExists = await fs.exists(pathUtil.dirname(source));
  let alreadyLinked = sourceExists && (await linkedTo(source, target));

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
