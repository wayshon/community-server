let ObjectID = require('mongodb').ObjectID;
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

class Comment {
  // save(_id, comment, callback) {
  //   async.waterfall([
  //     function (cb) {
  //       pool.acquire(function (err, db) {
  //         cb(err, db);
  //       });
  //     },
  //     function (db, cb) {
  //       db.collection('articles', function (err, collection) {
  //         cb(err, db, collection);
  //       });
  //     },
  //     function (db, collection, cb) {
  //       //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
  //       collection.update({
  //         "_id": new ObjectID(_id)
  //       }, {
  //         $push: {"comments": comment}
  //       } , function (err, test) {
  //         console.log(test)
  //           cb(err, db);
  //       });
  //     }
  //   ], function (err, db) {
  //     pool.release(db);
  //     callback(err);
  //   });
  // }

  // remove(_articleid, _commentid, callback) {
  //   async.waterfall([
  //     function (cb) {
  //       pool.acquire(function (err, db) {
  //         cb(err, db);
  //       });
  //     },
  //     function (db, cb) {
  //       db.collection('articles', function (err, collection) {
  //         cb(err, db, collection);
  //       });
  //     },
  //     function (db, collection, cb) {
  //       collection.findOne({
  //         "_id": new ObjectID(_articleid)
  //       }, function (err, doc) {
  //         cb(err, db, collection, doc);
  //       });
  //     },
  //     function (db, collection, doc, cb) {
  //       let comments = doc.comments;
  //       let index = comments.findIndex(n => n.id == _commentid);
  //       comments.splice(index, 1)
  //       collection.update({
  //         "_id": new ObjectID(_articleid)
  //       }, {
  //         $set: {"comments": comments}
  //       }, function (err) {
  //         cb(err, db);
  //       });
  //     }
  //   ], function (err, db) {
  //     if (err) {
  //       console.log('***************************')
  //     }
  //     pool.release(db);
  //     callback(err);
  //   });
  // }


  save(comment, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('comments', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.insert(comment, {
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
          "_id": new ObjectID(comment.articleid)
        }, {
          $inc: {"commentNum": 1}
        }, function (err) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          "_id": new ObjectID(comment.articleid)
        },{
          userid: true,
          avatar: true,
          nickname: true,
          content: true
        },function (err, message) {
          message.articleid = message._id;
          message.fromid = comment.userid;
          message.comment = comment.content;
          message.date = comment.date;
          message.star = false;

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
        collection.insert(message, {
          safe: true
        }, function (err) {
          cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  remove(_id, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('comments', function (err, collection) {
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

  getList(_articleid, page, limit, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('comments', function (err, collection) {
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
        }).toArray(function (err, comments) {
          cb(err, db, comments, total);
        });
      }
    ], function (err, db, comments, total) {
      pool.release(db);
      callback(err, comments, total);
    });
  }

}

module.exports = new Comment();