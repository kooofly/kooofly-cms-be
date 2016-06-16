//var models = require('../system/models')
var fs = require('fs')
module.exports = {
    isEmptyObject: function(o) {
        if ( !o || Object.prototype.toString.call( o ) !== "[object Object]" || !o.hasOwnProperty ) {
            return false
        }

        for ( var p in o ) {
            if ( o.hasOwnProperty( p ) ) return false
        }
        return true
    },
    mix: function(o) {
        var i = 1,
            l = arguments.length
        for ( ; i < l; i++ ) {
            var arg = arguments[i]
            for ( var k in arg ) {
                if( arg.hasOwnProperty( k ) ){
                    o[k] = arg[k]
                }
            }
        }
        return o;
    },
    isAdmin: function() {
        return true
    },
    traversalFolder: function(path, relative) {
        var result = []
        _traversal(path)
        return result
        function _traversal(path) {
            var _files = fs.readdirSync(path)
            _files.forEach(function(v) {
                var tmpPath = path + '/' + v,
                    stat = fs.statSync(tmpPath)
                if(stat.isDirectory()) {
                    _traversal(tmpPath)
                } else {
                    result.push({folder: path, file: tmpPath, fileName: v})
                }
            })
        }
    },
    //map: {newKey: oldKey}
    renameKey: function(o,  map) {
        var result = {}, value
        for (var k in map) {
            value = o[ map[k] ]
            if(value !== undefined) {
                result[k] = value
            }
        }
        return result;
    },
    // 过滤保留字 _limit _sort _sortby _map _single
    filterReserved: function (o) {
        var result = {}
        for (var k in o) {
            if (!/_/.test(k) || k === '_id') {
                result[k] = o[k]
            }
        }
        return result
    },
    // 解析_map
    promiseParsingMap: function (map, promiseModels) {
        var mapSplit = map.split('_')
        var master = mapSplit[0]
        var slave = mapSplit[2] ? mapSplit[2] : mapSplit[1]
        var dbKey = mapSplit[1]
        return promiseModels.then(function (models) {
            var result = {
                master: master,
                slave: slave,
                masterId: master + 'Id',
                slaveId: dbKey + 'Id',
                contactField: 'contentType'
            }
            var possibleColl = 'map' + master + dbKey
            var possibleCollReverse = 'map' + dbKey + master
            if(models[possibleColl]) {
                result['mapCollectionName'] = possibleColl
            } else if (models[possibleCollReverse]) {
                result['mapCollectionName'] = possibleCollReverse
            } else {
                console.log('promiseParsingMap error')
            }
            return result
        })
    },
    // 过滤不需要的key
    filterKey: function (o, removeKey) {
        var result = {}
        for (var key in o) {
            if(removeKey !== key) {
                result[key] = o[key]
            }
        }
        return result
    },
    justDoIt: function () {

    },
    /*
    * 所有请求的入口 除了数据处理之外，这里所有的操作都是异步的
    * req > 404检测 > 角色api权限检测（模块权限检测 > uri resource权限检测 ） > [request 数据合法性检测] >
    *   增删 > 操作成功 > [可能的步骤：刷新缓存] > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
    *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
    *   查 > 字段过滤 > 操作成功 > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
    *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
    *   改 > 数据版本检测 通过则 > 操作成功 > [可能的步骤：刷新缓存] > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
    *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
    *   注：所有的api都视为一种资源uri resource
    *   暂时不做 moduleCheck uriResourceCheck isRequestLegal refreshCache
    * */
    requestDispatch: function (req, res) {
        var self = this
        // 404 api权限检测 数据合法性检测等
        // 缓存信息 增删改时使用
        var isNeedRefreshCache = false
        var cacheInfo = ''
        // 组合数据 模板 增删改查时使用 主要用于 查
        var responseTemplate = {}
        // 字段过滤
        var showFields = []

        this.isNot404(req, res).then(function () {
            // 角色api权限检测 模块权限检测
            // 缓存所有的api 不从数据库查询 提升性能
            return self.moduleCheck().then(function () {
                // uri resource权限检测
                // 缓存所有的角色信息 不从数据库查询 提升性能
                return self.uriResourceCheck().then(function () {
                    // [request 数据合法性检测]
                    return self.isRequestLegal().then(function () {
                        var result
                        var method = ''
                        switch (method) {
                            case 'post':
                            case 'delete':
                                result = self.justDoIt().then(function (result) {
                                    var responseJson
                                    if (isNeedRefreshCache) {
                                        self.refreshCache(cacheInfo)
                                        self.createLog()
                                        responseJson = self.cookingData(result, responseTemplate)
                                    } else {
                                        self.createLog()
                                        responseJson = self.cookingData(result, responseTemplate)
                                    }
                                    return responseJson
                                })
                                break;
                            case 'put':
                                result = self.versionCheck().then(function () {
                                    return self.justDoIt().then(function (result) {
                                        var responseJson
                                        if (isNeedRefreshCache) {
                                            self.refreshCache(cacheInfo)
                                            self.createLog()
                                            responseJson = self.cookingData(result, responseTemplate)
                                        } else {
                                            self.createLog()
                                            responseJson = self.cookingData(result, responseTemplate)
                                        }
                                        return responseJson
                                    })
                                })
                                break;
                            case 'get':
                                result = self.read(showFields).then(function () {
                                    var isNeedLog = false
                                    var responseJson
                                    if (isNeedLog) {
                                        self.createLog()
                                        responseJson = self.cookingData(result, responseTemplate)
                                    } else {
                                        responseJson = self.cookingData(result, responseTemplate)
                                    }
                                    return responseJson
                                })
                        }
                        return result
                    })
                })
            })
        }).then(function (result) {
            res.json(result)
        }, function(err) {
            // 可能的错误
            // 返回404信息
            // 模块 无操作权限
            // 资源 无操作权限
            // 参数不合法 返回不合法原因

            // 查询操作失败
            // 添加或者是删除操作失败

            // 数据版本检测 操作失败
            // 更新操作失败
            res.json(err)
        })

    },

    // log 操作日志
    log: function () {

    },
    // 所有更新数据的入口
    updateDispatch: function () {
        // __v 的使用 控制数据版本 保证数据一致性
    },
    // 字段过滤
    fieldsFilter: function () {

    }
}