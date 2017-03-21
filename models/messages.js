let async = require('async'),
    moment = require('moment'),
    tools = require('../config/tools');

//对用户账号的数据库存取操作
let ObjectID = require('mongodb').ObjectID;
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
  getList(userid, page, limit, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('readtimes', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          userid: userid
        }, function (err, readtime) {
          cb(err, db, collection, readtime);
        });
      },
      function (db, collection, readtime, cb) {
        if (tools.isBlank(readtime)) {
          collection.insert({
              userid: userid,
              time: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
            safe: true
          }, function (err) {
            cb(err, db);
          });
        } else {
          collection.update({
            "_id": new ObjectID(readtime._id)
          }, {
            $set: {
              time: moment().format('YYYY-MM-DD HH:mm:ss')
            }
          } , function (err) {
              cb(err, db);
          });
        }
      },
      function (db, cb) {
        db.collection('messages', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {userid: userid};
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
        }).toArray(function (err, messages) {
          cb(err, db, messages, total);
        });
      }
    ],function (err, db, messages, total) {
      pool.release(db);
      callback(err, messages, total);
    });
  }

  /**新的集合 readtimes */
  saveReadTime(readtime, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('readtimes', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.insert(readtime, {
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
};

module.exports = new Message();