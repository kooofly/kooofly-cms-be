var Class = require('../system/Class')
//var models = require('./models')
var promiseModels = require('../system/promiseModels')
var common = require('../system/common')
var config = require('../system/config')
var msgs = config[config.lang]

var API = Class.extend({
    _promiseModels: promiseModels,
    mapMethod: {
        GET: 'read',
        POST: 'create',
        PUT: 'update',
        DELETE: 'delete'
    },
    ctor: function(modelName, params, options) {
        // this._initFn(options.fns)
        // this.__v = options.__v
        this.modelName = modelName
        this.model = this._promiseModels.then(function(models) {
            return models[modelName]
        })
        this.params = params || {}
        // TODO DEBUG 数据
        var self = this
        var array = ['read', 'create', 'update', 'delete']
        var tips = modelName + ': '
        array.forEach(function (v, i) {
            tips += v + ':' + (typeof self[v]) + ' | '
        })
        console.log('ApiCreater', tips)
    },
    // 权限 api控制相关 设置方法集
    _initFn: function (fns) {
        if (!fns) return
        var self = this
        var fnObject = (function () {
            var result = {}
            fns.split(',').forEach(function (v, i) {
                var key = v.toUpperCase()
                if (self.mapMethod[key]) {
                    result[self.mapMethod[key]] = 1
                } else {
                    // 过滤 第一个字符是 _ 的单词 防止调用私有方法
                    if (!/^_{1}/.test(v)) {
                        result[v] = 1
                    }
                }
            })
            return result
        })()

        var myFn = ['read', 'create', 'update', 'delete']
        myFn.forEach(function (v, i) {
            if (!fnObject[v]) {
                self[v] = null
            }
        })
    },
    _getModel: function(modelName) {
        var self = this
        return this._promiseModels.then(function(models) {
            return models[modelName || self.modelName]
        })
    },
    // 重复提交检测
    _duplicateCheck: function (data, modelName) {
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
    _optionsFielter: function (query) {
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
    _projectionTransition: function (projection, index) {
        var temp = projection && projection.split('|')
        return temp && temp[index] ? temp[index].replace(/,/g, ' ') : null
    },
    // 处理数据 统一数据返回格式
    _processor: function (value) {
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
        return this._getModel(modelName).then(function(model) {
            return model.create(data)
        })
    },
    _delete: function(conditions) {
        return this._getModel().then(function(model) {
            return model.remove(conditions)
        })
    },
    _update: function(conditions, data, modelName) {
        return this._getModel(modelName).then(function(model) {
            return model.update(conditions, data)
        })
    },
    _read: function(params, modelName) {
        return this._getModel(modelName).then(function(model) {
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
    _createMasterSlaveMap: function (data, waitingMap, slave) {
        var self = this
        var slaveData = data[slave]
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var promiseMaster = this._duplicateCheck(data).then(function() {
                return self._create(common.filterKey(data, slave), map.master)
            })
            var promiseSlave = this._duplicateCheck(data, map.slave).then(function() {
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
    _createSlaveMap: function (data, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            return this._duplicateCheck(data).then(function() {
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
                return this._createMasterSlaveMap(data, waitingMap, slave).then(function (result) {
                    return this._processor(result)
                })
            } else {
                return this._createSlaveMap(data, waitingMap).then(function (result) {
                    return this._processor(result)
                })
            }
        } else {
            return this._duplicateCheck(data).then(function() {
                return this._create(data).then(function(result) {
                    return this._processor(result)
                })
            })
        }
    },
    delete: function (req) {},
    _updateOnetoOne: function (conditions, data, map) {

    },
    _updateOnetoMany: function (conditions, data, map) {

    },
    update: function (req) {
        var query = req.query
        var data = req.body
        var map = query._map // 是否使用联表查询
        var pattern = query._pattern // 查询模式 一对一 || 一对多
        if (map) {
            if (!pattern || pattern === 'onetoone') {
                return this._updateOnetoOne(query, data, map).then(function (result) {
                    return this._processor(result)
                })
            } else if (pattern === 'onetomany') {
                return this._updateOnetoMany(query, data, map).then(function (result) {
                    return this._processor(result)
                })
            }
        } else {
            return this._update(query, data).then(function (result) {
                return this._processor(result)
            })
        }
    },
    _readParams: function (query, projectionIndex) {
        return {
            conditions: common.filterReserved(query),
            projection: this._projectionTransition(query._projection, projectionIndex || 0),
            options: this._optionsFielter(query)
        }
    },
    _readOnetoOne: function (query, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var params = this._readParams(query)
            return self._read(params).then(function (result) {
                if (result.length) {
                    var json = common.mix({}, result[0]._doc)
                    var mapParams = {
                        conditions: {}
                    }
                    mapParams.conditions[map.slaveId] = json._id
                    return self._read(mapParams, map.mapCollectionName).then(function (resultMap) {
                        if (resultMap && resultMap.length) {
                            var masterParams = {
                                conditions: {},
                                projection: this._projectionTransition(query._projection, 1) || '_id'
                            }
                            masterParams.conditions['_id'] = resultMap[0][map.masterId]
                            return self._read(masterParams, map.master).then(function (resultMaster) {
                                var singleMaster
                                if(resultMaster && resultMaster.length) {
                                    singleMaster = resultMaster[0]
                                    for (var key in singleMaster) {
                                        if (key === '_id') {
                                            json[map.masterId] = singleMaster[key]
                                        } else {
                                            json[map.master + common.upperFirstLetter(key)] = singleMaster[key]
                                        }
                                    }
                                }
                                return json
                            })
                        } else {
                            console.log('apicreater _readOnetoOne map null')
                            return json
                        }
                    })
                } else {
                    console.log('apicreater _readOnetoOne null')
                    return null
                }
            })
        })
    },
    _readOnetoMany: function (query, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var params = this._readParams(query)
            return self._read(params).then(function (result) {
                if(result.length) {
                    var json = common.mix({}, result[0]._doc)
                    var mapParams = {
                        conditions: {}
                    }
                    mapParams.conditions[map.masterId] = json._id
                    return self._read(mapParams, map.mapCollectionName).then(function (resultMap) {
                        if (resultMap && resultMap.length) {
                            var slaveParams = {
                                conditions: [],
                                projection: this._projectionTransition(query._projection, 1)
                            }
                            resultMap.forEach(function (v, i) {
                                slaveParams.conditions.push(v['_id'])
                            })
                            return self._read(slaveParams, map.slave).then(function (resultSlave) {
                                if (resultSlave && resultSlave.length) {
                                    json[map.slave] = resultSlave
                                }
                                return json
                            })
                        } else {
                            return json
                        }
                    })
                } else {
                    console.log('apicreater _readOnetoMany null')
                    return null
                }
            })
        })
    },
    _readSimple: function(query) {
        var params = this._readParams(query)
        return this._read(params)
    },
    read: function (req) {
        var self = this
        var query = req.query
        var map = query._map // 是否使用联表查询
        var pattern = query._pattern // 查询模式 一对一 || 一对多
        var single = query._single // 是否返回单条数据
        // 服务器端配置覆盖客户端配置
        // TODO 优化 findOne
        if (this.params.processor && common.isUndefined(this.params.processor.single) && common.isDefined(single)) {
            this.params.processor.single = single
        } else {
            if (common.isDefined(single)) {
                if (!this.params.processor) {
                    this.params.processor = {}
                }
                this.params.processor['single'] = single
            }
        }
        if (map) {
            if (!pattern || pattern === 'onetoone') {
                return this._readOnetoOne(query, map).then(function (result) {
                    return self._processor(result)
                })
            } else if (pattern === 'onetomany') {
                return this._readOnetoMany(query, map).then(function (result) {
                    return self._processor(result)
                })
            }
        } else {
            return this._readSimple(query).then(function (result) {
                return self._processor(result)
            })
        }
    },
    _install: function (data, key, isRemoveAll) {
        var self = this
        var installer = function () {
            return self._create(data).then(function () {
                return key
            })
        }
        if (isRemoveAll) {
            return self._delete({}).then(function () {
                return installer()
            })
        } else {
            return installer()
        }
    }
})
module.exports = API