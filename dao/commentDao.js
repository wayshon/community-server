let Comment = require('../models/comments'),
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

class CommentDao {
    addComment(req, res, next) {
        if (!req.body || tools.isBlank(req.body.content)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少内容'
            })
            return;
        } else if (tools.isBlank(req.body.articleid)) {
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

        let newComment = {
            userid: req.users.id,
            nickname: req.users.name,
            avatar: req.users.avatar,
            level: req.users.level,
            articleid: req.body.articleid,
            content: req.body.content,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            starNum: 0,
            replyUserid: req.body.replyid || -1,
            replyName: req.body.replyName || ''
        }

        Comment.save(newComment, function (err, user) {
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

    removeComment(req, res, next) {
        if (tools.isBlank(req.query.commentid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少commentid'
            })
            return;
        }
        try {
            new ObjectID(req.query.commentid)
        } catch(err) {
            jsonWrite(res, {
                code: 500,
                msg: 'commentid不正确'
            })
            return;
        }

        Comment.remove(req.query.commentid, function (err) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
              code: 200,
              msg: '删除成功'
          });
        });
    }

    getCommentList(req, res, next) {
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
        Comment.getList(articleid, page, limit, function (err, listOb, total) {
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

module.exports = new CommentDao()