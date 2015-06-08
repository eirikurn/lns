let co = require('co');
let fs = require('./utils/fs');
let linkedTo = require('./utils/linked-to');
let lns = require('./lns');
let log = require('npmlog');
let pathUtil = require('path');
let store = require('./store');

module.exports = co.wrap(unmap);
unmap.usage = 'lns unmap <path> [<path> ...]';

function* unmap(args) {
  if (args.length === 0) {
    throw new Error(unmap.usage);
  }

  let path;
  while (path = args.shift()) {
    yield unmap_(path);
  }
}

function* unmap_(path) {
  // cancel if source doesn't exist.
  var source = pathUtil.join(lns.config.get('_cwd'), path);
  var target = store.externalToLocal(source);
  var inStore = store.config.paths.indexOf(store.localToRel(target)) >= 0;
  let sourceExists = yield fs.exists(source);

  // Make sure we're unmapping an actual file/directory
  if (!sourceExists && !inStore) {
    log.warn('unmap', 'not mapped: ' + path);
    return;
  }

  if (sourceExists && (yield linkedTo(source, target))) {
    // Remove symlink
    yield fs.rimraf(source);

    // Copy current version back.
    yield fs.cpr(target, source);
  }

  // Remove path from store
  yield store.removePath(target);
}
