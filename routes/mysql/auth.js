module.exports = function(passport, db) {
  var express = require('express');
  router = express.Router();
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
    queryTopic((err, results) => {
      res.render('auth/login', {errmsg:err, topics:results, user:req.user});
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

    hasher({
      password: user.password
    }, (err, pass, salt, hash) => {
      User.addUser(user.authId, user.uname, hash, salt, user.displayName, '', (err, results) => {
        if (err) {
          delete user.password;
          res.render('auth/register', {
            errmsg: err,
            user: user
          });
        } else {
          req.login(user, (err) => {
            if (err) {
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
    passport.authenticate('facebook', {
      scope: 'email'
    })
  );

  router.get('/register', (req, res) => {
    queryTopic((err, results) => {
      res.render('auth/register', {errmsg:err, user:req.user, topics:results});
    });
  });

  function queryTopic(listner) {
    var sql = 'SELECT * from topic';
    db.query(sql, (err, results) => {
      listner(err, results);
    });
  }
  return router;
}
