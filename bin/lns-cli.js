#!/usr/bin/env node
// Register babel require transform to run ES6 code reliably
global.Promise = require('bluebird');
require('babel-register');

// Initialise logger
process.title = 'lns';
const log = require('npmlog');
log.verbose('cli', process.argv);

// Dependencies
const lns = require('../lib/lns');
const errorHandler = require('../lib/utils/error-handler');
const argv = require('yargs').argv;

// Argument handling
let command = argv._.shift();

if (!lns.commands[command]) {
  command = 'help';
}

// Run command
process.on('uncaughtException', errorHandler);
lns.commands[command](argv._, argv)
  .catch(errorHandler);
