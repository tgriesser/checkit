/* eslint-disable */
if (typeof Promise === 'undefined') {
  throw new Error('global Promise polyfill is required to use checkit')
}
var _ = require('lodash')
if (typeof process === 'undefined') {
  module.exports = require('./lib/checkit')
} else {
  // Get the node version from process.versions.node, and
  // check the major version number
  var version = _.get(process, 'versions.node', '').split('.')
  var NODE_MAJOR_VERSION = parseFloat(version[0])
  if (!version[0] || isNaN(NODE_MAJOR_VERSION) || NODE_MAJOR_VERSION < 6) {
    if (typeof regeneratorRuntime === 'undefined') {
      throw new Error('regeneratorRuntime is required to use checkit')
    }
    module.exports = require('./lib/checkit')
  } else {
    module.exports = require('./src/checkit')
  }
}
