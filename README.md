特殊查询字段：
params:
single=1 表示返回单个数据
limit: 10 page: 3 表示返回翻页数据
associated=1 表示关联查询



排序
分页
改变路由机制
install

用户管理
角色管理
用户配置
用户登录
注册
admin 设计
开发角色设计 角色切换设计



中间映射表添加 通用配置设计
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

