var Class = require('./Class')
var promiseModels = require('./promiseModels')
var promiseApis = require('../resetful/promiseApis')
var customApis = require('../resetful/customApis')
var API = require('../resetful/ApiCreater')
var common = require('./common')
var config = require('./config')
var msgs = config[config.lang]
var CoreDispatch = Class.extend({
    ctor: function () {

    },
    searchPath: function (apis, pathKeys) {
        var path
        var waitingForSearch
        if (!pathKeys.length) return apis
        path = pathKeys[0]
        waitingForSearch = apis[path]
        if (waitingForSearch) {
            pathKeys.shift()
            return this.searchPath(waitingForSearch, pathKeys)
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
        var self = this
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
                if(v !== '' && v !== 'resetful') {
                    result.push(v)
                }
            })
            return result
        })()
        if(!global.apis) {
            return promiseApis.then(function (apis) {
                return self.handler(apis, pathKeys, method)
            }, function (err) {
                console.log('coreDispatch isNot404', err)
            })
        } else {
            return common.promiseApis(promiseModels, function(apis) {
                return self.handler(apis, pathKeys, method)
            }, API, customApis)
        }
    },
    handler: function (apis, pathKeys, method) {
        var self = this
        return new Promise(function (resolve, reject) {
            var inst = apis[pathKeys[0]]
            var o = self.searchPath(apis, pathKeys.concat([]))
            // 支持 /collection/method，如果链接中包含有method 也可能会忽略req.method
            var fnName = o && (typeof o === 'function' ? pathKeys.pop() : method)
            if (typeof inst[fnName] === 'function') {
                resolve({
                    inst: inst,
                    fnName: fnName
                })
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
    // TODO
    // uri resource权限检测
    // 缓存所有的角色信息 不从数据库查询 提升性能
    uriResourceCheck: function (req, params) {
        var self = this
        return new Promise(function (resolve, reject) {
            resolve(true)
        })
    },
    // TODO
    // [request 数据合法性检测]
    isRequestLegal: function (req, params) {
        var self = this
        return new Promise(function (resolve, reject) {
            self.mixReq(req, params)
            resolve(req)
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
    cookingData: function (result, processor) {
        if(processor && processor.single && result.length) {
            return result[0]
        } else {
            return result
        }
    },
    // 字段过滤 查询的时候需要
    fieldsFilter: function () {

    },
    // req params 合并
    mixReq: function (req) {
        var p = this.params
        if (common.isObject(p)) {
            var query = p.query
            var body = p.body
            var params = p.params
            query && common.mix(req.query, query)
            body && common.mix(req.body, body)
            params && common.mix(req.params, params)
        }
    },
    // 创建操作日志
    createLog: function () {

    }
})
module.exports = new CoreDispatch()