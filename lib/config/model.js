'use strict';

let pathUtil = require('path');

const CONFIG_SCHEMA = {
  store: {
    required: true
  },
  storeConfig: {
    fallback: c => pathUtil.join(c.get('store'), 'lns.json')
  },

  /////////////////////////////////
  // Private config for automated testing

  // Working directory for relative paths
  _cwd: {
    fallback: process.cwd
  },

  // Root folder
  _rootdir: {
    fallback: '/'
  },

  _homedir: {
    fallback: (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME
  }
};

class Config {
  constructor(config) {
    this._config = {};

    if (config) this.set(config);
  }

  set(config, value) {
    if ('string' !== typeof config) {
      for (let key of Object.keys(config)) {
        this.set(key, config[key]);
      }
      return;
    }

    if (CONFIG_SCHEMA.hasOwnProperty(config)) {
      this._config[config] = value;
    }
  }

  get(config) {
    if (this._config[config] != null) return this._config[config];

    let schema = CONFIG_SCHEMA[config];
    let fallback = schema && schema.fallback;
    if (fallback) {
      return typeof(fallback) === 'function' ? fallback(this) : fallback;
    }
    return schema && null;
  }

  validate() {
    for (let k of Object.keys(CONFIG_SCHEMA)) {
      if (CONFIG_SCHEMA[k].required && this.get(k) == null) {
        throw new Error(`Missing required config ${k}`);
      }
    }
  }
}

module.exports = Config;
