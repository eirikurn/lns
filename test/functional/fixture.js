"use strict";
let fs = require('../../lib/utils/fs');
let lns = require('../../lib/lns');
let store = require('../../lib/store');
let pathUtil = require('path');

let sandboxPath = pathUtil.join(__dirname, 'sandbox');
let sandbox = {
  config: pathUtil.join(sandboxPath, 'lns.json'),
  drive: pathUtil.join(sandboxPath, 'drive'),
  store: pathUtil.join(sandboxPath, 'store'),
  homedir: pathUtil.join(sandboxPath, 'drive', 'home'),
  cwd: '.'
};

exports.setup = function(args) {
  args = args || {};
  args._rootdir = args.rootdir || sandbox.drive;
  args._homedir = args.homedir || sandbox.homedir;
  args._cwd = args.cwd || sandbox.drive;
  args.store = args.store || sandbox.store;
  args.storeConfig = args.storeConfig || sandbox.config;
  return lns.load(args);
};

exports.write = async function(structure) {
  await Promise.all([
    fs.rimraf(sandbox.config),
    fs.rimraf(sandbox.drive),
    fs.rimraf(sandbox.store)
  ]);

  if (structure.config) {
    await fs.mkdirp(sandboxPath);
    await fs.writeFile(sandbox.config, JSON.stringify(structure.config));
  }

  await Promise.all([
    store.load(),
    writeFolder(sandbox.drive, structure.drive),
    writeFolder(sandbox.store, structure.store)
  ]);
};

exports.read = async function() {
  var config = await fs.readFileOrNull(sandbox.config, {encoding: 'utf8'});
  config = JSON.parse(config);

  return skipNulls({
    config: config,
    drive: await readFolder(sandbox.drive),
    store: await readFolder(sandbox.store)
  });
};

async function writeFolder(folder, contents) {
  if (contents == null) return;
  await fs.mkdirp(folder);

  for (let name of Object.keys(contents || {})) {
    let path = pathUtil.join(folder, name);
    let data = contents[name];

    if ('object' === typeof data) {
      // Folder
      await writeFolder(path, data);
    } else if (data[0] == '>') {
      // Symbolic link
      let target = pathUtil.join(sandbox.store, data.slice(1));
      await fs.symlink(target, path);
    } else {
      // Normal file
      await fs.writeFile(path, data);
    }
  }
}

async function readFolder(folder) {
  try {
    var names = await fs.readdir(folder);
  } catch(err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  let contents = {};
  for (let name of names) {
    let path = pathUtil.join(folder, name);

    let stats = await fs.lstat(path);
    if (stats.isSymbolicLink()) {
      let storePath = await fs.readlink(path);
      contents[name] = '>' + pathUtil.relative(sandbox.store, storePath);
    } else if (stats.isDirectory()) {
      contents[name] = await readFolder(path);
    } else {
      contents[name] = await fs.readFile(path, {encoding: 'utf8'});
    }
  }
  return contents;
}

function skipNulls(obj) {
  for (let k of Object.keys(obj)) {
    if (obj[k] == null) delete obj[k];
  }
  return obj;
}
