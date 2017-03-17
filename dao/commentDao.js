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
        //     id: shortid.generate(),
        //     content: req.body.content,
        //     date: moment().format('YYYY-MM-DD HH:mm:ss'),
        //     replyNum: 0,
        //     starNum: 0,
        //     replyUserid: req.body.replyid || -1,
        //     replyName: req.body.replyName || ''
        // }


        var newComment = {
            userid: 666,
            nickname: 'req.body.nickname',
            avatar: 'req.body.avatar',
            level: 'req.body.level',
            articleid: "58cb362e2618f306f6654475",
            id: shortid.generate(),
            content: 'req.body.content',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            replyNum: 0,
            starNum: 0,
            replyUserid: -1,
            replyName: ''
        }
        Comment.save(newComment.articleid, newComment, function (err, user) {
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
        // if (!req.body || tools.isBlank(req.body.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // } else if (tools.isBlank(req.body.commentid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少commentid'
        //     })
        //     return;
        // }

        Comment.remove("58cb362e2618f306f6654475", 'Sy-GYGYjx', function (err, user) {
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
}

module.exports = new CommentDao()