
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var session = require('express-session');
var bodyParser = require('body-parser');
//var routes = require('./system/_router')
var  common = require('./system/common')
var installRouters = require('./install/routers')
// TODO 可能的性能优化 已优化 api更新问题
require('events').EventEmitter.prototype._maxListeners = 4
var app = express();

var install = require('./install/index')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser('keyboared cat'));
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.use(express.static(path.join(__dirname, 'assets')));

app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
    res.set('Access-Control-Allow-Headers', "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    next()
})
app.use(function(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.json({
            status: 200
        })
    } else {
        next()
    }
});
app.use(installRouters)
var router = require('./router')
app.use(router)

/*if(common.isAdmin()) {
    _router(app, {}, 'resetful')
}*/


//app.use(routes)

/*install({
    isRemoveAll: true
}).then(function() {
    console.log('install done')
    return app
}).catch(function(err) {
    console.log(err)
})*/

module.exports = app;


// http://xxx.com/catagory 列表
// http://xxx.com/catagory/create 新建

// http://xxx.com/catagory/:id 读 之后可以修改
// http://xxx.com/catagoryType/:alias 读 之后可以修改
// http://xxx.com/catagory/:id/book/:bookId
// http://xxx.com/role/:id/user/:userId

// http://xxx.kooofly.com/resetful/catagory
// http://xxx.kooofly.com/resetful/api
// http://xxx.kooofly.com/resetful/role
// http://xxx.kooofly.com/resetful/link
// http://xxx.kooofly.com/resetful/article
// http://xxx.kooofly.com/resetful/collection
// http://xxx.kooofly.com/resetful/field
// http://xxx.kooofly.com/resetful/user
// http://xxx.kooofly.com/resetful/wediget
// http://xxx.kooofly.com/resetful/user/config
// http://xxx.kooofly.com/resetful/sys/config
