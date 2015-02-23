let Promise = require('bluebird');
let co = require('co');
let fs = require('fs');

exports.rename = Promise.promisify(fs.rename);

exports.cpr = Promise.promisify(require('ncp').ncp);

exports.rimraf = Promise.promisify(require('rimraf'));

exports.mkdirp = Promise.promisify(require('mkdirp'));

exports.exists = (path) => new Promise((resolve) => {
  fs.exists(path, function(exists) {
    resolve(exists);
  });
});

exports.symlink = Promise.promisify(fs.symlink);

exports.readFile = Promise.promisify(fs.readFile);

exports.writeFile = Promise.promisify(fs.writeFile);
