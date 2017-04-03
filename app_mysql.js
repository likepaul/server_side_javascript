var express = require('express');
var app = express(); // function object constructor -> object
var fs = require('fs');
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Supper@Lotto949',
  database: 'o2'
});

db.connect();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'pug');

app.listen(3000, function() {
    console.log('Connected 3000');
});

app.post('/topic/add', urlencodedParser, (req, resp) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;

    var sql = 'INSERT INTO `topic` (`title`, `description`, `author`) VALUES (?, ?, ?)';
    db.query(sql,
      [title, description, author],
      (err, results) => {
        resp.redirect('/topic/' + encodeURIComponent(results.insertId));
    });
});

app.get('/topic/add', (req, resp) => {
  var sql = 'SELECT * from `topic`';
  db.query(sql, (err, topics) => {
      if(err) {
        console.log(err);
        resp.status(500).send('Internal Server Error!');
      }
      resp.render('add', {topics: topics});
    });
});

app.post('/topic/:id/edit', urlencodedParser, function(req, resp){
  var sql = 'UPDATE `topic` set `title`=?, `description`=?, `author`=? WHERE `id`=?';

  db.query(sql,
    [req.body.title, req.body.description, req.body.author, req.params.id],
    (err, results) => {
      if(err) {
        console.log(err);
        resp.status(500).send('Internal Server Error!');
      }
      resp.redirect('/topic/'+encodeURIComponent(req.params.id));
  });
});

app.get('/topic/:id/edit', function(req, resp){
  // var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
  var sql = 'SELECT * FROM `topic`';
  db.query(sql, (err, results) =>{
    if(err) {
      console.log(err);
      resp.status(500).send('Internal Server Error!');
    }
    for(var i = 0; i < results.length; i++)
      if(results[i]['id'] == req.params.id) {
        break;
      }
      resp.render('edit', {topics: results, topic: results[i]});
    });
});

app.post('/topic/:id/delete', urlencodedParser, (req, resp) => {
  if(req.body.confirm == 'YES') {
    var sql = 'DELETE FROM `topic` WHERE id=?';
    db.query(sql, [req.params.id],
      (err, results)=>{
        if(err) {
          console.log(err);
          resp.status(500).send('Internal Server Error!');
        }
        resp.redirect('/topic');
    });
  } else {
    resp.redirect('/topic/'+encodeURIComponent(req.params.id));
  }
});

app.get('/topic/:id/delete', (req, resp) => {
  var sql = 'SELECT * FROM `topic`';
  db.query(sql, (err, topics) => {
    if(err) {
      console.log(err);
      resp.status(500).send('Internal Server Error!');
    }
    var sql = 'SELECT * FROM `topic` WHERE id=?';
    db.query(sql,
      [req.params.id],
      (err, rid_topic) => {
        if(err) {
          console.log(err);
          resp.status(500).send('Internal Server Error!');
        }
        resp.render('delete', {topics: topics, topic: rid_topic[0]})
    });
  });
});

app.get(['/topic', '/topic/:id'], (req, resp) => {
  var sql = 'SELECT * FROM `topic`';
  db.query(sql, (err, topics, fields) => {
    if(err) {
      console.log(err);
      resp.status(500).send('Internal Server Error!');
    }
    sql = 'SELECT * FROM `topic` WHERE `id`=?';
    var id = req.params.id;
    if(id) {
      db.query(sql, [id], (err, pick_topics, fields) => {
        if(err) {
          console.log(err);
          resp.status(500).send('Internal Server Error!');
        }
        resp.render('view', {topics:topics, topic: pick_topics[0]})
      });
    } else {
      resp.render('view', {topics: topics});
    }
  });
});
