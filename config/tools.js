class Tools {
    isNotBlank(val) {
        if (typeof (val) == "undefined" || val == null || val == "") {
            return false;
        }
        return true;
    }
    isBlank(val) {
        if (typeof (val) == "undefined" || val == null || val == "") {
            return true;
        }
        return false;
    }
    //是数组
    isArray(val) {
        // if (this.isBlank(val))
        //     return false;
        return Object.prototype.toString.call(val) === '[object Array]';
    }
    //是空对象
    isEmptyObject(obj) {
        for (let key in obj) {
            return false
        };
        return true
    }
}

module.exports = new Tools;