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