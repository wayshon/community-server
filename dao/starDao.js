let Star = require('../models/stars'),
    tools = require('../config/tools'),
    moment = require('moment'),
    shortid = require('shortid'),
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

class StarDao {
    addStar(req, res, next) {
        if (tools.isBlank(req.body.articleid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少articleid'
            })
            return;
        }

        try {
          new ObjectID(req.body.articleid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'articleid不正确'
            })
            return;
        }

        let newStar = {
            userid: req.users.id,
            avatar: req.users.avatar,
            nickname: req.users.name,
            articleid: req.body.articleid,
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
                    if (err == 'noArticle') {
                        jsonWrite(res, {
                            code: 500,
                            msg: '文章不存在'
                        });
                        return;
                    }
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
        if (tools.isBlank(req.query.articleid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少articleid'
            })
            return;
        }

        try {
          new ObjectID(req.query.articleid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'articleid不正确'
            })
            return;
        }
        
        Star.remove(req.query.articleid, req.users.id, function (err) {
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
        if (tools.isBlank(req.query.articleid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少articleid'
            })
            return;
        }

        try {
          new ObjectID(req.query.articleid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'articleid不正确'
            })
            return;
        }

        let articleid = req.query.articleid,
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Star.getList(articleid, page, limit, function (err, listOb, total) {
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

    findHasStar(req, res, next) {
        Star.hasStar(userid, articleid, function (err, flag) {

        })
    }
}

module.exports = new StarDao()