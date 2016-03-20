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
  const syncedSource = store.closestSync(source);
  const sourceExists = await fs.exists(source);
  const hasLink = sourceExists && (await linkedTo(source, target));

  // Always support removing link.
  if (hasLink) {
    // Remove symlink
    await fs.rimraf(source);

    // Copy current version back.
    await fs.cpr(target, source);
  } else if (!syncedSource) {

    // Don't do anything at this point if file isn't mapped.
    log.warn('unmap', 'not mapped: ' + path);
    return;
  } else if (syncedSource !== source) {

    // Trying to unmap child of mapped folder.
    log.error('unmap', `can not unmap child of mapped folder ${syncedSource}`);
    return;
  }

  // Remove path from store
  await store.removePath(target);
}
