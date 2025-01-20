// Global variable to store playlists
let playlists = {};

// Function to save playlists to local storage
function savePlaylists() {
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

// Function to load playlists from local storage
function loadPlaylists() {
  const storedPlaylists = localStorage.getItem("playlists");
  if (storedPlaylists) {
    playlists = JSON.parse(storedPlaylists);

    // Remove invalid entries from all playlists
    for (const playlistName in playlists) {
      playlists[playlistName] = playlists[playlistName].filter(
        (song) => song.id && song.title
      );
    }

    savePlaylists(); // Save cleaned data back to localStorage
    displayAddedSongs();
  }
}

// Function to show the playlists modal
function showPlaylistsModal() {
  document.getElementById("playlistsModal").style.display = "block";
  displayPlaylists();

  // Add Hammer.js to detect swipe gestures
  var modalContent = document.querySelector(".modal-content");
  var hammer = new Hammer(modalContent);

  // Listen for swipe down gesture
  hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
  hammer.on("swipedown", function () {
    closePlaylistsModal();
  });
}

// Function to close the playlists modal
function closePlaylistsModal() {
  document.getElementById("playlistsModal").style.display = "none";
}

// Function to create a new playlist
function createPlaylist() {
  const playlistName = document.getElementById("newPlaylistName").value;
  if (playlistName) {
    if (!playlists[playlistName]) {
      playlists[playlistName] = [];
      displayPlaylists();
      document.getElementById("newPlaylistName").value = "";
      savePlaylists();
    } else {
      alert("Playlist already exists!");
    }
  }
}

// Function to display playlists in the modal
// Function to display playlists in the modal
function displayPlaylists() {
  const playlistsContainer = document.getElementById("playlistsContainer");
  playlistsContainer.innerHTML = "";

  playlistsContainer.className = "playlists-grid"; // Add a grid class for 2-column layout

  for (const playlistName in playlists) {
    const playlistElement = document.createElement("div");
    playlistElement.className = "urplist";

    // Create the smaller thumbnail container
    const playlistThumbnail = document.createElement("div");
    playlistThumbnail.className = "playlist-thumbnail small";

    // Create a grid for the thumbnails (display up to 4 song thumbnails)
    const thumbnailGrid = document.createElement("div");
    thumbnailGrid.className = "thumbnail-grid small"; // Smaller grid for thumbnails

    playlists[playlistName].slice(0, 4).forEach((song) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
      thumbnail.alt = song.title;
      thumbnailGrid.appendChild(thumbnail);
    });

    playlistThumbnail.appendChild(thumbnailGrid);

    // Create the playlist name element
    const playlistNameElement = document.createElement("span");
    playlistNameElement.textContent = playlistName;

    // Create the edit button
    const editButton = document.createElement("button");
    editButton.innerHTML =
      '<span class="material-symbols-outlined">edit</span>';
    editButton.onclick = function () {
      editPlaylistName(playlistName);
    };

    // Append elements in the desired order: thumbnail, name, edit button
    playlistElement.appendChild(playlistThumbnail);
    playlistElement.appendChild(playlistNameElement);
    playlistElement.appendChild(editButton);

    playlistElement.onclick = function () {
      addToYourPlaylist(playlistName);
    };

    playlistsContainer.appendChild(playlistElement);
  }
}

// Function to add the current song to the selected playlist
function addToYourPlaylist(playlistName) {
  const currentVideoId = player.getVideoData().video_id;
  const currentVideoTitle = player.getVideoData().title;
  if (!playlists[playlistName].find((video) => video.id === currentVideoId)) {
    playlists[playlistName].push({
      id: currentVideoId,
      title: currentVideoTitle,
    });
    savePlaylists();
  }
  closePlaylistsModal();
  displayAddedSongs();
}

// Function to display added songs as urplist thumbnails
function displayAddedSongs() {
  const playlistDiv = document.getElementById("urplist");
  playlistDiv.innerHTML = "";

  for (const playlistName in playlists) {
    if (playlists[playlistName].length > 0) {
      const playlistThumbnail = document.createElement("div");
      playlistThumbnail.className = "playlist-thumbnail";

      // Create a grid container for the thumbnails
      const thumbnailGrid = document.createElement("div");
      thumbnailGrid.className = "thumbnail-grid";

      // Add click listener to reveal songs list
      thumbnailGrid.addEventListener("click", function () {
        revealSongsList(playlistName);
      });
      // Add the first 4 song thumbnails
      playlists[playlistName].slice(0, 4).forEach((song) => {
        const thumbnail = document.createElement("img");
        thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
        thumbnail.alt = song.title;
        thumbnailGrid.appendChild(thumbnail);
      });

      playlistThumbnail.appendChild(thumbnailGrid);

      // Add playlist name and shuffle button
      const playlistInfo = document.createElement("div");
      playlistInfo.className = "uplistb";
      playlistInfo.innerHTML = `
        <h3 class="uplfull">${playlistName}</h3>
        <button onclick="playShuffledPlaylist('${playlistName}')">
          <span class="material-symbols-outlined">shuffle</span>
        </button>
      `;
      playlistThumbnail.appendChild(playlistInfo);

      playlistDiv.appendChild(playlistThumbnail);
    }
  }
}

