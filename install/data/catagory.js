var objectid = require('objectid')
var ids = require('../ids').mockCatagoryIds
var common = require('../../system/common')

function randomSelect (a, b) {
    return (Math.random() * 10) > 5 ? a : b
}
function data (j) {
    var result = []
    for (var i = 0; i < j; i++) {
        var id = objectid()
        var o = {
            _id: id,
            name: 'catagory' + Math.round(Math.random() * 10000),
            isEnable: randomSelect(true, false)
        }
        result.push(o)
    }
    return result
}
function data2 (j) {
    var str = ['love', 'what', 'fuck', 'hero', 'self', 'menu', 'ohh', 'beat', 'beauty', 'want']
    var result = []


    for (var i = 0; i < j; i++) {
        var id = objectid()
        var k = Math.round(Math.random() * 12)
        var catagoryId = ids['id' + Math.floor(Math.random() * 6)]
        var o = {
            parentId: catagoryId,
            _id: id,
            name: 'cat2__' + (str[k] ? str[k] : Math.round(Math.random() * 10000)),
            isEnable: randomSelect(true, false)
        }
        result.push(o)
    }
    return result
}

var staticData = [
    {
        _id: ids.id1,
        name: '猫猫',
        isEnable: true
    },
    {
        _id: ids.id2,
        parentId: ids.id1,
        name: '小猫',
        isEnable: true,
        alias: 'cat1'
    },
    {
        _id: ids.id3,
        parentId: ids.id2,
        name: '小花猫',
        isEnable: true
    },
    {
        _id: ids.id4,
        name: '狗狗',
        isEnable: true,
        alias: 'dog'
    },
    {
        _id: ids.id5,
        parentId: ids.id4,
        name: '赛虎',
        isEnable: true
    },
    {
        _id: ids.id6,
        parentId: ids.id4,
        name: '来福',
        isEnable: false
    },
    {
        _id: ids.id7,
        name: '兔子',
        isEnable: true
    }
]

var result = data(6).concat(staticData).concat(data2(12))
var o = {
    installer: 'catagory',
    defer: true,
    data: result
}
module.exports = o