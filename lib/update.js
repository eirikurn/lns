let co = require('co');
let fs = require('./utils/fs');
let linkedTo = require('./utils/linked-to');
let lns = require('./lns');
let pathUtil = require('path');
let store = require('./store');

module.exports = co.wrap(update);
update.usage = 'lns update';

function* update(args) {
  let path, paths = store.config.paths;
  while (path = paths.shift()) {
    yield update_(path);
  }
}

function* update_(path) {
  let source = store.relToExternal(path);
  let target = store.externalToLocal(source);

  let sourceExists = yield fs.exists(source);
  let parentExists = yield fs.exists(pathUtil.dirname(source));
  let alreadyLinked = sourceExists && (yield linkedTo(source, target));

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
  yield fs.symlink(target, source);
}
