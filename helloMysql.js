var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({
  helpers: {
    json: context => JSON.stringify(context),
  },
  defaultLayout: 'main',
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);


app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM todo', function( err, rows, fields ) {
    if(err){
      next(err);
      return;
    }
    context.results = /*JSON.parse*/(JSON.stringify(rows)); // was stringify, wrapped in parse also
    context.table1 = JSON.parse(JSON.stringify(rows));
    res.render('home', context);
  });
});


app.get('/insert',function(req,res,next){
  var context = {};
  // added (`name`, `reps`, `weight`, `date`, `lbs`)
  // also added d, e, f, g query elements
  // also added more ?, so there are 3 blank ? spots expected
  mysql.pool.query("INSERT INTO todo (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [req.query.c, req.query.d, req.query.e, req.query.f, req.query.g], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.statusComment = "Inserted id " + result.insertId;
    res.render('home',context);
    console.log("insert finish");
  });
});

app.get('/delete',function( req, res, next ) {
  var context = {};
  mysql.pool.query("DELETE FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.statusComment = "Deleted " + result.changedRows + " rows.";
    res.render('home',context);
  });
});

// add new EDIT page
app.get('/edit',function( req, res, next ) {
  var context = {};
  context.editSpace = req;
  res.render('home',context);
});


///simple-update?id=2&name=The+Task&done=false&due=2015-12-5
app.get('/simple-update',function(req,res,next){
  var context = {};
  mysql.pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
    [req.query.name, req.query.done, req.query.due, req.query.id],
    function(err, result){
    if(err){
      next(err);
      return;
    }
    context.statusComment = "Updated " + result.changedRows + " rows.";
    res.render('home',context);
  });
});

///safe-update?id=1&name=The+Task&done=false
app.get('/safe-update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE todo SET name=?, reps=?, weight=? date=? lbs=?",
        [req.query.c || curVals.name, req.query.d || curVals.reps, req.query.e || curVals.weight, req.query.f || curVals.date, req.query.g || curVals.lbs],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});






app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS todo", function(err){
    var createString = "CREATE TABLE todo(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "reps INT," +
    "weight INT," +
    "date DATE," +
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
      console.log("table reset");
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});








