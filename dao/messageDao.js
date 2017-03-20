var Message = require('../models/messages'),
    tools = require('../config/tools'),
    moment = require('moment');

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
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
    addMessage(req, res, next) {
        var newMessage = {
            userid: '58ca89c769f5670763e062ca',
            avatar: '_message.avatar',
            nickname: '_message.nickname',
            authorid: 777,
            articleid: 888,
            content: '_message.content',
            comment: '_message.comment',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            star: false
        }
        Message.save(newMessage, function (err, user) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
              code: 200,
              msg: '评论成功'
          });
        });
    }

    getMessageList(req, res, next) {
        // if (!req.query ||tools.isBlank(req.query.id)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少id'
        //     })
        //     return;
        // }
        // Message.get(req.query.id, function (err, user) {
        //     if (err) {
        //         jsonWrite(res, undefined);
        //         return;
        //     }
        //     jsonWrite(res, user);
        // })

        var id = 777;
        Message.get(id, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }
}

module.exports = new MessageDao()