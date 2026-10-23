// Main JavaScript file for the Movie Information Portal.

// Find one HTML element by its ID.
function getElement(id) {
  return document.getElementById(id);
}

// Read a list from localStorage. If there is no saved list, return an empty one.
function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

// Save a list in localStorage so it stays after the page is refreshed.
function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// Escape text before placing it inside HTML.
function safeText(text) {
  return String(text).replace(/[&<>"']/g, function (character) {
    const symbols = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return symbols[character];
  });
}

// Make the HTML for one movie card.
function makeMovieCard(movie) {
  const favourites = readList("mip-favourites");
  const isFavourite = favourites.includes(movie.id);

  return `
    <article class="movie-card">
      <img class="poster-img" src="${movie.image}" alt="${safeText(movie.title)} poster">
      <div class="movie-card-content">
        <h3>${safeText(movie.title)}</h3>
        <p>${movie.genre.join(", ")} · ${movie.year}</p>
        <p>Language: ${movie.language}</p>
        <p>★ ${movie.rating}/10</p>
        <div class="card-actions">
          <a class="btn btn-primary" href="movies_details.html?id=${movie.id}">View Details</a>
          <button class="btn btn-secondary" type="button" data-favourite="${movie.id}">
            ${isFavourite ? "♥ Saved" : "♡ Favourite"}
          </button>
        </div>
      </div>
    </article>
  `;
}

// Show a message when there are no matching movies.
function showEmptyMessage(message) {
  return `<p class="empty-message">${message}</p>`;
}

// Show all movies that match the selected search and filters.
function showMovies() {
  const grid = getElement("movie-grid");
  if (!grid) return;

  const search = getElement("search-title");
  const genre = getElement("genre-filter");
  const sort = getElement("sort-filter");
  const language = getElement("language-filter");
  const year = getElement("year-filter");
  const minimumRating = getElement("rating-filter");

  const searchText = search ? search.value.toLowerCase().trim() : "";
  const selectedGenre = genre ? genre.value : "all";
  const selectedLanguage = language ? language.value : "all";
  const selectedYear = year ? year.value : "all";
  const selectedRating = minimumRating ? Number(minimumRating.value) : 0;
  const sortBy = sort ? sort.value : "default";

  let result = movies.filter(function (movie) {
    const matchesTitle = movie.title.toLowerCase().includes(searchText);
    const matchesGenre = selectedGenre === "all" || movie.genre.includes(selectedGenre);
    const matchesLanguage = selectedLanguage === "all" || movie.language === selectedLanguage;
    const matchesYear = selectedYear === "all" || String(movie.year) === selectedYear;
    const matchesRating = movie.rating >= selectedRating;

    return matchesTitle && matchesGenre && matchesLanguage && matchesYear && matchesRating;
  });

  if (sortBy === "title") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "year") {
    result.sort((a, b) => b.year - a.year);
  }

  if (result.length > 0) {
    grid.innerHTML = result.map(makeMovieCard).join("");
  } else {
    grid.innerHTML = showEmptyMessage("No movies match your search.");
  }

  const count = getElement("movie-count");
  if (count) count.textContent = result.length + " movie(s) found";

  connectFavouriteButtons();
}

// Add or remove a movie from the favourites list.
function connectFavouriteButtons() {
  const buttons = document.querySelectorAll("[data-favourite]");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const movieId = button.dataset.favourite;
      let favourites = readList("mip-favourites");

      if (favourites.includes(movieId)) {
        favourites = favourites.filter(id => id !== movieId);
      } else {
        favourites.push(movieId);
      }

      saveList("mip-favourites", favourites);

      if (document.body.dataset.page === "favourites") {
        showFavourites();
      } else if (document.body.dataset.page === "details") {
        showMovieDetails();
      } else {
        showMovies();
      }
    });
  });
}

// Show only movies saved by the user.
function showFavourites() {
  const grid = getElement("movie-grid");
  if (!grid) return;

  const favourites = readList("mip-favourites");
  const savedMovies = movies.filter(movie => favourites.includes(movie.id));

  if (savedMovies.length > 0) {
    grid.innerHTML = savedMovies.map(makeMovieCard).join("");
  } else {
    grid.innerHTML = showEmptyMessage("You have no favourite movies yet. Go to Movies and select Favourite.");
  }

  connectFavouriteButtons();
}

