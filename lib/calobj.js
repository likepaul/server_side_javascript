// module.exports = function(a, b) {
//   return {
//     add: function() {
//       return a + b;
//     },
//     avg: function() {
//       return (a + b) / 2;
//     }
//   };
// };

function calConstructor(a, b) {
  this.var1 = a;
  this.var2 = b;
};

calConstructor.add = function(a, b) {
  return a + b;
}

calConstructor.avg = function(a, b) {
  return (a + b) / 2;
}

calConstructor.prototype.add = function() {
  return this.var1 + this.var2;
}

calConstructor.prototype.avg = function() {
  return (this.var1 + this.var2) / 2;
}

module.exports = calConstructor;
