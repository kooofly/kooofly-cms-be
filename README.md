1.添加coreData
2.添加data/routers
3.添加data/menu

特殊查询字段：
params:
_single=1 表示返回单个数据
_limit=10&_page=3 表示返回翻页数据
_map=role_catagory 表示关联查询
_sort=asc||desc&[_sortby=sort] 表示插入排序 sortby是可选参数 默认_sortby=sort 可以填写_id等，多个之间用“,”分割 如： _sort=asc,desc&_sortby=lastModifyTime,sort
_slave=apis 关系插入时使用

_pattern= onetoone || onetomany || deleteslave  默认 onetoone 关联操作 deleteslave 删除时候使用 |  TODO createslave
_projection=xyz,uyu 查询字段过滤
_version=1 是否版本控制 当更新数据时  数据的版本不一致 则 停止更新 返回更新错误 TODO
中间映射表添加 通用配置设计
映射表的添加，字段命名有限制，详见common.js 中的 promiseParsingMap()



多数据 组合
{
    result: '',
    type: 'info || data || error || other'
}
可能的例子：

    {
        result: {
            title: '错误标题',
            content: '错误主体信息'
        },
        type: 'error'
    }

    {
        result: {
            main: [{},...],
            total: 45,
            other: 'xxx'
        },
        type: 'data'
    }

    other 情况不采用通用处理，需要自己处理正确和错误的情况
单数据 直接输出
可能的例子：

    {
        error: 'xxx'
    }

    [{}, ...]

install

用户管理
角色管理
用户配置
用户登录
注册
admin 设计
开发角色设计 角色切换设计






通用映射设计：
1.增删改查分类内容

查分类全部内容：
根据分类名称获取分类id （如果是模糊查询，则有可能有多个分类id）（可能的步骤）
查map_catagory_content获得slave，slaveIds
查slave的 slaveIds 内容

查分类单个slave内容：
查map_catagory_content获得slaveIds
查一致slave的 slaveIds 内容

增分类内容：
插入内容
插入map_catagory_content catagoryId contentType slaveId

改分类内容：
根据内容id contentType 获取 内容
获取ap_catagory_content 分类 （多个分类的情况下 可能是多个分类）
然后 同【增分类内容】


2.增删改查tag内容
3.增删改查内容分类
4.增删改查内容tag


1
    6
    7
    8
    12
    14
    21
    22
    23
    24
    25
    26
    27
2
    9
    10
    11
3
    13
4
    18
5
    19
    20
15
16
17