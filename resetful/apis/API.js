var common = require('../../system/common')
var config = require('../../system/config')
var msgs = config[config.lang]
var DbClass = require('../../system/DbClass')

var APIs = DbClass.extend({
    ctor: function() {
        this._super('api')
        return this
    },
    read: function(req, res) {
        var isSingle = common.renameKey(req.params, { _id: 'id' })._id ? true : false
        this._super.read.call(this, req, res, isSingle)
    },
    create: function(req, res) {
        var duplicateConditions = {
            uri: req.body.uri,
            method: req.body.method,
            owner: req.body.owner
        }
        this._super._create.call(this, req, res, duplicateConditions)
    }
})
module.exports = APIs

/*
var models = require('../../system/models')
var apis = common.CURD(models, 'API')
common.mix(apis, {
    read: function(req, res) {
        var isSingle = common.renameKey(req.params, { _id: 'id' })._id ? true : false
        apis._read(req, res, isSingle)
    },
    create: function(req, res) {
        var query = {
            uri: req.body.uri,
            method: req.body.method,
            owner: req.body.owner
        }
        apis._create(req, res)
    }
})
module.exports = apis*/
