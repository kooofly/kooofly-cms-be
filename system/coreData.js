var ids = require('../install/ids')

var common = require('./common')


function createDocument(option) {
    var o = {
        isEnable: true
    }
    common.mix(o, option)
    return o;
}
var isEnable = {
    name: 'isEnable',
    attribute: { type: 'Boolean', required: true },
    control: {
        name: 'radio-boolean',
        label: '是否启用',
        default: 1
    }
}
var lastModifyTime = {
        name: 'lastModifyTime',
        attribute: { type: 'Date', default: 'Date.now' }
}
var sort = {
    name: 'sort',
    attribute: { type: 'Number' }
}
var openMode = {
    name: 'openMode',
    attribute: { type: 'String' },
    control: {
        label: '打开方式',
        name: 'select',
        default: '_self',
        data: [
            { text: '默认(本窗口)', value: '_self' },
            { text: '新窗口', value: '_blank' }
        ]
    }
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
                name: 'fields',
                attribute: { type: 'Array' },
                control: {
                    name: 'group-fields'
                }
            },
            isEnable,
            lastModifyTime
        ]
    }),
    createDocument({
        _id: ids.MODEL_API_ID,
        name: 'API表',
        collectionName: 'api',
        fields: [
            /*{
                name: 'parentId',
                attribute: { type: 'ObjectId' }
            },*/
            /*{
                name: 'name',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: 'API名称'
                }
            },*/
            {
                name: 'uri',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: 'API uri',
                    placeholder: 'uri的每个单词都需要以字母开头'
                }
            },
            {
                name: 'type',
                attribute: { type: 'String', default: 'api' },
                control: {
                    name: 'select',
                    default: 'api',
                    data: [
                        { text: 'api', value: 'api' },
                        { text: 'router', value: 'router' }
                    ],
                    label: '类型'
                }
            },
            {
                name: 'method',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    placeholder: '可填写的值有get,post,put,delete，不同的值之间用逗号分隔，分别对应查询，保存，更新，删除',
                    /*data: [
                        { text: '请选择', value: '' },
                        { text: 'get', value: 'get' },
                        { text: 'post', value: 'post' },
                        { text: 'put', value: 'put' },
                        { text: 'delete', value: 'delete' }
                    ],*/
                    label: '动作'
                }
            },
            {
                name: 'module',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    placeholder: '如填写module，则会new API(module), 默认 new API(uri)',
                    label: '模块'
                }
            },
            // coreDispatch.isNot404 中用来混合req使用  params 暂时没用 查询的时候只可以配置query 和 processor
            {
                name: 'config',
                attribute: { type: 'Object' },
                control: {
                    name: 'textarea',
                    placeholder: '服务器端默认参数配置 可配置的一级参数有 all、get、post、put、delete,二级参数有 processor、body、query、params，例如：{ "all": { "query": { "_map": "catagory_link" } }, "get": { "query": { "_single": 1 } } }',
                    label: '配置'
                }
            },
            {
                name: 'owner',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'select',
                    data: [
                        { text: 'role', value: 'role' },
                        { text: 'public', value: 'public' }
                    ]
                }
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: {
                    name: 'textarea',
                    label: 'API描述'
                }
            },
            isEnable,
            sort,
            lastModifyTime
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
                control: {
                    name: 'text',
                    label: '账号'
                }
            },
            {
                name: 'password',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'password',
                    label: '密码'
                }
            },
            isEnable,
            {
                name: 'info',
                attribute: { type: 'Object' },
                control: {
                    name: 'group-info',
                    label: '其他信息'
                },
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
                control: {
                    name: 'text',
                    label: '角色名'
                }
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: {
                    name: 'textarea',
                    label: '角色描述'
                }
            },
            isEnable,
            sort,
            lastModifyTime
        ]
    }),
    createDocument({
        _id: ids.MODEL_Menu_ID,
        name: '菜单表',
        collectionName: 'menu',
        fields: [
            {
                name: 'parentId',
                attribute: { type: 'ObjectId' },
                control: {
                    name: 'select',
                    data: '@menu', //@表示调用catagory查询api
                    label: '父菜单'
                },
            },
            {
                name: 'name',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '菜单名称'
                }
            },
            {
                name: 'alias',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '菜单别名'
                }
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '菜单链接'
                }
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload',
                    label: '菜单Logo'
                }
            },
            isEnable,
            sort,
            lastModifyTime,
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
                    data: '@catagory', //@表示调用catagory查询api
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
                name: 'type',
                attribute: { type: 'String' }, // 栏目类型，可能废弃，因为智能添加模型（template 添加模型）更灵活  page || null || menu
            },
            {
                name: 'code',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '栏目Code',
                    placeholder: '唯一性的code，可以看做是自定义的id，可以用作频道建设等'
                }
            },
            isEnable,
            {
                name: 'info',
                attribute: { type: 'Object' },
                control: {
                    name: 'group-info',
                    label: '栏目信息'
                }
            },
            sort,
            lastModifyTime,
        ]
    }),
    createDocument({
        _id: ids.MODEL_Link_ID,
        name: '链接表',
        collectionName: 'link',
        fields: [
            {
                name: 'catagoryId',
                isExternal: true,
                attribute: { type: 'ObjectId', required: true },
                control: {
                    label: '分类',
                    name: 'select',
                    data: '@catagory'
                }
            },
            {
                name: 'title',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '链接标题'
                }
            },
            {
                name: 'link',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '链接'
                }
            },
            openMode,
            {
                name: 'description',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '描述'
                }
            },
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload',
                    label: '图片'
                }
            },
            isEnable,
            /*{ // 忘记是干嘛用的了 可能是权限相关的
                name: 'status',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'radio',
                    dataSource: {
                        type: 'api',
                        value: 'role_article_status'
                    }
                }
            },*/
            sort,
            lastModifyTime
        ]
    }),
    createDocument({
        _id: ids.MODEL_Article_ID,
        name: '文章表',
        collectionName: 'article',
        fields: [
            {
                name: 'catagoryId',
                isExternal: true,
                attribute: { type: 'ObjectId', required: true },
                control: {
                    label: '分类',
                    name: 'select',
                    data: '@catagory'
                }
            },
            {
                name: 'title',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '标题'
                }
            },
            {
                name: 'digest',
                attribute: { type: 'String' },
                control: {
                    name: 'textarea',
                    label: '摘要'
                }
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '链接'
                }
            },
            openMode,
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload',
                    label: '文章主图'
                }
            },
            {
                name: 'content',
                attribute: { type: 'String' },
                control: {
                    name: 'textarea-rich',
                    label: '正文内容'
                }
            },
            {
                name: 'contentParser', //可能是markdown解析或者是正常解析
                attribute: { type: 'String' }
            },
            isEnable,
            /*{ // 忘记干嘛用的了，貌似是权限相关的
                name: 'status',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'radio',
                    dataSource: {
                        type: 'api',
                        value: 'role_article_status'
                    }
                }
            },*/
            sort,
            lastModifyTime
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
                control: {
                    name: 'text',
                    label: '标签名称'
                }
            },
            {
                name: 'link',
                attribute: { type: 'String' },
                control: {
                    name: 'text',
                    label: '标签链接'
                }
            },
            openMode,
            {
                name: 'logo',
                attribute: { type: 'String' },
                control: {
                    name: 'upload',
                    label: '标签图标'
                }
            },
            isEnable,
            sort,
            lastModifyTime
        ]
    }),
    // 映射表 start
    createDocument({
        _id: ids.MODEL_MapRoleCatagory_ID,
        name: '角色分类映射表', // 数据权限
        collectionName: 'maprolecatagory',
        fields: [
            {
                name: 'roleId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'catagoryId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapDynamicCollectionAPI_ID,
        name: 'dynamiccollection API映射表',
        collectionName: 'mapdynamiccollectionapi',
        fields: [
            {
                name: 'dynamiccollectionId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'apiId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
            }
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapRoleAPI_ID,
        name: '角色API映射表', // resetful 资源权限
        collectionName: 'maproleapi',
        fields: [
            {
                name: 'roleId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'apiId',
                attribute: { type: 'ObjectId', required: true }
            },
            {
                name: 'contentType',
                attribute: { type: 'String', required: true }
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
            },
            sort
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapContentTag_ID,
        name: '标签内容映射表',
        collectionName: 'maptagcontent',
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
            },
            sort
        ]
    }),
    createDocument({
        _id: ids.MODEL_MapContentArea_ID,
        name: '区域内容映射表',
        collectionName: 'mapareacontent',
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
            sort
        ]
    }),
    // 映射表 end
    createDocument({
        name: '区域表',
        // 这个是针对内容的，用户使用 以后有ui界面，强调易用性
        // systemconfig里面的配置是针对会coding的超级管理员使用，强调配置灵活性
        collectionName: 'area',
        fields: [
            {
                name: 'code',
                attribute: { type: 'String' },
                showFilter: 'areaCode'
            },
            {
                name: 'description',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '描述',
                    placeholder: '举例使用方式\n说明Widget需要的参数\n说明Widget的使用场景，范围\n第一次使用的考虑等'
                }
            },
            {
                name: 'widget', // 指定一个列表widget
                attribute: { type: 'String', required: true },
                control: {
                    name: 'select', // TODO 用一个布局图形表示
                    data: '@widget?type=content',
                    label: '布局方式'
                    // 统一不同模型的字段名称，可以让这个功能实现变得简单
                }
            },
            {
                name: 'paging',
                attribute: { type: 'String' },
                control: {
                    name: 'select', // TODO 用一个布局图形表示
                    data: '@widget?type=paging',
                    label: '分页' // 选择分页控件
                }
            },
            {
                name: 'size',
                attribute: { type: 'Number' },
                control: {
                    name: 'number',
                    label: '每页显示数'
                }
            },
            lastModifyTime
        ]
    }),
    createDocument({
        _id: ids.MODEL_Wediget_ID,
        name: 'Widget表', //删除了区域表，区域作为Widget之一，一个页面可能由多个区域组成，所以区域需要id Widget需要id
        collectionName: 'widget',
        fields: [
            {
                name: 'name', // widget name 用来匹配widget 唯一性
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: '名称',
                    placeholder: 'Widget名称，用来匹配Widget'
                }
            },
            {
                name: 'type',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'select',
                    default: 'system',
                    data: [
                        { value: 'system', text: '系统Widget' },
                        { value: 'content', text: '内容Widget（区域配置使用）' },
                        { value: 'paging', text: '分页（区域配置使用）' }
                    ],
                    label: 'Widget类型'
                }
            },
            {
                name: 'description',
                attribute: { type: 'String', required: true },
                control: {
                    name: 'textarea',
                    label: '描述',
                    placeholder: '举例使用方式\n说明Widget需要的参数\n说明Widget的使用场景，范围\n第一次使用的考虑等'
                }
            },
            lastModifyTime
        ]
    }),
    createDocument({
        name: '系统配置',
        collectionName: 'systemconfig',
        fields: [
            {
                name: 'code', //可能是一个链接 可能是一个module 唯一性，主键 考虑 配置 版本问题。 相同的配置code 以最后时间的配置为准
                attribute: { type: 'String', required: true },
                control: {
                    name: 'text',
                    label: 'Code'
                }
            },
            {
                name: 'config',// 考虑 vue 生命周期 vue method
                attribute: { type: 'Object' },
                control: {
                    name: 'textarea',
                    label: '配置',
                    placeholder: 'JSON数据'
                }
            },
            {
                name: 'description',
                attribute: { type: 'String' },
                control: {
                    name: 'textarea',
                    label: '描述',
                    placeholder: '举例使用方式\n说明配置含义\n说明使用场景，范围\n第一次使用的考虑等'
                }
            },
            lastModifyTime
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