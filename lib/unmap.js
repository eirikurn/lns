let fs = require('./utils/fs');
let linkedTo = require('./utils/linked-to');
let lns = require('./lns');
let log = require('npmlog');
let pathUtil = require('path');
let store = require('./store');

module.exports = unmap;
unmap.usage = 'lns unmap <path> [<path> ...]';

async function unmap(args) {
  if (args.length === 0) {
    throw new Error(unmap.usage);
  }

  let path;
  while (path = args.shift()) {
    await unmap_(path);
  }
}

async function unmap_(path) {
  // cancel if source doesn't exist.
  var source = pathUtil.join(lns.config.get('_cwd'), path);
  var target = store.externalToLocal(source);
  var inStore = store.config.paths.indexOf(store.localToRel(target)) >= 0;
  let sourceExists = await fs.exists(source);

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
