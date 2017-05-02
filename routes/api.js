let userDao = require('../dao/userDao'),
    articleDao = require('../dao/articleDao'),
    commentDao = require('../dao/commentDao'),
    starDao = require('../dao/starDao'),
    messageDao = require('../dao/messageDao'),
    voteDao = require('../dao/voteDao'),
    settings = require('../config/settings'),
    tools = require('../config/tools'),
    jwt = require("jsonwebtoken"),
    moment = require("moment"),
    request = require('request'),
    crypto = require('crypto'), //crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码
    sha1 = crypto.createHash('sha1');

module.exports = app => {

    function getAccToken(req, res) {
        // let options = {
        //     uri: "https://api.weixin.qq.com/cgi-bin/token",
        //     method: "get",
        //     json: true,
        //     qs: {
        //         grant_type: "client_credential",
        //         appid: "wx7b739a344a69a410",
        //         secret: "9296286bb73ac0391d2eaf2b668c668a"
        //     }
        // };

        if (tools.isBlank(req.body.grant_type) || tools.isBlank(req.body.appid) || tools.isBlank(req.body.secret) || tools.isBlank(req.body.url)) {
            res.json({
                code: 500,
                msg: '缺少参数'
            })
            return;
        }
        let options = {
            uri: "https://api.weixin.qq.com/cgi-bin/token",
            method: "get",
            json: true,
            qs: {
                grant_type: req.body.grant_type,
                appid: req.body.appid,
                secret: req.body.secret
            }
        };

        function callback(error, response, data) {
            if (!error && response.statusCode == 200 && tools.isNotBlank(data) && tools.isNotBlank(data.access_token)) {
                getTicket(req, res, data.access_token);
            } else {
                res.json({
                    code: 500,
                    msg: '获取access_token失败',
                    data: data
                })
            }
        }

        request(options, callback);
    }

    function getTicket(req, res, access_token) {
        let options = {
            uri: "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
            method: "get",
            json: true,
            qs: {
                access_token: access_token,
                type: "jsapi"
            }
        };

        function callback(error, response, data) {
            if (!error && response.statusCode == 200 && tools.isNotBlank(data) && data.errcode == 0 && tools.isNotBlank(data.ticket)) {
                getSignature(req, res, access_token, data.ticket);
            } else {
                res.json({
                    code: 500,
                    msg: '获取ticket失败',
                    data: data
                })
            }
        }

        request(options, callback);
    }

    function getSignature(req, res, access_token, ticket) {
        let jsapi_ticket = ticket,
            nonceStr = tools.randomWord(false, 32),
            timestamp = parseInt((new Date().getTime())/1000),
            url = req.body.url;

        let str = `jsapi_ticket=${jsapi_ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
        let signature = sha1.update(str).digest('hex');
        
        res.json({
            code: 200,
            msg: 'ok',
            ob: {
                accessToken: access_token,
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature
            }
        })
    }

    //检查收到的参数确认是否来自微信调用
    function checkSignature(req) {
        let signature = req.query.signature,
            timestamp = req.query.timestamp,
            nonce = req.query.timestamp;
        
        let arr = ['yourToken', timestamp, nonce];
        let str = arr.sort().join('');
        let sig = sha1.update(str).digest('hex');
        if (sig === signature) {
            return true;
        } else {
            return false;
        }
    }

    //给微信调用
    app.get('/forWechat', (req, res, next) => {
        if (tools.isBlank(req.query.signature) || tools.isBlank(req.query.timestamp) || tools.isBlank(req.query.nonce) || tools.isBlank(req.query.echostr) || checkSignature(req)) {
            next();
        } else {
            res.send(req.query.echostr);
        }
    });

    //获取微信签名
    app.post('/getAccToken', (req, res, next) => {
        getAccToken(req, res);
    });

    app.get('/login', (req, res, next) => {
        let user = {
            id: '5902bc7cd7e7550ab6203037',
            name: 'name',
            level: '初级',
            avatar: 'http://image.beekka.com/blog/2014/bg2014051201.png'
        }
  
        let authToken = jwt.sign({
            user: user,
            exp: moment().add('days', 30).valueOf(),
        }, settings.jwtSecret);

        res.json({
            code: 200,
            msg: 'ok',
            token: authToken
        });
    });

    app.get('/w', (req, res, next) => {
        res.json({
            code: 200,
            msg: 'ok',
            user: req.users
        });
    });
    //添加用户
    app.get('/addUser', (req, res, next) => {
        userDao.addUser(req, res, next)
    });

    //获取用户
    app.get('/getUser', (req, res, next) => {
        userDao.getUser(req, res, next)
    });

    //删除用户
    app.get('/removeUser', (req, res, next) => {
        userDao.removeUser(req, res, next)
    });

    //发表文章
    app.post('/addArticle', (req, res, next) => {
        articleDao.addArticle(req, res, next)
    });

    //删除文章
    app.get('/removeArticle', (req, res, next) => {
        articleDao.removeArticle(req, res, next)
    });

    //更新文章 -- 暂时不做
    // app.get('/updateArticle', (req, res, next) => {
    //     articleDao.updateArticle(req, res, next)
    // });

    //获取文章详情
    app.get('/article', (req, res, next) => {
        articleDao.getArticle(req, res, next)
    });

    //获取文章列表
    app.get('/articleList', (req, res, next) => {
        articleDao.getArticleList(req, res, next)
    });

    //获取精选文章
    app.get('/handpickList', (req, res, next) => {
        articleDao.getHandpickList(req, res, next)
    });

    //根据类型获取文章
    app.get('/articleListByType', (req, res, next) => {
        articleDao.getArticleListByType(req, res, next)
    });

    //获取用户文章
    app.get('/articleListByUser', (req, res, next) => {
        articleDao.getArticleListByUser(req, res, next)
    });

    //获取收藏的文章
    app.get('/articleListByCollection', (req, res, next) => {
        articleDao.getArticleListByCollection(req, res, next)
    });

    //收藏
    app.post('/addCollection', (req, res, next) => {
        articleDao.addArticleCollections(req, res, next)
    });

    //取消收藏
    app.get('/removeCollection', (req, res, next) => {
        articleDao.removeArticleCollections(req, res, next)
    });

    //发表评论
    app.post('/addComment', (req, res, next) => {
        commentDao.addComment(req, res, next)
    });

    //删除评论
    app.get('/removeComment', (req, res, next) => {
        commentDao.removeComment(req, res, next)
    });

    //评论列表
    app.get('/commentList', (req, res, next) => {
        commentDao.getCommentList(req, res, next)
    });

    //消息列表
    app.get('/message', (req, res, next) => {
        messageDao.getMessageList(req, res, next)
    });

    //点赞
    app.post('/addStar', (req, res, next) => {
        starDao.addStar(req, res, next)
    });

    //取消赞
    app.get('/removeStar', (req, res, next) => {
        starDao.removeStar(req, res, next)
    });

    //赞列表
    app.get('/starList', (req, res, next) => {
        starDao.getStarList(req, res, next)
    });

    //他人信息
    app.get('/otherInfo', (req, res, next) => {
        userDao.getOtherInfo(req, res, next)
    });

    //自己信息
    app.get('/selfInfo', (req, res, next) => {
        userDao.getUserInfo(req, res, next)
    });

    //添加投票
    app.post('/addVote', (req, res, next) => {
        voteDao.addVote(req, res, next)
    });

    //确定投票
    app.post('/commitVote', (req, res, next) => {
        voteDao.commitVote(req, res, next)
    });

    //获取投票详情
    app.get('/vote', (req, res, next) => {
        voteDao.getVote(req, res, next)
    });

    //获取投票列表
    app.get('/voteList', (req, res, next) => {
        voteDao.getVoteList(req, res, next)
    });

    //已投票用户列表
    app.get('/voteUserList', (req, res, next) => {
        voteDao.getVoteUserList(req, res, next)
    });

    //获取顶部3条，1条投票2条精选
    app.get('/getTopList', (req, res, next) => {
        articleDao.getTopList(req, res, next)
    });

}