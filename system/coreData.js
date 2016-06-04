var ids = require('../install/ids')
var common = require('./common')


function createDocument(option) {
    var o = {
        isEnable: true
    }
    common.mix(o, option)
    return o;
}
var data = [
    createDocument({
        _id: ids.MODEL_DynamicCollection_ID,
        name: '集合表',
        collectionName: 'dynamiccollection',
        fields: [
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '模型名称'
                },
            },
            {
                name: 'collectionName',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '模型表名'
                },
            },
            {
                name: 'apis',
                control: {
                    name: 'group-apis'
                }
            },
            {
                name: 'fields',
                attribute: { type: 'Array' },
                control: {
                    name: 'group-fields'
                }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: {
                    label: '是否启用',
                    name: 'radio-boolean'
                },
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_API_ID,
        name: 'API表',
        collectionName: 'api',
        fields: [
            {
                name: '_creator',
                attribute: { type: 'ObjectId' },
                showFilter: 'empty'
            },
            {
                name: 'parentId',
                attribute: { type: 'ObjectId' }
            },
            {
                name: 'name',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'uri',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'type',
                attribute: { type: 'String', default: 'api' },
                control: {
                    name: 'select',
                    data: [
                        { text: 'api', value: 'api' },
                        { text: 'route', value: 'route' }
                    ]
                }
            },
            {
                name: 'method',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'select',
                    data: [
                        { text: '请选择', value: '' },
                        { text: 'get', value: 'get' },
                        { text: 'post', value: 'post' },
                        { text: 'put', value: 'put' },
                        { text: 'delete', value: 'delete' }
                    ]
                }
            },
            {
                name: 'owner',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'select',
                    data: [
                        { text: 'role', value: 'role' },
                        { text: 'public', value: 'public' },
                        { text: 'user', value: 'user' }
                    ]
                }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: 'textarea'
            },
            {
                name: 'sort',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]

    }),
    createDocument({
        _id: ids.MODEL_User_ID,
        name: '用户表',
        collectionName: 'user',
        fields: [
            {
                name: 'account',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'password',
                attribute: { type: 'String', required: true },
                control: 'password'
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'info',
                attribute: { type: 'Object' },
                control: 'text-group'
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Role_ID,
        name: '角色表',
        collectionName: 'role',
        fields: [
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: 'text-group'
            },
            {
                name: 'sort',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Catagory_ID,
        name: '分类表',
        collectionName: 'catagory',
        fields: [
            {
                name: 'parentId',
                attribute: { type: 'ObjectId' },
                control: {
                    name: 'select',
                    data: '@catagory',
                    label: '父栏目'
                },
            },
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '栏目名称'
                }
            },
            {
                name: 'alias',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '栏目别名'
                }
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '栏目链接'
                }
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload',
                    label: '栏目Logo'
                }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: {
                    name: 'radio-boolean',
                    label: '是否启用'
                }
            },
            {
                name: 'info',
                attribute: { type: 'Object' },
                control: {
                    name: 'fields-info',
                    label: '栏目信息'
                }
            },
            {
                name: 'type',
                attribute: { type: 'String' }, //page || null || menu
            },
            {
                name: 'sort',
                attribute: { type: 'Number' }
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Link_ID,
        name: '链接表',
        collectionName: 'link',
        fields: [
            {
                name: 'title',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'link',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'openMode',
                attribute: { type: 'String' },
                control: {
                    name: 'radio',
                    data: [
                        { text: '默认', value: '', checked: true },
                        { text: '新窗口', value: '_blank' }
                    ]
                }
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload'
                }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'status',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'radio',
                    dataSource: {
                        type: 'api',
                        value: 'role_article_status'
                    }
                }
            },
            {
                name: 'sort',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Article_ID,
        name: '文章表',
        collectionName: 'article',
        fields: [
            {
                name: 'title',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'digest',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'openMode',
                attribute: { type: 'String' },
                control: {
                    name: 'radio',
                    data: [
                        { text: '默认', value: '', checked: true },
                        { text: '新窗口', value: '_blank' }
                    ]
                }
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload'
                }
            },
            {
                name: 'content',
                attribute: { type: 'String' },
                control: 'richtext|markdown'
            },
            {
                name: 'contentParser',
                attribute: { type: 'String' }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'status',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'radio',
                    dataSource: {
                        type: 'api',
                        value: 'role_article_status'
                    }
                }
            },
            {
                name: 'sort',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Tag_ID,
        name: '标签表',
        collectionName: 'tag',
        fields: [
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'openMode',
                attribute: { type: 'String' },
                control: {
                    name: 'radio',
                    data: [
                        { text: '默认', value: '', checked: true },
                        { text: '新窗口', value: '_blank' }
                    ]
                }
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload'
                }
            },
            {
                name: 'isEnable',
                attribute: { type: 'Boolean', required: true },
                control: 'radio-boolean'
            },
            {
                name: 'sort',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapRoleCatagory_ID,
        name: '角色分类映射表',
        collectionName: 'maprolecatagory',
        fields: [
            {
                name: 'roleId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'catagoryId',
                attribute: { type: 'ObjectId', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapRoleAPI_ID,
        name: '角色API映射表',
        collectionName: 'maproleapi',
        fields: [
            {
                name: 'roleId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'apiId',
                attribute: { type: 'ObjectId', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapCatagoryContent_ID,
        name: '分类内容映射表',
        collectionName: 'mapcatagorycontent',
        fields: [
            {
                name: 'catagoryId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapContentTag_ID,
        name: '内容标签映射表',
        collectionName: 'mapcontenttag',
        fields: [
            {
                name: 'tagId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapContentArea_ID,
        name: '区域内容映射表',
        collectionName: 'mapcontentarea',
        fields: [
            {
                name: 'areaId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
            },
            {
                name: 'sort',
                attribute: { type: 'Number' }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_Wediget_ID,
        name: 'Widget表',
        collectionName: 'widget',
        fields: [
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'code',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        name: '区域表',
        collectionName: 'area',
        fields: [
            {
                name: '_id',
                attribute: { type: 'ObjectId' },
                showFilter: 'areaCode'
            },
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'limit',
                attribute: { type: 'Number' },
                control: 'number'
            },
            {
                name: 'lastModifyTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    }),
    createDocument({
        name: '系统配置',
        collectionName: 'systemconfig',
        fields: [
            {
                name: 'code', //可能是一个链接
                attribute: { type: 'String', required: true },
                control: 'text'
            },
            {
                name: 'runtime',
                attribute: { type: 'String', default: 'ready' },
                control: 'text'
            },
            {
                name: 'parser',
                attribute: { type: 'String' },
                control: 'text'
            },
            {
                name: 'config',
                attribute: { type: 'Object' },
                control: 'textarea'
            }
        ]
    }),
    createDocument({
        name: 'Log',
        collectionName: 'log',
        fields: [
            {
                name: 'ip',
                attribute: { type: 'String' }
            },
            {
                name: 'user',
                attribute: { type: 'String' }
            },
            {
                name: 'browser',
                attribute: { type: 'String' }
            },
            {
                name: 'system',
                attribute: { type: 'String' }
            },
            {
                name: 'collectionName',
                attribute: { type: 'String' }
            },
            {
                name: 'action',
                attribute: { type: 'String', required: true }
            },
            {
                name: 'dataId',
                attribute: { type: 'ObjectId' }
            },
            {
                name: 'description',
                attribute: { type: 'String' }
            },
            {
                name: 'createTime',
                attribute: { type: 'Date', default: 'Date.now' }
            }
        ]
    })
]
module.exports = {
    data: data,
    promiseData: new Promise(function(resolve, reject) {
        resolve(data)
    })
}