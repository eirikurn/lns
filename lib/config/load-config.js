'use strict';

let Config = require('./model');
let co = require('co');
let fs = require('../utils/fs');
let pathUtil = require('path');

let builtinConfig = require('../../lnsrc');
let userConfigPath = pathUtil.join(process.env.HOME, '.lnsrc');

module.exports = co.wrap(function*(runtimeConfig) {
  runtimeConfig = runtimeConfig || {};
  let userConfig = yield loadUserConfig();

  let result = new Config(builtinConfig);
  result.set(userConfig);
  result.set(runtimeConfig);
  result.validate();
  return result;
});

function loadUserConfig() {
  return fs.readFileOrNull(userConfigPath)
      .then((content) => JSON.parse(content || '{}'));
}