// Function to reveal songs list in a playlist with thumbnails and dropdown controls
function revealSongsList(playlistName) {
  const playlistSongs = playlists[playlistName];
  const playlistDiv = document.getElementById("urplist");
  playlistDiv.innerHTML = "";

  const containerDiv = document.createElement("div");
  containerDiv.className = "playlist-container";

  // Playlist Thumbnail Section
  const playlistThumbnail = document.createElement("div");
  playlistThumbnail.className = "playlist-thumbnail centered";

  const thumbnailGrid = document.createElement("div");
  thumbnailGrid.className = "thumbnail-grid";

  playlists[playlistName].slice(0, 4).forEach((song) => {
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
    thumbnail.alt = song.title;
    thumbnailGrid.appendChild(thumbnail);
  });

  playlistThumbnail.appendChild(thumbnailGrid);

  const playlistInfo = document.createElement("div");
  playlistInfo.className = "uplistb";
  playlistInfo.innerHTML = `
      <h3 class="uplfull">${playlistName}</h3>
      <button onclick="editPlaylistName('${playlistName}')">
          <span class="material-symbols-outlined">edit</span>
      </button>
      <button onclick="playShuffledPlaylist('${playlistName}')">
          <span class="material-symbols-outlined">shuffle</span>
      </button>
  `;
  playlistThumbnail.appendChild(playlistInfo);

  containerDiv.appendChild(playlistThumbnail);

  // Songs List Section
  const songsListDiv = document.createElement("div");
  songsListDiv.className = "songs-list";
  // Hide the specified elements
  const elementsToHide = [
    document.querySelector(".mixedforyou"),
    document.querySelector(".home-songs"),
    document.querySelector(".backup-restore"),
    document.querySelector(".h1"),
    document.querySelector(".shuffle"),
    document.querySelector(".bookmarklink"),
    document.getElementById("playlist"),
  ];

  elementsToHide.forEach((element) => {
    if (element) {
      element.classList.add("hidden");
    }
  });

  playlistSongs.forEach((song, index) => {
    const songElement = document.createElement("div");
    songElement.className = "song";

    // Song Thumbnail and Title
    const songThumbnail = document.createElement("img");
    songThumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
    songThumbnail.alt = song.title;

    const songTitle = document.createElement("div");
    songTitle.textContent = song.title;

    // Dropdown Menu for Each Song
    const listItem = document.createElement("p");
    const moreButton = document.createElement("button");
    const moreDropdown = document.createElement("div");
    moreButton.innerHTML =
      '<span class="material-symbols-outlined">more_vert</span>';
    moreButton.className = "more-button";
    moreButton.setAttribute("data-index", index); // Assign a unique index
    moreButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent parent click event
      toggleDropdownfp(index, "urplist"); // Scoped to this container
    });

    moreDropdown.className = "more-dropdown";

    // Remove Option
    const removeOption = document.createElement("a");
    removeOption.innerHTML =
      '<span class="material-symbols-outlined">cancel</span>';
    removeOption.href = "#";
    removeOption.addEventListener(
      "click",
      (function (index) {
        return function (event) {
          event.stopPropagation(); // Prevent parent click event
          removeSongFromPlaylist(index, playlistName); // Remove the song from the playlist
        };
      })(index)
    ); // Pass the index using a closure

    // Download Option
    const downloadOption = document.createElement("a");
    downloadOption.innerHTML =
      '<span class="material-symbols-outlined">download</span>';
    downloadOption.href = `https://v3.mp3youtube.cc/download/${song.id}`;
    downloadOption.setAttribute("target", "_blank");
    downloadOption.setAttribute("rel", "noopener noreferrer");
    downloadOption.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent parent click event
    });

    // Append Dropdown Options
    moreDropdown.appendChild(removeOption);
    moreDropdown.appendChild(downloadOption);

    // Append Controls to Song Element
    listItem.appendChild(moreDropdown);
    listItem.appendChild(moreButton);

    songElement.appendChild(songThumbnail);
    songElement.appendChild(songTitle);
    songElement.appendChild(listItem);

    // Play the video on click
    songElement.addEventListener("click", () => {
      isShuffleActive = false; // Deactivate shuffle playback
      setCurrentPlaylistContext(song.id, "revealSongsList", playlistName);
      player.loadVideoById(song.id);
      player.playVideo();
    });

    songsListDiv.appendChild(songElement);
  });

  containerDiv.appendChild(songsListDiv);

  // Back Button
  const backButton = document.createElement("button");
  backButton.innerHTML = `
      <div class="cut">
          <button>
              <span class="material-symbols-outlined">keyboard_backspace</span>
          </button>
          <span>Back</span>
      </div>
  `;
  backButton.onclick = function () {
    history.back();
  };

  history.pushState({ view: "playlist" }, "", "#playlist");

  playlistDiv.appendChild(backButton);
  playlistDiv.appendChild(containerDiv);
}

