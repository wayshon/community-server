let ObjectID = require('mongodb').ObjectID,
    async = require('async');

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


class Vote {
  save(vote, callback) {
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
        collection.insert(vote, {
          safe: true
        }, function (err, doc) {
          cb(err, db, doc);
        });
      }
    ], function (err, db, doc) {
      pool.release(db);
      callback(err,doc.ops[0]);
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
        db.collection('votes', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        collection.findOne({
          "_id": new ObjectID(_id)
        }, function (err, vote) {
          cb(err, db, vote);
        });
      }
    ],function (err, db, vote) {
      pool.release(db);
      callback(err, vote);
    });
  }

  commitVote(_id, val, callback) {
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
        collection.update({
          "_id": new ObjectID(_id)
        }, {
          $push: {
            [`choices.${val.index}.users`]: val.user,
          }
        }, function (err) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('voteusers', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let voteUser = {
            userid: val.user.userid,
            nickname: val.user.nickname,
            avatar: val.user.avatar,
            level: val.user.level,
            voteid: _id
        }
        collection.insert(voteUser, {
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

  getList(search, page, limit, callback) {
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
        let query = {};
        if (search) {
          let key = new RegExp(search, "i");
          query.title = key;
        }
        collection.count(query, function (err, total) {
          cb(err, query, db, collection, total);
        });
      },
      function (query, db, collection, total, cb) {
        collection.find(query, {
        //   skip: (page - 1) * limit,
        //   limit: limit,
            imgs: false,
            choices: false,
        }).skip((page - 1) * limit).limit(limit).sort({
          date: -1
        }).toArray(function (err, list) {
          cb(err, db, list, total);
        });
      }
    ], function (err, db, list, total) {
      pool.release(db);
      callback(err, list, total);
    });
  }

  hasVoted(_voteid, _userid, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('voteusers', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {
          voteid: _voteid,
          userid: _userid
        }
        collection.count(query, function (err, total) {
          cb(err, db, total);
        });
      }
    ],function (err, db, total) {
      pool.release(db);
      if (total == 0) {
        callback(err, false);
      } else {
        callback(err, true);
      }
    });
  }

  getVoteUserList(_userid, _voteid, page, limit, callback) {
    async.waterfall([
      function (cb) {
        pool.acquire(function (err, db) {
          cb(err, db);
        });
      },
      function (db, cb) {
        db.collection('voteusers', function (err, collection) {
          cb(err, db, collection);
        });
      },
      function (db, collection, cb) {
        let query = {
            userid: _userid,
            voteid: _voteid
        };
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
        }).toArray(function (err, list) {
          cb(err, db, list, total);
        });
      }
    ], function (err, db, list, total) {
      pool.release(db);
      callback(err, list, total);
    });
  }
};

module.exports = new Vote();