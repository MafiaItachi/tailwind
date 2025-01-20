//home page quick pick songs
function loadhomeSongs() {
  var homeSongLists = document.querySelectorAll(".home-song-list.column");
  var homePlaylistId = getRendomPlaylist1();
  var apiKey = getRandomAPIKey();
  // Fetch the playlist items using the YouTube Data API
  var playlistItemsUrl =
    "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=" +
    homePlaylistId +
    "&key=" +
    apiKey;

  $.getJSON(playlistItemsUrl, function (response) {
    var items = response.items;

    items.forEach(function (item, index) {
      var video = item.snippet;
      var videoId = video.resourceId.videoId;
      var videoTitle = video.title;
      var truncatedTitle = truncateTitle(videoTitle);

      var videoThumbnailUrl = video.thumbnails.medium.url;

      // Determine the column for each song
      var column = homeSongLists[index % 3];

      // Create a list item for each home song with the video thumbnail
      var listItem = document.createElement("li");
      listItem.innerHTML = `
        <img src="${videoThumbnailUrl}" alt="${videoTitle} Thumbnail">
        <div class="song-title">${truncatedTitle}</div>
    `;

      // Add a click event listener to play the video
      listItem.addEventListener("click", function () {
        playVideo(videoId);
      });

      column.appendChild(listItem);
    });
  });
}

// Call the function to load home songs
loadhomeSongs();

//search page new releases

async function fetchNewReleases() {
  try {
    const apiKey = getRandomAPIKey();
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&maxResults=5&videoCategoryId=10&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch new releases");
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
}

function displayQuickPick(playlistItems) {
  console.log("working");
  var quickPickSection = document.getElementById("quick-pick-section");
  quickPickSection.innerHTML = " <h2>ggg</h2>";

  for (var i = 0; i < playlistItems.length; i++) {
    var video = playlistItems[i].snippet;
    var videoId = video.resourceId.videoId;
    var videoTitle = video.title;
    var truncatedTitle = truncateTitle(videoTitle);
    var thumbnailUrl = video.thumbnails.medium.url;

    var div = document.createElement("div");
    div.className = "song-list-item";

    var thumbnailImg = document.createElement("img");
    thumbnailImg.src = thumbnailUrl;
    div.setAttribute(
      "onclick",
      "playVideo('" +
        videoId +
        "', '" +
        videoTitle +
        "', '" +
        thumbnailUrl +
        "')"
    );

    var title = document.createElement("p");
    title.className = "song-title";
    title.textContent = truncatedTitle;

    div.appendChild(thumbnailImg);
    div.appendChild(title);

    quickPickSection.appendChild(div);
  }
}
//playlist search
function fetchAndDisplayPlaylist() {
  var playlistId = getRendomPlaylist2();
  var apiKey = getRandomAPIKey(); // Replace with your actual YouTube API key

  var playlistUrl =
    "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" +
    playlistId +
    "&key=" +
    apiKey;

  $.ajax({
    url: playlistUrl,
    success: function (response) {
      displayQuickPick(response.items);
    },
    error: function (xhr) {
      console.log(xhr);
    },
  });
}

function displayQuickPick(playlistItems) {
  var quickPickSection = document.getElementById("quick-pick-section");
  quickPickSection.innerHTML = " <h1 class='h2'>NEW RELEASES</h1>";

  for (var i = 0; i < playlistItems.length; i++) {
    var video = playlistItems[i].snippet;
    var videoId = video.resourceId.videoId;
    var videoTitle = truncateTitle(video.title); //truncateTitle(video.title);
    var thumbnailUrl = video.thumbnails.medium.url;

    var div = document.createElement("div");
    div.className = "song-list-item";

    var thumbnailImg = document.createElement("img");
    thumbnailImg.src = thumbnailUrl;
    div.setAttribute(
      "onclick",
      "playVideo('" +
        videoId +
        "', '" +
        videoTitle +
        "', '" +
        thumbnailUrl +
        "')"
    );

    var title = document.createElement("p");
    title.className = "song-title";
    title.textContent = videoTitle;

    div.appendChild(thumbnailImg);
    div.appendChild(title);

    quickPickSection.appendChild(div);
  }
}

fetchAndDisplayPlaylist();
