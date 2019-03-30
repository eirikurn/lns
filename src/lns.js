const loadConfig = require('./config/load-config');
const store = require('./store');

const lns = module.exports;

const commands = [
  'diff',
  'init',
  'ls',
  'map',
  'unmap',
//  'config',
  'update',
];

lns.load = async (args) => {
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
  },
});

// Async helper to make sure config has been loaded before running command.
// Part of delayed loading so tests don't load redundantly.
function ensureLoaded(cmd) {
  async function wrap(...args) {
    if (!lns._config) {
      await lns.load();
    }
    return cmd(...args);
  }
  wrap.usage = cmd.usage;
  return wrap;
}

lns.commands = {};
for (const c of commands) {
  lns.commands[c] = ensureLoaded(require(`./${c}.js`));
}
lns.commands['init'] = require('./init.js');

lns.version = require('../package.json').version;
