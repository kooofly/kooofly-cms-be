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
    }).then(function() {
        res.render('index', { title: 'Install Success' });
    }).catch(function(err) {
        res.render('error', { error: err });
    })

});

module.exports = router;
