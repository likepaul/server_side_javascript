var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var OrientDB = require('orientjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

var server = OrientDB({
  host: 'localhost',
  port: '2424',
  user: 'root',
  password: 'Supper@Lotto949'
})
var db = server.use('o2');

var urlEncodedParser = bodyParser.urlencoded({
  extended: false
});

app.locals.pretty = true;
app.set('views', 'views_session');
app.set('view engine', 'pug');

app.use(urlEncodedParser);
app.use(session({
  secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
  resave: false,
  saveUninitialized: true,
  store: new OrientoStore({
    server: "host=localhost&port=2424&username=root&password=Supper@Lotto949&db=o2"
  })
}));

app.use(passport.initialize());
app.use(passport.session());

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
  console.log('req.user', req.user);
  console.log('req.session.passport', req.session.passport);
  res.render('welcome',
  req.user ? {
      displayName: req.user.displayName,
      uname: req.user.uname
    } : {});
});

function User() {}
User.findByUserName = function(username, transmit) {
  var sql = 'SELECT FROM `users` WHERE `uname`=:uname';
  db.query(sql, {
    params: {
      uname: username
    }
  }).then((results) => {
    transmit(results);
  });
}

passport.serializeUser(function(user, done){
  // to req.session.passport.user
  done(null, {type: 'serialize', uname: user.uname, displayName: user.displayName});
});

passport.deserializeUser(function(user, done){
  User.findByUserName(user.uname, (results) => {
    if(results.length > 0) {
      // to req.user
      done(null, {type: 'desrialize', uname: results[0].uname, displayName: results[0].displayName});
    } else {
      done(null, false);
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      var sql = 'SELECT FROM `users` WHERE `uname`=:uname';
      db.query(sql, {
        params: {
          uname: username
        }
      }).then((results) => {
        if(results.length == 0) {
          console.log('Incorrect username.');
          return done(null, false, {message: 'Incorrect username.'})
        } else if(results[0].password === md5(password)) {
          console.log('Matched', results[0]);
          return done(null, results[0]);
        } else {
          console.log('Incorrect password', results[0].password);
          return done(null, false, {message: 'Incorrect password.'})
        }
    });
  }
));

app.post(
  '/auth/login',
  passport.authenticate(
    'local', {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);

app.get('/auth/login', (req, res) => {
  res.render('login');
})

app.get('/auth/logout', (req, res) => {
  req.logout();
  req.session.save(() => {
    res.redirect('/welcome');
  })
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

  var sql = 'INSERT INTO users (`uname`, `password`, `displayName`) values (:uname, :password, :displayName)';
  db.query(sql, {
    params: {
      uname: user.uname,
      password: md5(user.password),
      displayName: user.displayName
    }
  }).then((results) => {
    // res.redirect('/welcome');
    req.login(user, (err) => {
      req.session.save(() => {
        res.redirect('/welcome');
      });
    });
  }).catch((error) => {
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