// Show the details for the movie ID in the page URL.
function showMovieDetails() {
  const box = getElement("details-content");
  if (!box) return;

  const movieId = new URLSearchParams(window.location.search).get("id") || "inception";
  const movie = movies.find(item => item.id === movieId) || movies[0];
  const favourites = readList("mip-favourites");
  const isFavourite = favourites.includes(movie.id);

  box.innerHTML = `
    <div class="movie-poster">
      <img src="${movie.image}" alt="${safeText(movie.title)} poster">
    </div>
    <div class="movie-info">
      <h2>${safeText(movie.title)}</h2>
      <p><strong>Genre:</strong> ${movie.genre.join(", ")}</p>
      <p><strong>Year:</strong> ${movie.year}</p>
      <p><strong>Language:</strong> ${movie.language}</p>
      <p><strong>Rating:</strong> ★ ${movie.rating}/10</p>
      <p><strong>Duration:</strong> ${movie.duration}</p>
      <p><strong>Director:</strong> ${safeText(movie.director)}</p>
      <h3>About the Movie</h3>
      <p>${safeText(movie.description)}</p>
      <h3>Cast</h3>
      <p>${safeText(movie.cast)}</p>
      <div class="details-actions">
        <button class="btn btn-primary" id="detail-favourite" type="button">
          ${isFavourite ? "♥ Remove from Favourites" : "♡ Add to Favourites"}
        </button>
        <a class="btn btn-secondary" href="reviews_rating.html">Write a Review</a>
      </div>
    </div>
  `;

  getElement("detail-favourite").addEventListener("click", function () {
    let favourites = readList("mip-favourites");

    if (favourites.includes(movie.id)) {
      favourites = favourites.filter(id => id !== movie.id);
    } else {
      favourites.push(movie.id);
    }

    saveList("mip-favourites", favourites);
    showMovieDetails();
  });
}

// Fill the movie selector on the review form using the movie list.
function fillMovieOptions() {
  const selector = getElement("movie-select");
  if (!selector) return;

  selector.innerHTML = '<option value="">Choose a movie...</option>';

  movies.forEach(function (movie) {
    const option = document.createElement("option");
    option.value = movie.title;
    option.textContent = movie.title;
    selector.appendChild(option);
  });
}

// Show all reviews saved in this browser.
function showReviews() {
  const form = getElement("review-form");
  const list = getElement("reviews-list");
  if (!form || !list) return;

  fillMovieOptions();

  function drawReviews() {
    const reviews = readList("mip-reviews");
    const count = getElement("review-count");
    const emptyMessage = getElement("no-reviews");

    if (count) count.textContent = reviews.length + " review(s)";
    if (emptyMessage) emptyMessage.hidden = reviews.length > 0;

    list.innerHTML = reviews.map(function (review, index) {
      return `
        <article class="review-item">
          <div class="review-header">
            <p class="review-author">${safeText(review.name)}</p>
            <p class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>
          </div>
          <p class="review-movie">Movie: ${safeText(review.movie)}</p>
          <p class="review-text-body">${safeText(review.text)}</p>
          <button class="btn btn-secondary" type="button" data-delete-review="${index}">Delete</button>
        </article>
      `;
    }).join("");

    document.querySelectorAll("[data-delete-review]").forEach(function (button) {
      button.addEventListener("click", function () {
        const currentReviews = readList("mip-reviews");
        currentReviews.splice(Number(button.dataset.deleteReview), 1);
        saveList("mip-reviews", currentReviews);
        drawReviews();
      });
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const newReview = {
      name: getElement("reviewer-name").value.trim(),
      movie: getElement("movie-select").value,
      rating: Number(getElement("rating-input").value),
      text: getElement("review-text").value.trim()
    };

    const reviews = readList("mip-reviews");
    reviews.unshift(newReview);
    saveList("mip-reviews", reviews);

    form.reset();
    fillMovieOptions();
    drawReviews();
  });

  drawReviews();
}

// Check the contact form and show a simple success message.
// This demo does not send an actual email.
function connectContactForm() {
  const form = getElement("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    getElement("form-status").textContent =
      "Thank you! Your message passed validation. This demo does not send email.";
    form.reset();
  });
}

// Search from the home page and open the Movies page with the search text.
function connectHomeSearch() {
  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const text = form.querySelector("input").value.trim();
      window.location.href = "movies.html?q=" + encodeURIComponent(text);
    });
  });
}

// Start the correct features for the page that is open.
document.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;

  if (page === "movies") {
    const query = new URLSearchParams(window.location.search).get("q");
    if (getElement("search-title")) getElement("search-title").value = query || "";

    showMovies();

    ["search-title", "genre-filter", "sort-filter", "language-filter", "year-filter", "rating-filter"]
      .forEach(function (id) {
        const control = getElement(id);
        if (control) control.addEventListener("change", showMovies);
        if (control && control.tagName === "INPUT") control.addEventListener("input", showMovies);
      });

    const reset = getElement("reset-filters");
    if (reset) {
      reset.addEventListener("click", function () {
        ["search-title", "genre-filter", "sort-filter", "language-filter", "year-filter", "rating-filter"]
          .forEach(function (id) {
            const control = getElement(id);
            if (control) control.value = id === "search-title" ? "" :
              (id === "genre-filter" || id === "language-filter" || id === "year-filter" ? "all" :
              (id === "rating-filter" ? "0" : "default"));
          });
        showMovies();
      });
    }
  }

  if (page === "favourites") showFavourites();
  if (page === "details") showMovieDetails();
  if (page === "reviews") showReviews();

  connectContactForm();
  connectHomeSearch();
});
