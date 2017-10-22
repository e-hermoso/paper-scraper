/* Showing Mongoose's "Populated" Method
 * =============================================== */
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
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
mongoose.connect("mongodb://localhost/paperScraper");
var db = mongoose.connection;
// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});
// Routes
// ======
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
  res.send("Scrape Complete");
});
// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // // Grab every doc in the Articles array
  // Article.find({}, function(error, doc) {
  //   // Log any errors
  //   if (error) {
  //     console.log(error);
  //   }
  //   // Or send the doc to the browser as a json object
  //   else {
  //     res.json(doc);
  //   }
  // });
    console.log("getting articles");
  Article.find({}) // after we find all the books we are going to execute (.exec)
  .exec(function(err,results){ // we pass two peramters
    if(err){
      res.send("error has occured");
    }else{
      console.log(results);
      res.json(results);
    }
  });
});
// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
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
// Route to see what user looks like WITH populating
app.get("/populateduser", function(req, res) {
  // Prepare a query to find all users..
  Article.find({})
    // ..and on top of that, populate the notes (replace the objectIds in the notes array with bona-fide notes)
    .populate("note")
    // Now, execute the query
    .exec(function(error, results) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
        res.send(results);
      }
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
    console.log("\n newNote");
    console.log(newNote);

  newNote.save(function(err,results){
    if(err){
      res.send("error saving notes");
    }else {
      Article.findOneAndUpdate({"_id": req.params.id}, { "note": results._id })
      .exec(function(err, results){
        console.log(results);
        res.send(results); // having res.send .... helps us update if its placed inside the .exec
      });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
