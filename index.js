const API_KEY = "61a531e7460f47ba8b14c8497ba944df";

var allGames      = []; 
var wishlist      = [];
var compareMode   = false;
var compareSlots  = [];
var activePlatform = "";
var debounceTimer = null;

function fetchGames(query) {
  if (!query) query = "";

  document.getElementById("status").textContent = "Loading...";
  document.getElementById("grid").innerHTML = "";

  var url = "https://api.rawg.io/api/games?key=" + API_KEY + "&page_size=40&search=" + query;

  fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      allGames = data.results;
      renderGrid();
    })
    .catch(function(err) {
      document.getElementById("status").textContent = "Error loading games.";
      console.error(err);
    });
}
document.getElementById("search").addEventListener("input", function(e) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(function() {
    fetchGames(e.target.value);
  }, 500);
});
var platformBtns = document.querySelectorAll(".platform-btn");

platformBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    platformBtns.forEach(function(b) {
      b.classList.remove("active");
    });

    btn.classList.add("active");
    activePlatform = btn.getAttribute("data-platform");
    renderGrid();
  });
});
document.getElementById("compare-btn").addEventListener("click", function() {
  compareMode = !compareMode;
  compareSlots = [];

  var btn = document.getElementById("compare-btn");

  if (compareMode) {
    btn.textContent = "Exit Compare";
    btn.classList.add("active");
    document.getElementById("compare-panel").style.display = "block";
  } else {
    btn.textContent = "Compare Mode";
    btn.classList.remove("active");
    document.getElementById("compare-panel").style.display = "none";
  }

  renderGrid();
  renderCompare();
});

function renderGrid() {
  var filtered = allGames.filter(function(game) {
    if (!activePlatform) return true;

    if (!game.platforms) return false;
    return game.platforms.some(function(p) {
      return p.platform.name.toLowerCase().indexOf(activePlatform) !== -1;
    });
  });

  document.getElementById("status").textContent = "Showing " + filtered.length + " games";

  if (filtered.length === 0) {
    document.getElementById("grid").innerHTML = "<p style='color:#aaa;padding:20px'>No games found.</p>";
    return;
  }

  var cards = filtered.map(function(game) {
    var inWishlist = wishlist.some(function(w) { return w.id === game.id; });
    var inCompare  = compareSlots.some(function(c) { return c.id === game.id; });

    var stars = renderStars(game.rating);
    var platforms = "Unknown";
    if (game.platforms) {
      platforms = game.platforms.slice(0, 3).map(function(p) {
        return p.platform.name;
      }).join(", ");
    }

    var img = game.background_image || "https://placehold.co/300x120/888/fff?text=No+Image";

    var compareBtn = "";
    if (compareMode) {
      compareBtn = '<button class="btn-compare ' + (inCompare ? "picked" : "") + '" onclick="toggleCompare(' + game.id + ')">'
        + (inCompare ? "✓ Picked" : "Compare")
        + '</button>';
    }

    return '<div class="game-card ' + (inCompare ? "compare-selected" : "") + '">'
      + '<img src="' + img + '" alt="' + game.name + '" loading="lazy" />'
      + '<div class="card-body">'
      + '<div class="card-title">' + game.name + '</div>'
      + '<div class="stars">' + stars + ' ' + (game.rating || "N/A") + '</div>'
      + '<div class="card-meta">' + (game.released ? game.released.slice(0, 4) : "?") + ' | ' + platforms + '</div>'
      + '<button class="btn-wish ' + (inWishlist ? "saved" : "") + '" onclick="toggleWishlist(' + game.id + ')">'
      + (inWishlist ? "★ Saved" : "+ Wishlist")
      + '</button>'
      + compareBtn
      + '</div>'
      + '</div>';
  });

  document.getElementById("grid").innerHTML = cards.join("");
}


function renderStars(rating) {
  var full  = Math.floor(rating || 0);
  var empty = 5 - full;

  var result = "";


  for (var i = 0; i < full; i++) {
    result += "★";
  }

  for (var j = 0; j < empty; j++) {
    result += "☆";
  }

  return result;
}


function toggleWishlist(gameId) {
  var game = allGames.find(function(g) { return g.id === gameId; });

  var alreadySaved = wishlist.some(function(w) { return w.id === gameId; });

  if (alreadySaved) {

    wishlist = wishlist.filter(function(w) { return w.id !== gameId; });
  } else {
    wishlist.push(game);
  }

  renderWishlist();
  renderGrid();
}


function renderWishlist() {
  document.getElementById("wish-count").textContent = wishlist.length;

  if (wishlist.length === 0) {
    document.getElementById("wishlist-items").innerHTML = '<p id="empty-msg">No games saved yet.</p>';
    return;
  }

  var items = wishlist.map(function(game) {
    var img = game.background_image || "https://placehold.co/40x40/888/fff?text=?";
    return '<div class="wish-item">'
      + '<img src="' + img + '" alt="' + game.name + '" />'
      + '<span class="wish-name">' + game.name + '</span>'
      + '<span class="wish-remove" onclick="toggleWishlist(' + game.id + ')">×</span>'
      + '</div>';
  });

  document.getElementById("wishlist-items").innerHTML = items.join("");
}


function toggleCompare(gameId) {
  var game = allGames.find(function(g) { return g.id === gameId; });

  var alreadyPicked = compareSlots.some(function(c) { return c.id === gameId; });

  if (alreadyPicked) {
    compareSlots = compareSlots.filter(function(c) { return c.id !== gameId; });
  } else if (compareSlots.length < 2) {
    compareSlots.push(game);
  }

  renderCompare();
  renderGrid();
}


function renderCompare() {
  var slots = ["slot-a", "slot-b"];


  slots.forEach(function(slotId, index) {
    var game = compareSlots[index];
    var el   = document.getElementById(slotId);

    if (!game) {
      el.className = "compare-hint";
      el.innerHTML = "Pick the " + (index === 0 ? "first" : "second") + " game";
      return;
    }

    var platforms = "Unknown";
    if (game.platforms) {
      platforms = game.platforms.map(function(p) { return p.platform.name; }).join(", ");
    }

    var genres = "Unknown";
    if (game.genres) {
      genres = game.genres.map(function(g) { return g.name; }).join(", ");
    }

    var img = game.background_image || "https://placehold.co/300x90/888/fff?text=?";

    el.className = "compare-col";
    el.innerHTML = '<img src="' + img + '" alt="' + game.name + '" />'
      + '<div class="compare-body">'
      + '<strong>' + game.name + '</strong>'
      + '<div class="compare-row"><span>Rating</span><span>' + (game.rating || "N/A") + ' / 5</span></div>'
      + '<div class="compare-row"><span>Released</span><span>' + (game.released || "?") + '</span></div>'
      + '<div class="compare-row"><span>Metacritic</span><span>' + (game.metacritic || "—") + '</span></div>'
      + '<div class="compare-row"><span>Genres</span><span>' + genres + '</span></div>'
      + '<div class="compare-row"><span>Platforms</span><span>' + platforms + '</span></div>'
      + '</div>';
  });
}


fetchGames(); 