// Load chai should syntax globally
var chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

// Configure promise and es6 support
global.Promise = require('bluebird');
require("babel/register");
