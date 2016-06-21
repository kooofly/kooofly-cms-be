var promiseModels = require('../system/promiseModels')
var common = require('../system/common')
var customApis = require('./customApis')
var API = require('./ApiCreater')
module.exports = common.promiseApis(promiseModels, function(apis) {
    return apis
}, API, customApis)