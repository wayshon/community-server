/*
数据库中并没有comments集合，这里只是update articles集合中某个对象的comments数组
 */
var ObjectID = require('mongodb').ObjectID;
var Db = require('./db');
var async = require('async');
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
    pool.release(db);
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});

class Comment {
  save(_id, comment, callback) {
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
        //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
        collection.update({
          "_id": new ObjectID(_id)
        }, {
          $push: {"comments": comment}
        } , function (err, test) {
          console.log(test)
            cb(err, db);
        });
      }
    ], function (err, db) {
      pool.release(db);
      callback(err);
    });
  }

  remove(_articleid, _commentid, callback) {
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
          "_id": new ObjectID(_articleid)
        }, function (err, doc) {
          cb(err, db, collection, doc);
        });
      },
      function (db, collection, doc, cb) {
        var comments = doc.comments;
        var index = comments.findIndex(n => n.id == _commentid);
        comments.splice(index, 1)
        collection.update({
          "_id": new ObjectID(_articleid)
        }, {
          $set: {"comments": comments}
        }, function (err) {
          cb(err, db);
        });
      }
    ], function (err, db) {
      if (err) {
        console.log('***************************')
      }
      pool.release(db);
      callback(err);
    });
  }
}

module.exports = new Comment();