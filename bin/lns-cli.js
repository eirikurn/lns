#!/usr/bin/env node
// Register babel require transform to run ES6 code reliably
global.Promise = require('bluebird');
require("babel/register");

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
lns.commands[command](argv._, argv)
  .catch(errorHandler);
