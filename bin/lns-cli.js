#!/usr/bin/env node
'use strict';

// Register babel require transform to run ES6 code reliably
global.Promise = require('bluebird');
require('babel-register');
require('source-map-support/register');

// Initialise logger
process.title = 'lns';
const log = require('npmlog');
log.verbose('cli', process.argv);

// Dependencies
const lns = require('../lib/lns');
const errorHandler = require('../lib/utils/error-handler');

// Configure yargs.
const yargs = require('yargs');
yargs.version(lns.version);
yargs.alias('h', 'help');
yargs.help();

// Register commands.
Object.keys(lns.commands).forEach(name => {
  const command = lns.commands[name];
  if (command.usage) {
    yargs.command(...command.usage);
  }
});

// Argument handling
const argv = yargs.argv;
const command = argv._.shift();
if (!lns.commands[command]) {
  yargs.showHelp();
  process.exit();
}

// Run command
process.on('uncaughtException', errorHandler);
lns.commands[command](argv._, argv)
  .catch(errorHandler);
