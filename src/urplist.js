// Global variable to store playlists
let playlists = {};

// Function to save playlists to local storage
function savePlaylists() {
  localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Function to load playlists from local storage
function loadPlaylists() {
  const storedPlaylists = localStorage.getItem('playlists');
  if (storedPlaylists) {
    playlists = JSON.parse(storedPlaylists);

    // Remove invalid entries from all playlists
    for (const playlistName in playlists) {
      playlists[playlistName] = playlists[playlistName].filter(
        song => song.id && song.title
      );
    }

    savePlaylists(); // Save cleaned data back to localStorage
    displayAddedSongs();
  }
}



  // Function to show the playlists modal
  function showPlaylistsModal() {
    document.getElementById('playlistsModal').style.display = 'block';
    displayPlaylists();

    // Add Hammer.js to detect swipe gestures
    var modalContent = document.querySelector('.modal-content');
    var hammer = new Hammer(modalContent);

    // Listen for swipe down gesture
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    hammer.on('swipedown', function () {
      closePlaylistsModal();
    });
  }

  // Function to close the playlists modal
  function closePlaylistsModal() {
    document.getElementById('playlistsModal').style.display = 'none';
  }


// Function to create a new playlist
function createPlaylist() {
  const playlistName = document.getElementById('newPlaylistName').value;
  if (playlistName) {
    if (!playlists[playlistName]) {
      playlists[playlistName] = [];
      displayPlaylists();
      document.getElementById('newPlaylistName').value = '';
      savePlaylists();
    } else {
      alert('Playlist already exists!');
    }
  }
}

// Function to display playlists in the modal
// Function to display playlists in the modal
function displayPlaylists() {
  const playlistsContainer = document.getElementById('playlistsContainer');
  playlistsContainer.innerHTML = '';
  
  playlistsContainer.className = 'playlists-grid'; // Add a grid class for 2-column layout
  
  for (const playlistName in playlists) {
    const playlistElement = document.createElement('div');
    playlistElement.className = 'urplist';

    // Create the smaller thumbnail container
    const playlistThumbnail = document.createElement('div');
    playlistThumbnail.className = 'playlist-thumbnail small';

    // Create a grid for the thumbnails (display up to 4 song thumbnails)
    const thumbnailGrid = document.createElement('div');
    thumbnailGrid.className = 'thumbnail-grid small'; // Smaller grid for thumbnails
    
    playlists[playlistName].slice(0, 4).forEach(song => {
      const thumbnail = document.createElement('img');
      thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
      thumbnail.alt = song.title;
      thumbnailGrid.appendChild(thumbnail);
    });
    
    playlistThumbnail.appendChild(thumbnailGrid);

    // Create the playlist name element
    const playlistNameElement = document.createElement('span');
    playlistNameElement.textContent = playlistName;

    // Create the edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    editButton.onclick = function() {
      editPlaylistName(playlistName);
    };

    // Append elements in the desired order: thumbnail, name, edit button
    playlistElement.appendChild(playlistThumbnail);
    playlistElement.appendChild(playlistNameElement);
    playlistElement.appendChild(editButton);
    
    playlistElement.onclick = function() {
      addToYourPlaylist(playlistName);
    };

    playlistsContainer.appendChild(playlistElement);
  }
}



// Function to add the current song to the selected playlist
function addToYourPlaylist(playlistName) {
  const currentVideoId = player.getVideoData().video_id;
  const currentVideoTitle = player.getVideoData().title;
  if (!playlists[playlistName].find(video => video.id === currentVideoId)) {
    playlists[playlistName].push({ id: currentVideoId, title: currentVideoTitle });
    savePlaylists();
  }
  closePlaylistsModal();
  displayAddedSongs();
}

