module.exports = function(User) {
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var pbkdf2Password = require('pbkdf2-password');

  var hasher = pbkdf2Password();
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
      User.findByAuthId('local:' + username, (err, results) => {
        if (err) {
          return done(null, false, {
            message: 'Internal Error'
          })
        }
        if (results.length == 0) {
          return done(null, false, {
            message: 'Incorrect username.'
          })
        } else {
          hasher({
            password: password,
            salt: results[0].salt
          }, (err, password, salt, hash) => {
            if (hash === results[0].password) {
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

  passport.use(new FacebookStrategy({
      clientID: '1879987988938378',
      clientSecret: 'ea60f62589386b13d78f96f6a1e07768',
      callbackURL: '/auth/facebook/callback',
      profileFields: ['email', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
      var user = {
        authId: 'facebook:' + profile.id,
        uname: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      };
      User.findByAuthId(user.authId, function(err, results) {
        if (Array.isArray(results) && results.length > 0) {
          done(null, user);
        } else {
          User.addUser(user.authId, user.uname, '', '', profile.displayName, user.email, (err, results) => {
            done(null, user);
          });
        }
      });
    }
  ));
  return passport;
}
