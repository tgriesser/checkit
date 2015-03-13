global.Promise   = require('bluebird');
global._         = require('lodash');
global.Checkit   = require('../server');

global.assert    = require('assert');
global.equal     = require('assert').equal;
global.deepEqual = require('assert').deepEqual;

require('./block');
require('./spec');
require('./sync');