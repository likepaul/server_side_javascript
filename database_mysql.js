var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Supper@Lotto949',
  database: 'o2'
});

db.connect();

db.query('select * from topic', (err, rows, fields) => {
  if(err) {
    throw err;
  }

  console.log(rows, fields);
});

db.end();
