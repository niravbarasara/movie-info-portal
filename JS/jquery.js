// Small jQuery effects used by this project.
// jQuery is loaded from its CDN in the HTML files.

$(document).ready(function () {
  // Fade the page content in when it opens.
  $("main").hide().fadeIn(400);

  // Add a small visual effect when a movie card is hovered.
  $(document).on("mouseenter", ".movie-card", function () {
    $(this).stop(true).fadeTo(150, 0.88);
  });

  $(document).on("mouseleave", ".movie-card", function () {
    $(this).stop(true).fadeTo(150, 1);
  });

});
