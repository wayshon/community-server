/*生成一个路由实例用来捕获访问主页的GET请求，
导出这个路由并在app.js中通过app.use('/', routes); 
加载。这样，当访问主页时，就会调用res.render('index', { title: 'Express' });
渲染views/index.ejs模版并显示到浏览器中*/

/*
crypto 是 Node.js 的一个核心模块，我们用它生成散列值来加密密码
User与Post是对数据库中用户集合与博客集合的封装
*/
var crypto = require('crypto'),
  User = require('../models/user.js'),
  Post = require('../models/post.js'),
  Comment = require('../models/comment.js');

//处理文件上传的中间件
var multer = require('multer');
//原版本使用方法
//app.use(multer({
//  dest: './public/images',
//  rename: function (fieldname, filename) {
//    return filename;
//  }
//}));
//新的使用方法
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({
  storage: storage
});

module.exports = function (app) {

  //socket.io
  var server = require('http').createServer(app);
  var io = require('socket.io')(server);
  io.sockets.on('connection', function (socket) {

    socket.on('join', function (data) {
      io.sockets.emit('msg', { from: '系统', content: data.username + '加入聊天' })
    });

    socket.on('msg', function (data) {
      io.sockets.emit('msg', { from: data.from, content: data.content });
    });

  });
  server.listen(4088);

    app.get('/test1', (req, res, next) => {
        // req.session.user = "ttttttt";
        // res.end('111111111111');

        var newUser = new User({
          name: 'test',
          password: 123456,
          email: '77777@qq.com'
        });
        newUser.save(function (err, user) {
          if (err) {
            return res.end('err报错!');
          }
          res.end('注册成功!');
        });
    });

    // app.get('/test2', checkLogin);
    app.get('/test2', (req, res, next) => {
        res.end(JSON.stringify(req.session));
    });

  //获取主页及文章
  app.get('/', function (req, res) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = parseInt(req.query.p) || 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      }

      var params = {
        code: '200',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user: req.session.user
      }
      res.end(JSON.stringify(params));
    });
  });
  //注册
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.username,
      password = req.body.password;
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        return res.end('err报错!');
      }
      if (user) {
        return res.end('用户已存在!');;
      }
      newUser.save(function (err, user) {
        if (err) {
          return res.end('err报错!');
        }
        req.session.user = user;
        res.end('注册成功!');
      });
    });
  });
  //登入
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
    User.get(req.body.username, function (err, user) {
      if (!user) {
        console.log('用户不存在!')
        return res.end('用户不存在!');
      }
      if (user.password != password) {
        console.log('密码错误!')
        return res.end('密码错误!');
      }
      req.session.user = user;
      var content = {
        code: '200',
        user: req.session.user,
        msg: '登陆成功!'
      }
      res.end(JSON.stringify(content));
    });
  });
  //发表文章
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user,
      tags = [req.body.tag1, req.body.tag2, req.body.tag3],
      post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
    post.save(function (err) {
      if (err) {
        var content = {
          code: '201',
          user: req.session.user,
          msg: 'err报错!'
        }
        return res.end(JSON.stringify(content));
      }
      var content = {
        code: '200',
        user: req.session.user,
        msg: '发布成功!'
      }
      res.end(JSON.stringify(content));
    });
  });
  //上传图片
  app.post('/upload', checkLogin);
  // app.post('/upload', upload.array('imageStream', 5), function (req, res) {
  //   var content = {
  //     code: '200',
  //     user: req.session.user,
  //     msg: '文件上传成功!'
  //   }
  //   res.end(JSON.stringify(content));
  // });

  app.post('/upload', function (req, res) {

    //接收前台POST过来的base64
    var imgData = JSON.parse(req.body.imageStream);
    console.log(1111111)
    console.log(imgData)
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    console.log(2222222)
    console.log(base64Data)
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile("./public/images/image.png", dataBuffer, function (err) {
      if (err) {
        var content = {
          code: '200',
          user: req.session.user,
          msg: JSON.stringify(err)
        }
        res.end(JSON.stringify(content));
      } else {
        var content = {
          code: '200',
          user: req.session.user,
          msg: '文件上传成功!'
        }
        res.end(JSON.stringify(content));
      }
    });
  });

  /*------------------------- */
  //进入获取存档信息界面
  app.get('/archive', function (req, res) {
    Post.getArchive(function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('archive', {
        title: '存档',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //进入标签页,一红有哪些标签
  app.get('/tags', function (req, res) {
    Post.getTags(function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //获取指定标签的文章
  app.get('/tags/:tag', function (req, res) {
    Post.getTag(req.params.tag, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //获取搜索到的结果
  app.get('/search', function (req, res) {
    Post.search(req.query.keyword, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('search', {
        title: "SEARCH:" + req.query.keyword,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //进入指定的用户的界面，并返回其文章
  app.get('/u/:name', function (req, res) {
    var page = parseInt(req.query.p) || 1;
    //检查用户是否存在
    User.get(req.params.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/');
      }
      //查询并返回该用户第 page 页的 10 篇文章
      Post.getTen(user.name, page, function (err, posts, total) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + posts.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });
  //获取指定文章
  app.get('/p/:_id', function (req, res) {
    Post.getOne(req.params._id, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: post.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //发表评论
  app.post('/p/:_id', function (req, res) {
    var date = new Date(),
      time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
      email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
      head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
    var comment = {
      name: req.body.name,
      head: head,
      email: req.body.email,
      website: req.body.website,
      time: time,
      content: req.body.content
    };
    var newComment = new Comment(req.params._id, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  });
  //进入编辑界面
  app.get('/edit/:_id', checkLogin);
  app.get('/edit/:_id', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(req.params._id, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  //发表编辑后的文章
  app.post('/edit/:_id', checkLogin);
  app.post('/edit/:_id', function (req, res) {
    Post.update(req.params._id, req.body.post, function (err) {
      var url = encodeURI('/p/' + req.params._id);
      if (err) {
        req.flash('error', err);
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });
  //删除指定文章
  app.get('/remove/:_id', checkLogin);
  app.get('/remove/:_id', function (req, res) {
    Post.remove(req.params._id, function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });
  //转载文章
  app.get('/reprint/:_id', checkLogin);
  app.get('/reprint/:_id', function (req, res) {
    var currentUser = req.session.user,
      reprint_from_id = req.params._id,
      reprint_to = { name: currentUser.name, head: currentUser.head };
    Post.reprint(reprint_from_id, reprint_to, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '转载成功!');
      var url = encodeURI('/p/' + post._id);
      //跳转到转载后的文章页面
      res.redirect(url);
    });
  });
  //登出
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });
  //404页面
  app.use(function (req, res) {
    res.end("404");
  });
  //判断已登录
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      var content = {
        code: '200',
        user: '',
        msg: '未登录!'
      }
      res.end(JSON.stringify(content));
    }
    next();
  }
  //判断未登录
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      var content = {
        code: '200',
        user: req.session.user,
        msg: '已登录!'
      }
      res.end(JSON.stringify(content));
    }
    next();
  }
};