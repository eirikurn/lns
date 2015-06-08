let co = require('co');
let fs = require('./utils/fs');
let linkedTo = require('./utils/linked-to');
let lns = require('./lns');
let pathUtil = require('path');
let store = require('./store');

module.exports = co.wrap(map);
map.usage = 'lns map <path> [<path> ...]';

function* map(args) {
  if (args.length === 0) {
    throw new Error(map.usage);
  }

  let path;
  while (path = args.shift()) {
    yield map_(path);
  }
}

function* map_(path) {
  // cancel if source doesn't exist.
  var source = pathUtil.join(lns.config.get('_cwd'), path);
  var target = store.externalToLocal(source);

  // Make sure we're mapping an actual file/directory
  if (!(yield fs.exists(source))) {
    throw new Error('lns: ' + path + ': No such file or directory');
  }

  if (yield fs.exists(target)) {
    // Exit early if the file is already linked correctly.
    if (yield linkedTo(source, target)) {
      return;
    }

    // Should support forcing, or allow user to pick local or store version.
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
