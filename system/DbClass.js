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
    // 查询举例
    /*
    * 知道 catagory 查 content  get /content?catId=5
    * 知道 catagory & type 查 content  get /article?catId=5
    * 知道 content & type 查 catagory  get /catagory?type=article&articleId=43434
    * */
    _readAssociated: function(conditions, query, map) {
        return common.promiseParsingMap(map, this.promiseModels).then(function (parsingMap) {
            var isPaging = query._limit && query._page
            return isPaging ?
                this._readAssociatedPaging(conditions, query, parsingMap) :
                this._readAssociatedNormal(conditions, query, parsingMap)
        })
        
    },
    _readAssociatedNormal: function (conditions, query, parsingMap) {
        return this.getModel(parsingMap.mapCollectionName).then(function (model) {
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
    _readAssociatedPaging: function(conditions, query, parsingMap) {
        this._readAssociatedNormal(conditions, query, parsingMap)
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
    _createDuplicate: function (req, res, duplicateConditions) {
        var data = req.body
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
    },
    /*
    * 1.【插master & slave】同时插入两个 返回的数据插入映射表 post /collection?_map=dyncoll_api&_insert=apis
    * 2.【插slave】知道masterId 插入slave 返回的slaveId 插入映射表 post /article?_map=cat_art&_masterId=catagoryId。
     * 如果3不存在 就不需要_masterId=catagoryId
     * 现在不考虑3的情况
     * 如果以后出现3的情况，则处理成：没有_masterId 则自动默认_masterId，这样做到兼容
    * 3.（可能不存在这个场景,先不考虑）知道slaveId 插入master，返回的masterId 插入映射表
    * */
    _createAssociated: function (req, res, map) {
        var data = req.body
        var self = this
        var _insert = req.query._insert
        if(_insert) {
            var slaveInsert = data[_insert]
            common.promiseParsingMap(map, this.promiseModels).then(function (parsingMap) {
                var promiseMaster = self.getModel(parsingMap.master).then(function (model) {
                    var d = common.filterKey(data, _insert)
                    return model.create(d)
                })
                var promiseSlave = self.getModel(parsingMap.slave).then(function (model) {
                    return model.create(slaveInsert)
                })
                // 插入 master slave 数据
                Promise.all([
                    promiseMaster,
                    promiseSlave
                ]).then(function (resultAll) {
                    var insertedMaster = resultAll[0]
                    var insertedSlave = resultAll[1]
                    // 插入关联数据
                    self.getModel(parsingMap.mapCollectionName).then(function(model) {
                        var d = []
                        insertedSlave.forEach(function (v, i) {
                            var doc = {}
                            doc[parsingMap.masterId] = insertedMaster._id
                            doc[parsingMap.slaveId] = v._id
                            doc[parsingMap.contactField] = parsingMap.slave
                            d.push(doc)
                        })
                        model.create(d).then(function (result) {
                            res.json(result)
                        })
                    })
                })
            })
        } else {
            common.promiseParsingMap(map, this.promiseModels).then(function (parsingMap) {
                self.getModel(parsingMap.slave).then(function (model) {
                    // 插入 slave 数据
                    var d = common.filterKey(data, parsingMap.masterId)
                    model.create(d).then(function (resultSlave) {
                        var doc = {}
                        doc[parsingMap.masterId] = data[parsingMap.masterId]
                        doc[parsingMap.slaveId] = resultSlave._id
                        doc[parsingMap.contactField] = parsingMap.slave
                        // 插入关联数据
                        self.getModel(parsingMap.mapCollectionName).then(function (model) {
                            model.create(doc).then(function(result) {
                                res.json(result)
                            })
                        })
                    })
                })
            })
        }
    },
    create: function(req, res, duplicateConditions) {
        if (duplicateConditions) {
            // 过滤重复 创建
            this._createDuplicate(req, res, duplicateConditions)
        } else {
            var body = req.body
            var map = req.query._map
            if (map) {
                // 含有关联关系的创建
                this._createAssociated(req, res, map)
            } else {
                // 直接创建
                this._create(body).then(function(result) {
                    res.json(result)
                }, function(err) {
                    res.json(err)
                })
            }
        }
    },
    update: function(req, res) {
        var data = req.body
        var conditions = req.query
        this._update(conditions, data).then(function(result) {
            res.json(result)
        })
    },
    readAssociatedPaging: function () {

    },
    readAssociatedOneToOne: function (req, res, conditions, map) {
        var self = this
        var fields = req.query._fields ? req.query._fields.split(',') : ['_id']
        common.promiseParsingMap(map, this.promiseModels).then(function (parsingMap) {
            self.getModel().then(function (model) {
                // 查slave
                model.find(conditions).then(function (result) {
                    if (result.length) {
                        var json = common.mix({}, result[0]._doc)
                        var mapConditions = {}
                        mapConditions[parsingMap.slaveId] = json._id
                        self.getModel(parsingMap.mapCollectionName).then(function (modelMap) {
                            // 查map master-slave
                            modelMap.find(mapConditions).then(function (resultMap) {
                                if(resultMap && resultMap.length) {
                                    var masterConditions = {}
                                    masterConditions['_id'] = resultMap[0][parsingMap.masterId]
                                    self.getModel(parsingMap.master).then(function (modelMaster) {
                                        // 查master
                                        modelMaster.find(masterConditions).then(function (resultMaster) {
                                            var singleMaster
                                            if(resultMaster && resultMaster.length) {
                                                singleMaster = resultMaster[0]
                                                for (var key in singleMaster) {
                                                    if(fields.indexOf(key) !== -1) {
                                                        if(key !== '_id') {
                                                            json[key] = singleMaster[key]
                                                        } else {
                                                            json[parsingMap.masterId] = singleMaster[key]
                                                        }

                                                    }
                                                }
                                            }
                                             res.json(json)
                                        })
                                    })
                                } else {
                                    res.json(json)
                                }

                            })
                        })
                    }

                })
            })

        })
    },
    readAssociatedOneToMany: function (req, res, conditions, map) {

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
        var pattern = query._pattern //查询模式 一对一 || 一对多
        var q = common.filterReserved(query)
        if (map) {
            if (isPaging) {
                this.readAssociatedPaging(req, res, q, map)
            } else {
                if (!pattern || pattern === 'onetoone') {
                    this.readAssociatedOneToOne(req, res, q, map)
                } else {
                    this.readAssociatedOneToMany(req, res, q, map)
                }
            }
            return
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