var objectid = require('objectid')
var common = require('../../system/common')

var id1 = objectid()
var id2 = objectid()
var id3 = objectid()
var id4 = objectid()
var id5 = objectid()
var id6 = objectid()
var id7 = objectid()

module.exports = {
    installer: 'catagory',
    data: [
        {
            _id: id1,
            name: '猫猫',
            isEnable: true
        },
        {
            _id: id2,
            parentId: id1,
            name: '小猫',
            isEnable: true,
            alias: 'cat1'
        },
        {
            _id: id3,
            parentId: id2,
            name: '小花猫',
            isEnable: true
        },
        {
            _id: id4,
            name: '狗狗',
            isEnable: true,
            alias: 'dog'
        },
        {
            _id: id5,
            parentId: id4,
            name: '赛虎',
            isEnable: true
        },
        {
            _id: id6,
            parentId: id4,
            name: '来福',
            isEnable: false
        },
        {
            _id: id7,
            name: '兔子',
            isEnable: true
        }
    ]
}