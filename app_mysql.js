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
