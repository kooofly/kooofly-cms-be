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
        this._super.read.call(this, req, res)
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
