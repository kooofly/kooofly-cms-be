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
var menuId = objectid()
var sort = 1
function createDocument(option) {
    var o = {
        isEnable: true,
        sort: sort ++
    }
    common.mix(o, option)
    return o;
}

module.exports = {
    installer: 'menu',
    defer: true,
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
            alias: 'dynamiccollection',
            link: '/#!/admin/system/dynamiccollection'
        }),
        createDocument({
            parentId: systemId,
            _id: apiId,
            name: 'API管理',
            alias: 'api',
            link: '/#!/admin/system/api'
        }),
        /* TODO 可能不需要 等需要的时候再 开启
        createDocument({
            parentId: systemId,
            _id: routeId,
            name: 'route管理',
            alias: 'route'
        }),*/
        createDocument({
            parentId: systemId,
            _id: wedigetId,
            name: 'Widget管理',
            alias: 'widget',
            link: '/#!/admin/system/widget'
        }),
        createDocument({
            parentId: systemId,
            _id: areaId,
            name: 'Area管理',
            alias: 'area',
            link: '/#!/admin/system/area'
        }),
        createDocument({
            parentId: systemId,
            _id: configId,
            name: '系统配置',
            alias: 'systemconfig',
            link: '/#!/admin/system/systemconfig'
        }),
        createDocument({
            parentId: systemId,
            _id: menuId,
            name: '菜单管理',
            alias: 'menu',
            link: '/#!/admin/system/menu'
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
