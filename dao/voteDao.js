let Vote = require('../models/votes'),
    tools = require('../config/tools'),
    moment = require('moment'),
    ObjectID = require('mongodb').ObjectID;

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

class VoteDao {
    addVote(req, res, next) {
        console.log(req.users)
        if (tools.isBlank(req.body.endtime)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少endtime'
            })
            return;
        } else if (tools.isBlank(req.body.choices) || req.body.choices.length < 2) {
            jsonWrite(res, {
                code: 500,
                msg: 'choices不正确'
            })
            return;
        }

        let choices = req.body.choices.map(v => {
            let obj = {
                name: v,
                users: []
            }
            return obj;
        })

        var newVote = {
            userid: req.users.id,
            nickname: req.users.name,
            avatar: req.users.avatar,
            level: req.users.level,
            startime: moment().format('YYYY-MM-DD HH:mm:ss'),
            endtime: req.body.endtime,
            type: req.body.type || '单选',
            desc: req.body.desc || '',
            imgs: req.body.imgs || [],
            choices: choices
        }

        Vote.save(newVote, function (err, vote) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
            code: 200,
            msg: "发布成功",
            ob: vote
          });
        });
    }

    getVote(req, res, next) {
        if (tools.isBlank(req.query.voteid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少voteid'
            })
            return;
        }

        try {
          new ObjectID(req.query.voteid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'voteid不正确'
            })
            return;
        }
        Vote.get(req.query.voteid, function (err, vote) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(vote)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '投票不存在'
                });
                return;
            }
            if (vote.startime < vote.endtime) {
                vote.state = 1; //未结束
            } else {
                vote.state = 0; //已结束
            }

            let total = 0;
            vote.choices.forEach(v => {
                total += v.users.length;
                v.count = v.users.length;
                if (total != 0) {
                    v.rate = v.count / total
                } else {
                    v.rate = 0;
                }
            })
            vote.total = total;

            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                ob: vote
            });
        })
    }

    commitVote(req, res, next) {
        if (tools.isBlank(req.body.voteid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少voteid'
            })
            return;
        } else if (tools.isBlank(req.body.voteIndex)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少voteIndex'
            })
            return;
        }

        try {
          new ObjectID(req.body.voteid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'voteid不正确'
            })
            return;
        }
        let param = {
            voteid: req.body.voteid,
            index: req.body.voteIndex,
            user: {
                userid: req.users.id,
                nickname: req.users.name,
                avatar: req.users.avatar,
                level: req.users.level
            }
        }

        Vote.get(req.body.voteid, function (err, vote) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            if (tools.isBlank(vote)) {
                jsonWrite(res, {
                    code: 500,
                    msg: '投票不存在'
                });
                return;
            }
            if (param.index >= vote.choices.length) {
                jsonWrite(res, {
                    code: 500,
                    msg: '参数有误'
                });
                return;
            }
            Vote.hasVoted(param.voteid, param.user.userid, function (err, flag) {
                if (err) {
                    jsonWrite(res, undefined);
                    return;
                }
                if (flag) {
                    jsonWrite(res, {
                        code: 500,
                        msg: '您已投过票'
                    });
                } else {
                    Vote.commitVote(param.voteid, param, function (err) {
                        if (err) {
                            jsonWrite(res, undefined);
                            return;
                        }
                        jsonWrite(res, {
                            code: 200,
                            msg: "投票成功"
                        });
                    });
                }
            });
        });
    }

    getVoteList(req, res, next) {
        let search = req.query.search || '',
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Vote.getList(search, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
            });
        })
    }

    getVoteUserList(req, res, next) {
        if (tools.isBlank(req.query.voteid)) {
            jsonWrite(res, {
                code: 500,
                msg: '缺少voteid'
            })
            return;
        }

        try {
          new ObjectID(req.query.voteid)
        } catch(err) {
          jsonWrite(res, {
                code: 500,
                msg: 'voteid不正确'
            })
            return;
        }

        let userid = req.users.id,
            voteid = req.query.voteid,
            page = parseInt(req.query.page) || 1,
            limit = parseInt(req.query.limit) || 10;
        Vote.getVoteUserList(userid, voteid, page, limit, function (err, listOb, total) {
            if (err) {
                jsonWrite(res, undefined);
                return;
            }
            jsonWrite(res, {
                code: 200,
                msg: '获取成功',
                listOb: listOb,
                total: total,
                isLastpage: page * limit >= total ? true : false
            });
        })
    }

    // updateVote(req, res, next) {
        
    //     Vote.update("58d1d0aeb2869906a628ec70", {a: "test"}, function (err) {
    //       if (err) {
    //         jsonWrite(res, undefined);
    //         return;
    //       }
    //       jsonWrite(res, {
    //         code: 200,
    //         msg: "更新成功"
    //       });
    //     });
    // }
}

module.exports = new VoteDao()