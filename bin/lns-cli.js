#!/usr/bin/env node
// Register 6to5 require transform to run ES6 code reliably
global.Promise = require('bluebird');
require("6to5/register");

// Initialise logger
process.title = 'lns';
var log = require('npmlog');
log.verbose('cli', process.argv);

// Dependencies
var lns = require('../lib/lns');
var errorHandler = require('../lib/utils/error-handler');
var argv = require('yargs').argv;

// Argument handling
var command = argv._.shift();


// Run command
process.on('uncaughtException', errorHandler);
lns[command](argv._)
  .catch(errorHandler);

//var fs = require('fs');
//var pathUtil = require('path');
//
//var config = {
//  store: '/Users/eirikur/Google Drive/Sync',
//  storeConfig: '/Users/eirikur/Google Drive/Sync/lns.json'
//};
//
//var utils = {
//  mkdirp: function(path) {
//    if (fs.existsSync(path)) {
//      return;
//    }
//    utils.mkdirp(pathUtil.dirname(path));
//    fs.mkdirSync(path);
//  },
//
//  copy: function(src, target) {
//    var stat = fs.statSync(src);
//    if (stat.isDirectory()) {
//      utils.copyFolder(src, target);
//    } else {
//      utils.copyFile(src, target);
//    }
//  },
//
//  copyFile: function(src, target) {
//    var content = fs.readFileSync(src);
//    fs.writeFileSync(target, content);
//  },
//
//  copyFolder: function(src, target) {
//    fs.mkdirSync(target);
//
//    var entries = fs.readdirSync(src);
//    entries.forEach(function(entry) {
//      utils.copy(pathUtil.join(src, entry), pathUtil.join(target, entry));
//    });
//  },
//
//  rimraf: function(path) {
//    var stat = fs.statSync(path);
//    if (stat.isDirectory()) {
//      utils.rimrafFolder(path);
//    } else {
//      utils.rimrafFile(path);
//    }
//  },
//
//  rimrafFile: function(path) {
//    fs.unlinkSync(path);
//  },
//
//  rimrafFolder: function(path) {
//    var entries = fs.readdirSync(path);
//    entries.forEach(function(entry) {
//      utils.rimraf(pathUtil.join(path, entry));
//    });
//
//    fs.rmdirSync(path);
//  }
//};
//
//var commands = {
//  // Updates all symbolic links
//  update: function() {
//
//  },
//
//  // Initiate a store
//  init: function() {
//
//  },
//
//  // Manage client configuration
//  config: function() {
//
//  },
//
//  // Stop syncing a file or directory
//  detach: function() {
//
//  },
//
//  // Sync file or directory to store
//  add: function(path) {
//    // cancel if source doesn't exist.
//    var source = pathUtil.resolve(path);
//    var target = store.mapPath(source);
//
//    // Make sure we're adding an actual file/directory
//    if (!fs.existsSync(source)) {
//      throw new ExitWithMessage('lns: ' + path + ': No such file or directory');
//    }
//
//    // Check if store already contains path
//    store.verifyPath(target);
//
//    // Make sure the parent directory exists in the store
//    utils.mkdirp(pathUtil.dirname(target));
//
//    // Copy the source file/directory to the store
//    utils.copy(source, target);
//
//    // Remove the source
//    utils.rimraf(source);
//
//    // Create a symlink to the store
//    fs.symlinkSync(target, source);
//
//    // Save path to store
//    store.savePath(target);
//  }
//};
//
//function ExitWithMessage(message, file) {
//  this.message = message;
//}
//
