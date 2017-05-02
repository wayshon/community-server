let User = require('../models/users'),
    tools = require('../config/tools'),
    ObjectID = require('mongodb').ObjectID;

// 向前台返回JSON方法的简单封装
let jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '500',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

//获取局域网ip
var os = require('os'),
    iptable = {},
    ifaces = os.networkInterfaces();
for (var dev in ifaces) {
    ifaces[dev].forEach(function (details, alias) {
        if (details.family == 'IPv4') {
            iptable[dev + (alias ? ':' + alias : '')] = details.address;
        }
    });
}
// console.log(iptable['en0:1']);

class UserDao {
    addUser(req, res, next) {
        if (tools.isBlank(req.body.openid)) {
            jsonWrite(res, {
                code: 500,
                msg: '添加用户失败，缺少openid'
            })
            return;
        }
        let newUser = {
            subscribe: req.body.subscribe || '', 
            openid: req.body.openid, 
            nickname: req.body.nickname || '', 
            sex: req.body.sex || 1, 
            language: req.body.language || 'zh_CN', 
            city: req.body.city || '', 
            province: req.body.province || '', 
            country: req.body.country || '', 
            headimgurl: req.body.headimgurl || '', 
            subscribe_time: req.body.subscribe_time || new Date().getTime(),
            unionid: req.body.unionid || '',
            remark: req.body.remark || '',
            groupid: req.body.groupid || -1,
            phone: req.body.phone || -1
        }

        User.save(newUser, function (err, user) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, user);
        });
    }

    getUser(req, res, next) {
        // if (tools.isBlank(req.query.id)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少用户id'
        //     })
        //     return;
        // }
        User.get("58ca89c769f5670763e062ca", function (err, user) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(user)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '用户不存在'
                });
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                ob: user
            });
        })
    }

    removeUser(req, res, next) {
        if (tools.isBlank(req.query.userid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少userid'
            })
            return;
        }

        User.remove(req.query.userid, function (err) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
              code: 200,
              msg: '删除成功'
          });
        });
    }

    getUserInfo(req, res, next) {
        // if (tools.isBlank(req.users)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '尚未登录'
        //     })
        //     return;
        // }
        // try {
        //   new ObjectID(req.users.id)
        // } catch(err) {
        //   jsonWrite(res, {
        //         code: 500,
        //         msg: 'userid不正确'
        //     })
        //     return;
        // }

        User.userInfo(req.users.id, function (err, user) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(user)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '用户不存在'
                });
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                ob: user
            });
        })
    }

    getOtherInfo(req, res, next) {
        if (tools.isBlank(req.query.userid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少userid'
            })
            return;
        }

        try {
          new ObjectID(req.query.userid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'userid不正确'
            })
            return;
        }

        User.otherInfo(req.query.userid, function (err, user) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(user)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '用户不存在'
                });
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                ob: user
            });
        })
    }
    /**上传图片 */
    uploadImg(req, res, next) {
        var dataBuffer = new Buffer(req.body.img, 'base64'),
            userid = req.user.id,
            name = req.body.imgName || Date.now(),
            imgpath = "images/" + userid + "/" + name + ".png",
            absolutePath = "http://" + iptable['en0:1'] + ":8899/" + imgpath;
        if (!fs.existsSync("./public/images/" + userid)) {
            fs.mkdirSync("./public/images/" + userid);
        }

        fs.writeFile("./public/" + imgpath, dataBuffer, function (err) {
            if (err) {
                console.log(err)
                jsonWrite(res, undefined)
            } else {
                jsonWrite(res, {
                    code: 200,
                    ob: {
                        path: absolutePath
                    },
                    msg: "上传成功"
                });
            }
        });
    }
}

module.exports = new UserDao()