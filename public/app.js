$("#scrapeNewArticle").on("click", function(){
  $.getJSON("/scrape", function(data){
    displayResults(data);
  });
  alert("added new articles");
  window.location.reload();
});
// Grab the articles as a json
$.getJSON("/articles", function(data) {
  console.log(data);
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    // var formattedDate = new Date(post.createdAt);
    // formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var newArticlePanel = $("<div>");
    newArticlePanel.addClass("panel panel-default");
    var newArticlePanelHeading = $("<div>");
    newArticlePanelHeading.addClass("panel-heading");
    var deleteBtn = $("<button id=delete>");
    deleteBtn.text("Delete From Saved");
    deleteBtn.addClass("delete btn btn-danger");
    var editBtn = $("<button id='editArticle' >");
    editBtn.text("Articel Notes");
    editBtn.addClass("edit btn btn-info");
    var newPostTitle = $("<h2>");
    // var newPostDate = $("<small>");
    // var newPostAuthor = $("<h5>");
    // newPostAuthor.text("Written by: " + post.Author.name);
    // newPostAuthor.css({
    //   float: "right",
    //   color: "green",
    //   "margin-top":
    //   "-10px"
    // });
    var newPostPanelBody = $("<div>");
    newPostPanelBody.addClass("panel-body");
    var newInfoBody = $("<p data-id='" + data[i]._id + "'>" + "<br />" + data[i].link + "</p>");
    newPostTitle.text(data[i].title + " ");
    // newPostBody.text(post.body);
    // newPostDate.text(formattedDate);
    // newPostTitle.append(newPostDate);
    newArticlePanelHeading.append(deleteBtn);
    newArticlePanelHeading.append(editBtn);
    newArticlePanelHeading.append(newPostTitle);
    // newPostPanelHeading.append(newPostAuthor);
    newPostPanelBody.append(newInfoBody);
    newArticlePanel.append(newArticlePanelHeading);
    newArticlePanel.append(newPostPanelBody);
    $("#articles").prepend(newArticlePanel);
  }
});
// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  // grap the notes from a psecific article as a json
  console.log("===========pupulate user==========");
  $.getJSON("/populateduser", function(data) {
    console.log(data);
  });

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log("=====ajax call====");
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
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
