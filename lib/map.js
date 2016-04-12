const fs = require('./utils/fs');
const linkedTo = require('./utils/linked-to');
const lns = require('./lns');
const error = require('./utils/error');
const pathUtil = require('path');
const store = require('./store');

module.exports = map;
map.usage = [
  'map',
  'link a file/folder to the store',
  {
    ours: {
      group: 'Conflict resolution',
      describe: 'overwrite store file(s)',
    },
    theirs: {
      group: 'Conflict resolution',
      describe: 'overwrite local file(s)',
    },
  },
];

async function map(args, options) {
  let path;
  while ((path = args.shift())) {
    await map_(path, options);
  }
}

async function map_(path, options) {
  // cancel if source doesn't exist.
  const source = pathUtil.join(lns.config.get('_cwd'), path);
  const target = store.externalToLocal(source);

  // Make sure we're mapping an actual file/directory
  if (!(await fs.exists(source))) {
    throw error(`lns: ${path}: No such file or directory`, true);
  }

  // Check if path is already mapped.
  if (await alreadySynced_(source, path)) return;

  // Check if subpaths are already mapped.
  if (store.findSyncedPaths(source).length) {
    throw error(`lns: ${path}: Has mapped subpaths. Unmap them first.`, true);
  }

  // Crude opt-in conflict resolution.
  const conflict = await fs.exists(target);
  if (conflict) {
    if (options.ours) {
      await fs.rimraf(target);
    } else if (options.theirs) {
      await fs.rimraf(source);
    } else {
      throw error(`lns: ${path}: Already exists in store. Review and specify --ours or --theirs.`, true);
    }
  }

  // Make sure the parent directory exists in the store
  await fs.mkdirp(pathUtil.dirname(target));

  if (!conflict || options.ours) {
    // Move the source file/directory to the store
    await fs.rename(source, target);
  }

  // Create a symlink to the store
  await fs.symlink(target, source);

  // Save path to store
  await store.savePath(target);
}

async function alreadySynced_(source, userPath) {
  const syncSource = store.closestSync(source);
  if (!syncSource) return false;
  const syncTarget = store.externalToLocal(syncSource);
  const isLinked = await linkedTo(syncSource, syncTarget);
  if (!isLinked) {
    throw error(`lns: ${userPath}: Already mapped but not linked. Run "lns update".`);
  }
  return true;
}
