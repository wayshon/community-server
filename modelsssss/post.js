//对文章的数据库存取操作
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
    mongodb.close();
  },
  max      : 100,
  min      : 5,
  idleTimeoutMillis : 30000,
  log      : false
});

function Post(name, head, title, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
  this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var post = {
      name: this.name,
      head: this.head,
      time: time,
      title:this.title,
      tags: this.tags,
      post: this.post,
      comments: [],
      reprint_info: {},
      pv: 0
  };
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
      //将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function (err) {
        pool.release(db);
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
      });
    });
  });
};

//读取文章及其相关信息
// Post.getAll = function(name, callback) {
//   //打开数据库
//   mongodb.open(function (err, db) {
//     if (err) {
//       return callback(err);
//     }
//     //读取 posts 集合
//     db.collection('posts', function(err, collection) {
//       if (err) {
//         mongodb.close();
//         return callback(err);
//       }
//       var query = {};
//       if (name) {
//         query.name = name;
//       }
//       //根据 query 对象查询文章
//       collection.find(query).sort({
//         time: -1
//       }).toArray(function (err, docs) {
//         mongodb.close();
//         if (err) {
//           return callback(err);//失败！返回 err
//         }
//         //解析 markdown 为 html
//         docs.forEach(function (doc) {
//             doc.post = markdown.toHTML(doc.post);
//         });
//         callback(null, docs);//成功！以数组形式返回查询的结果
//       });
//     });
//   });
// };

//一次获取十篇文章
Post.getTen = function(name, page, callback) {
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
      var query = {};
      if (name) {
        query.name = name;
      }
      //使用 count 返回特定查询的文档数 total
      //这里多包了collection.count()这个壳
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
        collection.find(query, {
          skip: (page - 1)*10,    //这两行是精华
          limit: 10               //这两行是精华
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null, docs, total);
        });
      });
    });
  });
};

//获取一篇文章
Post.getOne = function(_id, callback) {
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
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, doc) {
        if (err) {
          pool.release(db);
          return callback(err);
        }
        if (doc) {
          //每访问 1 次，pv 值增加 1
          collection.update({
            "_id": new ObjectID(_id)
          }, {
            $inc: {"pv": 1}     //$int只能操作整数，这里每次递增1
          }, function (err) {
            pool.release(db);
            if (err) {
              return callback(err);
            }
          });
          callback(null, doc);//返回查询的一篇文章
        }
      });
    });
  });
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(_id, callback) {
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
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, doc) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        //返回查询的一篇文章（markdown 格式）  
        //这里是与getOne唯一不同的地方，因为getOne是展示所以要渲染为html，这里是编辑所以markdown
        //并且编辑页不用展示评论
        callback(null, doc);
      });
    });
  });
};

//更新一篇文章及其相关信息
Post.update = function(_id, post, callback) {
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
      //更新文章内容
      collection.update({
        "_id": new ObjectID(_id)
      }, {
        $set: {post: post}
      }, function (err) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

//删除一篇文章
Post.remove = function(_id, callback) {
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
      //查询要删除的文档
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, doc) {
        if (err) {
          pool.release(db);
          return callback(err);
        }
        //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
        var reprint_from_id = "";
        if (doc.reprint_info.reprint_from_id) {
          reprint_from_id = doc.reprint_info.reprint_from_id;
        }
        if (reprint_from_id != "") {
          //更新原文章所在文档的 reprint_to
          collection.update({
            "_id": new ObjectID(reprint_from_id)
          }, {
            $pull: {
              "reprint_info.reprint_to_ids": {
                "_id": new ObjectID(_id)
            }}
          }, function (err) {
            if (err) {
              pool.release(db);
              return callback(err);
            }
          });
        }

        //删除转载来的文章所在的文档
        collection.remove({
          "_id": new ObjectID(_id)
        }, {
          w: 1
        }, function (err) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      });
    });
  });
};

//返回所有文章存档信息
Post.getArchive = function(callback) {
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
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({}, {     //第一个参数是查找条件，第二个参数是查找结果的筛选
        "name": true,
        "time": true,
        "title": true
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        console.log(docs);
        callback(null, docs);
      });
    });
  });
};

//返回所有标签
Post.getTags = function(callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      //distinct 用来找出给定键的所有不同值,因为很多文章有相同的标签
      collection.distinct("tags", function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      //查询所有 tags 数组内包含 tag 的文档
      //并返回只含有 name、time、title 组成的数组
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      var pattern = new RegExp(keyword, "i");
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        pool.release(db);
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

//转载一篇文章
Post.reprint = function(reprint_from_id, reprint_to, callback) {
  pool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        pool.release(db);
        return callback(err);
      }
      //找到被转载的文章的原文档
      collection.findOne({
        "_id": new ObjectID(reprint_from_id)
      }, function (err, doc) {
        if (err) {
          pool.release(db);
          return callback(err);
        }

        var date = new Date();
        var time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }

        delete doc._id;//注意要删掉原来的 _id

        doc.name = reprint_to.name;
        doc.head = reprint_to.head;
        doc.time = time;
        doc.title = doc.title.includes('[转载]') ? doc.title : "[转载]" + doc.title;
        doc.comments = [];
        doc.reprint_info = {"reprint_from_id": reprint_from_id};
        doc.pv = 0;

        //将转载生成的副本修改后存入数据库，并返回存储后的文档
        collection.insert(doc, {
          safe: true
        }, function (err, post) {
          if (err) {
            return callback(err);
          }
          doc = post.ops[0];
        });

        //更新被转载的原文档的 reprint_info 内的 reprint_to
        collection.update({
          "_id": new ObjectID(reprint_from_id)
        }, {
          $push: {
            "reprint_info.reprint_to_ids": {
              "_id": doc._id
          }}
        }, function (err) {
          pool.release(db);
          if (err) {
            return callback(err);
          }
          callback(err, doc);
        });
      });
    });
  });
};