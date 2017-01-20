var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));


//renders home page
app.get('/',function(req,res,next){
    res.render('home');
});


//returns all rows in database
app.get('/getTable',function(req,res,next){
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        res.type('text/plain');
        res.send(rows);
    });
});

//returns workout row for specific id
app.get('/getWorkout',function(req,res,next){
    mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        res.type('text/plain');
        res.send(rows);
    });
});

//adds a workout to database
app.get('/addWorkout',function(req,res,next){
    mysql.pool.query("INSERT INTO workouts (name,reps,weight,date,lbs) VALUES (?,?,?,?,?)",
        [req.query.name,req.query.reps,req.query.weight,req.query.date,req.query.lbs], function(err, result){
            if(err){
                next(err);
                return;
            }
            res.type('text/plain');
            res.send(result);
        });
});

//remove workout from database with a specific id
app.get('/delete',function(req,res,next){
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    res.type('text/plain');
    res.send(result);
  });
});

//renders the edit page with a pre-filled form, and updates a workout from edit page
app.post('',function(req,res) {
    //renders the edit page with a form filled out with current values for selected workout to be edited
  if (req.body.Edit) {
      mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.body.id], function(err, rows, fields){
          if(err){
              next(err);
              return;
          }
          var context = {};

          context.name = rows[0].name;
          context.reps = rows[0].reps;
          context.weight = rows[0].weight;
          context.id = rows[0].id;

          //checks the radio button value
          if (rows[0].lbs == 1) {
            context.lbsChecked = "checked";
          }
          else {
            context.kgChecked = "checked";
          }

          //format the date to be compatible with database
          var date = JSON.stringify(rows[0].date);
          if (date[1] != "0") {
              var i = 1;
              var newDate = "";
              while (date[i] != "T") {
                  newDate += date[i];
                  i++;
              }
              context.date = newDate;
          }

          res.render('edit',context);
      });
  }
  //updates the current workout on the edit page to values entered by user
  else {
      var context = {};
      mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
          if(err){
              next(err);
              return;
          }
          if(result.length == 1){
              var curVals = result[0];
              mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, lbs=?, date=?  WHERE id=? ",
                  [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight,
                      req.body.lbs || curVals.lbs, req.body.date || curVals.date, req.body.id],
                  function(err, result){
                      if(err){
                          next(err);
                          return;
                      }
                      res.render('home');
                  });
          }
      });
  }
});


//resets database to empty
//only used for quick implementation and testing
app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
            "id INT PRIMARY KEY AUTO_INCREMENT,"+
            "name VARCHAR(255) NOT NULL,"+
            "reps INT,"+
            "weight INT,"+
            "lbs BOOLEAN,"+
            "date DATE)";
        mysql.pool.query(createString, function(err){
            context.results = "Table reset";
            res.render('home',context);
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
