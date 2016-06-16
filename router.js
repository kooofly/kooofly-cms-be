var coreDispatch = require('./system/coreDispatch')
module.exports = function(req, res, next) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
    res.set('Access-Control-Allow-Headers', "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    var method = req.method
    /*
     * 所有请求的入口 除了数据处理之外，这里所有的操作都是异步的
     * req > 404检测 > 角色api权限检测（模块权限检测 > uri resource权限检测 ） > [request 数据合法性检测] >
     *   增删 > 操作成功 > [可能的步骤：刷新缓存] > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
     *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
     *   查 > 字段过滤 > 操作成功 > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
     *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
     *   改 > 数据版本检测 通过则 > 操作成功 > [可能的步骤：刷新缓存] > 记录操作日志log > 返回数据 > 处理数据（单一数据||组合数据）> response
     *       > 操作失败 > 返回数据 > 处理数据（单一数据||组合数据）> response
     *   注：所有的api都视为一种资源uri resource
     *   暂时不做 moduleCheck uriResourceCheck isRequestLegal refreshCache
     * */

    coreDispatch.isNot404(req, res).then(function (handler) {
        // 角色api权限检测 模块权限检测
        // 缓存所有的api 不从数据库查询 提升性能
        return coreDispatch.moduleCheck().then(function (module) {
            // uri resource权限检测
            // 缓存所有的角色信息 不从数据库查询 提升性能
            return coreDispatch.uriResourceCheck().then(function (uri) {
                // [request 数据合法性检测]
                return coreDispatch.isRequestLegal().then(function () {
                    if (method === 'PUT') {
                        return coreDispatch.versionCheck(req).then(function () {
                            return handler(req, res).then(function (result) {
                                coreDispatch.createLog(result)
                                return coreDispatch.cookingData(result)
                            })
                        })
                    } else {
                        return handler(req, res).then(function (result) {
                            coreDispatch.createLog(result)
                            return coreDispatch.cookingData(result)
                        })
                    }
                })
            })
        })
    }).then(function (result) {
        res.json(result)
    }, function (err) {
        // 可能的错误
        // 返回404信息
        // 模块 无操作权限
        // 资源 无操作权限
        // 参数不合法 返回不合法原因

        // 查询操作失败
        // 添加或者是删除操作失败

        // 数据版本检测 操作失败
        // 更新操作失败
        res.json(err)
    })
}