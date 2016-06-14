var objectid = require('objectid')
var common = require('../../system/common')
// 映射配置
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
        },
        {
            code: 'associated',
            config: {
                "collectionName": "maprolecatagory",
                "master": "role",
                "masterId": "_id=>roleId",
                "slave": "catagory",
                "slaveId": "_id=>catagoryId"
            },
            description: 'maprolecatagory'
        },
        {
            code: 'associated',
            config: {
                "collectionName": "mapdynamiccollectionapi",
                "master": "dynamiccollection",
                "masterId": "_id=>dynamiccollectionId",
                "slave": "api",
                "slaveId": "_id=>apiId"
            },
            description: 'mapdynamiccollectionapi'
        },
        {
            code: 'associated',
            config: {
                "collectionName": "maproleapi",
                "master": "role",
                "masterId": "_id=>roleId",
                "slave": "api",
                "slaveId": "_id=>apiId"
            },
            description: 'maproleapi'
        },
        {
            code: 'associated',
            config: {
                "collectionName": "mapcatagorycontent",
                "master": "catagory",
                "masterId": "_id=>catagoryId",
                "slave": "@contactField",
                "slaveId": "_id=>contentId",
                "contactField": "contentType"
            },
            description: 'mapcatagorycontent'
        },
        {
            code: 'associated',
            config: {
                "collectionName": "maptagcontent",
                "master": "tag",
                "masterId": "_id=>tagId",
                "slave": "@contactField",
                "slaveId": "_id=>contentId",
                "contactField": "contentType"
            },
            description: 'maptagcontent'
        },
        {
            code: 'associated',
            config: {
                "collectionName": "mapareacontent",
                "master": "area",
                "masterId": "_id=>areaId",
                "slave": "@contactField",
                "slaveId": "_id=>contentId",
                "contactField": "contentType"
            },
            description: 'mapareacontent'
        }
    ]
}
// master-slave