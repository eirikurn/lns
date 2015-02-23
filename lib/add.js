let co = require('co');
let fs = require('./utils/fs');
let pathUtil = require('path');
let store = require('./store');

module.exports = co.wrap(add);
add.usage = 'lns add <path>';

function* add(args) {
  var path = args.shift();

  return yield add_(path);
}

function* add_(path) {
  // cancel if source doesn't exist.
  var source = pathUtil.resolve(path);
  var target = store.mapPath(source);

  // Make sure we're adding an actual file/directory
  if (!yield fs.exists(source)) {
    throw new Error('lns: ' + path + ': No such file or directory');
  }

  if (yield fs.exists(target)) {
    throw new Error('lns: ' + path + ': Already exists in store');
  }

  // Check if store already contains path
  yield store.verifyPath(target);

  // Make sure the parent directory exists in the store
  yield fs.mkdirp(pathUtil.dirname(target));

  // Move the source file/directory to the store
  yield fs.rename(source, target);

  // Create a symlink to the store
  yield fs.symlink(target, source);

  // Save path to store
  yield store.savePath(target);
}
