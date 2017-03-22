//对文章的数据库存取操作
let ObjectID = require('mongodb').ObjectID;
let async = require('async');
let Db = require('./db');
let poolModule = require('generic-pool');
let pool = poolModule.Pool({
  name     : 'mongoPool',
  create   : function(callback) {
    let mongodb = Db();
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
  save(article, callback) {
    //要存入数据库的文档

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
          w: 1  //如果你只想删除第一条找到的记录可以设置 justOne 为 1
        }, function (err) {
          cb(err, db)
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
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
          $set: {
            'type': article.type,
            'title': article.title,
            'content': article.content,
            'imgs': article.imgs
          }
        }, function (err) {
          cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
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

  /**获取文章列表 */
  getList(search, page, limit, callback) {
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
        let query = {};
        if (search) {
          let key = new RegExp(search, "i");
          query.title = key;
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1) * limit,
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

  /**获取精选文章列表 */
  handpickList(page, limit, callback) {
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
        let query = {
          handpick: true
        };
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1) * limit,
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

  /**获取指定类型文章列表 */
  articleListByType(type, search, page, limit, callback) {
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
        let query = {
          type: type
        };
        if (search) {
          let key = new RegExp(search, "i");
          query.title = key;
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1) * limit,
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

  /**获取指定用户文章列表 */
  articleListByUser(userid, search, page, limit, callback) {
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
        let query = {
          userid: userid
        };
        if (search) {
          let key = new RegExp(search, "i");
          query.title = key;
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1) * limit,
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

  articleListByCollection(userid, search, page, limit, callback) {
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
        let query = {
          'collections': userid
        };
        if (search) {
          let key = new RegExp(search, "i");
          query.title = key;
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
          skip: (page - 1) * limit,
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

  addCollections(_articleid, _userid, callback) {
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
          "_id": new ObjectID(_articleid)
        }, {
          $push: {"collections": _userid}
        } , function (err) {
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
          "_id": new ObjectID(_articleid)
        }, {
          $inc: {"collectionNum": 1}
        }, function (err) {
          cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  removeCollections(_articleid, _userid, callback) {
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
          "_id": new ObjectID(_articleid)
        }, {
          $pull: {"collections" : _userid }
        } , function (err) {
            cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  getImgs(_id, callback) {
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
        },{
          "imgs": true
        },function (err, imgs) {
          cb(err, db, imgs);
        });
      }
    ],function (err, db, imgs) {
      pool.release(db);
      callback(err, imgs);
    });
  }

  /**获取顶部3条 */
  getTopArticleList(limit, callback) {
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
        collection.find({}).limit(limit).sort({
          date: -1
        }).toArray(function (err, docs) {
          cb(err, db, docs);
        });
      }
    ], function (err, db, docs) {
      pool.release(db);
      callback(err, docs);
    });
  }

  getTopVoteList(callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('votes', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.find({}).limit(1).toArray(function (err, votes) {
          cb(err, db, votes);
        });
      }
    ], function (err, db, votes) {
      pool.release(db);
      callback(err, votes);
    });
  }
  
}

module.exports = new Article();