var objectid = require('objectid')
var common = require('../../system/common')

function createDocument(option) {
    var o = {
        isEnable: true,
        method: 'get',
        owner: 'role',
        type: 'router'
    }
    common.mix(o, option)
    return o;
}

module.exports = {
    installer: 'api',
    data: [
        createDocument({
            uri: 'menu'
        }),
        createDocument({
            uri: 'catagory'
        }),
        createDocument({
            uri: 'api'
        }),
        createDocument({
            uri: 'dynamiccollection'
        }),
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
