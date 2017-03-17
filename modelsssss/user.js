/*
crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码
User与Post是对数据库中用户集合与博客集合的封装
*/
var crypto = require('crypto');
var async = require('async');

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


function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  //gravatar头像
  var md5 = crypto.createHash('md5'),
      email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),   //需要把 email 转化成小写再编码
      head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
  //要存入数据库的用户信息文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      head: head
  };

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


  //打开数据库
  // pool.acquire(function (err, db) {
  //   if (err) {
  //     return callback(err);//错误，返回 err 信息
  //   }
  //   //读取 users 集合
  //   db.collection('users', function (err, collection) {
  //     if (err) {
  //       pool.release(db);
  //       return callback(err);//错误，返回 err 信息
  //     }
  //     //将用户数据插入 users 集合
  //     collection.insert(user, {
  //       safe: true
  //     }, function (err, user) {
  //       pool.release(db);
  //       if (err) {
  //         return callback(err);//错误，返回 err 信息
  //       }
  //       callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
  //     });
  //   });
  // });
};

//读取用户信息
User.get = function(name, callback) {

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
        name: name
      }, function (err, user) {
        cb(err, db, user);
      });
    }
  ],function (err, db, user) {
    pool.release(db);
    callback(err, user);//成功！返回查询的用户信息
  });

  //打开数据库
  // pool.acquire(function (err, db) {
  //   if (err) {
  //     return callback(err);//错误，返回 err 信息
  //   }
  //   //读取 users 集合
  //   db.collection('users', function (err, collection) {
  //     if (err) {
  //       pool.release(db);
  //       return callback(err);//错误，返回 err 信息
  //     }
  //     //查找用户名（name键）值为 name 一个文档
  //     collection.findOne({
  //       name: name
  //     }, function (err, user) {
  //       pool.release(db);
  //       if (err) {
  //         return callback(err);//失败！返回 err 信息
  //       }
  //       callback(null, user);//成功！返回查询的用户信息
  //     });
  //   });
  // });
};