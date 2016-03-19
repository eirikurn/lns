const Config = require('./model');
const { load: loadUserConfig } = require('./user-config');
const builtinConfig = require('../../lnsrc');

module.exports = async (runtimeConfig = {}) => {
  const userConfig = await loadUserConfig();

  const result = new Config(builtinConfig);
  result.set(userConfig);
  result.set(runtimeConfig);
  result.validate();
  return result;
};
