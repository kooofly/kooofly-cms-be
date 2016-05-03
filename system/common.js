//var models = require('../system/models')
var fs = require('fs')
module.exports = {

    CURD: function(models, key) {
        var self = this
        return {
            _create: function(data, query, res) {
                var create = function() {
                    return models[key].create(data)
                }
                if(query) {
                    models[key].find(query, function(err, result) {
                        if(result.length) {
                            res && res.json({
                                message: 'API exist, you can update this API',
                                documentation_url: 'http://developer.kooofly.com/v1'
                            })
                            return
                        }
                        return create()
                    })
                } else {
                    return create()
                }

            },
            _update: function(conditions, data) {
                return models[key].update(conditions, data)
            },
            _read: function(query, params) {
                var conditions = self.isEmptyObject(params) ? query : params
                return models[key].find(conditions)
            },
            _delete: function(query, params) {
                var conditions = !params || self.isEmptyObject(params) ? query : self.renameKey(params, { _id: 'id' })
                return models[key].remove(conditions)
            },
            create: function(req, res) {
                var data = req.body
                models[key].create(data).then(function(result) {
                    res.json(result)
                }, function(err) {
                    res.json(err)
                })
            },
            update: function(req, res) {
                var data = req.body
                var conditions = req.params
                this._update(conditions, data).then(function(result) {
                    res.json(result)
                })
            },
            read: function(req, res, isSingle) {
                var query = req.query,
                    params = req.params,
                    single = isSingle ? isSingle : ( !self.isEmptyObject(params) ? true : false )
                var p = single ? common.renameKey(params, { _id: 'id' }) : null
                this._read(query, p).then(function(result) {
                    var json = single ? result[0] : result
                    res.json(json)
                }, function(err) {
                    res.json(err)
                })
            },
            delete: function(req, res) {
                var query = req.query
                var params = req.params
                this._delete(query, params, res).then(function(result) {
                    res.json(result)
                }, function(err) {
                    res.json(err)
                })
            },
            install: function(data, isRemoveAll) {
                var _this = this
                var installer = function() {
                    _this._create(data).then(function(result) {
                        var o = {}
                        o[key] = result
                        console.log('install ' + key + ' ready')
                    }, function(err) {
                        console.log(err)
                    })
                }

                if(isRemoveAll) {
                    _this._delete({}).then(function() {
                        installer()
                    }, function(err) {
                        console.log(err)
                    })
                } else {
                    installer()
                }


            },
        }
    },
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
    //////////////////////////////// TODO 废弃
    promiseDo: function(action, model, data) {
        return new Promise(function(resolve, reject) {
            models[model][action](data, function(err, result) {
                if(err) return reject(err)
                resolve(result)
            })
        })
    },
    promiseGet: function(model, conditions) {
        return this.promiseDo('find', model, conditions)
    },
    promiseCreate: function(model, data) {
        return this.promiseDo('create', model, data)
    },
    ///////////////////////////////
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
    }
}