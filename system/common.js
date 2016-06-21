//var models = require('../system/models')
var fs = require('fs')
var toString = Object.prototype.toString
module.exports = {
    isObject: function (value) {
        return toString.call( value ) === "[object Object]"
    },
    isArray: function (value) { return toString.call(value) === '[object Array]' },
    isEmptyObject: function (value) {
        if ( !value || toString.call(value) !== "[object Object]" || !value.hasOwnProperty ) {
            return false
        }

        for (var p in value) {
            if (value.hasOwnProperty(p)) return false
        }
        return true
    },
    isDefined: function (value) { return typeof value !== 'undefined' },
    isUndefined: function (value) { return typeof value === 'undefined' },
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
                console.log('promiseParsingMap error', map)
            }
            return result
        })
    },
    upperFirstLetter: function (str) {
        return str.replace(/\b\w+\b/g, function(word) {
            return word.substring(0,1).toUpperCase( ) +  word.substring(1)
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
    promiseApis: function (promiseModels, successCall, API, customApis) {
        // 重复 new API 会导致 _maxListeners 的问题 TODO 销毁 api listeners对象
        return promiseModels.then(function (models) {
            return models['api'].find().then(function (result) {
                result.forEach(function (v) {
                    var apiName = v.uri
                    var apiModule = v.module || v.uri
                    // 修改 API 时 更新 API 这里可能会导致 _maxListeners 问题 TODO 删除 API 时 更新 api
                    if(!global.apis[apiName] || (v.__v !== global.apis[apiName].__v)) {
                        var MayBeAPI = customApis[apiName]
                        if(MayBeAPI) {
                            global.apis[apiName] = new MayBeAPI(apiModule, v.config, { fns: v.method, __v: v.__v })
                        } else {
                            global.apis[apiName] = new API(apiModule, v.config, { fns: v.method, __v: v.__v })
                        }
                    }
                })
                return successCall(global.apis)
            }, function (err) {
                console.log('promiseApis', err)
            })
        })
    }
}