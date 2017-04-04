module.exports = function(db) {
  var express = require('express');
  var router = express.Router();
  router.post('/add', (req, resp) => {
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

  router.get('/add', (req, resp) => {
    var sql = 'SELECT from `topic`';
    db.query(sql)
      .then((topics) => {
        resp.render('topic/add', {topics: topics, user:req.user});
      });
  });

  router.post('/:id/edit', function(req, resp){
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

  router.get('/:id/edit', function(req, resp){
    // var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
    var sql = 'SELECT FROM `topic`';
    db.query(sql)
    .then((results) =>{
      for(var i = 0; i < results.length; i++)
        if(results[i]['@rid'] == req.params.id) {
          break;
        }
        resp.render('topic/edit', {topics: results, topic: results[i], user:req.user});
      });
  });

  router.post('/:id/delete', (req, resp) => {
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

  router.get('/:id/delete', (req, resp) => {
    var sql = 'SELECT FROM `topic`';
    db.query(sql)
    .then((topics) => {
      var sql = 'SELECT FROM `topic` WHERE @rid=:rid';
      db.query(sql, {
          params: {rid:req.params.id}
      }).then((rid_topic) => {
        resp.render('topic/delete', {topics: topics, topic: rid_topic[0], user:req.user})
      });
    });
  });

  router.get(['', '/:id'], (req, resp) => {
    var sql = 'SELECT FROM `topic`';
    db.query(sql)
    .then((topics) => {
      sql = 'SELECT FROM `topic` WHERE `@rid`=:rid';
      var id = req.params.id;
      if(id) {
        db.query(sql,{
          params: { rid: id }
        }).then((results) => {
          resp.render('topic/view', {
            topics: topics,
            topic: results[0],
            user:req.user
          });
        });
      } else {
        resp.render('topic/view', {topics: topics, user:req.user});
      }
    });
  });

  return router;
}
