/*
User与Post是对数据库中用户集合与博客集合的封装
*/
var ObjectID = require('mongodb').ObjectID,
    async = require('async');

//对用户账号的数据库存取操作
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
    pool.release(db);
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});


class User {
  /**保存用户 */
  save(user, callback) {
    var user = {
        subscribe: user.subscribe, 
        openid: user.openid, 
        nickname: user.nickname, 
        sex: user.sex, 
        language: user.language, 
        city: user.city, 
        province: user.province, 
        country: user.country, 
        headimgurl: user.headimgurl, 
        subscribe_time: user.subscribe_time,
        unionid: user.unionid,
        remark: user.remark,
        groupid: user.groupid,
        phone: user.phone
    }

    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('users', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.insert(user, {
          safe: true
        }, function (err, user) {
          cb(err, db, user);
        });
      }
    ], function (err, db, user) {
      pool.release(db);
      callback(err, user[0]);
    });
  }

  /**获取用户 */
  get(_id, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('users', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          "_id": new ObjectID(_id)
        }, function (err, user) {
          cb(err, db, user);
        });
      }
    ],function (err, db, user) {
      pool.release(db);
      callback(err, user);//成功！返回查询的用户信息
    });
  }
};

module.exports = new User();