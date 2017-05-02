let ObjectID = require('mongodb').ObjectID,
    async = require('async'),
    moment = require('moment'),
    tools = require('../config/tools');

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


class User {
  /**保存用户 */
  save(user, callback) {
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
      callback(err, user.ops[0]);
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

  remove(_id, callback) {
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

  userInfo(userid, callback) {
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
          "_id": new ObjectID(userid)
        }, function (err, user) {
          if (tools.isBlank(user)) {
            err = 'noUser'
          }
          cb(err, db, user);
        });
      },
      function (db, user, cb) {
        db.collection('readtimes', function (err, collection) {
          cb(err, db, collection, user);
        });
      },
      function (db, collection, user, cb) {
        collection.findOne({
          userid: userid
        }, function (err, readtime) {
          let time;
          if (readtime && readtime.time) {
            time = readtime.time;
          } else {
            time = moment().format('YYYY-MM-DD HH:mm:ss');
          }
          cb(err, db, user, time);
        });
      },
      function (db, user, time, cb) {
        db.collection('messages', function (err, collection) {
          cb(err, db, collection, user, time);
        });
      },
      function (db, collection, user, time, cb) {
        collection.count({
          "date" : {$gte : time}
        }, function (err, messageNum) {
          user.messageNum = messageNum;
          cb(err, db, user);
        });
      },
      function (db, user, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection, user);
        });
      },
      function (db, collection, user, cb) {
        collection.count({
          userid: userid
        }, function (err, articleNum) {
          user.articleNum = articleNum;
          cb(err, db, collection, user);
        });
      },
      function (db, collection, user, cb) {
        collection.count({
            collections: userid
          }, function (err, collectionNum) {
            user.collectionNum = collectionNum;
          cb(err, db, user);
        });
      }
    ],function (err, db, user) {
      pool.release(db);
      if (err == 'noUser') {
        callback(null, undefined);
      } else {
        callback(err, user);
      }
    });
  }

  otherInfo(userid, callback) {
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
          "_id": new ObjectID(userid)
        }, function (err, user) {
          if (tools.isBlank(user)) {
            err = 'noUser'
          }
          cb(err, db, user);
        });
      },
      function (db, user, cb) {
        db.collection('articles', function (err, collection) {
          cb(err, db, collection, user);
        });
      },
      function (db, collection, user, cb) {
        collection.count({
          userid: userid
        }, function (err, articleNum) {
          user.articleNum = articleNum;
          cb(err, db, collection, user);
        });
      },
      function (db, collection, user, cb) {
        collection.count({
            collections: userid
          }, function (err, collectionNum) {
            user.collectionNum = collectionNum;
          cb(err, db, user);
        });
      }
    ],function (err, db, user) {
      pool.release(db);
      if (err == 'noUser') {
        callback(null, undefined);
      } else {
        callback(err, user);
      }
    });
  }
};

module.exports = new User();