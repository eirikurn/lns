const fs = require('../../src/utils/fs');
const lns = require('../../src/lns');
const store = require('../../src/store');
const pathUtil = require('path');

const sandboxPath = pathUtil.join(__dirname, 'sandbox');
const sandbox = {
  config: pathUtil.join(sandboxPath, 'lns.json'),
  drive: pathUtil.join(sandboxPath, 'drive'),
  store: pathUtil.join(sandboxPath, 'store'),
  homedir: pathUtil.join(sandboxPath, 'drive', 'home'),
  cwd: '.',
};

async function writeFolder(folder, contents) {
  if (contents == null) return;
  await fs.mkdirp(folder);

  for (const name of Object.keys(contents || {})) {
    const path = pathUtil.join(folder, name);
    const data = contents[name];

    if (typeof data === 'object') {
      // Folder
      await writeFolder(path, data);
    } else if (data[0] === '>') {
      // Symbolic link
      const target = pathUtil.join(sandbox.store, data.slice(1));
      await fs.symlink(target, path);
    } else {
      // Normal file
      await fs.writeFile(path, data);
    }
  }
}

async function readFolder(folder) {
  let names;
  try {
    names = await fs.readdir(folder);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  const contents = {};
  for (const name of names) {
    const path = pathUtil.join(folder, name);

    const stats = await fs.lstat(path);
    if (stats.isSymbolicLink()) {
      const storePath = await fs.readlink(path);
      contents[name] = '>' + pathUtil.relative(sandbox.store, storePath);
    } else if (stats.isDirectory()) {
      contents[name] = await readFolder(path);
    } else {
      contents[name] = await fs.readFile(path, { encoding: 'utf8' });
    }
  }
  return contents;
}

function skipNulls(obj) {
  return Object.keys(obj).reduce((newObj, key) => {
    if (obj[key] != null) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});
}

exports.setup = (args = {}) => {
  const loadArgs = {
    ...args,
    _rootdir: args.rootdir || sandbox.drive,
    _homedir: args.homedir || sandbox.homedir,
    _cwd: args.cwd || sandbox.drive,
    store: args.store || sandbox.store,
    storeConfig: args.storeConfig || sandbox.config,
  };
  return lns.load(loadArgs);
};

exports.write = async (structure) => {
  await Promise.all([
    fs.rimraf(sandbox.config),
    fs.rimraf(sandbox.drive),
    fs.rimraf(sandbox.store),
  ]);

  if (structure.config) {
    await fs.mkdirp(sandboxPath);
    await fs.writeFile(sandbox.config, JSON.stringify(structure.config));
  }

  await Promise.all([
    store.load(),
    writeFolder(sandbox.drive, structure.drive),
    writeFolder(sandbox.store, structure.store),
  ]);
};

exports.read = async () => {
  const configJSON = await fs.readFileOrNull(sandbox.config, { encoding: 'utf8' });
  const config = JSON.parse(configJSON);

  return skipNulls({
    config,
    drive: await readFolder(sandbox.drive),
    store: await readFolder(sandbox.store),
  });
};
