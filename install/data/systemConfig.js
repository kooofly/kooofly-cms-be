var objectid = require('objectid')
var common = require('../../system/common')

module.exports = {
    installer: 'systemconfig',
    defer: true,
    data: [
        {
            code: 'area_list_handlers',
            config: {
                "data": {
                    "default": {
                        "widgets": [
                            {
                                "widget": "button-create",
                                "params": {}
                            },
                            {
                                "widget": "button-batch_delete",
                                "params": {}
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
// menu 包含模型配置  用于菜单权限操作
var configMenuCollection = {
    menu: 'id',
    collections: [1,2,3]
}