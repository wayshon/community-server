/*
数据库中并没有comments集合，这里只是updateposts集合中某个对象的comments数组
 */
var ObjectID = require('mongodb').ObjectID;
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

function Comment(_id, comment) {
  this._id = _id;
  this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
  var _id = this._id,
      comment = this.comment;
  //打开数据库
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
      collection.update({
        "_id": new ObjectID(_id)
      }, {
        $push: {"comments": comment}
      } , function (err) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null);
      });   
    });
  });
};