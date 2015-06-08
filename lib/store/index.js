let co = require('co');
let fs = require('../utils/fs');
let lns = require('../lns');
let pathUtil = require('path');

let store = module.exports = {
  config: null,

  load: co.wrap(function*() {
    let result;
    try {
      result = yield fs.readFile(lns.config.get('storeConfig'));
      result = JSON.parse(result);
    } catch(e) {
      result = {};
    }

    result.paths = result.paths || [];

    store.config = result;
  }),

  verifyPath: co.wrap(function*(absPath) {
    let path = store.localToRel(absPath);

    store.config.paths.forEach(function(existing) {
      if (path.indexOf(existing) === 0) {
        throw new Error('File or directory already synced');
      } else if (existing.indexOf(path) === 0) {
        throw new Error('Already syncing sub file or directory');
      }
    });
  }),

  savePath: co.wrap(function*(absPath) {
    let config = store.config;

    var relativePath = store.localToRel(absPath);
    config.paths.push(relativePath);
    config.paths.sort();
    yield fs.writeFile(lns.config.get('storeConfig'), JSON.stringify(config), null, '  ');
  }),

  removePath: co.wrap(function*(localPath) {
    let config = store.config;
    var relativePath = store.localToRel(localPath);
    config.paths = config.paths.filter(p => p !== relativePath);
    yield fs.writeFile(lns.config.get('storeConfig'), JSON.stringify(config), null, '  ');
  }),

  externalToLocal: function(absPath) {
    var home = lns.config.get('_homedir');
    if (absPath.indexOf(home) === 0) {
      var relative = pathUtil.relative(home, absPath);
      return pathUtil.join(lns.config.get('store'), '~', relative);
    } else {
      var relative = pathUtil.relative(lns.config.get('_rootdir'), absPath);
      return pathUtil.join(lns.config.get('store'), relative);
    }
  },

  relToExternal: function(relPath) {
    if (relPath.indexOf('~') === 0) {
      return relPath.replace('~', lns.config.get('_homedir'));
    } else {
      return pathUtil.join(lns.config.get('_rootdir'), relPath);
    }
  },

  localToRel: function(absPath) {
    return pathUtil.relative(lns.config.get('store'), absPath);
  }
};
