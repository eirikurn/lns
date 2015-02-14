module.exports = {
  config: (function() {
    var result;
    try {
      result = fs.readFileSync(config.storeConfig);
      result = JSON.parse(result);
    } catch(e) {
      result = {};
    }

    result.paths = result.paths || [];

    return result;
  })(),

  verifyPath: function(absPath) {
    var path = store._localPath(absPath);

    store.config.paths.forEach(function(existing) {
      if (path.indexOf(existing) === 0) {
        throw new ExitWithMessage('File or directory already synced');
      } else if (existing.indexOf(path) === 0) {
        throw new ExitWithMessage('Already syncing sub file or directory');
      }
    });
  },

  savePath: function(absPath) {
    var relativePath = store._localPath(absPath);
    store.config.paths.push(relativePath);
    store.config.paths.sort();
    fs.writeFileSync(config.storeConfig, JSON.stringify(store.config), null, "  ");
  },

  mapPath: function(absPath) {
    var home = process.env['HOME'];
    if (absPath.indexOf(home) === 0) {
      var relative = pathUtil.relative(home, absPath);
      return pathUtil.join(config.store, '~', relative);
    } else {
      throw new ExitWithMessage('Do not support files outside HOME directory in this version');
    }
  },

  _localPath: function(absPath) {
    return pathUtil.relative(config.store, absPath);
  }
};