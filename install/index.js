var common = require('../system/common')
var customApis = require('../resetful/installApi')
var API = require('../resetful/ApiCreater')
var coreData = require('../system/coreData')
var promiseApis = require('../resetful/promiseApis')
var promiseModels = require('../system/promiseModels')
module.exports = function(option) {
    var dataPaths = common.traversalFolder('install/data', './data')
    var package = {} // 安装包 待安装对象
    dataPaths.forEach(function(v, i) {
        var d = require(v.file.replace('install/data', './data')),
            key = v.fileName.replace(/\.js$/, '')
        package[key] = d
    })
// 根据coreData构建apis，用来之后安装使用，因为第一次安装时，事先并没有数据。所以从coreData获取
    var apis = (function () {
        var result = {}
        coreData.data.forEach(function (v, i) {
            var collectionName = v.collectionName
            // 过滤map开头的表
            if (!/^m{1}a{1}p{1}/.test(collectionName)) {
                result[collectionName] = customApis[collectionName] ? customApis[collectionName] : new API(collectionName)
            }
        })
        common.mix(result, customApis)
        return result
    })()

    var fisrtStepPromises = []
    var secondStepPackage = []
    for (var k in package) {
        var o = package[k]
        var installer = o.installer
        var data = o.data
        var defer = o.defer // 推迟安装，依赖一些基础数据安装完成之后，再开始安装 主要是用于关联安装时，获取api表中的config配置
        if (defer) {
            secondStepPackage.push(o)
        } else {
            console.log(installer)
            fisrtStepPromises.push(apis[installer]._install(data, k, option.isRemoveAll))
        }
    }
    return Promise.all(fisrtStepPromises).then(function (firstResult) {
        if (secondStepPackage.length) {
            console.log('fisrt step install:', firstResult)
            // 第二步安装
            return promiseApis.then(function (secondApis) {
                var secondStepPromises = []
                for (var key in secondStepPackage) {
                    var o = secondStepPackage[key]
                    var installer = o[key].installer
                    var data = o[key].data
                    secondStepPromises.push(secondApis[installer]._install(data, key, option.isRemoveAll))
                }
                return Promise.all(secondStepPromises).then(function (secondResult) {
                    console.log('second step install:', secondResult)
                    return [firstResult, secondResult]
                })
            })
        } else {
            console.log('all install:', firstResult)
            return [firstResult]
        }

    })
}