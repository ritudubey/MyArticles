// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var SavedArticleSchema = new Schema({
  // title is a required string
  // title: {
  //   type: String,
  //   required: true
  // },
  // // link is a required string
  // link: {
  //   type: String,
  //   required: true
  // },
   origArticle: {
    // Store ObjectIds in the array
    type: Schema.Types.ObjectId,
    // The ObjectIds will refer to the ids in the Note model
    ref: "Article"
   },
  // This only saves one note's ObjectId, ref refers to the Note model
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema
var SavedArticle = mongoose.model("SavedArticle", SavedArticleSchema);

// Export the model
module.exports = SavedArticle;