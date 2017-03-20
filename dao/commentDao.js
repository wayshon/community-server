var Comment = require('../models/comments'),
    tools = require('../config/tools'),
    moment = require('moment'),
    shortid = require('shortid');

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

class CommentDao {
    addComment(req, res, next) {
        // if (!req.body || tools.isBlank(req.body.content)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少内容'
        //     })
        //     return;
        // } else if (tools.isBlank(req.body.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // }

        // var newComment = {
        //     userid: req.body.userid,
        //     nickname: req.body.nickname,
        //     avatar: req.body.avatar,
        //     level: req.body.level,
        //     articleid: req.body.articleid,
        //     content: req.body.content,
        //     date: moment().format('YYYY-MM-DD HH:mm:ss'),
        //     starNum: 0,
        //     replyUserid: req.body.replyid || -1,
        //     replyName: req.body.replyName || ''
        // }


        var newComment = {
            userid: 666,
            nickname: 'req.body.nickname',
            avatar: 'req.body.avatar',
            level: 'req.body.level',
            articleid: "58cf87a97639d925b8fe298b",
            content: 'req.body.content',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            starNum: 0,
            replyUserid: -1,
            replyName: ''
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
        // if (tools.isBlank(req.query.commentid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少commentid'
        //     })
        //     return;
        // }

        Comment.remove("58cf455e102ded0c3dec9d0c", function (err) {
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
        Comment.getList("58cf87a97639d925b8fe298b", page, limit, function (err, listOb, total) {
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

module.exports = new CommentDao()