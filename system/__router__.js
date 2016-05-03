var express = require('express');
var router = express.Router();

//var role = require('../api/role')
var role = require('../resetful/index')

router.get('/role/api', function(req, res, next) {
    role.API.read(req, res)
})
router.post('/role/api', function(req, res, next){
    var query = {
        uri: req.body.uri,
        method: req.body.method,
        owner: req.body.owner
    }
    role.API.create(req, res)
})
router.delete('/role/api', function(req, res, next) {
    role.API.delete(req.body, res)
})

router.delete('/role/api/:id', function(req, res, next, id) { })
router.put('/role/api/:id', function(req, res, next, id) { })
router.param('id', function(req, res, next, id) {
    if(req.method === 'PUT') {
        role.API.update(req.body, res, id)
    } else if(req.method === 'DELETE') {
        role.API.delete(req.body, res, id)
    }
})

router.post('/role/dynamicCollection', function(req, res, next){
    var query = {
        collectionName: req.body.collectionName,
    }
    role.DynamicCollection.create(req.body, res, query)
})
router.get('/role/dynamicCollection', function(req, res, next){
    role.DynamicCollection.read(req.query, res)
})

router.param('dc_id', function(req, res, next, id) {
    role.DynamicCollection.read(req.query, res, id)
})
router.get('/role/dynamicCollection/:dc_id', function(req, res, next, id){ })


router.post('/role/catagory', function(req, res, next){
    var query = {
        parentId: req.body.parentId,
        name: req.body.name,
    }
    role.Catagory.create(req.body, res, query)
})
router.get('/role/catagory', function(req, res, next){
    role.Catagory.read(req.query, res)
})

router.param('cat_id', function(req, res, next, id) {
    role.Catagory.read(req.query, res, id)
})
router.get('/role/catagory/:cat_id', function(req, res, next, id){ })


module.exports = function(app, prefix, apis) {
    apis.forEach(function() {

    })
    app.get('/a/:id', function(req,res,next) {
        res.json({id: req.params.id})
    })
    app.post('/a/:id', function(req,res,next) {
        res.json({id: req.params.id})
    })
    app.put('/a/:id', function(req,res,next) {
        res.json({id: req.params.id})
    })
    app.delete('/a/:id/xa/:abc', function(req,res,next) {
        res.json({id: req.params.id, abc: req.params.abc})
    })
    app.options('/a/:id/xa/:abc', function(req,res,next) {
        res.json({id: req.params.id})
    })
}


module.exports = router

// catagory 列表
// catagory/create