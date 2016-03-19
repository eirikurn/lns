'use strict';

let Promise = require('bluebird');
let fs = require('./utils/fs');
let userConfig = require('./config/user-config');
let inquirer = require('inquirer');
let lns = require('./lns');
let pathUtil = require('path');
let log = require('npmlog');
let store = require('./store');
let home = require('home');

module.exports = init;
init.usage = 'lns init';

const manualStoreValue = 'Other...';
const defaultStoreName = 'lns';

async function init(args) {
  const questions = await createQuestions();
  const answers = await inquirer.prompt(questions);

  if (answers.createStore === false) return;

  const store = answers.storeManual || answers.store;
  const storeExists = await pathHasStore(store);

  if (!storeExists) {
    await createStore(store);
  }

  await userConfig.update(config => {
    config.store = store;
  });
}

const findPotentialStores = async () => {
  const potentialBackends = [
    '~/Dropbox',
    '~/Google Drive',
  ];

  const stores = await Promise.all(potentialBackends.map(async backend => {
    const backendPath = home.resolve(backend);

    const backendExists = await fs.exists(backendPath);
    if (!backendExists) {
      return null;
    }

    const storePath = pathUtil.join(backend, defaultStoreName);
    const exists = await pathHasStore(storePath);
    const extra = exists ? ' [exists]' : '';
    return {
      value: storePath,
      name: storePath + extra,
      exists: exists,
    };
  }));
  return stores.filter(store => store);
};

const pathHasStore = function(path) {
  const configPath = pathUtil.join(home.resolve(path), '.lns.json');
  return fs.exists(configPath);
};

const createQuestions = async () => {
  const stores = await findPotentialStores();
  const defaultStore = stores.reduce((def, store, i) => def ? def : (store.exists ? i : def), 0);

  return [
    {
      type: 'list',
      name: 'store',
      default: defaultStore,
      choices: stores.concat([manualStoreValue]),
      message: 'Where should files be synced to?',
      when: () => stores.length,
    },
    {
      type: 'input',
      name: 'storeManual',
      message: ({ store }) => store ? 'Where?' : 'Where should files be synced to?',
      when: ({ store }) => store === manualStoreValue,
    },
    {
      type: 'confirm',
      name: 'createStore',
      message: ({ store, storeManual }) => 'Create new store in ' + home.resolve(storeManual || store),
      when: async ({ store, storeManual }) => {
        const exists = await pathHasStore(storeManual || store);
        return !exists;
      },
    }
  ];
};

const createStore = async (store) => {
  const storePath = home.resolve(store);

  await fs.mkdirp(storePath);
  const dir = await fs.readdir(storePath);
  if (dir.length) {
    throw new Error('Can not initialize store in a non-empty folder');
  }

  const configPath = pathUtil.join(storePath, '.lns.json');
  await fs.writeFile(configPath, '{}');
};
