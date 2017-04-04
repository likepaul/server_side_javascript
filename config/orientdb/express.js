module.exports = function(logger) {
  var express = require('express');
  var session = require('express-session');
  var OrientoStore = require('connect-oriento')(session);
  var User = require('./user')();
  // NOTE: express configuration
  var app = express();

  // NOTE: pug template configuration
  app.locals.pretty = true;
  app.set('views', './views/orientdb');
  app.set('view engine', 'pug');

  // NOTE: session configuration
  app.use(session({
    secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
    resave: false,
    saveUninitialized: true,
    store: new OrientoStore({
      server: "host=localhost&port=2424&username=root&password=Supper@Lotto949&db=o2"
    })
  }));
  return app;
}