//toggle dropdown for like songs as well as playlist(urplist.js)
function toggleDropdownfp(index, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dropdowns = container.querySelectorAll(".more-dropdown");
  dropdowns.forEach((dropdown, i) => {
    if (i === index) {
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    } else {
      dropdown.style.display = "none";
    }
  });
}



let isShuffleActive = false; // Tracks whether shuffle playback is active

function playShuffledPlaylist(playlistName = "flatPlaylist") {
  isShuffleActive = true; // Activate shuffle playback

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

  // Determine the playlist to shuffle
  let playlistToShuffle = [];
  if (playlistName === "flatPlaylist") {
    playlistToShuffle = flatPlaylist;
  } else if (playlists[playlistName]) {
    playlistToShuffle = playlists[playlistName];
  } else if (saved[playlistName]) {
    playlistToShuffle = saved[playlistName];
    setCurrentPlaylistContext(null, "savedPlaylists", playlistName); // Correctly set context for savedPlaylists
  } else {
    console.error("Playlist not found.");
    return;
  }

  // Shuffle the playlist
  const shuffledPlaylist = [...playlistToShuffle].sort(
    () => Math.random() - 0.5
  );
  console.log(`Shuffled playlist (${playlistName}):`, shuffledPlaylist);

  let shuffleIndex = 0;

  function playNextInShuffle() {
    if (!isShuffleActive) {
      console.log("Shuffle playback deactivated.");
      return; // Exit if shuffle is no longer active
    }

    if (shuffleIndex >= shuffledPlaylist.length) {
      console.log("Finished playing shuffled playlist. Restarting...");
      shuffleIndex = 0;
    }

    const video = shuffledPlaylist[shuffleIndex];
    const videoId = video.id || video.videoId;
    const videoTitle = video.title || video.videoTitle;

    console.log(`Playing shuffled video: ${videoTitle}`);
    setCurrentPlaylistContext(videoId, "playShuffledPlaylist", playlistName);

    player.loadVideoById(videoId);
    player.playVideo();
    shuffleIndex++;
  }

  player.removeEventListener("onStateChange", onShuffledStateChange);

  function onShuffledStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      playNextInShuffle();
    }
  }

  player.addEventListener("onStateChange", onShuffledStateChange);
  playNextInShuffle();
}

function removeSongFromPlaylist(playlistName, songId) {
  if (!playlists[playlistName]) {
    console.error(`Playlist "${playlistName}" does not exist.`);
    return;
  }

  // Filter out songs with matching ID or invalid entries
  playlists[playlistName] = playlists[playlistName].filter((song) => {
    if (!song.id || !song.title) {
      // Log invalid song entries for debugging
      console.warn(
        `Invalid song entry found in playlist "${playlistName}":`,
        song
      );
      return false; // Remove invalid entries
    }
    return song.id !== songId;
  });

  savePlaylists(); // Update localStorage
  revealSongsList(playlistName); // Refresh the song list view
}

function editPlaylistName(oldName) {
  const newName = prompt("Enter the new name for the playlist:", oldName);
  if (newName && newName !== oldName) {
    if (!playlists[newName]) {
      playlists[newName] = playlists[oldName]; // Copy the songs to the new playlist
      delete playlists[oldName]; // Remove the old playlist
      savePlaylists();
      displayPlaylists();
      alert(`Playlist renamed to "${newName}"`);
    } else {
      alert("A playlist with that name already exists!");
    }
  }
}

// Load playlists when the page loads
window.onload = loadPlaylists;
