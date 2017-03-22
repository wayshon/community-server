let ObjectID = require('mongodb').ObjectID;
let tools = require('../config/tools');
let Db = require('./db');
let async = require('async');
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
    pool.release(db);
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});

class Star {
  save(star, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('stars', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.insert(star, {
          safe: true
        }, function (err) {
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
          "_id": new ObjectID(star.articleid)
        }, {
          $inc: {"starNum": 1}
        }, function (err) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          "_id": new ObjectID(star.articleid)
        },{
          userid: true,
          avatar: true,
          nickname: true,
          content: true
        },function (err, message) {
          message.articleid = message._id.toString();
          message.fromid = star.userid;
          message.comment = null;
          message.date = star.date;
          message.star = true;

          delete message._id;

          cb(err, db, message);
        });
      },
      function (db, message, cb) {
        db.collection('messages', function (err, collection) {
          cb(err, db, collection, message);
        });
      },
      function (db, collection, message, cb) {
        collection.findOne({
          fromid: message.fromid,
          userid: message.userid
        }, function (err, doc) {
          cb(err, db, collection, message, doc);
        });
      },
      // function (db, collection, message, cb) {
      //   let query = {
      //     fromid: message.fromid,
      //     userid: message.userid
      //   }
      //   collection.count(query, function (err, total) {
      //     if (err) {
      //       cb(err, db);
      //     } else if (total > 0) {
      //       collection.update({
      //         "_id": new ObjectID(_articleid)
      //       }, {
      //         $push: {"collections": _userid}
      //       } , function (err) {
      //           cb(err, db);
      //       });
      //     } else {
      //       collection.insert(message, {
      //         safe: true
      //       }, function (err) {
      //         cb(err, db);
      //       });
      //     }
      //   });
      // },
      function (db, collection, message, doc, cb) {
        if (tools.isBlank(doc)) {
          collection.insert(message, {
            safe: true
          }, function (err) {
            cb(err, db);
          });
        } else {
          collection.update({
            "_id": new ObjectID(doc._id)
          }, {
            $set: {
              date: message.date
            }
          } , function (err) {
              cb(err, db);
          });
        }
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  remove(_articleid, _userid, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('stars', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.remove({
          "articleid": _articleid,
          "userid": _userid
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

  getList(_articleid, page, limit, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('stars', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {
          articleid: _articleid
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
        }).toArray(function (err, stars) {
          cb(err, db, stars, total);
        });
      }
    ], function (err, db, stars, total) {
      pool.release(db);
      callback(err, stars, total);
    });
  }

  hasStar(_userid, _articleid, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('stars', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {
          articleid: _articleid,
          userid: _userid
        }
        //使用 count 返回特定查询的文档数 total
        //这里多包了collection.count()这个壳
        collection.count(query, function (err, total) {
          cb(err, db, total);
        });
      }
    ], function (err, db, total) {
      pool.release(db);
      if (total == 0) {
        callback(err, false);
      } else {
        callback(err, true);
      }
    });
  }

}

module.exports = new Star();