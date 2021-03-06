var common = require('../../system/common')
var config = require('../../system/config')
var msgs = config[config.lang]
var API = require('../ApiCreater')

var APIs = API.extend({
    ctor: function(modelName, params, options) {
        this._super('catagory', params, options)
    },
    read: function(req) {
        // var isSingle = common.renameKey(req.params, { _id: 'id' })._id ? true : false
        common.mix(req.query, { type: null })
        return this._super.read.call(this, req)
    }
})

module.exports = APIs