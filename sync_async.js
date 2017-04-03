var fs = require('fs');
console.log(1);
var content = fs.readFileSync('data.txt', {
    'encoding': 'utf8'
});
console.log(content);

console.log(2);
fs.readFile('data.txt', {'encoding':'utf-8'}, function(err, data) {
  console.log(err ? err : 'no error');
  console.log(data);
});
