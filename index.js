var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');   //开发环境用morgan  生产环境用 express-logger
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//jwt
var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");

//打印日志到本地文件
var fs = require('fs');
var accessLog = fs.createWriteStream('./logs/access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('./logs/error.log', {flags: 'a'});

var app = express();
app.set('port', process.env.PORT || 8899);

//数据库
var settings = require('./config/settings');     //数据库名与端口号对象

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));    //设置/public/favicon.ico为favicon图标
app.use(logger('dev'));   //加载日志中间件
// app.use(logger({stream: accessLog}));   //打印日志到本地文件，这句会有莫名其妙的警告，现在用下面的
app.use(logger('combined', { 'stream': accessLog }));    //打印日志到本地文件
app.use(bodyParser.json());   //加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false }));    //加载解析urlencoded请求体的中间件
app.use(cookieParser());    //加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public')));    //设置public文件夹为存放静态文件的目录

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(expressJwt({
  secret: settings.jwtSecret,
  credentialsRequired: false,
  getToken: function fromHeader (req) {
    // if (req.headers.Authorization) {
    //   var decoded = jwt.verify(req.headers.Authorization, settings.jwtSecret);
    //   console.log(decoded)
    // if (decoded.exp <= Date.now()) {
    //   res.end('Access token has expired', 400);
    // } else {
    //   global.user = decoded.user;
    // }
    //   return req.headers.Authorization;
    // } else {
    //   var err = new Error()
    //   err.name = "UnauthorizedError"
    //   throw err
    // }

    if (req.query && req.query.token) {
      var decoded = jwt.verify(req.query.token, settings.jwtSecret);
      console.log(decoded)
      if (decoded.exp <= Date.now()) {
        res.end('Access token has expired', 400);
      } else {
        global.user = decoded.user;
      }
      return req.query.token;
    } else {
      var err = new Error()
      err.name = "UnauthorizedError"
      throw err
      return null
    }
  }
}).unless({path: ["/login"]}));

//打印错误日志到本地文件
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token");
  } else {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
  }
});

//路由控制器
var routes = require('./routes/api');
routes(app);

//定制404页面
app.use((req, res) => {
  res.status(404);
  res.end('404 - Not Found -- comnode');
});

//定制500页面
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.end('500 - Server Error -- comnode')
});

app.listen(app.get('port'), () => {
  console.log(`run in: http://localhost:${app.get('port')}`);
});

//导出app实例供其他模块调用
module.exports = app;
