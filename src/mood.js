function playSong(videoId) {
  player.loadVideoById(videoId);
  isPlaying = true;
  updatePlayPauseButton();
}

function fetchSongsByGenre(genre) {
  var apiKey = getRandomAPIKey();
  var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&&maxResults=30&q=latest${genre} topic songs&type=videos&key=${apiKey}`;

  $.ajax({
    url: url,
    success: function (response) {
      displayGenreSongs(response);
    },
    error: function (xhr) {
      console.log(xhr);
    },
  });
}

function displayGenreSongs(response) {
  var songsContainer = document.getElementById("genre-songs");
  songsContainer.innerHTML = ""; // Clear previous results

  response.items.forEach(function (item) {
    var videoId = item.id.videoId;
    var videoTitle = truncateTitle(item.snippet.title); // Apply truncateTitle
    var thumbnailUrl = item.snippet.thumbnails.medium.url;

    var songElement = document.createElement("div");
    songElement.className = "song";
    songElement.innerHTML = `
            <img src="${thumbnailUrl}" alt="${videoTitle}">
            <p>${videoTitle}</p>
        `;
    songElement.onclick = function () {
      playSong(videoId);
    };

    songsContainer.appendChild(songElement);
  });
}
