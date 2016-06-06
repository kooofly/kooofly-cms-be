var Class = require('./Class')
//var models = require('./models')
var promiseModels = require('./promiseModels')
var common = require('./common')
var config = require('./config')
var msgs = config[config.lang]

var DbClass = Class.extend({
    promiseModels: promiseModels,
    ctor: function(modelName) {
        this.modelName = modelName
        //this.models = models
        //this.model = this.models[this.modelName]
        this.model = this.promiseModels.then(function(models) {
            return models[modelName]
        })
    },
    getModel: function() {
        var self = this
        return this.promiseModels.then(function(models) {
            return models[self.modelName]
        })
    },
    _create: function(data) {
        return this.getModel().then(function(model) {
            return model.create(data)
        })
    },
    _update: function(conditions, data) {
        return this.getModel().then(function(model) {
            return model.update(conditions, data)
        })
    },
    _read: function(conditions) {
        return this.getModel().then(function(model) {
            return model.find(conditions)
        })

    },
    _delete: function(conditions) {
        return this.getModel().then(function(model) {
            return model.remove(conditions)
        }, function(err) {
            console.log(err)
        })
    },
    create: function(req, res, duplicateConditions) {
        var data = req.body,
            self = this
        if(duplicateConditions) {
            this.getModel().then(function(model) {
                model.find(duplicateConditions, function(err, result) {
                    if(result.length) {
                        res.json({
                            message: msgs.dataExist,
                            duplicateConditions: duplicateConditions,
                            model: self.key,
                            documentation_url: msgs.docUrl
                        })
                        return
                    }
                    self._create(data).then(function(result) {
                        res.json(result)
                    }, function(err) {
                        res.json(err)
                    })
                })
            })

        } else {
            this._create(data).then(function(result) {
                res.json(result)
            }, function(err) {
                res.json(err)
            })
        }

    },
    update: function(req, res) {
        var data = req.body
        var conditions = req.query
        this._update(conditions, data).then(function(result) {
            res.json(result)
        })
    },
    read: function(req, res, isSingle) {
        var query = req.query,
            params = req.params,
            single = isSingle ? isSingle : ( !common.isEmptyObject(params) ? true : false )
        var p = single ? common.renameKey(params, { _id: 'id' }) : null
        this._read(query, p).then(function(result) {
            var json = single ? result[0] : result
            res.json(json)
        }, function(err) {
            res.json(err)
        })
    },
    delete: function(req, res) {
        var query = req.query
        var params = req.params
        this._delete(query, params, res).then(function(result) {
            res.json(result)
        }, function(err) {
            res.json(err)
        })
    },
    install: function(data, isRemoveAll) {
        var _this = this
        var installer = function() {
            return _this._create(data).then(function() {
                console.log('DbClass install ' + _this.modelName + ' ready')
            })
        }

        if(isRemoveAll) {
            return _this._delete({}).then(function() {
                return installer()
            })
        } else {
            return installer()
        }
    }
})
module.exports = DbClass