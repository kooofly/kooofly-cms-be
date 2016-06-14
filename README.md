特殊查询字段：
params:
_single=1 表示返回单个数据
_limit=10&page=3 表示返回翻页数据
_map=role_catagory 表示关联查询
_sort=asc||desc&[_sortby=sort] 表示插入排序 sortby是可选参数 默认_sortby=sort 可以填写_id等，多个之间用“,”分割 如： _sort=asc,desc&_sortby=lastModifyTime,sort



排序
分页
改变路由机制

统一数据格式：
多数据
{
    result: '',
    type: 'info || confirm || data || error || other'
}
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



中间映射表添加 通用配置设计
映射表的添加，所有的字段都有限制，详见DbClass 中的 _readAssociated()


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