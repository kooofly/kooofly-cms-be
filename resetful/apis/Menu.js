var common = require('../../system/common')
var config = require('../../system/config')
var msgs = config[config.lang]
var DbClass = require('../../system/DbClass')

var APIs = DbClass.extend({
    ctor: function() {
        this._super('catagory')
    },
    read: function(req, res) {
        var isSingle = common.renameKey(req.params, { _id: 'id' })._id ? true : false
        var mockReq = {
            query: common.mix({}, req.query, { type: 'menu' }),
            params: req.params
        }
        this._super.read.call(this, mockReq, res, isSingle)
    },
    create: function(req, res) {
        var duplicateConditions = {
            parentId: req.body.parentId,
            name: req.body.name,
        }
        this._super.create.call(this, req, res, duplicateConditions)
    }
})

module.exports = APIs
/*
var models = require('../../system/models')
var apis = common.CURD(models, 'Catagory')
common.mix(apis, {
    read: function(req, res) {
        var query = common.mix({ type: 'menu' }, req.query),
            params = req.params
        var promiseCatagory,
            promiseDynamicCollection,
            promiseMapCatagoryDynamicCollection
        if(!common.isEmptyObject(params)) {
            promiseCatagory = common.promiseGet('Catagory', common.renameKey(params, { _id: 'id' }))
            promiseDynamicCollection = common.promiseGet('DynamicCollection', {})
            promiseMapCatagoryDynamicCollection = common.promiseGet(
                'MapCatagoryDynamicCollection',
                common.renameKey(params, { catagoryId: 'id' })
            )

            Promise.all([
                promiseCatagory,
                promiseDynamicCollection,
                promiseMapCatagoryDynamicCollection
            ]).then(function(result) {
                var catagory = result[0][0], dynamicCollection = result[1], mapCatagoryDynamicCollection = result[2]
                var collections = (function() {
                    var result = []
                    dynamicCollection.forEach(function(item, index) {
                        var o = { text: item.name, value: item._id }
                        mapCatagoryDynamicCollection.forEach(function(v, i) {
                            if(v.dynamicCollectionId.toString() === item._id.toString()) {
                                o.checked = true
                                return false
                            }
                        })
                        result.push(o)
                    })
                    return result
                })()
                var o = common.mix({ collections: collections }, catagory._doc)
                res.json(o)
            }).catch(function(err) {
                res.json(err)
            })
        } else {
            promiseCatagory = common.promiseGet('Catagory', query)
            promiseCatagory.then(function(result) {
                res.json(result)
            }).catch(function(err) {
                res.json(err)
            })
        }
    }
})
module.exports = apis*/
