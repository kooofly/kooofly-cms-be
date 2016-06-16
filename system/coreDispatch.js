var Class = require('./Class')
var promiseModels = require('./promiseModels')
var apis = require('../resetful/index')
var config = require('./config')
var msgs = config[config.lang]
var CoreDispatch = Class.extend({
    ctor: function () {

    },
    searchPath: function (apis, pathKeys) {
        var path
        var waitingForSearch
        if (!pathKeys.length) return null
        path = pathKeys[0]
        waitingForSearch = apis[path]
        if (waitingForSearch) {
            pathKeys.shift()
            return getCallByPath(waitingForSearch, pathKeys)
        } else {
            return null
        }
    },
    model: function (modelName) {
        return promiseModels.then(function(models) {
            return models[modelName]
        })
    },
    isNot404: function (req, res) {
        var url = req.url
        var mapMethod = {
            GET: 'read',
            POST: 'create',
            PUT: 'update',
            DELETE: 'delete'
        }
        var method = mapMethod[req.method]
        var pathKeys = (function () {
            var result = []
            var array = url.split('?')[0].split('/')
            array.forEach(function (v, i) {
                if(v !== '') {
                    result.push(v)
                }
            })
            return result
        })()
        return new Promise(function (resolve, reject) {
            var o = this.searchPath(apis, pathKeys.concat([]))
            var fn = o[method]
            if (o && typeof fn === 'function') {
                resolve(fn)
            } else {
                // TODO msgs
                var err = new Error('Not Found')
                err.status = 404
                reject(err)
            }
        })
    },
    // TODO
    // 角色api权限检测 模块权限检测
    // 缓存所有的api 不从数据库查询 提升性能
    moduleCheck: function () {
        return new Promise(function (resolve, reject) {
            resolve(true) 
        })
    },
    uriResourceCheck: function () {

    },
    isRequestLegal: function () {

    },
    versionCheck: function () {

    },
    refreshCache: function () {

    },
    cookingData: function () {

    },
    createLog: function () {

    }
})
module.exports = new CoreDispatch()