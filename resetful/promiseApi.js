var common = require('../system/common')
var apiPaths = common.traversalFolder('resetful/apis', './apis')
var DbClass = require('../system/DbClass')
var apis = {}

apiPaths.forEach(function(v, i) {
    var APIs = require(v.file.replace('resetful/apis', './apis')),
        key = v.fileName.replace(/\.js$/, '').toLowerCase()
    apis[key] = new APIs()
})
module.exports = apis.api._read({ type: 'router' }).then(function (result) {
    result.forEach(function (v, i) {
        if(!v.uri) {
            apis[v.uri] = new DbClass(v.uri)
        }
    })
    return apis;
})