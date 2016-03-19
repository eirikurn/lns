let Config = require('./model');
let { load: loadUserConfig } = require('./user-config');
let builtinConfig = require('../../lnsrc');

module.exports = async function (runtimeConfig) {
  runtimeConfig = runtimeConfig || {};
  let userConfig = await loadUserConfig();

  let result = new Config(builtinConfig);
  result.set(userConfig);
  result.set(runtimeConfig);
  result.validate();
  return result;
};
