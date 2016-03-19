"use strict";

let loadConfig = require('./config/load-config');
let store = require('./store');

let lns = module.exports;

let commands = [
  'init',
  'map',
  'unmap',
//  'config',
  'update',
  'help',
];

lns.load = async function(args) {
  lns.config = await loadConfig(args);
  await store.load();
};

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
  const wrap = async function(...args) {
    if (!lns._config) {
      await lns.load();
    }
    return cmd(...args);
  };
  wrap.usage = cmd.usage;
  return wrap;
}

lns.commands = {};
for (let c of commands) {
  lns.commands[c] = ensureLoaded(require(`./${c}.js`));
}

lns.version = require('../package.json').version;
