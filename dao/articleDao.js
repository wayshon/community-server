let Article = require('../models/articles'),
    tools = require('../config/tools'),
    moment = require('moment'),
    fs = require('fs'),
    ObjectID = require('mongodb').ObjectID;

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
            userid: req.users.id,
            nickname: req.users.name,
            avatar: req.users.avatar,
            level: req.users.level,
            type: req.body.type,
            title: req.body.title || '',
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            content: req.body.content,
            commentNum: 0,
            starNum: 0,
            readNum: 0,
            collectionNum: 0,
            handpick: false,
            imgs: req.body.imgs || [],
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
        let imgs = [];
        Article.getImgs(req.query.articleid, function (err, imgs) {
            if (imgs) {
                imgs = imgs;
            }
        })
        Article.remove(req.query.articleid, function (err) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
              code: 200,
              msg: '删除成功'
          });
          /**删除文章包含的图片 */
          imgs.forEach(v => {
              fs.unlink(v);
          })
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

        Article.get(req.query.articleid, function (err, article) {
            if (err) {
                console.log(err)
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
            if (req.users && article.collections.findIndex(v => v == req.users.id) !== -1) {
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
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Article.getList(search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            judgeCollected(req, listOb)
            
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
            });
        })
    }

    getHandpickList(req, res, next) {
        let search = req.query.search || '',
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Article.handpickList(search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(req, listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
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

            judgeCollected(req, listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
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
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;

        Article.articleListByUser(userid, search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(req, listOb)

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
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
        try {
          new ObjectID(req.query.userid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'userid不正确'
            })
            return;
        }

        let search = req.query.search || '',
            userid = req.query.userid,
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;

        Article.articleListByCollection(userid, search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }

            judgeCollected(req, listOb)
            
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
            });
        })
    }

    /**收藏文章 */
    addArticleCollections(req, res, next) {
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

        Article.get(req.body.articleid, function (err, article) {
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
            if (article.collections.findIndex(v => v == req.users.id) !== -1) {
                jsonWrite(res, {
                    code: 200,
                    msg: '已收藏'
                });
                return;
            }
            Article.addCollections(req.body.articleid, req.users.id, function (err) {
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

        Article.removeCollections(req.query.articleid, req.users.id, function (err) {
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

    getTopList(req, res, next) {
        Article.getTopVoteList(function (err, voteList) {
            let limit = 3;
            if (voteList.length == 1)
                limit = 2;
            Article.getTopArticleList(limit, function (err, articleList) {
                if (err) {
                    jsonWrite(res, undefined);
                    return;
                }
                
                let listOb = voteList.concat(articleList)
                
                jsonWrite(res, {
                    code: 200,
                    msg: '获取成功',
                    listOb: listOb,
                    total: listOb.length,
                    isLastpage: true
                });
            })
        })
    }

}

module.exports = new ArticleDao()

/**判断是否已收藏 */
function judgeCollected(req, listOb) {
    if (!req.users) {
        listOb.forEach(article => {
            article.isCollected = false;
        })
    } else {
        listOb.forEach(article => {
            // console.log('------------')
            // console.log(article)
            if (article.collections.findIndex(v => v == req.users.id) !== -1) {
                article.isCollected = true;
            } else {
                article.isCollected = false;
            }
        })
    }
}