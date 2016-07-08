var objectid = require('objectid')
var common = require('../../system/common')

function createDocument(option) {
    var o = {
        isEnable: true,
        method: 'get,post,put,delete',
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
            uri: 'dynamiccollection'
        }),
        createDocument({
            uri: 'api'
        }),
        createDocument({
            uri: 'page'
        }),
        createDocument({
            uri: 'user'
        }),
        createDocument({
            uri: 'role'
        }),
        createDocument({
            uri: 'catagory'
        }),
        createDocument({
            uri: 'link',
            config: {
                "post": {
                    "query": {
                        "_map": "catagory_link_content"
                    }
                }
            }
        }),
        createDocument({
            uri: 'article'
        }),
        createDocument({
            uri: 'tag'
        }),
        createDocument({
            uri: 'area'
        }),
        createDocument({
            uri: 'widget'
        }),
        createDocument({
            uri: 'systemconfig'
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
