var log4js = require('log4js');
// NOTE: log4js configuration
// log4js.configure({
//   appenders: [
//     { type: 'console'},
//     { type: 'file', filename: 'logs/server.log', category: 'server'}
//   ]
// });
log4js.configure('./log4js_configuration.json', {
  reloadSecs: 300
});
var logger = log4js.getLogger('server');

var app = require('./config/orientdb/express')();
var bodyParser = require('body-parser');
// NOTE: body parser configuration
var urlEncodedParser = bodyParser.urlencoded({
  extended: false
});
app.use(urlEncodedParser);

app.get('/welcome', (req, res) => {
  res.render('welcome',
    req.user ? {
      displayName: (req.user.displayName || req.user.uname) + (req.user.email ? '(' + req.user.email + ')' : '')
    } : {});
});



app.listen(3004, () => {
  logger.debug('Listening 3004');
});
