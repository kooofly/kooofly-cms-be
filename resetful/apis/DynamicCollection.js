var common = require('../../system/common')
var config = require('../../system/config')
var msgs = config[config.lang]
var DbClass = require('../../system/DbClass')

var APIs = DbClass.extend({
    ctor: function() {
        this._super('dynamiccollection')
    },
    read: function(req, res) {
        var query = req.query,
            params = req.params
        var conditions = params && params.id ? {_id: params.id} : query
        var promiseCollection = this._super._read.call(this, conditions),
            promiseAPIs, co

        if(!common.isEmptyObject(params)) {
            co = common.renameKey(params, { _creator: 'id' })
            promiseAPIs = this.models['api'].find(co)
            Promise.all([
                promiseCollection,
                promiseAPIs
            ]).then(function(result) {
                var collection = result[0][0], fields = result[1], apis = result[2]
                collection.fields = fields
                collection.apis = apis
                res.json(collection._doc)
            }).catch(function(err) {
                res.json(err)
            })
        } else {
            promiseCollection.then(function(result) {
                res.json(result)
            }).catch(function(err) {
                res.json(err)
            })
        }
    },
    create: function(req, res) {
        var self = this,
            duplicateConditions = {
                collectionName: req.body.collectionName
            },
            data = req.body
        this._super._read.call(this, duplicateConditions).then(function(result) {

                return new Promise(function(resolve, reject) {
                    if(result.length) {
                        reject({
                            message: msgs.dataExist,
                            collectionName: duplicateConditions.collectionName,
                            documentation_url: msgs.docUrl
                        })
                    } else {
                        resolve(data)
                    }
                })

        }).then(function(data) {
            var fields
            if (data.fields) {
                if (typeof data.fields === 'string') {
                    fields = JSON.parse(data.fields)
                } else {
                    fields = data.fields
                }
            } else {
                fields = []
            }
            if(!fields.length) {
                return new Promise(function(resolve, reject) {
                    reject({
                        message: msgs.fieldsMin,
                        documentation_url: msgs.docUrl
                    })
                })
            }
            //fields没有判断重复，前端判断重复
            return self._create(data)
        }).then(function(result) {
            var _creator = result._id,
                apis = data.apis ? JSON.parse(data.apis) : []
            if(apis.length) {
                apis.forEach(function(v, i) {
                    v._creator = _creator
                })
                return self.models['api'].create(apis)
            }
            res.json({
                message: msgs.success
            })
        }).then(function() {
            res.json({
                message: msgs.success
            })
        }).catch(function(err) {
            res.json(err)
        })
    }
})
module.exports = APIs

/*var models = require('../../system/models')
 var apis = common.CURD(models, 'DynamicCollection')*/
    /*common.mix(apis, {
        read: function(req, res) {
            var query = req.query,
                params = req.params
            var conditions = id ? {_id: id} : query
            var promiseCollection = common.promiseGet('DynamicCollection', conditions),
                promiseFields, promiseAPIs, co
            if(!common.isEmptyObject(params)) {
                co = common.renameKey(params, { _creator: 'id' })
                promiseFields = common.promiseGet('DynamicField', co)
                promiseAPIs = common.promiseGet('API', co)
                Promise.all([
                    promiseCollection,
                    promiseFields,
                    promiseAPIs
                ]).then(function(result) {
                    var collection = result[0][0], fields = result[1], apis = result[2]
                    collection.fields = fields
                    collection.apis = apis
                    res.json(collection._doc)
                }).catch(function(err) {
                    res.json(err)
                })
            } else {
                promiseCollection.then(function(result) {
                    res.json(result)
                }).catch(function(err) {
                    res.json(err)
                })
            }
        },
        create: function(req, res) {
            var query = {
                    parentId: req.body.parentId,
                    name: req.body.name,
                },
                data = req.body
            if(query) {
                common.promiseGet('DynamicCollection', query).then(function(result) {
                    if(result.length) {
                        return new Promise(function(resolve, reject) {
                            reject({
                                message: 'API exist, you can update this API',
                                documentation_url: 'http://developer.kooofly.com/v1'
                            })
                        })
                    }
                    _create()
                }).catch(function(message) {
                    res.json(message)
                })
            } else {
                _create()
            }
            function _create() {
                return common.promiseCreate('DynamicCollection', data).then(function(result) {
                    var _creator = result._id,
                        fields = data.fields ? JSON.parse(data.fields) : [],
                        apis = data.apis ?  JSON.parse(data.apis) : [],
                        all = []
                    //fields没有判断重复，前端判断重复
                    if(fields.length) {
                        fields.forEach(function (v, i) {
                            v._creator = _creator
                        })
                        all.push(common.promiseCreate('DynamicField', fields))
                    }
                    //apis没有判断重复，前端判断重复
                    if(apis.length) {
                        apis.forEach(function(v, i) {
                            v._creator = _creator
                        })
                        all.push(common.promiseCreate('API', apis))
                    }
                    console.log(_creator)
                    return Promise.all(all)
                }).then(function(result) {
                    res.json(result)
                }).catch(function(message) {
                    res.json(message)
                })
            }
        }
    })*/

//module.exports = apis