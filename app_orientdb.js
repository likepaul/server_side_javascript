var express = require('express');
var app = express(); // function object constructor -> object
var fs = require('fs');
var multer = require('multer');
var OrientDB = require('orientjs');

var server = OrientDB({
  host: 'localhost',
  port: '2424',
  user: 'root',
  password: 'Supper@Lotto949'
});

db = server.use('o2');
console.log('Using Database: ', db.name);
app.use('/user', express.static('my-uploads'));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'my-uploads/');
  },
  filename: function (req, file, cb) {
    var date = new Date();
    cb(null, `${file.originalname}-`+
      `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}_`+
      `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`);
  }
});
var upload = multer({storage: storage})
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const successResponse = `
    Success<br>
    <a href='/topic'>goto Topic</a>
  `;
const TOPIC_DIR = 'data/';

app.locals.pretty = true;
app.set('views', './views_orient');
app.set('view engine', 'pug');

app.listen(3000, function() {
    console.log('Connected 3000');
});

app.post('/topic/add', urlencodedParser, (req, resp) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;

    var sql = 'INSERT INTO `topic` (`title`, `description`, `author`) VALUES (:title, :desc, :author)';
    db.query(sql, {
      params: {title:title, desc: description, author: author}
    })
    .then((results) => {
      resp.redirect('/topic/' + encodeURIComponent(results[0]['@rid']));
    });
});

app.get('/topic/add', (req, resp) => {
  var sql = 'SELECT from `topic`';
  db.query(sql)
    .then((topics) => {
      resp.render('add', {topics: topics});
    });
});

app.post('/topic/:id/edit', urlencodedParser, function(req, resp){
  var sql = 'UPDATE `topic` set `title`=:title, `description`=:desc, `author`=:author WHERE @rid=:rid';

  db.query(sql,{
    params: {
      title: req.body.title,
      desc: req.body.description,
      author: req.body.author,
      rid: req.params.id
    }
  }).then((results) => {
    resp.redirect('/topic/'+encodeURIComponent(req.params.id));
  });
});

app.get('/topic/:id/edit', function(req, resp){
  // var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
  var sql = 'SELECT FROM `topic`';
  db.query(sql)
  .then((results) =>{
    for(var i = 0; i < results.length; i++)
      if(results[i]['@rid'] == req.params.id) {
        break;
      }
      resp.render('edit', {topics: results, topic: results[i]});
    });
});

app.post('/topic/:id/delete', urlencodedParser, (req, resp) => {
  if(req.body.confirm == 'YES') {
    var sql = 'DELETE FROM `topic` WHERE @rid=:rid';
    db.query(sql, {
      params:{rid:req.params.id}
    }).then((results)=>{
      resp.redirect('/topic');
    });
  } else {
    resp.redirect('/topic/'+encodeURIComponent(req.params.id));
  }
});

app.get('/topic/:id/delete', (req, resp) => {
  var sql = 'SELECT FROM `topic`';
  db.query(sql)
  .then((topics) => {
    var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
    db.query(sql, {
        params: {rid:req.params.id}
    }).then((rid_topic) => {
      resp.render('delete', {topics: topics, topic: rid_topic[0]})
    });
  });
});

app.get(['/topic', '/topic/:id'], (req, resp) => {
  var sql = 'SELECT FROM `topic`';
  db.query(sql)
  .then((topics) => {

    sql = 'SELECT FROM `topic` WHERE `@rid`=:rid';
    var id = req.params.id;
    if(id) {
      db.query(sql,{
        params: { rid: id }
      }).then((results) => {
        console.log(results);
        resp.render('view', {
          topics: topics,
          topic: results[0]
        });
      });
    } else {
      resp.render('view', {topics: topics});
    }
  });
});
