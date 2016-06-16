var promiseModels = require('../system/promiseModels')
var apis = require('./index')
var DbClass = require('../system/DbClass')
module.exports = function () {
    return promiseModels.then(function (models) {
        return models['api'].find().then(function (result) {
            result.forEach(function (v) {
                if(!apis[v.uri]) {
                    apis[v.uri] = new DbClass(v.uri)
                }
            })
            return apis
        })
    })
}