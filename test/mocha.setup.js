// Configure promise and es6 support
global.Promise = require('bluebird');
require('babel-register');

// Load chai should syntax globally
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));
