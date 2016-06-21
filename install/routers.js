var express = require('express');
var router = express.Router();
var install = require('./index')
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Kooofly CMS Installer' });
});
router.get('/install', function(req, res, next) {
    install({
        isRemoveAll: true
    }).then(function(result) {
        res.render('index', { title: 'Install Success', message: JSON.stringify(result) });
    }).catch(function(err) {
        res.render('error', { error: err });
    })
});
router.get('/test', function(req, res, next) {
    var r = Math.round(Math.random() * 1000)
    global.apis['t_' + r] = {
        key: r
    }
    var t = (function () {
        var r = []
        for (var key in global.apis) {
            r.push(key)
        }
        return r
    })()
    res.render('index', { title: 'TEST Success', message: JSON.stringify(t) });
});
module.exports = router;
