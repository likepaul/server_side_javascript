module.exports = function() {
  var express = require('express');
  var session = require('express-session');
  var SessionStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');
  var app = express();

  // NOTE: body parser configuration
  var urlEncodedParser = bodyParser.urlencoded({
    extended: false
  });
  app.use(urlEncodedParser);

  // NOTE: pug template configuration
  app.locals.pretty = true;
  app.set('views', 'views/mysql');
  app.set('view engine', 'pug');

  // NOTE: session configuration
  app.use(session({
    secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
    resave: false,
    saveUninitialized: true,
    store: new SessionStore({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Supper@Lotto949',
      database: 'o2'
    })
  }));

  return app;
}
