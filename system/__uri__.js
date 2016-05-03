var models = require('./models')
var apis = require('../resetful/index')
function getCallByPath(o, path) {
    var key, _this
    if(!path.length)
        return o
    key = path[0]
    _this = o[key]
    if(_this) {
        path.shift()
        return getCallByPath(o[key], path)
    } else {
        return null
    }
}
var methodMap = {
    get: 'read',
    post: 'create',
    put: 'update',
    delete: 'delete'
}

models['API'].find(condition || {}, function(err, result) {
    if(err) return res.json(err)
    result.forEach(function(v, index) {
        var __log = []
        var uri = v.uri,
            method = v.method,
            path = uri.split('/'),
            call, routerUrl = '/' + prefix + '/' + uri
        __log.push(routerUrl)
        console.log(__log)
        // /abc/:id/dd/:id
        // /abc/xxxxxx/dd/xxxxxxyyyy
        // prefix/uri
        app[method](routerUrl, function(req, res, next) {
            call = getCallByPath(apis, path)
            if(!call) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                call[ methodMap[method] ](req, res)
            }
        })
    })
})

module.exports = function(app, condition, prefix) {

}