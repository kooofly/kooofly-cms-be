//所有类的基类
var Class = function () { };

//基类增加一个extend方法
Class.extend = function (prop) {
    var _super = this.prototype;
    var self = this;
    var prototype = Object.create(this.prototype);
    //把要扩展的属性复制到prototype变量上
    for (var name in prop) {

        /*prototype[name] = (function (name, fn) {
         return function () {
         //备份一下this._super
         var tmp = this._super;
         //替换成父类的同名ctor方法
         this._super = _super[name];
         //执行，此时fn中的this里面的this._super已经换成了_super[name],即父类的同名方法
         var ret = fn.apply(this, arguments);
         //把备份的还原回去
         this._super = tmp;
         return ret;
         };
         })(name, prop[name])*/

        //下面代码是让ctor里可以直接访问使用this._super访问父类构造函数，除了ctor的其他方法，this._super都是访问父类的实例
        prototype[name] = name == "ctor" ?
            (function (name, fn) {
                return function () {
                    //备份一下this._super
                    var tmp = this._super;
                    //替换成父类的同名ctor方法
                    this._super = _super[name];
                    //执行，此时fn中的this里面的this._super已经换成了_super[name],即父类的同名方法
                    var ret = fn.apply(this, arguments);
                    //把备份的还原回去
                    this._super = tmp;
                    return ret;
                };
            })(name, prop[name]) :
            prop[name];
    }

    //假的构造函数
    function Class() {
        //执行真正的ctor构造函数
        this.ctor.apply(this, arguments);
    }

    Class.prototype = prototype;

    //这里一定要用Object.create(this.prototype)
    //不能Class.prototype._super = prototype;（这里明显错误，prototype这时已经被copy进去了新的属性）
    //或者Class.prototype._super = _super;（这里会导致_super instanceof 不准确 ）
    Class.prototype._super = Object.create(this.prototype);


    Class.prototype.constructor = Class;
    //任何Class.extend的返回对象都将具备extend方法
    Class.extend = arguments.callee;

    return Class;
}
//module.exports = Class
var MyClass = Class.extend({
    ctor: function() {
        console.log('parent', this)
        console.log('parent a', this.a)
    },
    speak: function() {
        console.log('parent speak', this)
        console.log('parent speak a', this.a)
    },
    dodo: function() {
        console.log(this.a)
    }
})
var MyClass2 = MyClass.extend({
    ctor: function() {
        this.a = 4
        //console.log('child', this)
        this._super()
    },
    speak: function() {
        //console.log('child speak', this)
        this._super.speak.apply(this, arguments);

    }
})
var my = new MyClass2()
my.speak()
my.dodo()