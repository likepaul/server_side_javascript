var OrientDB = require('orientjs');

var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: 'Supper@Lotto949'
});

var db = server.use('o2');
console.log('Using database: ' + db.name);
console.log('-----------------------')

// db.record.get('#34:0')
// .then(
//   function(record) {
//     console.log('Loaded Recrod',
//      'title:', record.title, record.description, record.author);
//   }
// );
//
// // CREATE
// var sql = 'SELECT FROM topic';
// db.query(sql).then(function(results) {
//   console.log(results);
// });

// var sql =   'SELECT FROM topic WHERE @rid=:rid';
// var param = {
//   params:{
//     rid: '#33:0'
//   }
// };
// db.query(sql, param).then((results) =>{
//   console.log(results);
// });

// var sql = 'INSERT INTO `topic` (`title`, `description`) VALUES (:title, :desc)';
// var param = {
//   params: {
//     title: 'Express',
//     desc: 'Express is framework for nodejs'
//   }
// };
//
// db.query(sql, param).then((results) => {
//   console.log(results);
// });

//  UPDATE
// var sql = 'UPDATE `topic` set `title`=:title WHERE `@rid`=:rid';
// db.query(sql, {
//   params: {
//     title: 'Expressjs',
//     rid: '#33:1'
//   }
// }).then((results)=>{
//   console.log(results);
// });

// DELETE
var sql = 'DELETE FROM `topic` WHERE @rid=:rid';
db.query(sql, {
  params: {
    rid: '#33:1'
  }
}).then((results)=>{
  console.log(results);
});
