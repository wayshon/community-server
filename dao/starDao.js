let Star = require('../models/stars'),
    tools = require('../config/tools'),
    moment = require('moment'),
    shortid = require('shortid');

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

class StarDao {
    addStar(req, res, next) {
        // if (tools.isBlank(req.body.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // }

        // let newStar = {
        //     userid: req.user.id,
        //     avatar: req.user.avatar,
        //     nickname: req.user.nickname,
        //     articleid: req.query.articleid,
        //     date: moment().format('YYYY-MM-DD HH:mm:ss')
        // }

        let newStar = {
            userid: '58ca89c769f5670763e062ca',
            avatar: 'req.user.avatar',
            nickname: 'req.user.nickname',
            articleid: '58cf87a97639d925b8fe298b',
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        Star.hasStar(newStar.userid, newStar.articleid, function (err, flag) {
            if (flag) {
                jsonWrite(res, {
                    code: 200,
                    msg: '已赞'
                });
            } else {
                Star.save(newStar, function (err, user) {
                    if (err) {
                        jsonWrite(res, undefined);
                        return;
                    }
                    jsonWrite(res, {
                        code: 200,
                        msg: '点赞成功'
                    });
                });
            }
        })

        
    }

    removeStar(req, res, next) {
        // if (tools.isBlank(req.query.starid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少starid'
        //     })
        //     return;
        // }

        Star.remove('58cf87a97639d925b8fe298b', '58ca89c769f5670763e062ca', function (err) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
              code: 200,
              msg: '取消成功'
          });
        });
    }

    getStarList(req, res, next) {
        // if (tools.isBlank(req.query.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // }

        let articleid = req.query.articleid,
            page = req.query.page || 1,
            limit = req.query.limit || 10;
        Star.getList("58cf87a97639d925b8fe298b", page, limit, function (err, listOb, total) {
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

    findHasStar(req, res, next) {
        Star.hasStar(userid, articleid, function (err, flag) {

        })
    }
}

module.exports = new StarDao()