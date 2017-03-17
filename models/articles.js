//对文章的数据库存取操作
var ObjectID = require('mongodb').ObjectID;
var async = require('async');
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
        var query = {};
        if (search) {
          var key = new RegExp(search, "i");
          query.search = key;
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
}

module.exports = new Article();