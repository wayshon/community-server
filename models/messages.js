let async = require('async');

//对用户账号的数据库存取操作
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
    pool.release(db);
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});


class Message {
  save(_message, callback) {
    let message = {
        userid: _message.userid,
        avatar: _message.avatar,
        nickname: _message.nickname,
        authorid: _message.authorid,
        articleid: _message.articleid,
        content: _message.content,
        comment: _message.comment,
        date: _message.date,
        star: _message.star
    }

    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('messages', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
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

  get(_id, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('messages', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {authorid: _id};
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query).sort({
          date: -1
        }).toArray(function (err, messages) {
          cb(err, db, messages, total);
        });
      }
    ],function (err, db, messages, total) {
      pool.release(db);
      callback(err, messages, total);
    });
  }
};

module.exports = new Message();