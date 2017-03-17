//对文章的数据库存取操作
var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var moment = require('moment');
var Db = require('./db');
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
  name     : 'mongoPool',
  create   : function(callback) {
    var mongodb = Db();
    mongodb.open(function (err, db) {
      callback(err, db);
    })
  },
  destroy  : function(mongodb) {
    mongodb.close();
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});

class Article {
  /**存储一篇文章及其相关信息 */
  save(_article, callback) {
    //要存入数据库的文档
    var article = {
        userid: _article.userid,
        username: _article.username,
        avatar: _article.avatar,
        level: _article.level,
        type: _article.type,
        title: _article.title,
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: _article.content,
        comments: [],
        commentNum: 0,
        starNum: 0,
        readNum: 0,
        handpick: false,
        imgs: _article.imgs
    }

    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.insert(article, {
          safe: true
        }, function (err, article) {
          cb(err, db, article);
        });
      }
    ], function (err, db, article) {
      pool.release(db);
      callback(err, article.ops[0]);
    });
  }

  /**获取一篇文章 */
  get(_id, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          "_id": new ObjectID(_id)
        }, function (err, doc) {
          cb(err, db, collection, doc);
        });
      },
      function (db, collection, doc, cb) {
        if (doc) {
          //每访问 1 次，readNum 值增加 1
          collection.update({
            "_id": new ObjectID(_id)
          }, {
            $inc: {"readNum": 1}     //$int只能操作整数，这里每次递增1
          }, function (err) {
            cb(err, db, doc);
          });
        } else {
          cb({msg: '没有找到文章'}, db, doc);
        }
      }
    ],function (err, db, doc) {
      pool.release(db);
      callback(err, doc);//返回查询的一篇文章
    });
  }

  /**读取文章列表 */
  getArticleList(search, page, limit, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        var query = {};
        if (search) {
          var key = new RegExp(search, "i");
          query.search = key;
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, db, collection, total);
        });
      },
      function (db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1)*10,
          limit: limit
        }).sort({
          date: -1
        }).toArray(function (err, docs) {
          cb(err, db, docs, total);
        });
      }
    ], function (err, db, docs, total) {
      pool.release(db);
      callback(err, docs, total);
    });
  }

  /**更新一篇文章 */
  update(_id, article, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.update({
          "_id": new ObjectID(_id)
        }, {
          $set: {article: article}
        }, function (err) {
          cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  /**删除一篇文章 */
  remove(_id, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.remove({
          "_id": new ObjectID(_id)
        }, {
          w: 1
        }, function (err) {
          cb(err, db)
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }
  // /**存储一篇文章及其相关信息 */
  // save(callback) {
  //   var date = new Date();
  //   //存储各种时间格式，方便以后扩展
  //   var time = {
  //       date: date,
  //       year : date.getFullYear(),
  //       month : date.getFullYear() + "-" + (date.getMonth() + 1),
  //       day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
  //       minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
  //       date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  //   }
  //   //要存入数据库的文档
  //   var article = {
  //       userid: this.userid,
  //       username: this.username,
  //       avatar: this.avatar,
  //       level: this.level,
  //       type: this.type,
  //       title: this.title,
  //       date: time.minute,
  //       content: this.content,
  //       comments: [],
  //       commentNum: 0,
  //       starNum: 0,
  //       readNum: 0,
  //       handpick: false,
  //       imgs: this.imgs
  //   }

  //   //打开数据库
  //   pool.acquire(function (err, db) {
  //     if (err) {
  //       return callback(err);
  //     }
  //     //读取 articles 集合
  //     db.collection('articles', function (err, collection) {
  //       if (err) {
  //         pool.release(db);
  //         return callback(err);
  //       }
  //       //将文档插入 articles 集合
  //       collection.insert(article, {
  //         safe: true
  //       }, function (err) {
  //         pool.release(db);
  //         if (err) {
  //           return callback(err);//失败！返回 err
  //         }
  //         callback(null);//返回 err 为 null
  //       });
  //     });
  //   });
  // }

  // /**读取文章列表 */
  // getArticleList(search, page, limit, callback) {
  //   //打开数据库
  //   pool.acquire(function (err, db) {
  //     if (err) {
  //       return callback(err);
  //     }
  //     //读取 articles 集合
  //     db.collection('articles', function (err, collection) {
  //       if (err) {
  //         pool.release(db);
  //         return callback(err);
  //       }
  //       var query = {};
  //       if (search) {
  //         var key = new RegExp(search, "i");
  //         query.search = key;
  //       }
  //       //使用 count 返回特定查询的文档数 total
  //       //这里多包了collection.count()这个壳
  //       collection.count(query, function (err, total) {
  //         //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
  //         collection.find(query, {
  //           skip: (page - 1)*10,
  //           limit: limit
  //         }).sort({
  //           date: -1
  //         }).toArray(function (err, docs) {
  //           pool.release(db);
  //           if (err) {
  //             return callback(err);
  //           }
  //           callback(null, docs, total);
  //         });
  //       });
  //     });
  //   });
  // }
  // /**获取一篇文章 */
  // getArticle(_id, callback) {
  //   //打开数据库
  //   pool.acquire(function (err, db) {
  //     if (err) {
  //       return callback(err);
  //     }
  //     //读取 articles 集合
  //     db.collection('articles', function (err, collection) {
  //       if (err) {
  //         pool.release(db);
  //         return callback(err);
  //       }
  //       //根据用户名、发表日期及文章名进行查询
  //       collection.findOne({
  //         "_id": new ObjectID(_id)
  //       }, function (err, doc) {
  //         if (err) {
  //           pool.release(db);
  //           return callback(err);
  //         }
  //         if (doc) {
  //           //每访问 1 次，readNum 值增加 1
  //           collection.update({
  //             "_id": new ObjectID(_id)
  //           }, {
  //             $inc: {"readNum": 1}     //$int只能操作整数，这里每次递增1
  //           }, function (err) {
  //             pool.release(db);
  //             if (err) {
  //               return callback(err);
  //             }
  //           });
  //           callback(null, doc);//返回查询的一篇文章
  //         }
  //       });
  //     });
  //   });
  // }
  // /**更新一篇文章 */
  // update(_id, article, callback) {
  //   //打开数据库
  //   pool.acquire(function (err, db) {
  //     if (err) {
  //       return callback(err);
  //     }
  //     //读取 articles 集合
  //     db.collection('articles', function (err, collection) {
  //       if (err) {
  //         pool.release(db);
  //         return callback(err);
  //       }
  //       //更新文章内容
  //       collection.update({
  //         "_id": new ObjectID(_id)
  //       }, {
  //         $set: {article: article}
  //       }, function (err) {
  //         pool.release(db);
  //         if (err) {
  //           return callback(err);
  //         }
  //         callback(null);
  //       });
  //     });
  //   });
  // }
  // /**删除一篇文章 */
  // remove(_id, callback) {
  //   //打开数据库
  //   pool.acquire(function (err, db) {
  //     if (err) {
  //       return callback(err);
  //     }
  //     //读取 articles 集合
  //     db.collection('articles', function (err, collection) {
  //       if (err) {
  //         pool.release(db);
  //         return callback(err);
  //       }
        
  //       collection.remove({
  //         "_id": new ObjectID(_id)
  //       }, {
  //         w: 1
  //       }, function (err) {
  //         pool.release(db);
  //         if (err) {
  //           return callback(err);
  //         }
  //         callback(null);
  //       });
  //     });
  //   });
  // }
}

module.exports = new Article();