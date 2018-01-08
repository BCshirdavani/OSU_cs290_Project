var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_shirdavb',
  password        : '5537',
  database        : 'cs290_shirdavb'
});

module.exports.pool = pool;