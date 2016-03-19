const fs = require('../utils/fs');
const home = require('home');

const userConfigPath = home.resolve('~/.lnsrc');
exports.load = () => {
  return fs.readFileOrNull(userConfigPath)
    .then((content) => JSON.parse(content || '{}'));
};

exports.update = async (updater) => {
  const config = await exports.load();
  updater(config);
  await fs.writeFile(userConfigPath, JSON.stringify(config));
};
