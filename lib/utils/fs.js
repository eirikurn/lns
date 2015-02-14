let Promise = require('bluebird');
let fs = require('fs');

exports.cpr = Promise.promisify(require('ncp').ncp);

exports.rimraf = Promise.promisify(require('rimraf'));

exports.mkdirp = Promise.promisify(require('mkdirp'));

exports.exists = Promise.promisify(fs.exists);

exports.symlink = Promise.promisify(fs.symlink);
