var common = require('../system/common')
var apiPaths = common.traversalFolder('resetful/apis', './apis')
var apis = {}

apiPaths.forEach(function(v, i) {
    var APIs = require(v.file.replace('resetful/apis', './apis')),
        key = v.fileName.replace(/\.js$/, '').toLowerCase()
    apis[key] = new APIs()
})

/*
apiPaths.forEach(function(v, i) {
    var api = require(v.file.replace('resetful/apis', './apis')),
        key = v.fileName.replace(/\.js$/, '')
    apis[key] = api
})
*/

module.exports = apis