// Function to display added songs as urplist thumbnails
function displayAddedSongs() {
  const playlistDiv = document.getElementById('urplist');
  playlistDiv.innerHTML = '';

  for (const playlistName in playlists) {
    if (playlists[playlistName].length > 0) {
      const playlistThumbnail = document.createElement('div');
      playlistThumbnail.className = 'playlist-thumbnail';
      
      
      // Create a grid container for the thumbnails
      const thumbnailGrid = document.createElement('div');
      thumbnailGrid.className = 'thumbnail-grid';
      
      // Add click listener to reveal songs list
      thumbnailGrid.addEventListener('click', function () {
        revealSongsList(playlistName);
      });
      // Add the first 4 song thumbnails
      playlists[playlistName].slice(0, 4).forEach(song => {
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
        thumbnail.alt = song.title;
        thumbnailGrid.appendChild(thumbnail);
      });

      playlistThumbnail.appendChild(thumbnailGrid);

      // Add playlist name and shuffle button
      const playlistInfo = document.createElement('div');
      playlistInfo.className = 'uplistb';
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

// Function to reveal songs list in a playlist with thumbnails
function revealSongsList(playlistName) {
  const playlistSongs = playlists[playlistName];
  const playlistDiv = document.getElementById('urplist');
  playlistDiv.innerHTML = '';

  const containerDiv = document.createElement('div');
  containerDiv.className = 'playlist-container';

  const playlistThumbnail = document.createElement('div');
  playlistThumbnail.className = 'playlist-thumbnail centered';

  const thumbnailGrid = document.createElement('div');
  thumbnailGrid.className = 'thumbnail-grid';

  playlists[playlistName].slice(0, 4).forEach(song => {
      const thumbnail = document.createElement('img');
      thumbnail.src = `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`;
      thumbnail.alt = song.title;
      thumbnailGrid.appendChild(thumbnail);
  });

  playlistThumbnail.appendChild(thumbnailGrid);

  const playlistInfo = document.createElement('div');
  playlistInfo.className = 'uplistb';
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

  const songsListDiv = document.createElement('div');
  songsListDiv.className = 'songs-list';

  // Hide the specified elements
  const elementsToHide = [
    document.querySelector('.mixedforyou'),   // Assuming 'mixedforyou' is the ID of the element
    document.querySelector('.home-songs'),
    document.querySelector('.backup-restore'),
    document.querySelector('.h1'),
    document.querySelector('.shuffle'),
    document.querySelector('.bookmarklink'),
    document.getElementById('playlist')
  ];

  elementsToHide.forEach(element => {
    if (element) {
      element.classList.add('hidden');
    }
  });

  playlistSongs.forEach(song => {
      const songElement = document.createElement('div');
      songElement.className = 'song';
      songElement.innerHTML = `
          <img src="https://img.youtube.com/vi/${song.id}/mqdefault.jpg" alt="${song.title}">
          <p>${song.title}</p>
          <button onclick="removeSongFromPlaylist('${playlistName}', '${song.id}')">
              <span class="material-symbols-outlined">more_vert</span>
          </button>
      `;
      songElement.addEventListener('click', function () {
          playVideo(song.id);
          setCurrentPlaylistContext(song.id, "revealSongsList", playlistName);
      });
      songsListDiv.appendChild(songElement);
  });

  containerDiv.appendChild(songsListDiv);

  const backButton = document.createElement('button');
  backButton.innerHTML = `<div class="cut"><button><span class="material-symbols-outlined">keyboard_backspace</span></button><span>Back</span>`;
  backButton.onclick = function () {
      history.back();
  };

  history.pushState({ view: 'playlist' }, '', '#playlist');

  playlistDiv.appendChild(backButton);
  playlistDiv.appendChild(containerDiv);
}


// Handle the Back Gesture using popstate
window.addEventListener('popstate', function(event) {
  // Check the state to decide what to show
  if (event.state && event.state.view === 'playlist') {
    // User navigated back to the playlist view
    // Keep current state logic here if needed
  } else {
    // Show the default view and reveal all elements
    const elementsToReveal = [
      document.querySelector('.mixedforyou'),   // Assuming 'mixedforyou' is the ID of the element
      document.querySelector('.home-songs'),
      document.querySelector('.backup-restore'),
      document.querySelector('.h1'),
      document.querySelector('.shuffle'),
      document.querySelector('.bookmarklink'),
      document.getElementById('playlist')
    ];

    elementsToReveal.forEach(element => {
      if (element) {
        element.classList.remove('hidden');
      }
    });

    displayAddedSongs();
  }
});


function playShuffledPlaylist(playlistName = "flatPlaylist") {
  // Retrieve the playlists from localStorage
  const storedPlaylists = localStorage.getItem("playlists");
  const storedPlaylist = localStorage.getItem("playlist");

  let playlists = {};
  let flatPlaylist = [];

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

  // Determine the playlist to shuffle
  let playlistToShuffle = [];
  if (playlistName === "flatPlaylist") {
      playlistToShuffle = flatPlaylist;
  } else if (playlists[playlistName]) {
      playlistToShuffle = playlists[playlistName];
  } else {
      console.error("Playlist not found.");
      return;
  }

  // Shuffle the playlist
  const shuffledPlaylist = [...playlistToShuffle].sort(() => Math.random() - 0.5);
  console.log(`Shuffled playlist (${playlistName}):`, shuffledPlaylist);

  // Function to play videos sequentially from the shuffled playlist
  let shuffleIndex = 0;
  function playNextInShuffle() {
      if (shuffleIndex < shuffledPlaylist.length) {
          const video = shuffledPlaylist[shuffleIndex];
          const videoId = video.id || video.videoId;
          const videoTitle = video.title || video.videoTitle;

          player.loadVideoById(videoId);
          player.playVideo();

          console.log(`Playing shuffled video: ${videoTitle}`);
          shuffleIndex++;

          // Listen for video end to play the next in shuffle
          player.addEventListener("onStateChange", function onStateChange(event) {
              if (event.data === YT.PlayerState.ENDED) {
                  player.removeEventListener("onStateChange", onStateChange);
                  playNextInShuffle(); // Play the next shuffled video
              }
          });
      } else {
          console.log("Finished playing shuffled playlist.");
      }
  }

  // Start playing the shuffled playlist
  playNextInShuffle();
}




function removeSongFromPlaylist(playlistName, songId) {
  if (!playlists[playlistName]) {
    console.error(`Playlist "${playlistName}" does not exist.`);
    return;
  }

  // Filter out songs with matching ID or invalid entries
  playlists[playlistName] = playlists[playlistName].filter(song => {
    if (!song.id || !song.title) {
      // Log invalid song entries for debugging
      console.warn(`Invalid song entry found in playlist "${playlistName}":`, song);
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

