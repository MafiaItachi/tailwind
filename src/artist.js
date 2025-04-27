// Function to search artist's channel
function searchArtistChannel() {
  var channelName = document.getElementById("searchInput").value + " - Topic";
  var apiKey = getRandomAPIKey();
  var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelName}&key=${apiKey}`;
  console.log(apiKey);
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        var channelId = data.items[0].id.channelId;
        var channelName = data.items[0].snippet.channelTitle;
        var channelLink = `https://www.youtube.com/channel/${channelId}`;
        var channelImage = data.items[0].snippet.thumbnails.medium.url;
        displayArtistChannel(channelName, channelId, channelImage);
        console.log(channelName, channelId, channelImage);
        loadArtistVideos(channelId);
      }
    })
    .catch((error) => {
      console.error("Error fetching channel:", error);
    });
}

// Function to load artist's videos from channel
function loadArtistVideos(channelId) {
  var apiKey = getRandomAPIKey();
  var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=100&key=${apiKey}`;
  console.log(apiKey);
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        displayArtistVideos(data.items);
      }
    })
    .catch((error) => {
      console.error("Error fetching videos:", error);
    });
}
// Function to toggle visibility of artistVideos div
function toggleArtistVideosDisplay() {
  var videosDiv = document.getElementById("artistVideos");
  videosDiv.style.display =
    videosDiv.style.display === "none" ? "block" : "none";
}

function displayArtistChannel(channelName, channelId, channelImage) {
  var artistChannel = document.getElementById("artistChannel");
  artistChannel.innerHTML = "";

  var channelElement = document.createElement("div");
  channelElement.innerHTML = `
        <img src="${channelImage}" alt="Channel Image" style="width: 75px; height: 75px;">
        <p>${channelName}</p>
        <button class="favoriteButton"><span class="material-symbols-outlined">
        favorite
        </span></button>
        <button class="play-shuffle-button"><span class="material-symbols-outlined">
        shuffle
        </span></button>
    `;

  artistChannel.appendChild(channelElement);

  var favoriteButton = artistChannel.querySelector(".favoriteButton");
  favoriteButton.addEventListener("click", function (event) {
    // Prevent the default behavior of the favorite button
    event.preventDefault();
    // Add the artist to favorites
    addFavoriteArtist(channelName, channelId, channelImage);
    // Stop the propagation of the click event
    event.stopPropagation();
  });

  var playShuffleButton = artistChannel.querySelector(".play-shuffle-button");
  playShuffleButton.addEventListener("click", function (event) {
    event.preventDefault();
    // Add the artist to favorites
    playArtistVideosShuffled(channelId);
    // Stop the propagation of the click event
    event.stopPropagation();

    // Play the artist's videos shuffled
  });

  // Toggle visibility of artistVideos div when artistChannel is clicked
  artistChannel.addEventListener("click", toggleArtistVideosDisplay);
}

function addFavoriteArtist(channelName, channelId, channelImage) {
  // Create a new div element for the favorite artist
  var favoriteArtistsDiv = document.getElementById("favoriteArtists");
  var artistDiv = document.createElement("div");
  artistDiv.className = "favorite-artist";

  // Create an image element for the channel image
  var channelImg = document.createElement("img");
  channelImg.src = channelImage;
  channelImg.alt = "Channel Image";
  // channelImg.style.width = "50px";Adjust image size if needed

  // Create a paragraph element for the channel name
  var channelParagraph = document.createElement("p");
  channelParagraph.textContent = channelName;
  // Determine the column for each song

  // Append image and name to the favorite artist div
  artistDiv.appendChild(channelImg);
  artistDiv.appendChild(channelParagraph);

  // Append the favorite artist div to the favorite artists container
  favoriteArtistsDiv.appendChild(artistDiv);

  // Store channel details (name and ID) in localStorage or any storage method you prefer
  // You can store it as an object, array, or any suitable format
  // For example, save it as an array of objects
  var favoriteArtists =
    JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.push({
      name: channelName,
      id: channelId
    });
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));
    

  // Add event listener to load the channel's videos when clicked
  artistDiv.addEventListener("click", function () {
    loadFavoriteArtistSongs(channelId);
  });
}

function playVideoFromId(videoId) {
  // Function to play a video using the YouTube Player API
  if (player) {
    player.loadVideoById(videoId);
    player.playVideo();
  }
}
function loadFavoriteArtistsOnLoad() {
  var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
  var favoriteArtistsDiv = document.getElementById("favoriteArtists");
  favoriteArtistsDiv.innerHTML = "";

  if (favoriteArtists.length === 0) {
    favoriteArtistsDiv.innerHTML = "<p>Search Your Favorite Artists To Add Them Here.</p>";
  } else {
    for (var i = 0; i < favoriteArtists.length; i++) {
      var artist = favoriteArtists[i];
      var artistDiv = document.createElement("div");
      artistDiv.className = "favorite-artist";

      // Fetch latest channel info
      fetchChannelDetailsAndDisplay(artist, artistDiv);

      favoriteArtistsDiv.appendChild(artistDiv);
    }
  }
}

function fetchChannelDetailsAndDisplay(artist, artistDiv) {
  var apiKey = getRandomAPIKey();
  var apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${artist.id}&key=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        var channelData = data.items[0].snippet;

        var channelImg = document.createElement("img");
        channelImg.src = channelData.thumbnails.medium.url; // Fresh image
        channelImg.alt = "Channel Image";

        var infoContainer = document.createElement("div");
        var channelParagraph = document.createElement("p");

        var channelWords = artist.name.split(" ");
        if (channelWords.length > 2) {
          artist.name = channelWords.slice(0, -2).join(" ");
        }
        if (artist.name.endsWith("VEVO")) {
          artist.name = artist.name.slice(0, -4).trim();
        }
        channelParagraph.textContent = artist.name;

        var playButton = document.createElement("button");
        playButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        playButton.className = "play-artist-videos";
        playButton.title = "Play All Videos";
        playButton.addEventListener("click", function () {
          playFavoriteArtistVideos(artist.id);
        });

        infoContainer.appendChild(channelParagraph);
        infoContainer.appendChild(playButton);

        channelImg.addEventListener("click", function () {
          loadFavoriteArtistSongs(artist.id, artist);
        });

        artistDiv.appendChild(channelImg);
        artistDiv.appendChild(infoContainer);
      }
    })
    .catch(error => {
      console.error("Error fetching channel details:", error);
    });
}


function loadFavoriteArtistSongs(channelId, artist) {
  var apiKey = getRandomAPIKey(); // Replace with your YouTube API key
  var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;
  var allVideos = []; // Array to hold all videos
  fetchAllVideos(apiUrl, allVideos, artist);
}

function fetchAllVideos(apiUrl, allVideos, artist) {
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        allVideos = allVideos.concat(data.items); // Append the videos to the array
      }

      // Check if there's another page of videos (pagination)
      if (data.nextPageToken) {
        // If there's a nextPageToken, fetch the next set of videos
        var nextApiUrl = `${apiUrl}&pageToken=${data.nextPageToken}`;
        fetchAllVideos(nextApiUrl, allVideos, artist);
      } else {
        // No more pages, display all videos
        displayFavoriteArtistSongs(allVideos, artist);
      }
    })
    .catch((error) => {
      console.error("Error fetching videos:", error);
    });
}

function displayFavoriteArtistSongs(items, artist) {
  // Toggle the visibility of the yourplaylist
  isPlaylistContainerVisible = false;
  togglePlaylistContainerVisibility();

  // Toggle the visibility of the favoriteArtistsContainer
  isFavoriteArtistsContainerVisible = false;
  toggleFavoriteArtistsContainerVisibility();

  var favoriteArtistSongsDiv = document.getElementById("favoriteArtistSongs");
  favoriteArtistSongsDiv.innerHTML =
    '<div class="cut"><button onclick="clearfavsong()"><span class="material-symbols-outlined">keyboard_backspace</span></button><span>Back</span>';

  // Create a container to hold the clicked favorite-artist item
  var clickedArtistContainer = document.createElement("div");
  clickedArtistContainer.className = "favorite-artist2";

  var channelImg = document.createElement("img");
  channelImg.src = artist.image;
  channelImg.alt = "Channel Image";

  // Create a new div to hold the paragraph and play button
  var infoContainer = document.createElement("div");

  var channelParagraph = document.createElement("p");
  channelParagraph.textContent = artist.name;

  // Remove Button
  var removeButton = document.createElement("button");
  removeButton.innerHTML =
    '<span class="material-symbols-outlined">cancel</span>';
  removeButton.className = "remove-btn";

  // Add click event to remove the artist when clicked
  removeButton.addEventListener("click", function () {
    removeFavoriteArtist(artist.id);
  });

  var playButton = document.createElement("button");
  playButton.innerHTML =
    '<span class="material-symbols-outlined">play_arrow</span>';
  playButton.className = "play-artist-videos";
  playButton.title = "Play All Videos";
  playButton.addEventListener("click", function () {
    playFavoriteArtistVideos(artist.id);
  });
  // Append the paragraph and play button to the new div
  infoContainer.appendChild(channelParagraph);
  infoContainer.appendChild(removeButton);
  infoContainer.appendChild(playButton);

  // Append the image and the new div to the main container
  clickedArtistContainer.appendChild(channelImg);
  clickedArtistContainer.appendChild(infoContainer);

  // Append the clicked favorite-artist item to the favoriteArtistSongsDiv
  favoriteArtistSongsDiv.appendChild(clickedArtistContainer);

  // Continue with displaying videos as before
  for (var i = 0; i < items.length; i++) {
    var video = items[i];
    var videoId = video.id.videoId;
    var videoTitle = video.snippet.title;

    var videoDiv = document.createElement("div");
    videoDiv.className = "favorite-artist-song";

    var titleElement = document.createElement("p");
    titleElement.textContent = videoTitle;

    var videoThumbnail = document.createElement("img");
    videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    videoThumbnail.alt = "Video Thumbnail";

    videoDiv.appendChild(videoThumbnail);
    videoDiv.appendChild(titleElement);

    // Add click event to play the video when clicked
    videoDiv.addEventListener(
      "click",
      (function (vId) {
        return function () {
          playVideoFromId(vId);
        };
      })(videoId)
    );

    favoriteArtistSongsDiv.appendChild(videoDiv);
  }

  // Show the favorite artist's videos container
  favoriteArtistSongsDiv.style.display = "block";
}

loadFavoriteArtistsOnLoad();

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function displayArtistVideos(videos) {
  var artistVideos = document.getElementById("artistVideos");
  artistVideos.innerHTML = "<h1>ARTIST SONGS</h1>";

  videos.forEach((video) => {
    var videoTitle = video.snippet.title;
    var videoThumbnail = video.snippet.thumbnails.medium.url;

    var videoElement = document.createElement("div");
    videoElement.innerHTML = `<img src="${videoThumbnail}" alt="${videoTitle}"><p class="artistVideoTitle">${videoTitle}</p>`;

    videoElement.addEventListener("click", function () {
      playVideoOnPlayer(video.id.videoId);
    });

    artistVideos.appendChild(videoElement);
  });
}
// Function to play video on YouTube player
function playVideoOnPlayer(videoId) {
  if (player) {
    player.loadVideoById(videoId);
    player.playVideo();
  }
}

function playArtistVideosShuffled(channelId) {
  repeatMode = "no-repeat";
  var apiKey = getRandomAPIKey();
  var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        var videos = data.items;
        shuffleArray(videos);
        playShuffledVideos(videos);
      }
    })
    .catch((error) => {
      console.error("Error fetching videos:", error);
    });
}

function playShuffledVideos(videoIds) {
  var currentIndex = 0;

  function playNextVideo() {
    if (currentIndex < videoIds.length) {
      playVideoFromId(videoIds[currentIndex]);
      currentIndex++;
    } else {
      currentIndex = 0; // Reset index for looping if needed
    }
  }

  // Continue to next video when the current one ends
  player.addEventListener("onStateChange", function (event) {
    if (event.data === YT.PlayerState.ENDED) {
      playNextVideo();
    }
  });

  // Start playing the first video
  playNextVideo();
}

function playFavoriteArtistVideos(artistId) {
  repeatMode = "no-repeat";
  var favoriteArtists =
    JSON.parse(localStorage.getItem("favoriteArtists")) || [];
  var artist = favoriteArtists.find((artist) => artist.id === artistId);

  if (artist) {
    var apiKey = getRandomAPIKey();
    var videoIds = [];
    var pageToken = ""; // Initialize pageToken to an empty string

    // Function to fetch all videos iteratively
    function fetchAllVideos() {
      var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${artistId}&type=video&maxResults=50&key=${apiKey}&pageToken=${pageToken}`;

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.items && data.items.length > 0) {
            // Collect video IDs from the current page
            var currentVideoIds = data.items.map((video) => video.id.videoId);
            videoIds = videoIds.concat(currentVideoIds);

            // Check if there is a nextPageToken for more results
            if (data.nextPageToken) {
              pageToken = data.nextPageToken;
              fetchAllVideos(); // Fetch the next set of videos
            } else {
              // All pages fetched, shuffle and play videos
              shuffleArray(videoIds);
              playShuffledVideos(videoIds);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
        });
    }

    // Start fetching videos
    fetchAllVideos();
  }
}

