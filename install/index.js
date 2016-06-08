var common = require('../system/common')
var apis = require('../resetful/index')
var promiseModels = require('../system/promiseModels')
var dataPaths = common.traversalFolder('install/data', './data')
var data = {}
dataPaths.forEach(function(v, i) {
    var d = require(v.file.replace('install/data', './data')),
        key = v.fileName.replace(/\.js$/, '')
    data[key] = d
})

module.exports = function(option) {
    var installer,
        d,
        all = []
    for (var k in data) {
        console.log('install ' + k + ' ...')
        installer = data[k].installer
        d = data[k].data

        all.push(apis[installer].install(d, option.isRemoveAll))
    }
    return Promise.all(all)
}