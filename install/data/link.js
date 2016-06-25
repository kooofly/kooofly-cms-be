var objectid = require('objectid')
var common = require('../../system/common')
var ids = require('../ids').mockCatagoryIds

function randomSelect (a, b) {
    return (Math.random() * 10) > 5 ? a : b
}
function data (j) {
    var result = []
    var catagoryId = ids['id' + Math.floor(Math.random() * 5)]
    for (var i = 0; i < j; i++) {
        var id = objectid()
        var o = {
            catagoryId: catagoryId,
            _id: id,
            title: 'link' + Math.round(Math.random() * 10000),
            link: randomSelect('http://www.baidu.com', '/'),
            openMode: randomSelect('_blank', '_self'),
            isEnable: randomSelect(true, false)
        }
        result.push(o)
    }
    return result
}

module.exports = {
    installer: 'link',
    defer: true,
    data: data(102)
}