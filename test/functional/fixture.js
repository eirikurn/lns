"use strict";
let co = require('co');
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

exports.write = co.wrap(function*(structure) {
  yield [
    fs.rimraf(sandbox.config),
    fs.rimraf(sandbox.drive),
    fs.rimraf(sandbox.store)
  ];

  if (sandbox.config) {
    yield fs.mkdirp(sandboxPath);
    yield fs.writeFile(sandbox.config, structure.config);
  }

  yield [
    store.load(),
    writeFolder(sandbox.drive, structure.drive),
    writeFolder(sandbox.store, structure.store)
  ];
});

exports.read = co.wrap(function*() {
  try {
    var config = yield fs.readFile(sandbox.config, {encoding: 'utf8'});
    config = JSON.parse(config);
  } catch (err) {
    if (err.code === 'ENOENT') config = null;
    throw err;
  }

  return skipNulls({
    config: config,
    drive: yield readFolder(sandbox.drive),
    store: yield readFolder(sandbox.store)
  });
});

function* writeFolder(folder, contents) {
  if (contents == null) return;
  yield fs.mkdirp(folder);

  for (let name of Object.keys(contents || {})) {
    let path = pathUtil.join(folder, name);
    let data = contents[name];

    if ('object' === typeof data) {
      // Folder
      yield writeFolder(path, data);
    } else if (data[0] == '>') {
      // Symbolic link
      let target = pathUtil.join(sandbox.store, data.slice(1));
      yield fs.symlink(path, target);
    } else {
      // Normal file
      yield fs.writeFile(path, data);
    }
  }
}

function* readFolder(folder) {
  try {
    var names = yield fs.readdir(folder);
  } catch(err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  let contents = {};
  for (let name of names) {
    let path = pathUtil.join(folder, name);

    let stats = yield fs.lstat(path);
    if (stats.isSymbolicLink()) {
      let storePath = yield fs.readlink(path);
      contents[name] = '>' + pathUtil.relative(sandbox.store, storePath);
    } else if (stats.isDirectory()) {
      contents[name] = yield readFolder(path);
    } else {
      contents[name] = yield fs.readFile(path, {encoding: 'utf8'});
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
