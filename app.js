var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.locals.pretty = true;
/**
 * template engine
 */
app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/form_receiver', (req, resp) => {
    var title = req.query.title;
    var description = req.query.description;
    resp.send(`title: ${title}<br>
    description: ${description}`);
});
app.get('/form', (req, resp) => {
    resp.render('form');
});

app.post('/form_receiver', (req, resp) => {
    var title = req.body.title;
    var description = req.body.description;
    resp.send(`title: ${title}<br>
    description: ${description}`);
});
app.get('/form', (req, resp) => {
    resp.render('form');
});

app.get(['/topic/:id', '/topic'], (req, resp) => {
    // resp.send(req.query);
    var content = [
        'Javscript is...',
        'Nodsjs is...',
        'Express is...'
    ];

    // resp.render('topic', {
    //   id : req.query.id,
    //   content: req.query.id < 3 ? content[req.query.id] : content[0],
    //   arr: content
    // });

    var output = ``;
    for (var i = 0; i < content.length; i++) {
        output += `<a href='/topic/${i}'>${content[i]}</a><br>`;
    }

    if (req.params.id) {
        output += `<br>${content[req.params.id]}`;
    }

    resp.send(output);
});

app.get('/topic/:id/:mode', (req, resp) => {
    resp.send(req.params.id + ', ' + req.params.mode);
});

app.get('/template', function(req, resp) {
    resp.render('temp', {
        '_time': new Date().toString(),
        '_title': 'Test pug'
    });
});

app.get('/', (req, resp) => {
    resp.send('Hello home page');
});

app.get('/dynamic', (req, resp) => {
    var lis = '';
    for (var i = 0; i < 5; i++) {
        lis += `<li>coding</li>`
    }

    var output = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>inner/static</title>
    </head>
    <body>
      <h1>Hello Dynamic.</h1>
      <ol>
      ${lis}
      </ol>
    </body>
  </html>`;
    resp.send(output);
});

app.get('/route', (req, resp) => {
    resp.send('Hello router, <img src="/profile_picture.png" />')
});

app.get('/login', (req, resp) => {
    resp.send('<h1>Login please</h1>');
});

app.listen(3000, () => {
    console.log('Connected 3000 port!');
});
