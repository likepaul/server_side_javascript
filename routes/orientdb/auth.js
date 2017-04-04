module.exports = function(passport) {
  var User = require('../../config/orientdb/user')();
  var db = require('../../config/orientdb/db');
  var pbkdf2Password = require('pbkdf2-password');
  var hasher = pbkdf2Password();
  var router = require('express').Router();

  router.post(
    '/login',
    passport.authenticate(
      'local', {
        successRedirect: '/topic',
        failureRedirect: '/auth/login',
        failureFlash: false
      }
    )
  );

  router.get('/login', (req, res) => {
    var sql = 'SELECT FROM `topic`';
    db.query(sql)
    .then((topics) => {
      res.render('auth/login', {topics:topics});
    });

  })

  router.get('/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect('/topic');
    })
  });

  router.post('/register', (req, res) => {
    var user = {
      authId: 'local:' + req.body.username,
      uname: req.body.username,
      password: req.body.password,
      displayName: req.body.displayName
    }

    var pattern = /^\w{6,14}$/;
    if (!user.uname || !pattern.test(user.uname)) {
      delete user.password;
      res.render('auth/register', {
        errmsg: 'Invalid User name.',
        user: user
      });
      return;
    }

    pattern = /^\w{8,14}$/;
    if (!user.password || !pattern.test(user.password)) {
      delete user.password;
      res.render('auth/register', {
        errmsg: 'Invalid password.',
        user: user
      });
      return;
    }

    hasher({password:user.password}, (err, pass, salt, hash) => {
      User.addUser(user.authId, user.uname, hash, salt, user.displayName, (results) => {
        if(Array.isArray(results)) {
          req.login(user, (err) => {
            if(err) {
              delete user.password;
              res.render('auth/register', {
                errmsg: error.message,
                user: user
              });
            } else {
              req.session.save(() => {
                res.redirect('/topic');
              });
            }
          });
        } else {
          delete user.password;
          res.render('auth/register', {
            errmsg: results.message,
            user: user
          });
        }
      });
    });
  });

  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/topic',
      failureRedirect: '/auth/login'
    }));


  router.get('/facebook',
    passport.authenticate('facebook',{scope: 'email'})
  );

  router.get('/register', (req, res) => {
    var sql = 'SELECT FROM `topic`';
    db.query(sql)
    .then((topics) => {
      res.render('auth/register', {topics:topics});
    });

  });

  return router;
};
