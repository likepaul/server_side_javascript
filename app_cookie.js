var express = require('express');
var app = express();
var cookieParser = require('cookie-parser')
var OrientDB = require('orientjs');
var server = OrientDB({
  host: 'localhost',
  port: 2424,
  user: 'root',
  password: 'Supper@Lotto949'
});
var db = server.use('o2');

// set up cookie middleware
app.use(cookieParser('34789140741234#1234-9234'));
// set up template engine
app.locals.pretty = true;
app.set('views', './views_cookie');
app.set('view engine', 'pug');

app.get('/count', (req, res) => {
  var count = req.signedCookies['count'] ? parseInt(req.signedCookies['count']) + 1 : 1;
  res.cookie('count', count, {
    signed: true
  });
  res.send('count: ' + count);
});

app.get('/products', (req, res) => {
  var sql = 'SELECT FROM products';
  db.query(sql)
  .then((results) => {
    res.render('products', {
      products: results
    });
  });
});


/*
cart = {
  id1: count1
  id2: count2
}
*/
app.get('/cart/:id', (req, res) => {
  var id = req.params.id;
  if (req.signedCookies.cart) {
    var cart = req.signedCookies.cart;
  } else {
    var cart = {};
  }
  cart[id] = cart[id] ? parseInt(cart[id]) + 1 : 1;
  res.cookie('cart', cart, {
    signed: true
  });
  res.redirect('/cart');
});

app.get('/cart', (req, res) => {
  var sql = 'SELECT FROM products';
  db.query(sql).then((results) => {
    function findTitle(id) {
      for(var key in results) {
        if(results[key]['@rid'] == id) {
          return results[key].title;
        }
      }
    }

    var needToAdjustCart = false;
    var cart = req.signedCookies.cart ? req.signedCookies.cart : {};
    var modifiedCart = {};
    for (var key in cart) {
      var title = findTitle(key);
      var count = cart[key] ? parseInt(cart[key]) : 0;
      if(title && count > 0) {
        if (!modifiedCart[key]) {
          modifiedCart[key] = {};
        }
        modifiedCart[key].title = title;
        modifiedCart[key].count = count;
      } else {
        delete cart[key];
        needToAdjustCart = true;
      }
    }

    if(needToAdjustCart) {
      res.cookie('cart', cart, {
        signed: true
      });
    }

    res.render('cart', {
      carts: modifiedCart
    });
  });
});

app.get('/cart/:id/delete', (req, res) => {
  var cart = req.signedCookies.cart ? req.signedCookies.cart : {};
  var id = req.params.id;

  var count = 0;
  if (!cart[id] || isNaN(cart[id]) || (count = parseInt(cart[id])) < 2) {
    delete cart[id];
  } else {
    cart[id] = --count;
  }
  res.cookie('cart', cart, {
    signed: true
  });
  res.redirect('/cart');
});

app.listen(3003, () => {
  console.log('Listening 3000 port...');
});
