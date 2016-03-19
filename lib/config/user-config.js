let fs = require('../utils/fs');
let pathUtil = require('path');
let home = require('home')

let userConfigPath = home.resolve('~/.lnsrc');
exports.load = () => {
  return fs.readFileOrNull(userConfigPath)
    .then((content) => JSON.parse(content || '{}'));
};

exports.update = async (updater) => {
  const config = await exports.load();
  updater(config);
  await fs.writeFile(userConfigPath, JSON.stringify(config));
};
