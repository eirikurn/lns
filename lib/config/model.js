const pathUtil = require('path');
const home = require('home');

const CONFIG_SCHEMA = {
  store: {
    required: true,
    filter: store => home.resolve(store),
  },
  storeConfig: {
    fallback: config => pathUtil.join(config.get('store'), '.lns.json'),
  },

  diff: {
  },

  // Private config for automated testing

  // Working directory for relative paths
  _cwd: {
    fallback: process.cwd,
  },

  // Root folder
  _rootdir: {
    fallback: '/',
  },

  _homedir: {
    fallback: home(),
  },
};

class Config {
  constructor(config) {
    this._config = {};

    if (config) this.set(config);
  }

  set(config, value) {
    if (typeof config !== 'string') {
      for (const key of Object.keys(config)) {
        this.set(key, config[key]);
      }
      return;
    }

    const schema = CONFIG_SCHEMA[config];
    if (!schema) return;
    if (schema.filter) {
      this._config[config] = schema.filter(value);
    } else {
      this._config[config] = value;
    }
  }

  get(config) {
    if (this._config[config] != null) return this._config[config];

    const schema = CONFIG_SCHEMA[config];
    const fallback = schema && schema.fallback;
    if (fallback) {
      return typeof(fallback) === 'function' ? fallback(this) : fallback;
    }
    return schema && null;
  }

  validate() {
    for (const k of Object.keys(CONFIG_SCHEMA)) {
      if (CONFIG_SCHEMA[k].required && this.get(k) == null) {
        throw new Error(`Missing required config ${k}`);
      }
    }
  }
}

module.exports = Config;
