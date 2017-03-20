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
        // if (tools.isBlank(req.body.type)) {
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

        // let newArticle = {
        //     userid: req.body.userid,
        //     nickname: req.body.nickname,
        //     avatar: req.body.avatar,
        //     level: req.body.level,
        //     type: req.body.type,
        //     title: req.body.title || '',
        //     date: moment().format('YYYY-MM-DD HH:mm:ss'),
        //     content: req.body.content,
        //     commentNum: 0,
        //     starNum: 0,
        //     readNum: 0,
        //     handpick: false,
        //     imgs: req.body.imgs || []
        // }

        let newArticle = {
            userid: '原始的',
            nickname: '原始的',
            avatar: '原始的',
            level: '原始的',
            type: '原始的',
            title: '原始的' || '',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            content: '原始的',
            commentNum: 0,
            starNum: 0,
            readNum: 0,
            collectionNum: 0,
            handpick: false,
            imgs: ['原始的','原始的','原始的'],
            collections: []
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

    removeArticle(req, res, next) {
        // if (tools.isBlank(req.query.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // }

        Article.remove('58cf87a97639d925b8fe298b', function (err) {
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

    updateArticle(req, res, next) {
        // if (tools.isBlank(req.body.type)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少type'
        //     })
        //     return;
        // } else if (tools.isBlank(req.body.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // } else if (tools.isBlank(req.body.content)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '内容不能为空'
        //     })
        //     return;
        // }

        // let newArticle = {
        //     type: req.body.type,
        //     title: req.body.title || '',
        //     content: req.body.content,
        //     imgs: req.body.imgs || []
        // }

        let newArticle = {
            type: '我改啦',
            title: '我改啦',
            content: '我改啦',
            imgs: ['我改啦','我改啦']
        }

        Article.update('58cf87a97639d925b8fe298b', newArticle, function (err, article) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          
          jsonWrite(res, {
              code: 200,
              msg: '修改成功',
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

        Article.get('58cf87a97639d925b8fe298b', function (err, article) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(article)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '文章不存在'
                });
                return;
            }
            if (req.user && article.collections.findIndex(v => v == req.user.id) !== -1) {
                article.isCollected = true;
            } else {
                article.isCollected = false;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                ob: article
            });
        })
    }

    getArticleList(req, res, next) {
        let search = req.query.search || '',
            page = req.query.page || 1,
            limit = req.query.limit || 8;
        Article.getList(search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            
            judgeCollected(listOb)
            
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }

    getHandpickList(req, res, next) {
        let page = req.query.page || 1,
            limit = req.query.limit || 8;
        Article.handpickList(page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }

    getArticleListByType(req, res, next) {
        if (tools.isBlank(req.query.type)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少type'
            })
            return;
        }

        let search = req.query.search || '',
            type = req.query.type,
            page = req.query.page || 1,
            limit = req.query.limit || 8;

        Article.articleListByType(type, search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }

    getArticleListByUser(req, res, next) {
        if (tools.isBlank(req.query.userid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少userid'
            })
            return;
        }

        let search = req.query.search || '',
            userid = req.query.userid,
            page = req.query.page || 1,
            limit = req.query.limit || 8;

        Article.articleListByUser(userid, search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }

    getArticleListByCollection(req, res, next) {
        if (tools.isBlank(req.query.userid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少userid'
            })
            return;
        }

        let search = req.query.search || '',
            userid = req.query.userid,
            page = req.query.page || 1,
            limit = req.query.limit || 8;

        Article.articleListByCollection(userid, search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(listOb)
            
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total
            });
        })
    }

    /**收藏文章 */
    addArticleCollections(req, res, next) {
        // if (tools.isBlank(req.query.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // } else if (tools.isBlank(req.query.userid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少userid'
        //     })
        //     return;
        // }

        req.query.articleid = '58cf87a97639d925b8fe298b';
        req.query.userid = '58ca89c769f5670763e062ca';

        Article.get(req.query.articleid, function (err, article) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(article)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '文章不存在'
                });
                return;
            }
            if (article.collections.findIndex(v => v == req.query.userid) !== -1) {
                jsonWrite(res, {
                    code: 200,
                    msg: '已收藏'
                });
                return;
            }
            Article.addCollections(req.query.articleid, req.query.userid, function (err) {
                if (err) {
                    jsonWrite(res, undefined);
                    return;
                }
                jsonWrite(res, {
                    code: 200,
                    msg: '收藏成功'
                });
            });
        })
    }

    /**取消收藏 */
    removeArticleCollections(req, res, next) {
        // if (tools.isBlank(req.query.articleid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少articleid'
        //     })
        //     return;
        // } else if (tools.isBlank(req.query.userid)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少userid'
        //     })
        //     return;
        // }

        Article.removeCollections('58cf87a97639d925b8fe298b', '58ca89c769f5670763e062ca', function (err) {
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

}

module.exports = new ArticleDao()

/**判断是否已收藏 */
function judgeCollected(listOb) {
    if (!req.user) {
        listOb.forEach(article => {
            article.isCollected = false;
        })
    } else {
        listOb.forEach(article => {
            if (article.collections.findIndex(v => v == req.user.id) !== -1) {
                article.isCollected = true;
            } else {
                article.isCollected = false;
            }
        })
    }
}