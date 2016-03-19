const fs = require('../utils/fs');
const lns = require('../lns');
const pathUtil = require('path');

const store = module.exports = {
  config: null,

  async load() {
    let result;
    try {
      result = await fs.readFile(lns.config.get('storeConfig'));
      result = JSON.parse(result);
    } catch (e) {
      result = {};
    }

    result.paths = result.paths || [];

    store.config = result;
  },

  async verifyPath(absPath) {
    const path = store.localToRel(absPath);

    store.config.paths.forEach(existing => {
      if (path.indexOf(existing) === 0) {
        throw new Error('File or directory already synced');
      } else if (existing.indexOf(path) === 0) {
        throw new Error('Already syncing sub file or directory');
      }
    });
  },

  async savePath(absPath) {
    const config = store.config;

    const relativePath = store.localToRel(absPath);
    config.paths.push(relativePath);
    config.paths.sort();
    await fs.writeFile(lns.config.get('storeConfig'), JSON.stringify(config, null, '  '));
  },

  async removePath(localPath) {
    const config = store.config;
    const relativePath = store.localToRel(localPath);
    config.paths = config.paths.filter(p => p !== relativePath);
    await fs.writeFile(lns.config.get('storeConfig'), JSON.stringify(config, null, '  '));
  },

  externalToLocal(absPath) {
    const home = lns.config.get('_homedir');
    let localPath;
    if (absPath.indexOf(home) === 0) {
      localPath = pathUtil.join('~', pathUtil.relative(home, absPath));
    } else {
      localPath = pathUtil.relative(lns.config.get('_rootdir'), absPath);
    }

    return pathUtil.join(lns.config.get('store'), localPath);
  },

  relToExternal(relPath) {
    if (relPath.indexOf('~') === 0) {
      return relPath.replace('~', lns.config.get('_homedir'));
    }
    return pathUtil.join(lns.config.get('_rootdir'), relPath);
  },

  localToRel(absPath) {
    return pathUtil.relative(lns.config.get('store'), absPath);
  },
};
