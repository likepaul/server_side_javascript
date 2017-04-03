var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var OrientDB = require('orientjs');
var server = OrientDB({
  host: 'localhost',
  port: '2424',
  user: 'root',
  password: 'Supper@Lotto949'
})
var db = server.use('o2');

var app = express();
var urlEncodedParser = bodyParser.urlencoded({
  extended: false
});

app.locals.pretty = true;
app.set('views', 'views_session');
app.set('view engine', 'pug');

app.use(session({
  secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
  resave: false,
  saveUninitialized: true,
  store: new OrientoStore({
    server: "host=localhost&port=2424&username=root&password=Supper@Lotto949&db=o2"
  })
}));

app.get('/count', (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }

  res.send('hi session');
});

app.get('/tmp', (req, res) => {
  res.send('result: ' + req.session.count);
});

app.get('/welcome', (req, res) => {
  res.render('welcome', {
    displayName: req.session.displayName,
    uname: req.session.uname
  });
});
var users = [{
    uname: 'prgmaker',
    password: '5f4dcc3b5aa765d61d8327deb882cf99',
    displayName: 'PRGMAER'
  },
  {
    uname: 'likepaul',
    password: '5f4dcc3b5aa765d61d8327deb882cf99',
    displayName: 'LIKEPAUL'
  }
];
app.post('/auth/login', urlEncodedParser, (req, resp) => {
  var uname = req.body.username;
  var password = md5(req.body.password);
  var sql = 'SELECT FROM `users` WHERE `uname`=:uname';
  db.query(sql, {
    params: {
      uname: uname
    }
  }).then((results) => {
    var cur = results[0];
    if(results.length > 0 && cur.password == password) {
      req.session.displayName = cur.displayName ? cur.displayName : cur.uname;
      req.session.uname = cur.uname;
      req.session.save(() => {
        resp.redirect('/welcome');
      });
    } else {
      resp.render('login', {
        errmsg: 'Who are you?'
      });
    }
  });

  // for (idx in users) {
  //   var cur = users[idx];
  //   if (cur.uname === uname && cur.password === md5(password)) {
  //     req.session.displayName = cur.displayName;
  //     req.session.uname = cur.uname;
  //     req.session.save(() => {
  //       resp.redirect('/welcome');
  //     });
  //     return;
  //   }
  // }
  // resp.render('login', {
  //   errmsg: 'Who are you?'
  // });
});

app.get('/auth/login', (req, res) => {
  res.render('login');
})

app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;
  delete req.session.uname;
  res.redirect('/welcome');
});
app.post('/auth/register', urlEncodedParser, (req, res) => {
  var user = {
    uname: req.body.username,
    password: req.body.password,
    displayName: req.body.displayName
  }

  var pattern = /^\w{6,14}$/;
  if (!user.uname || !pattern.test(user.uname)) {
    delete user.password;
    res.render('register', {
      errmsg: 'Invalid User name.',
      user: user
    });
    return;
  }
  pattern = /^\w{8,14}$/;
  if (!user.password || !pattern.test(user.password)) {
    delete user.password;
    res.render('register', {
      errmsg: 'Invalid password.',
      user: user
    });
    return;
  }

  // for (var key in users) {
  //   if (users[key].uname === user.uname) {
  //     delete user.password;
  //     res.render('register', {
  //       errmsg: 'User name already exists.',
  //       user: user
  //     });
  //     return;
  //   }
  // }

  // users.push({
  //   uname: user.uname,
  //   password: md5(user.password),
  //   displayName: user.displayName
  // });

  var sql = 'INSERT INTO users (`uname`, `password`, `nickname`) values (:uname, :password, :nickname)';
  db.query(sql, {
    params: {
      uname: user.uname,
      password: md5(user.password),
      nickname: user.displayName
    }
  }).then((results) => {
    res.redirect('/welcome');
  }).catch((error)=>{
    delete user.password;
    res.render('register', {
      errmsg: error.message,
      user: user
    });
  });
});
app.get('/auth/register', (req, res) => {
  res.render('register');
});

app.listen(3004, () => {
  console.log("Listening 3004");
});
