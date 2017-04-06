var app = require('./config/mysql/express')();
var db = require('./config/mysql/db');
var User = require('./config/mysql/user')(db);
var passport = require('./config/mysql/passport')(User);
var auth = require('./routes/mysql/auth')(passport, db);
var logger = require('./config/logger');
var topic = require('./routes/mysql/topic')(db);

// NOTE: passport configuration
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
app.use('/topic', topic);
app.listen(3004, () => {
  logger.debug('Listening 3004');
});
