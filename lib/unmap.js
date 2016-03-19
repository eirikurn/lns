const fs = require('./utils/fs');
const linkedTo = require('./utils/linked-to');
const lns = require('./lns');
const log = require('npmlog');
const pathUtil = require('path');
const store = require('./store');

module.exports = unmap;
unmap.usage = [
  'unmap',
  'removes link to the store',
];

async function unmap(args) {
  let path;
  while ((path = args.shift())) {
    await unmap_(path);
  }
}

async function unmap_(path) {
  // cancel if source doesn't exist.
  const source = pathUtil.join(lns.config.get('_cwd'), path);
  const target = store.externalToLocal(source);
  const inStore = store.config.paths.indexOf(store.localToRel(target)) >= 0;
  const sourceExists = await fs.exists(source);

  // Make sure we're unmapping an actual file/directory
  if (!sourceExists && !inStore) {
    log.warn('unmap', 'not mapped: ' + path);
    return;
  }

  if (sourceExists && (await linkedTo(source, target))) {
    // Remove symlink
    await fs.rimraf(source);

    // Copy current version back.
    await fs.cpr(target, source);
  }

  // Remove path from store
  await store.removePath(target);
}
