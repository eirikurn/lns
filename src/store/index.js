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

  closestSync(absPath) {
    const path = store.externalToRel(absPath);

    const syncPath = store.config.paths.reduce((found, syncPath) => {
      if (found) return found;
      return path.indexOf(syncPath) === 0 ? syncPath : found;
    }, false);
    return syncPath && store.relToExternal(syncPath);
  },

  findSyncedPaths(absPrefix) {
    const path = store.externalToRel(absPrefix);

    return store.config.paths.filter(syncPath =>
      syncPath.indexOf(path) === 0 && syncPath.length > path.length
    );
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
    return store.relToLocal(store.externalToRel(absPath));
  },

  relToLocal(relPath) {
    return pathUtil.join(lns.config.get('store'), relPath);
  },

  relToExternal(relPath) {
    if (relPath.indexOf('~') === 0) {
      return relPath.replace('~', lns.config.get('_homedir'));
    }
    return pathUtil.join(lns.config.get('_rootdir'), relPath);
  },

  externalToRel(absPath) {
    const home = lns.config.get('_homedir');
    if (absPath.indexOf(home) === 0) {
      return pathUtil.join('~', pathUtil.relative(home, absPath));
    }
    return pathUtil.relative(lns.config.get('_rootdir'), absPath);
  },

  localToRel(localPath) {
    return pathUtil.relative(lns.config.get('store'), localPath);
  },
};
