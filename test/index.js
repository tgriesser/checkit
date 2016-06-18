global._         = require('lodash');
global.Checkit   = require('../index');

global.assert    = require('assert');
global.equal     = require('assert').equal;
global.deepEqual = require('assert').deepEqual;

require('./block');
require('./spec');
require('./sync');