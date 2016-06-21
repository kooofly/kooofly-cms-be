// common.promiseApis 中使用
var common = require('../system/common')
var apiPaths = common.traversalFolder('resetful/apis', './apis')
var result = {}
apiPaths.forEach(function(v, i) {
    var APIs = require(v.file.replace('resetful/apis', './apis')),
        key = v.fileName.replace(/\.js$/, '').toLowerCase()
    result[key] = APIs
})

module.exports = result