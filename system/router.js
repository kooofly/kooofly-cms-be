//var models = require('./models')
var promiseModels = require('./promiseModels')
var apis = require('../resetful/index')
var common = require('./common')
var config = require('./config')
var msgs = config[config.lang]
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
module.exports = function(app, condition, prefix) {
    /*app.use(function(req, res, next) {
        res.set('Access-Control-Allow-Origin', "*")
        res.set('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
        res.set('Access-Control-Allow-Headers', "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
        next()
    })*/
    promiseModels.then(function(models) {
        models['api'].find(condition || {}).then(function(result) {
            result.forEach(function(v, index) {

                var __log = []
                var uri = v.uri.toLowerCase(),
                    method = v.method,
                    path = uri.split('/'),
                    call, routerUrl = prefix ? '/' + prefix + '/' + uri : '/' + uri
                __log.push(routerUrl)
                console.log('router', __log)
                // /abc/:id/dd/:id
                // /abc/xxxxxx/dd/xxxxxxyyyy
                // prefix/uri
                app[method](routerUrl, function(req, res, next) {
                    var _path = path.concat([])
                    call = getCallByPath(apis, _path)
                    if(!call) {
                        var err = new Error('Not Found');
                        err.status = 404;
                        next(err);
                    } else {
                        call[ methodMap[method] ](req, res)
                    }
                })
            })
        }, function(err) {
            console.log('router.js 60', err)
        }).then(function(err) {
            console.log(err)
            // catch 404 and forward to error handler
            app.use(function(req, res, next) {
                if (req.method === 'OPTIONS') {
                    res.json({
                        status: 200
                    })
                } else {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                }

            });
            //app.set('env', 'production');
            // error handlers
            // development error handler
            // will print stacktrace
            if (app.get('env') === 'development') {
                app.use(function(err, req, res, next) {
                    res.status(err.status || 500);
                    res.render('error', {
                        message: err.message,
                        error: err
                    });
                });
            }

            // production error handler
            // no stacktraces leaked to user
            app.use(function(err, req, res, next) {
                var status = err.status || 500
                res.status(status);
                res.json({
                    status: status,
                    message: err.message,
                    documentation_url: msgs.docUrl
                })
            });
        })
    }, function(err) {
        console.log('router.js 103', err)
    })

}