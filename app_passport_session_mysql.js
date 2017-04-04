var express = require('express');
var session = require('express-session');
var SessionStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var mysql = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var log4js = require('log4js');
var pbkdf2Password = require('pbkdf2-password');
var hasher = pbkdf2Password();

// NOTE: log4js configuration
log4js.configure({
  appenders: [
    { type: 'console'},
    { type: 'file', filename: 'logs/server.log', category: 'server'}
  ]
});
var logger = log4js.getLogger('server');

// NOTE: express configuration
var app = express();

// NOTE: body parser configuration
var urlEncodedParser = bodyParser.urlencoded({
  extended: false
});
app.use(urlEncodedParser);

// NOTE: pug template configuration
app.locals.pretty = true;
app.set('views', 'views_session');
app.set('view engine', 'pug');

// NOTE: session configuration
app.use(session({
  secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
  resave: false,
  saveUninitialized: true,
  store: new SessionStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Supper@Lotto949',
    database: 'o2'
  })
}));

// NOTE: passport configuration
app.use(passport.initialize());
app.use(passport.session());

// NOTE: orientd db configuration
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Supper@Lotto949',
  database: 'o2'
});

app.get('/count', (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('Increse sesion count');
});

app.get('/tmp', (req, res) => {
  res.send('result: ' + req.session.count);
});

app.get('/welcome', (req, res) => {
  res.render('welcome',
    req.user ? {
      displayName: (req.user.displayName || req.user.uname) + (req.user.email ? '(' + req.user.email + ')' : '')
    } : {});
});

function User() {}
User.findByUserName = function(username, observer) {
  var sql = 'SELECT * FROM `users` WHERE `uname`=?';
  db.query(sql, [username],
    (err, results) => {
    observer(err, results);
  });
}

User.findByAuthId = function(authId, observer) {
  var sql = 'SELECT * FROM `users` WHERE `authId`=?';
  db.query(sql, [authId],
    (err, results) => {
    observer(err, results);
  });
}

User.addUser = function(authId, username, hash, salt, displayName, email, observer) {
  var sql = 'INSERT INTO users (`authId`, `uname`, `password`, `salt`, `displayName`, `email`) values (?, ?, ?, ?, ?, ?)';
  db.query(sql, [authId, username, hash, salt, displayName, email],
    (err, results) => {
      observer(err, results);
    });
}

passport.serializeUser(function(user, done) {
  // to req.session.passport.user
  done(null, {
    type: 'serialize',
    authId: user.authId,
    uname: user.uname,
    displayName: user.displayName,
    email: user.email
  });
});

passport.deserializeUser(function(user, done) {
  User.findByAuthId(user.authId, (err, results) => {
    if (!err && results.length > 0) {
      // to req.user
      done(null, {
        type: 'desrialize',
        authId: results[0].authId,
        uname: results[0].uname,
        displayName: results[0].displayName,
        email: user.email
      });
    } else {
      done(null, false);
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findByAuthId('local:'+username, (err, results) => {
      if(err) {
        return done(null, false, {
          message: 'Internal Error'
        })
      } if (results.length == 0) {
        return done(null, false, {
          message: 'Incorrect username.'
        })
      } else {
        hasher({password: password, salt: results[0].salt}, (err, password, salt, hash) => {
          if(hash === results[0].password) {
            return done(null, results[0]);
          } else {
            return done(null, false, {
              message: 'Incorrect password.'
            })
          }
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
    authId: 'local:' + req.body.username,
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

  hasher({password:user.password}, (err, pass, salt, hash) => {
    User.addUser(user.authId, user.uname, hash, salt, user.displayName, '', (err, results) => {
      if(err) {
        delete user.password;
        res.render('register', {
          errmsg: err,
          user: user
        });
      } else {
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
      }
    });
  });
});

passport.use(new FacebookStrategy({
    clientID: '1879987988938378',
    clientSecret: 'ea60f62589386b13d78f96f6a1e07768',
    callbackURL: '/auth/facebook/callback',
    profileFields: ['email', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    var user = {authId: 'facebook:' + profile.id, uname: profile.id, displayName: profile.displayName, email: profile.emails[0].value};
    User.findByAuthId(user.authId, function(err, results) {
      if(Array.isArray(results) && results.length > 0) {
        done(null, user);
      } else {
        User.addUser(user.authId, user.uname, '', '', profile.displayName, user.email, (err, results) => {
          done(null, user);
        });
      }
    });
  }
));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/welcome',
    failureRedirect: '/auth/login'
  }));


app.get('/auth/facebook',
  passport.authenticate('facebook',{scope: 'email'})
);

app.get('/auth/register', (req, res) => {
  res.render('register');
});


app.listen(3004, () => {
  logger.debug('Listening 3004');
});
