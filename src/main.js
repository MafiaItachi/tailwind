// Define the repeat mode (default is "off")
let repeatMode = "off";

// Function to toggle repeat mode
function toggleRepeatMode() {
  if (repeatMode === "off") {
    // Switch to Repeat One mode
    repeatMode = "repeat-one";
  } else {
    // Switch back to Repeat Off mode
    repeatMode = "off";
  }

  // Update the UI to reflect the current repeat mode
  updateRepeatModeButton();
}

// Function to update the repeat button's appearance
function updateRepeatModeButton() {
  const repeatButton = document.getElementById("repeat-button"); // Replace with your button's ID
  if (repeatMode === "repeat-one") {
    repeatButton.innerHTML =
      '<span class="material-symbols-outlined">repeat_one</span>';
    repeatButton.setAttribute("title", "Repeat One");
  } else {
    repeatButton.innerHTML =
      '<span class="material-symbols-outlined">repeat</span>';
    repeatButton.setAttribute("title", "Repeat Off");
  }
}

// Update the button UI on page load
updateRepeatModeButton();

// Load the YouTube IFrame Player API asynchronously
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

displayPlaylist();
const fullscreenButton = document.getElementById("fullscreen-button");
const greenDiv = document.getElementById("green-div");

var player;
var isPlaying = false;
var progressInterval;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: "", // Set the initial video ID here
    playerVars: {
      controls: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError, // Handle errors
    },
    playerVars: {
      origin: "https://yourwebsite.com",
    },
  });
}

function onPlayerReady(event) {
  // Player is ready to receive commands
  $("#play-pause").click(togglePlayPause);
  $("#play-pause2").click(togglePlayPause);
  $("#seek-bar").click(seek);
  console.log("YouTube Player is ready.");
}

function updateProgressBar() {
  var currentTime = player.getCurrentTime();
  var duration = player.getDuration();
  var progress = (currentTime / duration) * 100;

  $("#progress-bar").css("width", progress + "%");
  $(".progress-bar2").css("width", progress + "%");
}

// Function to play the next track

