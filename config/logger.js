var log4js = require('log4js');

// NOTE: log4js configuration
log4js.configure({
  appenders: [
    { type: 'console'},
    { type: 'file', filename: 'logs/server.log', category: 'server'}
  ]
});
var logger = log4js.getLogger('server');
module.exports = logger;
