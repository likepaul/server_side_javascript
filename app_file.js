var express = require('express');
var app = express(); // function object constructor -> object
var fs = require('fs');
var multer = require('multer');

app.use('/user', express.static('my-uploads'));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'my-uploads/');
  },
  filename: function (req, file, cb) {
    var date = new Date();
    cb(null, `${file.originalname}-`+
      `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}_`+
      `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`);
  }
});
var upload = multer({storage: storage})
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
const successResponse = `
    Success<br>
    <a href='/topic'>goto Topic</a>
  `;
const TOPIC_DIR = 'data/';

app.locals.pretty = true;
app.set('views', './views');
app.set('view engine', 'pug');

app.listen(3000, function() {
    console.log('Connected 3000');
});

app.get('/topic/new', (req, resp) => {
  fs.readdir(TOPIC_DIR, (err, files) => {
    if (err) {
      resp.status(500).send('Internal Server Error');
    }
    resp.render('new', {topics:files});
  });
});

app.post('/topic', urlencodedParser, (req, resp) => {
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile(TOPIC_DIR + title, description, {
            encoding: 'utf8',
            flag: 'w'
        },
        (err) => {
            if (err) {
                resp.status(500).send('Internal Server Error');
            }
            resp.redirect('/topic/'+title);
        });
});

app.get(['/topic', '/topic/:id'], (req, resp) => {
    fs.readdir(TOPIC_DIR, (err, files) => {
        var id = req.params.id;

        if (err) {
            resp.status(500).send('Internal Server Error');
        }

        if (id) {
            fs.readFile(TOPIC_DIR + id, 'utf8', (err, data) => {
                if (err) {
                    resp.status(500).send('Internal Server Error');
                }
                resp.render('view', {
                    topics: files,
                    title: id,
                    description: data
                });
            });
        } else {
            resp.render('view', {
                topics: files,
                title:'Welcome',
                description:'Hello, JavaScript for servier'
            });
        }
    });
});

app.get('/upload', (req, resp) => {
    resp.render('upload')
});

app.post('/upload', upload.single('userfile'), (req, resp) => {
  console.log(req.file)
  // resp.send('uploaded: ' + req.file.filename)
  resp.render('uploadview', {title: req.file.filename, path:req.file.path})
});