function togglePlayPause() {
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function updatePlayPauseButton() {
  var button = $("#play-pause");

  button.html(
    isPlaying
      ? '<span class="material-symbols-outlined">pause</span>'
      : '<span class="material-symbols-outlined">play_arrow</span>'
  );
}
function updatePlayPauseButton2() {
  var button = $("#play-pause2");

  button.html(
    isPlaying
      ? '<span class="material-symbols-outlined">pause</span>'
      : '<span class="material-symbols-outlined">play_arrow</span>'
  );
}

function startProgressInterval() {
  progressInterval = setInterval(updateProgressBar, 1000);
}

function stopProgressInterval() {
  clearInterval(progressInterval);
}
function downloadCurrentSong() {
  if (player) {
    var videoId = player.getVideoData().video_id;
    if (videoId) {
      var youtDownloadLink = "https://v3.mp3youtube.cc/download/" + videoId;
      console.log(youtDownloadLink);
      // Create an anchor element to trigger the download
      var downloadLink = document.createElement("a");
      downloadLink.href = youtDownloadLink;
      downloadLink.target = "_blank"; // Open in a new tab
      downloadLink.click();
    } else {
      console.error("No video is currently playing.");
    }
  } else {
    console.error("Player not initialized.");
  }
}

function seek(event) {
  var seekBar = $("#seek-bar");
  var offsetX = event.pageX - seekBar.offset().left;
  var barWidth = seekBar.outerWidth();
  var seekTime = (offsetX / barWidth) * player.getDuration();

  player.seekTo(seekTime, true);
}

var addTopic = true; // Initial state: Adding " - Topics" to the search query
// Function to toggle the addTopic state and update the button text
function toggleTopic() {
  addTopic = !addTopic; // Toggle the state
  toggleButtonText(); // Change the button text
  search(); // Perform a search after toggling
}

function search() {
  document.getElementById("suggestionsBox").innerHTML = "";
  var query = document.getElementById("searchInput").value;
  if (addTopic) {
    query += " - Topics"; // Append " - Topic" if addTopic is true
  }
  console.log(query);
  var apiKey = getRandomAPIKey();
  console.log(apiKey);
  var url =
    "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +
    query +
    "&type=video&videoCategoryId=10&maxResults=10&key="+
    apiKey;

  $.ajax({
    url: url,
    success: function (response) {
      displayResults(response);
      showToggleButton(); // Show the toggle button after search
    },
    error: function (xhr) {
      console.log(xhr);
    },
  });
  document.getElementById("genre-songs").innerHTML = "";
}
// CLEAR SEARCH RESULTS IN SEARCH BOX
function clearSearchResults() {
  var artistVideosDiv = document.getElementById("artistVideos");
  document.getElementById("suggestionsBox").innerHTML = "";
  artistVideosDiv.innerHTML = "";
  artistVideosDiv.style.display = "none";
  var results = document.getElementById("results");
  results.innerHTML = "";

  document.getElementById("searchInput").value = "";

  hideToggleButton(); // Hide the toggle button after clearing search results
  document.getElementById("artistChannel").innerHTML = "";
  document.getElementById("artistVideos").innerHTML = "";
  document.getElementById("genre-songs").innerHTML = "";
}

function hideToggleButton() {
  var toggleButton = document.getElementById("searchinfo");
  toggleButton.style.display = "none";
}

function showToggleButton() {
  var toggleButton = document.getElementById("searchinfo");
  toggleButton.style.display = "inline-block"; // Display the toggle button
}

function addToPlaylist(videoId, videoTitle) {
  var playlist = localStorage.getItem("playlist");
  playlistItems = playlist ? JSON.parse(playlist) : [];

  playlistItems.push({
    videoId: videoId,
    videoTitle: videoTitle,
  });

  localStorage.setItem("playlist", JSON.stringify(playlistItems));

  displayPlaylist();
}

//queue list
// Variables to remember the current context
let currentKey = null; // "flatPlaylist" or "playlists"
let currentPlaylistName = null; // Playlist name like "DD" or "new"

function playNextVideo() {
  if (!currentKey || !currentPlaylistName) {
    playShuffledPlaylist();
    console.log(
      "No current playlist context. Please start playing a video first."
    );
    return;
  }

  const storedPlaylists = localStorage.getItem("playlists");
  const storedPlaylist = localStorage.getItem("playlist");
  const savedPlaylists = localStorage.getItem("savedPlaylists");

  let playlists = {};
  let flatPlaylist = [];
  let saved = {};

  if (storedPlaylists) {
    try {
      playlists = JSON.parse(storedPlaylists);
    } catch (e) {
      console.error("Failed to parse 'playlists' from localStorage:", e);
      return;
    }
  }

  if (storedPlaylist) {
    try {
      flatPlaylist = JSON.parse(storedPlaylist);
    } catch (e) {
      console.error("Failed to parse 'playlist' from localStorage:", e);
      return;
    }
  }

  if (savedPlaylists) {
    try {
      saved = JSON.parse(savedPlaylists);
    } catch (e) {
      console.error("Failed to parse 'savedPlaylists' from localStorage:", e);
      return;
    }
  }

  const currentPlaylist =
    currentKey === "playlists"
      ? playlists[currentPlaylistName]
      : currentKey === "flatPlaylist"
      ? flatPlaylist
      : currentKey === "savedPlaylists"
      ? saved[currentPlaylistName]
      : null;

  if (!currentPlaylist || currentPlaylist.length === 0) {
    console.error("Current playlist is empty or not found.");
    return;
  }

  const currentVideoId = player.getVideoData().video_id;
  const currentIndex = currentPlaylist.findIndex(
    (item) => item.id === currentVideoId || item.videoId === currentVideoId
  );

  if (currentIndex === -1) {
    console.error("Current video not found in the current playlist.");
    return;
  }

  let nextIndex = currentIndex + 1;

  if (nextIndex >= currentPlaylist.length) {
    console.log(
      "Reached the end of the current playlist. Restarting from the beginning."
    );
    nextIndex = 0;
  }

  const nextVideo = currentPlaylist[nextIndex];
  console.log("Next Video:", nextVideo);

  if (nextVideo) {
    const videoId = nextVideo.id || nextVideo.videoId;
    const videoTitle = nextVideo.title || nextVideo.videoTitle;

    player.loadVideoById(videoId);
    player.playVideo();
    console.log(`Playing next video: ${videoTitle}`);
  } else {
    console.error("Next video is not available.");
  }
}

function playPreviousTrack() {
  if (!currentKey || !currentPlaylistName) {
    console.error(
      "No current playlist context. Please start playing a video first."
    );
    return;
  }

  const storedPlaylists = localStorage.getItem("playlists");
  const storedPlaylist = localStorage.getItem("playlist");
  const savedPlaylists = localStorage.getItem("savedPlaylists");

  let playlists = {};
  let flatPlaylist = [];
  let saved = {};

  // Parse playlists
  if (storedPlaylists) {
    try {
      playlists = JSON.parse(storedPlaylists);
    } catch (e) {
      console.error("Failed to parse 'playlists' from localStorage:", e);
      return;
    }
  }

  // Parse flatPlaylist
  if (storedPlaylist) {
    try {
      flatPlaylist = JSON.parse(storedPlaylist);
    } catch (e) {
      console.error("Failed to parse 'playlist' from localStorage:", e);
      return;
    }
  }

  // Parse savedPlaylists
  if (savedPlaylists) {
    try {
      saved = JSON.parse(savedPlaylists);
    } catch (e) {
      console.error("Failed to parse 'savedPlaylists' from localStorage:", e);
      return;
    }
  }

  // Determine the current playlist based on context
  const currentPlaylist =
    currentKey === "playlists"
      ? playlists[currentPlaylistName]
      : currentKey === "flatPlaylist"
      ? flatPlaylist
      : currentKey === "savedPlaylists"
      ? saved[currentPlaylistName]
      : null;

  if (!currentPlaylist || currentPlaylist.length === 0) {
    console.error("Current playlist is empty or not found.");
    return;
  }

  // Get the current video ID and index
  const currentVideoId = player.getVideoData().video_id;
  const currentIndex = currentPlaylist.findIndex(
    (item) => item.id === currentVideoId || item.videoId === currentVideoId
  );

  if (currentIndex === -1) {
    console.error("Current video not found in the current playlist.");
    return;
  }

  // Determine the previous index
  let previousIndex = currentIndex - 1;

  // Loop back to the last video if at the beginning
  if (previousIndex < 0) {
    console.log(
      "Reached the beginning of the current playlist. Looping to the last video."
    );
    previousIndex = currentPlaylist.length - 1;
  }

  // Get the previous video
  const previousVideo = currentPlaylist[previousIndex];
  console.log("Previous Video:", previousVideo);

  if (previousVideo) {
    const videoId = previousVideo.id || previousVideo.videoId;
    const videoTitle = previousVideo.title || previousVideo.videoTitle;

    // Play the previous video
    player.loadVideoById(videoId);
    player.playVideo();
    console.log(`Playing previous video: ${videoTitle}`);
  } else {
    console.error("Previous video is not available.");
  }
}

// Function to set the current context when a video starts playing
function setCurrentContext(key, playlistName) {
  currentKey = key;
  currentPlaylistName = playlistName;
  console.log(`Context set: key=${key}, playlistName=${playlistName}`);
}
function onVideoStart(videoId) {
  const storedPlaylists = localStorage.getItem("playlists");
  const storedPlaylist = localStorage.getItem("playlist");
  const savedPlaylists = localStorage.getItem("savedPlaylists");

  let playlists = {};
  let flatPlaylist = [];
  let saved = {};

  if (storedPlaylists) {
    playlists = JSON.parse(storedPlaylists);
  }

  if (storedPlaylist) {
    flatPlaylist = JSON.parse(storedPlaylist);
  }

  if (savedPlaylists) {
    saved = JSON.parse(savedPlaylists);
  }

  for (const key in playlists) {
    if (playlists[key].some((item) => item.id === videoId)) {
      setCurrentContext("playlists", key);
      return;
    }
  }

  for (const key in saved) {
    if (saved[key].some((item) => item.id === videoId)) {
      setCurrentContext("savedPlaylists", key);
      return;
    }
  }

  if (flatPlaylist.some((item) => item.videoId === videoId)) {
    setCurrentContext("flatPlaylist", "flatPlaylist");
  }
}

function setCurrentPlaylistContext(
  videoId,
  sourceFunction,
  playlistName = null
) {
  if (sourceFunction === "playShuffledPlaylist" && playlistName) {
    currentKey = playlistName === "flatPlaylist" ? "flatPlaylist" : "playlists";
    currentPlaylistName = playlistName;
    console.log(
      `Context set: key="${currentKey}", playlistName="${playlistName}"`
    );
    return;
  }

  if (sourceFunction === "displayPlaylist") {
    currentKey = "flatPlaylist";
    currentPlaylistName = "flatPlaylist";
    console.log(`Context set: key="flatPlaylist", playlistName="flatPlaylist"`);
    return;
  }

  if (sourceFunction === "revealSongsList" && playlistName) {
    currentKey = "playlists";
    currentPlaylistName = playlistName;
    console.log(`Context set: key="playlists", playlistName="${playlistName}"`);
    return;
  }

  if (sourceFunction === "savedPlaylists" && playlistName) {
    currentKey = "savedPlaylists";
    currentPlaylistName = playlistName;
    console.log(
      `Context set: key="savedPlaylists", playlistName="${playlistName}"`
    );
    return;
  }

  console.error(
    "Unable to set context: Invalid sourceFunction or playlistName."
  );
}

function initializePlayerWithVideo(videoId) {
  player.loadVideoById(videoId);
  setCurrentPlaylistContext(videoId);
}
// search results
function displayResults(response) {
  var results = document.getElementById("results");
  results.innerHTML = "";

  for (var i = 0; i < response.items.length; i++) {
    var video = response.items[i];
    var videoId = video.id.videoId;
    var videoTitle = truncateTitle(video.snippet.title); // Apply truncateTitle
    var thumbnailUrl = video.snippet.thumbnails.medium.url;

    // Create a result-item container
    var div = document.createElement("div");
    div.className = "result-item";
    div.addEventListener(
      "click",
      (function (id) {
        return function () {
          playVideo(id); // Play video on clicking the entire container
        };
      })(videoId)
    );

    // Create and append the thumbnail
    var thumbnailImg = document.createElement("img");
    thumbnailImg.src = thumbnailUrl;
    thumbnailImg.className = "thumbnail";

    // Create and append the details section
    var detailsDiv = document.createElement("div");
    detailsDiv.className = "result-details";

    var title = document.createElement("p");
    title.className = "result-title";
    title.textContent = videoTitle; // Use the truncated title

    detailsDiv.appendChild(title);
    div.appendChild(thumbnailImg);
    div.appendChild(detailsDiv);

    results.appendChild(div);
  }
}

// function for trim title
function truncateTitle(title) {
  // Trim content within parentheses, curly braces, square brackets, and Japanese brackets
  title = title
    .replace(/\([^)]*\)|\{[^}]*\}|\[[^\]]*\]|【[^】]*】|「[^」]*」/g, "")
    .trim();
  title = title.replace(/\sft\.\s.*(?=\s-\s)/, "").trim();
  title = title.replace(/\sFeat\.\s.*(?=\s-\s)/, "").trim();
  // Split the title into words
  var words = title.split(" ");

  // If the title has more than 10 words, truncate it
  if (words.length > 10) {
    title = words.slice(0, 10).join(" ") + "...";
  }

  return title;
}

