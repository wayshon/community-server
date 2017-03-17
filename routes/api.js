var userDao = require('../dao/userDao'),
    articleDao = require('../dao/articleDao');

module.exports = function (app) {

    app.get('/t1', (req, res, next) => {
        articleDao.addArticle(req, res, next)
    });

    app.get('/t2', (req, res, next) => {
        articleDao.getArticle(req, res, next)
    });

}