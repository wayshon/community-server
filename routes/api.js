let userDao = require('../dao/userDao'),
    articleDao = require('../dao/articleDao'),
    commentDao = require('../dao/commentDao'),
    starDao = require('../dao/starDao'),
    messageDao = require('../dao/messageDao'),
    voteDao = require('../dao/voteDao'),
    settings = require('../config/settings'),
    jwt = require("jsonwebtoken"),
    moment = require("moment"),
    request = require('request');

module.exports = app => {

    app.get('/r', (req, res, next) => {
        var options = {
            // headers: {"Connection": "close"},
            url: "http://localhost:9988/t",
            method: "get",
            json: true,
            body: {
                ha: "haha"
            }
        };

        function callback(error, response, data) {
            if (!error && response.statusCode == 200) {
                console.log('------接口数据------',data);
                res.json(data)
            }
        }

        request(options, callback);
    });

    app.get('/l', (req, res, next) => {
        let user = {
            id: 666,
            name: 'name',
            age: 10
        }
  
        let authToken = jwt.sign({
            user: user,
            exp: moment().add('days', 1).valueOf(),
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
            user: req.user
        });
    });

    app.get('/t1', (req, res, next) => {
        articleDao.addArticle(req, res, next)
    });

    app.get('/t2', (req, res, next) => {
        articleDao.removeArticle(req, res, next)
    });

    app.get('/t3', (req, res, next) => {
        articleDao.updateArticle(req, res, next)
    });

    app.get('/t4', (req, res, next) => {
        articleDao.getArticle(req, res, next)
    });

    app.get('/t5', (req, res, next) => {
        articleDao.getArticleList(req, res, next)
    });

    app.get('/t6', (req, res, next) => {
        articleDao.getHandpickList(req, res, next)
    });

    app.get('/t7', (req, res, next) => {
        articleDao.getArticleListByType(req, res, next)
    });

    app.get('/t8', (req, res, next) => {
        articleDao.getArticleListByUser(req, res, next)
    });

    app.get('/t9', (req, res, next) => {
        articleDao.getArticleListByCollection(req, res, next)
    });

    app.get('/t10', (req, res, next) => {
        articleDao.addArticleCollections(req, res, next)
    });

    app.get('/t11', (req, res, next) => {
        articleDao.removeArticleCollections(req, res, next)
    });

    app.get('/t12', (req, res, next) => {
        userDao.addUser(req, res, next)
    });

    app.get('/t13', (req, res, next) => {
        userDao.getUser(req, res, next)
    });

    app.get('/t14', (req, res, next) => {
        userDao.removeUser(req, res, next)
    });

    app.get('/t15', (req, res, next) => {
        commentDao.addComment(req, res, next)
    });

    app.get('/t16', (req, res, next) => {
        commentDao.removeComment(req, res, next)
    });

    app.get('/t17', (req, res, next) => {
        commentDao.getCommentList(req, res, next)
    });

    app.get('/t19', (req, res, next) => {
        messageDao.getMessageList(req, res, next)
    });

    app.get('/t20', (req, res, next) => {
        starDao.addStar(req, res, next)
    });

    app.get('/t21', (req, res, next) => {
        starDao.removeStar(req, res, next)
    });

    app.get('/t22', (req, res, next) => {
        starDao.getStarList(req, res, next)
    });

    app.get('/t23', (req, res, next) => {
        userDao.getOtherInfo(req, res, next)
    });

    app.get('/t24', (req, res, next) => {
        userDao.getUserInfo(req, res, next)
    });


    app.get('/t100', (req, res, next) => {
        voteDao.addVote(req, res, next)
    });

    app.get('/t101', (req, res, next) => {
        voteDao.commitVote(req, res, next)
    });

    app.get('/t102', (req, res, next) => {
        voteDao.getVote(req, res, next)
    });

    app.get('/t103', (req, res, next) => {
        voteDao.getVoteList(req, res, next)
    });

    app.get('/t104', (req, res, next) => {
        voteDao.getVoteUserList(req, res, next)
    });

    app.get('/t105', (req, res, next) => {
        articleDao.getTopList(req, res, next)
    });

}