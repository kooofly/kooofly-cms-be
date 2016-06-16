var Class = require('./Class')
var promiseModels = require('./promiseModels')
var promiseApis = require('../resetful/promiseApis')
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
        return promiseApis.then(function (apis) {
            return new Promise(function (resolve, reject) {
                var o = this.searchPath(apis, pathKeys.concat([]))
                // 支持 /collection/method，如果链接中包含有method 则忽略req.method
                var fn = o && (typeof o === 'function' ? o : o[method])
                if (typeof fn === 'function') {
                    resolve(fn)
                } else {
                    // TODO msgs
                    var err = new Error('Not Found')
                    err.status = 404
                    reject(err)
                }
            }) 
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
    // TODO
    // uri resource权限检测
    // 缓存所有的角色信息 不从数据库查询 提升性能
    uriResourceCheck: function () {
        return new Promise(function (resolve, reject) {
            resolve(true)
        })
    },
    // TODO
    // [request 数据合法性检测]
    isRequestLegal: function () {
        return new Promise(function (resolve, reject) {
            resolve(true)
        })
    },
    // TODO
    //数据版本检测
    versionCheck: function () {
        return new Promise(function (resolve, reject) {
            resolve(true)
        })
    },
    // TODO
    // 刷新缓存
    refreshCache: function () {
        setTimeout(function () {
            console.log('refreshCache')
        }, 3000)
    },
    // 处理数据
    cookingData: function () {

    },
    // 字段过滤 查询的时候需要
    fieldsFilter: function () {

    },
    // 创建操作日志
    createLog: function () {

    }
})
module.exports = new CoreDispatch()