var express = require('express');
var app = express();
var log4js = require('log4js');
log4js.configure('log4js_configuration.json');

var logger = log4js.getLogger();
log4js.configure =
app.set('view engine', 'pug');
app.set('views', 'views_pug');
app.get('/view', (req, res) => {
  res.render('view');
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.listen(3004, () => {
  logger.info('listening 3004');
})
