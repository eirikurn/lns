let co = require('co');
let fs = require('../utils/fs');
let pathUtil = require('path');

// TODO: Make less static
let LNS_CONFIG = {
  store: '/Users/eirikur/Google Drive/Sync',
  storeConfig: '/Users/eirikur/Google Drive/Sync/lns.json'
};

let store = module.exports = {
  config: co(function*() {
    let result;
    try {
      result = yield fs.readFile(LNS_CONFIG.storeConfig);
      result = JSON.parse(result);
    } catch(e) {
      result = {};
    }

    result.paths = result.paths || [];

    return result;
  }),

  verifyPath: co.wrap(function*(absPath) {
    let path = store._localPath(absPath);

    let config = yield store.config;
    config.paths.forEach(function(existing) {
      if (path.indexOf(existing) === 0) {
        throw new Error('File or directory already synced');
      } else if (existing.indexOf(path) === 0) {
        throw new Error('Already syncing sub file or directory');
      }
    });
  }),

  savePath: co.wrap(function*(absPath) {
    let config = yield store.config;

    var relativePath = store._localPath(absPath);
    config.paths.push(relativePath);
    config.paths.sort();
    yield fs.writeFile(LNS_CONFIG.storeConfig, JSON.stringify(config), null, "  ");
  }),

  mapPath: function(absPath) {
    var home = process.env['HOME'];
    if (absPath.indexOf(home) === 0) {
      var relative = pathUtil.relative(home, absPath);
      return pathUtil.join(LNS_CONFIG.store, '~', relative);
    } else {
      throw new Error('Do not support files outside HOME directory in this version');
    }
  },

  _localPath: function(absPath) {
    return pathUtil.relative(LNS_CONFIG.store, absPath);
  }
};
