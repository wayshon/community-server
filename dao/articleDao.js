let Article = require('../models/articles'),
    tools = require('../config/tools'),
    moment = require('moment');

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

class ArticleDao {
    addArticle(req, res, next) {
        if (tools.isBlank(req.body.type)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少type'
            })
            return;
        } else if (tools.isBlank(req.body.content)) {
            jsonWrite(res, {
                code: 500,
                msg: '内容不能为空'
            })
            return;
        }

        let newArticle = {
            userid: req.body.userid,
            nickname: req.body.nickname,
            avatar: req.body.avatar,
            level: req.body.level,
            type: req.body.type,
            title: req.body.title || '',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            content: req.body.content,
            comments: [],
            commentNum: 0,
            starNum: 0,
            readNum: 0,
            handpick: false,
            imgs: req.body.imgs || []
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
        // if (tools.isBlank(req.query.id)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少文章id'
        //     })
        //     return;
        // }
        // Article.get(req.query.id, function (err, article) {
        //     if (err) {
        //         jsonWrite(res, undefined);
        //         return;
        //     }
        //     jsonWrite(res, article);
        // })

        let articleid = "58cb362e2618f306f6654475";
        Article.get(articleid, function (err, article) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, article);
        })
    }

    getArticleList(req, res, next) {
        let search = req.query.search || '',
            page = req.query.page || 4,
            limit = req.query.limit || 2;
        Article.getList(search, page, limit, function (err, listOb, total) {
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

module.exports = new ArticleDao()