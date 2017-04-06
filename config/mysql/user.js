module.exports = function(db) {
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

  return User;
}
