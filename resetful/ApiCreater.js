var Class = require('../system/Class')
//var models = require('./models')
var promiseModels = require('../system/promiseModels')
var common = require('../system/common')
var config = require('../system/config')
var msgs = config[config.lang]
var db = require('../system/db')

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
        this.__v = options && options.__v
        this.modelName = modelName
        this.model = this._promiseModels.then(function(models) {
            return models[modelName]
        })
        this._paramsInit(params)
        // TODO DEBUG 数据
        var self = this
        var array = ['read', 'create', 'update', 'delete']
        var tips = modelName + ': '
        array.forEach(function (v, i) {
            tips += v + ':' + (typeof self[v]) + ' | '
        })
        console.log('ApiCreater ctor:', tips)
    },
    // 构建服务器端配置参数
    _paramsInit: function (params) {
        // processor、body、query、params 这些是公共配置 分发这些公共配置到相应的操作中
        var p = this.params = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {}
        }
        if (params) {
            params.get && (p.GET = params.get)
            params.post && (p.POST = params.post)
            params.put && (p.PUT = params.put)
            params.delete && (p.DELETE = params.delete)
            for (var k in p) {
                params.all && common.mix(p[k], params.all)
            }
        }
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
    /*
    * 简单设计 不考虑联表的情况
    * 联表的情况 需要一个对象或者是一个解析规则 如{ link: ['name'], catagory: ['_id'] } || ['name','catagoryId']
    * */
    _duplicateCheck: function (data) {
        var duplicate = this.params.POST.duplicate
        if (!duplicate || !duplicate.length) {
            return new Promise(function (resolve, reject) {
                resolve(true)
            })
        } else {
            // array
            var conditions = []
            data.forEach(function (o, i) {
                duplicate.forEach(function (v) {
                    conditions[i] = {}
                    if (common.isDefined(o[v])) {
                        conditions[i][v] = o[v]
                    }
                })
            })

            var params = {
                conditions: conditions
            }
            return this._read(params).then(function(result) {
                return new Promise(function (resolve, reject) {
                    if (result && result.length) {
                        reject(result)
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
            var limit = parseInt(query._limit, 10)
            var skip = (query._page - 1) * limit
            result['limit'] = limit
            result['skip'] = skip
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
            var options = (common.isEmptyObject(params.options) || !params.options) ? { sort: {
                sort: 1
            } } : params.options
            var projection = params.projection ? params.projection : '-lastModifyTime'
            return model.find(params.conditions, projection, options)
        })
    },
    /*
     * TODO 所有的增删改查都会出现操作失败（非代码bug引起的操作失败，比如：数据库服务器挂了），过程中要记录操作数据和状态。方便恢复正常后 继续执行未完成的操作
     * 1.【插master & slave】同时插入两个 返回的数据插入映射表 post /collection?_map=dyncoll_api&_insert=apis
     * 2.【插slave】知道masterId 插入slave 返回的slaveId 插入映射表 post /article?_map=cat_art&_masterId=catagoryId。
     * 如果3不存在 就不需要_masterId=catagoryId
     * 现在不考虑3的情况
     * 如果以后出现3的情况，则处理成：没有_masterId 则自动默认_masterId，这样做到兼容
     * 3.（可能不存在这个场景,先不考虑）知道slaveId 插入master，返回的masterId 插入映射表
     * */
    _createOnetoMany: function (data, waitingMap, slave) {
        var self = this
        var slaveData = data[slave]
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var promiseMaster = self._duplicateCheck(data).then(function() {
                return self._create(common.filterKey(data, slave), map.master)
            })
            var promiseSlave = self._duplicateCheck(data, map.slave).then(function() {
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
    _createOnetoOne: function (data, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            // 重复数据验证
            return self._duplicateCheck(data).then(function() {
                // 插入 slave 数据
                var d = common.batchFilterKey(data, map.masterId)
                return self._create(d).then(function (resultSlave) {
                    var mapData = []
                    resultSlave.forEach(function (v, i) {
                        var doc = {}
                        doc[map.masterId] = data[i][map.masterId]
                        doc[map.slaveId] = v._id
                        doc[map.contactField] = map.slave
                        mapData.push(doc)
                    })
                    // 插入关联数据
                    return self._create(mapData, map.mapCollectionName)
                })
            })
        })
    },
    // 批量的创建
    create: function (req) {
        this._mixServerConfig('POST', req)
        var self = this
        var body = req.body
        var slave = req.query._slave
        var waitingMap = req.query._map
        var data = common.isArray(body) ? body : [body]
        if (waitingMap) {
            // TODO 统一规则 OnetoOne OnetoMany createAndcreateSlave
            if (slave) {
                // 一对多
                /*return this._createOnetoMany(data, waitingMap, slave).then(function (result) {
                    return self._processor(result)
                })*/
            } else {
                // 一对一
                return this._createOnetoOne(data, waitingMap).then(function (result) {
                    return self._processor(result)
                })
            }
        } else {
            return this._duplicateCheck(data).then(function () {
                return self._create(data).then(function(result) {
                    return self._processor(result)
                })
            })
        }
    },
    // 删除数据 删除map
    _deleteAndDelMap: function (query, waitingMap) {
        var self = this
        return common.promiseApis(waitingMap, this._promiseModels).then(function (map) {
            var conditions = common.filterReserved(query)
            var keys = self.masterOrSlave(map)
            return self._delete(conditions).then(function (deleteResult) {
                console.log('ApiCreater _deleteAndDelMap:', deleteResult)
                var mapCondition = {}
                mapCondition[map[keys.meId]] = conditions._id
                // !map.slave 表示删除所有的slave
                if (map.slave) {
                    mapCondition[map.contactField] = map.slave
                }
                return self._delete(mapCondition)
            })
        })
    },
    // 考虑删除master数据同时删除slave数据的情况
    _deleteAndDelSlave: function (query, waitingMap) {
        var self = this
        return common.promiseApis(waitingMap, this._promiseModels).then(function (map) {
            var conditions = common.filterReserved(query)
            var keys = self.masterOrSlave(map)
            return self._delete(conditions).then(function (deleteResult) {
                console.log(deleteResult)
                var mapCondition = {}
                mapCondition[map[keys.meId]] = conditions._id
                // !map.slave 表示删除所有的slave
                if (map.slave) {
                    mapCondition[map.contactField] = map.slave
                }
                return self._read({
                    conditions: conditions
                }, map.mapCollectionName).then(function (mapResult) {
                    if (map.slave) {
                        var waitingDel = []
                        mapResult.forEach(function (v, i) {
                            var o = {}
                            o['_id'] = v[map[keys.heId]]
                            waitingDel.push(o)
                        })
                        return self._delete(waitingDel)
                    } else {
                        var promises = []
                        // 一个master 可能对应有不同model的数据  比如 catagory 对应 link article 等内容模型，所以要分组删除
                        var group = {}
                        mapResult.forEach(function (v, i) {
                            var waitingModel = group[v[map.contactField]]
                            var o = {}
                            o['_id'] = v[map[keys.heId]]
                            if (!waitingModel) {
                                group[v[map.contactField]] = []
                            }
                            group[v[map.contactField]].push(o)
                        })
                        for (var key in group) {
                            promises.push(self._delete(group[key], key))
                        }
                        return Promise.all(promises)
                    }

                })
            })
        })
    },
    delete: function (req) {
        this._mixServerConfig('DELETE', req)
        var self = this
        var query = req.query
        // map 可能是  catagory_all_content 这个表示删除不同model的所有映射 这个只能用于 删除 master 然后删除 map
        // map = catagory_link_content || coll_api 表示删除对应model的数据 这个可以用于删除master 然后删除 map 也可以用于删除 slave 然后删除 map
        var map = query._map
        // 这里的pattern只有deleteslave可选
        var pattern = query._pattern
        if (map) {
            //
            if (pattern === 'deleteslave') {
                return this._deleteAndDelSlave(query, map).then(function (result) {
                    return self._processor(result)
                })
            } else {
                return this._deleteAndDelMap(query, map).then(function (result) {
                    return self._processor(result)
                })
            }
        } else {
            return this._delete(query).then(function (result) {
                return self._processor(result)
            })
        }
    },
    // 判断当前的主要操作model是master还是slave
    masterOrSlave: function (map) {
        return this.modelName === map.master ? {
            me: 'master',
            meId: 'masterId',
            he: 'slave',
            heId: 'slaveId'
        } : {
            me: 'slave',
            meId: 'slaveId',
            he: 'master',
            heId: 'masterId'
        }
    },
    // 1.更新slave 2.更新map 现在暂时只支持这中情况 要支持多种情况 见 _updateOnetoMany masterOrSlave的用法
    _updateOnetoOne: function (conditions, data, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var slaveData = common.filterKey(data, map.masterId)
            return self._update({ _id: slaveData._id }, slaveData).then(function () {
                var mapCondition = {}
                mapCondition[map.slaveId] = slaveData._id
                mapCondition[map.contactField] = map.slave
                var doc = {}
                doc[map.masterId] = data[map.masterId]
                doc[map.slaveId] = slaveData._id
                doc[map.contactField] = map.slave
                return self._update(mapCondition, doc, map.mapCollectionName)
            })
        })
    },
    // 只更新当前model和map 遇到需要真实删除关联数据的 就在页面中设计真实删除操作，简化通用设计的复杂度，如果确实需要删除关联数据的情况，则定制api也可以
    // 1.更新master 2.更新map（只添加新数据）
    /*
    * 添加时，使用添加 这里不考虑，更新时，场景：
    * 1.collection api
    *   删除一条api 由前端控件group-api提供删除接口，真实删除
    *   修改一条api 由前端控件group-api提供修改接口，真实修改
    *   添加一条api 由这个方法添加，所以这里只需要添加新数据就可以
    * 2. catagory link 多对多
    *   删除一条catagory 由前端控件【多选catagory-tree】提供删除接口，删除映射
    *   前端控件不提供修改catagory功能 控件类似 多选的 select2 选中时，生成一个带×的标签，所以没有修改功能
    *   添加一条catagory 由这个方法添加，所以这里只需要添加新数据就可以
    * */
    //
    _updateOnetoMany: function (conditions, data, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var keys = self.masterOrSlave(map)
            var needFilter = map[keys.he] // 需要过滤的字段 不属于本model的字段，另一个表的字段
            var data = common.filterKey(data, needFilter)
            return this._update({_id: data._id}, data).then(function () {
                var doc = (function() {
                    var r = []
                    data[needFilter].forEach(function (v, i) {
                        if (!v._id) {
                            r.push(v)
                        }
                    })
                    return r
                })()
                return this._create(doc, map.mapCollectionName)
            })
        })
    },
    update: function (req) {
        this._mixServerConfig('PUT', req)
        var self = this
        var query = req.query
        var data = req.body
        var map = query._map // 是否使用联表更新
        var pattern = query._pattern // 更新模式 一对一 || 一对多
        if (map) {
            if (!pattern || pattern === 'onetoone') {
                return this._updateOnetoOne(query, data, map).then(function (result) {
                    return self._processor(result)
                })
            } else if (pattern === 'onetomany') {
                return this._updateOnetoMany(query, data, map).then(function (result) {
                    return self._processor(result)
                })
            }
        } else {
            return this._update(query, data).then(function (result) {
                return self._processor(result)
            })
        }
    },
    // 添加更新和删除数据的时候用服务器端参数覆盖客户端参数，保证数据操作的正确性，查询的时候 用客户端参数 覆盖 服务器端参数，保证查询的灵活性
    // 更新有时候可能也需要灵活性 因为有时候只更新某些字段 比如只更新排序
    _mixServerConfig: function(type, req) {
        var p = this.params[type]
        switch (type) {
            case 'GET':
                p.query && (req.query = common.mix({}, p.query, req.query))
                break;
            case 'POST':
                var paramsDuplicate = []
                var reqDuplicate = []
                if(p.query && p.query.duplicate) {
                    paramsDuplicate = p.query.duplicate.split(',')
                }
                if(req.query.duplicate) {
                    reqDuplicate = req.query.duplicate.split(',')
                }
                p.query && common.mix(req.query, p.query)
                p.body && common.mix(req.body, p.body)
                p.params && common.mix(req.params, p.params)
                if( (p.query && p.query.duplicate) || req.query.duplicate) {
                    this.params.POST.duplicate = paramsDuplicate.concat(reqDuplicate)
                }
            default:
                p.query && common.mix(req.query, p.query)
                p.body && common.mix(req.body, p.body)
                p.params && common.mix(req.params, p.params)
                ;
        }
    },
    //
    _readParams: function (query, projectionIndex) {
        var conditions = common.filterReserved(query)
        return {
            conditions: conditions,
            projection: this._projectionTransition(query._projection, projectionIndex || 0),
            options: this._optionsFielter(query)
        }
    },
    _readOnetoOne: function (query, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var params = self._readParams(query)
            return self._read(params).then(function (result) {
                if (result.length) {
                    var json = common.mix({}, result[0]._doc)
                    var mapParams = {
                        conditions: {}
                    }
                    mapParams.conditions[map.slaveId] = json._id
                    return self._read(mapParams, map.mapCollectionName).then(function (resultMap) {
                        if (resultMap && resultMap.length) {
                            var projection = self._projectionTransition(query._projection, 1) || '_id'
                            var masterParams = {
                                conditions: {},
                                projection: projection
                            }
                            masterParams.conditions['_id'] = resultMap[0][map.masterId]
                            json[map.masterId] = resultMap[0][map.masterId]
                            if (projection === '_id') {
                                return json
                            } else {
                                return self._read(masterParams, map.master).then(function (resultMaster) {
                                    var singleMaster
                                    if(resultMaster && resultMaster.length) {
                                        singleMaster = resultMaster[0]._doc
                                        for (var key in singleMaster) {
                                            if (key !== '_id') {
                                                json[map.master + common.upperFirstLetter(key)] = singleMaster[key]
                                            }
                                        }
                                    }
                                    return json
                                })
                            }
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
    // 只接受 类似catagoryId 这样的参数查询  不接受 catagoryName 这样的查询，如果一定需要cataogryName参数 就使用定制的多次查询，先由catagoryName查询出catagoryId 然后 再执行此方法
    _readOnetoMany: function (query, waitingMap) {
        var self = this
        return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
            var mapParams = {
                conditions: {},
                options: self._optionsFielter(query)
            }
            mapParams.conditions[map.masterId] = query[map.masterId]
            return self._read(mapParams, map.mapCollectionName).then(function (resultMap) {
                if (resultMap && resultMap.length) {
                    var params = common.filterReserved(common.filterKey(query, map.masterId))
                    var slaveParams = {
                        conditions: { _id: { $in: [] } },
                        projection: self._projectionTransition(query._projection, 1)
                    }
                    resultMap.forEach(function (v, i) {
                        slaveParams.conditions._id.$in.push(v[map.slaveId])
                    })
                    common.mix(slaveParams.conditions, params)
                    return self._read(slaveParams, map.slave).then(function (resultSlave) {
                        if (resultSlave && resultSlave.length) {
                            return resultSlave
                        } else {
                            return []
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
        this._mixServerConfig('GET', req)
        var self = this
        var query = req.query
        var waitingMap = query._map // 是否使用联表查询
        var pattern = query._pattern // 查询模式 一对一 || 一对多
        var single = query._single // 是否返回单条数据
        // 服务器端配置覆盖客户端配置
        // TODO 优化 findOne
        if (this.params.processor && common.isUndefined(this.params.processor.single) && common.isDefined(single)) {
            this.params.processor.single = single
        } else {
            if (!this.params.processor) {
                this.params.processor = {}
            }
            this.params.processor['single'] = single
        }
        if (waitingMap) {
            if (!pattern || pattern === 'onetoone') {
                return this._readOnetoOne(query, waitingMap).then(function (result) {
                    return self._processor(result)
                })
            } else if (pattern === 'onetomany') {
                return common.promiseParsingMap(waitingMap, this._promiseModels).then(function (map) {
                    if (!query[map.masterId]) {
                        return self._readSimple(query).then(function (result) {
                            return self._processor(result)
                        })
                    } else {
                        return self._readOnetoMany(query, waitingMap).then(function (result) {
                            return self._processor(result)
                        })
                    }
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
            return self.create({
                body: data,
                query: {},
                params: {}
            }).then(function () {
                return key
            })
        }
        if (isRemoveAll && !global.isDropAll) {
            global.isDropAll = true
            var collections = ['api', 'catagory', 'dynamiccollection', 'mapcatagorycontent', 'mapcatagorydynamiccollection', 'menu', 'roles', 'systemconfig', 'link', 'page']
            var promiseRemove = []
            collections.forEach(function (v) {
                promiseRemove.push(db.connections[0].db.dropCollection(v))
            })
            return Promise.all(promiseRemove).then(function (result) {
                return installer()
            }, function (err) {
                return installer()
            })
        } else {
            return installer()
        }
    }
})
module.exports = API