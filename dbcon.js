var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : 'cs290_crossky',
  password        : '5722',
  database        : 'cs290_crossky'
});

module.exports.pool = pool;