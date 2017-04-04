var sum = require('./lib/sum');
console.log(sum(1, 2));

var cal = require('./lib/cal');
console.log('sum', cal.sum(1,2));
console.log('avg', cal.avg(1,2));

// var calobj = require('./lib/calobj')(1, 2);
// console.log(calobj.add());
// console.log(calobj.avg());

var calConstructor = require('./lib/calobj');
console.log(calConstructor.add(1,2));
console.log(calConstructor.avg(1,2));
var calobj = new calConstructor(1,2);
console.log(calobj.add());
console.log(calobj.avg());