function displayPlaylist() {
  const playlistDiv = document.getElementById("playlist");
  playlistDiv.innerHTML = "";

  const storedPlaylist = localStorage.getItem("playlist");
  if (storedPlaylist) {
    const playlistItems = JSON.parse(storedPlaylist);

    playlistItems.forEach((item, index) => {
      const playlistItem = document.createElement("div");
      playlistItem.className = "playlist-item";

      // Add thumbnail
      const thumbnail = document.createElement("img");
      thumbnail.src = `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`;
      playlistItem.appendChild(thumbnail);

      // Add video title
      const truncatedTitle = truncateTitle(item.videoTitle);
      const videoTitleDiv = document.createElement("div");
      videoTitleDiv.className = "bvideo-title";
      videoTitleDiv.textContent = truncatedTitle;
      playlistItem.appendChild(videoTitleDiv);

      // Play video when clicking on playlist item
      playlistItem.addEventListener("click", () => {
        isShuffleActive = false; // Stop shuffle playback
        currentVideoIndex = index; // Update current video index
        playVideo(item.videoId); // Play the selected video

        // Set context for flatPlaylist
        setCurrentPlaylistContext(item.videoId, "displayPlaylist");
      });

      // Add controls (More Options Button and Dropdown)
      const listItem = document.createElement("p");
      const moreButton = document.createElement("button");
      const moreDropdown = document.createElement("div");
      moreButton.innerHTML =
        '<span class="material-symbols-outlined">more_vert</span>';
      moreButton.className = "more-button";
      moreButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Stop event propagation to prevent triggering playlistItem click
        toggleDropdown(index); // Open/close the dropdown menu
      });

      moreDropdown.className = "more-dropdown";

      // Add Remove Option
      const removeOption = document.createElement("a");
      removeOption.innerHTML =
        '<span class="material-symbols-outlined">cancel</span>';
      removeOption.href = "#";
      removeOption.addEventListener(
        "click",
        (function (index) {
          return function (event) {
            event.stopPropagation(); // Prevent parent click event
            removeFromPlaylist(index); // Remove the selected video from the playlist
          };
        })(index)
      ); // Pass the index correctly using a closure

      // Add Download Option
      const downloadOption = document.createElement("a");
      downloadOption.innerHTML =
        '<span class="material-symbols-outlined">download</span>';
      downloadOption.href = `https://v3.mp3youtube.cc/download/${item.videoId}`;
      downloadOption.setAttribute("target", "_blank");
      downloadOption.setAttribute("rel", "noopener noreferrer");
      downloadOption.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent parent click event
      });

      // Append options to dropdown
      moreDropdown.appendChild(removeOption);
      moreDropdown.appendChild(downloadOption);

      // Append controls to list item
      listItem.appendChild(moreDropdown);
      listItem.appendChild(moreButton);

      // Append controls to playlist item
      playlistItem.appendChild(listItem);

      // Append playlist item to playlist div
      playlistDiv.appendChild(playlistItem);
    });
  } else {
    playlistDiv.innerHTML = `
            <li>LIKED SONGS WILL APPEAR HERE</li>
            <li>SWIPE UP THE MINI PLAYER TO SEE VIDEO</li>
            <li>LOGIN TO GOOGLE ACCOUNT TO IMPORT YOUTUBE PLAYLIST</li>
            <li>BOOKMARK SONGS WILL APPEAR HERE</li>
            <li>ENTER YOUTUBE LINK TO ADD SONG HERE</li>
        `;
  }
}

