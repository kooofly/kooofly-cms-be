var coreDispatch = require('./system/coreDispatch')
module.exports = function(req, res, next) {
    res.set('Access-Control-Allow-Origin', "*")
    res.set('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS")
    res.set('Access-Control-Allow-Headers', "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    coreDispatch.isNot404(req, res).then(function (fn) {
        
    }).then(function (result) {
        res.json(result)
    }, function (err) {
        res.json(err)
    })
}