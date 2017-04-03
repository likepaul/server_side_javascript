var express = require('express');
var session = require('express-session');
var FileStore = require('connect-loki')(session);
var bodyParser = require('body-parser');

var app = express();
var urlEncodedParser = bodyParser.urlencoded({
  extended: false
});

app.locals.pretty = true;
app.set('views', 'views_session');
app.set('view engine', 'pug');

app.use(session({
  secret: 'jakdsf89_8)DF$#Jlkj@#kjfsB%^S',
  resave: false,
  saveUninitialized: true,
  store: new FileStore({
    logErrors: true
  })
}));

app.get('/count', (req, res) => {
  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }

  res.send('hi session');
});

app.get('/tmp', (req, res) => {
  res.send('result: ' + req.session.count);
});

app.get('/welcome', (req, res) => {
  console.log(req.session);
  res.render('welcome', {displayName: req.session.displayName, uname: req.session.uname});
});

app.post('/auth/login', urlEncodedParser, (req, resp) => {
  var credential = [
    {uname: 'prgmaker', password: 'wow', displayName: 'PRGMAER'},
    {uname: 'likepaul', password: 'wow', displayName: 'LIKEPAUL'}
  ];
  var uname = req.body.username;
  var password = req.body.password;
  for(idx in credential) {
    var cur = credential[idx];
    if(cur.uname === uname && cur.password === password) {
      req.session.displayName = cur.displayName;
      req.session.uname = cur.uname;
      req.session.save(()=>{
        resp.redirect('/welcome');
      });
      return;
    }
  }
  resp.render('login', {errmsg:'Who are you?'});
});

app.get('/auth/login', (req, res) => {
  res.render('login');
})

app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;
  delete req.session.uname;
  res.redirect('/welcome');
});

app.get('/auth/register', (req, res) => {
  res.render('register');
});

app.listen(3004, () =>{
  console.log("Listening 3004");
});
