var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost:27017/test');
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
/*
model('DynamicField', {
    _creator: { type: Schema.Types.ObjectId, require: true },
    name: { type: String, required: true },
    showFilter: { type: String }, //显示方式 显示过滤器  值为'empty'时 表示空, 不显示
    control: { type: String, default: 'text' }, //可选，有时候有的字段不用用户输入，比如lastModifyTime
    type: { type: String, required: true },
    isEnable: { type: Boolean, required: true }, //坏味道的设计，暂时删除，需要时再添加回来
    description: { type: String },
    sort: { type: Number },
    lastModifyTime: { type: Date, default: Date.now }
})
model('API', {
    _creator: { type: Schema.Types.ObjectId }, //集合id 可以为空
    parentId: { type: Schema.Types.ObjectId }, //父route id，用来表示嵌套路由
    name: { type: String }, //前端Vue具名路径字段 可选
    uri: { type: String, required: true },
    type: { type: String, required: true, default: 'api' }, // api || router
    method: { type: String, required: true },
    owner: { type: String, required: true }, //role public user
    isEnable: { type: Boolean, required: true },
    description: { type: String },
    sort: { type: Number },
    lastModifyTime: { type: Date, default: Date.now }
})

//////////////////////////////////////////基础模块 角色权限分类
model('User', {
    account: { type: String, required: true },
    password: { type: String, required: true },
    info: { type: Object }
})
model('Role', {
    name: { type: String, required: true },
    description: { type: String },
    sort: { type: Number },
    isEnable: { type: Boolean, required: true },
    lastModifyTime: { type: Date, default: Date.now }
})
model('Catagory', {
    parentId: { type: Schema.Types.ObjectId },
    alias: { type: String },
    type: { type: String },//menu
    name: { type: String, required: true },
    link: { type: String },
    logo: { type: String },
    isEnable: { type: Boolean, required: true },
    sort: { type: Number },
    info: { type: Object },
    lastModifyTime: { type: Date, default: Date.now }
    //allows:{ type: Array } 允许的模型
})

//////////////////////////////////////////内容
model('Link', {
    //catagoryId: { type: Schema.Types.ObjectId, required: true }, //多对多
    title: { type: String, required: true },
    link: { type: String, required: true },
    description: { type: String },
    openMode: { type: String },
    logo: { type: String },
    sort: { type: Number },
    isEnable: { type: Boolean, required: true },
    status: { type: String }, //草稿 待审 发布 等
    lastModifyTime: { type: Date, default: Date.now }
})
model('Article', {
    //catagoryId: { type: Schema.Types.ObjectId, required: true }, //多对多
    title: { type: String, required: true },
    digest: { type: String }, //摘要
    link: { type: String }, //性能考虑
    openMode: { type: String },
    logo: { type: String },
    content: { type: String },
    contentParser: { type: String }, //markdown html
    sort: { type: Number },
    isEnable: { type: Boolean, required: true },
    status: { type: String }, //草稿 待审 发布 等
    lastModifyTime: { type: Date, default: Date.now }
})
model('Tag', {
    name: { type: String, required: true },
    link: { type: String },
    openMode: { type: String },
    logo: { type: String },
    sort: { type: Number },
    isEnable: { type: Boolean, required: true },
    lastModifyTime: { type: Date, default: Date.now }
})

//////////////////////////////////////////映射关系
model('MapRoleCatagory', {
    roleId: { type: Schema.Types.ObjectId, required: true },
    catagoryId: { type: Schema.Types.ObjectId, required: true }
})
model('MapRoleAPI', {
    roleId: { type: Schema.Types.ObjectId, required: true },
    apiId: { type: Schema.Types.ObjectId, required: true }
})
//MapCatagoryArticle MapCatagoryLink MapCatagoryOther
model('MapCatagoryContent', {
    catagoryId: { type: Schema.Types.ObjectId, required: true },
    contentId: { type: Schema.Types.ObjectId, required: true },
    contentType: { type: String, required: true }
})
//内容Tag关系
model('MapContentTag', {
    contentId: { type: Schema.Types.ObjectId, required: true },
    tagId: { type: Schema.Types.ObjectId, required: true },
    contentType: { type: String, required: true }
})
//内容区域关系 MapWedigetArea
model('MapContentArea', {
    contentId: { type: Schema.Types.ObjectId, required: true },
    areaId: { type: Schema.Types.ObjectId, required: true },
    sort: { type: Schema.Types.ObjectId, required: true },
    contentType: { type: String, required: true },
    lastModifyTime: { type: Date, default: Date.now }
})

//////////////////////////////////////////用户体验 UI
model('Wediget', {
    name: { type: String, required: true  },
    code: { type: String, required: true  }, //调用wediget的code
    lastModifyTime: { type: Date, default: Date.now }
})
model('UserConfig', {
    dashboard: { type: Object },
    nav: { type: Object },
    sidebar: { type: Object }
})
model('Area', {
    name: { type: Object },
    limit: { type: Number }, //允许添加内容模型的个数
    lastModifyTime: { type: Date, default: Date.now }
})

//////////////////////////////////////////系统 日志 配置
model('SystemConfig', {
    code: { type: String },
    parser: { type: String, required: true },
    parser: { type: String, required: true },
    config: { type: Object }
})
model('Log', {
    ip: { type: String },
    user: { type: String },
    browser: { type: String },
    system: { type: String },
    collectionName: { type: String },
    action: { type: String, required: true },
    dataId: { type: Schema.Types.ObjectId },
    description: { type: String },
    createTime: { type: Date, default: Date.now }
})
*/



/*function dynamicRouter() {
 var map = {
 post: 'create',
 put: 'update',
 'get': 'read',
 'delete': 'delete'
 }
 db.API.find({isEnable: true}, function(err, result) {
 for (var i = 0, j = result.length; i < j; i++) {
 var o = result[i],
 method = o.method.toLowerCase(),
 uri = '/'  + o.owner + '/' + o.uri + '/' + map[method]
 router[method](uri, function(req, res, next) {
 res.hasRouter = true
 next();
 })
 }
 })
 }
 dynamicRouter();*/