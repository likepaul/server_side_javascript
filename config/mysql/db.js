var mysql = require('mysql');

// NOTE: orientd db configuration
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Supper@Lotto949',
  database: 'o2'
});

module.exports = db;
