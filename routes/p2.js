module.exports = function(express) {
  var route = express.Router();

  route.get('/r1', (req, res) => {
    res.send('/p2/r1');
  });

  route.get('/r2', (req, res) => {
    res.send('p2/r1');
  });

  return route;
};