function playVideosSequentially(videoIds) {
  var currentVideoIndex = 0;

  function playNextVideo() {
    if (currentVideoIndex < videoIds.length) {
      playVideoFromId(videoIds[currentVideoIndex]);
      currentVideoIndex++;
    }
  }

  playNextVideo(); // Play the first video

  player.addEventListener("onStateChange", function (event) {
    if (event.data === YT.PlayerState.ENDED) {
      playNextVideo(); // Play the next video when the current one ends
    }
  });
}

function removeFavoriteArtist(artistId) {
  // Retrieve the list of favorite artists from local storage
  var favoriteArtists =
    JSON.parse(localStorage.getItem("favoriteArtists")) || [];

  // Find the index of the artist to remove
  var indexToRemove = favoriteArtists.findIndex(function (artist) {
    return artist.id === artistId;
  });

  // If the artist is found, remove it from the list
  if (indexToRemove !== -1) {
    favoriteArtists.splice(indexToRemove, 1);

    // Update the local storage with the modified list
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));

    // Optionally, you can also update the UI to reflect the removal
    loadFavoriteArtistsOnLoad(); // Reload the favorite artists after removal
  }
  clearfavsong();
}

function clearArtistSearchResults() {
  document.getElementById("artistChannel").innerHTML = "";
  document.getElementById("artistVideos").innerHTML = "";
  document.getElementById("artistSearchInput").value = "";
}
function clearfavsong() {
  document.getElementById("favoriteArtistSongs").innerHTML = "";
  isPlaylistContainerVisible = true;
  togglePlaylistContainerVisibility();
  // Restore the visibility of the favoriteArtistsContainer
  isFavoriteArtistsContainerVisible = true;
  toggleFavoriteArtistsContainerVisibility();
  // Simulate the back gesture
  simulateBackGesture();
}

// You can call simulateBackGesture() when the back gesture is detected, e.g., on swipe or button press
// For example, you can call it in your clearfavsong() function
