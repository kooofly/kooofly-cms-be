var Class = require('../system/Class')
//var models = require('./models')
var promiseModels = require('../system/promiseModels')
var common = require('../system/common')
var config = require('../system/config')
var msgs = config[config.lang]

var API = Class.extend({
    promiseModels: promiseModels,
    ctor: function(modelName, params) {
        this.modelName = modelName
        this.model = this.promiseModels.then(function(models) {
            return models[modelName]
        })
        this.params = params || {}
    },
    getModel: function(modelName) {
        var self = this
        return this.promiseModels.then(function(models) {
            return models[modelName || self.modelName]
        })
    },
    // 重复提交检测
    duplicateCheck: function (data, modelName) {
        var duplicate = this.params.duplicate
        var model = modelName || this.modelName
        if (!duplicate || !duplicate[model]) {
            return new Promise(function (resolve, reject) {
                resolve(true)
            })
        } else {
            // array
            var conditions = {}
            duplicate[model].forEach(function (v, i) {
                if (common.isDefined(data[v])) {
                    conditions[v] = data[v]
                }
            })
            var params = {
                conditions: conditions,
                projection: '_id'
            }
            return this._read(params).then(function(result) {
                return new Promise(function (resolve, reject) {
                    if (result && result.length) {
                        reject(result[0])
                    } else {
                        resolve(true)
                    }
                })
            })
        }
    },
    // 查询条件 limit skip sort 等
    optionsFielter: function (query) {
        var result = {}
        if (query._limit && query._page) {
            var limit = parseInt(_limit, 10)
            var skip = (page - 1) * limit
            result[limit] = limit
            result[skip] = skip
        }
        return result
    },
    // 字段过滤 查询的时候需要
    projectionTransition: function (projection, index) {
        var temp = projection.split('|')
        return temp[index] ? temp[index].replace(/,/g, ' ') : null
    },
    // 处理数据 统一数据返回格式
    processor: function (value) {
        return {
            result: value,
            processor: this.params.processor
        }
    },
    // 联表创建
    /*
     * data 依赖于 depend，会等待dependData插入完成之后才插入data
     * dependChain 参数格式 [{ model: 'xxx', data: '' }, ...]
     * */
    /*_createConnection: function (dependChain, params) {

    },
    // 一对一联表查询
    // conditions 参数格式 [{ model: 'xxx', data: '' }] 后一个查询依赖前一个查询
    _readOneToOne: function (conditions, params) {

    },
    // 一对多联表查询
    _readOneToMany: function (conditions, params) {

    },*/
    _create: function (data, modelName) {
        return this.getModel(modelName).then(function(model) {
            return model.create(data)
        })
    },
    _delete: function(conditions) {
        return this.getModel().then(function(model) {
            return model.remove(conditions)
        })
    },
    _update: function(conditions, data, modelName) {
        return this.getModel(modelName).then(function(model) {
            return model.update(conditions, data)
        })
    },
    _read: function(params, modelName) {
        return this.getModel(modelName).then(function(model) {
            // projection 字段 options 分页排序等条件
            return model.find(params.conditions, params.projection, params.options)
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
    createMasterSlaveMap: function (data, waitingMap, slave) {
        var self = this
        var slaveData = data[slave]
        return common.promiseParsingMap(waitingMap, this.promiseModels).then(function (map) {
            var promiseMaster = this.duplicateCheck(data).then(function() {
                return self._create(common.filterKey(data, slave), map.master)
            })
            var promiseSlave = this.duplicateCheck(data, map.slave).then(function() {
                return self._create(slaveData, map.slave)
            })
            // 插入 master slave 数据
            return Promise.all([
                promiseMaster,
                promiseSlave
            ]).then(function (resultAll) {
                var insertedMaster = resultAll[0]
                var insertedSlave = resultAll[1]
                var d = []
                insertedSlave.forEach(function (v, i) {
                    var doc = {}
                    doc[map.masterId] = insertedMaster._id
                    doc[map.slaveId] = v._id
                    doc[map.contactField] = map.slave
                    d.push(doc)
                })
                // 插入关联数据
                return self._create(d, map.mapCollectionName)
            })
        })
    },
    createSlaveMap: function (data, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this.promiseModels).then(function (map) {
            return this.duplicateCheck(data).then(function() {
                // 插入 slave 数据
                var d = common.filterKey(data, map.masterId)
                return self._create(d).then(function (resultSlave) {
                    var doc = {}
                    doc[map.masterId] = data[map.masterId]
                    doc[map.slaveId] = resultSlave._id
                    doc[map.contactField] = map.slave
                    // 插入关联数据
                    return self._create(doc, map.mapCollectionName)
                })
            })
        })
    },
    create: function (req) {
        var data = req.body
        var slave = req.query._slave
        var waitingMap = req.query._map
        if (waitingMap) {
            if (slave) {
                return this.createMasterSlaveMap(data, waitingMap, slave).then(function (result) {
                    return this.processor(result)
                })
            } else {
                return this.createSlaveMap(data, waitingMap).then(function (result) {
                    return this.processor(result)
                })
            }
        } else {
            return this.duplicateCheck(data).then(function() {
                return this._create(data).then(function(result) {
                    return this.processor(result)
                })
            })
        }
    },
    delete: function (req) {},
    updateOnetoOne: function (conditions, data, map) {

    },
    updateOnetoMany: function () {},
    update: function (req) {
        var query = req.query
        var data = req.body
        var map = query._map // 是否使用联表查询
        var pattern = query._pattern // 查询模式 一对一 || 一对多
        if (map) {
            if (!pattern || pattern === 'onetoone') {
                return this.updateOnetoOne(query, data, map).then(function (result) {
                    return this.processor(result)
                })
            } else if (pattern === 'onetomany') {
                return this.updateOnetoMany(query, data, map).then(function (result) {
                    return this.processor(result)
                })
            }
        } else {
            return this._update(query, data).then(function (result) {
                return this.processor(result)
            })
        }
    },
    readParams: function (query, projectionIndex) {
        return {
            conditions: common.filterReserved(query),
            projection: this.projectionTransition(query._projection, projectionIndex || 0),
            options: this.optionsFielter(query)
        }
    },
    readOnetoOne: function (query, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this.promiseModels).then(function (map) {
            var params = this.readParams(query)
            return self._read(params).then(function (result) {
                if (result.length) {
                    var json = common.mix({}, result[0]._doc)
                    var mapParams = {
                        conditions: {}
                    }
                    mapParams.conditions[map.slaveId] = json._id
                    return self._read(mapParams, map.mapCollectionName).then(function (resultMap) {
                        if(resultMap && resultMap.length) {
                            var masterParams = {
                                conditions: {},
                                projection: this.projectionTransition(query._projection, 1) || '_id'
                            }
                            masterParams.conditions['_id'] = resultMap[0][map.masterId]
                            return self._read(masterParams, map.master).then(function (resultMaster) {
                                var singleMaster
                                if(resultMaster && resultMaster.length) {
                                    singleMaster = resultMaster[0]
                                    for (var key in singleMaster) {
                                        if(key === '_id') {
                                            json[map.masterId] = singleMaster[key]
                                        } else {
                                            json[map.master + common.upperFirstLetter(key)] = singleMaster[key]
                                        }
                                    }
                                }
                                return json
                            })
                        } else {
                            console.log('apicreater readOnetoOne map null')
                            return json
                        }
                    })
                } else {
                    console.log('apicreater readOnetoOne null')
                    return null
                }
            })
        })
    },
    readOnetoMany: function (conditions, query) {

    },
    readSimple: function(query) {
        var params = this.readParams(query)
        return this._read(params)
    },
    read: function (req) {
        var query = req.query
        var map = query._map // 是否使用联表查询
        var pattern = query._pattern // 查询模式 一对一 || 一对多
        var single = query._single // 是否返回单条数据
        if (this.params.processor && common.isUndefined(this.params.processor.single) && common.isDefined(single)) {
            this.params.processor.single = single
        }
        if (map) {
            if (!pattern || pattern === 'onetoone') {
                return this.readOnetoOne(query, map).then(function (result) {
                    return this.processor(result)
                })
            } else if (pattern === 'onetomany') {
                return this.readOnetoMany(query, map).then(function (result) {
                    return this.processor(result)
                })
            }
        } else {
            return this.readSimple(query).then(function (result) {
                return this.processor(result)
            })
        }
    }
})
module.exports = API