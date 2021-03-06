'use strict';

const Promise = require('bluebird');
const fs = require('fs');

function orNullify(func) {
  return (...args) =>
    func.apply(null, args)
      .catch(err => {
        if (err.code === 'ENOENT') return null;
        throw err;
      });
}

exports.rename = Promise.promisify(fs.rename);

exports.cpr = Promise.promisify(require('ncp').ncp);

exports.rimraf = Promise.promisify(require('rimraf'));

exports.mkdirp = Promise.promisify(require('mkdirp'));

exports.exists = (path) => new Promise((resolve) => {
  fs.lstat(path, (err) => {
    resolve(!err);
  });
});

exports.symlink = Promise.promisify(fs.symlink);

exports.readFile = Promise.promisify(fs.readFile);

exports.readFileOrNull = orNullify(exports.readFile);

exports.writeFile = Promise.promisify(fs.writeFile);

exports.lstat = Promise.promisify(fs.lstat);

exports.lstatOrNull = orNullify(exports.lstat);

exports.readlink = Promise.promisify(fs.readlink);

exports.readdir = Promise.promisify(fs.readdir);

exports.realpath = Promise.promisify(fs.realpath);

exports.safeRealpath = (path, cache) =>
  exports.realpath(path, cache)
    .catch(error => {
      if (error.code === 'ENOENT') {
        return path;
      }
      throw error;
    });
