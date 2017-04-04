var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var OrientDB = require('orientjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
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
  res.render('welcome',
    req.user ? {
      displayName: req.user.displayName,
      uname: req.user.uname
    } : {});
});

function User() {}
User.findByUserName = function(username, observer) {
  var sql = 'SELECT FROM `users` WHERE `uname`=:uname';
  db.query(sql, {
    params: {
      uname: username
    }
  }).then((results) => {
    observer(results);
  });
}

User.addUser = function(username, password, displayName, observer) {
  var sql = 'INSERT INTO users (`uname`, `password`, `displayName`) values (:uname, :password, :displayName)';
  db.query(sql, {
    params: {
      uname: username,
      password: md5(password),
      displayName: displayName
    }
  }).then((results) => {
    observer(results);
  }).catch((error) => {
    observer(error);
  });
}

passport.serializeUser(function(user, done) {
  // to req.session.passport.user
  done(null, {
    type: 'serialize',
    uname: user.uname,
    displayName: user.displayName
  });
});

passport.deserializeUser(function(user, done) {
  User.findByUserName(user.uname, (results) => {
    if (results.length > 0) {
      // to req.user
      done(null, {
        type: 'desrialize',
        uname: results[0].uname,
        displayName: results[0].displayName
      });
    } else {
      done(null, false);
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findByUserName(username, (results) => {
      if (results.length == 0) {
        return done(null, false, {
          message: 'Incorrect username.'
        })
      } else if (results[0].password === md5(password)) {
        return done(null, results[0]);
      } else {
        return done(null, false, {
          message: 'Incorrect password.'
        })
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

  User.addUser(user.uname, user.password, user.displayName, (results) => {
    if(Array.isArray(results)) {
      req.login(user, (err) => {
        if(err) {
          delete user.password;
          res.render('register', {
            errmsg: error.message,
            user: user
          });
        } else {
          req.session.save(() => {
            res.redirect('/welcome');
          });
        }
      });
    } else {
      delete user.password;
      res.render('register', {
        errmsg: results.message,
        user: user
      });
    }
  });
});

passport.use(new FacebookStrategy({
    clientID: '1879987988938378',
    clientSecret: 'ea60f62589386b13d78f96f6a1e07768',
    callbackURL: '/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {

  }
));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/welcome',
    failureRedirect: '/auth/login'
  }));


app.get('/auth/facebook',
  passport.authenticate('facebook')
);

app.get('/auth/register', (req, res) => {
  res.render('register');
});


app.listen(3004, () => {
  console.log("Listening 3004");
});
