var Article = require('../models/article.js'),
    tools = require('../config/tools.js');

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

class ArticleDao {
    addArticle(req, res, next) {
        // if (!req.body || tools.isBlank(req.body.type)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少type'
        //     })
        //     return;
        // } else if (tools.isBlank(req.body.content)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '内容不能为空'
        //     })
        //     return;
        // }
        // var newArticle = {
        //     userid: userid,
        //     username: username,
        //     avatar: avatar,
        //     level: level,
        //     type: type,
        //     title: title,
        //     content: content,
        //     imgs: imgs
        // }

        var newArticle = {
            userid: 111,
            username: 'aaaa',
            avatar: 'aaaa',
            level: 'aaaa',
            type: 'aaaa',
            title: 'aaaa',
            content: 'aaaa',
            imgs: ['aaaa', 'aaaa']
        }
        Article.save(newArticle, function (err, article) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          
          jsonWrite(res, {
              code: 200,
              msg: '发布成功',
              article: article
          });
        });
    }
    
    getArticle(req, res, next) {
        if (!req.query ||tools.isBlank(req.query.id)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少文章id'
            })
            return;
        }
        // var articleid = req.query.id || "58ca9910af5de50b837cb13e";
        Article.get(req.query.id, function (err, article) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, article);
        })
    }
}

module.exports = new ArticleDao()