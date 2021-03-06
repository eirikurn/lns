const fs = require('./utils/fs');
const linkedTo = require('./utils/linked-to');
const pathUtil = require('path');
const store = require('./store');
const printPaths = require('./utils/print-paths');

module.exports = update;
update.usage = [
  'update',
  'sets up configured links to the store',
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

async function update(args, options = {}) {
  const paths = store.config.paths;
  const linked = [];
  let path;
  while ((path = paths.shift())) {
    const result = await update_(path, options);
    if (result) linked.push(result);
  }

  printPaths(linked);
}

async function update_(path, options) {
  const source = store.relToExternal(path);
  const target = store.externalToLocal(source);

  const sourceExists = await fs.exists(source);
  const parentExists = await fs.exists(pathUtil.dirname(source));
  const alreadyLinked = sourceExists && (await linkedTo(source, target));

  if (alreadyLinked) {
    // Exit early if path is already linked correctly.
    return null;
  }

  if (!parentExists) {
    // Only create links if parent folder exists.
    return null;
  }

  if (sourceExists) {
    if (options.ours) {
      // Move our file/directory to the store
      await fs.rimraf(target);
      await fs.rename(source, target);
    } else if (options.theirs) {
      // Delete local files.
      await fs.rimraf(source);
    } else {
      // Don't lose local changes.
      throw new Error(`lns: ${path}: Path already exists locally. Review and specify --ours or --theirs.`);
    }
  }

  // Create new link.
  await fs.symlink(target, source);

  return { path: source, linked: true };
}
