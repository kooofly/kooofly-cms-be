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