//toggle dropdown for  playlist(urplist.js)
function toggleDropdown(index) {
  const dropdowns = document.querySelectorAll(".more-dropdown");
  dropdowns.forEach((dropdown, i) => {
    if (i === index) {
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    } else {
      dropdown.style.display = "none";
    }
  });
}

function removeFromPlaylist(index) {
  // Retrieve the playlist from localStorage
  const storedPlaylist = localStorage.getItem("playlist");
  if (!storedPlaylist) {
    console.error("Playlist not found in localStorage.");
    return;
  }

  // Parse the playlist
  const playlistItems = JSON.parse(storedPlaylist);

  // Validate the index
  if (index >= 0 && index < playlistItems.length) {
    // Remove the video at the specified index
    playlistItems.splice(index, 1);

    // Save the updated playlist back to localStorage
    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    // Refresh the displayed playlist
    displayPlaylist();

    console.log("Updated playlist:", playlistItems);
  } else {
    console.error("Invalid index for removal.");
  }
}

// Function to clear the playlist
function clearPlaylist() {
  localStorage.removeItem("playlist");
  playlistItems = [];
  displayPlaylist();
  currentVideoIndex = 0;
  if (player) {
    player.stopVideo();
  }
}

//backup and restore local storage
function backupLocalStorage() {
  const localStorageData = JSON.stringify(localStorage);
  const blob = new Blob([localStorageData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Get current date and month
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0"); // Ensure 2 digits
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based

  // Create file name with current day and month
  const fileName = `photon_backup_${day}_${month}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to restore local storage from a backup file
function restoreLocalStorage() {
  document.getElementById("fileInput").click();
}

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;
      const localStorageData = JSON.parse(contents);
      for (const key in localStorageData) {
        if (localStorageData.hasOwnProperty(key)) {
          localStorage.setItem(key, localStorageData[key]);
        }
      }
      showAlert("Local Storage has been restored!");
    };
    reader.readAsText(file);
  });

//touch function only for playprevious and endcurrentsong
var controlsElement = document.getElementById("controls");
var startX, startY;

controlsElement.addEventListener("touchstart", function (e) {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

controlsElement.addEventListener("touchmove", function (e) {
  // Check if the touchmove event is within a specific scrollable element
  var isScrollable = e.target.closest("#lyrics-container");

  // Prevent the default scroll behavior only if not within the scrollable element
  if (!isScrollable) {
    e.preventDefault();
  }
});

controlsElement.addEventListener("touchend", function (e) {
  var endX = e.changedTouches[0].clientX;
  var endY = e.changedTouches[0].clientY;

  var deltaX = endX - startX;
  var deltaY = endY - startY;

  // Set a threshold for swipe detection
  var threshold = 100;

  if (Math.abs(deltaX) > threshold) {
    if (deltaX < 0) {
      endCurrentSong();
    } else {
      playPreviousTrack();
    }
  } else if (Math.abs(deltaY) > threshold) {
    if (deltaY < 0) {
      showMiniPlayer();
      simulateBackGesture();
    }
  }
});

// Initialize Hammer.js on the controls element
//for swipe up and down
var controlsHammer = new Hammer(controlsElement);

// Detect swipe up and swipe down gestures
controlsHammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
controlsHammer.on("swipedown", function (event) {
  event.preventDefault();
});

controlsHammer.on("swipedown", function () {
});

// Function to show the mini player
function showMiniPlayer() {
  var miniPlayer = document.getElementById("mini-player");
  miniPlayer.style.transform = "translateY(0)";
}

// Function to hide the mini player
function hideMiniPlayer() {
  var miniPlayer = document.getElementById("mini-player");
  miniPlayer.style.transform = "translateY(100%)";
}
//like button
function addToPlaylistFromVideo() {
  // Get the currently playing video's videoId
  var videoId = player.getVideoData().video_id;

  // Get the video title
  var videoTitle = player.getVideoData().title;

  // Get the existing playlist from local storage
  var storedPlaylist = localStorage.getItem("playlist");
  var playlistItems = storedPlaylist ? JSON.parse(storedPlaylist) : [];

  // Add the new video to the playlist
  playlistItems.push({
    videoId: videoId,
    videoTitle: videoTitle,
  });

  // Update the playlist in local storage
  localStorage.setItem("playlist", JSON.stringify(playlistItems));

  // Display the updated playlist
  displayPlaylist();
}

function extractPlaylistId(playlistLink) {
  var regex = /[&?](?:list|p)=([a-zA-Z0-9_-]{34})/;
  var match = playlistLink.match(regex);

  if (match && match.length > 1) {
    return match[1];
  }

  return null;
}

function playVideo(videoId, playlistKey = null, playlistName = null) {
  if (player) {
    player.loadVideoById(videoId);
    player.playVideo();
    console.log(`Playing video ID: ${videoId}`);

    // Fetch video title using YouTube API
    var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    $.ajax({
      url: url,
      success: function (response) {
        var videoTitle = response.items[0].snippet.title;
        updateMiniPlayer(videoId, videoTitle);
      },
      error: function (xhr) {
        console.log(xhr);
      },
    });
    currentPlaylistKey = playlistKey;
    currentPlaylistName = playlistName;
    console.log(
      `Current Playlist Context: Key=${currentPlaylistKey}, Name=${currentPlaylistName}`
    );
  } else {
    console.error("Player is not initialized.");
  }
}
// Handle the state change event
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    startProgressInterval();

    // Get the video title and videoId
    var videoTitle = player.getVideoData().title;
    var videoId = player.getVideoData().video_id;

    // Update the video title and thumbnail in your controls
    updateVideoTitleAndThumbnail(videoTitle, videoId);
    updateVideoTitle2();
    const currentVideoId = player.getVideoData().video_id;
    console.log("Video started playing:", currentVideoId);

    // Set the current playlist context
    setCurrentPlaylistContext(currentVideoId);
  } else {
    isPlaying = false;
    stopProgressInterval();
  }

  if (event.data === YT.PlayerState.ENDED) {
    if (repeatMode === "repeat-one") {
      // Replay the current video when Repeat One is active
      player.seekTo(0); // Restart video from the beginning
      player.playVideo();
    } else {
      playNextVideo(); // Automatically play the next video
    }
  }

  updatePlayPauseButton();
  updatePlayPauseButton2();
}

// Handle errors
function onPlayerError(event) {
  console.log("An error occurred: ", event.data);

  // Only skip to the next video if there is a specific error
  if (
    event.data === 2 ||
    event.data === 100 ||
    event.data === 101 ||
    event.data === 150
  ) {
    console.log(
      "Video unavailable. Waiting 2 seconds before skipping to the next video..."
    );
    setTimeout(function () {
      playNextVideo(); // Automatically play the next video if the current video is unavailable
    }, 2000); // Wait for 2 seconds
  }
}

//mini player
function updateVideoTitleAndThumbnail(title, videoId) {
  // Find the video title and thumbnail elements in your controls
  var videoTitleElement = document.querySelector(".video-title");
  var videoThumbnailElement = document.querySelector(".video-thumbnail");
  console.log(videoTitleElement);
  // Split the title into words
  var words = title.split(" ");

  // If the title has more than 6 words, truncate it
  if (words.length > 6) {
    title = words.slice(0, 6).join(" ") + "...";
  }

  // Set the new video title and thumbnail
  videoTitleElement.textContent = title;
  videoThumbnailElement.src =
    "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg";
}

function updateMiniPlayer(videoId, videoTitle) {
  var miniThumbnail = document.querySelector(".video-thumbnail");
  var miniTitle = document.querySelector(".video-title");
  console.log(miniTitle);
  // Split the video title into words and limit to 5 words
  var words = videoTitle.split(" ").slice(0, 5);
  var truncatedTitle = words.join(" ");

  miniThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  miniTitle.textContent = truncatedTitle;
}

// Get the input field
var input = document.getElementById("searchInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("myBtn").click();
    input.blur();
  }
});

var input = document.getElementById("playlistLinkInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("myplist").click();
    input.blur();
  }
});

// not required delete this
var input = document.getElementById("2playlistLinkInput");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("mybm").click();
    input.blur();
  }
});

function shareCurrentVideo() {
  var currentVideoId = getCurrentVideoId();
  if (currentVideoId) {
    var videoUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;
    copyToClipboard(videoUrl);
    showAlert("Video link has been copied to the clipboard!");
  } else {
    showAlert("Unable to get the current video ID.");
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard:", text);
    })
    .catch((err) => {
      console.error("Unable to copy to clipboard:", err);
    });
}

function getCurrentVideoId() {
  if (player && player.getVideoData) {
    var videoData = player.getVideoData();
    if (videoData && videoData.video_id) {
      return videoData.video_id;
    }
  }
  return null;
}
// Get the input field
var searchInput = document.getElementById("searchInput");

// Add an event listener for when the input field is focused
searchInput.addEventListener("focus", function () {
  // Hide the controls when the keyboard appears
  var controlsDiv = document.getElementById("controls");
  controlsDiv.style.display = "none";
});

// Add an event listener for when the input field loses focus
searchInput.addEventListener("blur", function () {
  // Show the controls when the keyboard disappears
  var controlsDiv = document.getElementById("controls");
  controlsDiv.style.display = "block";
});

function toggleButtonText() {
  var toggleButton = document.getElementById("toggleTopic");
  if (addTopic) {
    toggleButton.innerHTML =
      '<span class="material-symbols-outlined">videocam</span>';
  } else {
    toggleButton.innerHTML =
      '<span class="material-symbols-outlined">music_video</span>';
  }
}
toggleButtonText();

function endCurrentSong() {
  if (player) {
    // Pause the video (optional, if you want to pause before ending)
    player.pauseVideo();

    // Jump to the end of the video to simulate song completion
    player.seekTo(player.getDuration(), true);
  }
}

function showAlert(message) {
  var modal = document.getElementById("radixAlert");
  var alertMessage = document.querySelector("#radixAlert .text-sm");
  var closeButton = document.querySelector("#radixAlert button");

  alertMessage.innerHTML = message;
  modal.style.display = "block";

  closeButton.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function hideModal() {
  var modal = document.getElementById("radixAlert");
  modal.style.display = "none";
}
