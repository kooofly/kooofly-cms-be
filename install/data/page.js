function createDocument(option) {
    var o = {
        isEnable: true,
        sort: sort ++
    }
    common.mix(o, option)
    return o;
}

module.exports = {
    installer: 'page',
    defer: true,
    data: [
        createDocument({"isEnable":true,"title":"Kooofly CMS Doc","router":"/doc","config":{"widgets":[{"widget":"logo"},{"widget":"nav"},{"widget":"tree"},{"widget":"article"},{"widget":"directory"}],"page":"doc"},"layout":"LayoutH"}),

        createDocument({"isEnable":true,"config":{"redirect":{"/sadmin/system":"/sadmin/system/page"},"page":"sadmin","widgets":[{"widget":"logo","params":""},{"widget":"nav-admin","params":{"uri":"menu"}},{"params":{"uri":"menu"},"widget":"tree"},{"widget":"search-admin","params":{"area":"$searchArea","key":"$searchKey","placeholder":"$searchHolder","isSenior":false,"query":"#mainQuery"}},{"params":{"uri":"&module","query":"#mainQuery","columns":"$columns","module":"&mainModule"},"widget":"table"},{"widget":"pagination","params":{"total":"#mainTotal","query":"#mainQuery"}}]},"title":"Smart Admin - Kooofly","router":"/sadmin/:module,/sadmin/:parentModule/:module","layout":"LayoutH"}),

        createDocument({"isEnable":true,"config":{"page":"sadmin","widgets":[{"widget":"logo","params":""},{"widget":"nav-admin","params":{"uri":"menu"}},{"params":{"uri":"menu"},"widget":"tree"},{"widget":"form","params":{"action":"create","module":"&module"}}]},"title":"Edit - Smart Admin - Kooofly","layout":"LayoutH","router":"/sadmin/:module/create,/sadmin/:parentModule/:module/create"})
    ]
}