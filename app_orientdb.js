var db = require('./config/orientdb/db');
var topic = require('./routes/orientdb/topic')(db);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var app = require('./config/orientdb/express')();

var passport = require('./config/orientdb/passport')(app);
var auth = require('./routes/orientdb/auth')(passport);

app.use(urlencodedParser);
app.use('/auth', auth);
app.use('/topic', topic);

app.listen(3004, function() {
    console.log('Connected 3004');
});
