var _ = require('./lodash-requires')
module.exports = require('./core')(_, require('when').Promise)
