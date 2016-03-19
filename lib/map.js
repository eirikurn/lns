const fs = require('./utils/fs');
const linkedTo = require('./utils/linked-to');
const lns = require('./lns');
const pathUtil = require('path');
const store = require('./store');

module.exports = map;
map.usage = 'lns map <path> [<path> ...]';

async function map(args) {
  if (args.length === 0) {
    throw new Error(map.usage);
  }

  let path;
  while ((path = args.shift())) {
    await map_(path);
  }
}

async function map_(path) {
  // cancel if source doesn't exist.
  const source = pathUtil.join(lns.config.get('_cwd'), path);
  const target = store.externalToLocal(source);

  // Make sure we're mapping an actual file/directory
  if (!(await fs.exists(source))) {
    throw new Error('lns: ' + path + ': No such file or directory');
  }

  if (await fs.exists(target)) {
    // Exit early if the file is already linked correctly.
    if (await linkedTo(source, target)) {
      return;
    }

    // Should support forcing, or allow user to pick local or store version.
    throw new Error('lns: ' + path + ': Already exists in store');
  }

  // Check if store already contains path
  await store.verifyPath(target);

  // Make sure the parent directory exists in the store
  await fs.mkdirp(pathUtil.dirname(target));

  // Move the source file/directory to the store
  await fs.rename(source, target);

  // Create a symlink to the store
  await fs.symlink(target, source);

  // Save path to store
  await store.savePath(target);
}
