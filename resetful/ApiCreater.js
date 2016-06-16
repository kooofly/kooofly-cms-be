var Class = require('../system/Class')
//var models = require('./models')
var promiseModels = require('../system/promiseModels')
var common = require('../system/common')
var config = require('../system/config')
var msgs = config[config.lang]

var API = Class.extend({
    promiseModels: promiseModels,
    ctor: function(modelName) {
        this.modelName = modelName
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
    _create: function (data) {
        return this.getModel().then(function(model) {
            return model.create(data)
        })
    },

    // 联表创建
    /*
    * data 依赖于 depend，会等待dependData插入完成之后才插入data
    * dependChain 参数格式 [{ model: 'xxx', data: '' }, ...]
    * */
    _createConnection: function (dependChain, params) {

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
    // 一对一联表查询
    // conditions 参数格式 [{ model: 'xxx', data: '' }] 后一个查询依赖前一个查询
    _readOneToOne: function (conditions, params) {

    },
    // 一对多联表查询
    _readOneToMany: function (conditions, params) {

    },
    // 分页查询
    _readLimit: function (conditions, skip, limit) {

    },
    _delete: function(conditions) {
        return this.getModel().then(function(model) {
            return model.remove(conditions)
        })
    },
    // 重复提交检测
    duplicateCheck: function (data, duplicateConditions) {

    },
    // 字段过滤 查询的时候需要
    fieldsFilter: function () {

    },
    read: function (req, res) {},
    create: function (req, res) {},
    update: function (req, res) {},
    delete: function (req, res) {}
})
module.exports = API