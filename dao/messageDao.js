let Message = require('../models/messages'),
    tools = require('../config/tools'),
    ObjectID = require('mongodb').ObjectID;

// 向前台返回JSON方法的简单封装
let jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '500',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

class MessageDao {

    getMessageList(req, res, next) {
        // if (tools.isBlank(req.users)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '尚未登录'
        //     })
        //     return;
        // }
        // try {
        //   new ObjectID(req.users.id)
        // } catch(err) {
        //   jsonWrite(res, {
        //         code: 500,
        //         msg: 'userid不正确'
        //     })
        //     return;
        // }
        let page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Message.getList(req.users.id, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
            });
        })
    }
}

module.exports = new MessageDao()