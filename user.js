module.exports = function() {
  var db = require('./db');
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

  User.findByAuthId = function(authId, observer) {
    var sql = 'SELECT FROM `users` WHERE `authId`=:authId';
    db.query(sql, {
      params: {
        authId: authId
      }
    }).then((results) => {
      observer(results);
    });
  }

  User.addUser = function(authId, username, hash, salt, displayName, observer) {
    var sql = 'INSERT INTO users (`authId`, `uname`, `password`, `salt`, `displayName`) values (:authId, :uname, :password, :salt, :displayName)';
    db.query(sql, {
      params: {
        authId: authId,
        uname: username,
        password: hash,
        salt: salt,
        displayName: displayName
      }
    }).then((results) => {
      observer(results);
    }).catch((error) => {
      observer(error);
    });
  }
};
