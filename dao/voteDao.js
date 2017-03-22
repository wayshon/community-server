let Vote = require('../models/votes'),
    tools = require('../config/tools'),
    moment = require('moment');

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
        
        var newVote = {
            userid: '58ca89c769f5670763e062ca',
            nickname: '原始的',
            avatar: '原始的',
            level: '初学乍练',
            startime: moment().format('YYYY-MM-DD HH:mm:ss'),
            endtime: '2017-03-22',
            type: '单选',
            desc: '投票描述',
            imgs: ['原始的','原始的','原始的'],
            choices: [
                {
                    name: '选项1',
                    users: []
                },{
                    name: '选项2',
                    users: []
                }
            ]
        }

        Vote.save(newVote, function (err) {
          if (err) {
            jsonWrite(res, undefined);
            return;
          }
          jsonWrite(res, {
            code: 200,
            msg: "发布成功"
          });
        });
    }

    getVote(req, res, next) {
        // if (tools.isBlank(req.query.id)) {
        //     jsonWrite(res, {
        //         code: 500,
        //         msg: '缺少用户id'
        //     })
        //     return;
        // }
        Vote.get("58d1df1ae631920cdc85baeb", function (err, vote) {
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
                vote.state = 1;
            } else {
                vote.state = 0;
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
        let param = {
            voteid: "58d1df1ae631920cdc85baeb",
            index: 0,
            user: {
                userid: '58ca89c769f5670763e062ca',
                nickname: '原始的',
                avatar: '原始的',
                level: '初学乍练'
            }
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
        
    }

    getVoteList(req, res, next) {
        let search = req.query.search || '',
            page = req.query.page || 1,
            limit = req.query.limit || 2;
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
        let userid = "58ca89c769f5670763e062ca",
            voteid = "58d1df1ae631920cdc85baeb",
            page = req.query.page || 1,
            limit = req.query.limit || 10;
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