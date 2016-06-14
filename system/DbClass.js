var Class = require('./Class')
//var models = require('./models')
var promiseModels = require('./promiseModels')
var common = require('./common')
var config = require('./config')
var msgs = config[config.lang]


//


var DbClass = Class.extend({
    promiseModels: promiseModels,
    ctor: function(modelName) {
        this.modelName = modelName
        //this.models = models
        //this.model = this.models[this.modelName]
        this.model = this.promiseModels.then(function(models) {
            return models[modelName]
        })
    },
    getModel: function(modelName) {
        var self = this
        return this.promiseModels.then(function(models) {
            return models[modelName || self.modelName]
        })
    },
    _create: function(data) {
        return this.getModel().then(function(model) {
            return model.create(data)
        })
    },
    _update: function(conditions, data) {
        return this.getModel().then(function(model) {
            return model.update(conditions, data)
        })
    },
    _read: function(conditions) {
        return this.getModel().then(function(model) {
            return model.find(conditions)
        })
    },
    _readAssociated: function(conditions, query, map) {
        var mapSplit = map.split('_')
        var master = mapSplit[0]
        var slave = mapSplit[1]
        var parsingMap = {
            associatedCollectionName: 'map' + master + slave,
            master: master,
            slave: slave,
            masterId: master + 'Id',
            slaveId: slave + 'Id',
            contactField: 'contentType'
        }
        var isPaging = query._limit && query._page
        return isPaging ?
            this._readAssociatedPaging(conditions, query, parsingMap) :
            this._readAssociatedNormal(conditions, query, parsingMap)
    },
    _readAssociatedNormal: function (conditions, query, parsingMap) {
        this.getModel(parsingMap.associatedCollectionName).then(function (model) {
            return model.find(conditions)
        }).then(function (result) {
            if(!result.length) return []
            // 由于有contentType 数据集可能来自不同的model，而查询是异步的，所以需要用sortObj来保证查询的顺序
            var sortObj = {}
            var group = {}
            var data = []
            result.forEach(function (v, i) {
                var contentType = v.contentType
                if(!group[contentType]) {
                    group[contentType] = []
                }
                group[contentType].push(v.slaveId)
                sortObj[parsingMap.slaveId] = i
            })
            var promiseList = []
            for (var key in group) {
                promiseList.push(
                    this.getModel(key).then(function (model) {
                        return model.find({ _id: { $in: group[key] } })
                    })
                )
            }
            return Promise.all(promiseList).then(function(resultAll) {
                resultAll.forEach(function (v, i) {
                    v.forEach(function (item, ii) {
                        var index = sortObj[item._id]
                        data[index] = item
                    })
                })
                return data
            })
        })
    },
    _readAssociatedPaging: function() {

    },
    _readPaging: function(conditions, params) {
        var limit = parseInt(params._limit, 10)
        var skip = (params._page - 1) * limit
        console.log(typeof limit)
        return this.getModel().then(function(model) {
            //TODO
            return model.find(conditions).sort({'_id': 1}).skip(skip).limit(limit)
        }, function (err) {
            console.log(err)
        })
    },
    _delete: function(conditions) {
        return this.getModel().then(function(model) {
            return model.remove(conditions)
        }, function(err) {
            console.log(err)
        })
    },
    create: function(req, res, duplicateConditions) {
        var data = req.body,
            self = this
        if(duplicateConditions) {
            this.getModel().then(function(model) {
                model.find(duplicateConditions, function(err, result) {
                    if(result.length) {
                        res.json({
                            message: msgs.dataExist,
                            duplicateConditions: duplicateConditions,
                            model: self.key,
                            documentation_url: msgs.docUrl
                        })
                        return
                    }
                    self._create(data).then(function(result) {
                        res.json(result)
                    }, function(err) {
                        res.json(err)
                    })
                })
            })

        } else {
            this._create(data).then(function(result) {
                res.json(result)
            }, function(err) {
                res.json(err)
            })
        }

    },
    update: function(req, res) {
        var data = req.body
        var conditions = req.query
        this._update(conditions, data).then(function(result) {
            res.json(result)
        })
    },
    /*
    * read
    *   _readAssociated
    *       _readAssociatedNormal
    *       _readAssociated
    *   _readPaging
    *   _read
    * */
    // TODO _sort=asc||desc&[sortby=sort] 表示插入排序 sortBy是可选参数 默认sortBy=sort 可以填写_id等，多个之间用“,”分割 如： _sort=asc,desc&sortby=lastModifyTime,sort
    read: function(req, res, associatedCollectionName) {
        var query = req.query
        /* var params = req.params */

        var isSingle = query._single // 是否返回单条数据
        var isPaging = query._limit && query._page // 是否使用分页查询
        var map = query._map // 是否使用联表查询
        var q = {}
        for (var key in query) {
            if (!/_/.test(key) || key === '_id') {
                q[key] = query[key]
            }
        }
        if (map) {
            this._readAssociated(q, query, map).then(function (result) {
                var json = isSingle ? result[0] : result
                res.json(json)
            }, function (err) {
                res.json(err)
            })
        } else if (isPaging) {
            this._readPaging(q, query).then(function (result) {
                var json = isSingle ? result[0] : result
                res.json(json)
            }, function (err) {
                res.json(err)
            })
        } else {
            this._read(q).then(function(result) {
                var json = isSingle ? result[0] : result
                res.json(json)
            }, function(err) {
                res.json(err)
            })
        }

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
            return _this._create(data).then(function() {
                console.log('DbClass install ' + _this.modelName + ' ready')
            })
        }

        if(isRemoveAll) {
            return _this._delete({}).then(function() {
                return installer()
            })
        } else {
            return installer()
        }
    }
})
module.exports = DbClass