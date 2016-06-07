var objectid = require('objectid')
var common = require('../../system/common')
var contentId = objectid()
var tagId = objectid()
var catagoryId = objectid()
var userId = objectid()
var roleId = objectid()
var systemId = objectid()
var collectionId = objectid()
var apiId = objectid()
var routeId = objectid()
var wedigetId = objectid()
var areaId = objectid()
var configId = objectid()

function createDocument(option) {
    var o = {
        type: 'menu',
        isEnable: true
    }
    common.mix(o, option)
    return o;
}

module.exports = {
    installer: 'menu',
    data: [
        createDocument({
            _id: contentId,
            name: '内容管理',
            alias: 'content'
        }),
        createDocument({
            _id: tagId,
            name: '标签管理',
            alias: 'tag'
        }),
        createDocument({
            _id: catagoryId,
            name: '分类管理',
            alias: 'catagory'
        }),
        createDocument({
            _id: userId,
            name: '用户管理',
            alias: 'user'
        }),
        createDocument({
            _id: roleId,
            name: '角色管理',
            alias: 'role'
        }),
        createDocument({
            _id: systemId,
            name: '系统管理',
            alias: 'system'
        }),
        createDocument({
            parentId: systemId,
            _id: collectionId,
            name: 'Collection管理',
            alias: 'dynamiccollection'
        }),
        createDocument({
            parentId: systemId,
            _id: apiId,
            name: 'API管理',
            alias: 'api'
        }),
        createDocument({
            parentId: systemId,
            _id: routeId,
            name: 'route管理',
            alias: 'route'
        }),
        createDocument({
            parentId: systemId,
            _id: wedigetId,
            name: 'Widget管理',
            alias: 'widget'
        }),
        createDocument({
            parentId: systemId,
            _id: areaId,
            name: 'Area管理',
            alias: 'area'
        }),
        createDocument({
            parentId: systemId,
            _id: configId,
            name: '系统配置',
            alias: 'systemconfig'
        })
    ]
}
//Catagory

//////////////////////////////////////////menu(nav && sidebar)
// /menu => /system/resetful/menu
// /system => /system/status

// => resetful/system/config
// => resetful/system/api
// => resetful/system/collection
// => resetful/system/log



//////////////////////////////////////////main

// => resetful/catagory
// => resetful/content
// => resetful/tag
// => resetful/article
// => resetful/link
// => resetful/role
// => resetful/user


//////////////////////////////////////////area-custom (Dashboard && area-custorm-sidebar)
// xxx.com/ => resetful/index
