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
    }

}