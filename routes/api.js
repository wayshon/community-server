var userDao = require('../dao/userDao'),
    articleDao = require('../dao/articleDao'),
    commentDao = require('../dao/commentDao'),
    messageDao = require('../dao/messageDao');

module.exports = function (app) {

    app.get('/t1', (req, res, next) => {
        articleDao.addArticle(req, res, next)
    });

    app.get('/t2', (req, res, next) => {
        articleDao.getArticle(req, res, next)
    });

    app.get('/t3', (req, res, next) => {
        articleDao.getArticleList(req, res, next)
    });

    app.get('/t4', (req, res, next) => {
        commentDao.addComment(req, res, next)
    });

    app.get('/t5', (req, res, next) => {
        commentDao.removeComment(req, res, next)
    });

    app.get('/t6', (req, res, next) => {
        messageDao.addMessage(req, res, next)
    });

     app.get('/t7', (req, res, next) => {
        messageDao.getMessageList(req, res, next)
    });

}