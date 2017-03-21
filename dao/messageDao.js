let Message = require('../models/messages'),
    tools = require('../config/tools'),
    moment = require('moment');

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
        // if (!req.query ||tools.isBlank(req.query.userid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少userid'
        //     })
        //     return;
        // }
        let articleid = req.query.articleid,
            page = req.query.page || 1,
            limit = req.query.limit || 10;
        Message.getList("58ca89c769f5670763e062ca", page, limit, function (err, listOb, total) {
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