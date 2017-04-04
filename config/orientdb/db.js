var OrientDB = require('orientjs');
// NOTE: orientd db configuration
var server = OrientDB({
  host: 'localhost',
  port: '2424',
  user: 'root',
  password: 'Supper@Lotto949'
})
var db = server.use('o2');
module.exports = db;
