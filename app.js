
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var session = require('express-session');
var bodyParser = require('body-parser');
var ueditor = require("ueditor")
//var ueditor = require("ueditor-nodejs")
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
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser('keyboared cat'));
//app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.static(path.join(__dirname, 'public')))

app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
    res.set('Access-Control-Allow-Headers', "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X_Requested_With")
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
// /ueditor 入口地址配置 https://github.com/netpi/ueditor/blob/master/example/public/ueditor/ueditor.config.js
// 官方例子是这样的 serverUrl: URL + "php/controller.php"
// 我们要把它改成 serverUrl: URL + 'ue'
/*app.use('/ueditor/ue', ueditor({//这里的/ueditor/ue是因为文件件重命名为了ueditor,如果没改名，那么应该是/ueditor版本号/ue
    configFile: '/ueditor/php/config.json',//如果下载的是jsp的，就填写/ueditor/jsp/config.json
    mode: 'local', //本地存储填写local , bcs填写bcs
    //accessKey: 'Adxxxxxxx',//本地存储不填写，bcs填写
    //secrectKey: 'oiUqt1VpH3fdxxxx',//本地存储不填写，bcs填写
    staticPath: path.join(__dirname, 'public'), //一般固定的写法，静态资源的目录，如果是bcs，可以不填
    dynamicPath: '/blogpicture' //动态目录，以/开头，bcs填写buckect名字，开头没有/.路径可以根据req动态变化，可以是一个函数，function(req) { return '/xx'} req.query.action是请求的行为，uploadimage表示上传图片，具体查看config.json.
}));*/
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
        // ueditor 客户发起上传图片请求
        if (req.query.action === 'uploadimage') {

            // 这里你可以获得上传图片的信息
            var foo = req.ueditor;
            console.log(foo.filename); // exp.png
            console.log(foo.encoding); // 7bit
            console.log(foo.mimetype); // image/png

            // 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
            var img_url = '/ueditor/php/upload/image/';
            res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        }
        //  客户端发起图片列表请求
        else if (req.query.action === 'listimage'){
            var dir_url = '/ueditor/php/upload/image/'; // 要展示给客户端的文件夹路径
            res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
        }
        // 客户端发起其它请求
        else {

            // 这里填写 ueditor.config.json 这个文件的路径
            res.redirect('/ueditor/config?callback=' + req.query.callback)
        }
    }))

