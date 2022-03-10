// getting-started.js
/**
 * Requires
 */
var express = require('express');
//var path = require("path");
//var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var mongoUrl = 'mongodb://localhost:27017/ProperDB';
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}); // , useUnifiedTopology: true

// get notified if we connect successfully or if a connection error occurs
const db = mongoose.connection;
db.once('open', () => console.log("We're connected!"));
db.on('error', error => {console.log("Connection Error: ", error);});

var app = express()
// app.use(bodyParser());
app.use(express.json()); //{limit:'5mb'}
app.use(express.urlencoded({extended: true}));


app.use(function (req, res ,next){
  // allows us to define the website we wish to connect to, which in our case is http://localhost:4200.
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  // helps us define the request methods we wish to allow in our code.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // defines the request headers we wish to allow.
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // allows the website to include cookies in the request sent to the API.
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// define our database Schema
var Schema = mongoose.Schema;
var userSchema = new Schema({
  name: { type: String },
  propers: [{ project: String, percentage: Number }],
  mode: { type: String }
},{versionKey: false});


// Define the Model
var model = mongoose.model('users', userSchema, 'users');

// Save many
app.post('/api/saveMany', function(req, res){
  
  /**
   * ------------------------------------------------------------------------------------
   * 
   *                                    SAVE MANY
   * 
   * ------------------------------------------------------------------------------------
   */
  
  model.insertMany(req.body, function(err,data){
    if(err){
      res.send(err);
    }
    else{
      res.send({data: "Data inserted"});
    }
  });
  // ------------------------------------------------------------------------------------
  //                    For each user, check if the user already 
  //                    exists in the DB. If so just Update him.
  //                    Otherwise, save the user as new.  
  // ------------------------------------------------------------------------------------
  /*
  console.log(req.body);
  for(let user of req.body){
    let userExists = false;
    let usersForUpdate = [];
    let usersForSave = [];
    model.find({name : user.name}, function(err, data){
      if(err){
        res.send(err);
      }
      else if(data.length){
        userExists = true
      }
      else{
        userExists = false;
      }
    });
    if (userExists){
      usersForUpdate.push(user);
    }
    else{
      usersForSave.push(user);
    }
  }

  /*
  model.bulkWrite(
    req.body.map((user) => 
    ({
        updateOne: {
          filter: { name : user.name },
          update: { $set: user },
          upsert: true
        }
    })
    ,function(err,data){
        if(err){
          res.send(err);
        }
        else{
          res.send({data: "Data inserted"});
        }}
    )
  )*/
  /**
   * ------------------------------------------------------------------------------------
   * 
   *                                    UPDATE MANY
   * 
   * ------------------------------------------------------------------------------------
   */
  /*
   model.updateMany(req.body, function(err,data){
    if(err){
      res.send(err);
    }
    else{
      res.send({data: "Data inserted"});
    }
  });
  */
});

// Save User
app.post('/api/saveUser',async function(req, res){

  var mod = new model(req.body);
  if (req.body.mode == 'Save'){
    mod.save(function(err,data){
      if(err){
        res.send(err);
      }
      else{
        res.send({data: "Record has been Inserted..!!", _id: mod.id});
      }
    });
  }
  else{ 
    model.findByIdAndUpdate( req.body._id , {_id: req.body._id, name: req.body.name, propers: req.body.propers, mode: req.body.mode},
      function(err, data){
        if(err){
          res.send(err);
        }
        else{
          res.send({data: "Record has been Updated..!!"});
        }
      });
  }
});
/**
 * ------------------------------------------------------------------------------------
 * 
 *                                Delete User
 * 
 * ------------------------------------------------------------------------------------
 */
  

app.post("/api/deleteUser", function(req,res){
  model.deleteOne({ _id: req.body.id }, function(err){
    if(err){
      res.send(err);
    }
    else{
      res.send({data: "Record has been Deleted..!!"});
    }
  });
});
/**
 * ------------------------------------------------------------------------------------
 * 
 *                                Delete all 
 * 
 * ------------------------------------------------------------------------------------
 */
app.post("/api/deleteAll", function(req,res){
  model.deleteMany({},  function(err){
    if(err){
      res.send(err);
    }
    else{
      res.send({data: "All Records have been deleted..!!"});
    }
  });
});

/**
 * ------------------------------------------------------------------------------------
 * 
 *                               Get Data 
 * 
 * ------------------------------------------------------------------------------------
 */
app.get("/api/getData", function(req, res){
  model.find({}, function(err, data){
    if(err){
      res.send(err);
    }
    else{
      res.send(data);
    }
  });
});
/**
 * ------------------------------------------------------------------------------------
 * 
 *                              Get IDs
 * 
 * ------------------------------------------------------------------------------------
 */
app.get("/api/getIDs", function(req, res){
  model.find({},'_id name', function(err, data){
    if(err){
      res.send(err);
    }
    else{
      res.send(data);
    }
  });
});
/**
 * ------------------------------------------------------------------------------------
 * 
 *                             Does User Exist
 * 
 * ------------------------------------------------------------------------------------
 */
app.get("/api/checkName", function(req, res){
  model.find({name : req.name}, function(err, data){
    if(err){
      res.send(err);
    }
    else if(data.length){
      res.send(true);
    }
    else{
      res.send(false);
    }
  });
});
// -----------------------------------------listen...-----------------------------------------
app.listen(8080, function() {
  console.log("Listening to port 8080...");
});
// ##################################################################################################