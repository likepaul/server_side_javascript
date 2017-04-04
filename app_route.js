var express = require('express');
var app = express();
var p1Router = require('./routes/p1')(express);
app.use('/p1', p1Router);

var p2Router = require('./routes/p2')(express);
app.use('/p2', p2Router);

app.listen(3004, ()=> {
  console.log('connected 3004');
});
