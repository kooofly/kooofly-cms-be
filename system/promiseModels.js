var mongoose = require('mongoose');
var db = require('./db')
var Schema = mongoose.Schema
var coreDataReady = require('./coreData').promiseData
var common = require('./common')
function model(name, schemaOption) {
    var sc = new Schema(schemaOption)
    mongoose.model(name, sc, name.toLowerCase())
}

function map(v) {
    var result = null
    switch(v) {
        case 'string':
        case 'String':
            result = String
            break;
        case 'ObjectId':
            result = Schema.Types.ObjectId
            break;
        case 'Number':
            result = Number
            break;
        case 'Date':
            result = Date
            break;
        case 'Boolean':
            result = Boolean
            break;
        case 'Object':
            result = Object
            break;
    }
    return result
}

function defaultMap(v) {
    var result;
    switch(v) {
        case 'Date.now':
            result = Date.now
            break;
    }
    return result
}

function createModel(collectionName, fields) {
    var schemaOption = {}
    fields.forEach(function(v, i) {
        var name = v.name,
            attribute
        // isExternal 是否是外部的字段（类似外键，但没有作外键约束）
        if (v.attribute && !v.isExternal) {
            attribute = common.mix({}, v.attribute)
            attribute.type = map(attribute.type)
            if(attribute.default) {
                attribute.default = defaultMap(attribute.default)
            }
            schemaOption[name] = attribute
        }
    })
    model(collectionName, schemaOption)
}
//////////////////////////////////////////核心底层
//Dynamic Collection 动态集合
model('dynamiccollection', {
    name: { type: String, required: true }, //模型名称 显示用
    collectionName: { type: String, required: true }, //集合名称
    isEnable: { type: Boolean, required: true },
    lastModifyTime: { type: Date, default: Date.now },
    fields: { type: Array } //一对多
})

function  getMOdelFromCore() {
    return coreDataReady.then(function(result) {
        result.forEach(function(v, i) {
            var collectionName = v.collectionName
            if(collectionName === 'dynamiccollection') return
            createModel(collectionName, v.fields)
        })
        return db.connections[0].models
        // return db.models
    })
}

function  getMOdelFromDb() {
    return db.models['dynamiccollection'].find({}).then(function(result) {
        result.forEach(function(v, i) {
            var collectionName = v.collectionName
            if(collectionName === 'dynamiccollection') return
            createModel(collectionName, v.fields)
        })
        return db.models
    })
}

var promiseModel = getMOdelFromCore()

module.exports = promiseModel