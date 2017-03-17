var User = require('../models/user.js'),
    tools = require('../config/tools.js');

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

class UserDao {
    addUser(req, res, next) {
        if (!req.body || tools.isBlank(req.body.openid)) {
            jsonWrite(res, {
                code: 500,
                msg: '添加用户失败，缺少openid'
            })
            return;
        }
        var newUser = {
            subscribe: req.subscribe || '', 
            openid: req.openid, 
            nickname: req.nickname || '', 
            sex: req.sex || 1, 
            language: req.language || 'zh_CN', 
            city: req.city || '', 
            province: req.province || '', 
            country: req.country || '', 
            headimgurl: req.headimgurl || '', 
            subscribe_time: req.subscribe_time || new Date().getTime(),
            unionid: req.unionid || '',
            remark: req.remark || '',
            groupid: req.groupid || -1,
            phone: req.phone || -1
        }
        User.save(newUser, function (err, user) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, user);
        });
    }

    getUser(req, res, next) {
        if (!req.query ||tools.isBlank(req.query.id)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少用户id'
            })
            return;
        }
        // var userid = req.query.id || "58ca89c769f5670763e062ca";
        User.get(req.query.id, function (err, user) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, user);
        })
    }
}

module.exports = new UserDao()