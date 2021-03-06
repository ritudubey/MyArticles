
$("#scrapeLinkId").on('click', function(){
  $.getJSON("/scrape", function(data) {
  // For each entry of that json...
  console.log(data);
   $("#scrapeId").html(data);
});
});

 
 $(document).on("click", "#deleteAllLinkId", function() {
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "DELETE",
    url: "/clearall"
  }).done(function(response) {
      console.log(response);
       $("#scrapeId").html(response);
       $("#savedArticlesId").html("");
       $("#articlesId").html("");
    });
});

$(document).on("click", "#articlesLinkId", function() {
   $("#articlesId").empty();
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articlesId").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    $("#articlesId").append("<button data-id='" + data[i]._id + "' id='saveArticle'>Save Article</button>");
  }
});
});


$(document).on("click", "#savedArticlesLinkId", function() {
  $("#savedArticlesId").empty();
$.getJSON("/savedArticles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#savedArticlesId").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    $("#savedArticlesId").append("<button data-id='" + data[i]._id + "' id='articleNotesButtonId'>Article Notes</button>");
    $("#savedArticlesId").append("<button data-id='" + data[i]._id + "' id='deleteArticleButtonId'>Delete Article</button>");
  }
});
});



// When you click the savenote button
$(document).on("click", "#saveArticle", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/saveArticle/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      //$("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#deleteArticleButtonId", function() {
 var thisButton = $(this);
 var thisId = $(this).attr("data-id");
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/deleteArticle/" + thisId
  }).done(function(response) {
      console.log(response);
      thisButton.parent().children().remove();
    });
});

// Whenever someone clicks a p tag
$(document).on("click", "#articleNotesButtonId", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h3>" + data.title + "</h3>");
      for(var i =0 ; i< data.notes.length; i++) {
        console.log(data.notes[i].title + " " + data.notes[i].body);
        $("#notes").append("<p>"+data.notes[i].title + " " +  data.notes[i].body + "</p>");
      }

      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
    
    $("#savedArticles").append("<button data-id='" + data._id + "' id='deleteArticle'>Delete Article</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
