"use strict";

let co = require('co');
let loadConfig = require('./config/load-config');
let store = require('./store');

let lns = module.exports;

let commands = [
  'add'
//  'config',
//  'init',
//  'update'
];

lns.load = co.wrap(function*(args) {
  lns.config = yield loadConfig(args);
  yield store.load();
});

Object.defineProperty(lns, 'config', {
  get: () => {
    if (!lns._config) {
      throw new Error('lns.load() required');
    }
    return lns._config;
  },

  set: (config) => {
    lns._config = config;
  }
});

// Async helper to make sure config has been loaded before running command.
// Part of delayed loading so tests don't load redundantly.
function ensureLoaded(cmd) {
  return co.wrap(function* (...args) {
    if (!lns._config) {
      yield lns.load();
    }
    return cmd(...args);
  });
};

lns.commands = {};
for (let c of commands) {
  lns.commands[c] = ensureLoaded(require(`./${c}.js`));
}
