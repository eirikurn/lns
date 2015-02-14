let fs = require('./utils/fs');

module.exports = co.wrap(add);
add.usage = 'lns add <path>';

function* add(args) {
  var path = args.shift();

  return yield add_(path, cb);
}

function* add_(path, cb) {
  // cancel if source doesn't exist.
  var source = pathUtil.resolve(path);
  var target = store.mapPath(source);

  // Make sure we're adding an actual file/directory
  if (!yield fs.exists(source)) {
    throw new ExitWithMessage('lns: ' + path + ': No such file or directory');
  }

  // Check if store already contains path
  yield store.verifyPath(target);

  // Make sure the parent directory exists in the store
  yield fs.mkdirp(pathUtil.dirname(target));

  // Copy the source file/directory to the store
  yield fs.cpr(source, target);

  // Remove the source 
  yield fs.rimraf(source);

  // Create a symlink to the store
  yield fs.symlink(target, source);

  // Save path to store
  yield store.savePath(target);
}