app.use("/ueditor/config", function(req, res, next) {
    res.setHeader('Content-Type', 'application/jsonp');
    var callback = req.query.callback
    var data = /* 前后端通信相关的配置,注释只允许使用多行方式 */
    {
        /* 上传图片配置项 */
        "imageActionName": "uploadimage", /* 执行上传图片的action名称 */
        "imageFieldName": "upfile", /* 提交的图片表单名称 */
        "imageMaxSize": 2048000, /* 上传大小限制，单位B */
        "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
        "imageCompressEnable": true, /* 是否压缩图片,默认是true */
        "imageCompressBorder": 1600, /* 图片压缩最长边限制 */
        "imageInsertAlign": "none", /* 插入的图片浮动方式 */
        "imageUrlPrefix": "", /* 图片访问路径前缀 */
        "imagePathFormat": "/ueditor/php/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        /* {filename} 会替换成原文件名,配置这项需要注意中文乱码问题 */
        /* {rand:6} 会替换成随机数,后面的数字是随机数的位数 */
        /* {time} 会替换成时间戳 */
        /* {yyyy} 会替换成四位年份 */
        /* {yy} 会替换成两位年份 */
        /* {mm} 会替换成两位月份 */
        /* {dd} 会替换成两位日期 */
        /* {hh} 会替换成两位小时 */
        /* {ii} 会替换成两位分钟 */
        /* {ss} 会替换成两位秒 */
        /* 非法字符 \ : * ? " < > | */
        /* 具请体看线上文档: fex.baidu.com/ueditor/#use-format_upload_filename */

        /* 涂鸦图片上传配置项 */
        "scrawlActionName": "uploadscrawl", /* 执行上传涂鸦的action名称 */
        "scrawlFieldName": "upfile", /* 提交的图片表单名称 */
        "scrawlPathFormat": "/ueditor/php/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        "scrawlMaxSize": 2048000, /* 上传大小限制，单位B */
        "scrawlUrlPrefix": "", /* 图片访问路径前缀 */
        "scrawlInsertAlign": "none",

        /* 截图工具上传 */
        "snapscreenActionName": "uploadimage", /* 执行上传截图的action名称 */
        "snapscreenPathFormat": "/ueditor/php/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        "snapscreenUrlPrefix": "", /* 图片访问路径前缀 */
        "snapscreenInsertAlign": "none", /* 插入的图片浮动方式 */

        /* 抓取远程图片配置 */
        "catcherLocalDomain": ["127.0.0.1", "localhost", "img.baidu.com"],
        "catcherActionName": "catchimage", /* 执行抓取远程图片的action名称 */
        "catcherFieldName": "source", /* 提交的图片列表表单名称 */
        "catcherPathFormat": "/ueditor/php/upload/image/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        "catcherUrlPrefix": "", /* 图片访问路径前缀 */
        "catcherMaxSize": 2048000, /* 上传大小限制，单位B */
        "catcherAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 抓取图片格式显示 */

        /* 上传视频配置 */
        "videoActionName": "uploadvideo", /* 执行上传视频的action名称 */
        "videoFieldName": "upfile", /* 提交的视频表单名称 */
        "videoPathFormat": "/ueditor/php/upload/video/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        "videoUrlPrefix": "", /* 视频访问路径前缀 */
        "videoMaxSize": 102400000, /* 上传大小限制，单位B，默认100MB */
        "videoAllowFiles": [
            ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
            ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid"], /* 上传视频格式显示 */

        /* 上传文件配置 */
        "fileActionName": "uploadfile", /* controller里,执行上传视频的action名称 */
        "fileFieldName": "upfile", /* 提交的文件表单名称 */
        "filePathFormat": "/ueditor/php/upload/file/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */
        "fileUrlPrefix": "", /* 文件访问路径前缀 */
        "fileMaxSize": 51200000, /* 上传大小限制，单位B，默认50MB */
        "fileAllowFiles": [
            ".png", ".jpg", ".jpeg", ".gif", ".bmp",
            ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
            ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid",
            ".rar", ".zip", ".tar", ".gz", ".7z", ".bz2", ".cab", ".iso",
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt", ".md", ".xml"
        ], /* 上传文件格式显示 */

        /* 列出指定目录下的图片 */
        "imageManagerActionName": "listimage", /* 执行图片管理的action名称 */
        "imageManagerListPath": "/ueditor/php/upload/image/", /* 指定要列出图片的目录 */
        "imageManagerListSize": 20, /* 每次列出文件数量 */
        "imageManagerUrlPrefix": "", /* 图片访问路径前缀 */
        "imageManagerInsertAlign": "none", /* 插入的图片浮动方式 */
        "imageManagerAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 列出的文件类型 */

        /* 列出指定目录下的文件 */
        "fileManagerActionName": "listfile", /* 执行文件管理的action名称 */
        "fileManagerListPath": "/ueditor/php/upload/file/", /* 指定要列出文件的目录 */
        "fileManagerUrlPrefix": "", /* 文件访问路径前缀 */
        "fileManagerListSize": 20, /* 每次列出文件数量 */
        "fileManagerAllowFiles": [
            ".png", ".jpg", ".jpeg", ".gif", ".bmp",
            ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
            ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid",
            ".rar", ".zip", ".tar", ".gz", ".7z", ".bz2", ".cab", ".iso",
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt", ".md", ".xml"
        ] /* 列出的文件类型 */

    }

    res.jsonp(data)
    //res.jsonp(JSON.stringify(data))
})


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
