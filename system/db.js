var mongoose = require('mongoose')
var dbs = mongoose.connect('mongodb://localhost:27017/test')
module.exports = dbs