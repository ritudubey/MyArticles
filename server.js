/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var SavedArticle = require("./models/SavedArticle.js");
var User = require("./models/User.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");

mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/myarticledb");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// We'll create a new user by using the User model as a class
// The "unique" rule in the User model's schema will prevent duplicate users from being added to the server
var sampleUser = new User({
  name: "Ritu"
});
// Using the save method in mongoose, we create our example user in the db
sampleUser.save(function(error, doc) {
  // Log any errors
  if (error) {
    console.log(error);
  }
  // Or log the doc
  else {
    console.log(doc);
  }
});



// Routes
// ======

// Simple index route
app.get("/", function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  //res.send("<p>Scrape Complete</p>");
  res.json("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.get("/savedArticles", function(req, res) {
  // Grab every doc in the Articles array
  SavedArticle.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
      res.json({"error": "No saved articles found"});
    }
    // Or send the doc to the browser as a json object
    else {
      //look up origArticle in the Article table
      var result = [];
      for(var i=0; i < doc.length; i++) {
      Article.findOne({_id: doc[i].origArticle}, 
      function(error, found) {
        if(error) {
          console.log(error);
          res.json({"error": "Error retrieving a saved article"});
        } else{
          //result.push(found);
          result.push({
      title: found.title,
      link: found.link
    });
console.log(result);
        }
      });
    }
   
    }
  }).then(function(result){
 res.json(result);
      });
});


// Create a new note or replace an existing note
app.post("/saveArticle/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
   var newSavedArticle = new SavedArticle();
   newSavedArticle.origArticle = mongojs.ObjectID(req.params.id);
   //newSavedArticle.notes = [{}];
  // Save the new note to mongoose
  newSavedArticle.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.json({"error":"Cannot save this article"});
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      // User.findOneAndUpdate({}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
      //   // Send any errors to the browser
      //   if (err) {
      //     res.send(err);
      //   }
      //   // Or send the newdoc to the browser
      //   else {
      //     res.send(newdoc);
      //   }
      // });
      res.json(doc);
    }
  });
});



// Grab an article by it's ObjectId
app.get("/savedArticles", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  User.find({},{saved:true}, function(error, doc) {
    // Log any errors
    if (error) {
      //console.log(error);
       res.send(error);
    }
    // Or send the doc to the browser as a json object
    else {
      //res.json(doc);
       res.send(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  User.findOne({ "name": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Delete One from the DB
app.get("/articles/delete/:id", function(req, res) {
  // Remove a note using the objectID
  User.remove({
    "savedArticles._id": mongojs.ObjectID(req.params.id)
  }, function(error, removed) {
    // Log any errors from mongojs
    if (error) {
      console.log(error);
      res.send(error);
    }
    // Otherwise, send the mongojs response to the browser
    // This will fire off the success function of the ajax request
    else {
      console.log(removed);
      res.send(removed);
    }
  });
});


// Clear the DB
app.get("/clearall", function(req, res) {
  // Remove every note from the notes collection
    User.update({}, { $set : {'savedArticles': [] }} , {multi:true} );
  });


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": mongojs.ObjectID(req.params.id) }, 
      { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
