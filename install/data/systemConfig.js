var objectid = require('objectid')
var common = require('../../system/common')

module.exports = {
    installer: 'systemconfig',
    data: [
        {
            code: 'area_list_handlers',
            config: {
                "data": {
                    "default": {
                        "widgets": [
                            {
                                "widget": "button-create"
                            },
                            {
                                "widget": "button-batch_delete"
                            }
                        ]
                    },
                    "content": {
                        "extend": false,
                        "widgets": [
                            {
                                "widget": "dropdown",
                                "params": {
                                    "name": "添加内容",
                                    "data": [
                                        {
                                            "link": "/#!/admin/article/create",
                                            "text": "添加文章"
                                        },
                                        {
                                            "link": "/#!/admin/link/create",
                                            "text": "添加链接"
                                        }
                                    ]
                                }
                            },
                            {
                                "widget": "button-batch_delete"
                            }
                        ]
                    }
                }
            }
        }
    ]
}
//master-slave

// 映射配置
var json = [
    {
        "collectionName": "mapcatagorycontent",
        "master": "catagory",
        "masterId": "_id=>catagoryId",
        "slave": "article",
        "slaveId": "_id=>contentId",
        "contactField": "contentType"
    },
    {
        "collectionName": "mapcatagorycontent",
        "master": "catagory",
        "masterId": "_id=>catagoryId",
        "slave": "link",
        "slaveId": "_id=>contentId",
        "contactField": "contentType"
    },
    {
        "collectionName": "mapcontenttag",
        "master": "tag",
        "masterId": "_id=>tagId",
        "slave": "article",
        "slaveId": "_id=>contentId",
        "contactField": "contentType"
    }
    ]