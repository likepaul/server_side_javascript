module.exports = function(db) {
  var express = require('express');
  var router = express.Router();
  router.post('/add', (req, res) => {
      var title = req.body.title;
      var description = req.body.description;
      var author = req.body.author;

      var sql = 'INSERT INTO `topic` (`title`, `description`, `author`) VALUES (?, ?, ?)';
      db.query(sql,
        [title, description, author],
        (err, results) => {
          res.redirect('/topic/' + encodeURIComponent(results.insertId));
      });
  });

  router.get('/add', (req, res) => {
    queryTopic((err, topics) => {
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error!');
        }
        res.render('topic/add', {topics: topics, user:req.user});
      });
  });

  router.post('/:id/edit', function(req, res){
    var sql = 'UPDATE `topic` set `title`=?, `description`=?, `author`=? WHERE `id`=?';

    db.query(sql,
      [req.body.title, req.body.description, req.body.author, req.params.id],
      (err, results) => {
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error!');
        }
        res.redirect('/topic/'+encodeURIComponent(req.params.id));
    });
  });

  router.get('/:id/edit', function(req, res){
    // var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
    queryTopic((err, results) =>{
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error!');
      }
      for(var i = 0; i < results.length; i++)
        if(results[i]['id'] == req.params.id) {
          break;
        }
        res.render('topic/edit', {topics: results, topic: results[i], user:req.user});
      });
  });

  router.post('/:id/delete', (req, res) => {
    if(req.body.confirm == 'YES') {
      var sql = 'DELETE FROM `topic` WHERE id=?';
      db.query(sql, [req.params.id],
        (err, results)=>{
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error!');
          }
          res.redirect('/topic');
      });
    } else {
      res.redirect('/topic/'+encodeURIComponent(req.params.id));
    }
  });

  router.get('/:id/delete', (req, res) => {
    queryTopic((err, topics) => {
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error!');
      }
      var sql = 'SELECT * FROM `topic` WHERE id=?';
      db.query(sql,
        [req.params.id],
        (err, rid_topic) => {
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error!');
          }
          res.render('topic/delete', {topics: topics, topic: rid_topic[0], user:req.user})
      });
    });
  });

  router.get(['', '/:id'], (req, res) => {
    queryTopic((err, topics, fields) => {
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error!');
      }
      sql = 'SELECT * FROM `topic` WHERE `id`=?';
      var id = req.params.id;
      if(id) {
        db.query(sql, [id], (err, pick_topics, fields) => {
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error!');
          }
          res.render('topic/view', {topics:topics, topic: pick_topics[0], user:req.user})
        });
      } else {
        res.render('topic/view', {topics: topics, user:req.user});
      }
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
